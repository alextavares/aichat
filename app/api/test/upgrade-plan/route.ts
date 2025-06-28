import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production' && !process.env.ALLOW_TEST_UPGRADE) {
      return NextResponse.json(
        { error: 'Test upgrade not allowed in production' },
        { status: 403 }
      )
    }

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planType = 'PRO' } = await request.json()

    // Update user plan
    await prisma.user.update({
      where: { id: session.user.id },
      data: { planType: planType as any }
    })

    // Create or update subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      }
    })

    const startDate = new Date()
    const expiresDate = new Date(startDate)
    expiresDate.setMonth(startDate.getMonth() + 1) // 1 month for test

    if (existingSubscription) {
      await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planType: planType as any,
          expiresAt: expiresDate
        }
      })
    } else {
      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          planType: planType as any,
          status: 'ACTIVE',
          mercadoPagoPaymentId: `test_${Date.now()}`,
          startedAt: startDate,
          expiresAt: expiresDate
        }
      })
    }

    // Create payment record
    const amount = planType === 'PRO' ? 79.90 : 197.00
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount,
        currency: 'BRL',
        status: 'COMPLETED',
        mercadoPagoPaymentId: `test_payment_${Date.now()}`
      }
    })

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${planType} plan (test mode)`,
      planType
    })
  } catch (error) {
    console.error('Test upgrade error:', error)
    return NextResponse.json(
      { error: 'Failed to upgrade plan' },
      { status: 500 }
    )
  }
}