import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createCheckoutSession } from '@/lib/payment-service'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { planId, paymentMethod = 'card', installments, billingCycle = 'monthly' } = body

    if (!planId || !['lite', 'pro', 'enterprise'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Check if we have real payment credentials
    const isProduction = process.env.STRIPE_SECRET_KEY && process.env.MERCADOPAGO_ACCESS_TOKEN

    if (!isProduction) {
      // Use mock checkout for development
      const mockSession = {
        id: `cs_test_${Date.now()}`,
        url: `/api/stripe/mock-checkout?session_id=cs_test_${Date.now()}&plan=${planId}&billing=${billingCycle}`
      }
      return NextResponse.json({ 
        url: mockSession.url,
        sessionId: mockSession.id 
      })
    }

    // Use real payment service
    const checkoutResult = await createCheckoutSession({
      planId,
      userId: user.id,
      email: user.email,
      paymentMethod,
      installments,
      billingCycle,
      successUrl: `${process.env.NEXTAUTH_URL}/dashboard?payment=success`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/pricing?payment=cancelled`
    })

    return NextResponse.json(checkoutResult)
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}