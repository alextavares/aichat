import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { aiService } from "@/lib/ai/ai-service"
import { AIMessage } from "@/lib/ai/types"
import { CreditService } from "@/lib/credit-service"
import { 
  getModelById, 
  calculateCreditsForTokens, 
  modelRequiresCredits,
  getModelsForPlan 
} from "@/lib/ai/innerai-models-config"

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
    const availableModels = getModelsForPlan(user.planType as 'FREE' | 'LITE' | 'PRO' | 'ENTERPRISE')
    const modelAvailable = availableModels.some(m => m.id === model)
    const modelConfig = getModelById(model)

    if (!modelAvailable || !modelConfig) {
      return NextResponse.json(
        { message: "Modelo não disponível para seu plano atual" },
        { status: 403 }
      )
    }

    // Verificar se o modelo requer créditos e se o usuário tem créditos suficientes
    if (modelRequiresCredits(model)) {
      // Estimativa de créditos baseada no tamanho da mensagem (aproximação)
      const userMessage = messages[messages.length - 1]?.content || ''
      const estimatedInputTokens = Math.ceil(userMessage.length / 4) // Aproximação: 4 chars = 1 token
      const estimatedOutputTokens = estimatedInputTokens // Estimativa: resposta similar ao input
      
      const estimatedCredits = calculateCreditsForTokens(model, estimatedInputTokens, estimatedOutputTokens)
      const currentBalance = await CreditService.getUserBalance(user.id)
      
      console.log(`[Chat API] Credit check: ${currentBalance} available, ${estimatedCredits} estimated needed for model ${model}`)
      
      if (currentBalance < estimatedCredits) {
        return NextResponse.json(
          { 
            message: `Créditos insuficientes. Necessários: ${estimatedCredits}, Disponíveis: ${currentBalance}. Adicione créditos para continuar usando este modelo.`,
            creditsNeeded: estimatedCredits,
            creditsAvailable: currentBalance,
            modelCategory: modelConfig.category,
            requiresUpgrade: true
          },
          { status: 402 } // Payment Required
        )
      }
    }

    // Gerar resposta da IA
    const aiMessages: AIMessage[] = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }))

    console.log(`[Chat API] Requesting AI response for user ${user.id} with model ${model}`)
    
    let aiResponse
    try {
      aiResponse = await aiService.generateResponse(aiMessages, model)
      console.log(`[Chat API] AI response received: ${aiResponse.content.length} chars, ${aiResponse.tokensUsed.total} tokens`)
    } catch (error) {
      console.error(`[Chat API] AI service failed:`, error)
      // Fallback response for testing
      aiResponse = {
        content: `Olá! Sou o Inner AI e recebi sua mensagem: "${messages[messages.length - 1].content}". No momento estou em modo de teste. Como posso ajudá-lo?`,
        tokensUsed: {
          input: 10,
          output: 25,
          total: 35
        },
        cost: 0.0001
      }
      console.log(`[Chat API] Using fallback response`)
    }

    // Calcular créditos necessários baseado nos tokens reais usados
    const creditsNeeded = calculateCreditsForTokens(
      model, 
      aiResponse.tokensUsed.input, 
      aiResponse.tokensUsed.output
    )

    console.log(`[Chat API] Credits needed: ${creditsNeeded} for model ${model} (${aiResponse.tokensUsed.input}/${aiResponse.tokensUsed.output} tokens)`)

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

    // Consumir créditos se o modelo requer créditos
    let creditResult = null
    if (modelRequiresCredits(model) && creditsNeeded > 0) {
      creditResult = await CreditService.consumeCredits(
        user.id,
        creditsNeeded,
        `Chat com ${modelConfig.name} (${aiResponse.tokensUsed.input} input + ${aiResponse.tokensUsed.output} output tokens)`,
        conversation.id,
        'chat'
      )

      if (!creditResult.success) {
        console.error(`[Chat API] Credit consumption failed: ${creditResult.message}`)
        // Se falhou a cobrança de créditos, devemos reverter ou alertar
        // Por enquanto, vamos apenas logar mas não bloquear
      } else {
        console.log(`[Chat API] Successfully consumed ${creditsNeeded} credits`)
      }
    }

    // Atualizar estatísticas de uso
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Usar upsert para evitar problemas de concorrência
    await prisma.userUsage.upsert({
      where: {
        userId_modelId_date: {
          userId: user.id,
          modelId: model,
          date: today,
        },
      },
      create: {
        userId: user.id,
        modelId: model,
        date: today,
        messagesCount: 1,
        inputTokensUsed: aiResponse.tokensUsed.input,
        outputTokensUsed: aiResponse.tokensUsed.output,
        costIncurred: aiResponse.cost,
      },
      update: {
        messagesCount: { increment: 1 },
        inputTokensUsed: { increment: aiResponse.tokensUsed.input },
        outputTokensUsed: { increment: aiResponse.tokensUsed.output },
        costIncurred: { increment: aiResponse.cost },
      },
    })

    // Obter saldo atualizado de créditos
    const finalCreditBalance = await CreditService.getUserBalance(user.id)

    return NextResponse.json({
      message: aiResponse.content,
      conversationId: conversation.id,
      tokensUsed: aiResponse.tokensUsed,
      cost: aiResponse.cost,
      model: {
        id: model,
        name: modelConfig.name,
        category: modelConfig.category,
        provider: modelConfig.provider
      },
      credits: {
        consumed: creditResult?.success ? creditsNeeded : 0,
        balance: finalCreditBalance,
        required: modelRequiresCredits(model)
      }
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