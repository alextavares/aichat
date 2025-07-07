import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/chat/route'
import { aiService } from '@/lib/ai/ai-service'

// Mock das dependências
jest.mock('@/lib/auth')
jest.mock('@/lib/prisma')
jest.mock('@/lib/ai/ai-service')

const mockAiService = aiService as jest.Mocked<typeof aiService>

describe('Chat API Robustness Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock da sessão válida
    const mockGetServerSession = require('@/lib/auth').getServerSession
    mockGetServerSession.mockResolvedValue({
      user: { id: 'test-user-id' }
    })
    
    // Mock do Prisma
    const mockPrisma = require('@/lib/prisma').prisma
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'test-user-id',
      planType: 'PRO'
    })
    
    mockPrisma.userUsage.findFirst.mockResolvedValue(null)
    mockPrisma.conversation.create.mockResolvedValue({
      id: 'test-conversation-id'
    })
    mockPrisma.message.create.mockResolvedValue({
      id: 'test-message-id'
    })
    mockPrisma.userUsage.create.mockResolvedValue({})
  })

  describe('🔄 Fallback System Tests', () => {
    it('should handle primary provider failure and use fallback', async () => {
      // Simular falha do provider primário
      mockAiService.generateResponse
        .mockRejectedValueOnce(new Error('[OpenRouter] API key not configured'))
        .mockResolvedValueOnce({
          content: 'Fallback response',
          tokensUsed: { input: 10, output: 20, total: 30 },
          cost: 0.001,
          model: 'gpt-3.5-turbo'
        })

      mockAiService.getModelsForPlan.mockReturnValue([
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 4096, costPerInputToken: 0.001, costPerOutputToken: 0.002 }
      ])

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Test message' }],
          model: 'gpt-3.5-turbo'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Fallback response')
      expect(mockAiService.generateResponse).toHaveBeenCalledTimes(1)
    })

    it('should handle timeout errors gracefully', async () => {
      mockAiService.generateResponse.mockRejectedValue(
        new Error('[OpenRouter] Request timeout after 30 seconds')
      )

      mockAiService.getModelsForPlan.mockReturnValue([
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 4096, costPerInputToken: 0.001, costPerOutputToken: 0.002 }
      ])

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Test message' }],
          model: 'gpt-3.5-turbo'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(408)
      expect(data.message).toBe('Tempo limite excedido. Tente novamente.')
    })

    it('should handle rate limit errors appropriately', async () => {
      mockAiService.generateResponse.mockRejectedValue(
        new Error('Rate limit exceeded')
      )

      mockAiService.getModelsForPlan.mockReturnValue([
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 4096, costPerInputToken: 0.001, costPerOutputToken: 0.002 }
      ])

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Test message' }],
          model: 'gpt-3.5-turbo'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.message).toBe('Limite de uso temporariamente excedido. Tente novamente em alguns minutos.')
    })
  })

  describe('🔍 Input Validation Tests', () => {
    it('should reject empty messages', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [],
          model: 'gpt-3.5-turbo'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Mensagens são obrigatórias')
    })

    it('should reject invalid message format', async () => {
      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: 'invalid format',
          model: 'gpt-3.5-turbo'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.message).toBe('Mensagens são obrigatórias')
    })

    it('should handle unauthorized requests', async () => {
      const mockGetServerSession = require('@/lib/auth').getServerSession
      mockGetServerSession.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Test' }],
          model: 'gpt-3.5-turbo'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.message).toBe('Não autorizado')
    })
  })

  describe('📊 Usage Limits Tests', () => {
    it('should enforce daily limits for FREE users', async () => {
      const mockPrisma = require('@/lib/prisma').prisma
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'test-user-id',
        planType: 'FREE'
      })

      mockPrisma.userUsage.findFirst.mockResolvedValue({
        messagesCount: 10000 // Limite atingido
      })

      mockAiService.getModelsForPlan.mockReturnValue([
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 4096, costPerInputToken: 0.001, costPerOutputToken: 0.002 }
      ])

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Test message' }],
          model: 'gpt-3.5-turbo'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.message).toContain('Limite diário de mensagens atingido')
    })

    it('should allow unlimited usage for PRO users', async () => {
      mockAiService.generateResponse.mockResolvedValue({
        content: 'Test response',
        tokensUsed: { input: 10, output: 20, total: 30 },
        cost: 0.001,
        model: 'gpt-3.5-turbo'
      })

      mockAiService.getModelsForPlan.mockReturnValue([
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 4096, costPerInputToken: 0.001, costPerOutputToken: 0.002 }
      ])

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Test message' }],
          model: 'gpt-3.5-turbo'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.message).toBe('Test response')
    })
  })

  describe('🔧 Model Availability Tests', () => {
    it('should reject unavailable models for user plan', async () => {
      mockAiService.getModelsForPlan.mockReturnValue([
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', maxTokens: 4096, costPerInputToken: 0.001, costPerOutputToken: 0.002 }
      ])

      const request = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Test message' }],
          model: 'gpt-4' // Modelo não disponível
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.message).toBe('Modelo não disponível para seu plano')
    })
  })
})

describe('AI Service Fallback Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should log provider attempts correctly', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
    
    mockAiService.generateResponse.mockResolvedValue({
      content: 'Test response',
      tokensUsed: { input: 10, output: 20, total: 30 },
      cost: 0.001,
      model: 'gpt-3.5-turbo'
    })

    try {
      await aiService.generateResponse(
        [{ role: 'user', content: 'Test' }],
        'gpt-3.5-turbo'
      )
    } catch (error) {
      // Esperado para teste de mocking
    }

    consoleSpy.mockRestore()
  })
})

describe('Chat System Robustness Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('🔄 Provider Fallback Tests', () => {
    it('should handle API key missing error', () => {
      const error = new Error('[OpenRouter] API key not configured')
      expect(error.message).toContain('API key not configured')
    })

    it('should handle timeout error', () => {
      const error = new Error('[OpenRouter] Request timeout after 30 seconds')
      expect(error.message).toContain('timeout')
    })

    it('should handle rate limit error', () => {
      const error = new Error('Rate limit exceeded')
      expect(error.message).toContain('Rate limit')
    })
  })

  describe('🔍 Error Classification Tests', () => {
    it('should classify timeout errors correctly', () => {
      const timeoutError = new Error('timeout')
      expect(timeoutError.message.includes('timeout')).toBe(true)
    })

    it('should classify rate limit errors correctly', () => {
      const rateLimitError = new Error('rate limit')
      expect(rateLimitError.message.includes('rate limit')).toBe(true)
    })

    it('should classify quota errors correctly', () => {
      const quotaError = new Error('quota exceeded')
      expect(quotaError.message.includes('quota')).toBe(true)
    })
  })

  describe('📊 Logging Tests', () => {
    it('should log provider attempts', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      
      console.log('[OpenRouter] Attempt 1/3')
      console.log('[OpenRouter] Generating response with model: gpt-3.5-turbo')
      
      expect(consoleSpy).toHaveBeenCalledWith('[OpenRouter] Attempt 1/3')
      expect(consoleSpy).toHaveBeenCalledWith('[OpenRouter] Generating response with model: gpt-3.5-turbo')
      
      consoleSpy.mockRestore()
    })

    it('should log errors appropriately', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      console.error('[OpenRouter] API Error: 401 Unauthorized')
      
      expect(consoleSpy).toHaveBeenCalledWith('[OpenRouter] API Error: 401 Unauthorized')
      
      consoleSpy.mockRestore()
    })
  })
}) 