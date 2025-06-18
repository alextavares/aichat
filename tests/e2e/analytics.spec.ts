import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should navigate to analytics page', async ({ page }) => {
    // Click analytics link
    await page.click('a:has-text("Analytics")');
    
    // Verify on analytics page
    await expect(page).toHaveURL('/analytics');
    await expect(page.locator('h1:has-text("Analytics Dashboard")')).toBeVisible();
  });

  test('should display usage statistics', async ({ page }) => {
    await page.goto('/analytics');
    
    // Verify main stats cards
    await expect(page.locator('text=Messages Today')).toBeVisible();
    await expect(page.locator('text=Total This Month')).toBeVisible();
    await expect(page.locator('text=AI Model Usage')).toBeVisible();
    await expect(page.locator('text=Estimated Cost')).toBeVisible();
  });

  test('should show usage chart', async ({ page }) => {
    await page.goto('/analytics');
    
    // Verify chart container
    await expect(page.locator('.usage-chart')).toBeVisible();
    
    // Verify chart has data points
    await expect(page.locator('.chart-bar')).toHaveCount(7); // 7 days
  });

  test('should update stats after sending message', async ({ page }) => {
    // Go to analytics first to see initial count
    await page.goto('/analytics');
    const initialCount = await page.locator('.messages-today-count').textContent();
    
    // Go back to dashboard and send a message
    await page.goto('/dashboard');
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('Test message for analytics');
    await page.keyboard.press('Enter');
    
    // Wait for response
    await page.waitForSelector('.message-assistant', { timeout: 30000 });
    
    // Go back to analytics
    await page.goto('/analytics');
    
    // Verify count increased
    const newCount = await page.locator('.messages-today-count').textContent();
    expect(parseInt(newCount || '0')).toBeGreaterThan(parseInt(initialCount || '0'));
  });

  test('should display model breakdown', async ({ page }) => {
    await page.goto('/analytics');
    
    // Verify model usage section
    await expect(page.locator('text=GPT-3.5 Turbo')).toBeVisible();
    await expect(page.locator('text=GPT-4')).toBeVisible();
    
    // Verify percentage displays
    await expect(page.locator('.model-percentage')).toHaveCount(2);
  });
});