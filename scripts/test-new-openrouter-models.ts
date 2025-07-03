import { aiService } from '../lib/ai/ai-service'
import { AIMessage } from '../lib/ai/types'

const testModels = [
  'gpt-4.1',
  'gpt-4o',
  'claude-4-sonnet',
  'gemini-2.5-pro',
  'llama-4-maverick',
  'perplexity-sonar',
  'sabia-3.1',
  'o3',
  'o4-mini',
  'qwen-qwq',
  'deepseek-r1-small',
  'amazon-nova-premier'
]

async function testOpenRouterModels() {
  console.log('🚀 Testing new OpenRouter models...\n')

  const testMessage: AIMessage[] = [{
    role: 'user',
    content: 'Say "Hello! I am [model name] and I am working!" in Portuguese.'
  }]

  for (const model of testModels) {
    try {
      console.log(`Testing ${model}...`)
      const response = await aiService.generateResponse(testMessage, model)
      console.log(`✅ ${model}: ${response.content}`)
      console.log(`   Tokens: ${response.tokensUsed.total}, Cost: $${response.cost.toFixed(4)}\n`)
    } catch (error) {
      console.log(`❌ ${model}: ${error instanceof Error ? error.message : 'Unknown error'}\n`)
    }
  }

  console.log('✨ Test completed!')
}

// Run if called directly
if (require.main === module) {
  testOpenRouterModels().catch(console.error)
}

export { testOpenRouterModels }