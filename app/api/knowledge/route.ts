import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
// Lazy import pdf-parse to avoid build-time issues
// import pdfParse from 'pdf-parse'

const createKnowledgeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  type: z.enum(['DOCUMENT', 'WEBPAGE', 'TEXT', 'FAQ']),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  metadata: z.record(z.any()).optional(),
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  originalName: z.string().optional(),
})

async function extractTextFromFile(content: string, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      // Dynamically import pdf-parse to avoid build-time issues
      const pdfParse = (await import('pdf-parse')).default
      
      // Remove data URL prefix if present
      const base64Data = content.includes(',') ? content.split(',')[1] : content
      const buffer = Buffer.from(base64Data, 'base64')
      
      const pdfData = await pdfParse(buffer)
      return pdfData.text || 'Não foi possível extrair texto do PDF'
    } else if (mimeType?.startsWith('text/') || 
               mimeType === 'application/json' ||
               mimeType === 'text/markdown') {
      // For text files, decode base64 if needed
      if (content.includes(',')) {
        const base64Data = content.split(',')[1]
        return Buffer.from(base64Data, 'base64').toString('utf-8')
      }
      return content
    } else {
      return `Arquivo ${mimeType}: Conteúdo binário não processado diretamente`
    }
  } catch (error) {
    console.error('Error extracting text from file:', error)
    return `Erro ao processar arquivo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
  }
}

export async function GET() {
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

    const knowledgeBase = await prisma.knowledgeBase.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        fileSize: true,
        mimeType: true,
        originalName: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    return NextResponse.json({ knowledgeBase })
  } catch (error) {
    console.error('Error fetching knowledge base:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge base' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = createKnowledgeSchema.parse(body)

    // Check user's plan limits
    const knowledgeCount = await prisma.knowledgeBase.count({
      where: {
        userId: user.id,
        isActive: true
      }
    })

    const limits = {
      FREE: 5,
      PRO: 50,
      ENTERPRISE: -1 // unlimited
    }

    const limit = limits[user.planType as keyof typeof limits]
    if (limit !== -1 && knowledgeCount >= limit) {
      return NextResponse.json(
        { error: `Limite de documentos atingido (${limit} documentos para plano ${user.planType})` },
        { status: 403 }
      )
    }

    // Extract text content from file if it's a document
    let processedContent = validatedData.content
    if (validatedData.type === 'DOCUMENT' && validatedData.mimeType) {
      processedContent = await extractTextFromFile(validatedData.content, validatedData.mimeType)
    }

    const knowledge = await prisma.knowledgeBase.create({
      data: {
        ...validatedData,
        content: processedContent,
        userId: user.id,
      }
    })

    return NextResponse.json({ knowledge }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating knowledge:', error)
    return NextResponse.json(
      { error: 'Failed to create knowledge' },
      { status: 500 }
    )
  }
}