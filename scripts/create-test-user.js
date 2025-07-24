const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    const email = '11@gmail.com'
    const password = 'Y*mare2025'
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: 'Usuário Teste QA',
        passwordHash: hashedPassword,
      },
    })

    console.log('Test user created/updated:', { email, password: 'Y*mare2025' })
    console.log('User ID:', user.id)
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()