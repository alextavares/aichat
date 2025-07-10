import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()

    const {
      templateId,
      category,
      userPlan,
      source,
      metadata
    } = body

    // Create analytics record
    const analytics = await prisma.templateAnalytics.create({
      data: {
        templateId,
        userId: session?.user?.id || 'anonymous',
        category,
        userPlan: userPlan || 'FREE',
        source: source || 'marketplace',
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    })

    // Update template usage count
    await prisma.template.update({
      where: { id: templateId },
      data: {
        usageCount: {
          increment: 1
        },
        lastUsedAt: new Date()
      }
    }).catch(() => {
      // Template might not exist in DB yet, ignore error
    })

    return NextResponse.json({ success: true, id: analytics.id })
  } catch (error) {
    console.error('Analytics error:', error)
    // Don't return error to client - analytics shouldn't break the app
    return NextResponse.json({ success: true })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || '7d'
    
    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case '24h':
        startDate.setHours(now.getHours() - 24)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Fetch analytics data
    const analytics = await prisma.templateAnalytics.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Aggregate data
    const templateUsage = analytics.reduce((acc, record) => {
      acc[record.templateId] = (acc[record.templateId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const categoryUsage = analytics.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const planUsage = analytics.reduce((acc, record) => {
      acc[record.userPlan] = (acc[record.userPlan] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get trending templates (most used in last 24h)
    const last24h = new Date()
    last24h.setHours(now.getHours() - 24)
    
    const trendingAnalytics = analytics.filter(a => a.createdAt > last24h)
    const trendingTemplates = Object.entries(
      trendingAnalytics.reduce((acc, record) => {
        acc[record.templateId] = (acc[record.templateId] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([templateId, count]) => ({ templateId, count }))

    return NextResponse.json({
      summary: {
        totalClicks: analytics.length,
        uniqueTemplates: Object.keys(templateUsage).length,
        period
      },
      templateUsage,
      categoryUsage,
      planUsage,
      trendingTemplates,
      recentActivity: analytics.slice(0, 20).map(a => ({
        templateId: a.templateId,
        category: a.category,
        timestamp: a.createdAt,
        source: a.source
      }))
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}