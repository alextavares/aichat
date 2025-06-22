import { prisma } from '@/lib/prisma'
import { PlanType } from '@prisma/client'

export interface UsageLimits {
  dailyMessages: number | null
  monthlyTokens: number | null
  modelsAllowed: string[]
}

export const PLAN_LIMITS: Record<PlanType, UsageLimits> = {
  FREE: {
    dailyMessages: 10,
    monthlyTokens: 100000,
    modelsAllowed: ['gpt-3.5-turbo', 'claude-3-haiku', 'mistral-7b', 'llama-2-13b'],
  },
  PRO: {
    dailyMessages: 500,
    monthlyTokens: 5000000,
    modelsAllowed: [
      'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo',
      'claude-3-sonnet', 'claude-3-haiku',
      'gemini-pro',
      'mixtral-8x7b', 'llama-2-70b',
      'phind-codellama-34b', 'deepseek-coder',
      'nous-hermes-2', 'openhermes-2.5',
    ],
  },
  ENTERPRISE: {
    dailyMessages: null, // unlimited
    monthlyTokens: null, // unlimited
    modelsAllowed: [
      // OpenAI
      'gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo',
      // Anthropic
      'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'claude-2.1', 'claude-2',
      // Google
      'gemini-pro', 'gemini-pro-vision', 'palm-2',
      // Meta
      'llama-2-70b', 'llama-2-13b', 'codellama-70b',
      // Mistral
      'mixtral-8x7b', 'mistral-7b',
      // Open Source
      'nous-hermes-2', 'openhermes-2.5', 'zephyr-7b',
      // Código
      'phind-codellama-34b', 'deepseek-coder', 'wizardcoder-33b',
      // Criativos
      'mythomist-7b', 'cinematika-7b', 'neural-chat-7b',
    ],
  },
}

export async function checkUsageLimits(userId: string, model?: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planType: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const limits = PLAN_LIMITS[user.planType]
  
  // Check model access
  if (model && !limits.modelsAllowed.includes(model)) {
    return {
      allowed: false,
      reason: `Model ${model} is not available for ${user.planType} plan`,
      planType: user.planType,
    }
  }

  // Check daily message limit
  if (limits.dailyMessages !== null) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const todayUsage = await prisma.userUsage.aggregate({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      _sum: {
        messagesCount: true,
      },
    })

    const messagesUsed = todayUsage._sum.messagesCount || 0
    
    if (messagesUsed >= limits.dailyMessages) {
      return {
        allowed: false,
        reason: `Daily message limit reached (${messagesUsed}/${limits.dailyMessages})`,
        planType: user.planType,
        usage: {
          dailyMessages: {
            used: messagesUsed,
            limit: limits.dailyMessages,
          },
        },
      }
    }
  }

  // Check monthly token limit
  if (limits.monthlyTokens !== null) {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    
    const monthlyUsage = await prisma.userUsage.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        inputTokensUsed: true,
        outputTokensUsed: true,
      },
    })

    const tokensUsed = (monthlyUsage._sum.inputTokensUsed || 0) + 
                       (monthlyUsage._sum.outputTokensUsed || 0)
    
    if (tokensUsed >= limits.monthlyTokens) {
      return {
        allowed: false,
        reason: `Monthly token limit reached (${tokensUsed.toLocaleString()}/${limits.monthlyTokens.toLocaleString()})`,
        planType: user.planType,
        usage: {
          monthlyTokens: {
            used: tokensUsed,
            limit: limits.monthlyTokens,
          },
        },
      }
    }
  }

  return {
    allowed: true,
    planType: user.planType,
    limits,
  }
}

export async function trackUsage(
  userId: string, 
  modelId: string,
  tokensUsed: { input: number; output: number },
  cost: number
) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const existingUsage = await prisma.userUsage.findFirst({
    where: {
      userId,
      modelId,
      date: today,
    },
  })

  if (existingUsage) {
    await prisma.userUsage.update({
      where: { id: existingUsage.id },
      data: {
        messagesCount: { increment: 1 },
        inputTokensUsed: { increment: tokensUsed.input },
        outputTokensUsed: { increment: tokensUsed.output },
        costIncurred: { increment: cost },
      },
    })
  } else {
    await prisma.userUsage.create({
      data: {
        userId,
        modelId,
        date: today,
        messagesCount: 1,
        inputTokensUsed: tokensUsed.input,
        outputTokensUsed: tokensUsed.output,
        costIncurred: cost,
      },
    })
  }
}

export async function getUserUsageStats(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [dailyUsage, monthlyUsage, user] = await Promise.all([
    prisma.userUsage.aggregate({
      where: {
        userId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      _sum: {
        messagesCount: true,
        inputTokensUsed: true,
        outputTokensUsed: true,
        costIncurred: true,
      },
    }),
    prisma.userUsage.aggregate({
      where: {
        userId,
        date: {
          gte: startOfMonth,
        },
      },
      _sum: {
        messagesCount: true,
        inputTokensUsed: true,
        outputTokensUsed: true,
        costIncurred: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { planType: true },
    }),
  ])

  if (!user) {
    throw new Error('User not found')
  }

  const limits = PLAN_LIMITS[user.planType]
  const dailyMessages = dailyUsage._sum.messagesCount || 0
  const monthlyTokens = (monthlyUsage._sum.inputTokensUsed || 0) + 
                        (monthlyUsage._sum.outputTokensUsed || 0)
  const monthlyCost = monthlyUsage._sum.costIncurred || 0

  return {
    planType: user.planType,
    daily: {
      messages: {
        used: dailyMessages,
        limit: limits.dailyMessages,
        remaining: limits.dailyMessages ? Math.max(0, limits.dailyMessages - dailyMessages) : null,
      },
      cost: dailyUsage._sum.costIncurred || 0,
    },
    monthly: {
      messages: monthlyUsage._sum.messagesCount || 0,
      tokens: {
        used: monthlyTokens,
        limit: limits.monthlyTokens,
        remaining: limits.monthlyTokens ? Math.max(0, limits.monthlyTokens - monthlyTokens) : null,
      },
      cost: monthlyCost,
    },
    modelsAllowed: limits.modelsAllowed,
  }
}