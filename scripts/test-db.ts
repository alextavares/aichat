import { prisma } from '../lib/db'

async function testDatabase() {
  try {
    console.log('Testing database connection...')
    
    // Test connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Create test AI models
    console.log('\nCreating AI models...')
    const models = [
      {
        name: 'gpt-3.5-turbo',
        provider: 'OPENAI',
        costPerInputToken: 0.0000015,
        costPerOutputToken: 0.000002,
        maxContextLength: 4096,
        planRequired: 'FREE'
      },
      {
        name: 'gpt-4',
        provider: 'OPENAI',
        costPerInputToken: 0.00003,
        costPerOutputToken: 0.00006,
        maxContextLength: 8192,
        planRequired: 'PRO'
      },
      {
        name: 'gpt-4-turbo',
        provider: 'OPENAI',
        costPerInputToken: 0.00001,
        costPerOutputToken: 0.00003,
        maxContextLength: 128000,
        planRequired: 'PRO'
      }
    ]
    
    for (const model of models) {
      await prisma.aIModel.upsert({
        where: { name: model.name },
        update: {},
        create: model as any
      })
    }
    console.log('✅ AI models created')
    
    // Create plan limits
    console.log('\nCreating plan limits...')
    const planLimits = [
      {
        planType: 'FREE',
        dailyMessagesLimit: 10,
        monthlyTokensLimit: 100000,
        modelsAllowed: ['gpt-3.5-turbo'],
        featuresEnabled: ['chat']
      },
      {
        planType: 'PRO',
        dailyMessagesLimit: 500,
        monthlyTokensLimit: 10000000,
        modelsAllowed: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
        featuresEnabled: ['chat', 'voice', 'transcription', 'templates']
      },
      {
        planType: 'ENTERPRISE',
        dailyMessagesLimit: null,
        monthlyTokensLimit: null,
        modelsAllowed: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
        featuresEnabled: ['chat', 'voice', 'transcription', 'templates', 'api', 'priority']
      }
    ]
    
    for (const limit of planLimits) {
      await prisma.planLimit.upsert({
        where: { planType: limit.planType as any },
        update: {},
        create: limit as any
      })
    }
    console.log('✅ Plan limits created')
    
    // Check user count
    const userCount = await prisma.user.count()
    console.log(`\n📊 Total users: ${userCount}`)
    
    console.log('\n✅ Database test completed successfully!')
    
  } catch (error) {
    console.error('❌ Database test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDatabase()