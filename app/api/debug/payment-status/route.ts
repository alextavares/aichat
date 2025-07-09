import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paymentId = searchParams.get('paymentId') || '117508146189'
  const userId = searchParams.get('userId') || 'cmcwfirhs0004ohrt0nl0bmha'
  
  try {
    console.log('🔍 Verificando pagamento e usuário...')
    console.log('Payment ID:', paymentId)
    console.log('User ID:', userId)
    
    const results = {
      paymentId,
      userId,
      timestamp: new Date().toISOString(),
      payment: null,
      user: null,
      webhookLogs: [],
      allPayments: [],
      subscriptions: []
    }
    
    // Verificar pagamento
    const payment = await prisma.payment.findFirst({
      where: { 
        OR: [
          { mercadoPagoPaymentId: paymentId },
          { id: paymentId }
        ]
      }
    })
    
    results.payment = payment
    
    // Verificar usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        planType: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    results.user = user
    
    // Verificar logs de webhook recentes
    const webhookLogs = await prisma.mercadoPagoWebhookLog.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    results.webhookLogs = webhookLogs
    
    // Verificar todos os pagamentos do usuário
    const allPayments = await prisma.payment.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })
    
    results.allPayments = allPayments
    
    // Verificar assinaturas
    const subscriptions = await prisma.subscription.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    })
    
    results.subscriptions = subscriptions
    
    return NextResponse.json(results, { status: 200 })
    
  } catch (error) {
    console.error('❌ Erro:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack,
      paymentId,
      userId 
    }, { status: 500 })
  }
}