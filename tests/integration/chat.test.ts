import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { aiService } from '@/lib/ai/ai-service'
import { mockUsers, mockSessions } from '../fixtures/auth.fixtures'
import { mockAIModels, mockChatResponses } from '../fixtures/ai.fixtures'

// Import route handler
import { POST as chatHandler } from '@/app/api/chat/route'

// Mock external dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    conversation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    message: {
      createMany: jest.fn(),
    },
    usage: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}))
jest.mock('@/lib/ai/ai-service')

describe('Chat API Integration Tests', () => {
  const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
  const mockAiService = aiService as jest.Mocked<typeof aiService>
  
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mocks
    mockAiService.getAllAvailableModels = jest.fn().mockReturnValue(mockAIModels)
    mockAiService.getModelsForPlan = jest.fn().mockImplementation((plan) => {
      switch (plan) {
        case 'FREE':
          return mockAIModels.filter(m => ['gpt-3.5-turbo', 'claude-3-haiku'].includes(m.id))
        case 'PRO':
          return mockAIModels.filter(m => ['gpt-3.5-turbo', 'gpt-4', 'claude-3-sonnet'].includes(m.id))
        case 'ENTERPRISE':
          return mockAIModels
        default:
          return []
      }
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('POST /api/chat', () => {
    test('should process chat request successfully', async () => {
      const requestData = {
        messages: [{ role: 'user', content: 'Hello, how are you?' }],
        model: 'gpt-3.5-turbo',
        conversationId: null,
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      // Setup mocks
      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)
      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
        messageCount: 5,
        tokenCount: 1000,
      })
      ;(prisma.conversation.create as jest.Mock).mockResolvedValue({
        id: 'conv-123',
        userId: mockUsers.pro.id,
        title: 'New Conversation',
        modelId: 'gpt-3.5-turbo',
        createdAt: new Date(),
      })

      mockAiService.generateResponse = jest.fn().mockResolvedValue({
        content: "I'm doing well, thank you! How can I help you today?",
        tokensUsed: {
          input: 10,
          output: 15,
          total: 25,
        },
        cost: 0.00005,
      })

      mockAiService.estimateTokens = jest.fn().mockReturnValue(10)

      const response = await chatHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        content: "I'm doing well, thank you! How can I help you today?",
        conversationId: 'conv-123',
        tokensUsed: {
          input: 10,
          output: 15,
          total: 25,
        },
        cost: 0.00005,
      })

      // Verify conversation was created
      expect(prisma.conversation.create).toHaveBeenCalledWith({
        data: {
          userId: mockUsers.pro.id,
          title: 'New Conversation',
          modelId: 'gpt-3.5-turbo',
        },
      })

      // Verify messages were saved
      expect(prisma.message.createMany).toHaveBeenCalledWith({
        data: [
          {
            conversationId: 'conv-123',
            role: 'user',
            content: 'Hello, how are you?',
            modelId: 'gpt-3.5-turbo',
            tokenCount: 10,
          },
          {
            conversationId: 'conv-123',
            role: 'assistant',
            content: "I'm doing well, thank you! How can I help you today?",
            modelId: 'gpt-3.5-turbo',
            tokenCount: 15,
            cost: 0.00005,
          },
        ],
      })

      // Verify usage was tracked
      expect(prisma.usage.update).toHaveBeenCalledWith({
        where: expect.any(Object),
        data: {
          messageCount: 6,
          tokenCount: 1025,
        },
      })
    })

    test('should enforce plan restrictions', async () => {
      const requestData = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-4', // Pro model
        conversationId: null,
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      // Setup free user
      mockGetServerSession.mockResolvedValue(mockSessions.basic)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic) // Free user

      const response = await chatHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Modelo não disponível para seu plano')
    })

    test('should enforce daily message limits', async () => {
      const requestData = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo',
        conversationId: null,
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      mockGetServerSession.mockResolvedValue(mockSessions.basic)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)
      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
        messageCount: 10, // Already at limit for free plan
        tokenCount: 500,
      })

      const response = await chatHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Limite diário de mensagens atingido')
    })

    test('should enforce token limits', async () => {
      const requestData = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo',
        conversationId: null,
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      mockGetServerSession.mockResolvedValue(mockSessions.basic)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)
      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
        messageCount: 5,
        tokenCount: 9995, // Close to 10k limit for free plan
      })

      mockAiService.estimateTokens = jest.fn().mockReturnValue(10) // Would exceed limit

      const response = await chatHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(data.error).toBe('Limite diário de tokens atingido')
    })

    test('should handle existing conversation', async () => {
      const requestData = {
        messages: [
          { role: 'user', content: 'What is 2+2?' },
          { role: 'assistant', content: '2+2 equals 4.' },
          { role: 'user', content: 'What about 3+3?' },
        ],
        model: 'gpt-3.5-turbo',
        conversationId: 'existing-conv-123',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)
      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
        messageCount: 5,
        tokenCount: 1000,
      })
      ;(prisma.conversation.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-conv-123',
        userId: mockUsers.pro.id,
        title: 'Math Questions',
        modelId: 'gpt-3.5-turbo',
      })

      mockAiService.generateResponse = jest.fn().mockResolvedValue({
        content: '3+3 equals 6.',
        tokensUsed: { input: 30, output: 10, total: 40 },
        cost: 0.00008,
      })

      mockAiService.estimateTokens = jest.fn()
        .mockReturnValueOnce(8)  // First user message
        .mockReturnValueOnce(7)  // Assistant message
        .mockReturnValueOnce(8)  // Second user message

      const response = await chatHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.conversationId).toBe('existing-conv-123')
      expect(prisma.conversation.create).not.toHaveBeenCalled()
      expect(prisma.conversation.update).toHaveBeenCalledWith({
        where: { id: 'existing-conv-123' },
        data: { updatedAt: expect.any(Date) },
      })
    })

    test('should handle AI service errors gracefully', async () => {
      const requestData = {
        messages: [{ role: 'user', content: 'Hello' }],
        model: 'gpt-3.5-turbo',
        conversationId: null,
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)
      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
        messageCount: 5,
        tokenCount: 1000,
      })
      ;(prisma.conversation.create as jest.Mock).mockResolvedValue({
        id: 'conv-123',
        userId: mockUsers.pro.id,
        title: 'New Conversation',
        modelId: 'gpt-3.5-turbo',
      })

      mockAiService.generateResponse = jest.fn().mockRejectedValue(
        new Error('OpenAI API error: Rate limit exceeded')
      )
      mockAiService.estimateTokens = jest.fn().mockReturnValue(10)

      const response = await chatHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toContain('Erro ao processar')
      
      // Verify no usage was tracked for failed request
      expect(prisma.usage.update).not.toHaveBeenCalled()
    })

    test('should validate request data', async () => {
      const invalidRequests = [
        { messages: [], model: 'gpt-3.5-turbo' }, // Empty messages
        { messages: [{ role: 'invalid', content: 'Hello' }], model: 'gpt-3.5-turbo' }, // Invalid role
        { messages: [{ role: 'user' }], model: 'gpt-3.5-turbo' }, // Missing content
        { messages: [{ role: 'user', content: 'Hello' }] }, // Missing model
        { messages: [{ role: 'user', content: 'Hello' }], model: 'invalid-model' }, // Invalid model
      ]

      for (const requestData of invalidRequests) {
        const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)

        const response = await chatHandler(mockRequest)
        expect(response.status).toBe(400)
      }
    })

    test('should handle streaming requests', async () => {
      const requestData = {
        messages: [{ role: 'user', content: 'Tell me a story' }],
        model: 'gpt-3.5-turbo',
        conversationId: null,
        stream: true,
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify(requestData),
      })

      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)
      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
        messageCount: 5,
        tokenCount: 1000,
      })
      ;(prisma.conversation.create as jest.Mock).mockResolvedValue({
        id: 'conv-123',
        userId: mockUsers.pro.id,
        title: 'Story Time',
        modelId: 'gpt-3.5-turbo',
      })

      // Mock streaming response
      const mockGenerator = async function* () {
        yield 'Once '
        yield 'upon '
        yield 'a '
        yield 'time...'
      }

      mockAiService.streamResponse = jest.fn().mockResolvedValue(mockGenerator())
      mockAiService.estimateTokens = jest.fn().mockReturnValue(10)

      const response = await chatHandler(mockRequest)
      
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe('text/event-stream')
      expect(response.headers.get('cache-control')).toBe('no-cache')
      expect(response.headers.get('connection')).toBe('keep-alive')
    })

    test('should track usage across multiple requests', async () => {
      const userId = mockUsers.pro.id
      let currentUsage = { messageCount: 0, tokenCount: 0 }

      // Mock usage tracking
      ;(prisma.usage.findFirst as jest.Mock).mockImplementation(() => 
        Promise.resolve(currentUsage)
      )
      ;(prisma.usage.update as jest.Mock).mockImplementation(({ data }) => {
        currentUsage.messageCount = data.messageCount
        currentUsage.tokenCount = data.tokenCount
        return Promise.resolve(currentUsage)
      })

      // Make multiple requests
      for (let i = 0; i < 3; i++) {
        const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
          method: 'POST',
          body: JSON.stringify({
            messages: [{ role: 'user', content: `Message ${i + 1}` }],
            model: 'gpt-3.5-turbo',
            conversationId: null,
          }),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)
        ;(prisma.conversation.create as jest.Mock).mockResolvedValue({
          id: `conv-${i}`,
          userId,
          title: `Conversation ${i + 1}`,
          modelId: 'gpt-3.5-turbo',
        })

        mockAiService.generateResponse = jest.fn().mockResolvedValue({
          content: `Response ${i + 1}`,
          tokensUsed: { input: 10, output: 15, total: 25 },
          cost: 0.00005,
        })
        mockAiService.estimateTokens = jest.fn().mockReturnValue(10)

        const response = await chatHandler(mockRequest)
        expect(response.status).toBe(200)
      }

      // Verify cumulative usage
      expect(currentUsage.messageCount).toBe(3)
      expect(currentUsage.tokenCount).toBe(75) // 3 * 25 tokens
    })
  })

  describe('Performance Tests', () => {
    test('should handle concurrent requests', async () => {
      const requests = Array(5).fill(null).map((_, i) => ({
        messages: [{ role: 'user', content: `Concurrent message ${i}` }],
        model: 'gpt-3.5-turbo',
        conversationId: null,
      }))

      const promises = requests.map(async (requestData, i) => {
        const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)
        ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
          messageCount: i,
          tokenCount: i * 100,
        })
        ;(prisma.conversation.create as jest.Mock).mockResolvedValue({
          id: `conv-concurrent-${i}`,
          userId: mockUsers.pro.id,
          title: `Concurrent ${i}`,
          modelId: 'gpt-3.5-turbo',
        })

        mockAiService.generateResponse = jest.fn().mockResolvedValue({
          content: `Concurrent response ${i}`,
          tokensUsed: { input: 10, output: 15, total: 25 },
          cost: 0.00005,
        })
        mockAiService.estimateTokens = jest.fn().mockReturnValue(10)

        return chatHandler(mockRequest)
      })

      const responses = await Promise.all(promises)
      
      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      // Verify all conversations were created
      expect(prisma.conversation.create).toHaveBeenCalledTimes(5)
    })

    test('should handle large message history efficiently', async () => {
      // Create a conversation with 50 messages
      const messages = []
      for (let i = 0; i < 50; i++) {
        messages.push(
          { role: 'user' as const, content: `Question ${i}: What is ${i}+${i}?` },
          { role: 'assistant' as const, content: `Answer ${i}: ${i}+${i} equals ${i * 2}.` }
        )
      }
      messages.push({ role: 'user' as const, content: 'What is 51+51?' })

      const mockRequest = new NextRequest('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages,
          model: 'gpt-3.5-turbo',
          conversationId: 'large-conv',
        }),
      })

      mockGetServerSession.mockResolvedValue(mockSessions.enterprise)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.enterprise)
      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
        messageCount: 100,
        tokenCount: 5000,
      })
      ;(prisma.conversation.findUnique as jest.Mock).mockResolvedValue({
        id: 'large-conv',
        userId: mockUsers.enterprise.id,
        title: 'Large Conversation',
        modelId: 'gpt-3.5-turbo',
      })

      mockAiService.generateResponse = jest.fn().mockResolvedValue({
        content: '51+51 equals 102.',
        tokensUsed: { input: 500, output: 10, total: 510 },
        cost: 0.001,
      })
      mockAiService.estimateTokens = jest.fn().mockReturnValue(5)

      const start = Date.now()
      const response = await chatHandler(mockRequest)
      const duration = Date.now() - start

      expect(response.status).toBe(200)
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })
  })
})