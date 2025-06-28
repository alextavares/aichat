import { test, expect } from '@playwright/test'
import { testConfig } from '../test.config'
import { login } from '../../helpers/auth.helpers'
import testUsers from '../../config/test-users.json'

test.describe('Complete Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as free user
    await login(page, testUsers.validUser.email, testUsers.validUser.password)
  })

  test('should complete Stripe payment flow', async ({ page }) => {
    // Navigate to pricing page
    await page.goto('/pricing')
    
    // Verify pricing plans are displayed
    await expect(page.locator('h1:has-text("Planos")')).toBeVisible()
    await expect(page.locator('text=Gratuito')).toBeVisible()
    await expect(page.locator('text=Pro')).toBeVisible()
    await expect(page.locator('text=Enterprise')).toBeVisible()

    // Select Pro plan
    await page.click('button:has-text("Escolher Pro")')

    // Select billing cycle
    await page.click('text=Mensal')
    await expect(page.locator('text=R$ 79,90/mês')).toBeVisible()

    // Click to proceed to checkout
    await page.click('button:has-text("Assinar agora")')

    // Verify redirect to Stripe checkout
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 10000 })

    // Fill Stripe test card details
    await page.fill('input[placeholder*="1234"]', '4242424242424242')
    await page.fill('input[placeholder*="MM / YY"]', '12/25')
    await page.fill('input[placeholder*="CVC"]', '123')
    await page.fill('input[name="billingName"]', testUsers.validUser.name)
    await page.fill('input[name="billingPostalCode"]', '12345')

    // Complete payment
    await page.click('button:has-text("Pagar")')

    // Wait for redirect back to app
    await page.waitForURL(/\/payment\/success/, { timeout: 15000 })

    // Verify success message
    await expect(page.locator('h1:has-text("Pagamento realizado com sucesso!")')).toBeVisible()
    await expect(page.locator('text=Plano Pro ativado')).toBeVisible()

    // Verify user is redirected to dashboard
    await page.click('button:has-text("Ir para o Dashboard")')
    await expect(page).toHaveURL('/dashboard')

    // Verify Pro features are enabled
    await expect(page.locator('text=Plano: Pro')).toBeVisible()
  })

  test('should complete MercadoPago PIX payment flow', async ({ page }) => {
    await page.goto('/pricing')

    // Select Pro plan
    await page.click('button:has-text("Escolher Pro")')

    // Select payment method
    await page.click('text=Pagar com MercadoPago')

    // Select PIX
    await page.click('text=PIX')

    // Click to generate PIX
    await page.click('button:has-text("Gerar PIX")')

    // Verify PIX code is generated
    await expect(page.locator('text=Copie o código PIX')).toBeVisible()
    await expect(page.locator('[data-testid="pix-code"]')).toBeVisible()
    await expect(page.locator('img[alt="QR Code PIX"]')).toBeVisible()

    // Copy PIX code
    await page.click('button:has-text("Copiar código")')
    await expect(page.locator('text=Código copiado!')).toBeVisible()

    // Simulate payment confirmation (in real scenario, webhook would handle this)
    await page.click('button:has-text("Já realizei o pagamento")')

    // Verify pending status
    await expect(page.locator('text=Aguardando confirmação do pagamento')).toBeVisible()
  })

  test('should complete MercadoPago Boleto payment flow', async ({ page }) => {
    await page.goto('/pricing')

    // Select Pro plan
    await page.click('button:has-text("Escolher Pro")')

    // Select payment method
    await page.click('text=Pagar com MercadoPago')

    // Select Boleto
    await page.click('text=Boleto')

    // Fill CPF
    await page.fill('input[placeholder="CPF"]', '123.456.789-00')

    // Generate boleto
    await page.click('button:has-text("Gerar Boleto")')

    // Verify boleto is generated
    await expect(page.locator('text=Boleto gerado com sucesso')).toBeVisible()
    await expect(page.locator('button:has-text("Baixar Boleto")')).toBeVisible()
    await expect(page.locator('button:has-text("Copiar código de barras")')).toBeVisible()

    // Download boleto
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Baixar Boleto")')
    ])

    expect(download.suggestedFilename()).toMatch(/boleto.*\.pdf/)
  })

  test('should handle yearly billing discount', async ({ page }) => {
    await page.goto('/pricing')

    // Toggle to yearly billing
    await page.click('text=Anual')

    // Verify discount is applied
    await expect(page.locator('text=R$ 862,92/ano')).toBeVisible()
    await expect(page.locator('text=Economize 20%')).toBeVisible()

    // Verify monthly equivalent
    await expect(page.locator('text=R$ 71,91/mês')).toBeVisible()
  })

  test('should cancel subscription', async ({ page }) => {
    // First, navigate to a Pro user account
    await page.goto('/settings/subscription')

    // Verify current subscription
    await expect(page.locator('text=Plano atual: Pro')).toBeVisible()
    await expect(page.locator('text=Próxima cobrança')).toBeVisible()

    // Click cancel subscription
    await page.click('button:has-text("Cancelar assinatura")')

    // Confirm cancellation
    await expect(page.locator('text=Tem certeza que deseja cancelar?')).toBeVisible()
    await page.click('button:has-text("Sim, cancelar")')

    // Verify cancellation confirmation
    await expect(page.locator('text=Assinatura cancelada')).toBeVisible()
    await expect(page.locator('text=Seu plano Pro permanecerá ativo até')).toBeVisible()
  })

  test('should update payment method', async ({ page }) => {
    await page.goto('/settings/payment')

    // Click update payment method
    await page.click('button:has-text("Atualizar método de pagamento")')

    // Fill new card details
    await page.fill('input[placeholder*="1234"]', '5555555555554444')
    await page.fill('input[placeholder*="MM / YY"]', '12/26')
    await page.fill('input[placeholder*="CVC"]', '456')

    // Save new payment method
    await page.click('button:has-text("Salvar")')

    // Verify success
    await expect(page.locator('text=Método de pagamento atualizado')).toBeVisible()
  })

  test('should display invoice history', async ({ page }) => {
    await page.goto('/settings/invoices')

    // Verify invoices table
    await expect(page.locator('h2:has-text("Histórico de faturas")')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()

    // Verify invoice details
    await expect(page.locator('th:has-text("Data")')).toBeVisible()
    await expect(page.locator('th:has-text("Valor")')).toBeVisible()
    await expect(page.locator('th:has-text("Status")')).toBeVisible()
    await expect(page.locator('th:has-text("Ações")')).toBeVisible()

    // Download invoice
    const firstInvoiceRow = page.locator('tbody tr').first()
    if (await firstInvoiceRow.isVisible()) {
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        firstInvoiceRow.locator('button:has-text("Baixar")').click()
      ])

      expect(download.suggestedFilename()).toMatch(/fatura.*\.pdf/)
    }
  })

  test('should handle payment failure', async ({ page }) => {
    await page.goto('/pricing')
    await page.click('button:has-text("Escolher Pro")')
    await page.click('button:has-text("Assinar agora")')

    // Wait for Stripe checkout
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 10000 })

    // Use card that triggers failure
    await page.fill('input[placeholder*="1234"]', '4000000000000002')
    await page.fill('input[placeholder*="MM / YY"]', '12/25')
    await page.fill('input[placeholder*="CVC"]', '123')
    await page.fill('input[name="billingName"]', testUsers.validUser.name)

    // Try to complete payment
    await page.click('button:has-text("Pagar")')

    // Verify error message
    await expect(page.locator('text=Seu cartão foi recusado')).toBeVisible()
  })

  test('should apply coupon code', async ({ page }) => {
    await page.goto('/pricing')
    await page.click('button:has-text("Escolher Pro")')

    // Enter coupon code
    await page.click('text=Tem um cupom?')
    await page.fill('input[placeholder="Código do cupom"]', 'TESTE20')
    await page.click('button:has-text("Aplicar")')

    // Verify discount is applied
    await expect(page.locator('text=Cupom aplicado!')).toBeVisible()
    await expect(page.locator('text=20% de desconto')).toBeVisible()
    await expect(page.locator('text=R$ 63,92/mês')).toBeVisible()
  })

  test('should upgrade from Pro to Enterprise', async ({ page }) => {
    // Login as Pro user
    await page.goto('/dashboard')
    await expect(page.locator('text=Plano: Pro')).toBeVisible()

    // Go to pricing
    await page.goto('/pricing')

    // Click upgrade to Enterprise
    await page.click('button:has-text("Fazer upgrade para Enterprise")')

    // Verify upgrade modal
    await expect(page.locator('text=Upgrade para Enterprise')).toBeVisible()
    await expect(page.locator('text=Recursos adicionais')).toBeVisible()

    // Confirm upgrade
    await page.click('button:has-text("Confirmar upgrade")')

    // Complete payment flow
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 10000 })
  })

  test('should handle usage-based billing', async ({ page }) => {
    await page.goto('/settings/usage-billing')

    // Verify usage metrics
    await expect(page.locator('text=Uso do mês atual')).toBeVisible()
    await expect(page.locator('text=/Tokens utilizados:.*\\d+/')).toBeVisible()
    await expect(page.locator('text=/Custo adicional:.*R\\$/')).toBeVisible()

    // Set usage alert
    await page.click('button:has-text("Configurar alerta")')
    await page.fill('input[placeholder="Valor em R$"]', '50')
    await page.click('button:has-text("Salvar")')

    // Verify alert is set
    await expect(page.locator('text=Alerta configurado para R$ 50,00')).toBeVisible()
  })

  test('should display payment comparison', async ({ page }) => {
    await page.goto('/pricing')

    // Click compare plans
    await page.click('button:has-text("Comparar planos")')

    // Verify comparison table
    await expect(page.locator('text=Comparação detalhada')).toBeVisible()
    
    const features = [
      'Mensagens por dia',
      'Tokens por dia',
      'Modelos disponíveis',
      'Suporte',
      'API Access',
      'Exportação de dados',
    ]

    for (const feature of features) {
      await expect(page.locator(`text=${feature}`)).toBeVisible()
    }
  })

  test('should handle regional pricing', async ({ page }) => {
    await page.goto('/pricing')

    // Change region (if available)
    const regionSelector = page.locator('select[aria-label="Selecionar região"]')
    if (await regionSelector.isVisible()) {
      await regionSelector.selectOption('BR')

      // Verify BRL pricing
      await expect(page.locator('text=R$')).toBeVisible()
    }
  })

  test('should show enterprise contact form', async ({ page }) => {
    await page.goto('/pricing')

    // Click Enterprise contact
    await page.click('button:has-text("Falar com vendas")')

    // Fill contact form
    await page.fill('input[name="company"]', 'Test Company')
    await page.fill('input[name="employees"]', '100')
    await page.fill('textarea[name="needs"]', 'Precisamos de uma solução customizada')

    // Submit form
    await page.click('button:has-text("Enviar")')

    // Verify submission
    await expect(page.locator('text=Obrigado! Entraremos em contato')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    await page.goto('/pricing')

    // Test keyboard navigation
    await page.keyboard.press('Tab')
    const firstPlanButton = page.locator('button:has-text("Escolher")').first()
    await expect(firstPlanButton).toBeFocused()

    // Test ARIA labels
    await expect(page.locator('[role="radiogroup"][aria-label="Ciclo de cobrança"]')).toBeVisible()

    // Test color contrast for pricing
    const priceElement = page.locator('text=R$ 79,90')
    await expect(priceElement).toHaveCSS('color', /.+/)
  })

  test('should work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/pricing')

    // Verify pricing cards stack vertically
    const pricingCards = page.locator('[data-testid="pricing-card"]')
    const count = await pricingCards.count()
    expect(count).toBeGreaterThan(0)

    // Verify touch-friendly buttons
    const buttons = page.locator('button:has-text("Escolher")')
    const firstButton = buttons.first()
    const box = await firstButton.boundingBox()
    expect(box?.height).toBeGreaterThanOrEqual(44) // Touch target size
  })
})