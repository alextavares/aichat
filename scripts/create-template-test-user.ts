import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'template-test@example.com'
  const password = 'password123'
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })
  
  if (existingUser) {
    console.log('User already exists')
    return
  }
  
  // Create user
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Template Test User',
      passwordHash,
      planType: 'PRO',
      profession: 'Developer',
      organization: 'InnerAI Clone'
    }
  })
  
  console.log('User created:', {
    email: user.email,
    name: user.name,
    planType: user.planType
  })
  
  console.log('\nLogin credentials:')
  console.log('Email:', email)
  console.log('Password:', password)
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })