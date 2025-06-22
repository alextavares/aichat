import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  CreditCard,
  MessageSquare,
  TrendingUp,
  Brain,
  Clock,
  Zap,
  ArrowRight,
  Coins,
} from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getUserUsageStats, PLAN_LIMITS } from '@/lib/usage-limits'
import { AnalyticsChart } from '@/components/dashboard/analytics-chart'

async function getDashboardData(userId: string) {
  const [totalConversations, subscription, usageStats, analyticsData] = await Promise.all([
    prisma.conversation.count({
      where: { userId }
    }),
    prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      }
    }),
    getUserUsageStats(userId),
    getAnalyticsData(userId)
  ])

  return {
    totalConversations,
    subscription,
    usageStats,
    analyticsData
  }
}

async function getAnalyticsData(userId: string) {
  const [
    totalMessages,
    totalConversations,
    userUsageStats,
    recentActivity,
    modelUsage
  ] = await Promise.all([
    prisma.message.count({
      where: { conversation: { userId } }
    }),
    prisma.conversation.count({
      where: { userId }
    }),
    prisma.userUsage.findMany({
      where: {
        userId,
        date: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        model: true
      },
      orderBy: { date: 'desc' }
    }),
    prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        createdAt: true,
        modelUsed: true,
        _count: {
          select: { messages: true }
        }
      }
    }),
    prisma.message.groupBy({
      by: ['modelUsed'],
      where: {
        conversation: { userId },
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      _count: {
        modelUsed: true
      },
      _sum: {
        tokensUsed: true
      }
    })
  ])

  // Calculate daily usage for chart
  const dailyUsage = userUsageStats.reduce((acc: Record<string, any>, stat) => {
    const date = stat.date.toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = {
        date,
        messages: 0,
        tokens: 0,
        cost: 0
      }
    }
    acc[date].messages += stat.messagesCount
    acc[date].tokens += stat.inputTokensUsed + stat.outputTokensUsed
    acc[date].cost += Number(stat.costIncurred)
    return acc
  }, {} as Record<string, any>)

  const chartData = Object.values(dailyUsage).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const totalCost = userUsageStats.reduce((sum: number, stat) => sum + Number(stat.costIncurred), 0)
  const totalTokens = userUsageStats.reduce((sum: number, stat) => sum + stat.inputTokensUsed + stat.outputTokensUsed, 0)

  return {
    overview: {
      totalMessages,
      totalConversations,
      totalCost,
      totalTokens
    },
    chartData,
    recentActivity,
    modelUsage: modelUsage.map((model: any) => ({
      model: model.modelUsed || 'unknown',
      count: model._count.modelUsed,
      tokens: model._sum.tokensUsed || 0
    }))
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  // Check if user completed onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboardingCompleted: true }
  })

  if (!user?.onboardingCompleted) {
    redirect('/onboarding')
  }

  const { totalConversations, subscription, usageStats, analyticsData } = await getDashboardData(session.user.id)

  const planType = usageStats.planType
  const messagesUsed = usageStats.daily.messages.used
  const messagesLimit = usageStats.daily.messages.limit || 999999
  const tokensUsed = usageStats.monthly.tokens.used
  const tokensLimit = usageStats.monthly.tokens.limit || 999999999
  const monthlyCost = usageStats.monthly.cost

  const messageProgress = messagesLimit ? (messagesUsed / messagesLimit) * 100 : 0
  const tokenProgress = tokensLimit ? (tokensUsed / tokensLimit) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Bem-vindo de volta, {session.user.name}! Aqui está um resumo da sua atividade.
        </p>
      </div>

      {/* Quick Stats - InnerAI Style */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messagesUsed}</div>
            <Progress value={messageProgress} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {messagesUsed} de {messagesLimit === 999999 ? '∞' : messagesLimit} mensagens
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tokens Mensais</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Coins className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokensUsed.toLocaleString()}</div>
            <Progress value={tokenProgress} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {tokenProgress.toFixed(1)}% de {tokensLimit === 999999999 ? '∞' : tokensLimit.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Totais</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Desde o início da conta
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Mensal</CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {monthlyCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Em uso de tokens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions - InnerAI Style */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Link href="/dashboard/chat" className="group">
          <Card className="h-[200px] flex flex-col items-center justify-center text-center p-6 hover-elevation card-hover cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg mb-2">Nova Conversa</CardTitle>
            <CardDescription className="text-sm">
              Inicie um novo chat com IA
            </CardDescription>
          </Card>
        </Link>

        <Link href="/dashboard/history" className="group">
          <Card className="h-[200px] flex flex-col items-center justify-center text-center p-6 hover-elevation card-hover cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg mb-2">Histórico</CardTitle>
            <CardDescription className="text-sm">
              Veja suas conversas anteriores
            </CardDescription>
          </Card>
        </Link>

        <Link href="/dashboard/templates" className="group">
          <Card className="h-[200px] flex flex-col items-center justify-center text-center p-6 hover-elevation card-hover cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg mb-2">Templates</CardTitle>
            <CardDescription className="text-sm">
              Use prompts pré-configurados
            </CardDescription>
          </Card>
        </Link>

        <Link href="/dashboard/models" className="group">
          <Card className="h-[200px] flex flex-col items-center justify-center text-center p-6 hover-elevation card-hover cursor-pointer">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg mb-2">Modelos IA</CardTitle>
            <CardDescription className="text-sm">
              Explore diferentes modelos
            </CardDescription>
          </Card>
        </Link>
      </div>

      {/* Analytics Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-4">Analytics</h2>
        <AnalyticsChart data={analyticsData} />
      </div>

      {/* Plan Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Seu Plano Atual</CardTitle>
            <Badge variant={planType === 'ENTERPRISE' ? 'default' : 'secondary'}>
              {planType}
            </Badge>
          </div>
          <CardDescription>
            {planType === 'FREE' 
              ? 'Faça upgrade para desbloquear mais recursos'
              : 'Você tem acesso a todos os recursos premium'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {planType === 'FREE' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Benefícios do Upgrade:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Até 1000 mensagens por dia</li>
                  <li>✓ Acesso a modelos GPT-4</li>
                  <li>✓ Templates personalizados</li>
                  <li>✓ Suporte prioritário</li>
                </ul>
              </div>
              <Button asChild className="w-full">
                <Link href="/pricing">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Fazer Upgrade
                </Link>
              </Button>
            </div>
          )}
          {subscription && (
            <div className="text-sm text-muted-foreground">
              <p>Renovação: {subscription.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('pt-BR') : 'N/A'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}