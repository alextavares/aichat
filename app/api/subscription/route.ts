import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const activeSubscription = user.subscriptions[0]

    return NextResponse.json({
      planType: user.planType,
      subscription: activeSubscription || null
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
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

    // Get active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE'
      }
    })

    if (!activeSubscription) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    // In production, cancel Stripe subscription
    // await stripe.subscriptions.cancel(activeSubscription.stripeSubscriptionId)

    // For development, update local database
    await prisma.subscription.update({
      where: { id: activeSubscription.id },
      data: { 
        status: 'CANCELLED',
        expiresAt: new Date() // Immediate cancellation for demo
      }
    })

    // Downgrade user to FREE
    await prisma.user.update({
      where: { id: user.id },
      data: { planType: 'FREE' }
    })

    return NextResponse.json({ 
      message: 'Subscription cancelled successfully',
      planType: 'FREE'
    })
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}