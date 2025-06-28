import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateKnowledgeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  description: z.string().optional(),
  content: z.string().min(1, 'Conteúdo é obrigatório').optional(),
  metadata: z.record(z.any()).optional(),
  isActive: z.boolean().optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const knowledge = await prisma.knowledgeBase.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        content: true,
        fileSize: true,
        mimeType: true,
        originalName: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!knowledge) {
      return NextResponse.json({ error: 'Knowledge not found' }, { status: 404 })
    }

    return NextResponse.json({ knowledge })
  } catch (error) {
    console.error('Error fetching knowledge:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = updateKnowledgeSchema.parse(body)

    const knowledge = await prisma.knowledgeBase.updateMany({
      where: {
        id: id,
        userId: user.id,
      },
      data: validatedData
    })

    if (knowledge.count === 0) {
      return NextResponse.json({ error: 'Knowledge not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating knowledge:', error)
    return NextResponse.json(
      { error: 'Failed to update knowledge' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Soft delete
    const knowledge = await prisma.knowledgeBase.updateMany({
      where: {
        id: id,
        userId: user.id,
      },
      data: {
        isActive: false
      }
    })

    if (knowledge.count === 0) {
      return NextResponse.json({ error: 'Knowledge not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting knowledge:', error)
    return NextResponse.json(
      { error: 'Failed to delete knowledge' },
      { status: 500 }
    )
  }
}