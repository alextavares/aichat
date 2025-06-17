import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    // Verificar se a conversa pertence ao usuário
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversa não encontrada" },
        { status: 404 }
      )
    }

    // Deletar a conversa (mensagens serão deletadas em cascata)
    await prisma.conversation.delete({
      where: {
        id: params.id
      }
    })

    return NextResponse.json({ message: "Conversa deletada com sucesso" })

  } catch (error) {
    console.error("Delete conversation error:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (!conversation) {
      return NextResponse.json(
        { message: "Conversa não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json({ conversation })

  } catch (error) {
    console.error("Get conversation error:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}