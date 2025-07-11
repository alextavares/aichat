import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (\!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id

    // Check if conversation belongs to user
    const conversation = await prisma.conversation.findUnique({
      where: { 
        id: conversationId,
        userId: session.user.id 
      }
    })

    if (\!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Delete conversation and all its messages (cascade)
    await prisma.conversation.delete({
      where: { id: conversationId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting conversation:', error)
    return NextResponse.json(
      { error: 'Failed to delete conversation' }, 
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (\!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = params.id
    const { title } = await request.json()

    // Check if conversation belongs to user
    const conversation = await prisma.conversation.findUnique({
      where: { 
        id: conversationId,
        userId: session.user.id 
      }
    })

    if (\!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Update conversation title
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { title: title || 'Untitled Chat' }
    })

    return NextResponse.json({
      id: updatedConversation.id,
      title: updatedConversation.title,
      updatedAt: updatedConversation.updatedAt.toISOString()
    })

  } catch (error) {
    console.error('Error updating conversation:', error)
    return NextResponse.json(
      { error: 'Failed to update conversation' }, 
      { status: 500 }
    )
  }
}
EOF < /dev/null
