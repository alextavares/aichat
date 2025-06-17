import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

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
        usage: {
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
    const todayMessages = user.usage.reduce((total, usage) => 
      total + usage.messagesCount, 0
    )

    const dailyLimit = planLimits?.dailyMessagesLimit ?? 10

    return NextResponse.json({
      dailyMessages: todayMessages,
      dailyLimit: dailyLimit,
      planType: user.planType,
      remainingMessages: dailyLimit === null ? null : Math.max(0, dailyLimit - todayMessages)
    })

  } catch (error) {
    console.error("Usage API error:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}