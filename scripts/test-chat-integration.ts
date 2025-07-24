#!/usr/bin/env tsx

// Teste de integração completa do chat
import * as dotenv from 'dotenv'
import * as path from 'path'

// Carregar .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

import { prisma } from '../lib/prisma'
import { aiService } from '../lib/ai/ai-service'
import { CreditService } from '../lib/credit-service'
import { 
  getModelById,
  calculateCreditsForTokens,
  modelRequiresCredits 
} from '../lib/ai/innerai-models-config'

async function testChatIntegration() {
  console.log('🧪 TESTE DE INTEGRAÇÃO COMPLETA DO CHAT\n')

  try {
    // 1. Verificar usuário de teste
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!user) {
      console.error('❌ Usuário de teste não encontrado')
      return
    }

    console.log(`✅ Usuário: ${user.email} (ID: ${user.id})`)
    console.log(`   • Plano: ${user.planType}`)
    console.log(`   • Créditos: ${user.creditBalance}`)

    // 2. Dar créditos ao usuário se não tiver
    if (user.creditBalance < 100) {
      console.log('\n💰 Adicionando créditos ao usuário...')
      await CreditService.addCredits(
        user.id,
        1000,
        'Créditos de teste para desenvolvimento'
      )
      console.log('✅ 1000 créditos adicionados')
    }

    // 3. Testar modelo FREE (não consome créditos)
    console.log('\n🔄 Testando modelo FREE (gpt-4o-mini)...')
    const freeModel = 'gpt-4o-mini'
    const modelConfig = getModelById(freeModel)
    
    if (modelConfig) {
      console.log(`   • Modelo: ${modelConfig.name}`)
      console.log(`   • Categoria: ${modelConfig.category}`)
      console.log(`   • Requer créditos: ${modelRequiresCredits(freeModel)}`)
      
      try {
        const response = await aiService.generateResponse(
          [{ role: 'user', content: 'Diga apenas "Olá!"' }],
          freeModel
        )
        
        console.log('✅ Resposta recebida:')
        console.log(`   • Conteúdo: ${response.content}`)
        console.log(`   • Tokens: ${JSON.stringify(response.tokensUsed)}`)
        
        // Calcular créditos que seriam consumidos
        const creditsNeeded = calculateCreditsForTokens(
          freeModel,
          response.tokensUsed.input,
          response.tokensUsed.output
        )
        console.log(`   • Créditos calculados: ${creditsNeeded}`)
        
      } catch (error) {
        console.error('❌ Erro no modelo FREE:', error)
      }
    }

    // 4. Testar modelo que consome créditos
    console.log('\n🔄 Testando modelo AVANÇADO (claude-4-sonnet)...')
    const paidModel = 'claude-4-sonnet'
    const paidModelConfig = getModelById(paidModel)
    
    if (paidModelConfig) {
      console.log(`   • Modelo: ${paidModelConfig.name}`)
      console.log(`   • Categoria: ${paidModelConfig.category}`)
      console.log(`   • Requer créditos: ${modelRequiresCredits(paidModel)}`)
      
      try {
        const response = await aiService.generateResponse(
          [{ role: 'user', content: 'Diga apenas "Olá!"' }],
          paidModel
        )
        
        console.log('✅ Resposta recebida:')
        console.log(`   • Conteúdo: ${response.content}`)
        console.log(`   • Tokens: ${JSON.stringify(response.tokensUsed)}`)
        
        // Calcular e consumir créditos
        const creditsNeeded = calculateCreditsForTokens(
          paidModel,
          response.tokensUsed.input,
          response.tokensUsed.output
        )
        console.log(`   • Créditos necessários: ${creditsNeeded}`)
        
        // Testar consumo de créditos
        const creditResult = await CreditService.consumeCredits(
          user.id,
          creditsNeeded,
          `Teste chat com ${paidModelConfig.name}`,
          'test-conversation'
        )
        
        if (creditResult.success) {
          console.log('✅ Créditos consumidos com sucesso')
          const newBalance = await CreditService.getUserBalance(user.id)
          console.log(`   • Novo saldo: ${newBalance}`)
        }
        
      } catch (error) {
        console.error('❌ Erro no modelo AVANÇADO:', error)
      }
    }

    console.log('\n✅ TESTE DE INTEGRAÇÃO CONCLUÍDO!')
    console.log('\n🎯 Próximo passo: Testar no navegador em http://localhost:3050')

  } catch (error) {
    console.error('❌ Erro no teste de integração:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testChatIntegration()