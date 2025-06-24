import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { aiService } from "@/lib/ai/ai-service"
import { AIMessage } from "@/lib/ai/types"
import { checkUsageLimits, trackUsage } from "@/lib/usage-limits"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return new Response(
        JSON.stringify({ message: "Não autorizado" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { messages, model = 'gpt-3.5-turbo', conversationId, webSearchEnabled, knowledgeBaseEnabled } = await request.json()

    // Validar entrada
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ message: "Mensagens são obrigatórias" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Verificar limites de uso
    const limitsCheck = await checkUsageLimits(session.user.id, model)
    
    if (!limitsCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          message: limitsCheck.reason,
          usage: limitsCheck.usage,
          planType: limitsCheck.planType
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return new Response(
        JSON.stringify({ message: "Usuário não encontrado" }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Criar ou buscar conversa
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
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: messages[messages.length - 1].content,
        modelUsed: model
      }
    })

    // Buscar contexto da Knowledge Base se habilitado
    let knowledgeContext = ''
    if (knowledgeBaseEnabled) {
      const knowledgeItems = await prisma.knowledgeBase.findMany({
        where: {
          userId: user.id,
          isActive: true
        },
        select: {
          name: true,
          content: true,
          type: true
        },
        take: 5 // Limitar para não exceder o contexto
      })

      if (knowledgeItems.length > 0) {
        knowledgeContext = "\n\n[CONTEXTO DA BASE DE CONHECIMENTO]\n"
        knowledgeItems.forEach(item => {
          knowledgeContext += `\n### ${item.name} (${item.type})\n${item.content.substring(0, 1000)}...\n`
        })
        knowledgeContext += "\n[FIM DO CONTEXTO]\n\n"
      }
    }

    // Preparar mensagens para IA (incluindo attachments)
    const aiMessages: AIMessage[] = messages.map((msg: any, index: number) => {
      // Adicionar contexto da Knowledge Base apenas na primeira mensagem do usuário
      let content = msg.content || ''
      if (index === 0 && knowledgeContext && msg.role === 'user') {
        content = knowledgeContext + content
      }

      // Se não houver attachments, retornar mensagem simples
      if (!msg.attachments || msg.attachments.length === 0) {
        return {
          role: msg.role,
          content: content
        }
      }
      
      // Para mensagens com attachments, criar array de conteúdo multimodal
      const contentParts: any[] = []
      
      // Adicionar texto da mensagem primeiro
      if (content) {
        contentParts.push({
          type: 'text',
          text: content
        })
      }
      
      // Adicionar attachments
      for (const attachment of msg.attachments) {
        if (attachment.type.startsWith('image/')) {
          // Para imagens, usar formato de image_url
          contentParts.push({
            type: 'image_url',
            image_url: {
              url: attachment.content // Já está em base64 data URL
            }
          })
        } else {
          // Para outros arquivos, adicionar como texto
          contentParts.push({
            type: 'text',
            text: `\n[Arquivo: ${attachment.name}]\n${attachment.content}`
          })
        }
      }
      
      return {
        role: msg.role,
        content: contentParts.length === 1 && contentParts[0].type === 'text' 
          ? contentParts[0].text 
          : contentParts
      }
    })

    // Criar stream de resposta
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = ''
        let tokensUsed = { input: 0, output: 0, total: 0 }
        let cost = 0

        try {
          // Usar o método de streaming do AI service
          await aiService.streamResponseWithCallbacks(aiMessages, model, {
            onToken: (token: string) => {
              fullContent += token
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`))
            },
            onComplete: async (response: any) => {
              tokensUsed = response.tokensUsed
              cost = response.cost

              // Salvar resposta completa da IA
              await prisma.message.create({
                data: {
                  conversationId: conversation.id,
                  role: 'ASSISTANT',
                  content: fullContent,
                  tokensUsed: tokensUsed.total,
                  modelUsed: model
                }
              })

              // Atualizar estatísticas de uso
              await trackUsage(user.id, model, tokensUsed, cost)

              // Enviar dados finais
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
                done: true, 
                conversationId: conversation.id,
                tokensUsed,
                cost 
              })}\n\n`))
              controller.close()
            },
            onError: (error: Error) => {
              console.error("Streaming error:", error)
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
              controller.close()
            }
          })
        } catch (error) {
          console.error("Stream error:", error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Erro ao gerar resposta" })}\n\n`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error("Chat Stream API error:", error)
    return new Response(
      JSON.stringify({ message: "Erro interno do servidor" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}