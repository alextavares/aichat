import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma-fix'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const templateId = params.id

    // Increment usage count
    const template = await prisma.promptTemplate.update({
      where: { id: templateId },
      data: {
        usageCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error('Error updating template usage:', error)
    return NextResponse.json(
      { error: 'Failed to update template usage' },
      { status: 500 }
    )
  }
}