// Script para debugar problemas da API
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function debugAPI() {
  console.log('🔍 Debugando API /api/usage/today...\n')
  
  try {
    // Simular sessão do usuário de teste
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        usage: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999))
            }
          }
        }
      }
    })
    
    console.log('👤 Usuário encontrado:', {
      id: testUser.id,
      email: testUser.email,
      planType: testUser.plan_type,
      usageToday: testUser.usage.length
    })
    
    // Buscar limites do plano
    const planLimits = await prisma.planLimit.findUnique({
      where: { plan_type: testUser.plan_type }
    })
    
    console.log('\n📊 Limites do plano:', {
      planType: planLimits.plan_type,
      dailyLimit: planLimits.daily_messages_limit,
      monthlyTokens: planLimits.monthly_tokens_limit
    })
    
    // Calcular uso de hoje
    const todayMessages = testUser.usage.reduce((total, usage) => 
      total + usage.messages_count, 0
    )
    
    console.log('\n📈 Uso de hoje:', {
      messages: todayMessages,
      limit: planLimits.daily_messages_limit,
      remaining: planLimits.daily_messages_limit - todayMessages
    })
    
    console.log('\n✅ API deve funcionar corretamente!')
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
    console.error('\nDetalhes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAPI()