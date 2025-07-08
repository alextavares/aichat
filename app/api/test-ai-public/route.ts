import { NextResponse } from "next/server"
import { aiService } from "@/lib/ai/ai-service"

// Endpoint público apenas para testes
export async function GET() {
  try {
    // Debug: verificar se as chaves estão sendo carregadas
    console.log('🔍 Debug - Environment variables check:')
    console.log('OPENROUTER_API_KEY exists:', !!process.env.OPENROUTER_API_KEY)
    console.log('OPENROUTER_API_KEY length:', process.env.OPENROUTER_API_KEY?.length || 0)
    console.log('OPENROUTER_API_KEY prefix:', process.env.OPENROUTER_API_KEY?.substring(0, 8) || 'undefined')
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY)
    console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY?.length || 0)
    
    const messages = [
      {
        role: 'user' as const,
        content: 'Olá! Você está funcionando? Responda em português em uma frase curta.'
      }
    ]

    const response = await aiService.generateResponse(messages, "claude-3.5-haiku", {
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