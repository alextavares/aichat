import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // For database sessions, we need to check the session cookie differently
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                      request.cookies.get('__Secure-next-auth.session-token')?.value
  
  // Simple existence check for now - NextAuth will validate the session properly in API routes
  const isAuth = !!sessionToken
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
                          request.nextUrl.pathname.startsWith('/api/test/simulate-payment')

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

  // If user is not authenticated and trying to access protected pages
  if (!isAuth && !isAuthPage && !isPublicPage && !isOnboardingPage) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
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