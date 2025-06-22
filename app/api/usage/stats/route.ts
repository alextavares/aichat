import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getUserUsageStats } from '@/lib/usage-limits'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    const stats = await getUserUsageStats(session.user.id)
    
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Usage stats error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas de uso' },
      { status: 500 }
    )
  }
}