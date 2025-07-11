import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (\!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get conversations with message count and last message
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 50 // Limit to last 50 conversations
    })

    const formattedConversations = conversations.map(conv => ({
      id: conv.id,
      title: conv.title || 'Untitled Chat',
      lastMessage: conv.messages[0]?.content?.substring(0, 60) + (conv.messages[0]?.content?.length > 60 ? '...' : ''),
      updatedAt: conv.updatedAt.toISOString(),
      messageCount: conv._count.messages
    }))

    return NextResponse.json({
      conversations: formattedConversations,
      total: conversations.length
    })

  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversations' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (\!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, model } = await request.json()

    const conversation = await prisma.conversation.create({
      data: {
        title: title || 'New Chat',
        userId: session.user.id,
        model: model || 'gpt-3.5-turbo'
      }
    })

    return NextResponse.json({
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updatedAt.toISOString(),
      messageCount: 0
    })

  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to create conversation' }, 
      { status: 500 }
    )
  }
}
EOF < /dev/null
