import { prisma } from '../lib/db'
import bcrypt from 'bcryptjs'

async function createTestUser() {
  try {
    console.log('Creating test user...')
    
    const hashedPassword = await bcrypt.hash('test123', 10)
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        passwordHash: hashedPassword,
        planType: 'FREE',
        profession: 'Developer',
        organization: 'Test Company'
      }
    })
    
    console.log('✅ Test user created successfully!')
    console.log('Email: test@example.com')
    console.log('Password: test123')
    console.log('User ID:', user.id)
    
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.log('User already exists')
    } else {
      console.error('❌ Failed to create test user:', error)
    }
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()