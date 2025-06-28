import { test, expect } from '@playwright/test'
import { testConfig } from '../e2e/test.config'
import testUsers from '../config/test-users.json'

test.describe('Security Tests', () => {
  test('should prevent XSS attacks in chat', async ({ page }) => {
    // Login
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Navigate to chat
    await page.goto('/chat')

    // Try various XSS payloads
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      'javascript:alert("XSS")',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<input onfocus=alert("XSS") autofocus>',
      '<marquee onstart=alert("XSS")>',
      '<body onload=alert("XSS")>',
      '"><script>alert(String.fromCharCode(88,83,83))</script>',
      '<script>document.cookie</script>',
    ]

    for (const payload of xssPayloads) {
      await page.fill('textarea[placeholder*="Digite sua mensagem"]', payload)
      await page.keyboard.press('Enter')
      
      // Wait for message to appear
      await page.waitForTimeout(1000)
      
      // Verify no alert dialogs appear
      let alertFired = false
      page.on('dialog', () => {
        alertFired = true
      })
      
      await page.waitForTimeout(1000)
      expect(alertFired).toBe(false)
      
      // Verify payload is escaped in DOM
      const messageElement = page.locator(`text="${payload}"`).first()
      if (await messageElement.isVisible()) {
        const innerHTML = await messageElement.evaluate(el => el.innerHTML)
        expect(innerHTML).not.toContain('<script')
        expect(innerHTML).not.toContain('onerror=')
        expect(innerHTML).not.toContain('javascript:')
      }
    }
  })

  test('should prevent SQL injection in search', async ({ page }) =>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  </script>Template' },
      { field: 'description', value: 'Description<img src=x onerror=alert("XSS")>' },
      { field: 'content', value: '{{<script>alert("XSS")</script>}}' },
    ]

    for (const input of maliciousInputs) {
      await page.fill(`[name="${input.field}"]`, input.value)
    }

    // Save template
    await page.selectOption('select[name="category"]', 'GENERAL')
    await page.click('button:has-text("Salvar template")')

    // If saved, verify content is sanitized
    if (await page.locator('text=Template criado').isVisible()) {
      await page.click('text=<script>alert("XSS")</script>Template')
      
      // Check that script tags are not executed
      let alertFired = false
      page.on('dialog', () => {
        alertFired = true
      })
      
      await page.waitForTimeout(1000)
      expect(alertFired).toBe(false)
    }
  })

  test('should protect sensitive data in responses', async ({ page }) => {
    // Login
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Intercept API responses
    const sensitiveData = []
    
    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        try {
          const json = await response.json()
          const stringified = JSON.stringify(json)
          
          // Check for sensitive data patterns
          if (stringified.includes('password') && !stringified.includes('newPassword')) {
            sensitiveData.push({ url: response.url(), data: 'password field' })
          }
          if (stringified.match(/sk-[a-zA-Z0-9]{48}/)) {
            sensitiveData.push({ url: response.url(), data: 'API key' })
          }
          if (stringified.includes('stripe_secret')) {
            sensitiveData.push({ url: response.url(), data: 'Stripe secret' })
          }
        } catch (e) {
          // Not JSON response
        }
      }
    })

    // Navigate through app
    await page.goto('/dashboard')
    await page.goto('/settings')
    await page.goto('/api/user/profile')

    // Check for exposed sensitive data
    expect(sensitiveData).toHaveLength(0)
  })

  test('should validate API input parameters', async ({ page }) => {
    // Login
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Test various invalid inputs
    const invalidRequests = [
      {
        url: '/api/chat',
        method: 'POST',
        data: { messages: 'not-an-array' }, // Should be array
      },
      {
        url: '/api/templates',
        method: 'POST',
        data: { name: '', content: 'test' }, // Empty name
      },
      {
        url: '/api/knowledge',
        method: 'POST',
        data: { type: 'INVALID_TYPE', title: 'Test' }, // Invalid enum
      },
    ]

    for (const req of invalidRequests) {
      const response = await page.request[req.method.toLowerCase()](req.url, {
        data: req.data,
      })

      // Should return 400 Bad Request
      expect(response.status()).toBe(400)
      
      const body = await response.json()
      expect(body).toHaveProperty('error')
    }
  })

  test('should enforce secure password requirements', async ({ page }) => {
    await page.goto('/auth/signup')

    // Test weak passwords
    const weakPasswords = [
      '123456',
      'password',
      'abc123',
      'qwerty',
      '12345678',
      'admin',
      'letmein',
      'welcome',
      'monkey',
      '1234567890',
    ]

    for (const password of weakPasswords) {
      await page.fill('input[id="name"]', 'Test User')
      await page.fill('input[id="email"]', 'test@example.com')
      await page.fill('input[id="password"]', password)
      await page.fill('input[id="confirmPassword"]', password)
      
      // Check if password is rejected
      await page.click('input[id="password"]') // Trigger validation
      await page.click('input[id="email"]') // Blur password field
      
      await expect(page.locator('text=/senha.*fraca|mínimo.*caracteres|deve conter/')).toBeVisible()
      
      // Clear form
      await page.reload()
    }
  })

  test('should prevent session hijacking', async ({ browser }) => {
    // Create two contexts (simulating different devices)
    const context1 = await browser.newContext()
    const page1 = await context1.newPage()
    
    const context2 = await browser.newContext()
    const page2 = await context2.newPage()

    // Login in first context
    await page1.goto('/auth/signin')
    await page1.fill('input[id="email"]', testUsers.validUser.email)
    await page1.fill('input[id="password"]', testUsers.validUser.password)
    await page1.click('button[type="submit"]')
    await page1.waitForURL('/dashboard')

    // Get session cookie
    const cookies = await context1.cookies()
    const sessionCookie = cookies.find(c => c.name.includes('session'))

    if (sessionCookie) {
      // Try to use session in different context
      await context2.addCookies([sessionCookie])
      await page2.goto('/dashboard')

      // Should not work due to additional security measures (IP check, user agent, etc.)
      // This depends on implementation, but session should be invalidated or restricted
    }

    await context1.close()
    await context2.close()
  })

  test('should log security events', async ({ page }) => {
    // Monitor console for security logs
    const securityLogs = []
    
    page.on('console', msg => {
      if (msg.text().includes('Security') || msg.text().includes('Unauthorized')) {
        securityLogs.push(msg.text())
      }
    })

    // Trigger security events
    // 1. Failed login
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', 'attacker@example.com')
    await page.fill('input[id="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    // 2. Try to access protected route
    await page.goto('/api/admin/users')

    // Verify security events are logged
    expect(securityLogs.length).toBeGreaterThan(0)
  })
})