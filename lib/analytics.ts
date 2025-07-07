import { z } from 'zod'

export interface UserAnalytics {
  userId: string
  period: {
    start: Date
    end: Date
  }
  usage: {
    totalMessages: number
    totalTokens: number
    totalCost: number
    averageMessagesPerDay: number
    mostUsedModel: string
    peakUsageHour: number
  }
  models: ModelUsage[]
  features: FeatureUsage[]
  trends: UsageTrend[]
}

export interface ModelUsage {
  modelId: string
  modelName: string
  provider: string
  messageCount: number
  tokenCount: number
  cost: number
  averageResponseTime: number
  successRate: number
  lastUsed: Date
}

export interface FeatureUsage {
  feature: string
  usageCount: number
  successRate: number
  averageTime: number
  lastUsed: Date
}

export interface UsageTrend {
  date: Date
  messages: number
  tokens: number
  cost: number
  uniqueModels: number
}

export interface SystemAnalytics {
  totalUsers: number
  activeUsers: {
    daily: number
    weekly: number
    monthly: number
  }
  usage: {
    totalMessages: number
    totalTokens: number
    totalCost: number
    averageMessagesPerUser: number
  }
  models: {
    mostPopular: ModelUsage[]
    fastest: ModelUsage[]
    mostCostEffective: ModelUsage[]
  }
  performance: {
    averageResponseTime: number
    errorRate: number
    uptime: number
  }
  revenue: {
    totalRevenue: number
    mrr: number // Monthly Recurring Revenue
    churnRate: number
    customerLifetimeValue: number
  }
}

const AnalyticsPeriodSchema = z.object({
  start: z.date(),
  end: z.date(),
  granularity: z.enum(['hour', 'day', 'week', 'month']).default('day')
})

const AnalyticsQuerySchema = z.object({
  userId: z.string().uuid().optional(),
  period: AnalyticsPeriodSchema,
  filters: z.object({
    models: z.array(z.string()).optional(),
    features: z.array(z.string()).optional(),
    minCost: z.number().optional(),
    maxCost: z.number().optional()
  }).optional()
})

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>

export class AnalyticsService {
  // User-specific analytics
  static async getUserAnalytics(
    userId: string, 
    period: { start: Date; end: Date }
  ): Promise<UserAnalytics> {
    // This would query the database for user-specific analytics
    // For now, returning mock data structure
    
    return {
      userId,
      period,
      usage: {
        totalMessages: 0,
        totalTokens: 0,
        totalCost: 0,
        averageMessagesPerDay: 0,
        mostUsedModel: '',
        peakUsageHour: 14
      },
      models: [],
      features: [],
      trends: []
    }
  }

  // System-wide analytics
  static async getSystemAnalytics(
    period: { start: Date; end: Date }
  ): Promise<SystemAnalytics> {
    // This would aggregate system-wide metrics
    
    return {
      totalUsers: 0,
      activeUsers: {
        daily: 0,
        weekly: 0,
        monthly: 0
      },
      usage: {
        totalMessages: 0,
        totalTokens: 0,
        totalCost: 0,
        averageMessagesPerUser: 0
      },
      models: {
        mostPopular: [],
        fastest: [],
        mostCostEffective: []
      },
      performance: {
        averageResponseTime: 0,
        errorRate: 0,
        uptime: 99.9
      },
      revenue: {
        totalRevenue: 0,
        mrr: 0,
        churnRate: 0,
        customerLifetimeValue: 0
      }
    }
  }

  // Real-time metrics
  static async getRealTimeMetrics() {
    return {
      activeUsers: 0,
      messagesPerMinute: 0,
      averageResponseTime: 0,
      errorRate: 0,
      queueLength: 0,
      systemHealth: 'healthy' as 'healthy' | 'warning' | 'critical'
    }
  }

  // Usage forecasting
  static async forecastUsage(
    userId: string,
    daysAhead: number = 30
  ): Promise<{
    estimatedMessages: number
    estimatedTokens: number
    estimatedCost: number
    confidence: number
  }> {
    // This would use historical data to predict future usage
    // Simple linear prediction for now
    
    const historicalData = await this.getUserAnalytics(userId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    })

    const dailyAverage = historicalData.usage.averageMessagesPerDay
    
    return {
      estimatedMessages: dailyAverage * daysAhead,
      estimatedTokens: dailyAverage * daysAhead * 100, // Estimate ~100 tokens per message
      estimatedCost: dailyAverage * daysAhead * 0.001, // Estimate ~$0.001 per message
      confidence: 0.7
    }
  }

  // Cost optimization suggestions
  static async getCostOptimizationSuggestions(
    userId: string
  ): Promise<Array<{
    type: 'model_switch' | 'usage_pattern' | 'feature_optimization'
    title: string
    description: string
    potentialSavings: number
    difficulty: 'easy' | 'medium' | 'hard'
  }>> {
    const analytics = await this.getUserAnalytics(userId, {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    })

    const suggestions = []

    // Example suggestions based on usage patterns
    if (analytics.usage.mostUsedModel === 'gpt-4o') {
      suggestions.push({
        type: 'model_switch' as const,
        title: 'Considere usar GPT-4o Mini para tarefas básicas',
        description: 'Você pode economizar até 90% alternando para modelos mais eficientes em tarefas simples',
        potentialSavings: analytics.usage.totalCost * 0.4,
        difficulty: 'easy' as const
      })
    }

    if (analytics.usage.peakUsageHour >= 9 && analytics.usage.peakUsageHour <= 17) {
      suggestions.push({
        type: 'usage_pattern' as const,
        title: 'Use horários de menor demanda',
        description: 'Considere usar a IA em horários alternativos para melhor performance',
        potentialSavings: 0,
        difficulty: 'easy' as const
      })
    }

    return suggestions
  }

  // Model performance comparison
  static async compareModelPerformance(
    modelIds: string[],
    period: { start: Date; end: Date }
  ): Promise<{
    models: Array<{
      id: string
      name: string
      metrics: {
        averageResponseTime: number
        successRate: number
        costPerMessage: number
        userSatisfaction: number
        qualityScore: number
      }
    }>
    recommendation: string
  }> {
    // This would analyze model performance across various metrics
    
    const models = modelIds.map(id => ({
      id,
      name: id, // Would lookup actual name
      metrics: {
        averageResponseTime: Math.random() * 2000 + 500,
        successRate: 0.95 + Math.random() * 0.04,
        costPerMessage: Math.random() * 0.01,
        userSatisfaction: 4 + Math.random(),
        qualityScore: 0.8 + Math.random() * 0.2
      }
    }))

    const bestModel = models.reduce((best, current) => 
      current.metrics.qualityScore > best.metrics.qualityScore ? current : best
    )

    return {
      models,
      recommendation: `Baseado na análise, recomendamos o modelo ${bestModel.name} para melhor custo-benefício`
    }
  }

  // Export analytics data
  static async exportAnalytics(
    query: AnalyticsQuery,
    format: 'csv' | 'json' | 'excel'
  ): Promise<string> {
    // This would generate export files
    
    if (format === 'json') {
      const data = query.userId 
        ? await this.getUserAnalytics(query.userId, query.period)
        : await this.getSystemAnalytics(query.period)
      
      return JSON.stringify(data, null, 2)
    }

    if (format === 'csv') {
      // Convert to CSV format
      return 'Date,Messages,Tokens,Cost\n' +
             '2024-01-01,100,5000,0.50\n' +
             '2024-01-02,120,6000,0.60\n'
    }

    throw new Error(`Format ${format} not implemented`)
  }

  // Custom dashboard metrics
  static async getCustomDashboard(
    userId: string,
    widgets: Array<{
      type: 'usage' | 'cost' | 'models' | 'trends'
      period: 'day' | 'week' | 'month'
      filters?: Record<string, any>
    }>
  ) {
    const dashboard = []

    for (const widget of widgets) {
      const period = this.getPeriodDates(widget.period)
      
      switch (widget.type) {
        case 'usage':
          const usage = await this.getUserAnalytics(userId, period)
          dashboard.push({
            type: 'usage',
            data: usage.usage,
            period: widget.period
          })
          break
          
        case 'cost':
          const costData = await this.getUserAnalytics(userId, period)
          dashboard.push({
            type: 'cost',
            data: {
              total: costData.usage.totalCost,
              trend: costData.trends.map(t => ({ date: t.date, cost: t.cost }))
            },
            period: widget.period
          })
          break
          
        // Add more widget types...
      }
    }

    return dashboard
  }

  private static getPeriodDates(period: 'day' | 'week' | 'month') {
    const end = new Date()
    const start = new Date()
    
    switch (period) {
      case 'day':
        start.setDate(start.getDate() - 1)
        break
      case 'week':
        start.setDate(start.getDate() - 7)
        break
      case 'month':
        start.setMonth(start.getMonth() - 1)
        break
    }
    
    return { start, end }
  }

  // Anomaly detection
  static async detectAnomalies(
    userId: string,
    thresholds: {
      costSpike: number
      usageSpike: number
      errorRate: number
    } = {
      costSpike: 2.0, // 200% increase
      usageSpike: 3.0, // 300% increase
      errorRate: 0.1 // 10% error rate
    }
  ): Promise<Array<{
    type: 'cost' | 'usage' | 'errors'
    severity: 'low' | 'medium' | 'high'
    description: string
    timestamp: Date
    value: number
    threshold: number
  }>> {
    // This would analyze patterns and detect anomalies
    return []
  }
}

export { AnalyticsService, AnalyticsPeriodSchema, AnalyticsQuerySchema }
export type { 
  UserAnalytics, 
  SystemAnalytics, 
  ModelUsage, 
  FeatureUsage, 
  UsageTrend 
}