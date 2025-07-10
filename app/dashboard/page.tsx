import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  MessageSquare,
  Coins,
  Brain,
  CreditCard,
  Sparkles,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getUserUsageStats } from '@/lib/usage-limits'
import { MarketplaceLayout } from '@/components/dashboard/marketplace-layout'

async function getDashboardData(userId: string) {
  const [totalConversations, subscription, usageStats] = await Promise.all([
    prisma.conversation.count({
      where: { userId }
    }),
    prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      }
    }),
    getUserUsageStats(userId)
  ])

  return {
    totalConversations,
    subscription,
    usageStats
  }
}

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

  const { totalConversations, subscription, usageStats } = await getDashboardData(session.user.id)

  const planType = usageStats.planType
  const messagesUsed = usageStats.daily.messages.used
  const messagesLimit = usageStats.daily.messages.limit || 999999
  const tokensUsed = usageStats.monthly.tokens.used
  const tokensLimit = usageStats.monthly.tokens.limit || 999999999
  const monthlyCost = usageStats.monthly.cost

  const messageProgress = messagesLimit ? (messagesUsed / messagesLimit) * 100 : 0
  const tokenProgress = tokensLimit ? (tokensUsed / tokensLimit) * 100 : 0

  return (
    <div className="space-y-8">
      {/* Quick Stats - Simplified */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messagesUsed}</div>
            <Progress value={messageProgress} className="mt-2 h-1" />
            <p className="text-xs text-muted-foreground mt-1">
              {messagesLimit === 999999 ? 'Ilimitado' : `de ${messagesLimit}`}
            </p>
          </CardContent>
          {messageProgress > 80 && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="text-xs">Quase no limite</Badge>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total criadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plano Atual</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{planType}</span>
              {planType !== 'FREE' && <Sparkles className="h-4 w-4 text-yellow-500" />}
            </div>
            {planType === 'FREE' && (
              <Link href="/pricing" className="text-xs text-primary hover:underline mt-1 inline-flex items-center">
                Fazer upgrade <TrendingUp className="ml-1 h-3 w-3" />
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Rápido</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/chat">
              <div className="text-center">
                <div className="text-lg font-bold text-primary">💬</div>
                <p className="text-xs text-muted-foreground mt-1">Iniciar chat</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Main Marketplace Layout */}
      <MarketplaceLayout userPlan={planType} />

    </div>
  )
}