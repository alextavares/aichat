import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'payment-test@example.com'
  const password = 'testpassword123'
  
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })
  
  if (existingUser) {
    console.log('User already exists:', email)
    return
  }
  
  // Create user
  const hashedPassword = await hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Payment Test User',
      passwordHash: hashedPassword,
      planType: 'FREE',
      onboardingCompleted: true
    }
  })
  
  console.log('Created test user:')
  console.log('Email:', email)
  console.log('Password:', password)
  console.log('User ID:', user.id)
  console.log('Plan:', user.planType)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })