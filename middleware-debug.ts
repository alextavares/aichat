import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Force debug logging to console
  console.log('🔥 MIDDLEWARE DEBUG:', {
    pathname,
    timestamp: new Date().toISOString(),
    method: request.method
  })
  
  // TEMPORARILY ALLOW EVERYTHING FOR DEBUGGING
  if (pathname === '/new-landing' || pathname.startsWith('/api/test/')) {
    console.log('🚀 FORCE ALLOWING:', pathname)
    return NextResponse.next()
  }
  
  // For now, let everything else through too for testing
  console.log('🔓 ALLOWING ALL FOR DEBUG:', pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}