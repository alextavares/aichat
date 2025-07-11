import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { MainChatLayout } from '@/components/dashboard/main-chat-layout'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  // Check if user completed onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true, name: true }
  })

  if (!user?.onboardingCompleted) {
    redirect('/onboarding')
  }

  return <MainChatLayout />
}