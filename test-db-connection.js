const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
})

async function testConnection() {
  console.log('🔍 Testando conexão com o banco de dados...\n')
  
  try {
    // Testar conexão
    await prisma.$connect()
    console.log('✅ Conectado ao banco de dados!\n')
    
    // Verificar tabelas
    console.log('📊 Verificando tabelas:')
    
    // Contar usuários
    const userCount = await prisma.user.count()
    console.log(`- Users: ${userCount} registros`)
    
    // Verificar se existe usuário de teste
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    console.log(`- Usuário de teste: ${testUser ? 'Existe' : 'Não existe'}`)
    
    // Verificar plan limits
    const planLimits = await prisma.planLimit.findMany()
    console.log(`- Plan Limits: ${planLimits.length} planos configurados`)
    
    // Verificar templates
    const templates = await prisma.promptTemplate.count()
    console.log(`- Templates: ${templates} templates disponíveis`)
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message)
    console.error('\nDetalhes:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()