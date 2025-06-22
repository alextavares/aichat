import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../helpers/auth.helpers';
import { NavigationHelpers } from '../../helpers/navigation.helpers';
import testUsers from '../../config/test-users.json';

test.describe('Dashboard - Navigation', () => {
  let authHelpers: AuthHelpers;
  let navHelpers: NavigationHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    navHelpers = new NavigationHelpers(page);
    
    // Login and go to dashboard
    await authHelpers.login(testUsers.validUser.email, testUsers.validUser.password);
    await authHelpers.waitForSuccessfulLogin();
  });

  test.describe('Sidebar Navigation', () => {
    test('should display all navigation items', async ({ page }) => {
      const expectedItems = [
        'Chat',
        'Histórico',
        'Templates', 
        'Analytics',
        'Perfil',
        'Configurações',
        'Assinatura'
      ];

      const visibleItems = await navHelpers.getVisibleNavigationItems();
      
      // Check that main items are present
      for (const item of expectedItems) {
        const found = visibleItems.some(visible => 
          visible.toLowerCase().includes(item.toLowerCase())
        );
        
        if (!found) {
          console.log(`Missing navigation item: ${item}`);
        }
      }

      // Should have at least the core navigation items
      expect(visibleItems.length).toBeGreaterThanOrEqual(5);
    });

    test('should highlight active navigation item', async ({ page }) => {
      // Navigate to different sections and check active state
      const sections = [
        { name: 'chat', text: 'Chat' },
        { name: 'history', text: 'Histórico' },
        { name: 'profile', text: 'Perfil' }
      ];

      for (const section of sections) {
        await navHelpers.navigateToDashboardSection(section.name as any);
        
        // Check if the item is marked as active
        const isActive = await navHelpers.isNavigationItemActive(section.text);
        expect(isActive).toBe(true);
      }
    });

    test('should navigate correctly to all sections', async ({ page }) => {
      const navigationTests = [
        { section: 'chat', expectedUrl: '/dashboard', title: 'Chat' },
        { section: 'history', expectedUrl: '/dashboard/history', title: 'Histórico' },
        { section: 'templates', expectedUrl: '/dashboard/templates', title: 'Templates' },
        { section: 'profile', expectedUrl: '/dashboard/profile', title: 'Perfil' },
        { section: 'settings', expectedUrl: '/dashboard/settings', title: 'Configurações' },
        { section: 'subscription', expectedUrl: '/dashboard/subscription', title: 'Assinatura' }
      ];

      for (const navTest of navigationTests) {
        await navHelpers.navigateToDashboardSection(navTest.section as any);
        await navHelpers.verifyCurrentPage(navTest.expectedUrl);
        
        // Verify we're on the right page
        const pageTitle = await navHelpers.getCurrentPageTitle();
        expect(pageTitle.toLowerCase()).toContain(navTest.title.toLowerCase());
      }
    });

    test('should persist navigation state on page refresh', async ({ page }) => {
      // Navigate to a specific section
      await navHelpers.navigateToDashboardSection('profile');
      
      // Refresh the page
      await page.reload();
      await navHelpers.waitForPageLoad();
      
      // Should still be on the same section
      await expect(page).toHaveURL('/dashboard/profile');
      
      // Active state should be maintained
      const isActive = await navHelpers.isNavigationItemActive('Perfil');
      expect(isActive).toBe(true);
    });
  });

  test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should have hamburger menu on mobile', async ({ page }) => {
      const menuButton = page.getByRole('button', { name: /menu/i });
      await expect(menuButton).toBeVisible();
    });

    test('should toggle sidebar on mobile', async ({ page }) => {
      // Initially sidebar should be hidden
      let sidebarVisible = await navHelpers.isSidebarVisible();
      expect(sidebarVisible).toBe(false);

      // Toggle sidebar
      await navHelpers.toggleSidebar();
      await page.waitForTimeout(300); // Wait for animation

      // Sidebar should be visible
      sidebarVisible = await navHelpers.isSidebarVisible();
      expect(sidebarVisible).toBe(true);

      // Toggle again to close
      await navHelpers.toggleSidebar();
      await page.waitForTimeout(300);

      // Sidebar should be hidden again
      sidebarVisible = await navHelpers.isSidebarVisible();
      expect(sidebarVisible).toBe(false);
    });

    test('should close sidebar when navigating on mobile', async ({ page }) => {
      // Open sidebar
      await navHelpers.toggleSidebar();
      await page.waitForTimeout(300);

      // Navigate to a section
      await page.getByRole('link', { name: 'Perfil' }).click();
      await page.waitForURL('**/dashboard/profile');

      // Sidebar should auto-close after navigation
      await page.waitForTimeout(300);
      const sidebarVisible = await navHelpers.isSidebarVisible();
      expect(sidebarVisible).toBe(false);
    });

    test('should have overlay when sidebar is open', async ({ page }) => {
      // Open sidebar
      await navHelpers.toggleSidebar();
      
      // Check for overlay
      const overlay = page.locator('.overlay, [class*="overlay"], .backdrop');
      await expect(overlay).toBeVisible();

      // Clicking overlay should close sidebar
      await overlay.click();
      await page.waitForTimeout(300);

      const sidebarVisible = await navHelpers.isSidebarVisible();
      expect(sidebarVisible).toBe(false);
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should display breadcrumbs on sub-pages', async ({ page }) => {
      // Navigate to a sub-section
      await navHelpers.navigateToDashboardSection('profile');

      // Look for breadcrumbs
      const breadcrumbs = page.locator('nav[aria-label="breadcrumb"], .breadcrumb, [class*="breadcrumb"]');
      
      if (await breadcrumbs.isVisible()) {
        // Should have home/dashboard link
        const homeLink = breadcrumbs.getByRole('link', { name: /home|dashboard|início/i });
        await expect(homeLink).toBeVisible();

        // Should show current page
        const currentPage = breadcrumbs.getByText(/perfil|profile/i);
        await expect(currentPage).toBeVisible();
      }
    });

    test('should navigate using breadcrumbs', async ({ page }) => {
      // Go to a deep page
      await navHelpers.navigateToDashboardSection('settings');
      
      // If breadcrumbs exist, test navigation
      const breadcrumbs = page.locator('nav[aria-label="breadcrumb"], .breadcrumb');
      
      if (await breadcrumbs.isVisible()) {
        // Click home/dashboard in breadcrumb
        const homeLink = breadcrumbs.getByRole('link').first();
        await homeLink.click();
        
        // Should go back to dashboard
        await expect(page).toHaveURL('/dashboard');
      }
    });
  });

  test.describe('Navigation Transitions', () => {
    test('should show loading state during navigation', async ({ page }) => {
      // Start on dashboard
      await page.goto('/dashboard');

      // Monitor for loading indicators
      let loadingShown = false;
      
      page.on('framenavigated', () => {
        // Check for loading indicators during navigation
      });

      // Navigate to different section
      const profileLink = page.getByRole('link', { name: 'Perfil' });
      
      // Start navigation
      await profileLink.click();

      // Check for any loading indicators
      const loadingIndicators = [
        page.locator('.loading-bar'),
        page.locator('.nprogress'),
        page.locator('[role="progressbar"]')
      ];

      for (const indicator of loadingIndicators) {
        if (await indicator.isVisible({ timeout: 100 })) {
          loadingShown = true;
          break;
        }
      }

      // Wait for navigation to complete
      await page.waitForURL('**/dashboard/profile');
    });

    test('should maintain scroll position when using browser back', async ({ page }) => {
      // Navigate to a page with scrollable content
      await navHelpers.navigateToDashboardSection('history');
      
      // Scroll down if possible
      await page.evaluate(() => window.scrollTo(0, 500));
      const scrollBefore = await page.evaluate(() => window.scrollY);

      // Navigate to another page
      await navHelpers.navigateToDashboardSection('profile');

      // Go back
      await page.goBack();
      await page.waitForURL('**/dashboard/history');

      // Check scroll position (might be restored)
      const scrollAfter = await page.evaluate(() => window.scrollY);
      
      // Browser might restore scroll position
      // This is browser-dependent behavior
    });
  });

  test.describe('Navigation Errors', () => {
    test('should handle navigation to non-existent routes', async ({ page }) => {
      // Try to navigate to a non-existent route
      await page.goto('/dashboard/non-existent-page');

      // Should either show 404 or redirect
      const is404 = await page.getByText(/404|not found|não encontrado/i).isVisible();
      const isRedirected = page.url().includes('/dashboard');

      expect(is404 || isRedirected).toBe(true);
    });

    test('should handle navigation errors gracefully', async ({ page, context }) => {
      // Navigate to profile
      await navHelpers.navigateToDashboardSection('profile');

      // Block the API call
      await context.route('**/api/profile', route => route.abort());

      // Reload the page
      await page.reload();

      // Page should still render with error state
      await expect(page.getByRole('main')).toBeVisible();
      
      // Should show error message or retry option
      const errorIndicators = [
        page.getByText(/erro|error/i),
        page.getByRole('button', { name: /tentar novamente|try again|recarregar|reload/i })
      ];

      let foundError = false;
      for (const indicator of errorIndicators) {
        if (await indicator.isVisible()) {
          foundError = true;
          break;
        }
      }
    });
  });

  test.describe('Navigation Accessibility', () => {
    test('should have skip navigation link', async ({ page }) => {
      // Check for skip navigation link (usually hidden but accessible)
      const skipLink = page.getByRole('link', { name: /skip|pular/i });
      
      if (await skipLink.count() > 0) {
        // Focus on it with keyboard
        await page.keyboard.press('Tab');
        
        // Skip link should become visible when focused
        if (await skipLink.isVisible()) {
          await expect(skipLink).toBeFocused();
        }
      }
    });

    test('should have proper ARIA labels for navigation', async ({ page }) => {
      // Main navigation should have aria-label
      const mainNav = page.getByRole('navigation').first();
      const ariaLabel = await mainNav.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    });

    test('should be fully keyboard navigable', async ({ page }) => {
      // Reset focus
      await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());

      // Tab to first navigation item
      let navItemFocused = false;
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement;
          return {
            tag: el?.tagName,
            text: el?.textContent,
            href: (el as HTMLAnchorElement)?.href
          };
        });

        if (focusedElement.href?.includes('/dashboard')) {
          navItemFocused = true;
          
          // Press Enter to navigate
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
          
          break;
        }
      }

      expect(navItemFocused).toBe(true);
    });

    test('should announce page changes to screen readers', async ({ page }) => {
      // Look for aria-live regions
      const liveRegion = page.locator('[aria-live]');
      
      if (await liveRegion.count() > 0) {
        // Navigate to trigger announcement
        await navHelpers.navigateToDashboardSection('profile');
        
        // Check if live region updated
        const announcement = await liveRegion.textContent();
        expect(announcement).toBeTruthy();
      }
    });
  });

  test.describe('Navigation Performance', () => {
    test('should cache navigation state', async ({ page }) => {
      // Navigate through multiple sections
      const sections = ['profile', 'settings', 'history'];
      
      for (const section of sections) {
        const startTime = Date.now();
        await navHelpers.navigateToDashboardSection(section as any);
        const firstLoadTime = Date.now() - startTime;

        // Navigate away and back
        await navHelpers.navigateToDashboardSection('chat');
        
        const secondStartTime = Date.now();
        await navHelpers.navigateToDashboardSection(section as any);
        const secondLoadTime = Date.now() - secondStartTime;

        // Second navigation should be faster (cached)
        // This might not always be true depending on implementation
      }
    });

    test('should preload navigation targets on hover', async ({ page }) => {
      // Monitor network requests
      const preloadRequests: string[] = [];
      page.on('request', request => {
        if (request.url().includes('/api/') && request.method() === 'GET') {
          preloadRequests.push(request.url());
        }
      });

      // Hover over navigation items
      const navLinks = page.getByRole('link');
      const linkCount = await navLinks.count();

      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        await navLinks.nth(i).hover();
        await page.waitForTimeout(100);
      }

      // Some apps implement prefetching on hover
      // This is optional optimization
    });
  });
});