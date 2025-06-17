import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create AI Models
  const models = [
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OPENAI' as const,
      costPerInputToken: 0.0000005, // $0.50 per 1M tokens
      costPerOutputToken: 0.0000015, // $1.50 per 1M tokens
      maxContextLength: 4096,
      planRequired: 'FREE' as const
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OPENAI' as const,
      costPerInputToken: 0.00003, // $30 per 1M tokens
      costPerOutputToken: 0.00006, // $60 per 1M tokens
      maxContextLength: 8192,
      planRequired: 'PRO' as const
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OPENAI' as const,
      costPerInputToken: 0.00001, // $10 per 1M tokens
      costPerOutputToken: 0.00003, // $30 per 1M tokens
      maxContextLength: 128000,
      planRequired: 'PRO' as const
    }
  ]

  for (const model of models) {
    await prisma.aIModel.upsert({
      where: { id: model.id },
      update: model,
      create: model
    })
  }

  console.log('✅ AI Models created')

  // Create Plan Limits
  const planLimits = [
    {
      planType: 'FREE' as const,
      dailyMessagesLimit: 10,
      monthlyTokensLimit: 100000, // 100k tokens/month
      modelsAllowed: ['gpt-3.5-turbo'],
      featuresEnabled: ['chat']
    },
    {
      planType: 'PRO' as const,
      dailyMessagesLimit: 500,
      monthlyTokensLimit: 5000000, // 5M tokens/month
      modelsAllowed: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      featuresEnabled: ['chat', 'voice', 'transcription', 'templates']
    },
    {
      planType: 'ENTERPRISE' as const,
      dailyMessagesLimit: null, // Unlimited
      monthlyTokensLimit: null, // Unlimited
      modelsAllowed: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      featuresEnabled: ['chat', 'voice', 'transcription', 'templates', 'api_access', 'priority_support']
    }
  ]

  for (const limit of planLimits) {
    await prisma.planLimit.upsert({
      where: {
        planType: limit.planType
      },
      update: limit,
      create: limit
    })
  }

  console.log('✅ Plan limits created')

  // Create a test user (optional)
  const testUserEmail = 'test@example.com'
  const existingUser = await prisma.user.findUnique({
    where: { email: testUserEmail }
  })

  if (!existingUser) {
    const passwordHash = await bcrypt.hash('test123', 12)
    await prisma.user.create({
      data: {
        email: testUserEmail,
        name: 'Test User',
        passwordHash,
        planType: 'FREE',
        profession: 'Developer',
        organization: 'Test Org'
      }
    })
    console.log('✅ Test user created (test@example.com / test123)')
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })