import { Page, expect } from '@playwright/test';

export class ChatHelpers {
  constructor(private page: Page) {}

  /**
   * Send a message in chat
   */
  async sendMessage(message: string) {
    const input = this.page.getByTestId('chat-input')
      .or(this.page.getByPlaceholder(/digite.*mensagem/i));
    
    const sendButton = this.page.getByTestId('send-button')
      .or(this.page.getByRole('button', { name: 'Enviar' }));

    await input.fill(message);
    await sendButton.click();
    
    // Wait for message to appear
    await this.waitForMessage(message);
  }

  /**
   * Send message using Enter key
   */
  async sendMessageWithEnter(message: string) {
    const input = this.page.getByTestId('chat-input')
      .or(this.page.getByPlaceholder(/digite.*mensagem/i));
    
    await input.fill(message);
    await input.press('Enter');
    
    await this.waitForMessage(message);
  }

  /**
   * Wait for a message to appear in chat
   */
  async waitForMessage(text: string, timeout = 5000) {
    await expect(this.page.getByText(text)).toBeVisible({ timeout });
  }

  /**
   * Get all messages in chat
   */
  async getAllMessages(): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    
    // Get user messages
    const userMessages = await this.page.locator('[data-testid^="message-container-user"]').all();
    for (const msg of userMessages) {
      const content = await msg.textContent();
      if (content) messages.push({ role: 'user', content: content.trim() });
    }
    
    // Get assistant messages
    const assistantMessages = await this.page.locator('[data-testid^="message-container-assistant"]').all();
    for (const msg of assistantMessages) {
      const content = await msg.textContent();
      if (content) messages.push({ role: 'assistant', content: content.trim() });
    }
    
    return messages;
  }

  /**
   * Check if chat is in loading state
   */
  async isChatLoading(): Promise<boolean> {
    const loadingIndicators = [
      this.page.getByText('🟡 Gerando resposta...'),
      this.page.getByText('Enviando'),
      this.page.getByTestId('typing-indicator'),
      this.page.locator('.animate-pulse')
    ];
    
    for (const indicator of loadingIndicators) {
      if (await indicator.isVisible()) return true;
    }
    
    return false;
  }

  /**
   * Wait for chat to finish loading
   */
  async waitForChatReady(timeout = 15000) {
    // Wait for loading to start (optional)
    await this.page.waitForTimeout(500);
    
    // Then wait for it to finish
    await expect(this.page.getByText('🟢 Pronto')).toBeVisible({ timeout });
  }

  /**
   * Check if error alert is present
   */
  async hasErrorAlert(): Promise<boolean> {
    const errorAlert = this.page.getByTestId('error-alert')
      .or(this.page.locator('[role="alert"].alert-destructive'));
    
    return await errorAlert.isVisible();
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string | null> {
    if (await this.hasErrorAlert()) {
      const errorMsg = this.page.getByTestId('error-message')
        .or(this.page.locator('[role="alert"] .alert-description'));
      
      return await errorMsg.textContent();
    }
    return null;
  }

  /**
   * Clear chat input
   */
  async clearInput() {
    const input = this.page.getByTestId('chat-input')
      .or(this.page.getByPlaceholder(/digite.*mensagem/i));
    
    await input.clear();
  }

  /**
   * Check if chat is empty
   */
  async isChatEmpty(): Promise<boolean> {
    const emptyState = this.page.getByTestId('empty-state')
      .or(this.page.getByText('Digite uma mensagem para começar...'));
    
    return await emptyState.isVisible();
  }

  /**
   * Get message count
   */
  async getMessageCount(): Promise<{ user: number; assistant: number; total: number }> {
    const userMessages = await this.page.locator('[data-testid^="message-container-user"]').count();
    const assistantMessages = await this.page.locator('[data-testid^="message-container-assistant"]').count();
    
    return {
      user: userMessages,
      assistant: assistantMessages,
      total: userMessages + assistantMessages
    };
  }

  /**
   * Select a chat template
   */
  async selectTemplate(templateName: string) {
    // Open template selector
    await this.page.getByRole('button', { name: /template/i }).click();
    
    // Select template
    await this.page.getByRole('button', { name: templateName }).click();
    
    // Wait for template to be applied
    await this.page.waitForTimeout(500);
  }

  /**
   * Export chat conversation
   */
  async exportChat(format: 'txt' | 'json' | 'pdf' = 'txt') {
    // Open export menu
    await this.page.getByRole('button', { name: /export/i }).click();
    
    // Select format
    await this.page.getByRole('button', { name: format.toUpperCase() }).click();
    
    // Wait for download
    const downloadPromise = this.page.waitForEvent('download');
    await this.page.getByRole('button', { name: /download/i }).click();
    
    return await downloadPromise;
  }
}