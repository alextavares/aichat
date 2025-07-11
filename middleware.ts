import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('[MIDDLEWARE-SIMPLE] Processing:', pathname)
  
  // Skip middleware for specific paths
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/auth/') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/public/')
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
  
  // Check if current path is in public routes
  const isPublicRoute = publicRoutes.some(route => {
    if (route === pathname) return true
    if (pathname.startsWith('/pricing/') || pathname.startsWith('/payment/')) return true
    return false
  })
  
  if (isPublicRoute) {
    console.log('[MIDDLEWARE-SIMPLE] ✅ PUBLIC ROUTE ALLOWED:', pathname)
    return NextResponse.next()
  }
  
  // Check authentication for protected routes
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                      request.cookies.get('__Secure-next-auth.session-token')?.value
  
  const isAuthenticated = !!sessionToken
  
  console.log('[MIDDLEWARE-SIMPLE] Auth status:', { pathname, isAuthenticated })
  
  // Auth pages handling
  if (pathname.startsWith('/auth/')) {
    if (isAuthenticated) {
      console.log('[MIDDLEWARE-SIMPLE] 🔄 Redirect authenticated user to dashboard')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }
  
  // Onboarding page
  if (pathname === '/onboarding') {
    if (!isAuthenticated) {
      console.log('[MIDDLEWARE-SIMPLE] 🔄 Redirect to signin for onboarding')
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    return NextResponse.next()
  }
  
  // Protected API routes
  if (pathname.startsWith('/api/')) {
    if (!isAuthenticated) {
      console.log('[MIDDLEWARE-SIMPLE] ❌ API route requires auth')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.next()
  }
  
  // All other protected pages
  if (!isAuthenticated) {
    console.log('[MIDDLEWARE-SIMPLE] 🔄 Redirect to signin')
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
  
  console.log('[MIDDLEWARE-SIMPLE] ✅ Protected route allowed')
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}