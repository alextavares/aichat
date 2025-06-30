import { prisma } from '@/lib/prisma'
import { PlanType } from '@prisma/client'

export interface UsageLimits {
  dailyMessages: number | null
  monthlyTokens: number | null
  monthlyAdvancedMessages: number | null
  modelsAllowed: {
    fast: string[]
    advanced: string[]
  }
  monthlyCredits: number | null
}

export const PLAN_LIMITS: Record<PlanType, UsageLimits> = {
  FREE: {
    dailyMessages: null, // unlimited for fast models
    monthlyTokens: null, // unlimited for fast models
    monthlyAdvancedMessages: 120,
    modelsAllowed: {
      fast: [
        'gpt-4o-mini',
        'claude-3.5-haiku',
        'gemini-2-flash-free',
        'mistral-7b',
        'llama-2-13b',
        'llama-3.3-70b',
        'deepseek-r1',
        'grok-3-mini',
        'perplexity-sonar',
        'qwq-32b'
      ],
      advanced: [
        'gpt-4o',
        'claude-3.5-sonnet',
        'gemini-2-pro',
        'grok-3',
        'perplexity-sonar-pro',
        'perplexity-reasoning',
        'mistral-large-2'
      ]
    },
    monthlyCredits: 0, // no credits for image/video/audio
  },
  PRO: {
    dailyMessages: null, // unlimited
    monthlyTokens: null, // unlimited
    monthlyAdvancedMessages: null, // unlimited
    modelsAllowed: {
      fast: [
        'gpt-3.5-turbo',
        'gpt-4o-mini',
        'claude-3-haiku',
        'claude-3.5-haiku',
        'gemini-2-flash',
        'gemini-2-flash-free',
        'mistral-7b',
        'llama-2-13b',
        'llama-3.3-70b',
        'deepseek-r1',
        'grok-3-mini',
        'perplexity-sonar',
        'qwq-32b',
        'qwen-2.5-coder'
      ],
      advanced: [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4o',
        'claude-3-sonnet',
        'claude-3.5-sonnet',
        'gemini-pro',
        'gemini-2-pro',
        'mixtral-8x7b',
        'mistral-large-2',
        'llama-2-70b',
        'llama-3.1-405b',
        'grok-3',
        'grok-2-vision',
        'perplexity-sonar-pro',
        'perplexity-reasoning',
        'qwen-2.5-72b'
      ]
    },
    monthlyCredits: 7000, // for image/video/audio generation
  },
  ENTERPRISE: {
    dailyMessages: null, // unlimited
    monthlyTokens: null, // unlimited
    monthlyAdvancedMessages: null, // unlimited
    modelsAllowed: {
      fast: [
        'gpt-3.5-turbo',
        'gpt-4o-mini',
        'claude-3-haiku',
        'claude-3.5-haiku',
        'gemini-2-flash',
        'gemini-2-flash-free',
        'mistral-7b',
        'llama-2-13b',
        'llama-3.3-70b',
        'deepseek-r1',
        'grok-3-mini',
        'perplexity-sonar',
        'qwq-32b',
        'qwen-2.5-coder',
        'neural-chat-7b',
        'mythomist-7b'
      ],
      advanced: [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4o',
        'claude-3-opus',
        'claude-3-sonnet',
        'claude-3.5-sonnet',
        'gemini-pro',
        'gemini-2-pro',
        'gemini-pro-vision',
        'mixtral-8x7b',
        'mistral-large-2',
        'llama-2-70b',
        'llama-3.1-405b',
        'llama-3.2-90b-vision',
        'codellama-70b',
        'grok-3',
        'grok-2-vision',
        'perplexity-sonar-pro',
        'perplexity-reasoning',
        'qwen-2.5-72b',
        'phind-codellama-34b',
        'deepseek-coder',
        'wizardcoder-33b',
        'nous-hermes-2',
        'openhermes-2.5',
        'zephyr-7b',
        'cinematika-7b'
      ]
    },
    monthlyCredits: null, // unlimited credits
  },
}

// Função auxiliar para determinar se um modelo é fast ou advanced
export function getModelType(model: string): 'fast' | 'advanced' | null {
  for (const plan of Object.values(PLAN_LIMITS)) {
    if (plan.modelsAllowed.fast.includes(model)) return 'fast'
    if (plan.modelsAllowed.advanced.includes(model)) return 'advanced'
  }
  return null
}

export async function checkUsageLimits(userId: string, model?: string, modelType?: 'fast' | 'advanced') {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { planType: true },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const limits = PLAN_LIMITS[user.planType]
  
  // Check model access
  if (model) {
    const allAllowedModels = [...limits.modelsAllowed.fast, ...limits.modelsAllowed.advanced]
    if (!allAllowedModels.includes(model)) {
      return {
        allowed: false,
        reason: `Model ${model} is not available for ${user.planType} plan`,
        planType: user.planType,
      }
    }
    
    // Determine if model is fast or advanced
    const isFastModel = limits.modelsAllowed.fast.includes(model)
    const isAdvancedModel = limits.modelsAllowed.advanced.includes(model)
    
    // For advanced models, check monthly limit for FREE plan
    if (isAdvancedModel && user.planType === 'FREE' && limits.monthlyAdvancedMessages !== null) {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)
      
      const monthlyAdvancedUsage = await prisma.userUsage.aggregate({
        where: {
          userId,
          date: {
            gte: startOfMonth,
          },
          model: {
            name: {
              in: limits.modelsAllowed.advanced
            }
          }
        },
        _sum: {
          messagesCount: true,
        },
      })

      const advancedMessagesUsed = monthlyAdvancedUsage._sum.messagesCount || 0
      
      if (advancedMessagesUsed >= limits.monthlyAdvancedMessages) {
        return {
          allowed: false,
          reason: `Monthly advanced messages limit reached (${advancedMessagesUsed}/${limits.monthlyAdvancedMessages})`,
          planType: user.planType,
          usage: {
            monthlyAdvancedMessages: {
              used: advancedMessagesUsed,
              limit: limits.monthlyAdvancedMessages,
            },
          },
        }
      }
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

  // Use upsert for a more atomic and potentially efficient operation
  await prisma.userUsage.upsert({
    where: {
      // This relies on the @@unique([userId, modelId, date]) constraint in schema.prisma
      userId_modelId_date: {
        userId,
        modelId,
        date: today,
      },
    },
    create: {
      userId,
      modelId,
      date: today,
      messagesCount: 1,
      inputTokensUsed: tokensUsed.input,
      outputTokensUsed: tokensUsed.output,
      costIncurred: cost,
    },
    update: {
      messagesCount: { increment: 1 },
      inputTokensUsed: { increment: tokensUsed.input },
      outputTokensUsed: { increment: tokensUsed.output },
      costIncurred: { increment: cost },
    },
  })
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

  // Calculate advanced messages used for FREE plan
  const monthlyAdvancedMessages = user.planType === 'FREE' ? await prisma.userUsage.aggregate({
    where: {
      userId,
      date: {
        gte: startOfMonth,
      },
      model: {
        name: {
          in: limits.modelsAllowed.advanced
        }
      }
    },
    _sum: {
      messagesCount: true,
    },
  }) : null

  const advancedMessagesUsed = monthlyAdvancedMessages?._sum.messagesCount || 0

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
      advancedMessages: {
        used: advancedMessagesUsed,
        limit: limits.monthlyAdvancedMessages,
        remaining: limits.monthlyAdvancedMessages ? Math.max(0, limits.monthlyAdvancedMessages - advancedMessagesUsed) : null,
      },
      tokens: {
        used: monthlyTokens,
        limit: limits.monthlyTokens,
        remaining: limits.monthlyTokens ? Math.max(0, limits.monthlyTokens - monthlyTokens) : null,
      },
      credits: {
        used: 0, // TODO: implement credit tracking
        limit: limits.monthlyCredits,
        remaining: limits.monthlyCredits ? limits.monthlyCredits : null,
      },
      cost: monthlyCost,
    },
    modelsAllowed: limits.modelsAllowed,
  }
}