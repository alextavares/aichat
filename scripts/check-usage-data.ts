import { prisma } from '../lib/prisma'
import { checkUsageLimits, getUserUsageStats } from '../lib/usage-limits'

async function checkUserUsageData() {
  try {
    // Buscar um usuário de teste
    const testEmail = process.env.TEST_USER_EMAIL || 'alexandretmoraes000@gmail.com'
    
    console.log(`\n=== Checking usage data for user: ${testEmail} ===\n`)
    
    const user = await prisma.user.findUnique({
      where: { email: testEmail }
    })
    
    if (!user) {
      console.log('User not found!')
      return
    }
    
    console.log('User found:', {
      id: user.id,
      email: user.email,
      planType: user.planType
    })
    
    // Verificar dados de uso
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    console.log('\n=== Checking UserUsage records ===')
    
    const allUsage = await prisma.userUsage.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth
        }
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    console.log(`Found ${allUsage.length} usage records this month`)
    
    allUsage.forEach(usage => {
      console.log({
        date: usage.date,
        modelId: usage.modelId,
        messages: usage.messagesCount,
        inputTokens: usage.inputTokensUsed,
        outputTokens: usage.outputTokensUsed,
        cost: usage.costIncurred
      })
    })
    
    // Testar checkUsageLimits para diferentes modelos
    console.log('\n=== Testing checkUsageLimits ===')
    
    const modelsToTest = [
      'gpt-4o-mini',  // fast model
      'gpt-4o',       // advanced model
      'claude-3.5-sonnet' // advanced model
    ]
    
    for (const model of modelsToTest) {
      console.log(`\nChecking limits for model: ${model}`)
      const result = await checkUsageLimits(user.id, model)
      console.log(result)
    }
    
    // Obter estatísticas de uso
    console.log('\n=== User Usage Stats ===')
    const stats = await getUserUsageStats(user.id)
    console.log(JSON.stringify(stats, null, 2))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserUsageData()