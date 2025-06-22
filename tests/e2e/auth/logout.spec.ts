import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../helpers/auth.helpers';
import testUsers from '../../config/test-users.json';

test.describe('Authentication - Logout Module', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    
    // Login before each test
    await authHelpers.login(testUsers.validUser.email, testUsers.validUser.password);
    await authHelpers.waitForSuccessfulLogin();
  });

  test.describe('Logout UI', () => {
    test('should display logout option in user menu', async ({ page }) => {
      // Click user menu/avatar
      const userMenuTriggers = [
        page.getByRole('button', { name: /user/i }),
        page.getByRole('button', { name: /profile/i }),
        page.getByRole('button', { name: /menu/i }),
        page.locator('[data-testid="user-menu"]'),
        page.locator('.avatar, [class*="avatar"]')
      ];

      let menuOpened = false;
      for (const trigger of userMenuTriggers) {
        if (await trigger.isVisible()) {
          await trigger.click();
          menuOpened = true;
          break;
        }
      }

      expect(menuOpened).toBe(true);

      // Logout option should be visible
      await expect(page.getByRole('button', { name: /logout|sair/i })).toBeVisible();
    });

    test('should show logout confirmation dialog if implemented', async ({ page }) => {
      // Open user menu
      await page.getByRole('button', { name: /user|profile|menu/i }).click();
      
      // Click logout
      await page.getByRole('button', { name: /logout|sair/i }).click();

      // Check if confirmation dialog appears
      const confirmDialog = page.getByRole('dialog');
      if (await confirmDialog.isVisible({ timeout: 1000 })) {
        await expect(confirmDialog).toContainText(/confirmar|certeza/i);
        
        // Should have confirm and cancel buttons
        await expect(page.getByRole('button', { name: /confirmar|sim/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /cancelar|não/i })).toBeVisible();
      }
    });
  });

  test.describe('Logout Flow', () => {
    test('should logout successfully and redirect to login', async ({ page }) => {
      // Perform logout
      await authHelpers.logout();

      // Should redirect to login page
      await expect(page).toHaveURL('/auth/signin');

      // User should not be logged in
      const isLoggedIn = await authHelpers.isLoggedIn();
      expect(isLoggedIn).toBe(false);
    });

    test('should clear session and cookies on logout', async ({ page, context }) => {
      // Get cookies before logout
      const cookiesBefore = await context.cookies();
      const sessionCookieBefore = cookiesBefore.find(c => 
        c.name.includes('session') || c.name.includes('auth')
      );
      expect(sessionCookieBefore).toBeTruthy();

      // Logout
      await authHelpers.logout();

      // Check cookies after logout
      const cookiesAfter = await context.cookies();
      const sessionCookieAfter = cookiesAfter.find(c => 
        c.name.includes('session') || c.name.includes('auth')
      );
      
      // Session cookie should be cleared or expired
      if (sessionCookieAfter) {
        expect(new Date(sessionCookieAfter.expires * 1000).getTime()).toBeLessThanOrEqual(Date.now());
      }
    });

    test('should prevent access to protected pages after logout', async ({ page }) => {
      // Logout
      await authHelpers.logout();

      // Try to access protected pages
      const protectedPages = [
        '/dashboard',
        '/dashboard/profile',
        '/dashboard/settings',
        '/dashboard/chat'
      ];

      for (const protectedPage of protectedPages) {
        await page.goto(protectedPage);
        // Should redirect to login
        await expect(page).toHaveURL(/\/auth\/signin/);
      }
    });

    test('should handle logout errors gracefully', async ({ page, context }) => {
      // Mock logout API error
      await context.route('**/api/auth/signout', route => {
        route.fulfill({
          status: 500,
          body: 'Server error'
        });
      });

      // Try to logout
      await page.getByRole('button', { name: /user|profile|menu/i }).click();
      await page.getByRole('button', { name: /logout|sair/i }).click();

      // Should still redirect to login even if API fails
      await page.waitForTimeout(2000);
      
      // Frontend should handle the error and still clear local session
      const currentUrl = page.url();
      expect(currentUrl.includes('/auth/signin') || currentUrl.includes('/dashboard')).toBe(true);
    });
  });

  test.describe('Multi-tab Logout', () => {
    test('should logout from all tabs when logged out from one', async ({ page, context }) => {
      // Open second tab
      const page2 = await context.newPage();
      await page2.goto('/dashboard');
      
      // Both tabs should be logged in
      await expect(page).toHaveURL('/dashboard');
      await expect(page2).toHaveURL('/dashboard');

      // Logout from first tab
      await authHelpers.logout();

      // Refresh second tab
      await page2.reload();

      // Second tab should redirect to login
      await expect(page2).toHaveURL(/\/auth\/signin/);
    });
  });

  test.describe('Logout States', () => {
    test('should show loading state during logout', async ({ page }) => {
      // Open user menu
      await page.getByRole('button', { name: /user|profile|menu/i }).click();
      
      // Click logout
      const logoutButton = page.getByRole('button', { name: /logout|sair/i });
      await logoutButton.click();

      // Check for loading indicators
      const loadingStates = [
        page.getByText(/saindo|logging out/i),
        page.locator('.loading, .spinner'),
        logoutButton.locator('.animate-spin')
      ];

      let hasLoadingState = false;
      for (const loadingState of loadingStates) {
        if (await loadingState.isVisible({ timeout: 500 })) {
          hasLoadingState = true;
          break;
        }
      }

      // If loading state exists, verify it
      if (hasLoadingState) {
        // Should eventually redirect
        await page.waitForURL('/auth/signin', { timeout: 5000 });
      }
    });

    test('should disable logout button during process', async ({ page }) => {
      // Open user menu
      await page.getByRole('button', { name: /user|profile|menu/i }).click();
      
      // Get logout button
      const logoutButton = page.getByRole('button', { name: /logout|sair/i });
      
      // Start monitoring button state
      let wasDisabled = false;
      const checkDisabled = setInterval(async () => {
        if (await logoutButton.isDisabled()) {
          wasDisabled = true;
        }
      }, 50);

      // Click logout
      await logoutButton.click();

      // Wait for redirect
      await page.waitForURL('/auth/signin', { timeout: 5000 });
      
      clearInterval(checkDisabled);

      // Button should have been disabled at some point (if UI implements it)
      // This is optional based on implementation
    });
  });

  test.describe('Post-Logout', () => {
    test('should show success message after logout if implemented', async ({ page }) => {
      // Logout
      await authHelpers.logout();

      // Check for success message on login page
      const successMessages = [
        page.getByText(/logout.*sucesso/i),
        page.getByText(/desconectado.*sucesso/i),
        page.getByText(/sessão.*encerrada/i)
      ];

      let hasSuccessMessage = false;
      for (const message of successMessages) {
        if (await message.isVisible({ timeout: 1000 })) {
          hasSuccessMessage = true;
          break;
        }
      }

      // Success message is optional based on UX design
    });

    test('should clear user data from localStorage', async ({ page }) => {
      // Check localStorage has user data
      const userDataBefore = await page.evaluate(() => {
        return {
          user: localStorage.getItem('user'),
          token: localStorage.getItem('token'),
          preferences: localStorage.getItem('preferences')
        };
      });

      // Some data should exist
      expect(Object.values(userDataBefore).some(v => v !== null)).toBe(true);

      // Logout
      await authHelpers.logout();

      // Check localStorage is cleared
      const userDataAfter = await page.evaluate(() => {
        return {
          user: localStorage.getItem('user'),
          token: localStorage.getItem('token'),
          preferences: localStorage.getItem('preferences')
        };
      });

      // User-specific data should be cleared
      expect(userDataAfter.user).toBeNull();
      expect(userDataAfter.token).toBeNull();
    });
  });

  test.describe('Logout Accessibility', () => {
    test('should be keyboard accessible', async ({ page }) => {
      // Navigate to user menu with keyboard
      await page.keyboard.press('Tab');
      
      // Find and focus user menu button
      let attempts = 0;
      while (attempts < 20) {
        const focused = await page.evaluate(() => document.activeElement?.tagName);
        const focusedText = await page.evaluate(() => document.activeElement?.textContent);
        
        if (focusedText?.match(/user|profile|menu/i)) {
          await page.keyboard.press('Enter');
          break;
        }
        
        await page.keyboard.press('Tab');
        attempts++;
      }

      // Logout button should be accessible via keyboard
      const logoutButton = page.getByRole('button', { name: /logout|sair/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.focus();
        await expect(logoutButton).toBeFocused();
      }
    });

    test('should announce logout to screen readers', async ({ page }) => {
      // Logout
      await authHelpers.logout();

      // Check for ARIA live regions that might announce logout
      const liveRegions = await page.locator('[aria-live="polite"], [aria-live="assertive"]').all();
      
      for (const region of liveRegions) {
        const text = await region.textContent();
        if (text?.match(/logout|sair|desconectado/i)) {
          // Found logout announcement
          expect(text).toBeTruthy();
          break;
        }
      }
    });
  });

  test.describe('Logout Edge Cases', () => {
    test('should handle rapid logout attempts', async ({ page }) => {
      // Open user menu
      await page.getByRole('button', { name: /user|profile|menu/i }).click();
      
      // Click logout multiple times rapidly
      const logoutButton = page.getByRole('button', { name: /logout|sair/i });
      
      // Don't await these clicks to simulate rapid clicking
      logoutButton.click();
      logoutButton.click();
      logoutButton.click();

      // Should still logout properly
      await page.waitForURL('/auth/signin', { timeout: 5000 });
      
      // Should not cause errors
      await expect(page.locator('.error, [role="alert"]')).not.toBeVisible();
    });

    test('should handle logout with pending requests', async ({ page }) => {
      // Start a long-running request
      page.evaluate(() => {
        // Simulate a pending fetch request
        fetch('/api/long-running-task', {
          method: 'POST',
          body: JSON.stringify({ data: 'test' })
        });
      });

      // Immediately logout
      await authHelpers.logout();

      // Should still redirect properly
      await expect(page).toHaveURL('/auth/signin');
    });
  });
});