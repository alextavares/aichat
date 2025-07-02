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
    
    // Parse body to check structure
    let parsedBody: any
    try {
      parsedBody = JSON.parse(body)
    } catch (e) {
      console.error('[MercadoPago Webhook] Invalid JSON body:', body)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    
    // Log webhook structure
    console.log('[MercadoPago Webhook] Received structure:', {
      hasId: !!parsedBody.id,
      hasDataId: !!parsedBody.data?.id,
      topic: parsedBody.topic,
      type: parsedBody.type,
      action: parsedBody.action,
      keys: Object.keys(parsedBody)
    })
    
    // Verify signature in production
    if (process.env.NODE_ENV === 'production' && process.env.MERCADOPAGO_WEBHOOK_SECRET) {
      const isValid = verifyMercadoPagoSignature(
        body,
        signature,
        process.env.MERCADOPAGO_WEBHOOK_SECRET
      )
      
      if (!isValid) {
        console.error('[MercadoPago Webhook] Invalid signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }
    
    // MercadoPago IPN format: { id: "...", topic: "payment" }
    // MercadoPago Webhooks format: { data: { id: "..." }, type: "payment" }
    const webhookData = {
      id: parsedBody.id || parsedBody.data?.id || parsedBody.resource,
      topic: parsedBody.topic || parsedBody.type
    }
    
    const result = await handleMercadoPagoWebhook(webhookData)
    
    console.log('[MercadoPago Webhook] Processing result:', result)
    
    if (result && result.status === 'approved') {
      console.log('[MercadoPago Webhook] Payment approved, updating user:', result.userId)
      
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
      // Using test values of R$ 1,00
      const amount = 1
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