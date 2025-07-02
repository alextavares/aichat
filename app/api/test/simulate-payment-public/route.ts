import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Simula um pagamento aprovado para testes (versão pública)
export async function POST(request: NextRequest) {
  try {
    const { userId, planId, billingCycle } = await request.json()
    
    if (!userId || !planId) {
      return NextResponse.json({ error: 'userId and planId are required' }, { status: 400 })
    }

    const cycle = billingCycle || 'monthly'
    
    console.log(`[TEST] Simulating approved payment for user ${userId}, plan ${planId}, cycle ${cycle}`)
    
    // Simula dados do pagamento aprovado
    const mockPaymentId = `TEST_${Date.now()}`
    
    // Atualiza o plano do usuário
    await prisma.user.update({
      where: { id: userId },
      data: { planType: planId.toUpperCase() as any }
    })
    
    // Cria subscription record
    const startDate = new Date()
    let expiresDate = new Date(startDate)
    
    if (cycle === 'yearly') {
      expiresDate.setFullYear(startDate.getFullYear() + 1)
    } else {
      expiresDate.setMonth(startDate.getMonth() + 1)
    }

    await prisma.subscription.create({
      data: {
        userId,
        planType: planId.toUpperCase() as any,
        status: 'ACTIVE',
        mercadoPagoPaymentId: mockPaymentId,
        startedAt: startDate,
        expiresAt: expiresDate
      }
    })
    
    // Cria payment record
    await prisma.payment.create({
      data: {
        userId,
        amount: 1, // Valor de teste
        currency: 'BRL',
        status: 'COMPLETED',
        mercadoPagoPaymentId: mockPaymentId
      }
    })
    
    console.log(`[TEST] Payment simulation completed successfully`)
    
    return NextResponse.json({ 
      success: true,
      message: 'Payment simulated successfully',
      paymentId: mockPaymentId,
      userId,
      planId,
      billingCycle: cycle
    })
    
  } catch (error) {
    console.error('[TEST] Error simulating payment:', error)
    return NextResponse.json(
      { error: 'Failed to simulate payment' },
      { status: 500 }
    )
  }
}