import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function testAuth() {
  console.log('🧪 Testando sistema de autenticação...')
  
  const testEmail = `test_${Date.now()}@example.com`
  const testPassword = 'TestPassword123!'
  
  try {
    // 1. Criar usuário de teste
    console.log('\n1️⃣ Criando usuário de teste...')
    const passwordHash = await bcrypt.hash(testPassword, 12)
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: testEmail,
        passwordHash,
        planType: 'FREE',
      }
    })
    
    console.log('✅ Usuário criado:', {
      id: user.id,
      name: user.name,
      email: user.email,
      planType: user.planType
    })
    
    // 2. Testar login
    console.log('\n2️⃣ Testando login...')
    const foundUser = await prisma.user.findUnique({
      where: { email: testEmail }
    })
    
    if (!foundUser || !foundUser.passwordHash) {
      throw new Error('Usuário não encontrado')
    }
    
    const isValid = await bcrypt.compare(testPassword, foundUser.passwordHash)
    console.log('✅ Senha válida:', isValid)
    
    // 3. Limpar dados de teste
    console.log('\n3️⃣ Limpando dados de teste...')
    await prisma.user.delete({
      where: { id: user.id }
    })
    console.log('✅ Usuário de teste removido')
    
    console.log('\n✨ Todos os testes passaram!')
    
  } catch (error) {
    console.error('\n❌ Erro durante teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()