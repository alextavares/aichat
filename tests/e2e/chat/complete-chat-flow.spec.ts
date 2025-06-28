import { test, expect } from '@playwright/test'
import { testConfig } from '../test.config'
import { login } from '../../helpers/auth.helpers'
import testUsers from '../../config/test-users.json'

test.describe('Complete Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await login(page, testUsers.validUser.email, testUsers.validUser.password)
    await page.goto('/chat')
  })

  test('should complete full chat interaction', async ({ page }) => {
    // Step 1: Verify chat interface is loaded
    await expect(page.locator('h1:has-text("Chat")')).toBeVisible()
    await expect(page.locator('textarea[placeholder*="Digite sua mensagem"]')).toBeVisible()

    // Step 2: Select AI model
    const modelSelector = page.locator('select[aria-label="Selecionar modelo"]')
    await modelSelector.selectOption('gpt-3.5-turbo')

    // Step 3: Send a message
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Olá! Me ajude a entender o que é TypeScript.')
    
    // Press Enter or click send button
    await page.keyboard.press('Enter')

    // Step 4: Verify message appears in chat
    await expect(page.locator('text=Olá! Me ajude a entender o que é TypeScript.')).toBeVisible()

    // Step 5: Wait for AI response
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })

    // Step 6: Verify AI response
    await expect(page.locator('text=TypeScript é')).toBeVisible()

    // Step 7: Send follow-up message
    await messageInput.fill('Quais são as principais vantagens?')
    await page.keyboard.press('Enter')

    // Step 8: Verify conversation continues
    await expect(page.locator('text=Quais são as principais vantagens?')).toBeVisible()
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })

    // Step 9: Verify token usage is displayed
    await expect(page.locator('text=/Tokens:.*\\d+/')).toBeVisible()
    await expect(page.locator('text=/Custo:.*R\\$/')).toBeVisible()
  })

  test('should handle different AI models', async ({ page }) => {
    const models = [
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku' },
    ]

    for (const model of models) {
      // Select model
      const modelSelector = page.locator('select[aria-label="Selecionar modelo"]')
      await modelSelector.selectOption(model.id)

      // Send message
      const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
      await messageInput.fill(`Teste com ${model.name}: Diga "Olá"`)
      await page.keyboard.press('Enter')

      // Verify message and response
      await expect(page.locator(`text=Teste com ${model.name}`)).toBeVisible()
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })

      // Clear chat for next test
      await page.click('button[aria-label="Nova conversa"]')
      await page.click('text=Confirmar')
    }
  })

  test('should manage conversations', async ({ page }) => {
    // Create first conversation
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Primeira conversa sobre JavaScript')
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })

    // Start new conversation
    await page.click('button[aria-label="Nova conversa"]')
    await page.click('text=Confirmar')

    // Create second conversation
    await messageInput.fill('Segunda conversa sobre Python')
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })

    // Open conversation sidebar
    await page.click('button[aria-label="Histórico de conversas"]')

    // Verify both conversations appear
    await expect(page.locator('text=JavaScript')).toBeVisible()
    await expect(page.locator('text=Python')).toBeVisible()

    // Switch to first conversation
    await page.click('text=JavaScript')

    // Verify we're back in first conversation
    await expect(page.locator('text=Primeira conversa sobre JavaScript')).toBeVisible()
  })

  test('should handle streaming responses', async ({ page }) => {
    // Send a message that typically generates longer response
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Escreva um guia detalhado sobre React hooks')
    await page.keyboard.press('Enter')

    // Verify streaming indicator appears
    await expect(page.locator('[data-testid="streaming-indicator"]')).toBeVisible()

    // Verify text appears progressively (streaming)
    let previousLength = 0
    for (let i = 0; i < 3; i++) {
      await page.waitForTimeout(1000)
      const responseText = await page.locator('[data-testid="ai-response"]').last().innerText()
      expect(responseText.length).toBeGreaterThan(previousLength)
      previousLength = responseText.length
    }

    // Wait for streaming to complete
    await expect(page.locator('[data-testid="streaming-indicator"]')).toBeHidden({ timeout: 30000 })
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Intercept API calls to simulate error
    await page.route('**/api/chat', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Erro no servidor' }),
      })
    })

    // Send message
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Esta mensagem causará um erro')
    await page.keyboard.press('Enter')

    // Verify error message appears
    await expect(page.locator('text=Erro ao enviar mensagem')).toBeVisible()
    
    // Verify retry button appears
    await expect(page.locator('button:has-text("Tentar novamente")')).toBeVisible()
  })

  test('should enforce message limits', async ({ page }) => {
    // For free users, simulate reaching message limit
    if (testUsers.validUser.subscription === 'free') {
      // Send messages up to limit
      for (let i = 0; i < 10; i++) {
        const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
        await messageInput.fill(`Mensagem ${i + 1}`)
        await page.keyboard.press('Enter')
        await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })
      }

      // Try to send one more message
      const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
      await messageInput.fill('Esta mensagem deve ser bloqueada')
      await page.keyboard.press('Enter')

      // Verify limit message appears
      await expect(page.locator('text=Limite diário de mensagens atingido')).toBeVisible()
      await expect(page.locator('button:has-text("Fazer upgrade")')).toBeVisible()
    }
  })

  test('should copy messages', async ({ page }) => {
    // Send a message
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Mensagem para copiar')
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })

    // Click copy button on user message
    await page.hover('text=Mensagem para copiar')
    await page.click('button[aria-label="Copiar mensagem"]')

    // Verify copy notification
    await expect(page.locator('text=Copiado!')).toBeVisible()
  })

  test('should edit messages', async ({ page }) => {
    // Send a message
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Mensagem com ero')
    await page.keyboard.press('Enter')

    // Click edit button
    await page.hover('text=Mensagem com ero')
    await page.click('button[aria-label="Editar mensagem"]')

    // Edit the message
    const editInput = page.locator('textarea[value="Mensagem com ero"]')
    await editInput.fill('Mensagem com erro corrigido')
    await page.click('button[aria-label="Salvar edição"]')

    // Verify message was updated
    await expect(page.locator('text=Mensagem com erro corrigido')).toBeVisible()
    
    // Verify AI responds to edited message
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeVisible()
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })
  })

  test('should delete messages', async ({ page }) => {
    // Send a message
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Mensagem para deletar')
    await page.keyboard.press('Enter')
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })

    // Delete the message
    await page.hover('text=Mensagem para deletar')
    await page.click('button[aria-label="Deletar mensagem"]')
    
    // Confirm deletion
    await page.click('button:has-text("Confirmar")')

    // Verify message is removed
    await expect(page.locator('text=Mensagem para deletar')).toBeHidden()
  })

  test('should export conversation', async ({ page }) => {
    // Create a conversation with multiple messages
    const messages = [
      'Primeira mensagem da conversa',
      'Segunda mensagem com mais detalhes',
      'Terceira mensagem final',
    ]

    for (const message of messages) {
      const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
      await messageInput.fill(message)
      await page.keyboard.press('Enter')
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })
    }

    // Click export button
    await page.click('button[aria-label="Exportar conversa"]')

    // Select export format
    await page.click('text=Exportar como Markdown')

    // Verify download started
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Baixar")')
    ])

    // Verify file name
    expect(download.suggestedFilename()).toMatch(/conversa.*\.md/)
  })

  test('should search in conversations', async ({ page }) => {
    // Create multiple messages
    const messages = [
      'Conversa sobre JavaScript',
      'Discussão sobre Python',
      'Análise de TypeScript',
    ]

    for (const message of messages) {
      const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
      await messageInput.fill(message)
      await page.keyboard.press('Enter')
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })
    }

    // Open search
    await page.click('button[aria-label="Buscar na conversa"]')

    // Search for specific term
    const searchInput = page.locator('input[placeholder="Buscar..."]')
    await searchInput.fill('Python')
    
    // Verify search results
    await expect(page.locator('mark:has-text("Python")')).toBeVisible()
    await expect(page.locator('text=1 resultado encontrado')).toBeVisible()
  })

  test('should handle markdown formatting', async ({ page }) => {
    // Send message with markdown
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Formate isto: **negrito**, *itálico*, `código`')
    await page.keyboard.press('Enter')

    // Wait for response
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })

    // Verify formatting is rendered
    await expect(page.locator('strong:has-text("negrito")')).toBeVisible()
    await expect(page.locator('em:has-text("itálico")')).toBeVisible()
    await expect(page.locator('code:has-text("código")')).toBeVisible()
  })

  test('should handle code blocks', async ({ page }) => {
    // Send message requesting code
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Mostre um exemplo de função em JavaScript')
    await page.keyboard.press('Enter')

    // Wait for response
    await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })

    // Verify code block appears
    await expect(page.locator('pre code')).toBeVisible()
    
    // Verify copy code button
    await page.hover('pre code')
    await expect(page.locator('button[aria-label="Copiar código"]')).toBeVisible()
    
    // Copy code
    await page.click('button[aria-label="Copiar código"]')
    await expect(page.locator('text=Código copiado!')).toBeVisible()
  })

  test('should show usage statistics', async ({ page }) => {
    // Send multiple messages
    for (let i = 0; i < 3; i++) {
      const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
      await messageInput.fill(`Mensagem ${i + 1}`)
      await page.keyboard.press('Enter')
      await expect(page.locator('[data-testid="loading-indicator"]')).toBeHidden({ timeout: 30000 })
    }

    // Check usage panel
    await page.click('button[aria-label="Ver uso"]')

    // Verify usage stats
    await expect(page.locator('text=/Mensagens hoje:.*3/')).toBeVisible()
    await expect(page.locator('text=/Tokens usados:.*\\d+/')).toBeVisible()
    await expect(page.locator('text=/Custo estimado:.*R\\$/')).toBeVisible()
  })

  test('should handle keyboard shortcuts', async ({ page }) => {
    // Test Ctrl+Enter to send
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Mensagem com atalho')
    await page.keyboard.press('Control+Enter')

    // Verify message was sent
    await expect(page.locator('text=Mensagem com atalho')).toBeVisible()

    // Test Escape to cancel edit
    await page.hover('text=Mensagem com atalho')
    await page.click('button[aria-label="Editar mensagem"]')
    await page.keyboard.press('Escape')

    // Verify edit was cancelled
    await expect(page.locator('textarea[value="Mensagem com atalho"]')).toBeHidden()
  })

  test('should be accessible', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await expect(page.locator('select[aria-label="Selecionar modelo"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('textarea[placeholder*="Digite sua mensagem"]')).toBeFocused()

    // Test ARIA labels
    await expect(page.locator('button[aria-label="Enviar mensagem"]')).toBeVisible()
    await expect(page.locator('button[aria-label="Nova conversa"]')).toBeVisible()

    // Test screen reader announcements
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Teste de acessibilidade')
    await page.keyboard.press('Enter')

    // Verify loading state is announced
    await expect(page.locator('[role="status"][aria-live="polite"]')).toContainText('Processando')
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    // Verify responsive layout
    await expect(page.locator('textarea[placeholder*="Digite sua mensagem"]')).toBeVisible()
    
    // Test mobile menu
    await page.click('button[aria-label="Menu"]')
    await expect(page.locator('text=Histórico de conversas')).toBeVisible()
    
    // Close menu
    await page.click('body', { position: { x: 10, y: 10 } })

    // Send message on mobile
    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
    await messageInput.fill('Teste mobile')
    await page.click('button[aria-label="Enviar mensagem"]')

    // Verify message appears
    await expect(page.locator('text=Teste mobile')).toBeVisible()
  })
})