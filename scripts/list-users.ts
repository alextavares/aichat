import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        planType: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })
    
    console.log('📋 Users in database:\n')
    console.log('Email                          | Plan       | Name                | Created')
    console.log('------------------------------|------------|---------------------|------------------------')
    
    users.forEach(user => {
      const email = user.email.padEnd(29)
      const plan = (user.planType || 'FREE').padEnd(10)
      const name = (user.name || 'N/A').padEnd(19)
      const created = new Date(user.createdAt).toLocaleString()
      
      console.log(`${email} | ${plan} | ${name} | ${created}`)
    })
    
    console.log(`\nTotal users: ${users.length}`)
    
  } catch (error) {
    console.error('❌ Error listing users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()