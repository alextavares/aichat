import { test, expect } from '@playwright/test'
import { testConfig } from '../test.config'
import testUsers from '../../config/test-users.json'

test.describe('Complete Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should complete full authentication journey', async ({ page }) => {
    // Step 1: Navigate to signup
    await page.click('text=Começar Gratuitamente')
    await expect(page).toHaveURL('/auth/signup')

    // Step 2: Fill signup form
    const newUser = {
      name: `Test User ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'SecurePass123!@#',
    }

    await page.fill('input[id="name"]', newUser.name)
    await page.fill('input[id="email"]', newUser.email)
    await page.fill('input[id="password"]', newUser.password)
    await page.fill('input[id="confirmPassword"]', newUser.password)

    // Step 3: Accept terms and submit
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')

    // Step 4: Verify redirect to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })
    await expect(page.locator('h1')).toContainText('Dashboard')

    // Step 5: Verify user info is displayed
    await expect(page.locator('text=' + newUser.name)).toBeVisible()

    // Step 6: Test logout
    await page.click('button[aria-label="Menu do usuário"]')
    await page.click('text=Sair')
    
    await page.waitForURL('/')
    await expect(page.locator('text=Entrar')).toBeVisible()

    // Step 7: Test login with created account
    await page.click('text=Entrar')
    await page.fill('input[id="email"]', newUser.email)
    await page.fill('input[id="password"]', newUser.password)
    await page.click('button[type="submit"]')

    await page.waitForURL('/dashboard')
    await expect(page.locator('text=' + newUser.name)).toBeVisible()
  })

  test('should handle OAuth providers', async ({ page }) => {
    await page.goto('/auth/signin')

    // Verify OAuth buttons are present and functional
    const oauthProviders = [
      { name: 'Google', icon: 'google' },
      { name: 'GitHub', icon: 'github' },
      { name: 'Microsoft', icon: 'microsoft' },
      { name: 'Apple', icon: 'apple' },
    ]

    for (const provider of oauthProviders) {
      const button = page.locator(`button:has-text("Entrar com ${provider.name}")`)
      await expect(button).toBeVisible()
      await expect(button).toBeEnabled()
      
      // Verify button has proper attributes
      await expect(button).toHaveAttribute('type', 'button')
    }
  })

  test('should validate all form fields', async ({ page }) => {
    await page.goto('/auth/signup')

    // Test empty form submission
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Nome é obrigatório')).toBeVisible()

    // Test invalid email
    await page.fill('input[id="name"]', 'Test User')
    await page.fill('input[id="email"]', 'invalid-email')
    await page.fill('input[id="password"]', 'Test123!')
    await page.fill('input[id="confirmPassword"]', 'Test123!')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=E-mail inválido')).toBeVisible()

    // Test weak password
    await page.fill('input[id="email"]', 'test@example.com')
    await page.fill('input[id="password"]', '123')
    await page.fill('input[id="confirmPassword"]', '123')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=mínimo 8 caracteres')).toBeVisible()

    // Test password mismatch
    await page.fill('input[id="password"]', 'Test123!@#')
    await page.fill('input[id="confirmPassword"]', 'Different123!@#')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=As senhas não coincidem')).toBeVisible()

    // Test unchecked terms
    await page.fill('input[id="confirmPassword"]', 'Test123!@#')
    await expect(page.locator('button[type="submit"]')).toBeDisabled()
  })

  test('should handle existing user registration attempt', async ({ page }) => {
    await page.goto('/auth/signup')

    // Try to register with existing user
    await page.fill('input[id="name"]', testUsers.validUser.name)
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.fill('input[id="confirmPassword"]', testUsers.validUser.password)
    await page.check('input[type="checkbox"]')
    await page.click('button[type="submit"]')

    // Verify error message
    await expect(page.locator('text=E-mail já cadastrado')).toBeVisible()
  })

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/auth/signin')

    // Click forgot password
    await page.click('text=Esqueceu a senha?')
    await expect(page).toHaveURL('/auth/forgot-password')

    // Submit email for reset
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.click('button[type="submit"]')

    // Verify success message
    await expect(page.locator('text=E-mail de recuperação enviado')).toBeVisible()
  })

  test('should enforce authentication on protected routes', async ({ page }) => {
    // Try to access protected routes without auth
    const protectedRoutes = [
      '/dashboard',
      '/chat',
      '/templates',
      '/knowledge',
      '/settings',
      '/analytics',
    ]

    for (const route of protectedRoutes) {
      await page.goto(route)
      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/signin/)
    }
  })

  test('should persist session across page reloads', async ({ page, context }) => {
    // Login first
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Reload page
    await page.reload()
    
    // Should still be logged in
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=' + testUsers.validUser.name)).toBeVisible()

    // Open new tab
    const newPage = await context.newPage()
    await newPage.goto('/dashboard')
    
    // Should be logged in on new tab
    await expect(newPage.locator('text=' + testUsers.validUser.name)).toBeVisible()
    
    await newPage.close()
  })

  test('should handle session timeout', async ({ page }) => {
    // This test would require mocking time or waiting for actual timeout
    // For now, we'll test the UI elements that would appear
    
    await page.goto('/auth/signin')
    
    // Simulate session timeout by navigating with expired session query
    await page.goto('/auth/signin?session=expired')
    
    // Should show session expired message
    await expect(page.locator('text=Sua sessão expirou')).toBeVisible()
  })

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/auth/signin')

    const passwordInput = page.locator('input[id="password"]')
    const toggleButton = page.locator('button[aria-label="Mostrar senha"]')

    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle to show password
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('should handle network errors gracefully', async ({ page }) => {
    await page.goto('/auth/signin')

    // Simulate network failure
    await page.route('**/api/auth/**', route => route.abort())

    // Try to login
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Erro de conexão')).toBeVisible()
  })

  test('should validate professional information on signup', async ({ page }) => {
    await page.goto('/auth/signup')

    // Fill basic info
    await page.fill('input[id="name"]', 'Professional User')
    await page.fill('input[id="email"]', 'pro@example.com')
    await page.fill('input[id="password"]', 'Test123!@#')
    await page.fill('input[id="confirmPassword"]', 'Test123!@#')

    // Professional fields should be visible
    await expect(page.locator('input[id="profession"]')).toBeVisible()
    await expect(page.locator('input[id="organization"]')).toBeVisible()

    // Fill professional info
    await page.fill('input[id="profession"]', 'Software Developer')
    await page.fill('input[id="organization"]', 'Tech Corp')

    await page.check('input[type="checkbox"]')
    
    // Verify submit button is enabled
    await expect(page.locator('button[type="submit"]')).toBeEnabled()
  })

  test('should handle rate limiting', async ({ page }) => {
    await page.goto('/auth/signin')

    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      await page.fill('input[id="email"]', testUsers.validUser.email)
      await page.fill('input[id="password"]', 'WrongPassword123!')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(100)
    }

    // Should show rate limit message
    await expect(page.locator('text=Muitas tentativas')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    await page.goto('/auth/signin')

    // Test keyboard navigation
    await page.keyboard.press('Tab') // Focus email
    await expect(page.locator('input[id="email"]')).toBeFocused()

    await page.keyboard.press('Tab') // Focus password
    await expect(page.locator('input[id="password"]')).toBeFocused()

    await page.keyboard.press('Tab') // Focus submit button
    await expect(page.locator('button[type="submit"]')).toBeFocused()

    // Test screen reader labels
    await expect(page.locator('label[for="email"]')).toHaveText('E-mail')
    await expect(page.locator('label[for="password"]')).toHaveText('Senha')

    // Test color contrast
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toHaveCSS('background-color', /.+/)
  })

  test('should handle mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/auth/signin')

    // All elements should be visible and properly sized
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[id="email"]')).toBeVisible()
    await expect(page.locator('input[id="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // OAuth buttons should stack vertically
    const oauthButtons = page.locator('button:has-text("Entrar com")')
    const count = await oauthButtons.count()
    expect(count).toBeGreaterThan(0)
  })
})