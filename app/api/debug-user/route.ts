import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        planType: true,
        createdAt: true,
      }
    })

    const userUsageCount = await prisma.userUsage.count({
      where: { userId: session.user.id }
    })

    return NextResponse.json({
      user,
      session: {
        userId: session.user.id,
        email: session.user.email
      },
      userUsageRecords: userUsageCount
    })
  } catch (error) {
    console.error('[Debug User] Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}