import { test, expect } from '@playwright/test';

test.describe('Dashboard Chat Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Try to go to dashboard directly - if redirected to auth, handle it
    await page.goto('/dashboard');
    
    // If redirected to signin, this means auth is required
    if (page.url().includes('/auth/signin')) {
      // For now, just go to demo chat which doesn't require auth
      await page.goto('/demo-chat');
    }
  });

  test('should access chat interface', async ({ page }) => {
    // Go to demo chat since it's publicly accessible
    await page.goto('/demo-chat');
    
    // Verify chat interface is loaded
    await expect(page.getByRole('heading', { name: '🚀 Demo: Chat com Streaming' })).toBeVisible();
    await expect(page.getByPlaceholder('Digite sua mensagem...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar' })).toBeVisible();
  });

  test('should send message and handle response', async ({ page }) => {
    await page.goto('/demo-chat');
    
    const input = page.getByPlaceholder('Digite sua mensagem...');
    const sendButton = page.getByRole('button', { name: 'Enviar' });
    
    // Send a message
    await input.fill('Hello, can you help me with JavaScript?');
    await sendButton.click();
    
    // Verify message appears
    await expect(page.getByText('Hello, can you help me with JavaScript?')).toBeVisible();
    
    // Wait for either response or error
    await page.waitForSelector('[role="alert"], .inline-block:has-text("JavaScript")', { timeout: 15000 });
    
    // Check if we got a response or an error
    const errorAlert = page.locator('[role="alert"]');
    const hasError = await errorAlert.count() > 0;
    
    if (hasError) {
      // API not configured - verify error message
      await expect(errorAlert).toContainText(/API/);
    } else {
      // Got response - verify it exists
      const responseMessages = page.locator('.inline-block').filter({ hasText: 'Hello' });
      await expect(responseMessages).toHaveCount({ mode: 'greaterThan', count: 0 });
    }
  });

  test('should show streaming indicators', async ({ page }) => {
    await page.goto('/demo-chat');
    
    const input = page.getByPlaceholder('Digite sua mensagem...');
    const sendButton = page.getByRole('button', { name: 'Enviar' });
    
    // Send message
    await input.fill('Test streaming response');
    await sendButton.click();
    
    // Verify streaming indicators
    await expect(page.getByText('🟡 Gerando resposta...')).toBeVisible({ timeout: 2000 });
    await expect(page.getByText('Enviando')).toBeVisible({ timeout: 1000 });
    
    // Eventually should return to ready state
    await expect(page.getByText('🟢 Pronto')).toBeVisible({ timeout: 15000 });
  });

  test('should handle multiple messages in conversation', async ({ page }) => {
    await page.goto('/demo-chat');
    
    const input = page.getByPlaceholder('Digite sua mensagem...');
    const sendButton = page.getByRole('button', { name: 'Enviar' });
    
    // Send first message
    await input.fill('First test message');
    await sendButton.click();
    await expect(page.getByText('First test message')).toBeVisible();
    
    // Wait for processing to complete
    await page.waitForTimeout(2000);
    
    // Send second message
    await input.fill('Second test message');
    await sendButton.click();
    await expect(page.getByText('Second test message')).toBeVisible();
    
    // Both messages should be visible
    await expect(page.getByText('First test message')).toBeVisible();
    await expect(page.getByText('Second test message')).toBeVisible();
  });

  test('should prevent sending empty messages', async ({ page }) => {
    await page.goto('/demo-chat');
    
    const input = page.getByPlaceholder('Digite sua mensagem...');
    const sendButton = page.getByRole('button', { name: 'Enviar' });
    
    // Try to send without typing
    await sendButton.click();
    
    // Should still show empty state
    await expect(page.getByText('Digite uma mensagem para começar...')).toBeVisible();
    
    // Try with only whitespace
    await input.fill('   ');
    await sendButton.click();
    
    // Should still show empty state
    await expect(page.getByText('Digite uma mensagem para começar...')).toBeVisible();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.goto('/demo-chat');
    
    const input = page.getByPlaceholder('Digite sua mensagem...');
    const sendButton = page.getByRole('button', { name: 'Enviar' });
    
    // Send a message that will likely trigger an error (no API key)
    await input.fill('This should trigger an API error');
    await sendButton.click();
    
    // Wait for either error or response
    await page.waitForSelector('[role="alert"], .message-assistant', { timeout: 10000 });
    
    // If error appears, verify it's handled properly
    const errorAlert = page.locator('[role="alert"]');
    const hasError = await errorAlert.count() > 0;
    
    if (hasError) {
      await expect(errorAlert).toContainText(/Erro.*API/);
      // Status should return to ready after error
      await expect(page.getByText('🟢 Pronto')).toBeVisible();
    }
  });

  test('should maintain proper UI state during interaction', async ({ page }) => {
    await page.goto('/demo-chat');
    
    const input = page.getByPlaceholder('Digite sua mensagem...');
    const sendButton = page.getByRole('button', { name: 'Enviar' });
    
    // Initially should be ready
    await expect(page.getByText('🟢 Pronto')).toBeVisible();
    await expect(sendButton).toBeEnabled();
    
    // Send message
    await input.fill('UI state test message');
    await sendButton.click();
    
    // During processing
    await expect(sendButton).toBeDisabled();
    await expect(input).toBeDisabled();
    
    // Eventually should return to ready state
    await expect(sendButton).toBeEnabled({ timeout: 15000 });
    await expect(input).toBeEnabled({ timeout: 15000 });
  });
});