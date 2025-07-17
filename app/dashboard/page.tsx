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
import { FeatureGrid } from '@/components/dashboard/feature-grid'
import { ModelSelector } from '@/components/dashboard/model-selector'
import { ProfessionalTemplates } from '@/components/dashboard/professional-templates'

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
    <div className="space-y-8 p-6">
      {/* Header Section - InnerAI Style */}
      <div className="flex flex-col space-y-4">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl font-semibold text-white">
            Olá {user?.name || 'Alexandre'}
          </h1>
          <p className="text-2xl text-gray-400 mt-2">
            Como posso ajudar hoje?
          </p>
        </div>
        
        {/* Model Selector */}
        <div className="flex justify-center lg:justify-start">
          <ModelSelector />
        </div>
      </div>

      {/* Quick Stats - InnerAI Style */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Mensagens Hoje</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{messagesUsed}</div>
            <Progress value={messageProgress} className="mt-2 h-1 bg-gray-700">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${messageProgress}%` }} />
            </Progress>
            <p className="text-xs text-gray-400 mt-1">
              {messagesLimit === 999999 ? 'Ilimitado' : `de ${messagesLimit}`}
            </p>
          </CardContent>
          {messageProgress > 80 && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="text-xs">Quase no limite</Badge>
            </div>
          )}
        </Card>

        <Card className="relative overflow-hidden bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Tokens Mensais</CardTitle>
            <Coins className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{tokensUsed.toLocaleString('pt-BR')}</div>
            <Progress value={tokenProgress} className="mt-2 h-1 bg-gray-700">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${tokenProgress}%` }} />
            </Progress>
            <p className="text-xs text-gray-400 mt-1">
              {tokenProgress.toFixed(1)}% usado
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Conversas</CardTitle>
            <Brain className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalConversations}</div>
            <p className="text-xs text-gray-400 mt-1">
              Total criadas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Plano Atual</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">{planType}</span>
              {planType !== 'FREE' && <Sparkles className="h-4 w-4 text-yellow-500" />}
            </div>
            {planType === 'FREE' && (
              <Link href="/pricing" className="text-xs text-purple-400 hover:text-purple-300 mt-1 inline-flex items-center">
                Fazer upgrade <TrendingUp className="ml-1 h-3 w-3" />
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Professional Templates Section */}
      <ProfessionalTemplates />

      {/* Main Feature Grid - InnerAI Style */}
      <div>
        <h2 className="text-xl font-semibold mb-6 text-white">Ferramentas Disponíveis</h2>
        <FeatureGrid />
      </div>

      {/* Plan Upgrade Banner - Only for FREE users */}
      {planType === 'FREE' && (
        <Card className="bg-gradient-to-r from-purple-900/20 to-purple-800/10 border-purple-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span>Desbloqueie Todo o Potencial do InnerAI</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Faça upgrade para o plano Pro e tenha acesso a recursos ilimitados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-start space-x-2">
                <div className="rounded-full bg-purple-500/20 p-1 mt-0.5">
                  <MessageSquare className="h-3 w-3 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Mensagens Ilimitadas</p>
                  <p className="text-xs text-gray-400">Converse sem limites diários</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="rounded-full bg-purple-500/20 p-1 mt-0.5">
                  <Brain className="h-3 w-3 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Todos os Modelos</p>
                  <p className="text-xs text-gray-400">GPT-4, Claude, e mais</p>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <div className="rounded-full bg-purple-500/20 p-1 mt-0.5">
                  <Sparkles className="h-3 w-3 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Recursos Premium</p>
                  <p className="text-xs text-gray-400">Imagens, vídeos, e mais</p>
                </div>
              </div>
            </div>
            <Link href="/pricing" className="inline-flex items-center justify-center rounded-md bg-purple-600 hover:bg-purple-700 px-4 py-2 text-sm font-medium text-white transition-colors">
              Ver Planos e Preços
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}