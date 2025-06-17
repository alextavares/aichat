import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma-fix'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const signature = headers().get('stripe-signature')

    // In production, verify webhook signature
    // const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    
    // For development, use the body directly
    const event = body

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const { userId, planType } = session.metadata || {}

        if (userId && planType) {
          // Update user's plan
          await prisma.user.update({
            where: { id: userId },
            data: { planType: planType as any }
          })

          // Create subscription record
          await prisma.subscription.create({
            data: {
              userId,
              planType: planType as any,
              status: 'ACTIVE',
              stripeSubscriptionId: session.subscription || `sub_mock_${Date.now()}`,
              startedAt: new Date(),
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
          })

          // Create payment record
          await prisma.payment.create({
            data: {
              userId,
              amount: planType === 'PRO' ? 49.90 : 199.90,
              currency: 'BRL',
              status: 'COMPLETED',
              stripePaymentId: session.payment_intent || `pi_mock_${Date.now()}`
            }
          })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        // Update subscription status
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { status: 'CANCELLED' }
        })

        // Downgrade user to FREE
        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        })

        if (sub) {
          await prisma.user.update({
            where: { id: sub.userId },
            data: { planType: 'FREE' }
          })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        // Update subscription status
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: { 
            status: subscription.status === 'active' ? 'ACTIVE' : 'CANCELLED',
            expiresAt: new Date(subscription.current_period_end * 1000)
          }
        })
        break
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