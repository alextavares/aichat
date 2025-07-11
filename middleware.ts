import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for specific paths that should never be processed
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/public/') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }
  
  // Public routes that should NEVER require authentication
  const publicRoutes = [
    '/',
    '/new-landing',
    '/pricing',
    '/demo-chat',
    '/teste-gratis',
    '/api/health',
    '/api/test/system-status',
    '/api/test/image-status', 
    '/api/test/ai-status'
  ]
  
  // Check if current path is in public routes or starts with public paths
  const isPublicRoute = publicRoutes.some(route => {
    if (route === pathname) return true
    if (pathname.startsWith('/pricing/') || pathname.startsWith('/payment/')) return true
    return false
  })
  
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Get authentication tokens
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                      request.cookies.get('__Secure-next-auth.session-token')?.value
  
  const isAuthenticated = !!sessionToken
  
  // Auth pages handling - redirect authenticated users to dashboard
  if (pathname.startsWith('/auth/')) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }
  
  // Onboarding page - requires authentication
  if (pathname === '/onboarding') {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    return NextResponse.next()
  }
  
  // Protected API routes
  if (pathname.startsWith('/api/')) {
    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }
  
  // All other protected pages require authentication
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}