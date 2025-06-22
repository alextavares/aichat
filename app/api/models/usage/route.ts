import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Get usage by model for the current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const usage = await prisma.userUsage.groupBy({
      by: ['modelId'],
      where: {
        userId: session.user.id,
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        messagesCount: true,
        inputTokensUsed: true,
        outputTokensUsed: true,
        costIncurred: true,
      },
    })

    const formattedUsage = usage.map(u => ({
      modelId: u.modelId,
      messagesCount: u._sum.messagesCount || 0,
      tokensUsed: (u._sum.inputTokensUsed || 0) + (u._sum.outputTokensUsed || 0),
      cost: Number(u._sum.costIncurred || 0),
    }))

    return NextResponse.json({ usage: formattedUsage })
  } catch (error) {
    console.error('Get model usage error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar uso dos modelos' },
      { status: 500 }
    )
  }
}