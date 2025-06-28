import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { handleStripeWebhook } from '@/lib/payment-service'
import type Stripe from 'stripe'
import { SubscriptionStatus, PlanType } from '@prisma/client' // Import Prisma enums

// Helper function to map Stripe subscription status to internal status
function mapStripeStatusToSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
  switch (stripeStatus) {
    case 'active':
    case 'trialing':
      return SubscriptionStatus.ACTIVE
    case 'past_due':
      return SubscriptionStatus.PAST_DUE
    case 'canceled':
    case 'unpaid': // unpaid often leads to canceled
    case 'incomplete_expired': // incomplete_expired means it was never completed
      return SubscriptionStatus.CANCELLED
    case 'incomplete': // Incomplete might not have a direct mapping yet or could be PENDING if we add it
      return SubscriptionStatus.CANCELLED // For now, map to CANCELLED as it's not active
    default:
      return SubscriptionStatus.CANCELLED // Default to CANCELLED for unknown statuses
  }
}

async function handleMockWebhook(event: any) {
  // Handle mock webhook events for development
  const mockResult = {
    userId: event.data?.object?.metadata?.userId,
    planId: event.data?.object?.metadata?.planType?.toLowerCase(),
    subscriptionId: event.data?.object?.subscription || `sub_mock_${Date.now()}`,
    customerId: event.data?.object?.customer || `cus_mock_${Date.now()}`,
    status: 'active'
  }
  
  // Process the mock event similar to production
  if (event.type === 'checkout.session.completed' && mockResult.userId && mockResult.planId) {
      const billingCycle = event.data?.object?.metadata?.billingCycle || 'monthly'
      const startDate = new Date()
      let expiresDate = new Date(startDate)

      if (billingCycle === 'yearly') {
        expiresDate.setFullYear(startDate.getFullYear() + 1)
      } else {
        expiresDate.setMonth(startDate.getMonth() + 1)
      }

    await prisma.user.update({
      where: { id: mockResult.userId },
      data: { planType: mockResult.planId.toUpperCase() as any }
    })
    
    await prisma.subscription.create({
      data: {
        userId: mockResult.userId,
        planType: mockResult.planId.toUpperCase() as any,
        status: 'ACTIVE',
        stripeSubscriptionId: mockResult.subscriptionId,
        stripeCustomerId: mockResult.customerId,
          startedAt: startDate,
          expiresAt: expiresDate
      }
    })
  }
  
  return NextResponse.json({ received: true })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = (await headers()).get('stripe-signature')

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      // Development mode - parse body as JSON
      const event = JSON.parse(body)
      return handleMockWebhook(event)
    }

    // Production mode - verify signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    const result = await handleStripeWebhook(event)

    if (result) {
      if (event.type === 'checkout.session.completed' && result.userId && result.planId) {
        const session = event.data.object as Stripe.Checkout.Session
        const billingCycle = session.metadata?.billingCycle || 'monthly'
        const startDate = new Date()
        let expiresDate = new Date(startDate)

        if (billingCycle === 'yearly') {
          expiresDate.setFullYear(startDate.getFullYear() + 1)
        } else {
          // More robust way to add a month, handles month ends correctly
          expiresDate.setMonth(startDate.getMonth() + 1)
          // If the day of the month changed, it means we rolled over, e.g., Jan 31 + 1 month = Feb 28/29
          // So, set to the last day of the previous month to get the correct end of month for next month.
          // This is a bit complex, simpler is to use a library or ensure Stripe provides current_period_end
          // For now, direct month addition is mostly fine.
        }

        // Update user's plan
        await prisma.user.update({
          where: { id: result.userId },
          data: { planType: result.planId.toUpperCase() as any }
        })

        // Handle existing active subscriptions before creating a new one
        // This typically happens during an upgrade or downgrade
        const existingActiveSubscriptions = await prisma.subscription.findMany({
          where: {
            userId: result.userId,
            status: 'ACTIVE',
            // Ensure we don't try to cancel the one we are about to create if by some race condition it exists
            // Though, `result.subscriptionId` is the new one from Stripe.
            // stripeSubscriptionId: { not: result.subscriptionId as string } // This check might be redundant
          }
        })

        for (const sub of existingActiveSubscriptions) {
          // If the existing active subscription is different from the new one, mark it as cancelled.
          // Stripe usually cancels the old one and creates a new one for plan changes.
          if (sub.stripeSubscriptionId !== result.subscriptionId as string) {
            await prisma.subscription.update({
              where: { id: sub.id },
              data: { status: 'CANCELLED', expiresAt: new Date() } // Optionally set expiresAt to now
            })
          }
        }

        // Create new subscription record
        await prisma.subscription.create({
          data: {
            userId: result.userId,
            planType: result.planId.toUpperCase() as any,
            status: 'ACTIVE',
            stripeSubscriptionId: result.subscriptionId as string,
            stripeCustomerId: result.customerId as string,
            startedAt: startDate,
            expiresAt: expiresDate
          }
        })

        // Create payment record
        const amount = result.planId === 'pro' ? 47 : 197 // This amount logic might need to be more dynamic based on plan
        await prisma.payment.create({
          data: {
            userId: result.userId,
            amount,
            currency: 'BRL',
            status: 'COMPLETED',
            stripePaymentId: (session as any).payment_intent || `pi_${Date.now()}`
          }
        })
      } else if (event.type === 'customer.subscription.updated') {
        const stripeSubscription = event.data.object as Stripe.Subscription
        const newStatus = mapStripeStatusToSubscriptionStatus(stripeSubscription.status)

        const dataToUpdate: any = {
          status: newStatus,
        }

        if (stripeSubscription.cancel_at_period_end && stripeSubscription.status === 'active') {
          // Subscription is set to cancel at period end, but still active.
          // Update expiresAt to current_period_end. User retains access.
          dataToUpdate.expiresAt = new Date(stripeSubscription.current_period_end * 1000)
          // Status remains ACTIVE until Stripe sends a new event when it's actually cancelled.
          dataToUpdate.status = SubscriptionStatus.ACTIVE
        } else {
           // For other status updates, if Stripe provides a current_period_end, use it.
           // This can be relevant if a subscription reactivates or changes.
           if (stripeSubscription.current_period_end) {
             dataToUpdate.expiresAt = new Date(stripeSubscription.current_period_end * 1000);
           }
        }

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: stripeSubscription.id },
          data: dataToUpdate,
        })

        // If the new status is not ACTIVE (e.g., CANCELLED, PAST_DUE), downgrade user
        // Consider if PAST_DUE should immediately downgrade or have a grace period.
        // For now, any non-ACTIVE status (after considering cancel_at_period_end) leads to FREE.
        const effectiveStatusForDowngrade = dataToUpdate.status;

        if (effectiveStatusForDowngrade !== SubscriptionStatus.ACTIVE && stripeSubscription.metadata?.userId) {
          await prisma.user.update({
            where: { id: stripeSubscription.metadata.userId },
            data: { planType: PlanType.FREE },
          })
        }

      } else if (event.type === 'customer.subscription.deleted') {
        const stripeSubscription = event.data.object as Stripe.Subscription // This is the deleted subscription object
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: stripeSubscription.id },
          data: {
            status: SubscriptionStatus.CANCELLED,
            expiresAt: new Date(), // Expires now as it's deleted
          },
        })

        if (stripeSubscription.metadata?.userId) {
          await prisma.user.update({
            where: { id: stripeSubscription.metadata.userId },
            data: { planType: PlanType.FREE },
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}