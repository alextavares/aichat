import { NextResponse } from "next/server"
import { aiService } from "@/lib/ai/ai-service"
import { AIMessage } from "@/lib/ai/types"

export async function GET() {
  try {
    console.log("🧪 Testing OpenAI connection...")
    
    const messages: AIMessage[] = [
      {
        role: "system",
        content: "You are a helpful assistant. Answer in Portuguese (Brazil)."
      },
      {
        role: "user",
        content: "Olá! Diga 'InnerAI está funcionando!' se você conseguir me ouvir."
      }
    ]

    const response = await aiService.generateResponse(messages, "gpt-3.5-turbo", {
      maxTokens: 100,
      temperature: 0.7
    })

    console.log("✅ OpenAI response:", response)

    return NextResponse.json({
      success: true,
      message: "OpenAI API está funcionando!",
      response: response.content,
      tokensUsed: response.tokensUsed,
      cost: response.cost,
      model: response.model
    })
  } catch (error) {
    console.error("❌ OpenAI test error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Erro desconhecido",
        details: error
      },
      { status: 500 }
    )
  }
}