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
  TrendingUp,
  ShoppingCart,
  History
} from 'lucide-react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getUserUsageStats } from '@/lib/usage-limits'
import { FeatureGrid } from '@/components/dashboard/feature-grid'
import { ModelSelector } from '@/components/dashboard/model-selector'
import { ProfessionalTemplates } from '@/components/dashboard/professional-templates'
import { CreditService } from '@/lib/credit-service'

async function getDashboardData(userId: string) {
  // Get core data
  let totalConversations = 0
  let subscription = null
  let usageStats = null
  
  try {
    [totalConversations, subscription, usageStats] = await Promise.all([
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
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    // Return defaults if database queries fail
    usageStats = {
      planType: 'FREE',
      daily: { messages: { used: 0, limit: 20 } },
      monthly: { tokens: { used: 0, limit: 50000 }, cost: 0 }
    }
  }

  // Try to get credit data, but fall back to defaults if tables don't exist yet
  let creditBalance = 0
  let creditStats = { consumed: 0, purchased: 0 }
  
  try {
    const [balance, stats] = await Promise.all([
      CreditService.getBalance(userId),
      CreditService.getMonthlyStats(userId)
    ])
    creditBalance = balance
    creditStats = stats
  } catch (error) {
    console.error('Error fetching credit data:', error)
    // Continue with default values - this allows the dashboard to load
    // even if credit tables haven't been migrated yet
  }

  return {
    totalConversations,
    subscription,
    usageStats,
    creditBalance,
    creditStats
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    console.log('No session found, should redirect to login')
    redirect('/auth/signin')
  }

  // Check if user exists in database - create if doesn't exist (OAuth users)
  let user = null
  try {
    user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompleted: true, name: true }
    })
    
    // If user doesn't exist, create them (OAuth login)
    if (!user) {
      console.log('User not found in database, creating new user:', session.user.email)
      try {
        user = await prisma.user.create({
          data: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.name || 'Usuário',
            onboardingCompleted: true, // Set to true for OAuth users
            creditBalance: 1000 // Start with 1000 credits
          },
          select: { onboardingCompleted: true, name: true }
        })
        console.log('Created new user from OAuth login:', session.user.email)
      } catch (createError) {
        console.error('Error creating user from OAuth:', createError)
        // If we can't create user, continue with default data
        user = { onboardingCompleted: true, name: session.user.name || 'Usuário' }
      }
    }
  } catch (error) {
    console.error('Error fetching user:', error)
    // Fallback to session data if database fails
    user = { onboardingCompleted: true, name: session.user.name || 'Usuário' }
  }

  // If user needs onboarding, redirect
  if (!user?.onboardingCompleted) {
    redirect('/onboarding')
  }

  const { totalConversations, subscription, usageStats, creditBalance, creditStats } = await getDashboardData(session.user.id)

  const planType = usageStats.planType
  const messagesUsed = usageStats.daily.messages.used
  const messagesLimit = usageStats.daily.messages.limit || 999999
  const tokensUsed = usageStats.monthly.tokens.used
  const tokensLimit = usageStats.monthly.tokens.limit || 999999999
  const monthlyCost = usageStats.monthly.cost

  const messageProgress = messagesLimit ? (messagesUsed / messagesLimit) * 100 : 0
  const tokenProgress = tokensLimit ? (tokensUsed / tokensLimit) * 100 : 0

  return (
    <div className="space-y-8 py-6">
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
            <CardTitle className="text-sm font-medium text-gray-300">Saldo de Créditos</CardTitle>
            <Coins className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{creditBalance.toLocaleString('pt-BR')}</div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Créditos disponíveis
              </p>
              <Link href="/dashboard/credits/purchase" className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center">
                <ShoppingCart className="h-3 w-3 mr-1" />
                Comprar
              </Link>
            </div>
          </CardContent>
          {creditBalance < 100 && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive" className="text-xs">Saldo baixo</Badge>
            </div>
          )}
        </Card>

        <Card className="relative overflow-hidden bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Gastos do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{creditStats.consumed.toLocaleString('pt-BR')}</div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Créditos consumidos
              </p>
              <Link href="/dashboard/credits/history" className="text-xs text-purple-400 hover:text-purple-300 inline-flex items-center">
                <History className="h-3 w-3 mr-1" />
                Histórico
              </Link>
            </div>
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

      {/* Credit System & Upgrade Banner */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-to-r from-blue-900/20 to-blue-800/10 border-blue-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-white">
              <Coins className="h-5 w-5 text-blue-400" />
              <span>Sistema de Créditos</span>
            </CardTitle>
            <CardDescription className="text-gray-300">
              Controle seus gastos com nosso sistema de créditos flexível
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Saldo atual:</span>
                <span className="font-semibold text-white">{creditBalance.toLocaleString('pt-BR')} créditos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Consumo mensal:</span>
                <span className="font-semibold text-white">{creditStats.consumed.toLocaleString('pt-BR')} créditos</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Compras:</span>
                <span className="font-semibold text-white">{creditStats.purchased.toLocaleString('pt-BR')} créditos</span>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href="/dashboard/credits/purchase" className="flex-1 inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 px-3 py-2 text-sm font-medium text-white transition-colors">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Comprar Créditos
              </Link>
              <Link href="/dashboard/credits/history" className="flex-1 inline-flex items-center justify-center rounded-md border border-blue-600 hover:bg-blue-600/10 px-3 py-2 text-sm font-medium text-blue-400 transition-colors">
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Link>
            </div>
          </CardContent>
        </Card>

        {planType === 'FREE' && (
          <Card className="bg-gradient-to-r from-purple-900/20 to-purple-800/10 border-purple-500/30 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span>Upgrade para Pro</span>
              </CardTitle>
              <CardDescription className="text-gray-300">
                Mais créditos e recursos avançados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="rounded-full bg-purple-500/20 p-1 mt-0.5">
                    <Coins className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">7.000 créditos mensais</p>
                    <p className="text-xs text-gray-400">Para imagem, áudio e vídeo</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="rounded-full bg-purple-500/20 p-1 mt-0.5">
                    <Brain className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Todos os Modelos</p>
                    <p className="text-xs text-gray-400">GPT-4o, Claude 4, Gemini 2.5</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="rounded-full bg-purple-500/20 p-1 mt-0.5">
                    <Sparkles className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Recursos Premium</p>
                    <p className="text-xs text-gray-400">Assistentes e anexos ilimitados</p>
                  </div>
                </div>
              </div>
              <Link href="/pricing" className="mt-4 inline-flex items-center justify-center rounded-md bg-purple-600 hover:bg-purple-700 px-4 py-2 text-sm font-medium text-white transition-colors w-full">
                Ver Planos e Preços
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}