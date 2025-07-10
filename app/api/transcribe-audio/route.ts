import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { whisperProvider, AudioTranscriptionOptions } from '@/lib/ai/whisper-provider'
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

    const formData = await request.formData()
    const file = formData.get('file') as File
    const language = formData.get('language') as string
    const prompt = formData.get('prompt') as string
    const response_format = formData.get('response_format') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo de áudio é obrigatório' },
        { status: 400 }
      )
    }

    // Check user limits
    const usageStats = await getUserUsageStats(session.user.id)
    
    // Audio transcription counts as advanced usage for LITE/PRO plans
    if (usageStats.planType === 'FREE') {
      return NextResponse.json(
        { error: 'Transcrição de áudio disponível apenas para planos LITE e PRO' },
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

    // Transcribe audio
    const options: AudioTranscriptionOptions = {
      file,
      language: language === 'auto' ? undefined : language,
      prompt: prompt || undefined,
      response_format: (response_format as any) || 'verbose_json'
    }

    const result = await whisperProvider.transcribeAudio(options)

    // Log usage
    await prisma.usage.create({
      data: {
        userId: session.user.id,
        type: 'AUDIO_TRANSCRIPTION',
        model: result.model,
        tokensUsed: 0, // Whisper doesn't use tokens
        cost: result.cost,
        metadata: {
          filename: file.name,
          fileSize: file.size,
          duration: result.duration,
          language: result.language,
          format: response_format
        }
      }
    })

    return NextResponse.json({
      success: true,
      transcription: result.text,
      language: result.language,
      duration: result.duration,
      segments: result.segments,
      cost: result.cost,
      model: result.model
    })

  } catch (error) {
    console.error('Audio transcription error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    )
  }
}