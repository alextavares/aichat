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

    const balance = await CreditService.getUserBalance(session.user.id)
    
    return NextResponse.json({ 
      balance,
      isLowBalance: balance < 100 // Low balance threshold
    })
  } catch (error) {
    console.error('Error fetching credit balance:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}