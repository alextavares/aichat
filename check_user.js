const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@test.com' }
    })
    
    if (user) {
      console.log('User found:', { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        hasPassword: !!user.passwordHash 
      })
      
      // Test password
      if (user.passwordHash) {
        const isValid = await bcrypt.compare('123456', user.passwordHash)
        console.log('Password valid for "123456":', isValid)
      }
      
      // Update password to ensure it's correct
      const newHash = await bcrypt.hash('123456', 12)
      await prisma.user.update({
        where: { email: 'test@test.com' },
        data: { passwordHash: newHash }
      })
      console.log('Password updated')
    } else {
      console.log('User not found, creating...')
      const hashedPassword = await bcrypt.hash('123456', 12)
      const newUser = await prisma.user.create({
        data: {
          email: 'test@test.com',
          name: 'Test User',
          passwordHash: hashedPassword,
          profession: 'Developer',
          organization: 'Test Org',
          onboardingCompleted: true
        }
      })
      console.log('User created:', newUser.id)
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()