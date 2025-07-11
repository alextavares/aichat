import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Debug log for troubleshooting
  console.log('[MIDDLEWARE] Request:', request.nextUrl.pathname)
  
  // Define public paths first
  const publicPaths = [
    '/',
    '/demo-chat',
    '/teste-gratis', 
    '/pricing',
    '/new-landing'
  ]
  
  const publicApiPaths = [
    '/api/health',
    '/api/test/image-status',
    '/api/test/ai-status', 
    '/api/test/system-status',
    '/api/test-ai-public',
    '/api/test-stream-public',
    '/api/public/',
    '/api/public-test-chat',
    '/api/mercadopago/webhook',
    '/api/stripe/webhook',
    '/api/test-webhook',
    '/api/test/simulate-payment'
  ]
  
  const pathname = request.nextUrl.pathname
  
  // Check if it's a public page
  const isPublicPage = publicPaths.includes(pathname) || 
                       pathname.startsWith('/pricing/') ||
                       pathname.startsWith('/payment/')
  
  // Check if it's a public API route
  const isPublicApiRoute = publicApiPaths.some(path => pathname.startsWith(path)) ||
                          pathname.startsWith('/api/auth')
  
  // Allow public routes immediately
  if (isPublicPage || isPublicApiRoute) {
    console.log('[MIDDLEWARE] Public route allowed:', pathname)
    return NextResponse.next()
  }
  
  // For database sessions, we need to check the session cookie differently
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                      request.cookies.get('__Secure-next-auth.session-token')?.value
  
  // Simple existence check for now - NextAuth will validate the session properly in API routes
  const isAuth = !!sessionToken
  const isAuthPage = pathname.startsWith('/auth')
  const isOnboardingPage = pathname === '/onboarding'

  console.log('[MIDDLEWARE] Auth status:', { isAuth, isAuthPage, isOnboardingPage })

  // For private API routes, return 401 instead of redirecting to login
  if (pathname.startsWith('/api/') && !isAuth) {
    console.log('[MIDDLEWARE] API route blocked - no auth')
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (isAuth && isAuthPage) {
    console.log('[MIDDLEWARE] Authenticated user on auth page - redirect to dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user is not authenticated and trying to access protected pages
  if (!isAuth && !isAuthPage && !isOnboardingPage) {
    console.log('[MIDDLEWARE] Unauthenticated user on protected page - redirect to signin')
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // If user is authenticated but onboarding page requires auth
  if (isOnboardingPage && !isAuth) {
    console.log('[MIDDLEWARE] Onboarding page requires auth - redirect to signin')
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