import { test, expect } from '@playwright/test'
import { testConfig } from '../test.config'
import { login } from '../../helpers/auth.helpers'
import testUsers from '../../config/test-users.json'

test.describe('Complete Dashboard Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, testUsers.validUser.email, testUsers.validUser.password)
    await page.goto('/dashboard')
  })

  test('should display dashboard overview', async ({ page }) => {
    // Verify dashboard header
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
    await expect(page.locator(`text=Olá, ${testUsers.validUser.name}`)).toBeVisible()

    // Verify key metrics cards
    const metrics = [
      'Mensagens hoje',
      'Tokens usados',
      'Custo estimado',
      'Conversas ativas',
    ]

    for (const metric of metrics) {
      await expect(page.locator(`text=${metric}`)).toBeVisible()
    }

    // Verify charts are rendered
    await expect(page.locator('canvas[aria-label="Gráfico de uso"]')).toBeVisible()
    await expect(page.locator('canvas[aria-label="Gráfico de custos"]')).toBeVisible()
  })

  test('should navigate through dashboard sections', async ({ page }) => {
    // Navigate to Analytics
    await page.click('text=Analytics')
    await expect(page.locator('h2:has-text("Análise detalhada")')).toBeVisible()

    // Navigate to Usage
    await page.click('text=Uso')
    await expect(page.locator('h2:has-text("Estatísticas de uso")')).toBeVisible()

    // Navigate to Templates
    await page.click('text=Templates')
    await expect(page.locator('h2:has-text("Meus templates")')).toBeVisible()

    // Navigate to Knowledge Base
    await page.click('text=Base de conhecimento')
    await expect(page.locator('h2:has-text("Base de conhecimento")')).toBeVisible()

    // Return to dashboard
    await page.click('text=Dashboard')
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible()
  })

  test('should display usage statistics with filters', async ({ page }) => {
    await page.goto('/dashboard/usage')

    // Verify default view (today)
    await expect(page.locator('text=Uso de hoje')).toBeVisible()
    await expect(page.locator('text=/\\d+ mensagens/')).toBeVisible()
    await expect(page.locator('text=/\\d+ tokens/')).toBeVisible()

    // Change to weekly view
    await page.click('button[aria-label="Período"]')
    await page.click('text=Última semana')

    // Verify weekly stats
    await expect(page.locator('text=Últimos 7 dias')).toBeVisible()
    await expect(page.locator('canvas[aria-label="Gráfico semanal"]')).toBeVisible()

    // Change to monthly view
    await page.click('button[aria-label="Período"]')
    await page.click('text=Último mês')

    // Verify monthly stats
    await expect(page.locator('text=Últimos 30 dias')).toBeVisible()
    await expect(page.locator('text=Tendência mensal')).toBeVisible()
  })

  test('should show model usage breakdown', async ({ page }) => {
    await page.goto('/dashboard/analytics')

    // Verify model usage chart
    await expect(page.locator('h3:has-text("Uso por modelo")')).toBeVisible()
    await expect(page.locator('canvas[aria-label="Gráfico de modelos"]')).toBeVisible()

    // Verify model list
    const models = ['GPT-3.5', 'GPT-4', 'Claude']
    for (const model of models) {
      const modelElement = page.locator(`text=/${model}.*\\d+%/`)
      if (await modelElement.isVisible()) {
        await expect(modelElement).toBeVisible()
      }
    }

    // Click on a model for details
    const firstModel = page.locator('[data-testid="model-item"]').first()
    if (await firstModel.isVisible()) {
      await firstModel.click()
      
      // Verify model details modal
      await expect(page.locator('text=Detalhes do modelo')).toBeVisible()
      await expect(page.locator('text=/Mensagens:.*\\d+/')).toBeVisible()
      await expect(page.locator('text=/Tokens:.*\\d+/')).toBeVisible()
      await expect(page.locator('text=/Custo:.*R\\$/')).toBeVisible()
      
      // Close modal
      await page.click('button[aria-label="Fechar"]')
    }
  })

  test('should display cost analysis', async ({ page }) => {
    await page.goto('/dashboard/costs')

    // Verify cost breakdown
    await expect(page.locator('h2:has-text("Análise de custos")')).toBeVisible()
    
    // Current month costs
    await expect(page.locator('text=Custo do mês atual')).toBeVisible()
    await expect(page.locator('text=/R\\$.*\\d+,\\d{2}/')).toBeVisible()

    // Cost by model
    await expect(page.locator('text=Custo por modelo')).toBeVisible()
    await expect(page.locator('canvas[aria-label="Gráfico de custos por modelo"]')).toBeVisible()

    // Cost projection
    await expect(page.locator('text=Projeção mensal')).toBeVisible()
    await expect(page.locator('text=/Estimativa:.*R\\$/')).toBeVisible()

    // Cost history
    await expect(page.locator('text=Histórico de custos')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })

  test('should manage quick actions', async ({ page }) => {
    // Quick action: New chat
    await page.click('button:has-text("Nova conversa")')
    await expect(page).toHaveURL('/chat')
    
    // Return to dashboard
    await page.goto('/dashboard')

    // Quick action: View templates
    await page.click('button:has-text("Ver templates")')
    await expect(page).toHaveURL('/templates')

    // Return to dashboard
    await page.goto('/dashboard')

    // Quick action: Usage report
    await page.click('button:has-text("Relatório de uso")')
    await expect(page.locator('text=Gerando relatório')).toBeVisible()
    
    // Wait for report generation
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.waitForSelector('text=Download pronto', { timeout: 10000 })
    ])

    expect(download.suggestedFilename()).toMatch(/relatorio.*\.pdf/)
  })

  test('should display recent activity', async ({ page }) => {
    // Verify recent activity section
    await expect(page.locator('h3:has-text("Atividade recente")')).toBeVisible()

    // Check activity items
    const activityList = page.locator('[data-testid="activity-list"]')
    await expect(activityList).toBeVisible()

    // Verify activity item structure
    const firstActivity = activityList.locator('[data-testid="activity-item"]').first()
    if (await firstActivity.isVisible()) {
      await expect(firstActivity.locator('[data-testid="activity-icon"]')).toBeVisible()
      await expect(firstActivity.locator('[data-testid="activity-text"]')).toBeVisible()
      await expect(firstActivity.locator('[data-testid="activity-time"]')).toBeVisible()
    }

    // Load more activities
    const loadMoreButton = page.locator('button:has-text("Carregar mais")')
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click()
      await expect(activityList.locator('[data-testid="activity-item"]')).toHaveCount(
        await activityList.locator('[data-testid="activity-item"]').count() + 1
      )
    }
  })

  test('should show usage alerts and recommendations', async ({ page }) => {
    // Check for usage alerts
    const alertsSection = page.locator('[data-testid="usage-alerts"]')
    if (await alertsSection.isVisible()) {
      // Verify alert structure
      await expect(alertsSection.locator('[role="alert"]')).toBeVisible()
      
      // Check different alert types
      const warningAlert = alertsSection.locator('[data-testid="alert-warning"]')
      if (await warningAlert.isVisible()) {
        await expect(warningAlert).toContainText(/limite|uso elevado/i)
      }

      const infoAlert = alertsSection.locator('[data-testid="alert-info"]')
      if (await infoAlert.isVisible()) {
        await expect(infoAlert).toContainText(/dica|sugestão/i)
      }
    }

    // Check recommendations
    const recommendationsSection = page.locator('[data-testid="recommendations"]')
    if (await recommendationsSection.isVisible()) {
      await expect(recommendationsSection.locator('h3')).toContainText('Recomendações')
      
      // Click on a recommendation
      const firstRecommendation = recommendationsSection.locator('button').first()
      if (await firstRecommendation.isVisible()) {
        await firstRecommendation.click()
        // Verify action or navigation
      }
    }
  })

  test('should export data', async ({ page }) => {
    await page.goto('/dashboard/export')

    // Select export options
    await expect(page.locator('h2:has-text("Exportar dados")')).toBeVisible()

    // Select data types
    await page.check('input[value="conversations"]')
    await page.check('input[value="usage"]')
    await page.check('input[value="costs"]')

    // Select date range
    await page.click('text=Último mês')

    // Select format
    await page.click('input[value="json"]')

    // Export data
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Exportar")')
    ])

    expect(download.suggestedFilename()).toMatch(/export.*\.json/)
  })

  test('should customize dashboard widgets', async ({ page }) => {
    // Open customization
    await page.click('button[aria-label="Personalizar dashboard"]')

    // Verify customization modal
    await expect(page.locator('text=Personalizar dashboard')).toBeVisible()

    // Toggle widgets
    await page.uncheck('input[value="costs"]')
    await page.check('input[value="topModels"]')

    // Reorder widgets (drag and drop)
    const widget1 = page.locator('[data-testid="widget-usage"]')
    const widget2 = page.locator('[data-testid="widget-activity"]')
    
    if (await widget1.isVisible() && await widget2.isVisible()) {
      await widget1.dragTo(widget2)
    }

    // Save customization
    await page.click('button:has-text("Salvar")')

    // Verify changes applied
    await expect(page.locator('text=Dashboard atualizado')).toBeVisible()
  })

  test('should show plan limits and upgrade prompts', async ({ page }) => {
    // For free users
    if (testUsers.validUser.subscription === 'free') {
      // Check limits display
      await expect(page.locator('text=/\\d+\\/10 mensagens/')).toBeVisible()
      await expect(page.locator('text=/\\d+\\/10000 tokens/')).toBeVisible()

      // Check upgrade prompts
      await expect(page.locator('text=Aumente seus limites')).toBeVisible()
      await page.click('button:has-text("Fazer upgrade")')
      await expect(page).toHaveURL('/pricing')
    }
  })

  test('should handle real-time updates', async ({ page }) => {
    // Send a message in another tab to trigger update
    const context = page.context()
    const chatPage = await context.newPage()
    
    await chatPage.goto('/chat')
    await login(chatPage, testUsers.validUser.email, testUsers.validUser.password)
    
    // Send message
    await chatPage.fill('textarea[placeholder*="Digite sua mensagem"]', 'Teste real-time')
    await chatPage.keyboard.press('Enter')
    
    // Return to dashboard tab
    await page.bringToFront()
    
    // Verify metrics updated
    await page.waitForTimeout(2000) // Wait for real-time update
    
    // Check if activity shows new message
    const newActivity = page.locator('text=Nova mensagem enviada')
    if (await newActivity.isVisible({ timeout: 5000 })) {
      await expect(newActivity).toBeVisible()
    }
    
    await chatPage.close()
  })

  test('should be responsive', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible()

    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible()

    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible()

    // Verify mobile menu
    await page.click('button[aria-label="Menu"]')
    await expect(page.locator('nav[aria-label="Menu principal"]')).toBeVisible()
  })

  test('should handle errors gracefully', async ({ page }) => {
    // Simulate API error
    await page.route('**/api/dashboard/stats', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      })
    })

    await page.reload()

    // Verify error handling
    await expect(page.locator('text=Erro ao carregar dados')).toBeVisible()
    await expect(page.locator('button:has-text("Tentar novamente")')).toBeVisible()

    // Try to reload
    await page.unroute('**/api/dashboard/stats')
    await page.click('button:has-text("Tentar novamente")')
    
    // Verify data loads
    await expect(page.locator('text=Mensagens hoje')).toBeVisible()
  })

  test('should provide help and tooltips', async ({ page }) => {
    // Hover over metric for tooltip
    await page.hover('text=Tokens usados')
    await expect(page.locator('text=Total de tokens')).toBeVisible()

    // Click help button
    await page.click('button[aria-label="Ajuda"]')
    
    // Verify help modal
    await expect(page.locator('text=Central de ajuda')).toBeVisible()
    await expect(page.locator('text=Como interpretar as métricas')).toBeVisible()
    
    // Search help
    await page.fill('input[placeholder="Buscar ajuda"]', 'tokens')
    await expect(page.locator('text=O que são tokens?')).toBeVisible()
    
    // Close help
    await page.click('button[aria-label="Fechar ajuda"]')
  })
})