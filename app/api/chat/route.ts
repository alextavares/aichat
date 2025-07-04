import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { aiService } from "@/lib/ai/ai-service"
import { AIMessage } from "@/lib/ai/types"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Não autorizado" },
        { status: 401 }
      )
    }

    const { messages, model = 'gpt-3.5-turbo', conversationId } = await request.json()

    // Validar entrada
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { message: "Mensagens são obrigatórias" },
        { status: 400 }
      )
    }

    // Buscar usuário e verificar plano
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se o modelo está disponível para o plano do usuário
    const availableModels = aiService.getModelsForPlan(user.planType)
    const modelAvailable = availableModels.some(m => m.id === model)

    if (!modelAvailable) {
      return NextResponse.json(
        { message: "Modelo não disponível para seu plano" },
        { status: 403 }
      )
    }

    // Verificar limites de uso (para usuários FREE)
    if (user.planType === 'FREE') {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const todayUsage = await prisma.userUsage.findFirst({
        where: {
          userId: user.id,
          date: today
        }
      })

      const dailyMessageLimit = 10000 // Increased for testing
      if (todayUsage && todayUsage.messagesCount >= dailyMessageLimit) {
        return NextResponse.json(
          { message: "Limite diário de mensagens atingido. Faça upgrade para o plano Pro." },
          { status: 429 }
        )
      }
    }

    // Gerar resposta da IA
    const aiMessages: AIMessage[] = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    console.log(`[Chat API] Requesting AI response for user ${user.id} with model ${model}`)
    const aiResponse = await aiService.generateResponse(aiMessages, model)
    console.log(`[Chat API] AI response received: ${aiResponse.content.length} chars, ${aiResponse.tokensUsed.total} tokens`)

    // Criar ou atualizar conversa
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: user.id
        }
      })
    }

    if (!conversation) {
      // Criar nova conversa
      const title = messages[0]?.content?.substring(0, 50) + "..." || "Nova conversa"
      conversation = await prisma.conversation.create({
        data: {
          userId: user.id,
          title,
          modelUsed: model
        }
      })
    }

    // Salvar mensagem do usuário
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: messages[messages.length - 1].content,
        modelUsed: model
      }
    })

    // Salvar resposta da IA
    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: aiResponse.content,
        tokensUsed: aiResponse.tokensUsed.total,
        modelUsed: model
      }
    })

    // Atualizar estatísticas de uso
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Buscar registro existente
    const existingUsage = await prisma.userUsage.findFirst({
      where: {
        userId: user.id,
        modelId: model,
        date: today
      }
    })

    if (existingUsage) {
      // Atualizar registro existente
      await prisma.userUsage.update({
        where: { id: existingUsage.id },
        data: {
          messagesCount: { increment: 1 },
          inputTokensUsed: { increment: aiResponse.tokensUsed.input },
          outputTokensUsed: { increment: aiResponse.tokensUsed.output },
          costIncurred: { increment: aiResponse.cost }
        }
      })
    } else {
      // Criar novo registro
      await prisma.userUsage.create({
        data: {
          userId: user.id,
          modelId: model,
          date: today,
          messagesCount: 1,
          inputTokensUsed: aiResponse.tokensUsed.input,
          outputTokensUsed: aiResponse.tokensUsed.output,
          costIncurred: aiResponse.cost
        }
      })
    }

    return NextResponse.json({
      message: aiResponse.content,
      conversationId: conversation.id,
      tokensUsed: aiResponse.tokensUsed,
      cost: aiResponse.cost
    })

  } catch (error: any) {
    console.error("[Chat API] Error:", error)
    
    // Tratamento específico de erros
    if (error.message?.includes('API key not configured')) {
      return NextResponse.json(
        { message: "Serviço de IA não configurado. Entre em contato com o suporte." },
        { status: 503 }
      )
    }
    
    if (error.message?.includes('No configured provider')) {
      return NextResponse.json(
        { message: "Modelo de IA não disponível no momento." },
        { status: 503 }
      )
    }

    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { message: "Tempo limite excedido. Tente novamente." },
        { status: 408 }
      )
    }

    if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
      return NextResponse.json(
        { message: "Limite de uso temporariamente excedido. Tente novamente em alguns minutos." },
        { status: 429 }
      )
    }
    
    // Log detalhado para debug
    console.error("[Chat API] Detailed error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    return NextResponse.json(
      { 
        message: error.message || "Erro ao processar mensagem. Tente novamente.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}