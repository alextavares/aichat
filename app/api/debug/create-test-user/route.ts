import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with special header
    const isDebugMode = process.env.NODE_ENV === 'development' || 
                       request.headers.get('x-debug-key') === process.env.DEBUG_KEY

    if (!isDebugMode) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ 
        error: 'Email and password are required' 
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'User already exists',
        user: {
          id: existingUser.id,
          email: existingUser.email,
          name: existingUser.name
        }
      }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash: hashedPassword,
        creditBalance: 1000, // Give some initial credits
        onboardingCompleted: true
      }
    })

    return NextResponse.json({
      message: 'Test user created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        creditBalance: user.creditBalance
      }
    })

  } catch (error) {
    console.error('Error creating test user:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}