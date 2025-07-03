#!/usr/bin/env npx tsx

/**
 * Script para testar toda a cadeia de chat
 * Identifica problemas em cada componente
 */

import { config } from 'dotenv'
config() // Carregar .env

import { OpenRouterProvider } from '../lib/ai/openrouter-provider'
import { aiService } from '../lib/ai/ai-service'
import { checkUsageLimits } from '../lib/usage-limits'
import { prisma } from '../lib/prisma'

async function testChatChain() {
  console.log('🔍 TESTANDO CADEIA COMPLETA DO CHAT\n')
  
  // 1. Testar configuração OpenRouter
  console.log('1️⃣ Testando configuração OpenRouter...')
  const openRouterProvider = new OpenRouterProvider()
  console.log('   - OpenRouter configurado:', openRouterProvider.isConfigured())
  
  if (!openRouterProvider.isConfigured()) {
    console.log('   ❌ PROBLEMA: OpenRouter API key não configurada')
    console.log('   💡 Solução: Definir OPENROUTER_API_KEY válida no .env')
  }
  
  // 2. Testar conexão com banco
  console.log('\n2️⃣ Testando conexão com banco...')
  try {
    await prisma.$connect()
    console.log('   ✅ Conexão com banco OK')
    
    // Verificar se existe ao menos um usuário
    const userCount = await prisma.user.count()
    console.log(`   - Usuários no banco: ${userCount}`)
    
    if (userCount === 0) {
      console.log('   ⚠️  AVISO: Nenhum usuário no banco para testar')
    }
  } catch (error) {
    console.log('   ❌ ERRO na conexão com banco:', error)
  }
  
  // 3. Testar modelos disponíveis
  console.log('\n3️⃣ Testando modelos disponíveis...')
  try {
    const allModels = aiService.getAllAvailableModels()
    console.log(`   - Total de modelos: ${allModels.length}`)
    
    const freeModels = aiService.getModelsForPlan('FREE')
    const proModels = aiService.getModelsForPlan('PRO')
    
    console.log(`   - Modelos FREE: ${freeModels.length}`)
    console.log(`   - Modelos PRO: ${proModels.length}`)
    
    // Testar se um modelo específico existe
    const testModel = 'mistral-7b'
    const modelExists = allModels.find(m => m.id === testModel)
    console.log(`   - Modelo de teste '${testModel}' existe:`, !!modelExists)
  } catch (error) {
    console.log('   ❌ ERRO ao buscar modelos:', error)
  }
  
  // 4. Testar limites de uso (se tivermos usuário)
  console.log('\n4️⃣ Testando limites de uso...')
  try {
    const users = await prisma.user.findMany({ take: 1 })
    
    if (users.length > 0) {
      const testUser = users[0]
      console.log(`   - Testando com usuário: ${testUser.email}`)
      
      const limits = await checkUsageLimits(testUser.id, 'mistral-7b')
      console.log('   - Limites de uso:', {
        allowed: limits.allowed,
        planType: limits.planType,
        reason: limits.reason || 'Permitido'
      })
    } else {
      console.log('   ⚠️  PULAR: Nenhum usuário disponível para teste')
    }
  } catch (error) {
    console.log('   ❌ ERRO ao verificar limites:', error)
  }
  
  // 5. Testar provider para modelo específico
  console.log('\n5️⃣ Testando provider para modelo...')
  try {
    const testModel = 'mistral-7b'
    // @ts-ignore - Acessando método privado para teste
    const provider = aiService.getProviderForModel(testModel)
    console.log(`   - Provider para '${testModel}':`, provider.id)
    console.log(`   - Provider configurado:`, provider.isConfigured())
  } catch (error) {
    console.log('   ❌ ERRO ao buscar provider:', error.message)
  }
  
  // 6. Testar geração de resposta (simulada)
  console.log('\n6️⃣ Testando geração de resposta...')
  try {
    const testMessages = [
      { role: 'user' as const, content: 'Hello, this is a test' }
    ]
    
    // Só testar se OpenRouter estiver configurado
    if (openRouterProvider.isConfigured()) {
      console.log('   - Tentando gerar resposta...')
      const response = await aiService.generateResponse(testMessages, 'mistral-7b')
      console.log('   ✅ Resposta gerada com sucesso!')
      console.log(`   - Conteúdo: ${response.content.substring(0, 100)}...`)
      console.log(`   - Tokens: ${response.tokensUsed.total}`)
    } else {
      console.log('   ⚠️  PULAR: OpenRouter não configurado')
    }
  } catch (error) {
    console.log('   ❌ ERRO ao gerar resposta:', error.message)
  }
  
  console.log('\n📊 RESUMO DOS TESTES:')
  console.log('═══════════════════════════════════════')
  
  // Identificar problemas principais
  const problems = []
  
  if (!openRouterProvider.isConfigured()) {
    problems.push('🔑 OpenRouter API key inválida ou não configurada')
  }
  
  try {
    await prisma.user.count()
  } catch {
    problems.push('🗄️  Problema de conexão com banco de dados')
  }
  
  if (problems.length === 0) {
    console.log('✅ Todos os componentes básicos estão funcionando!')
    console.log('💡 Se o chat ainda não funciona, o problema pode estar:')
    console.log('   - Na autenticação/sessão do usuário')
    console.log('   - Na interface frontend')
    console.log('   - Na configuração de produção')
  } else {
    console.log('❌ PROBLEMAS IDENTIFICADOS:')
    problems.forEach(problem => console.log(`   ${problem}`))
  }
  
  await prisma.$disconnect()
}

// Executar teste
testChatChain().catch(console.error)