import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Delete all user conversations (messages will cascade delete)
    await prisma.conversation.deleteMany({
      where: { userId: session.user.id },
    })

    // Delete user templates (keep public templates)
    await prisma.promptTemplate.deleteMany({
      where: {
        createdBy: session.user.id,
        isPublic: false,
      },
    })

    // Reset usage statistics
    await prisma.userUsage.deleteMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json({
      message: 'Dados limpos com sucesso',
      deleted: {
        conversations: true,
        privateTemplates: true,
        usageStatistics: true,
      },
    })
  } catch (error) {
    console.error('Clear data error:', error)
    return NextResponse.json(
      { error: 'Erro ao limpar dados' },
      { status: 500 }
    )
  }
}