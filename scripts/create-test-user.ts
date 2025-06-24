import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'

async function createTestUser() {
  const email = 'test@example.com'
  const password = 'test123'

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Usuário já existe:', email)
      console.log('Deletando usuário existente...')
      await prisma.user.delete({
        where: { email }
      })
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: {
        email,
        name: 'Test User',
        passwordHash: hashedPassword,
        planType: 'FREE',
        profession: 'Developer',
        organization: 'Test Organization'
      }
    })

    console.log('\n✅ Usuário de teste criado com sucesso!')
    console.log('📧 Email:', email)
    console.log('🔑 Senha:', password)
    console.log('🆔 User ID:', user.id)
    console.log('\nUse essas credenciais para fazer login em http://localhost:3000/auth/signin')
  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()