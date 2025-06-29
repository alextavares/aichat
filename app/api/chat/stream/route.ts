import { NextRequest } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { aiService } from "@/lib/ai/ai-service"
import { AIMessage } from "@/lib/ai/types"
import { checkUsageLimits, trackUsage } from "@/lib/usage-limits"

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder()
  
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
          errorCode: "LIMIT_REACHED",
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

    // Criar stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Processar mensagens
          const aiMessages: AIMessage[] = messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content
          }))

          // Criar ou recuperar conversa
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

          let fullContent = ''
          let tokensUsed = { input: 0, output: 0, total: 0 }
          let cost = 0

          // Stream da resposta
          await aiService.streamResponseWithCallbacks(aiMessages, model, {
            onToken: (token) => {
              fullContent += token
              const data = JSON.stringify({ token })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            },
            onComplete: async (response) => {
              tokensUsed = response.tokensUsed
              cost = response.cost

              // Salvar resposta da IA
              await prisma.message.create({
                data: {
                  conversationId: conversation.id,
                  role: 'ASSISTANT',
                  content: fullContent,
                  tokensUsed: tokensUsed.total,
                  modelUsed: model
                }
              })

              // Atualizar estatísticas
              await trackUsage(user.id, model, tokensUsed, cost)

              // Enviar dados finais
              const finalData = JSON.stringify({
                done: true,
                conversationId: conversation.id,
                tokensUsed,
                cost
              })
              controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
              controller.close()
            },
            onError: (error) => {
              console.error("Streaming error:", error)
              const errorData = JSON.stringify({
                error: error.message || "Erro ao processar mensagem"
              })
              controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
              controller.close()
            }
          })

        } catch (error: any) {
          console.error("Stream error:", error)
          
          // Enviar erro específico
          let errorMessage = "Erro ao processar mensagem"
          
          if (error.message?.includes('API key not configured')) {
            errorMessage = "Serviço de IA temporariamente indisponível"
          } else if (error.message?.includes('No configured provider')) {
            errorMessage = "Modelo selecionado não está disponível"
          }
          
          const errorData = JSON.stringify({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
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

  } catch (error: any) {
    console.error("Chat stream API error:", error)
    
    // Log detalhado
    console.error("Detalhes do erro:", {
      message: error.message,
      stack: error.stack,
      body: await request.text()
    })
    
    return new Response(
      JSON.stringify({ 
        message: "Erro ao processar requisição",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    )
  }
}