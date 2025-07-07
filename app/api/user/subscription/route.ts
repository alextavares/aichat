import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get user with current plan
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        planType: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Get active subscription
    let subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // If no active subscription is found in the database
    if (!subscription) {
      // If the user's plan type in the User table is FREE, return a default FREE plan structure
      if (user.planType === 'FREE') {
        return NextResponse.json({
          subscription: {
            id: 'free-plan-active', // Static ID for default free plan representation
            planType: 'FREE',
            status: 'ACTIVE' as const,
            startedAt: user.createdAt || new Date().toISOString(),
            expiresAt: null,
            stripeSubscriptionId: null,
            // Add other fields expected by the frontend for a subscription object, if any
          }
        })
      } else {
        // If user.planType is a paid plan but no active Subscription record exists,
        // this indicates an inconsistency. Return null for subscription.
        // The frontend should handle this by showing an error or a specific message.
        console.error(`Inconsistency: User ${user.id} has plan ${user.planType} but no active subscription record.`);
        return NextResponse.json({ subscription: null })
      }
    }

    // If an active subscription is found
    if (subscription) {
      const now = new Date();
      // Check if the subscription has an expiration date and if it has passed
      if (subscription.expiresAt && new Date(subscription.expiresAt) < now) {
        console.log(`Subscription ${subscription.id} for user ${user.id} has expired. Updating status.`);
        // Subscription has expired, update its status and user's plan
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'EXPIRED' },
        });
        await prisma.user.update({
          where: { id: user.id },
          data: { planType: 'FREE' },
        });
        // After invalidating the current subscription, set it to null
        // so the logic below correctly identifies that there's no active paid subscription.
        subscription = null;
      }
    }

    // If no active subscription is found (either initially or after expiration handling)
    if (!subscription) {
      // If the user's plan type in the User table is FREE (possibly after being reset above),
      // or if it was already FREE and no active subscription record was found.
      // It's important to re-check user.planType if it could have been modified by the expiration logic.
      // However, for simplicity, we use the user object as fetched initially,
      // and if an expiration occurred, 'subscription' is now null.

      // Let's re-fetch the user's current planType if subscription was set to null due to expiration
      const currentUserPlanType = user.id === session.user.id ? (await prisma.user.findUnique({ where: { id: user.id } }))?.planType : user.planType;

      if (currentUserPlanType === 'FREE') {
        return NextResponse.json({
          subscription: {
            id: 'free-plan-active', // Static ID for default free plan representation
            planType: 'FREE',
            status: 'ACTIVE' as const,
            startedAt: user.createdAt || new Date().toISOString(),
            expiresAt: null,
            stripeSubscriptionId: null,
          }
        })
      } else {
        // If user.planType is still a paid plan but 'subscription' became null (e.g. error or unhandled case)
        // This indicates an inconsistency.
        console.error(`Inconsistency: User ${user.id} has plan ${currentUserPlanType} but no active subscription object available after checks.`);
        return NextResponse.json({ subscription: null })
      }
    }

    // If an active subscription is found and it has not expired, return it
    return NextResponse.json({ subscription })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}