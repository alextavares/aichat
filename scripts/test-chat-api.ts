#!/usr/bin/env tsx

// Teste da API de chat
import { prisma } from '../lib/prisma'

async function testChatAPI() {
  console.log('🧪 TESTANDO API DE CHAT\n')

  try {
    // 1. Buscar usuário de teste
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!user) {
      console.error('❌ Usuário de teste não encontrado')
      return
    }

    console.log(`✅ Usuário encontrado: ${user.id}`)
    console.log(`   • Email: ${user.email}`)
    console.log(`   • Plano: ${user.planType}`)
    console.log(`   • Créditos: ${user.creditBalance}`)

    // 2. Testar chamada da API de chat
    const testMessage = {
      messages: [
        { role: 'user', content: 'Olá, como você está?' }
      ],
      model: 'gpt-4o-mini'
    }

    console.log('\n🔄 Testando API de chat...')
    console.log(`   • Modelo: ${testMessage.model}`)
    console.log(`   • Mensagem: ${testMessage.messages[0].content}`)

    // Simular requisição para API de chat
    const response = await fetch('http://localhost:3050/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: Em produção seria necessário incluir cookie de sessão
      },
      body: JSON.stringify(testMessage)
    })

    console.log(`   • Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log('✅ Resposta da API:')
      console.log(`   • Mensagem: ${data.message?.substring(0, 100)}...`)
      console.log(`   • Tokens: ${JSON.stringify(data.tokensUsed)}`)
      console.log(`   • Créditos: ${JSON.stringify(data.credits)}`)
    } else {
      const error = await response.text()
      console.log('❌ Erro na API:')
      console.log(`   • ${error}`)
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testChatAPI()