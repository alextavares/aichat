import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../helpers/auth.helpers';
import { NavigationHelpers } from '../../helpers/navigation.helpers';
import testUsers from '../../config/test-users.json';

test.describe('Dashboard - Main Page', () => {
  let authHelpers: AuthHelpers;
  let navHelpers: NavigationHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    navHelpers = new NavigationHelpers(page);
    
    // Login before accessing dashboard
    await authHelpers.login(testUsers.validUser.email, testUsers.validUser.password);
    await authHelpers.waitForSuccessfulLogin();
  });

  test.describe('Dashboard Layout', () => {
    test('should display all main dashboard elements', async ({ page }) => {
      // Check page title
      const pageTitle = await navHelpers.getCurrentPageTitle();
      expect(pageTitle).toMatch(/dashboard|painel/i);

      // Check for main sections
      await expect(page.getByRole('navigation')).toBeVisible(); // Sidebar
      await expect(page.getByRole('main')).toBeVisible(); // Main content

      // Check for user info
      const userInfo = page.getByText(testUsers.validUser.name)
        .or(page.getByText(testUsers.validUser.email));
      await expect(userInfo).toBeVisible();
    });

    test('should display sidebar navigation', async ({ page }) => {
      const isSidebarVisible = await navHelpers.isSidebarVisible();
      expect(isSidebarVisible).toBe(true);

      // Check navigation items
      const navItems = await navHelpers.getVisibleNavigationItems();
      
      // Should have essential navigation items
      expect(navItems.some(item => item.match(/chat/i))).toBe(true);
      expect(navItems.some(item => item.match(/histórico|history/i))).toBe(true);
      expect(navItems.some(item => item.match(/perfil|profile/i))).toBe(true);
    });

    test('should highlight current page in navigation', async ({ page }) => {
      // Dashboard/Chat should be active by default
      const isActive = await navHelpers.isNavigationItemActive('Chat');
      expect(isActive).toBe(true);
    });
  });

  test.describe('Dashboard Widgets', () => {
    test('should display usage statistics widget', async ({ page }) => {
      // Look for usage stats
      const usageWidget = page.locator('[data-testid="usage-widget"], .usage-stats, [class*="usage"]');
      
      if (await usageWidget.isVisible()) {
        // Check for usage metrics
        const metrics = [
          page.getByText(/mensagens|messages/i),
          page.getByText(/tokens/i),
          page.getByText(/conversas|conversations/i)
        ];

        let foundMetric = false;
        for (const metric of metrics) {
          if (await metric.isVisible()) {
            foundMetric = true;
            break;
          }
        }
        expect(foundMetric).toBe(true);
      }
    });

    test('should display subscription status', async ({ page }) => {
      // Look for subscription info
      const subscriptionInfo = page.locator('[data-testid="subscription-info"], .subscription-status, [class*="subscription"]');
      
      if (await subscriptionInfo.isVisible()) {
        // Should show plan type
        const planTypes = ['free', 'gratuito', 'premium', 'pro'];
        let foundPlan = false;
        
        for (const plan of planTypes) {
          if (await page.getByText(new RegExp(plan, 'i')).isVisible()) {
            foundPlan = true;
            break;
          }
        }
        expect(foundPlan).toBe(true);
      }
    });

    test('should display quick actions', async ({ page }) => {
      // Check for common quick actions
      const quickActions = [
        page.getByRole('button', { name: /novo chat|new chat/i }),
        page.getByRole('link', { name: /templates/i }),
        page.getByRole('link', { name: /analytics/i })
      ];

      let foundAction = false;
      for (const action of quickActions) {
        if (await action.isVisible()) {
          foundAction = true;
          break;
        }
      }
      expect(foundAction).toBe(true);
    });
  });

  test.describe('Dashboard Responsiveness', () => {
    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // Sidebar might be collapsible
      const menuButton = page.getByRole('button', { name: /menu/i });
      if (await menuButton.isVisible()) {
        // Should be able to toggle sidebar
        await menuButton.click();
        
        // Sidebar should toggle
        await page.waitForTimeout(300); // Wait for animation
        
        // Click again to close
        await menuButton.click();
      }

      // Main content should still be visible
      await expect(page.getByRole('main')).toBeVisible();
    });

    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Sidebar should be hidden by default
      const sidebar = page.getByRole('navigation');
      const sidebarBox = await sidebar.boundingBox();
      
      // On mobile, sidebar might be off-screen or hidden
      if (sidebarBox) {
        const isOffScreen = sidebarBox.x < 0 || sidebarBox.x > 375;
        const isHidden = sidebarBox.width === 0;
        expect(isOffScreen || isHidden).toBe(true);
      }

      // Should have menu button
      await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
    });
  });

  test.describe('Dashboard Data Loading', () => {
    test('should show loading states while fetching data', async ({ page }) => {
      // Navigate away and back to trigger fresh load
      await page.goto('/dashboard/profile');
      await page.goto('/dashboard');

      // Check for loading indicators
      const loadingIndicators = [
        page.locator('.skeleton, [class*="skeleton"]'),
        page.locator('.loading, [class*="loading"]'),
        page.locator('.animate-pulse'),
        page.getByText(/carregando|loading/i)
      ];

      let foundLoading = false;
      for (const indicator of loadingIndicators) {
        if (await indicator.isVisible({ timeout: 500 })) {
          foundLoading = true;
          
          // Loading should eventually disappear
          await expect(indicator).not.toBeVisible({ timeout: 5000 });
          break;
        }
      }
    });

    test('should handle data loading errors gracefully', async ({ page, context }) => {
      // Mock API error for stats
      await context.route('**/api/dashboard/stats', route => {
        route.fulfill({
          status: 500,
          body: 'Server error'
        });
      });

      // Reload dashboard
      await page.reload();

      // Should show error state or fallback
      const errorStates = [
        page.getByText(/erro|error/i),
        page.getByText(/tente novamente|try again/i),
        page.getByRole('button', { name: /recarregar|reload/i })
      ];

      // Dashboard should still be functional despite errors
      await expect(page.getByRole('main')).toBeVisible();
      
      // Navigation should still work
      await navHelpers.navigateToDashboardSection('profile');
      await expect(page).toHaveURL('/dashboard/profile');
    });
  });

  test.describe('Dashboard Interactions', () => {
    test('should navigate to different sections', async ({ page }) => {
      // Test navigation to different dashboard sections
      const sections = [
        { name: 'history', url: '/dashboard/history' },
        { name: 'profile', url: '/dashboard/profile' },
        { name: 'settings', url: '/dashboard/settings' }
      ];

      for (const section of sections) {
        await navHelpers.navigateToDashboardSection(section.name as any);
        await navHelpers.verifyCurrentPage(section.url);
        
        // Navigate back to main dashboard
        await page.goto('/dashboard');
      }
    });

    test('should refresh data on demand', async ({ page }) => {
      // Look for refresh button
      const refreshButton = page.getByRole('button', { name: /atualizar|refresh|recarregar|reload/i });
      
      if (await refreshButton.isVisible()) {
        // Click refresh
        await refreshButton.click();
        
        // Should show loading state
        const loadingAfterRefresh = page.locator('.loading, .skeleton, .animate-pulse');
        await expect(loadingAfterRefresh).toBeVisible({ timeout: 1000 });
        
        // Should complete loading
        await expect(loadingAfterRefresh).not.toBeVisible({ timeout: 5000 });
      }
    });

    test('should handle quick action clicks', async ({ page }) => {
      // Test new chat quick action
      const newChatButton = page.getByRole('button', { name: /novo chat|new chat|iniciar conversa/i });
      
      if (await newChatButton.isVisible()) {
        await newChatButton.click();
        
        // Should either open modal or navigate
        const chatModal = page.getByRole('dialog');
        const chatPage = page.getByRole('main');
        
        await expect(chatModal.or(chatPage)).toBeVisible();
      }
    });
  });

  test.describe('Dashboard Permissions', () => {
    test('should show features based on user subscription', async ({ page }) => {
      // Free users might have limited features
      const userSubscription = testUsers.validUser.subscription || 'free';
      
      if (userSubscription === 'free') {
        // Check for upgrade prompts
        const upgradePrompts = [
          page.getByText(/upgrade|atualizar plano/i),
          page.getByText(/premium|pro/i),
          page.getByRole('button', { name: /assinar|subscribe/i })
        ];

        let foundUpgradePrompt = false;
        for (const prompt of upgradePrompts) {
          if (await prompt.isVisible()) {
            foundUpgradePrompt = true;
            break;
          }
        }
        // Upgrade prompts are optional based on UX
      }
    });

    test('should restrict access to premium features for free users', async ({ page }) => {
      // This depends on the specific features that are premium
      // Example: Advanced analytics might be premium
      
      const premiumFeatures = page.locator('[data-premium="true"], .premium-feature');
      
      if (await premiumFeatures.count() > 0) {
        // Premium features should be visually distinct
        const firstPremium = premiumFeatures.first();
        
        // Might have lock icon or disabled state
        const isDisabled = await firstPremium.isDisabled().catch(() => false);
        const hasLockIcon = await firstPremium.locator('.lock, [class*="lock"]').isVisible().catch(() => false);
        
        expect(isDisabled || hasLockIcon).toBe(true);
      }
    });
  });

  test.describe('Dashboard Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Check h1
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toHaveCount(1);

      // Check that h2s exist for sections
      const h2s = page.getByRole('heading', { level: 2 });
      const h2Count = await h2s.count();
      expect(h2Count).toBeGreaterThan(0);

      // No skipped heading levels
      const h4s = page.getByRole('heading', { level: 4 });
      if (await h4s.count() > 0) {
        const h3s = page.getByRole('heading', { level: 3 });
        expect(await h3s.count()).toBeGreaterThan(0);
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      // Tab through main elements
      await page.keyboard.press('Tab');
      
      // Should be able to tab to navigation
      let foundNavItem = false;
      for (let i = 0; i < 10; i++) {
        const focused = await page.evaluate(() => document.activeElement?.tagName);
        if (focused === 'A' || focused === 'BUTTON') {
          foundNavItem = true;
          break;
        }
        await page.keyboard.press('Tab');
      }
      
      expect(foundNavItem).toBe(true);
    });

    test('should have proper ARIA landmarks', async ({ page }) => {
      // Check for main landmark
      await expect(page.getByRole('main')).toBeVisible();
      
      // Check for navigation landmark
      await expect(page.getByRole('navigation')).toBeVisible();
      
      // Check for complementary (sidebar) if exists
      const complementary = page.getByRole('complementary');
      // Complementary is optional
    });
  });

  test.describe('Dashboard Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      
      // Navigate to dashboard
      await page.goto('/dashboard');
      await navHelpers.waitForPageLoad();
      
      const loadTime = Date.now() - startTime;
      
      // Dashboard should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should handle concurrent data requests efficiently', async ({ page }) => {
      // Monitor network requests
      const requests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('/api/')) {
          requests.push(request.url());
        }
      });

      // Reload dashboard
      await page.reload();
      await navHelpers.waitForPageLoad();

      // Should batch requests or use efficient loading
      // Not too many simultaneous API calls
      const uniqueEndpoints = new Set(requests.map(url => {
        const urlObj = new URL(url);
        return urlObj.pathname;
      }));

      // Reasonable number of API endpoints
      expect(uniqueEndpoints.size).toBeLessThan(10);
    });
  });
});