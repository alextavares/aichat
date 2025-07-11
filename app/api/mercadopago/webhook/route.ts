import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { handleMercadoPagoWebhook } from '@/lib/payment-service'
import crypto from 'crypto'

function verifyMercadoPagoSignature(
  body: string,
  signature: string | null,
  xRequestId: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.log('[MercadoPago Webhook] Missing signature or secret')
    return false
  }
  
  // Split signature header: "ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839"
  const parts = signature.split(',')
  const ts = parts.find(p => p.startsWith('ts='))?.split('=')[1]
  const v1 = parts.find(p => p.startsWith('v1='))?.split('=')[1]
  
  if (!ts || !v1) {
    console.log('[MercadoPago Webhook] Invalid signature format')
    return false
  }
  
  // Parse body to extract ID - the ID is case sensitive and must be lowercase if alphanumeric
  const parsedBody = JSON.parse(body)
  let dataId = parsedBody.id || parsedBody.data?.id
  
  // Extract ID from resource URL if present
  if (!dataId && parsedBody.resource) {
    const match = parsedBody.resource.match(/\/(\d+)$/)
    dataId = match ? match[1] : null
  }
  
  if (!dataId) {
    console.log('[MercadoPago Webhook] Unable to extract data.id for signature verification')
    return false
  }
  
  // Convert alphanumeric IDs to lowercase as per MercadoPago documentation
  const id = String(dataId).toLowerCase()
  
  // Build manifest according to MercadoPago specification
  // Template: id:[data.id];request-id:[x-request-id];ts:[ts];
  let manifest = `id:${id};`
  if (xRequestId) {
    manifest += `request-id:${xRequestId};`
  }
  manifest += `ts:${ts};`
  
  console.log('[MercadoPago Webhook] Signature verification details:', {
    extractedId: id,
    xRequestId,
    ts,
    manifest,
    expectedHash: v1
  })
  
  // Generate HMAC-SHA256 hash
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(manifest)
  const calculatedSignature = hmac.digest('hex')
  
  console.log('[MercadoPago Webhook] Calculated signature:', calculatedSignature)
  
  return calculatedSignature === v1
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = (await headers()).get('x-signature')
    const xRequestId = (await headers()).get('x-request-id')
    
    // Parse body to check structure
    let parsedBody: any
    try {
      parsedBody = JSON.parse(body)
    } catch (e) {
      console.error('[MercadoPago Webhook] Invalid JSON body:', body)
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    
    // Log webhook structure and store for audit trail
    const webhookLog = {
      hasId: !!parsedBody.id,
      hasDataId: !!parsedBody.data?.id,
      topic: parsedBody.topic,
      type: parsedBody.type,
      action: parsedBody.action,
      keys: Object.keys(parsedBody),
      hasSignature: !!signature,
      hasRequestId: !!xRequestId,
      timestamp: new Date().toISOString()
    }
    
    console.log('[MercadoPago Webhook] Received structure:', webhookLog)
    
    // Store webhook for debugging (simple console log for now)
    console.log('[MercadoPago Webhook] Full body for audit:', JSON.stringify(parsedBody, null, 2))
    
    // Verify signature in production with proper implementation
    if (process.env.NODE_ENV === 'production' && process.env.MERCADOPAGO_WEBHOOK_SECRET && signature) {
      const isValid = verifyMercadoPagoSignature(
        body,
        signature,
        xRequestId,
        process.env.MERCADOPAGO_WEBHOOK_SECRET
      )
      
      if (!isValid) {
        console.error('[MercadoPago Webhook] Invalid signature')
        console.error('[MercadoPago Webhook] Body preview:', body.substring(0, 200))
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      } else {
        console.log('[MercadoPago Webhook] Signature verification passed')
      }
    } else {
      console.log('[MercadoPago Webhook] Signature verification skipped:', {
        inProduction: process.env.NODE_ENV === 'production',
        hasSecret: !!process.env.MERCADOPAGO_WEBHOOK_SECRET,
        hasSignature: !!signature
      })
    }
    
    // MercadoPago IPN format: { id: "...", topic: "payment" }
    // MercadoPago Webhooks format: { data: { id: "..." }, type: "payment" }
    // MercadoPago Notification format: { resource: "...", topic: "payment" }
    
    // Extract ID from resource URL if present
    let resourceId = parsedBody.id || parsedBody.data?.id
    if (!resourceId && parsedBody.resource) {
      // Resource format: https://api.mercadopago.com/v1/payments/123456
      const match = parsedBody.resource.match(/\/(\d+)$/)
      resourceId = match ? match[1] : null
    }
    
    const webhookData = {
      id: resourceId,
      topic: parsedBody.topic || parsedBody.type
    }
    
    const result = await handleMercadoPagoWebhook(webhookData)
    
    console.log('[MercadoPago Webhook] Processing result:', result)
    
    if (result && (result.status === 'approved' || result.status === 'pending')) {
      console.log(`[MercadoPago Webhook] Payment ${result.status}, processing for user:`, result.userId)
      
      if (result.status === 'approved') {
        // Only activate subscription for approved payments
        console.log('[MercadoPago Webhook] Payment approved, activating subscription')
        
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
        
        // Create payment record with actual amount based on plan
        const amount = result.planId.toUpperCase() === 'PRO' ? 99.90 : 
                      result.planId.toUpperCase() === 'LITE' ? 49.90 : 1.00
        
        await prisma.payment.create({
          data: {
            userId: result.userId,
            amount,
            currency: 'BRL',
            status: 'COMPLETED',
            mercadoPagoPaymentId: String(result.paymentId)
          }
        })
      } else if (result.status === 'pending') {
        // For pending payments (like PIX), just log and create payment record with pending status
        console.log('[MercadoPago Webhook] Payment pending, creating payment record')
        
        const amount = result.planId.toUpperCase() === 'PRO' ? 99.90 : 
                      result.planId.toUpperCase() === 'LITE' ? 49.90 : 1.00
        
        // Check if payment record already exists
        const existingPayment = await prisma.payment.findFirst({
          where: { mercadoPagoPaymentId: String(result.paymentId) }
        })
        
        if (!existingPayment) {
          await prisma.payment.create({
            data: {
              userId: result.userId,
              amount,
              currency: 'BRL',
              status: 'PENDING',
              mercadoPagoPaymentId: String(result.paymentId)
            }
          })
        }
      }
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