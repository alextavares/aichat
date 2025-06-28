import { test, expect } from '@playwright/test';
import { setupMockHandlers, setupAuthenticatedSession } from '../../mocks/handlers';
import { mockUsers } from '../../fixtures/auth.fixtures';

test.describe('Login with Mocks', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock API handlers
    await setupMockHandlers(page);
    await page.goto('/auth/signin');
  });

  test('should login successfully with mocked backend', async ({ page }) => {
    // Fill login form with valid mock user
    await page.locator('input[id="email"]').fill(mockUsers[0].email);
    await page.locator('input[id="password"]').fill(mockUsers[0].password);
    
    // Click login button
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Verify user info is displayed
    await expect(page.getByText(mockUsers[0].name)).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Fill login form with invalid credentials
    await page.locator('input[id="email"]').fill('wrong@email.com');
    await page.locator('input[id="password"]').fill('wrongpassword');
    
    // Click login button
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Should stay on login page
    await expect(page).toHaveURL(/\/auth\/signin/);
    
    // Should show error message
    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('[role="alert"]')).toContainText(/credenciais|email ou senha/i);
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // Setup authenticated session
    await setupAuthenticatedSession(page, mockUsers[0]);
    
    // Go directly to dashboard
    await page.goto('/dashboard');
    
    // Should not redirect to login
    await expect(page).toHaveURL('/dashboard');
    
    // Refresh page
    await page.reload();
    
    // Should still be on dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle loading states correctly', async ({ page }) => {
    // Slow down the mock response
    await page.route('**/api/auth/signin', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        json: { url: '/dashboard', ok: true },
      });
    });
    
    // Fill and submit form
    await page.locator('input[id="email"]').fill(mockUsers[0].email);
    await page.locator('input[id="password"]').fill(mockUsers[0].password);
    
    const loginButton = page.getByRole('button', { name: 'Entrar' });
    await loginButton.click();
    
    // Button should be disabled during loading
    await expect(loginButton).toBeDisabled();
    
    // Should show loading text
    await expect(page.getByText('Entrando...')).toBeVisible();
    
    // Eventually should redirect
    await expect(page).toHaveURL('/dashboard', { timeout: 5000 });
  });
});