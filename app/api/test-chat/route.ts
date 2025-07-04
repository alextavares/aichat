import { NextRequest, NextResponse } from "next/server"
import { aiService } from "@/lib/ai/ai-service"

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testando configuração do chat...')
    
    // 1. Verificar se provider está configurado
    // @ts-ignore
    const openRouterProvider = aiService.getProvider('openrouter')
    const isConfigured = openRouterProvider.isConfigured()
    
    console.log('Provider configurado:', isConfigured)
    
    if (!isConfigured) {
      return NextResponse.json({
        status: 'error',
        message: 'OpenRouter não configurado',
        configured: false,
        timestamp: new Date().toISOString()
      })
    }
    
    // 2. Testar geração de resposta
    const testMessages = [
      { role: 'user' as const, content: 'Responda apenas: TESTE OK' }
    ]
    
    console.log('Testando geração de resposta...')
    const response = await aiService.generateResponse(testMessages, 'mistral-7b')
    
    return NextResponse.json({
      status: 'success',
      message: 'Chat funcionando!',
      configured: true,
      testResponse: response.content,
      model: 'mistral-7b',
      tokensUsed: response.tokensUsed,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('Erro no teste de chat:', error)
    
    return NextResponse.json({
      status: 'error',
      message: error.message || 'Erro desconhecido',
      configured: false,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 })
  }
}