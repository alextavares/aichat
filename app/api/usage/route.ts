import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserUsageStats } from '@/lib/usage-limits'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (\!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get comprehensive usage statistics
    const usageStats = await getUserUsageStats(session.user.id)
    
    // Calculate reset date (next month)
    const now = new Date()
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    
    const response = {
      planType: usageStats.planType,
      tokensUsed: usageStats.monthly.tokens.used,
      tokensLimit: usageStats.monthly.tokens.limit || 999999999,
      messagesUsed: usageStats.daily.messages.used,
      messagesLimit: usageStats.daily.messages.limit || 999999,
      monthlyCost: usageStats.monthly.cost,
      resetDate: resetDate.toISOString(),
      breakdown: {
        daily: {
          messages: usageStats.daily.messages,
          tokens: usageStats.daily.tokens,
          cost: usageStats.daily.cost
        },
        monthly: {
          messages: usageStats.monthly.messages,
          tokens: usageStats.monthly.tokens,
          cost: usageStats.monthly.cost
        }
      },
      limits: {
        dailyMessageLimit: usageStats.daily.messages.limit,
        monthlyTokenLimit: usageStats.monthly.tokens.limit,
        hasUnlimitedMessages: usageStats.daily.messages.limit === 999999,
        hasUnlimitedTokens: usageStats.monthly.tokens.limit === 999999999
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error fetching usage data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage data' }, 
      { status: 500 }
    )
  }
}
EOF < /dev/null
