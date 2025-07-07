import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { NextRequest, NextResponse } from 'next/server'
import { middleware } from '@/middleware'

describe('Auth Middleware Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Database Session Authentication', () => {
    test('should allow access with valid session cookie', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard', {
        headers: {
          cookie: 'next-auth.session-token=valid-session-token'
        }
      })

      const response = await middleware(request)
      
      expect(response).toBeInstanceOf(NextResponse)
      // Should not redirect (allows access)
      expect(response.status).not.toBe(307) // Redirect status
    })

    test('should redirect unauthenticated users to signin', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard')

      const response = await middleware(request)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(307) // Redirect status
      expect(response.headers.get('location')).toContain('/auth/signin')
    })

    test('should allow access to public pages without auth', async () => {
      const request = new NextRequest('http://localhost:3000/')

      const response = await middleware(request)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).not.toBe(307) // Should not redirect
    })

    test('should allow access to public API routes', async () => {
      const request = new NextRequest('http://localhost:3000/api/public/payment-debug')

      const response = await middleware(request)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).not.toBe(401) // Should not be unauthorized
    })

    test('should return 401 for protected API routes without auth', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat')

      const response = await middleware(request)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(401)
      
      const body = await response.json()
      expect(body).toEqual({ error: 'Unauthorized' })
    })

    test('should redirect authenticated users away from auth pages', async () => {
      const request = new NextRequest('http://localhost:3000/auth/signin', {
        headers: {
          cookie: 'next-auth.session-token=valid-session-token'
        }
      })

      const response = await middleware(request)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(307) // Redirect status
      expect(response.headers.get('location')).toContain('/dashboard')
    })

    test('should handle secure cookie variant', async () => {
      const request = new NextRequest('http://localhost:3000/dashboard', {
        headers: {
          cookie: '__Secure-next-auth.session-token=secure-session-token'
        }
      })

      const response = await middleware(request)
      
      expect(response).toBeInstanceOf(NextResponse)
      // Should not redirect (allows access)
      expect(response.status).not.toBe(307)
    })
  })

  describe('Protected Route Patterns', () => {
    test('should protect onboarding page', async () => {
      const request = new NextRequest('http://localhost:3000/onboarding')

      const response = await middleware(request)
      
      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(307) // Redirect to signin
      expect(response.headers.get('location')).toContain('/auth/signin')
    })

    test('should allow webhook endpoints', async () => {
      const webhookPaths = [
        '/api/mercadopago/webhook',
        '/api/stripe/webhook',
        '/api/test-webhook'
      ]

      for (const path of webhookPaths) {
        const request = new NextRequest(`http://localhost:3000${path}`)
        const response = await middleware(request)
        
        expect(response).toBeInstanceOf(NextResponse)
        expect(response.status).not.toBe(401)
      }
    })
  })
})