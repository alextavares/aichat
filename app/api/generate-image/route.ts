import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dalleProvider, ImageGenerationOptions } from '@/lib/ai/dalle-provider'
import { prisma } from '@/lib/prisma'
import { getUserUsageStats } from '@/lib/usage-limits'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { prompt, model, size, quality, style } = body as ImageGenerationOptions

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt é obrigatório' },
        { status: 400 }
      )
    }

    // Check user limits
    const usageStats = await getUserUsageStats(session.user.id)
    
    // Image generation counts as advanced usage for LITE/PRO plans
    if (usageStats.planType === 'FREE') {
      return NextResponse.json(
        { error: 'Geração de imagens disponível apenas para planos LITE e PRO' },
        { status: 403 }
      )
    }

    if (usageStats.planType === 'LITE') {
      const monthlyAdvanced = usageStats.monthly.advancedMessages
      if (monthlyAdvanced.used >= monthlyAdvanced.limit) {
        return NextResponse.json(
          { error: 'Limite mensal de recursos avançados atingido' },
          { status: 429 }
        )
      }
    }

    // Generate image
    const result = await dalleProvider.generateImage({
      prompt,
      model: model || 'dall-e-3',
      size: size || '1024x1024',
      quality: quality || 'standard',
      style: style || 'vivid'
    })

    // Log usage
    await prisma.usage.create({
      data: {
        userId: session.user.id,
        type: 'IMAGE_GENERATION',
        model: result.model,
        tokensUsed: 0, // Images don't use tokens
        cost: result.cost,
        metadata: {
          prompt,
          size,
          quality,
          style,
          imageCount: result.images.length
        }
      }
    })

    return NextResponse.json({
      success: true,
      images: result.images,
      cost: result.cost,
      model: result.model
    })

  } catch (error) {
    console.error('Image generation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}