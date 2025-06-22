import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')
    const plan = searchParams.get('plan')

    if (!sessionId || !plan) {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }

    // Simulate webhook event for development
    const webhookResponse = await fetch(new URL('/api/stripe/webhook', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            metadata: {
              userId: session.user.id,
              planType: plan.toUpperCase(),
            },
            subscription: `sub_mock_${Date.now()}`,
            payment_intent: `pi_mock_${Date.now()}`,
          },
        },
      }),
    })

    if (!webhookResponse.ok) {
      console.error('Webhook simulation failed')
    }

    // Redirect to subscription management page
    return NextResponse.redirect(new URL('/dashboard/subscription?success=true', request.url))
  } catch (error) {
    console.error('Checkout success error:', error)
    return NextResponse.redirect(new URL('/pricing?error=true', request.url))
  }
}