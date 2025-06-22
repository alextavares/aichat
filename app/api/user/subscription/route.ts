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
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // If no active subscription but user has a paid plan, create a mock subscription
    if (!subscription && user.planType !== 'FREE') {
      const mockSubscription = {
        id: `sub_mock_${Date.now()}`,
        planType: user.planType,
        status: 'ACTIVE' as const,
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        stripeSubscriptionId: null,
      }
      return NextResponse.json({ subscription: mockSubscription })
    }

    return NextResponse.json({ 
      subscription: subscription || {
        id: 'free',
        planType: 'FREE',
        status: 'ACTIVE' as const,
        startedAt: user.createdAt || new Date().toISOString(),
        expiresAt: null,
        stripeSubscriptionId: null,
      }
    })
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}