// Teste simples da API do OpenRouter
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

async function testOpenRouter() {
  console.log('🧪 Testando conexão com OpenRouter...\n')
  
  const apiKey = process.env.OPENROUTER_API_KEY
  
  if (!apiKey) {
    console.error('❌ OPENROUTER_API_KEY não encontrada!')
    return
  }
  
  console.log('🔑 API Key encontrada:', apiKey.substring(0, 20) + '...')
  
  try {
    // Testar endpoint de modelos
    console.log('\n📋 Testando lista de modelos...')
    const modelsResponse = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!modelsResponse.ok) {
      console.error('❌ Erro ao buscar modelos:', modelsResponse.status, modelsResponse.statusText)
      return
    }
    
    const modelsData = await modelsResponse.json()
    console.log('✅ Modelos encontrados:', modelsData.data?.length || 0)
    
    // Mostrar alguns modelos importantes
    const importantModels = [
      'openai/gpt-4o-mini',
      'anthropic/claude-3.5-sonnet',
      'google/gemini-2.0-flash-exp',
      'deepseek/deepseek-chat',
      'meta-llama/llama-3.2-90b-vision-instruct'
    ]
    
    console.log('\n🎯 Verificando modelos importantes:')
    for (const modelId of importantModels) {
      const found = modelsData.data?.find((m: any) => m.id === modelId)
      if (found) {
        console.log(`✅ ${modelId} - Disponível`)
      } else {
        console.log(`❌ ${modelId} - Não encontrado`)
      }
    }
    
    // Testar uma requisição simples
    console.log('\n💬 Testando chat simples...')
    const chatResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://innerai-clone.com',
        'X-Title': 'InnerAI Clone'
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Responda apenas "OK" se você está funcionando.'
          }
        ],
        max_tokens: 10
      })
    })
    
    if (!chatResponse.ok) {
      console.error('❌ Erro no chat:', chatResponse.status, chatResponse.statusText)
      const errorText = await chatResponse.text()
      console.error('Detalhes:', errorText)
      return
    }
    
    const chatData = await chatResponse.json()
    const response = chatData.choices?.[0]?.message?.content
    
    if (response) {
      console.log('✅ Chat funcionando! Resposta:', response.trim())
    } else {
      console.log('⚠️ Chat retornou resposta vazia')
    }
    
    console.log('\n🎉 Teste concluído com sucesso!')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
  }
}

// Executar teste
testOpenRouter().catch(console.error)