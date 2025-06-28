import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { mockUsers, mockSessions } from '../fixtures/auth.fixtures'
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns'

// Import route handlers
import { GET as usageStatsHandler } from '@/app/api/usage/stats/route'
import { GET as todayUsageHandler } from '@/app/api/usage/today/route'
import { GET as analyticsOverviewHandler } from '@/app/api/analytics/overview/route'
import { GET as dashboardStatsHandler } from '@/app/api/dashboard/stats/route'

// Mock external dependencies
jest.mock('next-auth')
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    usage: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    message: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    conversation: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    payment: {
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
  },
}))

describe('Usage & Analytics Integration Tests', () => {
  const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('GET /api/usage/stats', () => {
    test('should return usage statistics for authenticated user', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/usage/stats')

      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)

      // Mock usage data
      const today = new Date()
      const mockUsageData = []
      for (let i = 0; i < 30; i++) {
        const date = subDays(today, i)
        mockUsageData.push({
          id: `usage-${i}`,
          userId: mockUsers.pro.id,
          date,
          messageCount: Math.floor(Math.random() * 30) + 10,
          tokenCount: Math.floor(Math.random() * 5000) + 1000,
          cost: Math.random() * 2,
        })
      }

      ;(prisma.usage.findMany as jest.Mock).mockResolvedValue(mockUsageData)
      
      // Mock aggregations
      ;(prisma.usage.aggregate as jest.Mock).mockResolvedValue({
        _sum: {
          messageCount: 450,
          tokenCount: 75000,
          cost: 35.50,
        },
      })

      const response = await usageStatsHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        daily: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            messages: expect.any(Number),
            tokens: expect.any(Number),
            cost: expect.any(Number),
          }),
        ]),
        monthly: {
          totalMessages: 450,
          totalTokens: 75000,
          totalCost: 35.50,
          averageMessagesPerDay: 15,
          averageTokensPerDay: 2500,
        },
        limits: {
          plan: 'PRO',
          dailyMessages: 50,
          dailyTokens: 100000,
          monthlyMessages: 1500,
          monthlyTokens: 3000000,
        },
      })
    })

    test('should handle date range parameters', async () => {
      const mockRequest = new NextRequest(
        'http://localhost:3000/api/usage/stats?startDate=2024-01-01&endDate=2024-01-31'
      )

      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)
      ;(prisma.usage.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.usage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { messageCount: 0, tokenCount: 0, cost: 0 },
      })

      const response = await usageStatsHandler(mockRequest)

      expect(response.status).toBe(200)
      expect(prisma.usage.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUsers.pro.id,
          date: {
            gte: new Date('2024-01-01'),
            lte: new Date('2024-01-31'),
          },
        },
        orderBy: { date: 'asc' },
      })
    })

    test('should return empty stats for new users', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/usage/stats')

      mockGetServerSession.mockResolvedValue(mockSessions.basic)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)
      ;(prisma.usage.findMany as jest.Mock).mockResolvedValue([])
      ;(prisma.usage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { messageCount: null, tokenCount: null, cost: null },
      })

      const response = await usageStatsHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.monthly.totalMessages).toBe(0)
      expect(data.monthly.totalTokens).toBe(0)
      expect(data.monthly.totalCost).toBe(0)
    })
  })

  describe('GET /api/usage/today', () => {
    test('should return today\'s usage', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/usage/today')

      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)

      const today = new Date()
      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
        id: 'today-usage',
        userId: mockUsers.pro.id,
        date: today,
        messageCount: 15,
        tokenCount: 3500,
        cost: 1.25,
      })

      const response = await todayUsageHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        messages: 15,
        tokens: 3500,
        cost: 1.25,
        limits: {
          dailyMessages: 50,
          dailyTokens: 100000,
        },
        percentages: {
          messages: 30, // 15/50 * 100
          tokens: 3.5, // 3500/100000 * 100
        },
      })

      expect(prisma.usage.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUsers.pro.id,
          date: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
        },
      })
    })

    test('should show usage alerts when approaching limits', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/usage/today')

      mockGetServerSession.mockResolvedValue(mockSessions.basic)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)

      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
        messageCount: 9, // 90% of free plan limit
        tokenCount: 9500, // 95% of free plan limit
        cost: 0,
      })

      const response = await todayUsageHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.alerts).toEqual([
        {
          type: 'warning',
          message: 'Você está próximo do limite diário de mensagens (90%)',
        },
        {
          type: 'danger',
          message: 'Você está muito próximo do limite diário de tokens (95%)',
        },
      ])
    })
  })

  describe('GET /api/analytics/overview', () => {
    test('should return comprehensive analytics overview', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/analytics/overview')

      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)

      // Mock various analytics data
      ;(prisma.message.count as jest.Mock).mockResolvedValue(250)
      ;(prisma.conversation.count as jest.Mock).mockResolvedValue(45)
      
      ;(prisma.message.groupBy as jest.Mock).mockResolvedValue([
        { modelId: 'gpt-3.5-turbo', _count: { id: 150 } },
        { modelId: 'gpt-4', _count: { id: 75 } },
        { modelId: 'claude-3-sonnet', _count: { id: 25 } },
      ])

      ;(prisma.usage.findMany as jest.Mock).mockResolvedValue([
        { date: new Date(), tokenCount: 5000, cost: 2.5 },
        { date: subDays(new Date(), 1), tokenCount: 4500, cost: 2.2 },
        { date: subDays(new Date(), 2), tokenCount: 4800, cost: 2.4 },
      ])

      ;(prisma.conversation.findMany as jest.Mock).mockResolvedValue([
        { 
          title: 'Project Planning', 
          messageCount: 25,
          lastMessageAt: new Date(),
          modelId: 'gpt-4',
        },
        { 
          title: 'Code Review', 
          messageCount: 18,
          lastMessageAt: subDays(new Date(), 1),
          modelId: 'gpt-3.5-turbo',
        },
      ])

      const response = await analyticsOverviewHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        summary: {
          totalMessages: 250,
          totalConversations: 45,
          averageMessagesPerConversation: expect.any(Number),
          mostUsedModel: 'gpt-3.5-turbo',
        },
        modelUsage: expect.arrayContaining([
          { model: 'gpt-3.5-turbo', count: 150, percentage: 60 },
          { model: 'gpt-4', count: 75, percentage: 30 },
          { model: 'claude-3-sonnet', count: 25, percentage: 10 },
        ]),
        costTrends: expect.arrayContaining([
          expect.objectContaining({
            date: expect.any(String),
            cost: expect.any(Number),
            tokens: expect.any(Number),
          }),
        ]),
        topConversations: expect.arrayContaining([
          expect.objectContaining({
            title: 'Project Planning',
            messageCount: 25,
            lastActive: expect.any(String),
            model: 'gpt-4',
          }),
        ]),
      })
    })

    test('should calculate cost projections', async () => {
      const mockRequest = new NextRequest(
        'http://localhost:3000/api/analytics/overview?includeProjections=true'
      )

      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)

      // Mock 7 days of usage data
      const usageData = []
      for (let i = 0; i < 7; i++) {
        usageData.push({
          date: subDays(new Date(), i),
          cost: 2 + Math.random(), // $2-3 per day
          tokenCount: 4000 + Math.floor(Math.random() * 2000),
        })
      }

      ;(prisma.usage.findMany as jest.Mock).mockResolvedValue(usageData)
      ;(prisma.message.count as jest.Mock).mockResolvedValue(100)
      ;(prisma.conversation.count as jest.Mock).mockResolvedValue(20)
      ;(prisma.message.groupBy as jest.Mock).mockResolvedValue([])

      const response = await analyticsOverviewHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.projections).toEqual({
        dailyAverage: expect.any(Number),
        weeklyEstimate: expect.any(Number),
        monthlyEstimate: expect.any(Number),
        recommendation: expect.any(String),
      })

      // Verify projection calculations
      const avgDailyCost = usageData.reduce((sum, d) => sum + d.cost, 0) / 7
      expect(data.projections.dailyAverage).toBeCloseTo(avgDailyCost, 2)
      expect(data.projections.monthlyEstimate).toBeCloseTo(avgDailyCost * 30, 2)
    })
  })

  describe('GET /api/dashboard/stats', () => {
    test('should return dashboard statistics', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/dashboard/stats')

      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUsers.pro,
        createdAt: subDays(new Date(), 30),
      })

      // Mock current month usage
      ;(prisma.usage.aggregate as jest.Mock).mockResolvedValue({
        _sum: {
          messageCount: 450,
          tokenCount: 85000,
          cost: 42.50,
        },
      })

      // Mock today's usage
      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
        messageCount: 25,
        tokenCount: 4500,
        cost: 2.25,
      })

      // Mock conversation count
      ;(prisma.conversation.count as jest.Mock).mockResolvedValue(35)

      // Mock recent activity
      ;(prisma.message.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'msg-1',
          content: 'How do I implement authentication?',
          role: 'user',
          createdAt: new Date(),
          conversation: { title: 'Auth Implementation' },
        },
        {
          id: 'msg-2',
          content: 'To implement authentication...',
          role: 'assistant',
          createdAt: new Date(),
          conversation: { title: 'Auth Implementation' },
        },
      ])

      const response = await dashboardStatsHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data).toEqual({
        user: {
          name: mockUsers.pro.name,
          email: mockUsers.pro.email,
          plan: 'PRO',
          memberSince: expect.any(String),
          daysActive: 30,
        },
        usage: {
          today: {
            messages: 25,
            tokens: 4500,
            cost: 2.25,
            percentOfDailyLimit: {
              messages: 50, // 25/50
              tokens: 4.5, // 4500/100000
            },
          },
          month: {
            messages: 450,
            tokens: 85000,
            cost: 42.50,
            percentOfMonthlyLimit: {
              messages: 30, // 450/1500
              tokens: 2.83, // 85000/3000000
            },
          },
        },
        activity: {
          totalConversations: 35,
          recentMessages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.any(String),
              role: expect.any(String),
              conversationTitle: expect.any(String),
              timestamp: expect.any(String),
            }),
          ]),
        },
        subscription: {
          status: 'active',
          plan: 'PRO',
          renewalDate: expect.any(String),
          features: expect.arrayContaining([
            '50 mensagens por dia',
            '100.000 tokens por dia',
            'Acesso a modelos avançados',
          ]),
        },
      })
    })

    test('should show upgrade prompts for free users', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/dashboard/stats')

      mockGetServerSession.mockResolvedValue(mockSessions.basic)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)

      // Mock usage near limits
      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue({
        messageCount: 8, // 80% of free limit
        tokenCount: 8000, // 80% of free limit
        cost: 0,
      })

      ;(prisma.usage.aggregate as jest.Mock).mockResolvedValue({
        _sum: { messageCount: 200, tokenCount: 150000, cost: 0 },
      })

      ;(prisma.conversation.count as jest.Mock).mockResolvedValue(10)
      ;(prisma.message.findMany as jest.Mock).mockResolvedValue([])

      const response = await dashboardStatsHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.upgradePrompt).toEqual({
        show: true,
        message: 'Você está usando 80% do seu limite diário. Faça upgrade para o plano Pro!',
        benefits: [
          '5x mais mensagens por dia',
          '10x mais tokens',
          'Acesso a modelos avançados como GPT-4',
        ],
      })
    })
  })

  describe('Usage Tracking Consistency', () => {
    test('should maintain consistent usage tracking across endpoints', async () => {
      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro)

      const mockTodayUsage = {
        messageCount: 20,
        tokenCount: 5000,
        cost: 2.5,
      }

      ;(prisma.usage.findFirst as jest.Mock).mockResolvedValue(mockTodayUsage)
      ;(prisma.usage.findMany as jest.Mock).mockResolvedValue([
        { ...mockTodayUsage, date: new Date() },
      ])
      ;(prisma.usage.aggregate as jest.Mock).mockResolvedValue({
        _sum: mockTodayUsage,
      })

      // Get today's usage
      const todayRequest = new NextRequest('http://localhost:3000/api/usage/today')
      const todayResponse = await todayUsageHandler(todayRequest)
      const todayData = await todayResponse.json()

      // Get stats (which includes today)
      const statsRequest = new NextRequest('http://localhost:3000/api/usage/stats')
      const statsResponse = await usageStatsHandler(statsRequest)
      const statsData = await statsResponse.json()

      // Verify consistency
      expect(todayData.messages).toBe(mockTodayUsage.messageCount)
      expect(todayData.tokens).toBe(mockTodayUsage.tokenCount)
      expect(todayData.cost).toBe(mockTodayUsage.cost)

      const todayInStats = statsData.daily.find((d: any) => 
        new Date(d.date).toDateString() === new Date().toDateString()
      )
      expect(todayInStats.messages).toBe(mockTodayUsage.messageCount)
      expect(todayInStats.tokens).toBe(mockTodayUsage.tokenCount)
      expect(todayInStats.cost).toBe(mockTodayUsage.cost)
    })
  })

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/usage/stats')

      mockGetServerSession.mockResolvedValue(mockSessions.pro)
      ;(prisma.user.findUnique as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      )

      const response = await usageStatsHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Erro ao buscar estatísticas de uso')
    })

    test('should handle missing session', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/usage/stats')

      mockGetServerSession.mockResolvedValue(null)

      const response = await usageStatsHandler(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Não autorizado')
    })
  })
})