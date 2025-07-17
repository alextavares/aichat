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

    const transactions = await CreditService.getTransactionHistory(
      session.user.id,
      limit,
      offset
    )
    
    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching credit history:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}