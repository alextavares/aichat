import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { stripe, handleStripeWebhook } from '@/lib/payment-service'
import type Stripe from 'stripe'

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
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
        // Update user's plan
        await prisma.user.update({
          where: { id: result.userId },
          data: { planType: result.planId.toUpperCase() as any }
        })

        // Create subscription record
        await prisma.subscription.create({
          data: {
            userId: result.userId,
            planType: result.planId.toUpperCase() as any,
            status: 'ACTIVE',
            stripeSubscriptionId: result.subscriptionId as string,
            stripeCustomerId: result.customerId as string,
            startedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        })

        // Create payment record
        const amount = result.planId === 'pro' ? 47 : 197
        await prisma.payment.create({
          data: {
            userId: result.userId,
            amount,
            currency: 'BRL',
            status: 'COMPLETED',
            stripePaymentId: (event.data.object as any).payment_intent || `pi_${Date.now()}`
          }
        })
      } else if ((event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') && result.subscriptionId) {
        // Update subscription status
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: typeof result.subscriptionId === 'string' ? result.subscriptionId : result.subscriptionId?.id },
          data: { 
            status: result.status === 'active' ? 'ACTIVE' : 'CANCELLED'
          }
        })

        // If cancelled, downgrade user
        if (result.status !== 'active' && result.userId) {
          await prisma.user.update({
            where: { id: result.userId },
            data: { planType: 'FREE' }
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