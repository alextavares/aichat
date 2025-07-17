import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCredits() {
  console.log('🌱 Seeding credit system...')

  // Create credit packages based on InnerAI reference
  const packages = [
    {
      name: '5.000 créditos',
      credits: 5000,
      price: 59.00,
      currency: 'BRL',
      discountPercent: null
    },
    {
      name: '10.000 créditos',
      credits: 10000,
      price: 99.00,
      currency: 'BRL',
      discountPercent: 15
    },
    {
      name: '20.000 créditos',
      credits: 20000,
      price: 159.00,
      currency: 'BRL',
      discountPercent: 30
    }
  ]

  // Upsert credit packages
  for (const pkg of packages) {
    await prisma.creditPackage.upsert({
      where: { name: pkg.name },
      update: pkg,
      create: pkg
    })
  }

  // Update AI models with credit costs (based on InnerAI usage patterns)
  const modelUpdates = [
    {
      name: 'gpt-4o-mini',
      creditsPerInputToken: 1,
      creditsPerOutputToken: 2
    },
    {
      name: 'gpt-4o',
      creditsPerInputToken: 5,
      creditsPerOutputToken: 10
    },
    {
      name: 'claude-3-haiku-20240307',
      creditsPerInputToken: 1,
      creditsPerOutputToken: 3
    },
    {
      name: 'claude-3-5-sonnet-20241022',
      creditsPerInputToken: 8,
      creditsPerOutputToken: 15
    }
  ]

  for (const update of modelUpdates) {
    await prisma.aIModel.updateMany({
      where: { name: update.name },
      data: {
        creditsPerInputToken: update.creditsPerInputToken,
        creditsPerOutputToken: update.creditsPerOutputToken
      }
    })
  }

  // Create/update tools with credit costs (based on InnerAI reference)
  const toolUpdates = [
    {
      name: 'Geração de Imagens',
      type: 'IMAGE_GENERATION',
      creditsPerUse: 135,
      costPerUse: 0.10
    },
    {
      name: 'Transcrição de Vídeo',
      type: 'TRANSCRIPTION',
      creditsPerUse: 80,
      costPerUse: 0.05
    },
    {
      name: 'Modo de Voz da IA',
      type: 'VOICE_GENERATION',
      creditsPerUse: 50,
      costPerUse: 0.03
    },
    {
      name: 'Efeitos Sonoros',
      type: 'SOUND_EFFECTS',
      creditsPerUse: 30,
      costPerUse: 0.02
    }
  ]

  for (const tool of toolUpdates) {
    await prisma.tool.upsert({
      where: { name: tool.name },
      update: {
        creditsPerUse: tool.creditsPerUse,
        costPerUse: tool.costPerUse
      },
      create: {
        name: tool.name,
        type: tool.type as any,
        creditsPerUse: tool.creditsPerUse,
        costPerUse: tool.costPerUse,
        planRequired: 'FREE'
      }
    })
  }

  // Give initial credits to existing users (migration bonus)
  const users = await prisma.user.findMany({
    where: { creditBalance: 0 },
    select: { id: true }
  })

  for (const user of users) {
    await prisma.user.update({
      where: { id: user.id },
      data: { creditBalance: 500 } // Initial bonus credits
    })

    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: 'BONUS',
        amount: 500,
        description: 'Bônus de migração - créditos iniciais',
        balanceBefore: 0,
        balanceAfter: 500
      }
    })
  }

  console.log('✅ Credit system seeded successfully!')
}

seedCredits()
  .catch((e) => {
    console.error('❌ Error seeding credits:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })