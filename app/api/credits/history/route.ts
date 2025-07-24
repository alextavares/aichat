import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { CreditService } from '@/lib/credit-service'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const offset = parseInt(url.searchParams.get('offset') || '0')
    const type = url.searchParams.get('type') // 'all', 'purchase', 'consumption'

    // Get transaction history from database
    const transactions = await CreditService.getTransactionHistory(
      session.user.id,
      limit,
      offset
    )
    
    // Filter by type if specified
    const filteredTransactions = type && type !== 'all' 
      ? transactions.filter(t => {
          if (type === 'purchase') return ['PURCHASE', 'BONUS'].includes(t.type)
          if (type === 'consumption') return t.type === 'CONSUMPTION'
          return true
        })
      : transactions
    
    // Get monthly stats from database
    const monthlyStats = await CreditService.getMonthlyStats(session.user.id)
    
    // Get user credit statistics
    const userStats = await CreditService.getUserCreditStats(session.user.id)
    
    return NextResponse.json({
      transactions: filteredTransactions,
      monthlyStats,
      userStats,
      pagination: {
        limit,
        offset,
        hasMore: transactions.length === limit,
        total: filteredTransactions.length
      }
    })
  } catch (error) {
    console.error('Error fetching credit history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}