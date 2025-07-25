import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { PAYMENT_PLANS } from '@/lib/payment-service'

// Initialize MercadoPago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  options: { timeout: 5000 }
})

const preference = new Preference(client)

export async function POST(req: NextRequest) {
  // Declare variables at function scope to be accessible in catch block
  let planId: string = '';
  let paymentMethod: string = '';
  let billingCycle: string = 'monthly';
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const requestData = await req.json();
    planId = requestData.planId;
    paymentMethod = requestData.paymentMethod;
    billingCycle = requestData.billingCycle;
    const installments = requestData.installments;
    
    // Find the plan
    const plan = PAYMENT_PLANS.find(p => p.id === planId)
    if (!plan || plan.price === 0) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Calculate price based on billing cycle
    const isYearly = billingCycle === 'yearly'
    const monthlyPrice = plan.price
    const yearlyPrice = isYearly ? monthlyPrice * 12 * 0.4 : monthlyPrice // 60% discount
    const totalPrice = isYearly ? yearlyPrice : monthlyPrice

    // Create preference
    const preferenceData = {
      items: [
        {
          id: plan.id,
          title: `Plano ${plan.name} - ${isYearly ? 'Anual' : 'Mensal'}`,
          description: plan.features.slice(0, 3).join(', '),
          quantity: 1,
          currency_id: 'BRL',
          unit_price: totalPrice
        }
      ],
      payer: {
        email: session.user.email,
        name: session.user.name || undefined
      },
      payment_methods: {
        excluded_payment_types: paymentMethod === 'pix' ? [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'ticket' }
        ] : paymentMethod === 'boleto' ? [
          { id: 'credit_card' },
          { id: 'debit_card' }
        ] : paymentMethod === 'card' ? [
          { id: 'ticket' }
        ] : [],
        installments: installments || 1,
        default_installments: installments || 1
      },
      back_urls: {
        success: `${process.env.NEXTAUTH_URL || 'https://seahorse-app-k5pag.ondigitalocean.app'}/payment/success`,
        failure: `${process.env.NEXTAUTH_URL || 'https://seahorse-app-k5pag.ondigitalocean.app'}/payment/failure`,
        pending: `${process.env.NEXTAUTH_URL || 'https://seahorse-app-k5pag.ondigitalocean.app'}/payment/pending`
      },
      auto_return: 'approved',
      notification_url: `${process.env.NEXTAUTH_URL || 'https://seahorse-app-k5pag.ondigitalocean.app'}/api/mercadopago/webhook`,
      statement_descriptor: 'InnerAI',
      external_reference: JSON.stringify({
        userId: session.user.id,
        planId: plan.id,
        billingCycle,
        timestamp: new Date().toISOString()
      })
    }

    console.log('Creating MercadoPago preference:', preferenceData)

    const response = await preference.create({ body: preferenceData })
    
    // Return the checkout URL
    return NextResponse.json({
      url: response.init_point, // For redirect
      preferenceId: response.id,
      sandboxUrl: response.sandbox_init_point // For testing
    })

  } catch (error: any) {
    console.error('MercadoPago checkout error:', error)
    
    // If token is invalid, use mock checkout
    if (error.message?.includes('invalid_token') || error.status === 401 || error.status === 400) {
      const baseUrl = process.env.NEXTAUTH_URL || 'https://seahorse-app-k5pag.ondigitalocean.app'
      const mockUrl = new URL('/api/mercadopago/mock-checkout', baseUrl)
      mockUrl.searchParams.set('plan', planId)
      mockUrl.searchParams.set('billing', billingCycle)
      mockUrl.searchParams.set('method', paymentMethod)
      
      return NextResponse.json({
        url: mockUrl.toString(),
        preferenceId: 'mock_' + Date.now(),
        isMock: true
      })
    }
    
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}