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

    const body = await request.json()
    const {
      usageType,
      professionCategory,
      name,
      lastName,
      phone,
      organization,
      profileImage
    } = body

    // Update user with onboarding data
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        usageType: usageType as any,
        professionCategory,
        name: `${name} ${lastName}`,
        phone,
        organization,
        profileImage,
        onboardingCompleted: true,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        usageType: updatedUser.usageType,
        professionCategory: updatedUser.professionCategory,
        onboardingCompleted: updatedUser.onboardingCompleted
      }
    })

  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to save onboarding data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        usageType: true,
        professionCategory: true,
        phone: true,
        organization: true,
        profileImage: true,
        onboardingCompleted: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Get onboarding error:', error)
    return NextResponse.json(
      { error: 'Failed to get onboarding data' },
      { status: 500 }
    )
  }
}