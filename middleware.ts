import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublicPage = request.nextUrl.pathname === '/' || 
                      request.nextUrl.pathname === '/demo-chat' ||
                      request.nextUrl.pathname === '/teste-gratis' ||
                      request.nextUrl.pathname === '/pricing' ||
                      request.nextUrl.pathname.startsWith('/pricing/')
  const isOnboardingPage = request.nextUrl.pathname === '/onboarding'
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth')
  const isPublicApiRoute = request.nextUrl.pathname.startsWith('/api/test-ai-public') || 
                          request.nextUrl.pathname.startsWith('/api/test-stream-public') ||
                          request.nextUrl.pathname.startsWith('/api/public/') ||
                          request.nextUrl.pathname === '/api/health' ||
                          request.nextUrl.pathname.startsWith('/api/mercadopago/webhook') ||
                          request.nextUrl.pathname.startsWith('/api/stripe/webhook')

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