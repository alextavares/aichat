import { Page, Route } from '@playwright/test';
import { mockAuthResponses, mockUsers } from '../fixtures/auth.fixtures';
import { mockChatResponses, mockAIModels } from '../fixtures/ai.fixtures';
import { mockStripeResponses, mockMercadoPagoResponses, mockPlans } from '../fixtures/payment.fixtures';
import { mockConversations, mockTemplates, mockUsageData, mockAnalyticsData } from '../fixtures/data.fixtures';

// Mock API handlers
export const setupMockHandlers = async (page: Page) => {
  // Auth endpoints
  await page.route('**/api/auth/signin', async (route: Route) => {
    const request = route.request();
    const postData = request.postDataJSON();
    
    const user = mockUsers.find(u => 
      u.email === postData?.email && 
      u.password === postData?.password
    );
    
    if (user) {
      await route.fulfill({
        status: 200,
        json: mockAuthResponses.success,
      });
    } else {
      await route.fulfill({
        status: 401,
        json: mockAuthResponses.invalidCredentials,
      });
    }
  });

  await page.route('**/api/auth/session', async (route: Route) => {
    await route.fulfill({
      status: 200,
      json: {
        user: mockUsers[0],
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  });

  // Chat endpoints
  await page.route('**/api/chat', async (route: Route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 200,
        json: mockChatResponses.simple,
      });
    } else {
      await route.fulfill({
        status: 200,
        json: mockConversations,
      });
    }
  });

  await page.route('**/api/chat/stream', async (route: Route) => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of mockChatResponses.streaming.chunks) {
          const data = `data: ${JSON.stringify(chunk)}\n\n`;
          controller.enqueue(encoder.encode(data));
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    await route.fulfill({
      status: 200,
      contentType: 'text/event-stream',
      body: stream,
    });
  });

  // Models endpoint
  await page.route('**/api/models', async (route: Route) => {
    await route.fulfill({
      status: 200,
      json: mockAIModels,
    });
  });

  // Usage endpoints
  await page.route('**/api/usage/stats', async (route: Route) => {
    await route.fulfill({
      status: 200,
      json: mockUsageData.monthly,
    });
  });

  await page.route('**/api/usage/today', async (route: Route) => {
    await route.fulfill({
      status: 200,
      json: mockUsageData.today,
    });
  });

  // Templates endpoints
  await page.route('**/api/templates', async (route: Route) => {
    await route.fulfill({
      status: 200,
      json: mockTemplates,
    });
  });

  // Analytics endpoints
  await page.route('**/api/analytics/overview', async (route: Route) => {
    await route.fulfill({
      status: 200,
      json: mockAnalyticsData.overview,
    });
  });

  // Payment endpoints
  await page.route('**/api/stripe/checkout', async (route: Route) => {
    await route.fulfill({
      status: 200,
      json: { url: mockStripeResponses.checkoutSession.url },
    });
  });

  await page.route('**/api/mercadopago/preference', async (route: Route) => {
    await route.fulfill({
      status: 200,
      json: { init_point: mockMercadoPagoResponses.preference.init_point },
    });
  });

  await page.route('**/api/subscription', async (route: Route) => {
    await route.fulfill({
      status: 200,
      json: {
        plan: 'FREE',
        status: 'active',
        currentPeriodEnd: null,
      },
    });
  });

  // Conversations endpoints
  await page.route('**/api/conversations', async (route: Route) => {
    await route.fulfill({
      status: 200,
      json: mockConversations,
    });
  });

  await page.route(/\/api\/conversations\/\d+/, async (route: Route) => {
    const id = route.request().url().split('/').pop();
    const conversation = mockConversations.find(c => c.id === id);
    
    if (conversation) {
      await route.fulfill({
        status: 200,
        json: conversation,
      });
    } else {
      await route.fulfill({
        status: 404,
        json: { error: 'Conversation not found' },
      });
    }
  });
};

// Helper to setup authenticated session
export const setupAuthenticatedSession = async (page: Page, user = mockUsers[0]) => {
  // Set auth cookie
  await page.context().addCookies([
    {
      name: 'next-auth.session-token',
      value: 'mock-session-token',
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      expires: Date.now() / 1000 + 86400, // 24 hours
    },
  ]);

  // Mock session endpoint to return user
  await page.route('**/api/auth/session', async (route: Route) => {
    await route.fulfill({
      status: 200,
      json: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          plan: user.plan,
          image: user.image,
        },
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  });
};

// Helper to setup rate limited responses
export const setupRateLimitedResponses = async (page: Page) => {
  await page.route('**/api/chat', async (route: Route) => {
    await route.fulfill({
      status: 429,
      json: {
        error: 'Rate limit exceeded',
        retryAfter: 60,
      },
    });
  });
};

// Helper to setup network errors
export const setupNetworkErrors = async (page: Page) => {
  await page.route('**/api/**', async (route: Route) => {
    await route.abort('failed');
  });
};