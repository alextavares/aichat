import { test, expect } from '@playwright/test'
import { testConfig } from '../e2e/test.config'
import testUsers from '../config/test-users.json'

// Configure for performance testing
test.use({
  // Disable timeout for load tests
  timeout: 300000, // 5 minutes
})

test.describe('Performance & Load Tests', () => {
  test('should handle concurrent users', async ({ browser }) => {
    const userCount = 10
    const contexts = []
    const pages = []

    // Create multiple browser contexts (simulating different users)
    for (let i = 0; i < userCount; i++) {
      const context = await browser.newContext()
      const page = await context.newPage()
      contexts.push(context)
      pages.push(page)
    }

    // Measure login performance
    const loginPromises = pages.map(async (page, index) => {
      const startTime = Date.now()
      
      await page.goto('/auth/signin')
      await page.fill('input[id="email"]', `test${index}@example.com`)
      await page.fill('input[id="password"]', 'Test123!@#')
      await page.click('button[type="submit"]')
      
      // Wait for dashboard
      await page.waitForURL('/dashboard', { timeout: 30000 })
      
      const endTime = Date.now()
      return endTime - startTime
    })

    const loginTimes = await Promise.all(loginPromises)
    
    // Verify all logins completed
    expect(loginTimes.length).toBe(userCount)
    
    // Check average login time
    const avgLoginTime = loginTimes.reduce((a, b) => a + b, 0) / userCount
    console.log(`Average login time for ${userCount} concurrent users: ${avgLoginTime}ms`)
    
    // Performance assertion - login should complete within 5 seconds on average
    expect(avgLoginTime).toBeLessThan(5000)

    // Cleanup
    await Promise.all(contexts.map(context => context.close()))
  })

  test('should measure page load times', async ({ page }) => {
    const routes = [
      { path: '/', name: 'Home' },
      { path: '/auth/signin', name: 'Login' },
      { path: '/pricing', name: 'Pricing' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/chat', name: 'Chat' },
      { path: '/templates', name: 'Templates' },
    ]

    const metrics = []

    for (const route of routes) {
      // Clear cache and cookies for clean measurement
      await page.context().clearCookies()
      
      const startTime = Date.now()
      
      // Navigate and wait for load
      await page.goto(route.path, { waitUntil: 'networkidle' })
      
      // Get performance metrics
      const performanceTiming = await page.evaluate(() => {
        const timing = performance.timing
        return {
          domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
          load: timing.loadEventEnd - timing.navigationStart,
          firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
        }
      })
      
      const endTime = Date.now()
      const totalTime = endTime - startTime

      metrics.push({
        route: route.name,
        totalTime,
        ...performanceTiming,
      })

      // Performance assertions
      expect(totalTime).toBeLessThan(3000) // Page should load within 3 seconds
      expect(performanceTiming.firstContentfulPaint).toBeLessThan(1500) // FCP within 1.5s
    }

    // Log performance report
    console.table(metrics)
  })

  test('should handle heavy chat load', async ({ page }) => {
    // Login first
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Navigate to chat
    await page.goto('/chat')

    // Send multiple messages rapidly
    const messageCount = 20
    const messages = []
    
    for (let i = 0; i < messageCount; i++) {
      const startTime = Date.now()
      
      await page.fill('textarea[placeholder*="Digite sua mensagem"]', `Mensagem de teste ${i + 1}`)
      await page.keyboard.press('Enter')
      
      // Wait for response
      await page.waitForSelector(`text=Mensagem de teste ${i + 1}`)
      await page.waitForSelector('[data-testid="loading-indicator"]', { state: 'hidden', timeout: 30000 })
      
      const endTime = Date.now()
      messages.push({
        index: i + 1,
        responseTime: endTime - startTime,
      })
    }

    // Calculate metrics
    const avgResponseTime = messages.reduce((sum, m) => sum + m.responseTime, 0) / messageCount
    const maxResponseTime = Math.max(...messages.map(m => m.responseTime))
    
    console.log(`Chat Performance Metrics:`)
    console.log(`- Average response time: ${avgResponseTime}ms`)
    console.log(`- Max response time: ${maxResponseTime}ms`)
    console.log(`- Total messages: ${messageCount}`)

    // Performance assertions
    expect(avgResponseTime).toBeLessThan(5000) // Average response within 5s
    expect(maxResponseTime).toBeLessThan(10000) // No response takes more than 10s
  })

  test('should measure API response times', async ({ page }) => {
    // Login
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Intercept and measure API calls
    const apiMetrics = []

    page.on('response', response => {
      const url = response.url()
      if (url.includes('/api/')) {
        const timing = response.timing()
        if (timing) {
          apiMetrics.push({
            endpoint: url.replace(/.*\/api\//, '/api/'),
            status: response.status(),
            duration: timing.responseEnd - timing.requestStart,
          })
        }
      }
    })

    // Navigate through app to trigger API calls
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    
    await page.goto('/chat')
    await page.waitForTimeout(2000)
    
    await page.goto('/templates')
    await page.waitForTimeout(2000)

    // Analyze API metrics
    const avgApiTime = apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length
    const slowApis = apiMetrics.filter(m => m.duration > 1000)

    console.log(`API Performance Metrics:`)
    console.log(`- Total API calls: ${apiMetrics.length}`)
    console.log(`- Average response time: ${avgApiTime.toFixed(2)}ms`)
    console.log(`- Slow APIs (>1s): ${slowApis.length}`)
    
    if (slowApis.length > 0) {
      console.log('Slow API endpoints:')
      slowApis.forEach(api => {
        console.log(`  - ${api.endpoint}: ${api.duration.toFixed(2)}ms`)
      })
    }

    // Performance assertions
    expect(avgApiTime).toBeLessThan(500) // Average API response within 500ms
    expect(slowApis.length).toBeLessThan(3) // No more than 2 slow APIs
  })

  test('should handle large data sets efficiently', async ({ page }) => {
    // Login
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Test templates with many items
    await page.goto('/templates')
    
    // Measure initial load
    const startTime = Date.now()
    await page.waitForSelector('[data-testid="template-card"]', { timeout: 10000 })
    const loadTime = Date.now() - startTime

    // Count items
    const templateCount = await page.locator('[data-testid="template-card"]').count()
    console.log(`Templates loaded: ${templateCount} in ${loadTime}ms`)

    // Test scrolling performance
    if (templateCount > 10) {
      const scrollStartTime = Date.now()
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(500)
      const scrollTime = Date.now() - scrollStartTime
      
      console.log(`Scroll to bottom time: ${scrollTime}ms`)
      expect(scrollTime).toBeLessThan(1000)
    }

    // Test search performance
    const searchStartTime = Date.now()
    await page.fill('input[placeholder="Buscar templates"]', 'test')
    await page.waitForTimeout(500) // Debounce
    const searchTime = Date.now() - searchStartTime
    
    console.log(`Search time: ${searchTime}ms`)
    expect(searchTime).toBeLessThan(1000)
  })

  test('should monitor memory usage', async ({ page }) => {
    // Login
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Navigate through app and measure memory
    const memoryMetrics = []

    const measureMemory = async (location: string) => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        memoryMetrics.push({
          location,
          usedJSHeapSize: memory.usedJSHeapSize / 1048576, // Convert to MB
          totalJSHeapSize: memory.totalJSHeapSize / 1048576,
        })
      }
    }

    // Initial measurement
    await measureMemory('Dashboard')

    // Navigate and measure
    await page.goto('/chat')
    await page.waitForTimeout(2000)
    await measureMemory('Chat')

    // Send messages to increase memory usage
    for (let i = 0; i < 10; i++) {
      await page.fill('textarea[placeholder*="Digite sua mensagem"]', `Memory test ${i}`)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
    }
    await measureMemory('Chat after messages')

    // Navigate away and back
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    await measureMemory('Back to Dashboard')

    // Log memory report
    console.log('Memory Usage Report:')
    console.table(memoryMetrics)

    // Check for memory leaks
    if (memoryMetrics.length > 0) {
      const initialMemory = memoryMetrics[0].usedJSHeapSize
      const finalMemory = memoryMetrics[memoryMetrics.length - 1].usedJSHeapSize
      const memoryIncrease = finalMemory - initialMemory
      
      console.log(`Memory increase: ${memoryIncrease.toFixed(2)} MB`)
      
      // Memory shouldn't increase by more than 50MB
      expect(memoryIncrease).toBeLessThan(50)
    }
  })

  test('should test bundle size and load performance', async ({ page }) => {
    // Intercept all JS and CSS files
    const resources = []
    
    page.on('response', response => {
      const url = response.url()
      if (url.endsWith('.js') || url.endsWith('.css')) {
        resources.push({
          url: url.split('/').pop(),
          type: url.endsWith('.js') ? 'JS' : 'CSS',
          size: response.headers()['content-length'] || 0,
          timing: response.timing(),
        })
      }
    })

    // Load home page
    await page.goto('/', { waitUntil: 'networkidle' })

    // Calculate bundle sizes
    const jsBundles = resources.filter(r => r.type === 'JS')
    const cssBundles = resources.filter(r => r.type === 'CSS')
    
    const totalJsSize = jsBundles.reduce((sum, b) => sum + parseInt(b.size), 0) / 1024 // KB
    const totalCssSize = cssBundles.reduce((sum, b) => sum + parseInt(b.size), 0) / 1024 // KB

    console.log('Bundle Size Report:')
    console.log(`- Total JS: ${totalJsSize.toFixed(2)} KB`)
    console.log(`- Total CSS: ${totalCssSize.toFixed(2)} KB`)
    console.log(`- Total: ${(totalJsSize + totalCssSize).toFixed(2)} KB`)

    // Performance assertions
    expect(totalJsSize).toBeLessThan(1000) // JS bundle under 1MB
    expect(totalCssSize).toBeLessThan(200) // CSS bundle under 200KB
  })

  test('should test real-time features performance', async ({ page, context }) => {
    // Login in two tabs to test real-time sync
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Open second tab
    const page2 = await context.newPage()
    await page2.goto('/dashboard')

    // Measure real-time update latency
    await page.goto('/chat')
    await page2.goto('/dashboard')

    // Send message in first tab
    const startTime = Date.now()
    await page.fill('textarea[placeholder*="Digite sua mensagem"]', 'Real-time test message')
    await page.keyboard.press('Enter')

    // Wait for update in dashboard (second tab)
    await page2.waitForSelector('text=Real-time test message', { timeout: 5000 })
    const updateTime = Date.now() - startTime

    console.log(`Real-time update latency: ${updateTime}ms`)
    
    // Real-time updates should happen within 2 seconds
    expect(updateTime).toBeLessThan(2000)

    await page2.close()
  })

  test('should stress test form submissions', async ({ page }) => {
    await page.goto('/auth/signin')

    // Rapid form submissions
    const submissionTimes = []
    
    for (let i = 0; i < 10; i++) {
      const startTime = Date.now()
      
      await page.fill('input[id="email"]', 'stress@test.com')
      await page.fill('input[id="password"]', 'StressTest123!')
      await page.click('button[type="submit"]')
      
      // Wait for error (invalid credentials)
      await page.waitForSelector('text=Credenciais inválidas', { timeout: 5000 })
      
      const endTime = Date.now()
      submissionTimes.push(endTime - startTime)
      
      // Clear error
      await page.reload()
    }

    const avgSubmissionTime = submissionTimes.reduce((a, b) => a + b, 0) / submissionTimes.length
    console.log(`Average form submission time: ${avgSubmissionTime}ms`)
    
    // Form should handle rapid submissions gracefully
    expect(avgSubmissionTime).toBeLessThan(2000)
    
    // Check if rate limiting kicks in
    const lastSubmissionTime = submissionTimes[submissionTimes.length - 1]
    const firstSubmissionTime = submissionTimes[0]
    
    // Later submissions might be slower due to rate limiting
    if (lastSubmissionTime > firstSubmissionTime * 2) {
      console.log('Rate limiting detected - good!')
    }
  })
})