import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma-fix'

// Mock Stripe for development
const createMockCheckoutSession = async (params: any) => {
  return {
    id: `cs_test_${Date.now()}`,
    url: `/api/stripe/mock-checkout?session_id=cs_test_${Date.now()}&plan=${params.metadata.planType}`
  }
}

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
    const { planId } = body

    if (!planId || !['pro', 'enterprise'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const prices = {
      pro: process.env.STRIPE_PRICE_PRO || 'price_pro_mock',
      enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise_mock'
    }

    // In production, use real Stripe
    // const session = await stripe.checkout.sessions.create({...})
    
    // For development, use mock
    const checkoutSession = await createMockCheckoutSession({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: prices[planId as keyof typeof prices],
        quantity: 1,
      }],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?payment=cancelled`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planType: planId.toUpperCase()
      }
    })

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id 
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}