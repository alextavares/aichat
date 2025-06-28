import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { mockUsers, mockSessions } from '../fixtures/auth.fixtures'

// Import route handlers
import { POST as registerHandler } from '@/app/api/auth/register/route'
import { POST as changePasswordHandler } from '@/app/api/user/change-password/route'

// Mock external dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('Auth Integration Tests', () => {
  const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/auth/register', () => {
    test('should register new user successfully', async () => {
      const requestData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: '1',
        email: requestData.email,
        name: requestData.name,
        createdAt: new Date(),
      })

      const response = await registerHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.message).toBe('Usuário registrado com sucesso')
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: requestData.email,
          name: requestData.name,
          password: expect.any(String),
        },
      })
    })

    test('should reject registration with existing email', async () => {
      const requestData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
        name: 'Existing User',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)

      const response = await registerHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('E-mail já cadastrado')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    test('should validate password strength', async () => {
      const requestData = {
        email: 'newuser@example.com',
        password: '123', // Weak password
        name: 'New User',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)

      const response = await registerHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toContain('senha')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    test('should handle invalid email format', async () => {
      const requestData = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'New User',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      const response = await registerHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toContain('e-mail')
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    test('should handle database errors gracefully', async () => {
      const requestData = {
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        name: 'New User',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      ;(prisma.user.create as jest.Mock).mockRejectedValue(new Error('Database error'))

      const response = await registerHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.message).toBe('Erro ao registrar usuário')
    })
  })

  describe('POST /api/user/change-password', () => {
    test('should change password successfully', async () => {
      const requestData = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      const hashedOldPassword = await bcrypt.hash('OldPass123!', 10)
      const mockUser = {
        ...mockUsers.basic,
        password: hashedOldPassword,
      }

      mockGetServerSession.mockResolvedValue(mockSessions.basic)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)
      ;(prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        password: 'new-hashed-password',
      })

      const response = await changePasswordHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Senha alterada com sucesso')
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: expect.any(String) },
      })
    })

    test('should reject unauthenticated password change', async () => {
      const requestData = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      mockGetServerSession.mockResolvedValue(null)

      const response = await changePasswordHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Não autorizado')
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    test('should reject incorrect current password', async () => {
      const requestData = {
        currentPassword: 'WrongPass123!',
        newPassword: 'NewPass123!',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      const hashedPassword = await bcrypt.hash('CorrectPass123!', 10)
      const mockUser = {
        ...mockUsers.basic,
        password: hashedPassword,
      }

      mockGetServerSession.mockResolvedValue(mockSessions.basic)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser)

      const response = await changePasswordHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Senha atual incorreta')
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    test('should reject weak new password', async () => {
      const requestData = {
        currentPassword: 'OldPass123!',
        newPassword: '123', // Weak password
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      mockGetServerSession.mockResolvedValue(mockSessions.basic)

      const response = await changePasswordHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toContain('senha')
      expect(prisma.user.update).not.toHaveBeenCalled()
    })

    test('should handle OAuth users appropriately', async () => {
      const requestData = {
        currentPassword: 'OldPass123!',
        newPassword: 'NewPass123!',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      const mockOAuthUser = {
        ...mockUsers.basic,
        password: null, // OAuth users don't have passwords
      }

      mockGetServerSession.mockResolvedValue(mockSessions.basic)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockOAuthUser)

      const response = await changePasswordHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Usuário autenticado via OAuth não pode alterar senha')
      expect(prisma.user.update).not.toHaveBeenCalled()
    })
  })

  describe('Authentication Flow Integration', () => {
    test('should handle complete registration and login flow', async () => {
      // Step 1: Register new user
      const registerData = {
        email: 'flowtest@example.com',
        password: 'FlowTest123!',
        name: 'Flow Test User',
      }

      const registerRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(registerData),
      })

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      const hashedPassword = await bcrypt.hash(registerData.password, 10)
      ;(prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'flow-test-id',
        email: registerData.email,
        name: registerData.name,
        password: hashedPassword,
        createdAt: new Date(),
      })

      const registerResponse = await registerHandler(registerRequest)
      expect(registerResponse.status).toBe(201)

      // Step 2: Simulate login (NextAuth would handle this)
      // In a real integration test, we would test the NextAuth flow
      
      // Step 3: Change password
      const changePasswordData = {
        currentPassword: 'FlowTest123!',
        newPassword: 'NewFlowTest123!',
      }

      const changePasswordRequest = new NextRequest('http://localhost:3000/api/user/change-password', {
        method: 'POST',
        body: JSON.stringify(changePasswordData),
      })

      mockGetServerSession.mockResolvedValue({
        user: {
          id: 'flow-test-id',
          email: registerData.email,
          name: registerData.name,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'flow-test-id',
        email: registerData.email,
        password: hashedPassword,
      })

      ;(prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'flow-test-id',
        email: registerData.email,
        password: 'new-hashed-password',
      })

      const changePasswordResponse = await changePasswordHandler(changePasswordRequest)
      expect(changePasswordResponse.status).toBe(200)
    })
  })

  describe('Security Tests', () => {
    test('should properly hash passwords', async () => {
      const requestData = {
        email: 'security@example.com',
        password: 'SecurePass123!',
        name: 'Security User',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
      
      let capturedPassword = ''
      ;(prisma.user.create as jest.Mock).mockImplementation(async ({ data }) => {
        capturedPassword = data.password
        return {
          id: '1',
          email: data.email,
          name: data.name,
          password: data.password,
          createdAt: new Date(),
        }
      })

      await registerHandler(mockRequest)

      // Verify password was hashed
      expect(capturedPassword).not.toBe(requestData.password)
      expect(capturedPassword).toHaveLength(60) // bcrypt hash length
      
      // Verify hash is valid
      const isValidHash = await bcrypt.compare(requestData.password, capturedPassword)
      expect(isValidHash).toBe(true)
    })

    test('should prevent timing attacks on user enumeration', async () => {
      const timings: number[] = []
      
      // Test with existing user
      for (let i = 0; i < 5; i++) {
        const start = Date.now()
        
        const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: 'existing@example.com',
            password: 'Test123!',
            name: 'Test',
          }),
        })

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)
        
        await registerHandler(mockRequest)
        timings.push(Date.now() - start)
      }

      // Test with non-existing user
      for (let i = 0; i < 5; i++) {
        const start = Date.now()
        
        const mockRequest = new NextRequest('http://localhost:3000/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: 'nonexisting@example.com',
            password: 'Test123!',
            name: 'Test',
          }),
        })

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(null)
        ;(prisma.user.create as jest.Mock).mockResolvedValue({
          id: '1',
          email: 'nonexisting@example.com',
          name: 'Test',
          createdAt: new Date(),
        })
        
        await registerHandler(mockRequest)
        timings.push(Date.now() - start)
      }

      // Check that timing differences are minimal (< 50ms variance)
      const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length
      const maxVariance = Math.max(...timings.map(t => Math.abs(t - avgTiming)))
      
      expect(maxVariance).toBeLessThan(50)
    })
  })
})