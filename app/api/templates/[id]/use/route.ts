import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Incrementa o contador de uso do template
    const template = await prisma.promptTemplate.update({
      where: { id },
      data: {
        usageCount: {
          increment: 1
        }
      },
      select: {
        id: true,
        name: true,
        isPublic: true,
        createdBy: true
      }
    })

    // Verifica se o usuário tem permissão para usar o template
    if (!template.isPublic && template.createdBy !== session.user.id) {
      // Reverte o incremento
      await prisma.promptTemplate.update({
        where: { id },
        data: {
          usageCount: {
            decrement: 1
          }
        }
      })
      
      return NextResponse.json(
        { error: 'Sem permissão para usar este template' },
        { status: 403 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking template usage:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar uso do template' },
      { status: 500 }
    )
  }
}