import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Teste público do chat iniciado...')
    
    // Importar dinamicamente para evitar problemas de inicialização
    const { config } = await import('dotenv')
    
    // Verificar variáveis de ambiente
    const openRouterKey = process.env.OPENROUTER_API_KEY
    const nextAuthUrl = process.env.NEXTAUTH_URL
    
    const result = {
      status: 'checking',
      timestamp: new Date().toISOString(),
      environment: {
        openRouterConfigured: !!openRouterKey && openRouterKey.length > 20,
        nextAuthUrl: nextAuthUrl,
        nodeEnv: process.env.NODE_ENV
      },
      tests: {}
    }
    
    // Teste 1: Verificar se a chave OpenRouter funciona
    if (openRouterKey && openRouterKey.length > 20) {
      try {
        console.log('Testando autenticação OpenRouter...')
        const authResponse = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${openRouterKey}`,
            'HTTP-Referer': nextAuthUrl || 'https://seahorse-app-k5pag.ondigitalocean.app',
            'X-Title': 'InnerAI Clone Test'
          }
        })
        
        result.tests.openRouterAuth = {
          success: authResponse.ok,
          status: authResponse.status,
          statusText: authResponse.statusText
        }
        
        // Teste 2: Chat completion se auth passou
        if (authResponse.ok) {
          console.log('Testando chat completion...')
          const chatResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': nextAuthUrl || 'https://seahorse-app-k5pag.ondigitalocean.app',
              'X-Title': 'InnerAI Clone Test'
            },
            body: JSON.stringify({
              model: 'mistralai/mistral-7b-instruct',
              messages: [{ role: 'user', content: 'Responda apenas: FUNCIONANDO' }],
              max_tokens: 10
            })
          })
          
          if (chatResponse.ok) {
            const chatData = await chatResponse.json()
            result.tests.chatCompletion = {
              success: true,
              response: chatData.choices[0]?.message?.content || 'Sem resposta',
              tokensUsed: chatData.usage
            }
            result.status = 'success'
          } else {
            const errorText = await chatResponse.text()
            result.tests.chatCompletion = {
              success: false,
              error: errorText.substring(0, 200),
              status: chatResponse.status
            }
            result.status = 'partial'
          }
        } else {
          result.status = 'auth_failed'
        }
        
      } catch (error: any) {
        result.tests.openRouterError = {
          message: error.message,
          name: error.name
        }
        result.status = 'error'
      }
    } else {
      result.tests.openRouterAuth = {
        success: false,
        error: 'Chave OpenRouter não configurada ou inválida'
      }
      result.status = 'not_configured'
    }
    
    return NextResponse.json(result)
    
  } catch (error: any) {
    console.error('Erro no teste público:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 })
  }
}