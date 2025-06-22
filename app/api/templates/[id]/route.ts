import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
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

    const template = await prisma.promptTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        templateContent: true,
        isPublic: true,
        usageCount: true,
        createdAt: true,
        createdBy: true,
      }
    })

    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      )
    }

    // Verifica se o usuário tem permissão para ver o template
    if (!template.isPublic && template.createdBy !== session.user.id) {
      return NextResponse.json(
        { error: 'Sem permissão para acessar este template' },
        { status: 403 }
      )
    }

    return NextResponse.json(template)
  } catch (error) {
    console.error('Error fetching template:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar template' },
      { status: 500 }
    )
  }
}