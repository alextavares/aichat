import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      config: {
        providersCount: authOptions.providers?.length || 0,
        hasSecret: !!authOptions.secret,
        hasAdapter: !!authOptions.adapter,
        sessionStrategy: authOptions.session?.strategy,
        debug: authOptions.debug
      },
      env: {
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
        DATABASE_URL: !!process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}