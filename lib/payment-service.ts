import Stripe from 'stripe'
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago'

// Initialize Stripe conditionally to avoid build-time errors
let stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-05-28.basil',
      typescript: true,
    })
  }
  if (!stripe) {
    throw new Error('Stripe not initialized. Missing STRIPE_SECRET_KEY environment variable.')
  }
  return stripe
}

// Initialize MercadoPago lazily to avoid build-time errors
let mercadopagoClient: MercadoPagoConfig | null = null
let mercadopagoPayment: Payment | null = null
let mercadopagoPreference: Preference | null = null

function initializeMercadoPago() {
  if (!mercadopagoClient && process.env.MERCADOPAGO_ACCESS_TOKEN) {
    mercadopagoClient = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
      options: { timeout: 5000 }
    })
    mercadopagoPayment = new Payment(mercadopagoClient)
    mercadopagoPreference = new Preference(mercadopagoClient)
  }
}

function getMercadoPagoPayment(): Payment {
  initializeMercadoPago()
  if (!mercadopagoPayment) {
    throw new Error('MercadoPago not initialized. Missing MERCADOPAGO_ACCESS_TOKEN environment variable.')
  }
  return mercadopagoPayment
}

function getMercadoPagoPreference(): Preference {
  initializeMercadoPago()
  if (!mercadopagoPreference) {
    throw new Error('MercadoPago not initialized. Missing MERCADOPAGO_ACCESS_TOKEN environment variable.')
  }
  return mercadopagoPreference
}

export interface PaymentPlan {
  id: string
  name: string
  price: number
  currency: string
  interval: 'monthly' | 'yearly'
  features: string[]
  stripePriceId?: string
  stripeYearlyPriceId?: string
  mercadoPagoPreferenceId?: string
}

export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'free',
    name: 'Grátis',
    price: 0,
    currency: 'BRL',
    interval: 'monthly',
    features: [
      'Mensagens ilimitadas com modelos rápidos',
      '120 mensagens por mês com modelos avançados',
      'GPT-4o Mini, Deepseek 3.1, Claude 3.5 Haiku',
      'Criação de 1 assistente personalizado',
      'Até 2 anexos por chat'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 1.00,  // Valor de teste
    currency: 'BRL',
    interval: 'monthly',
    features: [
      'Mensagens ilimitadas com modelos rápidos',
      'Mensagens ilimitadas com modelos avançados',
      'GPT-4o, Claude 4 Sonnet, Gemini 2.5 Pro',
      '7.000 créditos mensais para imagem/áudio/vídeo',
      'Criação ilimitada de assistentes',
      'Anexos ilimitados nos chats'
    ],
    stripePriceId: process.env.STRIPE_PRICE_PRO,
    stripeYearlyPriceId: process.env.STRIPE_PRICE_PRO_YEARLY,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1.00,  // Valor de teste
    currency: 'BRL',
    interval: 'monthly',
    features: [
      'Tudo do plano Pro',
      'API dedicada',
      'SLA garantido',
      'Modelos customizados',
      'Treinamento dedicado',
      'Suporte 24/7',
      'Compliance LGPD'
    ],
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE,
    stripeYearlyPriceId: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY,
  }
]

export interface CreateCheckoutParams {
  planId: string
  userId: string
  email: string
  paymentMethod: 'card' | 'pix' | 'boleto'
  installments?: number // Para parcelamento
  successUrl: string
  cancelUrl: string
  billingCycle?: 'monthly' | 'yearly'
}

export async function createCheckoutSession(params: CreateCheckoutParams) {
  const plan = PAYMENT_PLANS.find(p => p.id === params.planId)
  if (!plan || plan.price === 0) {
    throw new Error('Invalid plan selected')
  }

  // For card payments, use Stripe
  if (params.paymentMethod === 'card') {
    const isYearly = params.billingCycle === 'yearly'
    const priceId = isYearly ? plan.stripeYearlyPriceId : plan.stripePriceId
    
    if (!priceId) {
      throw new Error(`Stripe ${isYearly ? 'yearly' : 'monthly'} price ID not configured for this plan`)
    }
    
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      customer_email: params.email,
      metadata: {
        userId: params.userId,
        planId: params.planId,
        billingCycle: params.billingCycle || 'monthly',
      },
      subscription_data: {
        metadata: {
          userId: params.userId,
          planId: params.planId,
          billingCycle: params.billingCycle || 'monthly',
        },
      },
      // Enable installments for Brazilian cards
      payment_method_options: {
        card: {
          installments: {
            enabled: true
          }
        }
      }
    })

    return {
      provider: 'stripe',
      checkoutUrl: session.url,
      sessionId: session.id
    }
  }

  // For Pix and Boleto, use MercadoPago
  if (params.paymentMethod === 'pix' || params.paymentMethod === 'boleto') {
    const isYearly = params.billingCycle === 'yearly'
    const price = isYearly ? (plan.price * 12 * 0.4) : plan.price // 60% discount for yearly
    const title = isYearly ? `Plano ${plan.name} Anual - InnerAI` : `Plano ${plan.name} - InnerAI`
    
    const preference = await getMercadoPagoPreference().create({
      body: {
        items: [
          {
            id: plan.id,
            title: title,
            quantity: 1,
            unit_price: price,
            currency_id: 'BRL',
          }
        ],
        payer: {
          email: params.email,
        },
        payment_methods: {
          excluded_payment_types: params.paymentMethod === 'pix' 
            ? [{ id: 'bolbradesco' }, { id: 'ticket' }] // Exclude boleto for pix
            : [{ id: 'account_money' }], // Exclude account money for boleto
          installments: params.paymentMethod === 'pix' ? 1 : 1, // No installments for pix/boleto
        },
        back_urls: {
          success: params.successUrl,
          failure: params.cancelUrl,
          pending: params.successUrl,
        },
        auto_return: 'approved',
        external_reference: params.userId,
        metadata: {
          user_id: params.userId,
          plan_id: params.planId,
          billing_cycle: params.billingCycle || 'monthly',
        },
      }
    })

    return {
      provider: 'mercadopago',
      checkoutUrl: preference.init_point!,
      preferenceId: preference.id
    }
  }

  throw new Error('Invalid payment method')
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await getStripe().billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session.url
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await getStripe().subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })

  return subscription
}

export async function getSubscription(subscriptionId: string) {
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
  return subscription
}

// Webhook handlers
export async function handleStripeWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session
      // Handle successful payment
      return { 
        userId: session.metadata?.userId,
        planId: session.metadata?.planId,
        subscriptionId: session.subscription,
        customerId: session.customer
      }
      
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription
      return {
        subscriptionId: subscription.id,
        status: subscription.status,
        userId: subscription.metadata?.userId
      }
      
    default:
      console.log(`Unhandled event type ${event.type}`)
  }
}

export async function handleMercadoPagoWebhook(data: any) {
  // MercadoPago sends notification with data.id and data.topic
  if (!data || !data.id) {
    console.error('[MercadoPago] Invalid webhook data:', data)
    return null
  }

  if (data.topic === 'payment') {
    try {
      const payment = await getMercadoPagoPayment().get({ id: data.id })
      
      if (payment.status === 'approved') {
        // Parse external_reference if it's a JSON string
        let parsedRef: any = {}
        try {
          parsedRef = JSON.parse(payment.external_reference || '{}')
        } catch (e) {
          console.error('[MercadoPago] Failed to parse external_reference:', payment.external_reference)
        }

        return {
          userId: parsedRef.userId || payment.external_reference,
          planId: parsedRef.planId || payment.metadata?.plan_id,
          paymentId: payment.id,
          status: 'approved',
          billingCycle: parsedRef.billingCycle || payment.metadata?.billing_cycle || 'monthly'
        }
      }
    } catch (error) {
      console.error('[MercadoPago] Error fetching payment:', error)
      return null
    }
  }
  
  return null
}