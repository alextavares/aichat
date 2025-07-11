import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Debug log
  console.log('[MIDDLEWARE] Processing:', pathname)
  
  // Static and public file paths that should never be processed
  const staticPaths = [
    '/_next/',
    '/favicon.ico',
    '/public/',
    '/api/auth/'
  ]
  
  // Skip middleware for static files and auth routes
  if (staticPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }
  
  // Public pages that don't require authentication
  const publicPages = [
    '/',
    '/demo-chat',
    '/teste-gratis', 
    '/pricing',
    '/new-landing'
  ]
  
  // Public API routes that don't require authentication
  const publicApiRoutes = [
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
  
  // Check if current path is public
  const isPublicPage = publicPages.includes(pathname) || 
                       pathname.startsWith('/pricing/') ||
                       pathname.startsWith('/payment/')
  
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))
  
  // Allow all public routes without any authentication check
  if (isPublicPage || isPublicApiRoute) {
    console.log('[MIDDLEWARE] ✅ Public route allowed:', pathname)
    return NextResponse.next()
  }
  
  // Now handle authentication for protected routes
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                      request.cookies.get('__Secure-next-auth.session-token')?.value
  
  const isAuth = !!sessionToken
  const isAuthPage = pathname.startsWith('/auth')
  const isOnboardingPage = pathname === '/onboarding'

  console.log('[MIDDLEWARE] 🔐 Auth check:', { 
    pathname, 
    isAuth, 
    isAuthPage, 
    isOnboardingPage,
    hasToken: !!sessionToken 
  })

  // Special handling for auth pages
  if (isAuthPage) {
    if (isAuth) {
      console.log('[MIDDLEWARE] 🔄 Authenticated user on auth page - redirect to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      console.log('[MIDDLEWARE] ✅ Unauthenticated user accessing auth page - allowed')
      return NextResponse.next()
    }
  }

  // Special handling for onboarding page
  if (isOnboardingPage) {
    if (!isAuth) {
      console.log('[MIDDLEWARE] 🔄 Onboarding requires auth - redirect to signin')
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    } else {
      console.log('[MIDDLEWARE] ✅ Authenticated user accessing onboarding - allowed')
      return NextResponse.next()
    }
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    if (!isAuth) {
      console.log('[MIDDLEWARE] ❌ Private API route blocked - no auth:', pathname)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    } else {
      console.log('[MIDDLEWARE] ✅ Private API route allowed - has auth:', pathname)
      return NextResponse.next()
    }
  }

  // Handle all other protected pages
  if (!isAuth) {
    console.log('[MIDDLEWARE] 🔄 Protected page requires auth - redirect to signin:', pathname)
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  console.log('[MIDDLEWARE] ✅ Protected page allowed - has auth:', pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     * More specific matcher to avoid unnecessary processing
     */
    '/((?!_next/static|_next/image|favicon.ico|public|.*\\..*).*)' ,
    '/api/(.*)'
  ],
}