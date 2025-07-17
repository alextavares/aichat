const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting credit system seed...');

  // Create Credit Packages
  const creditPackages = [
    {
      id: "pkg_5k",
      name: "Pacote 5K",
      credits: 5000,
      price: 29.90,
      currency: "BRL",
      discountPercent: 0,
      isActive: true
    },
    {
      id: "pkg_10k",
      name: "Pacote 10K",
      credits: 10000,
      price: 49.90,
      currency: "BRL",
      discountPercent: 15,
      isActive: true
    },
    {
      id: "pkg_20k",
      name: "Pacote 20K",
      credits: 20000,
      price: 79.90,
      currency: "BRL",
      discountPercent: 33,
      isActive: true
    }
  ];

  for (const pkg of creditPackages) {
    await prisma.creditPackage.upsert({
      where: { id: pkg.id },
      update: pkg,
      create: pkg
    });
  }

  console.log('✅ Credit packages created');

  // Update AI Models with credit rates
  const aiModels = [
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OPENAI',
      costPerInputToken: 0.0000005,
      costPerOutputToken: 0.0000015,
      maxContextLength: 4096,
      planRequired: 'FREE',
      creditsPerInputToken: 0.001,
      creditsPerOutputToken: 0.003
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OPENAI',
      costPerInputToken: 0.00003,
      costPerOutputToken: 0.00006,
      maxContextLength: 8192,
      planRequired: 'PRO',
      creditsPerInputToken: 0.03,
      creditsPerOutputToken: 0.06
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      provider: 'OPENAI',
      costPerInputToken: 0.00001,
      costPerOutputToken: 0.00003,
      maxContextLength: 128000,
      planRequired: 'PRO',
      creditsPerInputToken: 0.01,
      creditsPerOutputToken: 0.03
    },
    {
      id: 'claude-3-haiku',
      name: 'Claude 3 Haiku',
      provider: 'ANTHROPIC',
      costPerInputToken: 0.00000025,
      costPerOutputToken: 0.00000125,
      maxContextLength: 200000,
      planRequired: 'FREE',
      creditsPerInputToken: 0.0005,
      creditsPerOutputToken: 0.0025
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'ANTHROPIC',
      costPerInputToken: 0.000003,
      costPerOutputToken: 0.000015,
      maxContextLength: 200000,
      planRequired: 'PRO',
      creditsPerInputToken: 0.006,
      creditsPerOutputToken: 0.03
    }
  ];

  for (const model of aiModels) {
    await prisma.aIModel.upsert({
      where: { id: model.id },
      update: model,
      create: model
    });
  }

  console.log('✅ AI Models updated with credit rates');

  // Create/Update Tools with credit costs
  const tools = [
    {
      id: 'image-generation',
      name: 'Image Generation',
      type: 'IMAGE_GENERATION',
      costPerUse: 135.00,
      creditsPerUse: 135,
      planRequired: 'FREE',
      isActive: true
    },
    {
      id: 'video-transcription',
      name: 'Video Transcription',
      type: 'TRANSCRIPTION',
      costPerUse: 50.00,
      creditsPerUse: 50,
      planRequired: 'FREE',
      isActive: true
    },
    {
      id: 'voice-generation',
      name: 'Voice Generation',
      type: 'VOICE_GENERATION',
      costPerUse: 25.00,
      creditsPerUse: 25,
      planRequired: 'FREE',
      isActive: true
    },
    {
      id: 'sound-effects',
      name: 'Sound Effects',
      type: 'SOUND_EFFECTS',
      costPerUse: 15.00,
      creditsPerUse: 15,
      planRequired: 'FREE',
      isActive: true
    }
  ];

  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { id: tool.id },
      update: tool,
      create: tool
    });
  }

  console.log('✅ Tools created with credit costs');

  // Give test users some initial credits
  const testUsers = await prisma.user.findMany({
    where: {
      OR: [
        { email: 'test@example.com' },
        { email: { contains: 'test' } }
      ]
    }
  });

  for (const user of testUsers) {
    await prisma.user.update({
      where: { id: user.id },
      data: { creditBalance: 1000 }
    });

    // Create initial credit transaction
    await prisma.creditTransaction.create({
      data: {
        userId: user.id,
        type: 'BONUS',
        amount: 1000,
        description: 'Initial bonus credits',
        balanceBefore: 0,
        balanceAfter: 1000
      }
    });
  }

  console.log('✅ Test users credited with initial balance');

  console.log('🎉 Credit system seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Credit seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });