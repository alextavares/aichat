import OpenAI from 'openai'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY not found in environment variables')
    return
  }
  
  console.log('🔑 API Key found:', apiKey.substring(0, 10) + '...')
  
  try {
    const openai = new OpenAI({
      apiKey: apiKey
    })
    
    console.log('🧪 Testing OpenAI API connection...')
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Hello, Inner AI!" in exactly 5 words.' }
      ],
      max_tokens: 50
    })
    
    console.log('✅ OpenAI API is working!')
    console.log('Response:', completion.choices[0].message.content)
    console.log('Tokens used:', completion.usage?.total_tokens)
    
  } catch (error: any) {
    console.error('❌ OpenAI API Error:')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    
    if (error.status === 401) {
      console.error('⚠️  Invalid API key. Please check your OPENAI_API_KEY in .env.local')
    } else if (error.status === 429) {
      console.error('⚠️  Rate limit exceeded or quota exhausted')
    } else if (error.code === 'ENOTFOUND') {
      console.error('⚠️  Network error - check your internet connection')
    }
  }
}

testOpenAI()