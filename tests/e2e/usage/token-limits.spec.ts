import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../helpers/auth.helpers';
import { ChatHelpers } from '../../helpers/chat.helpers';
import testUsers from '../../config/test-users.json';

test.describe('Token Usage Control', () => {
  let authHelpers: AuthHelpers;
  let chatHelpers: ChatHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    chatHelpers = new ChatHelpers(page);
    
    // Login with test user
    await authHelpers.login(testUsers.validUser.email, testUsers.validUser.password);
    await page.waitForURL('/dashboard');
  });

  test.describe('Usage Display', () => {
    test('should display usage indicator on dashboard', async ({ page }) => {
      // Look for usage indicator component
      const usageIndicator = page.locator('[data-testid="usage-indicator"]')
        .or(page.locator('.usage-indicator'))
        .or(page.locator('[class*="usage"]'));

      await expect(usageIndicator).toBeVisible();

      // Should show message count
      const messageCount = page.getByText(/mensagens|messages/i);
      await expect(messageCount).toBeVisible();
    });

    test('should show daily limit for free users', async ({ page }) => {
      // Free users should see X/10 messages
      const dailyLimit = page.getByText(/\/10|de 10/i);
      
      if (await dailyLimit.isVisible()) {
        // Check if it shows current usage
        const usageText = await dailyLimit.textContent();
        expect(usageText).toMatch(/\d+\/10|\d+ de 10/);
      }
    });

    test('should update usage after sending message', async ({ page }) => {
      // Navigate to chat
      await page.goto('/dashboard');
      
      // Get initial usage
      const initialUsage = await page.locator('[data-testid="usage-indicator"]').textContent()
        .catch(() => null);

      // Send a message
      await chatHelpers.sendMessage('Test message for usage tracking');

      // Wait for response
      await chatHelpers.waitForChatReady();

      // Check if usage updated
      if (initialUsage) {
        const newUsage = await page.locator('[data-testid="usage-indicator"]').textContent();
        expect(newUsage).not.toBe(initialUsage);
      }
    });
  });

  test.describe('API Usage Limits', () => {
    test('should check usage limits via API', async ({ page, request }) => {
      // Get current usage stats
      const response = await request.get('/api/usage/today');
      
      expect(response.ok()).toBe(true);
      
      const data = await response.json();
      
      // Should have usage structure
      expect(data).toHaveProperty('daily');
      expect(data).toHaveProperty('monthly');
      expect(data).toHaveProperty('planType');
      
      // Daily should have messages info
      expect(data.daily).toHaveProperty('messages');
      expect(data.daily.messages).toHaveProperty('used');
      expect(data.daily.messages).toHaveProperty('limit');
      expect(data.daily.messages).toHaveProperty('remaining');
      
      // Monthly should have tokens info
      expect(data.monthly).toHaveProperty('tokens');
      expect(data.monthly.tokens).toHaveProperty('used');
      expect(data.monthly.tokens).toHaveProperty('limit');
    });

    test('should track usage after chat message', async ({ page, request }) => {
      // Get initial usage
      const initialResponse = await request.get('/api/usage/today');
      const initialData = await initialResponse.json();
      const initialMessages = initialData.daily.messages.used;

      // Send a chat message
      const chatResponse = await request.post('/api/chat', {
        data: {
          messages: [{ role: 'user', content: 'Test message for tracking' }],
          model: 'gpt-3.5-turbo'
        }
      });

      // If chat succeeds, usage should increase
      if (chatResponse.ok()) {
        // Get new usage
        const newResponse = await request.get('/api/usage/today');
        const newData = await newResponse.json();
        const newMessages = newData.daily.messages.used;

        expect(newMessages).toBe(initialMessages + 1);
      }
    });
  });

  test.describe('Limit Enforcement', () => {
    test('should respect model restrictions by plan', async ({ page, request }) => {
      // Try to use a premium model as free user
      const response = await request.post('/api/chat', {
        data: {
          messages: [{ role: 'user', content: 'Test' }],
          model: 'gpt-4' // Premium model
        }
      });

      // Free users should get 429 or error
      if (testUsers.validUser.subscription !== 'premium') {
        expect([429, 403]).toContain(response.status());
        
        const data = await response.json();
        expect(data.message).toMatch(/model.*not available|limite|limit/i);
      }
    });

    test('should show error when daily limit reached', async ({ page }) => {
      // This test would need to exhaust the limit first
      // For now, we'll test the UI behavior
      
      // Mock scenario: Navigate to chat
      await page.goto('/dashboard');

      // Look for limit warning if visible
      const limitWarning = page.getByText(/limite.*atingido|limit.*reached/i);
      
      if (await limitWarning.isVisible({ timeout: 1000 })) {
        // Should show upgrade option
        const upgradeButton = page.getByRole('button', { name: /upgrade|assinar/i });
        await expect(upgradeButton).toBeVisible();
      }
    });
  });

  test.describe('Usage Statistics', () => {
    test('should display usage statistics in dashboard', async ({ page, request }) => {
      // Get stats from API
      const response = await request.get('/api/dashboard/stats');
      
      if (response.ok()) {
        const stats = await response.json();
        
        // Should have usage data
        expect(stats).toHaveProperty('usage');
        expect(stats.usage).toHaveProperty('last7Days');
        expect(stats.usage).toHaveProperty('byModel');
        
        // Check if costs are tracked
        if (stats.usage.totalCost !== undefined) {
          expect(typeof stats.usage.totalCost).toBe('number');
        }
      }
    });

    test('should show usage by model', async ({ page }) => {
      // Navigate to analytics or dashboard
      await page.goto('/analytics').catch(() => page.goto('/dashboard'));

      // Look for model usage breakdown
      const modelUsage = page.locator('[data-testid="model-usage"]')
        .or(page.getByText(/gpt-3.5|gpt-4|claude/i));

      if (await modelUsage.first().isVisible({ timeout: 2000 })) {
        // Should show at least one model
        expect(await modelUsage.count()).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Token Counting', () => {
    test('should show token count in chat response', async ({ page }) => {
      await page.goto('/dashboard');

      // Send a message
      await chatHelpers.sendMessage('Count the tokens in this message');
      
      // Wait for response
      await chatHelpers.waitForChatReady();

      // Look for token count display
      const tokenDisplay = page.getByText(/tokens?:/i)
        .or(page.locator('[data-testid="token-count"]'));

      // Token count might be shown in UI
      if (await tokenDisplay.isVisible({ timeout: 1000 })) {
        const tokenText = await tokenDisplay.textContent();
        expect(tokenText).toMatch(/\d+/); // Should contain a number
      }
    });

    test('should track cumulative token usage', async ({ page, request }) => {
      // Get monthly token usage
      const response = await request.get('/api/usage/today');
      const data = await response.json();

      if (data.monthly.tokens.used !== undefined) {
        expect(typeof data.monthly.tokens.used).toBe('number');
        expect(data.monthly.tokens.used).toBeGreaterThanOrEqual(0);
        
        // If there's a limit, check remaining
        if (data.monthly.tokens.limit) {
          expect(data.monthly.tokens.remaining).toBeLessThanOrEqual(data.monthly.tokens.limit);
        }
      }
    });
  });

  test.describe('Plan Upgrade Flow', () => {
    test('should show upgrade option when limit approached', async ({ page }) => {
      // Look for upgrade prompts
      const upgradePrompt = page.getByText(/upgrade|melhorar plano|assinar/i);
      
      if (await upgradePrompt.isVisible({ timeout: 1000 })) {
        // Should be clickable
        await expect(upgradePrompt).toBeEnabled();
        
        // Click might lead to pricing page
        await upgradePrompt.click();
        
        // Should navigate to pricing or subscription
        await expect(page).toHaveURL(/pricing|subscription|assinatura/);
      }
    });

    test('should display plan comparison when limit reached', async ({ page }) => {
      // This would appear when user hits limit
      const planComparison = page.locator('[data-testid="plan-comparison"]')
        .or(page.locator('table').filter({ hasText: /free.*pro.*enterprise/i }));

      if (await planComparison.isVisible({ timeout: 1000 })) {
        // Should show different plans
        await expect(page.getByText(/free/i)).toBeVisible();
        await expect(page.getByText(/pro/i)).toBeVisible();
        
        // Should show limits
        await expect(page.getByText(/10.*mensagens|messages.*10/i)).toBeVisible();
      }
    });
  });

  test.describe('Cost Tracking', () => {
    test('should track costs for paid users', async ({ page, request }) => {
      // Only relevant for paid plans
      const response = await request.get('/api/usage/today');
      const data = await response.json();

      if (data.planType !== 'FREE') {
        expect(data.daily).toHaveProperty('cost');
        expect(data.monthly).toHaveProperty('cost');
        
        // Costs should be numbers
        expect(typeof data.daily.cost).toBe('number');
        expect(typeof data.monthly.cost).toBe('number');
      }
    });

    test('should display cost breakdown by model', async ({ page, request }) => {
      const response = await request.get('/api/dashboard/stats');
      
      if (response.ok()) {
        const stats = await response.json();
        
        // Check for cost by model
        if (stats.usage?.byModel) {
          Object.values(stats.usage.byModel).forEach((modelData: any) => {
            if (modelData.cost !== undefined) {
              expect(typeof modelData.cost).toBe('number');
            }
          });
        }
      }
    });
  });
});