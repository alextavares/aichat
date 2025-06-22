import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ message: "Não autorizado" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const userId = session.user.id

    // Get analytics data
    const [
      totalMessages,
      totalConversations,
      userUsageStats,
      recentActivity,
      modelUsage
    ] = await Promise.all([
      // Total messages count
      prisma.message.count({
        where: { conversation: { userId } }
      }),

      // Total conversations count
      prisma.conversation.count({
        where: { userId }
      }),

      // User usage stats (last 30 days)
      prisma.userUsage.findMany({
        where: {
          userId,
          date: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        include: {
          model: true
        },
        orderBy: { date: 'desc' }
      }),

      // Recent conversations
      prisma.conversation.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          createdAt: true,
          modelUsed: true,
          _count: {
            select: { messages: true }
          }
        }
      }),

      // Model usage distribution
      prisma.message.groupBy({
        by: ['modelUsed'],
        where: {
          conversation: { userId },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        _count: {
          modelUsed: true
        },
        _sum: {
          tokensUsed: true
        }
      })
    ])

    // Calculate daily usage for chart
    const dailyUsage = userUsageStats.reduce((acc: Record<string, any>, stat) => {
      const date = stat.date.toISOString().split('T')[0]
      if (!acc[date]) {
        acc[date] = {
          date,
          messages: 0,
          tokens: 0,
          cost: 0
        }
      }
      acc[date].messages += stat.messagesCount
      acc[date].tokens += stat.inputTokensUsed + stat.outputTokensUsed
      acc[date].cost += Number(stat.costIncurred)
      return acc
    }, {} as Record<string, any>)

    const chartData = Object.values(dailyUsage).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    // Calculate total costs
    const totalCost = userUsageStats.reduce((sum: number, stat) => sum + Number(stat.costIncurred), 0)
    const totalTokens = userUsageStats.reduce((sum: number, stat) => sum + stat.inputTokensUsed + stat.outputTokensUsed, 0)

    return new Response(
      JSON.stringify({
        overview: {
          totalMessages,
          totalConversations,
          totalCost,
          totalTokens
        },
        chartData,
        recentActivity,
        modelUsage: modelUsage.map((model: any) => ({
          model: model.modelUsed || 'unknown',
          count: model._count.modelUsed,
          tokens: model._sum.tokensUsed || 0
        }))
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error("Analytics API error:", error)
    return new Response(
      JSON.stringify({ message: "Erro interno do servidor" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}