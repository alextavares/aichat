import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { message } = await request.json()
    console.log("Demo stream received message:", message)
    
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY not configured")
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'API key não configurada' })}\n\n`))
            controller.close()
            return
          }
          
          const stream = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
          stream: true,
          max_tokens: 500,
          temperature: 0.7
        })

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || ''
          if (content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: content })}\n\n`))
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`))
        controller.close()
      } catch (error) {
        console.error("Error in stream:", error)
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Erro ao gerar resposta' })}\n\n`))
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
    console.error("Error in demo-stream route:", error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}