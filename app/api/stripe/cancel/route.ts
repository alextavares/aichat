import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subscriptionId } = body

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'ID da assinatura é obrigatório' },
        { status: 400 }
      )
    }

    // Find the subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        stripeSubscriptionId: subscriptionId,
        status: 'ACTIVE',
      },
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Assinatura não encontrada' },
        { status: 404 }
      )
    }

    // In development mode, just update the database
    if (process.env.NODE_ENV === 'development' && !process.env.STRIPE_SECRET_KEY?.startsWith('sk_')) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      })

      await prisma.user.update({
        where: { id: session.user.id },
        data: { planType: 'FREE' },
      })

      return NextResponse.json({ success: true })
    }

    // In production, cancel via Stripe
    try {
      await stripe.subscriptions.cancel(subscriptionId)
      
      // Update local database
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'CANCELLED',
          updatedAt: new Date(),
        },
      })

      await prisma.user.update({
        where: { id: session.user.id },
        data: { planType: 'FREE' },
      })

      return NextResponse.json({ success: true })
    } catch (stripeError) {
      console.error('Stripe cancellation error:', stripeError)
      return NextResponse.json(
        { error: 'Erro ao cancelar assinatura no Stripe' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}