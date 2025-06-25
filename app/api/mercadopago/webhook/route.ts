import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { handleMercadoPagoWebhook } from '@/lib/payment-service'
import crypto from 'crypto'

function verifyMercadoPagoSignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false
  
  const parts = signature.split(',')
  const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1]
  const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1]
  
  if (!ts || !v1) return false
  
  const manifest = `id:${JSON.parse(body).data.id};request-id:${headers().get('x-request-id')};ts:${ts};`
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(manifest)
  const calculatedSignature = hmac.digest('hex')
  
  return calculatedSignature === v1
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = (await headers()).get('x-signature')
    
    // Verify signature in production
    if (process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const isValid = verifyMercadoPagoSignature(
        body,
        signature,
        process.env.MERCADOPAGO_WEBHOOK_SECRET
      )
      
      if (!isValid) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    
    const data = JSON.parse(body)
    const result = await handleMercadoPagoWebhook(data)
    
    if (result && result.status === 'approved') {
      // Update user subscription
      await prisma.user.update({
        where: { id: result.userId },
        data: { planType: result.planId.toUpperCase() as any }
      })
      
      // Create subscription record
      const startDate = new Date()
      let expiresDate = new Date(startDate)
      const billingCycle = result.billingCycle || 'monthly' // Default to monthly if undefined

      if (billingCycle === 'yearly') {
        expiresDate.setFullYear(startDate.getFullYear() + 1)
      } else {
        expiresDate.setMonth(startDate.getMonth() + 1)
      }

      await prisma.subscription.create({
        data: {
          userId: result.userId,
          planType: result.planId.toUpperCase() as any,
          status: 'ACTIVE',
          mercadoPagoPaymentId: String(result.paymentId),
          startedAt: startDate,
          expiresAt: expiresDate
        }
      })
      
      // Create payment record
      const amount = result.planId === 'pro' ? 47 : 197
      await prisma.payment.create({
        data: {
          userId: result.userId,
          amount,
          currency: 'BRL',
          status: 'COMPLETED',
          mercadoPagoPaymentId: String(result.paymentId)
        }
      })
    }
    
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('MercadoPago webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}