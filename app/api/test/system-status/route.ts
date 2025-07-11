import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const userCount = await prisma.user.count()
    
    // Test environment variables
    const hasOpenAI = !!process.env.OPENAI_API_KEY
    const hasNextAuth = !!process.env.NEXTAUTH_SECRET
    const hasOpenRouter = !!process.env.OPENROUTER_API_KEY
    
    // Test onboarding endpoint availability
    const testUser = await prisma.user.findFirst({
      where: { email: 'teste@innerai.com' },
      select: { 
        id: true, 
        email: true, 
        onboardingCompleted: true,
        planType: true 
      }
    })
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      tests: {
        database: {
          connected: true,
          userCount
        },
        environment: {
          hasOpenAI,
          hasNextAuth,
          hasOpenRouter,
          nodeEnv: process.env.NODE_ENV
        },
        testUser: testUser ? {
          exists: true,
          email: testUser.email,
          onboardingCompleted: testUser.onboardingCompleted,
          planType: testUser.planType
        } : {
          exists: false
        },
        endpoints: {
          onboardingSkip: '/api/onboarding/skip',
          onboardingRegular: '/api/onboarding',
          imageStatus: '/api/test/image-status',
          aiStatus: '/api/test/ai-status'
        }
      },
      recommendations: [
        !hasOpenAI && "Configure OPENAI_API_KEY for image generation",
        !testUser && "Create test user: teste@innerai.com",
        testUser && !testUser.onboardingCompleted && "Test user needs onboarding completion"
      ].filter(Boolean)
    })
  } catch (error) {
    console.error('System status check error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check system status',
        message: error instanceof Error ? error.message : 'Unknown error',
        status: 'unhealthy'
      },
      { status: 500 }
    )
  }
}