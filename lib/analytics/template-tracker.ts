"use client"

interface TemplateUsage {
  templateId: string
  userId?: string
  timestamp: Date
  category: string
  userPlan: string
  source: 'marketplace' | 'direct' | 'search'
  metadata?: {
    searchQuery?: string
    position?: number
    filters?: string[]
  }
}

interface TemplateAnalytics {
  totalClicks: number
  uniqueUsers: number
  clicksByPlan: Record<string, number>
  clicksByCategory: Record<string, number>
  averagePosition: number
  conversionRate: number
  lastUsed: Date
  trending: boolean
}

class TemplateTracker {
  private static instance: TemplateTracker
  private usageData: TemplateUsage[] = []
  private analytics: Map<string, TemplateAnalytics> = new Map()

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): TemplateTracker {
    if (!TemplateTracker.instance) {
      TemplateTracker.instance = new TemplateTracker()
    }
    return TemplateTracker.instance
  }

  // Track template usage
  trackTemplateClick(
    templateId: string, 
    category: string,
    userPlan: string = 'FREE',
    source: 'marketplace' | 'direct' | 'search' = 'marketplace',
    metadata?: TemplateUsage['metadata']
  ) {
    const usage: TemplateUsage = {
      templateId,
      timestamp: new Date(),
      category,
      userPlan,
      source,
      metadata
    }

    this.usageData.push(usage)
    this.updateAnalytics(templateId, usage)
    this.saveToStorage()

    // Send to backend if available
    this.sendToBackend(usage)
  }

  // Get analytics for a specific template
  getTemplateAnalytics(templateId: string): TemplateAnalytics | null {
    return this.analytics.get(templateId) || null
  }

  // Get popular templates
  getPopularTemplates(limit: number = 10): Array<{templateId: string, analytics: TemplateAnalytics}> {
    return Array.from(this.analytics.entries())
      .map(([templateId, analytics]) => ({ templateId, analytics }))
      .sort((a, b) => b.analytics.totalClicks - a.analytics.totalClicks)
      .slice(0, limit)
  }

  // Get trending templates (high recent usage)
  getTrendingTemplates(limit: number = 5): Array<{templateId: string, analytics: TemplateAnalytics}> {
    const now = new Date()
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    return Array.from(this.analytics.entries())
      .map(([templateId, analytics]) => {
        const recentUsage = this.usageData.filter(
          usage => usage.templateId === templateId && usage.timestamp > last24Hours
        ).length

        return { 
          templateId, 
          analytics: { ...analytics, trending: recentUsage > 0 },
          recentUsage 
        }
      })
      .sort((a, b) => b.recentUsage - a.recentUsage)
      .slice(0, limit)
  }

  // Get usage by category
  getCategoryAnalytics(): Record<string, number> {
    const categoryUsage: Record<string, number> = {}
    
    this.usageData.forEach(usage => {
      categoryUsage[usage.category] = (categoryUsage[usage.category] || 0) + 1
    })

    return categoryUsage
  }

  // Get usage by plan
  getPlanAnalytics(): Record<string, number> {
    const planUsage: Record<string, number> = {}
    
    this.usageData.forEach(usage => {
      planUsage[usage.userPlan] = (planUsage[usage.userPlan] || 0) + 1
    })

    return planUsage
  }

  // Get search analytics
  getSearchAnalytics(): Array<{query: string, count: number}> {
    const searchQueries: Record<string, number> = {}
    
    this.usageData
      .filter(usage => usage.source === 'search' && usage.metadata?.searchQuery)
      .forEach(usage => {
        const query = usage.metadata!.searchQuery!.toLowerCase()
        searchQueries[query] = (searchQueries[query] || 0) + 1
      })

    return Object.entries(searchQueries)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }

  // Update analytics for a template
  private updateAnalytics(templateId: string, usage: TemplateUsage) {
    const existing = this.analytics.get(templateId) || {
      totalClicks: 0,
      uniqueUsers: 0,
      clicksByPlan: {},
      clicksByCategory: {},
      averagePosition: 0,
      conversionRate: 0,
      lastUsed: new Date(),
      trending: false
    }

    existing.totalClicks++
    existing.clicksByPlan[usage.userPlan] = (existing.clicksByPlan[usage.userPlan] || 0) + 1
    existing.clicksByCategory[usage.category] = (existing.clicksByCategory[usage.category] || 0) + 1
    existing.lastUsed = usage.timestamp

    // Calculate average position for marketplace clicks
    if (usage.metadata?.position) {
      const positions = this.usageData
        .filter(u => u.templateId === templateId && u.metadata?.position)
        .map(u => u.metadata!.position!)
      
      existing.averagePosition = positions.reduce((sum, pos) => sum + pos, 0) / positions.length
    }

    this.analytics.set(templateId, existing)
  }

  // Save to localStorage
  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('template-usage', JSON.stringify(this.usageData.slice(-1000))) // Keep last 1000
        localStorage.setItem('template-analytics', JSON.stringify(Array.from(this.analytics.entries())))
      } catch (error) {
        console.warn('Failed to save analytics to localStorage:', error)
      }
    }
  }

  // Load from localStorage
  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const usageData = localStorage.getItem('template-usage')
        const analyticsData = localStorage.getItem('template-analytics')

        if (usageData) {
          this.usageData = JSON.parse(usageData).map((usage: any) => ({
            ...usage,
            timestamp: new Date(usage.timestamp)
          }))
        }

        if (analyticsData) {
          this.analytics = new Map(JSON.parse(analyticsData))
        }
      } catch (error) {
        console.warn('Failed to load analytics from localStorage:', error)
      }
    }
  }

  // Send to backend (if endpoint exists)
  private async sendToBackend(usage: TemplateUsage) {
    if (typeof window !== 'undefined') {
      try {
        await fetch('/api/analytics/template-usage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(usage)
        })
      } catch (error) {
        // Silently fail - analytics shouldn't break the app
        console.debug('Analytics endpoint not available:', error)
      }
    }
  }

  // Export data for analysis
  exportData() {
    return {
      usage: this.usageData,
      analytics: Object.fromEntries(this.analytics),
      summary: {
        totalClicks: this.usageData.length,
        uniqueTemplates: this.analytics.size,
        categoryBreakdown: this.getCategoryAnalytics(),
        planBreakdown: this.getPlanAnalytics(),
        topSearches: this.getSearchAnalytics().slice(0, 10)
      }
    }
  }

  // Clear old data (privacy compliance)
  clearOldData(daysToKeep: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

    this.usageData = this.usageData.filter(usage => usage.timestamp > cutoffDate)
    this.saveToStorage()
  }
}

export const templateTracker = TemplateTracker.getInstance()
export type { TemplateUsage, TemplateAnalytics }