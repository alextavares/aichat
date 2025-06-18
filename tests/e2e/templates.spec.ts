import { test, expect } from '@playwright/test';

test.describe('Template System', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should open template selector', async ({ page }) => {
    // Click templates button
    await page.click('button:has-text("Templates")');
    
    // Verify modal opens
    await expect(page.locator('text=Select a Template')).toBeVisible();
    
    // Verify categories are visible
    await expect(page.locator('text=Content Creation')).toBeVisible();
    await expect(page.locator('text=Business')).toBeVisible();
    await expect(page.locator('text=Technical')).toBeVisible();
  });

  test('should use a template', async ({ page }) => {
    // Open templates
    await page.click('button:has-text("Templates")');
    
    // Select a category
    await page.click('text=Content Creation');
    
    // Select a specific template
    await page.click('text=Blog Post Outline');
    
    // Fill template variables
    await page.fill('input[placeholder*="topic"]', 'AI and Machine Learning');
    
    // Use template
    await page.click('button:has-text("Use Template")');
    
    // Verify template is applied to chat
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    const value = await chatInput.inputValue();
    expect(value).toContain('AI and Machine Learning');
  });

  test('should track template usage', async ({ page }) => {
    // Open templates
    await page.click('button:has-text("Templates")');
    
    // Note initial usage count
    const templateCard = page.locator('div:has-text("Blog Post Outline")').first();
    const initialCount = await templateCard.locator('.usage-count').textContent();
    
    // Use the template
    await templateCard.click();
    await page.fill('input[placeholder*="topic"]', 'Test Topic');
    await page.click('button:has-text("Use Template")');
    
    // Re-open templates
    await page.click('button:has-text("Templates")');
    
    // Verify usage count increased
    const newCount = await templateCard.locator('.usage-count').textContent();
    expect(parseInt(newCount || '0')).toBeGreaterThan(parseInt(initialCount || '0'));
  });

  test('should show popular templates on dashboard', async ({ page }) => {
    // Navigate to analytics
    await page.goto('/analytics');
    
    // Verify popular templates section
    await expect(page.locator('text=Popular Templates')).toBeVisible();
    
    // Verify at least one template is shown
    await expect(page.locator('.template-card')).toHaveCount(3);
  });
});