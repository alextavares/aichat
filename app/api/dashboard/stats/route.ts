import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Get today's usage
    const todayUsage = await prisma.userUsage.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: today
        }
      },
      _sum: {
        messagesCount: true,
        inputTokensUsed: true,
        outputTokensUsed: true,
        costIncurred: true
      }
    })

    // Get this month's usage
    const monthUsage = await prisma.userUsage.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth
        }
      },
      _sum: {
        messagesCount: true,
        inputTokensUsed: true,
        outputTokensUsed: true,
        costIncurred: true
      }
    })

    // Get daily usage for the last 7 days
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const dailyUsage = await prisma.userUsage.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sevenDaysAgo
        }
      },
      orderBy: {
        date: 'asc'
      },
      select: {
        date: true,
        messagesCount: true,
        inputTokensUsed: true,
        outputTokensUsed: true,
        costIncurred: true
      }
    })

    // Get usage by model
    const modelUsage = await prisma.userUsage.groupBy({
      by: ['modelId'],
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth
        }
      },
      _sum: {
        messagesCount: true,
        inputTokensUsed: true,
        outputTokensUsed: true,
        costIncurred: true
      },
      orderBy: {
        _sum: {
          messagesCount: 'desc'
        }
      }
    })

    // Get model names
    const modelNames = await prisma.aIModel.findMany({
      where: {
        id: {
          in: modelUsage.map(usage => usage.modelId)
        }
      },
      select: {
        id: true,
        name: true
      }
    })

    const modelMap = Object.fromEntries(
      modelNames.map(model => [model.id, model.name])
    )

    const response = {
      today: {
        messages: todayUsage._sum.messagesCount || 0,
        tokens: (todayUsage._sum.inputTokensUsed || 0) + (todayUsage._sum.outputTokensUsed || 0),
        cost: Number(todayUsage._sum.costIncurred || 0)
      },
      thisMonth: {
        messages: monthUsage._sum.messagesCount || 0,
        tokens: (monthUsage._sum.inputTokensUsed || 0) + (monthUsage._sum.outputTokensUsed || 0),
        cost: Number(monthUsage._sum.costIncurred || 0)
      },
      dailyUsage: dailyUsage.map(day => ({
        date: day.date.toISOString().split('T')[0],
        messages: day.messagesCount,
        tokens: day.inputTokensUsed + day.outputTokensUsed,
        cost: Number(day.costIncurred)
      })),
      modelUsage: modelUsage.map(usage => ({
        model: modelMap[usage.modelId] || usage.modelId,
        messages: usage._sum.messagesCount || 0,
        tokens: (usage._sum.inputTokensUsed || 0) + (usage._sum.outputTokensUsed || 0),
        cost: Number(usage._sum.costIncurred || 0)
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}