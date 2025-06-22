import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { signOut } from 'next-auth/react'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      )
    }

    // Delete user and all related data (cascade delete)
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    // The cascade delete in Prisma schema will automatically delete:
    // - conversations (and their messages)
    // - userUsage
    // - subscriptions
    // - payments
    // - promptTemplates created by user
    // - messageFeedback
    // - toolUsage

    return NextResponse.json({ message: 'Conta excluída com sucesso' })
  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir conta' },
      { status: 500 }
    )
  }
}