import { NextResponse } from "next/server"
import { aiService } from "@/lib/ai/ai-service"

export async function GET() {
  try {
    const providers = {
      openai: {
        configured: false,
        models: [] as string[],
        error: null as string | null
      },
      openrouter: {
        configured: false,
        models: [] as string[],
        error: null as string | null
      }
    }

    // Verificar OpenAI
    try {
      const openaiProvider = aiService.getProvider('openai')
      providers.openai.configured = openaiProvider.isConfigured()
      if (providers.openai.configured) {
        providers.openai.models = openaiProvider.getAvailableModels().map(m => m.id)
      }
    } catch (error: any) {
      providers.openai.error = error.message
    }

    // Verificar OpenRouter
    try {
      const openRouterProvider = aiService.getProvider('openrouter')
      providers.openrouter.configured = openRouterProvider.isConfigured()
      if (providers.openrouter.configured) {
        providers.openrouter.models = openRouterProvider.getAvailableModels().map(m => m.id)
      }
    } catch (error: any) {
      providers.openrouter.error = error.message
    }

    // Verificar modelos disponíveis por plano
    const modelsByPlan = {
      FREE: aiService.getModelsForPlan('FREE').map(m => m.id),
      PRO: aiService.getModelsForPlan('PRO').map(m => m.id),
      ENTERPRISE: aiService.getModelsForPlan('ENTERPRISE').map(m => m.id)
    }

    // Status geral
    const hasWorkingProvider = providers.openai.configured || providers.openrouter.configured
    
    return NextResponse.json({
      status: hasWorkingProvider ? 'operational' : 'error',
      providers,
      modelsByPlan,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      }
    })
  } catch (error: any) {
    console.error("AI status check error:", error)
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 })
  }
}