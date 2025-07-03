import { prisma } from '../lib/prisma'

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com banco de dados de produção...\n')
  
  try {
    // Testar conexão básica
    console.log('1. Conectando ao banco...')
    await prisma.$connect()
    console.log('✅ Conexão estabelecida com sucesso')
    
    // Testar queries básicas
    console.log('\n2. Testando queries...')
    const userCount = await prisma.user.count()
    console.log(`✅ Usuários no banco: ${userCount}`)
    
    // Verificar tabelas essenciais
    console.log('\n3. Verificando estrutura do banco...')
    
    const conversationCount = await prisma.conversation.count()
    console.log(`✅ Conversas: ${conversationCount}`)
    
    const messageCount = await prisma.message.count()
    console.log(`✅ Mensagens: ${messageCount}`)
    
    // Verificar usuário de teste
    console.log('\n4. Verificando usuário de teste...')
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    if (testUser) {
      console.log('✅ Usuário de teste encontrado:', {
        id: testUser.id,
        email: testUser.email,
        name: testUser.name,
        planType: testUser.planType,
        createdAt: testUser.createdAt
      })
    } else {
      console.log('❌ Usuário de teste NÃO encontrado')
      console.log('💡 Execute: npx tsx scripts/create-test-user.ts')
    }
    
    // Verificar se há usuários ativos
    console.log('\n5. Verificando usuários recentes...')
    const recentUsers = await prisma.user.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { email: true, name: true, createdAt: true, planType: true }
    })
    
    if (recentUsers.length > 0) {
      console.log('✅ Usuários recentes:')
      recentUsers.forEach(user => {
        console.log(`  - ${user.email} (${user.planType}) - ${user.createdAt}`)
      })
    }
    
    console.log('\n🎉 BANCO DE DADOS: FUNCIONANDO CORRETAMENTE')
    
  } catch (error) {
    console.error('❌ ERRO NA CONEXÃO COM O BANCO:')
    console.error('Erro:', error.message)
    
    if (error.code === 'P1001') {
      console.log('\n💡 SOLUÇÃO: Verificar se o banco está online e acessível')
    } else if (error.code === 'P1002') {
      console.log('\n💡 SOLUÇÃO: Verificar timeout de conexão')
    } else if (error.code === 'P1008') {
      console.log('\n💡 SOLUÇÃO: Verificar se a DATABASE_URL está correta')
    }
    
    console.log('\n🔧 Passos para correção:')
    console.log('1. Verificar variável DATABASE_URL em produção')
    console.log('2. Verificar se o banco Supabase está online')
    console.log('3. Verificar regras de firewall/rede')
    console.log('4. Verificar se as credenciais estão corretas')
    
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Conexão encerrada')
  }
}

if (require.main === module) {
  testDatabaseConnection()
}

export { testDatabaseConnection }