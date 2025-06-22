import { aiService } from "@/lib/ai/ai-service"

// Endpoint público apenas para testes de streaming
export async function GET() {
  const messages = [
    {
      role: 'user' as const,
      content: 'Me conte uma história curta e interessante sobre programação em 3 frases.'
    }
  ]

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await aiService.streamResponseWithCallbacks(messages, "gpt-3.5-turbo", {
          onToken: (token: string) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`))
          },
          onComplete: (response) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              done: true, 
              tokensUsed: response.tokensUsed,
              cost: response.cost 
            })}\n\n`))
            controller.close()
          },
          onError: (error) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error.message })}\n\n`))
            controller.close()
          },
          maxTokens: 150,
          temperature: 0.8
        })
      } catch (error) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Erro ao iniciar stream" })}\n\n`))
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
}