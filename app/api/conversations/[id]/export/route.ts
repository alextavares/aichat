import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          },
          select: {
            role: true,
            content: true,
            createdAt: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { message: 'Conversa não encontrada' },
        { status: 404 }
      )
    }

    const exportData = {
      title: conversation.title,
      model: conversation.modelUsed,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      user: conversation.user.name || conversation.user.email,
      messages: conversation.messages
    }

    if (format === 'json') {
      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="${conversation.title || 'conversa'}-${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    } else if (format === 'md' || format === 'markdown') {
      let markdown = `# ${exportData.title}\n\n`
      markdown += `**Modelo:** ${exportData.model}\n`
      markdown += `**Data:** ${new Date(exportData.createdAt).toLocaleDateString('pt-BR')}\n`
      markdown += `**Usuário:** ${exportData.user}\n\n`
      markdown += `---\n\n`

      exportData.messages.forEach((msg) => {
        const timestamp = new Date(msg.createdAt).toLocaleTimeString('pt-BR')
        if (msg.role === 'user') {
          markdown += `### 👤 Usuário (${timestamp})\n\n${msg.content}\n\n`
        } else {
          markdown += `### 🤖 Assistente (${timestamp})\n\n${msg.content}\n\n`
        }
      })

      return new NextResponse(markdown, {
        headers: {
          'Content-Type': 'text/markdown',
          'Content-Disposition': `attachment; filename="${conversation.title || 'conversa'}-${new Date().toISOString().split('T')[0]}.md"`
        }
      })
    } else if (format === 'txt') {
      let text = `${exportData.title}\n`
      text += `${'='.repeat(exportData.title.length)}\n\n`
      text += `Modelo: ${exportData.model}\n`
      text += `Data: ${new Date(exportData.createdAt).toLocaleDateString('pt-BR')}\n`
      text += `Usuário: ${exportData.user}\n\n`
      text += `${'-'.repeat(50)}\n\n`

      exportData.messages.forEach((msg) => {
        const timestamp = new Date(msg.createdAt).toLocaleTimeString('pt-BR')
        if (msg.role === 'user') {
          text += `[USUÁRIO - ${timestamp}]\n${msg.content}\n\n`
        } else {
          text += `[ASSISTENTE - ${timestamp}]\n${msg.content}\n\n`
        }
      })

      return new NextResponse(text, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${conversation.title || 'conversa'}-${new Date().toISOString().split('T')[0]}.txt"`
        }
      })
    }

    return NextResponse.json(
      { message: 'Formato não suportado. Use: json, md, markdown ou txt' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Export conversation error:', error)
    return NextResponse.json(
      { message: 'Erro ao exportar conversa' },
      { status: 500 }
    )
  }
}