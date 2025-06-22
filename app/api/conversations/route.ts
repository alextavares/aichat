import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        modelUsed: true,
        isArchived: true,
        _count: {
          select: {
            messages: true
          }
        }
      }
    })

    // Formata as conversas para incluir messagesCount
    const formattedConversations = conversations.map(conv => ({
      ...conv,
      messagesCount: conv._count.messages,
      _count: undefined
    }))

    return NextResponse.json(formattedConversations)

  } catch (error) {
    console.error("Conversations API error:", error)
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const { title, modelUsed } = await request.json()

    const conversation = await prisma.conversation.create({
      data: {
        title: title || "Nova Conversa",
        modelUsed: modelUsed || "gpt-3.5-turbo",
        userId: session.user.id,
        isArchived: false
      }
    })

    return NextResponse.json(conversation)

  } catch (error) {
    console.error("Create conversation error:", error)
    return NextResponse.json(
      { message: "Erro ao criar conversa" },
      { status: 500 }
    )
  }
}