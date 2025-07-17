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

    const packages = await CreditService.getAvailablePackages()
    
    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Error fetching credit packages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}