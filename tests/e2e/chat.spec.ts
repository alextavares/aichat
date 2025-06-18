import { test, expect } from '@playwright/test';

test.describe('Chat Functionality', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should send a message and receive AI response', async ({ page }) => {
    // Find chat input
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await expect(chatInput).toBeVisible();
    
    // Type and send message
    await chatInput.fill('Hello, can you help me with JavaScript?');
    await page.keyboard.press('Enter');
    
    // Wait for AI response
    await expect(page.locator('.message-assistant')).toBeVisible({ timeout: 30000 });
    
    // Verify response contains content
    const aiResponse = page.locator('.message-assistant').last();
    await expect(aiResponse).toContainText(/JavaScript/i);
  });

  test('should show streaming response', async ({ page }) => {
    // Send a message
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('Explain React hooks in detail');
    await page.keyboard.press('Enter');
    
    // Verify streaming indicator appears
    await expect(page.locator('.streaming-indicator')).toBeVisible();
    
    // Wait for response to complete
    await expect(page.locator('.streaming-indicator')).not.toBeVisible({ timeout: 30000 });
  });

  test('should maintain conversation history', async ({ page }) => {
    // Send first message
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    await chatInput.fill('What is TypeScript?');
    await page.keyboard.press('Enter');
    
    // Wait for response
    await page.waitForSelector('.message-assistant', { timeout: 30000 });
    
    // Send follow-up message
    await chatInput.fill('Can you give me an example?');
    await page.keyboard.press('Enter');
    
    // Verify both conversations are visible
    const messages = page.locator('.message-user');
    await expect(messages).toHaveCount(2);
  });

  test('should enforce usage limits', async ({ page }) => {
    // Send 10 messages to reach free tier limit
    const chatInput = page.locator('textarea[placeholder*="Type your message"]');
    
    for (let i = 1; i <= 10; i++) {
      await chatInput.fill(`Test message ${i}`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000); // Small delay between messages
    }
    
    // Try to send 11th message
    await chatInput.fill('This should be blocked');
    await page.keyboard.press('Enter');
    
    // Verify limit reached message
    await expect(page.locator('text=daily limit reached')).toBeVisible();
  });
});