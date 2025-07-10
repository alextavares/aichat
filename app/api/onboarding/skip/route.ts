import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Simply mark onboarding as completed without updating other fields
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        onboardingCompleted: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding skipped successfully',
      user: {
        id: updatedUser.id,
        onboardingCompleted: updatedUser.onboardingCompleted
      }
    })

  } catch (error) {
    console.error('Skip onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to skip onboarding' },
      { status: 500 }
    )
  }
}