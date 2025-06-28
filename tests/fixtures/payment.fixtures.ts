// Mock payment providers and responses

export const mockPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '50 mensagens por dia',
      'GPT-3.5 Turbo',
      'Templates básicos',
      'Histórico de 7 dias',
    ],
    limits: {
      messagesPerDay: 50,
      tokensPerMonth: 100000,
      models: ['gpt-3.5-turbo'],
    },
  },
  {
    id: 'lite',
    name: 'Lite',
    price: 39.90,
    stripePriceId: 'price_lite_brl',
    features: [
      '1.000 mensagens por mês',
      'GPT-4 + Claude',
      'Todos os templates',
      'Histórico ilimitado',
      'Suporte por email',
    ],
    limits: {
      messagesPerMonth: 1000,
      tokensPerMonth: 2500000,
      models: ['gpt-3.5-turbo', 'gpt-4', 'claude-3-opus'],
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 79.90,
    stripePriceId: 'price_pro_brl',
    features: [
      'Mensagens ilimitadas',
      'Todos os modelos de IA',
      'Templates personalizados',
      'API access',
      'Suporte prioritário',
    ],
    limits: {
      messagesPerMonth: -1, // unlimited
      tokensPerMonth: 10000000,
      models: 'all',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 197.00,
    stripePriceId: 'price_enterprise_brl',
    features: [
      'Tudo do plano Pro',
      'SLA garantido',
      'Modelos customizados',
      'Treinamento dedicado',
      'Suporte 24/7',
      'Compliance LGPD',
    ],
    limits: {
      messagesPerMonth: -1,
      tokensPerMonth: -1,
      models: 'all',
    },
  },
];

// Mock Stripe responses
export const mockStripeResponses = {
  checkoutSession: {
    id: 'cs_test_mock123',
    object: 'checkout.session',
    success_url: 'http://localhost:3000/dashboard?success=true',
    cancel_url: 'http://localhost:3000/pricing?canceled=true',
    payment_status: 'unpaid',
    status: 'open',
    url: 'https://checkout.stripe.com/test/mock123',
  },
  paymentIntent: {
    id: 'pi_test_mock123',
    object: 'payment_intent',
    amount: 7990,
    currency: 'brl',
    status: 'succeeded',
    metadata: {
      userId: '1',
      plan: 'pro',
    },
  },
  subscription: {
    id: 'sub_test_mock123',
    object: 'subscription',
    status: 'active',
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    items: {
      data: [
        {
          price: {
            id: 'price_pro_brl',
            product: 'prod_pro',
            unit_amount: 7990,
            currency: 'brl',
          },
        },
      ],
    },
  },
  customer: {
    id: 'cus_test_mock123',
    object: 'customer',
    email: 'test@example.com',
    name: 'Test User',
    metadata: {
      userId: '1',
    },
  },
};

// Mock MercadoPago responses
export const mockMercadoPagoResponses = {
  preference: {
    id: 'mock-preference-123',
    init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock-preference-123',
    sandbox_init_point: 'https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=mock-preference-123',
    items: [
      {
        title: 'Plano Pro - InnerAI',
        unit_price: 79.90,
        quantity: 1,
        currency_id: 'BRL',
      },
    ],
    payer: {
      email: 'test@example.com',
      name: 'Test User',
    },
    back_urls: {
      success: 'http://localhost:3000/dashboard?success=true',
      failure: 'http://localhost:3000/pricing?error=true',
      pending: 'http://localhost:3000/pricing?pending=true',
    },
    auto_return: 'approved',
  },
  payment: {
    id: 123456789,
    status: 'approved',
    status_detail: 'accredited',
    payment_type_id: 'credit_card',
    payment_method_id: 'visa',
    transaction_amount: 79.90,
    currency_id: 'BRL',
    payer: {
      email: 'test@example.com',
    },
    metadata: {
      user_id: '1',
      plan: 'pro',
    },
  },
  pixPayment: {
    id: 987654321,
    status: 'pending',
    status_detail: 'pending_waiting_payment',
    payment_type_id: 'bank_transfer',
    payment_method_id: 'pix',
    transaction_amount: 79.90,
    point_of_interaction: {
      transaction_data: {
        qr_code: 'mock-pix-qr-code-string',
        qr_code_base64: 'mock-base64-qr-code',
        ticket_url: 'https://www.mercadopago.com.br/payments/987654321/ticket',
      },
    },
  },
};

// Mock webhook events
export const mockWebhookEvents = {
  stripe: {
    checkoutCompleted: {
      type: 'checkout.session.completed',
      data: {
        object: {
          ...mockStripeResponses.checkoutSession,
          payment_status: 'paid',
          metadata: {
            userId: '1',
            plan: 'pro',
          },
        },
      },
    },
    subscriptionUpdated: {
      type: 'customer.subscription.updated',
      data: {
        object: mockStripeResponses.subscription,
      },
    },
  },
  mercadopago: {
    paymentApproved: {
      type: 'payment',
      action: 'payment.updated',
      data: {
        id: '123456789',
      },
    },
  },
};

// Mock payment service
export class MockPaymentService {
  async createCheckoutSession(userId: string, planId: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const plan = mockPlans.find(p => p.id === planId);
    if (!plan || plan.price === 0) {
      throw new Error('Invalid plan for checkout');
    }
    
    return mockStripeResponses.checkoutSession;
  }
  
  async createMercadoPagoPreference(userId: string, planId: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const plan = mockPlans.find(p => p.id === planId);
    if (!plan || plan.price === 0) {
      throw new Error('Invalid plan for checkout');
    }
    
    return mockMercadoPagoResponses.preference;
  }
  
  async getSubscription(subscriptionId: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockStripeResponses.subscription;
  }
  
  async cancelSubscription(subscriptionId: string) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return {
      ...mockStripeResponses.subscription,
      status: 'canceled',
      cancel_at_period_end: true,
    };
  }
}