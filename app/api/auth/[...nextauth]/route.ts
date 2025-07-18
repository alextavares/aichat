import { authOptions } from "@/lib/auth"
import NextAuth from "next-auth"
import { NextRequest, NextResponse } from "next/server"

const handler = NextAuth(authOptions)

async function wrappedHandler(request: NextRequest) {
  try {
    return await handler(request)
  } catch (error) {
    console.error('NextAuth handler error:', error)
    // Return a proper error response instead of crashing
    return NextResponse.json(
      { error: 'Authentication service temporarily unavailable' },
      { status: 500 }
    )
  }
}

export { wrappedHandler as GET, wrappedHandler as POST }