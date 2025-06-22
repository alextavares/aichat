import { NextResponse } from "next/server"
import { aiService } from "@/lib/ai/ai-service"

// Endpoint público apenas para testes
export async function GET() {
  try {
    const messages = [
      {
        role: 'user' as const,
        content: 'Olá! Você está funcionando? Responda em português em uma frase curta.'
      }
    ]

    const response = await aiService.generateResponse(messages, "gpt-3.5-turbo", {
      maxTokens: 100,
      temperature: 0.7
    })

    return NextResponse.json({
      success: true,
      message: response.content,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Test AI error:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      },
      { status: 500 }
    )
  }
}