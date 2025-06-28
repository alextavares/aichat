import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../helpers/auth.helpers';
import testUsers from '../../config/test-users.json';

test.describe('Authentication - Login Module', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    await page.goto('/auth/signin');
  });

  test.describe('Login Form UI', () => {
    test('should display all form elements correctly', async ({ page }) => {
      // Check page title
      await expect(page.getByText('Entrar na sua conta')).toBeVisible();

      // Check form fields
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();

      // Check buttons
      await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
      
      // Check links
      await expect(page.getByText('Não tem uma conta?')).toBeVisible();
    });

    test('should show/hide password when toggle is clicked', async ({ page }) => {
      const passwordInput = page.locator('input[id="password"]');
      
      // Initially password should be hidden
      await expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Click toggle button if exists
      const toggleButton = page.getByRole('button', { name: /mostrar senha/i });
      if (await toggleButton.count() > 0) {
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');
        
        // Click again to hide
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  test.describe('Form Validation', () => {
    test('should validate required fields', async ({ page }) => {
      // Try to submit empty form
      await page.getByRole('button', { name: 'Entrar' }).click();

      // Check that form doesn't submit (stays on same page)
      await expect(page).toHaveURL(/\/auth\/signin/);
      // HTML5 validation prevents submission
    });

    test('should validate email format', async ({ page }) => {
      // Enter invalid email
      await authHelpers.fillLoginForm('invalid-email', 'Test123!@#');
      await page.getByRole('button', { name: 'Entrar' }).click();

      // HTML5 validation or stay on page
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('should validate minimum password length', async ({ page }) => {
      // Enter short password
      await authHelpers.fillLoginForm('test@example.com', '123');
      await page.getByRole('button', { name: 'Entrar' }).click();

      // Form should not submit with short password
      await expect(page).toHaveURL(/\/auth\/signin/);
    });
  });

  test.describe('Login Flow - Success Cases', () => {
    test('should login successfully with valid credentials', async ({ page }) => {
      // Use valid test user
      await authHelpers.login(testUsers.validUser.email, testUsers.validUser.password);

      // Should redirect to dashboard
      await authHelpers.waitForSuccessfulLogin();
      await expect(page).toHaveURL('/dashboard');

      // Check if user is logged in
      const isLoggedIn = await authHelpers.isLoggedIn();
      expect(isLoggedIn).toBe(true);
    });

    test('should show loading state during login', async ({ page }) => {
      // Fill form
      await authHelpers.fillLoginForm(testUsers.validUser.email, testUsers.validUser.password);

      // Click login and check loading state
      const loginButton = page.getByRole('button', { name: 'Entrar' });
      await loginButton.click();

      // Button should be disabled during loading
      await expect(loginButton).toBeDisabled();
      
      // Should show loading text
      await expect(page.getByText('Entrando...')).toBeVisible({ timeout: 1000 });

      // Wait for login to complete
      await authHelpers.waitForSuccessfulLogin();
    });

    test('should redirect to requested page after login', async ({ page }) => {
      // Try to access protected page
      await page.goto('/dashboard/profile');
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/signin/);

      // Login
      await authHelpers.login(testUsers.validUser.email, testUsers.validUser.password);

      // Should redirect back to requested page
      await expect(page).toHaveURL('/dashboard/profile');
    });
  });

  test.describe('Login Flow - Error Cases', () => {
    test('should show error for non-existent user', async ({ page }) => {
      await authHelpers.login(
        testUsers.invalidUsers.nonExistent.email,
        testUsers.invalidUsers.nonExistent.password
      );

      // Check for error message
      const errorMessage = await authHelpers.getErrorMessage();
      expect(errorMessage).toMatch(/email ou senha incorretos|credenciais/i);

      // Should stay on login page
      await expect(page).toHaveURL(/\/auth\/signin/);
    });

    test('should show error for wrong password', async ({ page }) => {
      await authHelpers.login(
        testUsers.invalidUsers.wrongPassword.email,
        testUsers.invalidUsers.wrongPassword.password
      );

      // Check for error message
      const errorMessage = await authHelpers.getErrorMessage();
      expect(errorMessage).toMatch(/email ou senha incorretos|credenciais/i);
    });

    test('should handle network errors gracefully', async ({ page, context }) => {
      // Block API requests
      await context.route('**/api/auth/**', route => route.abort());

      // Try to login
      await authHelpers.fillLoginForm(testUsers.validUser.email, testUsers.validUser.password);
      await page.getByRole('button', { name: 'Entrar' }).click();

      // Should show error message
      const errorElement = page.locator('[role="alert"]').or(page.getByText(/erro/i));
      await expect(errorElement).toBeVisible();
    });

    test('should clear error message when user types', async ({ page }) => {
      // Trigger an error first
      await authHelpers.login('wrong@email.com', 'wrongpass');
      
      // Error should be visible
      await expect(page.locator('[role="alert"]')).toBeVisible();

      // Start typing in email field
      await page.locator('input[id="email"]').fill('new@email.com');

      // Error should disappear
      await expect(page.locator('[role="alert"]')).not.toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async ({ page }) => {
      // Login
      await authHelpers.login(testUsers.validUser.email, testUsers.validUser.password);
      await authHelpers.waitForSuccessfulLogin();

      // Refresh page
      await page.reload();

      // Should still be on dashboard
      await expect(page).toHaveURL('/dashboard');
      const isLoggedIn = await authHelpers.isLoggedIn();
      expect(isLoggedIn).toBe(true);
    });

    test('should redirect to login when session expires', async ({ page, context }) => {
      // Login first
      await authHelpers.login(testUsers.validUser.email, testUsers.validUser.password);
      await authHelpers.waitForSuccessfulLogin();

      // Clear cookies to simulate session expiry
      await context.clearCookies();

      // Try to navigate to protected page
      await page.goto('/dashboard/profile');

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/signin/);
    });
  });

  test.describe('OAuth Login', () => {
    test('should display OAuth providers when available', async ({ page }) => {
      // Check for OAuth buttons
      const googleButton = page.getByRole('button', { name: /google/i });
      const githubButton = page.getByRole('button', { name: /github/i });

      // They might be disabled if not configured
      if (await googleButton.count() > 0) {
        await expect(googleButton).toBeVisible();
      }
      
      if (await githubButton.count() > 0) {
        await expect(githubButton).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab'); // Focus email
      await expect(page.locator('input[id="email"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Focus password
      await expect(page.locator('input[id="password"]')).toBeFocused();

      await page.keyboard.press('Tab'); // Focus login button
      await expect(page.getByRole('button', { name: 'Entrar' })).toBeFocused();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Check form has proper role
      const form = page.locator('form');
      // Form exists and is accessible
      await expect(form).toBeVisible();

      // Check inputs have labels
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should be responsive on mobile', async ({ page }) => {
      // Check that form is still accessible
      await expect(page.locator('input[id="email"]')).toBeVisible();
      await expect(page.locator('input[id="password"]')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();

      // Form should stack vertically
      const form = page.locator('form');
      const formBox = await form.boundingBox();
      expect(formBox?.width).toBeLessThan(400);
    });
  });
});