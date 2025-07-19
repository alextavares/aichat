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
import { ChatInput } from '@/components/dashboard/chat-input'

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
    <div className="space-y-6 py-4">
      {/* Header Section - InnerAI Style */}
      <div className="flex flex-col space-y-3">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl font-semibold text-white">
            Olá {user?.name || 'Alexandre'}
          </h1>
          <p className="text-lg text-gray-400 mt-1">
            Como posso ajudar hoje?
          </p>
        </div>
        
        {/* Model Selector */}
        <div className="flex justify-center lg:justify-start">
          <ModelSelector />
        </div>
      </div>


      {/* Main Feature Grid - InnerAI Style */}
      <FeatureGrid />

      {/* Chat Input Area - InnerAI Style */}
      <ChatInput />
    </div>
  )
}