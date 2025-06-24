import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }

    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')
    const planId = searchParams.get('plan')
    
    if (!sessionId || !planId) {
      return NextResponse.redirect(new URL('/pricing?error=invalid_session', request.url))
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.redirect(new URL('/pricing?error=user_not_found', request.url))
    }

    // Update user's plan
    await prisma.user.update({
      where: { id: user.id },
      data: {
        planType: planId === 'pro' ? 'PRO' : 'ENTERPRISE'
      }
    })

    // Create a mock subscription record
    await prisma.subscription.create({
      data: {
        userId: user.id,
        planType: planId === 'pro' ? 'PRO' : 'ENTERPRISE',
        status: 'ACTIVE',
        stripeSubscriptionId: `sub_mock_${Date.now()}`,
        stripeCustomerId: `cus_mock_${Date.now()}`,
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      }
    })

    // Redirect to dashboard with success message
    return NextResponse.redirect(new URL('/dashboard/subscription?success=true', request.url))
  } catch (error) {
    console.error('Mock checkout success error:', error)
    return NextResponse.redirect(new URL('/pricing?error=processing', request.url))
  }
}