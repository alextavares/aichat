#!/usr/bin/env tsx

// Carregar variáveis de ambiente primeiro
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Teste direto da conexão com OpenRouter
import { OpenRouterProvider } from '../lib/ai/openrouter-provider'

async function testOpenRouter() {
  console.log('🔗 TESTANDO CONEXÃO COM OPENROUTER (COM DOTENV)\n')

  console.log(`API Key carregada: ${process.env.OPENROUTER_API_KEY ? 'SIM' : 'NÃO'}`)
  
  try {
    const provider = new OpenRouterProvider()
    
    console.log(`✅ Provider criado`)
    console.log(`   • Configurado: ${provider.isConfigured()}`)
    
    if (!provider.isConfigured()) {
      console.error('❌ OpenRouter ainda não está configurado!')
      return
    }

    // Testar uma requisição simples
    console.log('\n🧪 Testando requisição de chat...')
    const messages = [
      { role: 'user' as const, content: 'Diga apenas "Olá!" em português' }
    ]

    try {
      const response = await provider.generateResponse(messages, 'gpt-4o-mini')
      console.log('✅ Resposta recebida:')
      console.log(`   • Conteúdo: ${response.content}`)
      console.log(`   • Tokens: input=${response.tokensUsed.input}, output=${response.tokensUsed.output}`)
      console.log(`   • Custo: $${response.cost}`)
    } catch (apiError) {
      console.error('❌ Erro na API do OpenRouter:')
      console.error(`   • ${apiError}`)
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  }
}

testOpenRouter()