#!/usr/bin/env npx tsx

/**
 * Script para testar a configuração OpenRouter em produção
 */

import { config } from 'dotenv'
config()

async function testProductionOpenRouter() {
  console.log('🔍 TESTANDO OPENROUTER EM PRODUÇÃO\n')
  
  const apiKey = process.env.OPENROUTER_API_KEY
  const appUrl = 'https://seahorse-app-k5pag.ondigitalocean.app'
  
  console.log('1️⃣ Configuração:')
  console.log('   - API Key:', apiKey ? `${apiKey.substring(0, 20)}...` : 'não definida')
  console.log('   - App URL:', appUrl)
  
  if (!apiKey) {
    console.log('❌ ERRO: API Key não encontrada')
    return
  }
  
  console.log('\n2️⃣ Testando autenticação...')
  try {
    const authResponse = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': appUrl,
        'X-Title': 'InnerAI Clone'
      }
    })
    
    if (authResponse.ok) {
      console.log('   ✅ Autenticação OK')
    } else {
      console.log('   ❌ Erro de autenticação:', authResponse.status, authResponse.statusText)
      const errorText = await authResponse.text()
      console.log('   Resposta:', errorText.substring(0, 200))
    }
  } catch (error) {
    console.log('   ❌ Erro na requisição:', error.message)
  }
  
  console.log('\n3️⃣ Testando chat completion...')
  try {
    const chatResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': appUrl,
        'X-Title': 'InnerAI Clone'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [{ role: 'user', content: 'Responda apenas: FUNCIONANDO' }],
        max_tokens: 10
      })
    })
    
    if (chatResponse.ok) {
      const data = await chatResponse.json()
      console.log('   ✅ Chat completion OK')
      console.log('   Resposta:', data.choices[0].message.content)
    } else {
      console.log('   ❌ Erro no chat:', chatResponse.status, chatResponse.statusText)
      const errorText = await chatResponse.text()
      console.log('   Resposta:', errorText.substring(0, 300))
    }
  } catch (error) {
    console.log('   ❌ Erro na requisição de chat:', error.message)
  }
  
  console.log('\n4️⃣ Testando endpoint da aplicação...')
  try {
    const appTestResponse = await fetch(`${appUrl}/api/health`)
    
    if (appTestResponse.ok) {
      const data = await appTestResponse.json()
      console.log('   ✅ App health OK:', data.status)
    } else {
      console.log('   ❌ Erro no app health:', appTestResponse.status)
    }
  } catch (error) {
    console.log('   ❌ Erro ao testar app:', error.message)
  }
  
  console.log('\n5️⃣ Simulando requisição do frontend...')
  try {
    // Simular exatamente o que o frontend faria
    const frontendResponse = await fetch(`${appUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Nota: sem Authorization header porque o endpoint usa sessão
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'teste' }],
        model: 'mistral-7b'
      })
    })
    
    console.log('   Status:', frontendResponse.status, frontendResponse.statusText)
    const responseText = await frontendResponse.text()
    console.log('   Resposta:', responseText.substring(0, 200))
    
  } catch (error) {
    console.log('   ❌ Erro na simulação frontend:', error.message)
  }
}

testProductionOpenRouter().catch(console.error)