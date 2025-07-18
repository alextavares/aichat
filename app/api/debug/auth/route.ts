import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Check if essential environment variables are set
    const envCheck = {
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      DATABASE_URL: !!process.env.DATABASE_URL,
      GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
      GITHUB_ID: !!process.env.GITHUB_ID,
      GITHUB_SECRET: !!process.env.GITHUB_SECRET,
      NODE_ENV: process.env.NODE_ENV
    }

    // Check providers
    const providersCount = authOptions.providers?.length || 0
    
    // Check if we can connect to the database
    const { prisma } = await import('@/lib/prisma')
    const dbConnection = await prisma.$connect().then(() => true).catch(() => false)
    
    return NextResponse.json({
      status: 'debug',
      env: envCheck,
      providers: providersCount,
      dbConnection,
      authOptions: {
        hasAdapter: !!authOptions.adapter,
        hasProviders: providersCount > 0,
        sessionStrategy: authOptions.session?.strategy,
        hasSecret: !!authOptions.secret,
        debug: authOptions.debug
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}