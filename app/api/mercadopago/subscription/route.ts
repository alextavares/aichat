import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'
import { authOptions } from '@/lib/auth'
import { PLANS } from '@/lib/plans'

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { planId, billingCycle } = await request.json()
    const plan = PLANS[planId as keyof typeof PLANS]
    
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const preapproval = new PreApproval(client)
    
    // Calcular valores para assinatura
    const isYearly = billingCycle === 'yearly'
    const amount = isYearly ? plan.yearlyPrice : plan.monthlyPrice
    
    const subscriptionData = {
      reason: `Assinatura ${plan.name} - ${isYearly ? 'Anual' : 'Mensal'}`,
      auto_recurring: {
        frequency: isYearly ? 12 : 1,
        frequency_type: 'months',
        transaction_amount: amount,
        currency_id: 'BRL',
        start_date: new Date().toISOString(),
        end_date: isYearly 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          : undefined
      },
      back_url: `${process.env.NEXTAUTH_URL}/payment/success`,
      payer_email: session.user.email!,
      external_reference: JSON.stringify({
        userId: session.user.id,
        planId: plan.id,
        billingCycle,
        timestamp: new Date().toISOString()
      }),
      notification_url: `${process.env.NEXTAUTH_URL}/api/mercadopago/webhook`,
      status: 'pending'
    }

    const response = await preapproval.create({ body: subscriptionData })
    
    return NextResponse.json({
      url: response.init_point,
      subscriptionId: response.id
    })

  } catch (error: any) {
    console.error('MercadoPago subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}