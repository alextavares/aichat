#!/usr/bin/env npx tsx

import { config } from 'dotenv'
config()

import { aiService } from '../lib/ai/ai-service'

async function debugAIService() {
  console.log('🔍 DEBUGANDO AI SERVICE\n')
  
  console.log('1️⃣ Testando providers disponíveis...')
  try {
    // @ts-ignore - Acessando propriedade privada
    const providers = aiService.providers
    console.log('   - Providers registrados:')
    for (const [name, provider] of providers) {
      console.log(`     ${name}: ${provider.isConfigured() ? '✅' : '❌'}`)
    }
  } catch (error) {
    console.log('   ❌ ERRO:', error.message)
  }
  
  console.log('\n2️⃣ Testando getProviderForModel...')
  try {
    // @ts-ignore - Acessando método privado
    const provider = aiService.getProviderForModel('mistral-7b')
    console.log('   ✅ Provider encontrado:', provider.id)
    console.log('   - Configurado:', provider.isConfigured())
  } catch (error) {
    console.log('   ❌ ERRO:', error.message)
  }
  
  console.log('\n3️⃣ Testando geração direta...')
  try {
    const response = await aiService.generateResponse(
      [{ role: 'user', content: 'Teste rápido' }],
      'mistral-7b'
    )
    console.log('   ✅ Sucesso! Resposta:', response.content.substring(0, 50))
  } catch (error) {
    console.log('   ❌ ERRO:', error.message)
  }
  
  console.log('\n4️⃣ Testando OpenRouter Provider diretamente...')
  try {
    // @ts-ignore
    const openRouterProvider = aiService.getProvider('openrouter')
    console.log('   - Provider ID:', openRouterProvider.id)
    console.log('   - Configurado:', openRouterProvider.isConfigured())
    
    const response = await openRouterProvider.generateResponse(
      [{ role: 'user', content: 'Test direto' }],
      'mistral-7b'
    )
    console.log('   ✅ Teste direto funcionou!')
  } catch (error) {
    console.log('   ❌ ERRO no teste direto:', error.message)
  }
}

debugAIService().catch(console.error)