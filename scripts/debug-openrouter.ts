#!/usr/bin/env npx tsx

/**
 * Script para debugar especificamente o OpenRouter Provider
 */

import { config } from 'dotenv'
config() // Carregar .env

import { OpenRouterProvider } from '../lib/ai/openrouter-provider'

async function debugOpenRouter() {
  console.log('🔍 DEBUGANDO OPENROUTER PROVIDER\n')
  
  console.log('1️⃣ Variáveis de ambiente:')
  console.log('   OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 
    `${process.env.OPENROUTER_API_KEY.substring(0, 20)}...` : 'não definida')
  
  console.log('\n2️⃣ Criando provider...')
  const provider = new OpenRouterProvider()
  
  console.log('   - Provider ID:', provider.id)
  console.log('   - isConfigured():', provider.isConfigured())
  
  // Verificar internamente
  console.log('\n3️⃣ Verificação interna:')
  // @ts-ignore - Acessando propriedade privada
  console.log('   - API Key interno:', provider.apiKey ? 
    `${provider.apiKey.substring(0, 20)}...` : 'vazio')
  
  // Testar com chave específica
  console.log('\n4️⃣ Testando com chave específica...')
  const testProvider = new OpenRouterProvider('test-key')
  console.log('   - Com chave de teste, isConfigured():', testProvider.isConfigured())
  
  // Verificar se consegue mapear modelos
  console.log('\n5️⃣ Testando mapeamento de modelos...')
  try {
    const models = provider.getAvailableModels()
    console.log(`   - Modelos disponíveis: ${models.length}`)
    
    const mistralModel = models.find(m => m.id === 'mistral-7b')
    console.log('   - Modelo mistral-7b encontrado:', !!mistralModel)
  } catch (error) {
    console.log('   ❌ ERRO ao buscar modelos:', error.message)
  }
  
  console.log('\n6️⃣ Testando geração (só se configurado):')
  if (provider.isConfigured() && process.env.OPENROUTER_API_KEY && 
      !process.env.OPENROUTER_API_KEY.includes('placeholder')) {
    try {
      console.log('   - Tentando chamada real...')
      const response = await provider.generateResponse(
        [{ role: 'user', content: 'Hello' }],
        'mistral-7b'
      )
      console.log('   ✅ Sucesso! Resposta:', response.content.substring(0, 50))
    } catch (error) {
      console.log('   ❌ ERRO na geração:', error.message)
    }
  } else {
    console.log('   ⚠️  Provider não configurado ou chave é placeholder')
  }
}

debugOpenRouter().catch(console.error)