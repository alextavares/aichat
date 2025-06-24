import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request }) // O token agora terá onboardingCompleted
  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isPublicPage = request.nextUrl.pathname === '/' || 
                      request.nextUrl.pathname === '/demo-chat' ||
                      request.nextUrl.pathname === '/teste-gratis'
  const isOnboardingPage = request.nextUrl.pathname === '/onboarding'
  const isApiAuthRoute = request.nextUrl.pathname.startsWith('/api/auth')
  const isPublicApiRoute = request.nextUrl.pathname.startsWith('/api/test-ai-public') || 
                          request.nextUrl.pathname.startsWith('/api/test-stream-public')

  // If it's an API auth route or public test route, let it through
  if (isApiAuthRoute || isPublicApiRoute) {
    return NextResponse.next()
  }

  // If user is authenticated
  if (isAuth) {
    // And trying to access auth pages, redirect to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // And trying to access onboarding page but has completed onboarding, redirect to dashboard
    // @ts-ignore // getToken pode não ter onboardingCompleted no tipo padrão, mas nós adicionamos
    if (isOnboardingPage && token?.onboardingCompleted === true) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Se o usuário está autenticado, mas NÃO completou o onboarding e está tentando
    // acessar uma página protegida que não seja o onboarding, redirecionar para onboarding.
    // A página /dashboard já faz isso internamente, mas podemos adicionar uma camada aqui.
    // @ts-ignore
    if (!token?.onboardingCompleted && !isOnboardingPage && !isPublicPage && !isAuthPage) {
        // Permitir acesso a /api/* rotas que não são de autenticação ou públicas
        // pois podem ser chamadas pelo frontend do dashboard antes do redirect do dashboard para onboarding
        if (!request.nextUrl.pathname.startsWith('/api/')) {
             return NextResponse.redirect(new URL('/onboarding', request.url));
        }
    }

  } else { // User is not authenticated
    // And trying to access protected pages (not auth, not public, not onboarding)
    if (!isAuthPage && !isPublicPage && !isOnboardingPage) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
    // If trying to access onboarding page without auth, redirect to signin
    if (isOnboardingPage) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
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