import { PrismaClient, PlanType } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserPlan(email: string, planType: PlanType) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.error(`❌ User with email ${email} not found`)
      return
    }
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { planType }
    })
    
    console.log(`✅ Updated user ${email} to plan ${planType}`)
    console.log(`   Current plan: ${updatedUser.planType}`)
    
  } catch (error) {
    console.error('❌ Error updating user plan:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Get arguments from command line
const email = process.argv[2]
const plan = process.argv[3] as PlanType

if (!email || !plan) {
  console.log('Usage: npx tsx scripts/update-user-plan.ts <email> <plan>')
  console.log('Plans: FREE, PRO, ENTERPRISE')
  console.log('Example: npx tsx scripts/update-user-plan.ts test@example.com PRO')
  process.exit(1)
}

if (!['FREE', 'PRO', 'ENTERPRISE'].includes(plan)) {
  console.error('❌ Invalid plan. Must be FREE, PRO, or ENTERPRISE')
  process.exit(1)
}

updateUserPlan(email, plan)