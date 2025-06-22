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
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get plan limits
    const planLimits = await prisma.planLimit.findUnique({
      where: {
        planType: user.planType
      }
    })

    if (!planLimits) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    const response = {
      type: user.planType,
      dailyLimit: planLimits.dailyMessagesLimit,
      monthlyLimit: planLimits.monthlyTokensLimit,
      features: planLimits.featuresEnabled as string[]
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching plan info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plan info' },
      { status: 500 }
    )
  }
}