import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, paymentId, planType } = await request.json()
    
    // Validate inputs
    if (!userId || !paymentId || !planType) {
      return NextResponse.json({ 
        error: 'Missing required fields: userId, paymentId, planType' 
      }, { status: 400 })
    }
    
    console.log('🔧 Processing manual upgrade:', { userId, paymentId, planType })
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, planType: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const results = {
      userId,
      paymentId,
      planType,
      originalPlan: user.planType,
      steps: []
    }
    
    // Step 1: Update user plan
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { planType: planType.toUpperCase() as any }
      })
      results.steps.push({ step: 'user_update', status: 'success' })
    } catch (error) {
      results.steps.push({ step: 'user_update', status: 'error', error: error.message })
      throw error
    }
    
    // Step 2: Create subscription
    try {
      const startDate = new Date()
      const expiresDate = new Date(startDate)
      expiresDate.setMonth(startDate.getMonth() + 1) // Monthly
      
      await prisma.subscription.create({
        data: {
          userId,
          planType: planType.toUpperCase() as any,
          status: 'ACTIVE',
          mercadoPagoPaymentId: paymentId,
          startedAt: startDate,
          expiresAt: expiresDate
        }
      })
      results.steps.push({ step: 'subscription_create', status: 'success' })
    } catch (error) {
      results.steps.push({ step: 'subscription_create', status: 'error', error: error.message })
      // Don't throw - continue with payment record
    }
    
    // Step 3: Create payment record
    try {
      await prisma.payment.create({
        data: {
          userId,
          amount: planType.toUpperCase() === 'PRO' ? 99.90 : 49.90,
          currency: 'BRL',
          status: 'COMPLETED',
          mercadoPagoPaymentId: paymentId
        }
      })
      results.steps.push({ step: 'payment_record', status: 'success' })
    } catch (error) {
      results.steps.push({ step: 'payment_record', status: 'error', error: error.message })
      // Don't throw - upgrade already complete
    }
    
    // Step 4: Verify final state
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, planType: true }
    })
    
    results.finalUser = updatedUser
    results.success = updatedUser.planType === planType.toUpperCase()
    
    return NextResponse.json(results, { status: 200 })
    
  } catch (error) {
    console.error('Manual upgrade error:', error)
    return NextResponse.json({ 
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}