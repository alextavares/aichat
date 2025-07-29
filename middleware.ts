import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { rateLimitMiddleware } from '@/lib/middleware/rate-limit-middleware'

export async function middleware(request: NextRequest) {
  // Check for rate limiting on chat routes
  const isChatRoute = request.nextUrl.pathname === '/api/chat' || 
                     request.nextUrl.pathname === '/api/chat-anonymous'
  
  if (isChatRoute) {
    const rateLimitResponse = await rateLimitMiddleware(request)
    if (rateLimitResponse && rateLimitResponse.status === 429) {
      return rateLimitResponse
    }
  }

  // Check for session tokens (both secure and non-secure variants)
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                      request.cookies.get('__Secure-next-auth.session-token')?.value
  
  // Additional check for csrf token to improve authentication detection
  const csrfToken = request.cookies.get('next-auth.csrf-token')?.value ||
                   request.cookies.get('__Secure-next-auth.csrf-token')?.value
  
  // More robust auth detection - check for both tokens
  const isAuth = !!(sessionToken && csrfToken)
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublicPage = request.nextUrl.pathname === '/' || 
                      request.nextUrl.pathname === '/demo-chat' ||
                      request.nextUrl.pathname === '/teste-gratis' ||
                      request.nextUrl.pathname === '/pricing' ||
                      request.nextUrl.pathname.startsWith('/pricing/') ||
                      request.nextUrl.pathname.startsWith('/payment/')
  const isOnboardingPage = request.nextUrl.pathname === '/onboarding'
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth')
  const isPublicApiRoute = request.nextUrl.pathname.startsWith('/api/test-ai-public') || 
                          request.nextUrl.pathname.startsWith('/api/test-stream-public') ||
                          request.nextUrl.pathname.startsWith('/api/public/') ||
                          request.nextUrl.pathname === '/api/health' ||
                          request.nextUrl.pathname === '/api/public-test-chat' ||
                          request.nextUrl.pathname.startsWith('/api/mercadopago/webhook') ||
                          request.nextUrl.pathname.startsWith('/api/stripe/webhook') ||
                          request.nextUrl.pathname === '/api/test-webhook' ||
                          request.nextUrl.pathname.startsWith('/api/test/simulate-payment') ||
                          request.nextUrl.pathname.startsWith('/api/debug/') ||
                          request.nextUrl.pathname === '/api/debug-env' ||
                          request.nextUrl.pathname.startsWith('/api/test-auth') ||
                          request.nextUrl.pathname.startsWith('/api/health-check') ||
                          request.nextUrl.pathname === '/api/chat-anonymous' ||
                          request.nextUrl.pathname.startsWith('/api/conversations/migrate') ||
                          request.nextUrl.pathname.startsWith('/api/auth/migrate-anonymous') ||
                          request.nextUrl.pathname.startsWith('/api/auth/providers')

  // If it's an API auth route or public test route, let it through
  if (isApiAuthRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // For API routes, return 401 instead of redirecting to login
  if (request.nextUrl.pathname.startsWith('/api/') && !isAuth) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuth && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Only redirect to login for dashboard pages specifically
  // Let NextAuth handle session validation for other protected routes
  if (!isAuth && request.nextUrl.pathname.startsWith('/dashboard')) {
    // Add debug headers for production troubleshooting
    const response = NextResponse.redirect(new URL('/auth/signin', request.url))
    response.headers.set('X-Auth-Debug', 'no-session-token')
    response.headers.set('X-Requested-Path', request.nextUrl.pathname)
    return response
  }

  // Special handling for /dashboard/chat - most critical route
  if (request.nextUrl.pathname === '/dashboard/chat') {
    if (!sessionToken) {
      const response = NextResponse.redirect(new URL('/auth/signin', request.url))
      response.headers.set('X-Auth-Debug', 'chat-route-no-session')
      return response
    }
    // Allow through if session token exists, let page handle validation
    const response = NextResponse.next()
    response.headers.set('X-Auth-Debug', 'chat-route-allowed')
    return response
  }

  // If user is authenticated but onboarding page requires auth
  if (isOnboardingPage && !isAuth) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}