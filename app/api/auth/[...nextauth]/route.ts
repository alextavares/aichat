import { authOptions } from "@/lib/auth"
import NextAuth from "next-auth"
import { NextRequest, NextResponse } from "next/server"

const handler = NextAuth(authOptions)

async function wrappedHandler(request: NextRequest) {
  try {
    // Add debug information for troubleshooting
    const url = new URL(request.url)
    if (url.pathname.includes('/debug')) {
      const envCheck = {
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
        DATABASE_URL: !!process.env.DATABASE_URL,
        NODE_ENV: process.env.NODE_ENV,
        providersCount: authOptions.providers?.length || 0,
        hasAdapter: !!authOptions.adapter,
        sessionStrategy: authOptions.session?.strategy
      }
      
      return NextResponse.json({
        debug: true,
        env: envCheck,
        url: url.pathname,
        timestamp: new Date().toISOString()
      })
    }
    
    return await handler(request)
  } catch (error) {
    console.error('NextAuth handler error:', error)
    // Return detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Authentication service temporarily unavailable',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export { wrappedHandler as GET, wrappedHandler as POST }