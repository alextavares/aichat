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

    // Fetch all user data
    const [
      user,
      conversations,
      templates,
      usage,
      subscriptions,
      payments,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          planType: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.conversation.findMany({
        where: { userId: session.user.id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.promptTemplate.findMany({
        where: { createdBy: session.user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userUsage.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
      }),
      prisma.subscription.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      conversations,
      templates,
      usage,
      subscriptions,
      payments,
      statistics: {
        totalConversations: conversations.length,
        totalMessages: conversations.reduce((acc, conv) => acc + conv.messages.length, 0),
        totalTemplates: templates.length,
        totalTokensUsed: usage.reduce((acc, u) => acc + u.inputTokensUsed + u.outputTokensUsed, 0),
      },
    }

    // Return as JSON download
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="innerai-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    })
  } catch (error) {
    console.error('Export data error:', error)
    return NextResponse.json(
      { error: 'Erro ao exportar dados' },
      { status: 500 }
    )
  }
}