import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'
import crypto from 'crypto'
import { mockUsers, mockSessions } from '../fixtures/auth.fixtures'
import { mockPlans, mockStripeWebhookEvents, mockMercadoPagoWebhookEvents } from '../fixtures/payment.fixtures'

// Import route handlers
import { POST as stripeCheckoutHandler } from '@/app/api/stripe/checkout/route'
import { POST as stripeWebhookHandler } from '@/app/api/stripe/webhook/route'
import { POST as mercadoPagoWebhookHandler } from '@/app/api/mercadopago/webhook/route'

// Mock external dependencies
jest.mock('next-auth')
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
      findFirst: jest.fn(),
    },
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
    customers: {
      retrieve: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
  }))
})

describe('Payment Integration Tests', () => {
  const mockGetServerSession = getServerSession as jest.MockedFunction<typeof getServerSession>
  let mockStripe: any
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockStripe = new (Stripe as any)()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Stripe Integration', () => {
    describe('POST /api/stripe/checkout', () => {
      test('should create checkout session for Pro plan', async () => {
        const requestData = {
          planId: 'pro',
          billingCycle: 'monthly',
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/stripe/checkout', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.basic)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)

        const mockCheckoutSession = {
          id: 'cs_test_123',
          url: 'https://checkout.stripe.com/pay/cs_test_123',
        }

        mockStripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession)

        const response = await stripeCheckoutHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.url).toBe(mockCheckoutSession.url)

        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith({
          payment_method_types: ['card'],
          mode: 'subscription',
          customer_email: mockUsers.basic.email,
          client_reference_id: mockUsers.basic.id,
          metadata: {
            userId: mockUsers.basic.id,
            planId: 'pro',
            billingCycle: 'monthly',
          },
          line_items: [{
            price_data: {
              currency: 'brl',
              product_data: {
                name: 'InnerAI Pro - Mensal',
                description: expect.stringContaining('50 mensagens'),
              },
              unit_amount: 7990, // R$ 79.90 in cents
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          }],
          success_url: expect.stringContaining('/api/stripe/checkout/success'),
          cancel_url: expect.stringContaining('/api/stripe/cancel'),
        })
      })

      test('should create checkout session for yearly billing', async () => {
        const requestData = {
          planId: 'pro',
          billingCycle: 'yearly',
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/stripe/checkout', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.basic)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)

        const mockCheckoutSession = {
          id: 'cs_test_yearly',
          url: 'https://checkout.stripe.com/pay/cs_test_yearly',
        }

        mockStripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession)

        const response = await stripeCheckoutHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(200)
        
        // Verify yearly pricing with discount
        expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(
          expect.objectContaining({
            line_items: [{
              price_data: {
                currency: 'brl',
                product_data: expect.any(Object),
                unit_amount: 86292, // R$ 862.92 (20% discount)
                recurring: {
                  interval: 'year',
                },
              },
              quantity: 1,
            }],
          })
        )
      })

      test('should reject checkout for existing subscribers', async () => {
        const requestData = {
          planId: 'pro',
          billingCycle: 'monthly',
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/stripe/checkout', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.pro)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.pro) // Already has Pro plan

        const response = await stripeCheckoutHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Você já possui uma assinatura ativa')
        expect(mockStripe.checkout.sessions.create).not.toHaveBeenCalled()
      })

      test('should handle invalid plan ID', async () => {
        const requestData = {
          planId: 'invalid-plan',
          billingCycle: 'monthly',
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/stripe/checkout', {
          method: 'POST',
          body: JSON.stringify(requestData),
        })

        mockGetServerSession.mockResolvedValue(mockSessions.basic)
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)

        const response = await stripeCheckoutHandler(mockRequest)
        const data = await response.json()

        expect(response.status).toBe(400)
        expect(data.error).toBe('Plano inválido')
      })
    })

    describe('POST /api/stripe/webhook', () => {
      test('should handle successful payment webhook', async () => {
        const webhookPayload = JSON.stringify(mockStripeWebhookEvents.checkoutCompleted)
        const webhookSignature = 'test-signature'

        const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
          method: 'POST',
          body: webhookPayload,
          headers: {
            'stripe-signature': webhookSignature,
          },
        })

        // Mock webhook verification
        mockStripe.webhooks.constructEvent.mockReturnValue(mockStripeWebhookEvents.checkoutCompleted)

        // Mock customer retrieval
        mockStripe.customers.retrieve.mockResolvedValue({
          id: 'cus_123',
          email: mockUsers.basic.email,
        })

        // Mock user lookup
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)
        
        // Mock subscription creation
        ;(prisma.subscription.create as jest.Mock).mockResolvedValue({
          id: 'sub_123',
          userId: mockUsers.basic.id,
          planType: 'PRO',
          status: 'active',
        })

        const response = await stripeWebhookHandler(mockRequest)

        expect(response.status).toBe(200)

        // Verify user was upgraded
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: mockUsers.basic.id },
          data: {
            plan: 'PRO',
            stripeCustomerId: 'cus_123',
          },
        })

        // Verify subscription was created
        expect(prisma.subscription.create).toHaveBeenCalledWith({
          data: {
            userId: mockUsers.basic.id,
            planType: 'PRO',
            billingCycle: 'MONTHLY',
            status: 'active',
            currentPeriodStart: expect.any(Date),
            currentPeriodEnd: expect.any(Date),
            stripeSubscriptionId: 'sub_test_123',
            stripeCustomerId: 'cus_123',
            amount: 79.90,
          },
        })

        // Verify payment was recorded
        expect(prisma.payment.create).toHaveBeenCalledWith({
          data: {
            userId: mockUsers.basic.id,
            subscriptionId: 'sub_123',
            amount: 79.90,
            currency: 'BRL',
            status: 'completed',
            provider: 'stripe',
            stripePaymentIntentId: 'pi_test_123',
          },
        })
      })

      test('should handle subscription cancellation webhook', async () => {
        const webhookPayload = JSON.stringify(mockStripeWebhookEvents.subscriptionDeleted)
        const webhookSignature = 'test-signature'

        const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
          method: 'POST',
          body: webhookPayload,
          headers: {
            'stripe-signature': webhookSignature,
          },
        })

        mockStripe.webhooks.constructEvent.mockReturnValue(mockStripeWebhookEvents.subscriptionDeleted)

        ;(prisma.subscription.findFirst as jest.Mock).mockResolvedValue({
          id: 'sub_123',
          userId: mockUsers.pro.id,
          stripeSubscriptionId: 'sub_test_123',
        })

        const response = await stripeWebhookHandler(mockRequest)

        expect(response.status).toBe(200)

        // Verify subscription was cancelled
        expect(prisma.subscription.update).toHaveBeenCalledWith({
          where: { id: 'sub_123' },
          data: {
            status: 'cancelled',
            cancelledAt: expect.any(Date),
          },
        })

        // Verify user was downgraded
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: mockUsers.pro.id },
          data: { plan: 'FREE' },
        })
      })

      test('should handle webhook signature verification failure', async () => {
        const webhookPayload = JSON.stringify(mockStripeWebhookEvents.checkoutCompleted)
        const webhookSignature = 'invalid-signature'

        const mockRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
          method: 'POST',
          body: webhookPayload,
          headers: {
            'stripe-signature': webhookSignature,
          },
        })

        mockStripe.webhooks.constructEvent.mockImplementation(() => {
          throw new Error('Webhook signature verification failed')
        })

        const response = await stripeWebhookHandler(mockRequest)

        expect(response.status).toBe(400)
        expect(prisma.user.update).not.toHaveBeenCalled()
        expect(prisma.subscription.create).not.toHaveBeenCalled()
        expect(prisma.payment.create).not.toHaveBeenCalled()
      })
    })
  })

  describe('MercadoPago Integration', () => {
    describe('POST /api/mercadopago/webhook', () => {
      test('should handle successful PIX payment', async () => {
        const webhookData = mockMercadoPagoWebhookEvents.paymentApproved
        const mockRequest = new NextRequest('http://localhost:3000/api/mercadopago/webhook', {
          method: 'POST',
          body: JSON.stringify(webhookData),
          headers: {
            'x-signature': 'valid-signature',
            'x-request-id': 'req-123',
          },
        })

        // Mock signature verification (simplified)
        const mockVerifySignature = jest.fn().mockReturnValue(true)
        
        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)
        ;(prisma.subscription.create as jest.Mock).mockResolvedValue({
          id: 'sub_mp_123',
          userId: mockUsers.basic.id,
          planType: 'PRO',
          status: 'active',
        })

        const response = await mercadoPagoWebhookHandler(mockRequest)

        expect(response.status).toBe(200)

        // Verify user was upgraded
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: mockUsers.basic.id },
          data: {
            plan: 'PRO',
            mercadoPagoCustomerId: expect.any(String),
          },
        })

        // Verify subscription was created
        expect(prisma.subscription.create).toHaveBeenCalledWith({
          data: {
            userId: mockUsers.basic.id,
            planType: 'PRO',
            billingCycle: 'MONTHLY',
            status: 'active',
            currentPeriodStart: expect.any(Date),
            currentPeriodEnd: expect.any(Date),
            mercadoPagoSubscriptionId: expect.any(String),
            amount: 79.90,
          },
        })

        // Verify payment was recorded
        expect(prisma.payment.create).toHaveBeenCalledWith({
          data: {
            userId: mockUsers.basic.id,
            subscriptionId: 'sub_mp_123',
            amount: 79.90,
            currency: 'BRL',
            status: 'completed',
            provider: 'mercadopago',
            mercadoPagoPaymentId: 123456789,
            paymentMethod: 'pix',
          },
        })
      })

      test('should handle Boleto payment pending status', async () => {
        const webhookData = {
          ...mockMercadoPagoWebhookEvents.paymentApproved,
          data: {
            id: '123456789',
            status: 'pending',
            payment_method_id: 'bolbradesco',
            transaction_amount: 79.90,
            payer: { email: mockUsers.basic.email },
          },
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/mercadopago/webhook', {
          method: 'POST',
          body: JSON.stringify(webhookData),
          headers: {
            'x-signature': 'valid-signature',
            'x-request-id': 'req-123',
          },
        })

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)

        const response = await mercadoPagoWebhookHandler(mockRequest)

        expect(response.status).toBe(200)

        // Verify payment was recorded as pending
        expect(prisma.payment.create).toHaveBeenCalledWith({
          data: expect.objectContaining({
            status: 'pending',
            paymentMethod: 'boleto',
          }),
        })

        // User should NOT be upgraded yet
        expect(prisma.user.update).not.toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({ plan: 'PRO' }),
          })
        )
      })

      test('should update payment status when Boleto is paid', async () => {
        const webhookData = {
          ...mockMercadoPagoWebhookEvents.paymentApproved,
          action: 'payment.updated',
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/mercadopago/webhook', {
          method: 'POST',
          body: JSON.stringify(webhookData),
          headers: {
            'x-signature': 'valid-signature',
            'x-request-id': 'req-123',
          },
        })

        ;(prisma.payment.findUnique as jest.Mock).mockResolvedValue({
          id: 'payment_123',
          userId: mockUsers.basic.id,
          status: 'pending',
          mercadoPagoPaymentId: 123456789,
        })

        ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)

        const response = await mercadoPagoWebhookHandler(mockRequest)

        expect(response.status).toBe(200)

        // Verify payment was updated to completed
        expect(prisma.payment.update).toHaveBeenCalledWith({
          where: { id: 'payment_123' },
          data: { status: 'completed' },
        })

        // Now user should be upgraded
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: mockUsers.basic.id },
          data: expect.objectContaining({ plan: 'PRO' }),
        })
      })

      test('should handle refund webhook', async () => {
        const webhookData = {
          ...mockMercadoPagoWebhookEvents.paymentApproved,
          data: {
            ...mockMercadoPagoWebhookEvents.paymentApproved.data,
            status: 'refunded',
          },
        }

        const mockRequest = new NextRequest('http://localhost:3000/api/mercadopago/webhook', {
          method: 'POST',
          body: JSON.stringify(webhookData),
          headers: {
            'x-signature': 'valid-signature',
            'x-request-id': 'req-123',
          },
        })

        ;(prisma.payment.findUnique as jest.Mock).mockResolvedValue({
          id: 'payment_123',
          userId: mockUsers.pro.id,
          subscriptionId: 'sub_123',
          status: 'completed',
          mercadoPagoPaymentId: 123456789,
        })

        ;(prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
          id: 'sub_123',
          userId: mockUsers.pro.id,
          status: 'active',
        })

        const response = await mercadoPagoWebhookHandler(mockRequest)

        expect(response.status).toBe(200)

        // Verify payment was marked as refunded
        expect(prisma.payment.update).toHaveBeenCalledWith({
          where: { id: 'payment_123' },
          data: { status: 'refunded' },
        })

        // Verify subscription was cancelled
        expect(prisma.subscription.update).toHaveBeenCalledWith({
          where: { id: 'sub_123' },
          data: {
            status: 'cancelled',
            cancelledAt: expect.any(Date),
          },
        })

        // Verify user was downgraded
        expect(prisma.user.update).toHaveBeenCalledWith({
          where: { id: mockUsers.pro.id },
          data: { plan: 'FREE' },
        })
      })

      test('should validate webhook signature', async () => {
        const webhookData = mockMercadoPagoWebhookEvents.paymentApproved
        const mockRequest = new NextRequest('http://localhost:3000/api/mercadopago/webhook', {
          method: 'POST',
          body: JSON.stringify(webhookData),
          headers: {
            'x-signature': 'invalid-signature',
            'x-request-id': 'req-123',
          },
        })

        const response = await mercadoPagoWebhookHandler(mockRequest)

        expect(response.status).toBe(401)
        expect(prisma.user.update).not.toHaveBeenCalled()
        expect(prisma.subscription.create).not.toHaveBeenCalled()
        expect(prisma.payment.create).not.toHaveBeenCalled()
      })
    })
  })

  describe('Payment Flow Integration', () => {
    test('should handle complete Stripe payment flow', async () => {
      // Step 1: Create checkout session
      const checkoutRequest = new NextRequest('http://localhost:3000/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({
          planId: 'pro',
          billingCycle: 'monthly',
        }),
      })

      mockGetServerSession.mockResolvedValue(mockSessions.basic)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)

      const mockCheckoutSession = {
        id: 'cs_test_flow',
        url: 'https://checkout.stripe.com/pay/cs_test_flow',
      }

      mockStripe.checkout.sessions.create.mockResolvedValue(mockCheckoutSession)

      const checkoutResponse = await stripeCheckoutHandler(checkoutRequest)
      expect(checkoutResponse.status).toBe(200)

      // Step 2: Handle webhook after payment
      const webhookEvent = {
        ...mockStripeWebhookEvents.checkoutCompleted,
        data: {
          object: {
            ...mockStripeWebhookEvents.checkoutCompleted.data.object,
            id: 'cs_test_flow',
          },
        },
      }

      const webhookRequest = new NextRequest('http://localhost:3000/api/stripe/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookEvent),
        headers: {
          'stripe-signature': 'test-signature',
        },
      })

      mockStripe.webhooks.constructEvent.mockReturnValue(webhookEvent)
      mockStripe.customers.retrieve.mockResolvedValue({
        id: 'cus_flow',
        email: mockUsers.basic.email,
      })

      ;(prisma.subscription.create as jest.Mock).mockResolvedValue({
        id: 'sub_flow',
        userId: mockUsers.basic.id,
        planType: 'PRO',
        status: 'active',
      })

      const webhookResponse = await stripeWebhookHandler(webhookRequest)
      expect(webhookResponse.status).toBe(200)

      // Verify complete flow
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUsers.basic.id },
        data: {
          plan: 'PRO',
          stripeCustomerId: 'cus_flow',
        },
      })
    })

    test('should prevent duplicate payment processing', async () => {
      const webhookData = mockMercadoPagoWebhookEvents.paymentApproved
      const mockRequest = new NextRequest('http://localhost:3000/api/mercadopago/webhook', {
        method: 'POST',
        body: JSON.stringify(webhookData),
        headers: {
          'x-signature': 'valid-signature',
          'x-request-id': 'req-duplicate',
        },
      })

      // First call - payment doesn't exist
      ;(prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce(null)
      ;(prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUsers.basic)
      ;(prisma.subscription.create as jest.Mock).mockResolvedValue({
        id: 'sub_123',
        userId: mockUsers.basic.id,
        planType: 'PRO',
        status: 'active',
      })

      const response1 = await mercadoPagoWebhookHandler(mockRequest)
      expect(response1.status).toBe(200)
      expect(prisma.payment.create).toHaveBeenCalledTimes(1)

      // Second call - payment already exists
      jest.clearAllMocks()
      ;(prisma.payment.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'payment_existing',
        mercadoPagoPaymentId: 123456789,
        status: 'completed',
      })

      const response2 = await mercadoPagoWebhookHandler(mockRequest)
      expect(response2.status).toBe(200)
      expect(prisma.payment.create).not.toHaveBeenCalled()
      expect(prisma.user.update).not.toHaveBeenCalled()
    })
  })
})