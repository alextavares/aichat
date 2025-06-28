import { PaymentService } from '@/lib/payment-service';
import Stripe from 'stripe';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { prisma } from '@/lib/prisma';
import { mockPlans, mockStripeResponses, mockMercadoPagoResponses } from '../fixtures/payment.fixtures';

// Mock dependencies
jest.mock('stripe');
jest.mock('mercadopago');
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    subscription: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    planLimit: {
      findUnique: jest.fn(),
    },
  },
}));

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockStripe: jest.Mocked<Stripe>;
  let mockMercadoPago: jest.Mocked<MercadoPagoConfig>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Stripe mock
    mockStripe = {
      checkout: {
        sessions: {
          create: jest.fn().mockResolvedValue(mockStripeResponses.checkoutSession),
          retrieve: jest.fn().mockResolvedValue(mockStripeResponses.checkoutSession),
        },
      },
      customers: {
        create: jest.fn().mockResolvedValue(mockStripeResponses.customer),
        retrieve: jest.fn().mockResolvedValue(mockStripeResponses.customer),
      },
      subscriptions: {
        retrieve: jest.fn().mockResolvedValue(mockStripeResponses.subscription),
        update: jest.fn().mockResolvedValue(mockStripeResponses.subscription),
        cancel: jest.fn().mockResolvedValue({
          ...mockStripeResponses.subscription,
          status: 'canceled',
          cancel_at_period_end: true,
        }),
      },
      paymentIntents: {
        retrieve: jest.fn().mockResolvedValue(mockStripeResponses.paymentIntent),
      },
    } as any;

    // Setup MercadoPago mock
    mockMercadoPago = {
      preference: {
        create: jest.fn().mockResolvedValue(mockMercadoPagoResponses.preference),
      },
      payment: {
        get: jest.fn().mockResolvedValue(mockMercadoPagoResponses.payment),
      },
    } as any;

    // Mock constructors
    (Stripe as unknown as jest.Mock).mockImplementation(() => mockStripe);
    (MercadoPagoConfig as jest.Mock).mockImplementation(() => mockMercadoPago);

    paymentService = new PaymentService();
  });

  describe('Stripe Integration', () => {
    test('should create checkout session for valid plan', async () => {
      const userId = '1';
      const planId = 'pro';
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        stripeCustomerId: 'cus_test_123',
      });

      const session = await paymentService.createStripeCheckout(userId, planId);

      expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
        customer: 'cus_test_123',
        payment_method_types: ['card'],
        line_items: expect.arrayContaining([
          expect.objectContaining({
            price: 'price_pro_brl',
            quantity: 1,
          }),
        ]),
        mode: 'subscription',
        success_url: expect.stringContaining('/dashboard?success=true'),
        cancel_url: expect.stringContaining('/pricing?canceled=true'),
        metadata: {
          userId,
          planId,
        },
      });

      expect(session.url).toBe(mockStripeResponses.checkoutSession.url);
    });

    test('should create Stripe customer if not exists', async () => {
      const userId = '1';
      const planId = 'pro';
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        stripeCustomerId: null,
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: userId,
        stripeCustomerId: 'cus_test_mock123',
      });

      await paymentService.createStripeCheckout(userId, planId);

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: { userId },
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { stripeCustomerId: 'cus_test_mock123' },
      });
    });

    test('should handle Stripe webhook events', async () => {
      const event = {
        type: 'checkout.session.completed',
        data: {
          object: {
            ...mockStripeResponses.checkoutSession,
            payment_status: 'paid',
            metadata: {
              userId: '1',
              planId: 'pro',
            },
          },
        },
      };

      (prisma.subscription.create as jest.Mock).mockResolvedValue({
        id: '1',
        userId: '1',
        plan: 'PRO',
        status: 'active',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: '1',
        plan: 'PRO',
      });

      await paymentService.handleStripeWebhook(event as any);

      expect(prisma.subscription.create).toHaveBeenCalled();
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { plan: 'PRO' },
      });
    });

    test('should cancel Stripe subscription', async () => {
      const subscriptionId = 'sub_test_mock123';

      const result = await paymentService.cancelStripeSubscription(subscriptionId);

      expect(mockStripe.subscriptions.cancel).toHaveBeenCalledWith(
        subscriptionId,
        { prorate: true }
      );

      expect(result.status).toBe('canceled');
      expect(result.cancel_at_period_end).toBe(true);
    });

    test('should throw error for invalid plan', async () => {
      await expect(
        paymentService.createStripeCheckout('1', 'invalid-plan')
      ).rejects.toThrow();
    });
  });

  describe('MercadoPago Integration', () => {
    test('should create MercadoPago preference', async () => {
      const userId = '1';
      const planId = 'pro';
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      });

      const preference = await paymentService.createMercadoPagoPreference(userId, planId);

      expect(mockMercadoPago.preference.create).toHaveBeenCalledWith({
        body: expect.objectContaining({
          items: expect.arrayContaining([
            expect.objectContaining({
              title: expect.stringContaining('Pro'),
              unit_price: 79.90,
              quantity: 1,
              currency_id: 'BRL',
            }),
          ]),
          payer: {
            email: 'test@example.com',
            name: 'Test User',
          },
          back_urls: expect.objectContaining({
            success: expect.stringContaining('/dashboard?success=true'),
            failure: expect.stringContaining('/pricing?error=true'),
            pending: expect.stringContaining('/pricing?pending=true'),
          }),
          auto_return: 'approved',
          metadata: {
            user_id: userId,
            plan_id: planId,
          },
        }),
      });

      expect(preference.init_point).toBe(mockMercadoPagoResponses.preference.init_point);
    });

    test('should handle PIX payment', async () => {
      const pixPayment = {
        ...mockMercadoPagoResponses.pixPayment,
        metadata: {
          user_id: '1',
          plan_id: 'pro',
        },
      };

      (mockMercadoPago.payment.get as jest.Mock).mockResolvedValue(pixPayment);

      const payment = await paymentService.getMercadoPagoPayment(pixPayment.id);

      expect(payment.payment_type_id).toBe('bank_transfer');
      expect(payment.payment_method_id).toBe('pix');
      expect(payment.point_of_interaction.transaction_data.qr_code).toBeDefined();
    });

    test('should process MercadoPago webhook', async () => {
      const paymentId = '123456789';
      const payment = {
        ...mockMercadoPagoResponses.payment,
        metadata: {
          user_id: '1',
          plan_id: 'pro',
        },
      };

      (mockMercadoPago.payment.get as jest.Mock).mockResolvedValue(payment);
      (prisma.payment.create as jest.Mock).mockResolvedValue({
        id: '1',
        userId: '1',
        amount: payment.transaction_amount,
        status: payment.status,
      });

      await paymentService.handleMercadoPagoWebhook(paymentId);

      expect(mockMercadoPago.payment.get).toHaveBeenCalledWith({ id: paymentId });
      expect(prisma.payment.create).toHaveBeenCalled();
      
      if (payment.status === 'approved') {
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: '1' },
          data: { plan: 'PRO' },
        });
      }
    });

    test('should support installments for credit card', async () => {
      const preference = await paymentService.createMercadoPagoPreference('1', 'enterprise', {
        installments: 3,
      });

      expect(mockMercadoPago.preference.create).toHaveBeenCalledWith({
        body: expect.objectContaining({
          payment_methods: expect.objectContaining({
            installments: 3,
          }),
        }),
      });
    });
  });

  describe('Plan Management', () => {
    test('should validate plan exists', () => {
      const validPlans = ['free', 'pro', 'enterprise'];
      
      validPlans.forEach(plan => {
        expect(() => paymentService.validatePlan(plan)).not.toThrow();
      });

      expect(() => paymentService.validatePlan('invalid')).toThrow('Invalid plan');
    });

    test('should get plan details', () => {
      const plan = paymentService.getPlanDetails('pro');

      expect(plan).toEqual(expect.objectContaining({
        id: 'pro',
        name: 'Pro',
        price: 79.90,
        features: expect.arrayContaining([
          expect.stringContaining('Mensagens ilimitadas'),
        ]),
      }));
    });

    test('should calculate plan price with discount', () => {
      const basePrice = 79.90;
      const discountPercent = 20;
      
      const discountedPrice = paymentService.calculateDiscountedPrice(basePrice, discountPercent);
      
      expect(discountedPrice).toBe(63.92);
    });

    test('should check if user can upgrade', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        plan: 'FREE',
      });

      const canUpgrade = await paymentService.canUserUpgrade('1', 'pro');
      
      expect(canUpgrade).toBe(true);
    });

    test('should check if user can downgrade', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        plan: 'PRO',
      });

      const canDowngrade = await paymentService.canUserDowngrade('1', 'free');
      
      expect(canDowngrade).toBe(true);
    });
  });

  describe('Subscription Management', () => {
    test('should create subscription record', async () => {
      const subscriptionData = {
        userId: '1',
        plan: 'PRO' as const,
        stripeSubscriptionId: 'sub_123',
        status: 'active' as const,
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      (prisma.subscription.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...subscriptionData,
      });

      const subscription = await prisma.subscription.create({
        data: subscriptionData,
      });

      expect(subscription.plan).toBe('PRO');
      expect(subscription.status).toBe('active');
    });

    test('should update subscription status', async () => {
      (prisma.subscription.update as jest.Mock).mockResolvedValue({
        id: '1',
        status: 'canceled',
      });

      const updated = await prisma.subscription.update({
        where: { id: '1' },
        data: { status: 'canceled' },
      });

      expect(updated.status).toBe('canceled');
    });

    test('should get active subscription', async () => {
      (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        userId: '1',
        plan: 'PRO',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      });

      const subscription = await paymentService.getUserActiveSubscription('1');

      expect(subscription).toBeDefined();
      expect(subscription?.status).toBe('active');
      expect(new Date(subscription!.currentPeriodEnd) > new Date()).toBe(true);
    });
  });

  describe('Payment History', () => {
    test('should record payment', async () => {
      const paymentData = {
        userId: '1',
        amount: 79.90,
        currency: 'BRL',
        status: 'completed' as const,
        paymentMethod: 'credit_card',
        gateway: 'stripe' as const,
      };

      (prisma.payment.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...paymentData,
        createdAt: new Date(),
      });

      const payment = await prisma.payment.create({
        data: paymentData,
      });

      expect(payment.amount).toBe(79.90);
      expect(payment.status).toBe('completed');
    });

    test('should get user payment history', async () => {
      const mockPayments = [
        {
          id: '1',
          amount: 79.90,
          status: 'completed',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: '2',
          amount: 39.90,
          status: 'completed',
          createdAt: new Date('2024-02-01'),
        },
      ];

      (prisma.payment.findMany as jest.Mock).mockResolvedValue(mockPayments);

      const history = await paymentService.getUserPaymentHistory('1');

      expect(history).toHaveLength(2);
      expect(history[0].amount).toBe(79.90);
    });
  });

  describe('Error Handling', () => {
    test('should handle Stripe API errors', async () => {
      mockStripe.checkout.sessions.create.mockRejectedValue(
        new Error('Stripe API error')
      );

      await expect(
        paymentService.createStripeCheckout('1', 'pro')
      ).rejects.toThrow('Stripe API error');
    });

    test('should handle MercadoPago API errors', async () => {
      mockMercadoPago.preference.create.mockRejectedValue(
        new Error('MercadoPago API error')
      );

      await expect(
        paymentService.createMercadoPagoPreference('1', 'pro')
      ).rejects.toThrow('MercadoPago API error');
    });

    test('should handle user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentService.createStripeCheckout('999', 'pro')
      ).rejects.toThrow('User not found');
    });
  });
});