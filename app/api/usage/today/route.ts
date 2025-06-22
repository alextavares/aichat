import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    // Get user with plan info
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userUsage: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Get plan limits
    const planLimits = await prisma.planLimit.findUnique({
      where: { planType: user.planType }
    })

    // Calculate today's usage
    const todayMessages = user.userUsage.reduce((total, usage) => 
      total + usage.messagesCount, 0
    )

    const dailyLimit = planLimits?.dailyMessagesLimit ?? 10

    // Get monthly token usage
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    const monthlyUsage = await prisma.userUsage.aggregate({
      where: {
        userId: session.user.id,
        date: {
          gte: startOfMonth,
          lt: new Date()
        }
      },
      _sum: {
        inputTokensUsed: true,
        outputTokensUsed: true
      }
    })

    const monthlyTokensUsed = (monthlyUsage._sum?.inputTokensUsed || 0) + (monthlyUsage._sum?.outputTokensUsed || 0)
    const monthlyTokenLimit = planLimits?.monthlyTokensLimit

    return NextResponse.json({
      dailyMessages: {
        used: todayMessages,
        limit: dailyLimit === -1 ? null : dailyLimit
      },
      monthlyTokens: {
        used: monthlyTokensUsed,
        limit: monthlyTokenLimit === -1 ? null : monthlyTokenLimit
      },
      planType: user.planType,
      remainingMessages: dailyLimit === null || dailyLimit === -1 ? null : Math.max(0, dailyLimit - todayMessages)
    })

  } catch (error) {
    console.error("Usage API error:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}