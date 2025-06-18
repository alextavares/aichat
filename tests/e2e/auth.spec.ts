import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Inner AI/);
    await expect(page.locator('text=Sign in')).toBeVisible();
  });

  test('should login with test credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await page.waitForURL('/dashboard');
    
    // Verify logged in state
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Fill invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Verify error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    // Find and click logout button
    await page.click('button:has-text("Logout")');
    
    // Verify redirected to signin
    await expect(page).toHaveURL(/\/auth\/signin/);
  });
});