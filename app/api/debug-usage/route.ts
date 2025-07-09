import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkUsageLimits, getUserUsageStats, PLAN_LIMITS } from "@/lib/usage-limits"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Buscar todos os registros de uso
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const allUsage = await prisma.userUsage.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Testar checkUsageLimits para diferentes modelos
    const modelTests = {}
    const testModels = [
      'gpt-4o-mini',
      'gpt-4o',
      'claude-3.5-sonnet',
      'claude-3.5-haiku'
    ]

    for (const model of testModels) {
      modelTests[model] = await checkUsageLimits(user.id, model)
    }

    // Obter estatísticas
    const stats = await getUserUsageStats(user.id)

    // Limites do plano
    const planLimits = PLAN_LIMITS[user.planType]

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        planType: user.planType
      },
      planLimits,
      usageRecords: allUsage,
      modelTests,
      stats,
      debug: {
        totalRecords: allUsage.length,
        uniqueModels: [...new Set(allUsage.map(u => u.modelId))],
        advancedModels: planLimits.modelsAllowed.advanced,
        fastModels: planLimits.modelsAllowed.fast
      }
    })

  } catch (error: any) {
    console.error("[Debug Usage API] Error:", error)
    return NextResponse.json(
      { 
        message: "Erro ao buscar dados de uso",
        error: error.message
      },
      { status: 500 }
    )
  }
}