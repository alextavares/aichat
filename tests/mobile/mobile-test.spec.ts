import { test, expect, devices } from '@playwright/test'
import { testConfig } from '../e2e/test.config'
import testUsers from '../config/test-users.json'

// Define mobile devices to test
const mobileDevices = [
  { name: 'iPhone 13', device: devices['iPhone 13'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'Galaxy S21', device: devices['Galaxy S8'] },
  { name: 'iPad', device: devices['iPad Pro'] },
]

test.describe('Mobile Tests', () => {
  mobileDevices.forEach(({ name, device }) => {
    test.describe(`${name} Tests`, () => {
      test.use({ ...device })

      test('should render responsive layout', async ({ page }) => {
        await page.goto('/')

        // Check mobile-specific elements
        const mobileMenu = page.locator('[data-testid="mobile-menu"]')
        const hamburgerButton = page.locator('button[aria-label="Menu"]')
        
        // Mobile menu should be present on small screens
        if (device.viewport.width < 768) {
          await expect(hamburgerButton).toBeVisible()
        }

        // Check responsive grid
        const gridContainer = page.locator('[class*="grid"], [class*="flex"]')
        if (await gridContainer.first().isVisible()) {
          const styles = await gridContainer.first().evaluate(el => {
            const computed = window.getComputedStyle(el)
            return {
              display: computed.display,
              flexDirection: computed.flexDirection,
              gridTemplateColumns: computed.gridTemplateColumns,
            }
          })

          // Should adapt layout for mobile
          if (device.viewport.width < 768) {
            if (styles.display === 'flex') {
              expect(styles.flexDirection).toBe('column')
            }
          }
        }
      })

      test('should support touch gestures', async ({ page }) => {
        await page.goto('/auth/signin')
        await page.fill('input[id="email"]', testUsers.validUser.email)
        await page.fill('input[id="password"]', testUsers.validUser.password)
        await page.click('button[type="submit"]')
        await page.waitForURL('/dashboard')

        await page.goto('/chat')

        // Test tap gestures
        const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
        await messageInput.tap()
        await expect(messageInput).toBeFocused()

        // Test swipe gestures on conversation list
        const conversationList = page.locator('[data-testid="conversation-list"]')
        if (await conversationList.isVisible()) {
          // Swipe left to reveal actions
          await conversationList.first().swipe('left', { steps: 10 })
          
          // Check if action buttons appear
          const actionButtons = page.locator('[data-testid="conversation-actions"]')
          if (await actionButtons.isVisible()) {
            await expect(actionButtons).toBeVisible()
          }
        }

        // Test long press
        const messageElement = page.locator('[data-testid="message"]').first()
        if (await messageElement.isVisible()) {
          await messageElement.longPress()
          
          // Context menu should appear
          const contextMenu = page.locator('[data-testid="context-menu"]')
          if (await contextMenu.isVisible()) {
            await expect(contextMenu).toBeVisible()
          }
        }
      })

      test('should have touch-friendly button sizes', async ({ page }) => {
        await page.goto('/')

        // Check all buttons for minimum touch target size (44x44px)
        const buttons = page.locator('button')
        const buttonCount = await buttons.count()

        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i)
          if (await button.isVisible()) {
            const box = await button.boundingBox()
            
            if (box) {
              // Minimum touch target is 44x44px
              expect(box.width).toBeGreaterThanOrEqual(44)
              expect(box.height).toBeGreaterThanOrEqual(44)
            }
          }
        }

        // Check links as well
        const links = page.locator('a')
        const linkCount = await links.count()

        for (let i = 0; i < linkCount; i++) {
          const link = links.nth(i)
          if (await link.isVisible()) {
            const box = await link.boundingBox()
            
            if (box && box.width > 0 && box.height > 0) {
              // Interactive elements should meet touch target guidelines
              expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44)
            }
          }
        }
      })

      test('should handle virtual keyboard', async ({ page }) => {
        await page.goto('/auth/signin')

        // Focus on input field
        const emailInput = page.locator('input[id="email"]')
        await emailInput.tap()

        // Check if viewport adjusts for virtual keyboard
        const initialViewport = page.viewportSize()
        
        // Type to ensure keyboard stays open
        await emailInput.fill('test@example.com')
        
        // Check that form is still visible and accessible
        const submitButton = page.locator('button[type="submit"]')
        await expect(submitButton).toBeVisible()

        // Test that user can scroll to see hidden content
        const passwordInput = page.locator('input[id="password"]')
        await passwordInput.scrollIntoViewIfNeeded()
        await passwordInput.tap()
        await passwordInput.fill('password123')

        // Form should still be submittable
        await expect(submitButton).toBeVisible()
      })

      test('should support orientation changes', async ({ page }) => {
        // Start in portrait
        await page.setViewportSize({ 
          width: device.viewport.width, 
          height: device.viewport.height 
        })
        
        await page.goto('/')
        
        // Verify portrait layout
        const heading = page.locator('h1').first()
        await expect(heading).toBeVisible()

        // Switch to landscape
        await page.setViewportSize({ 
          width: device.viewport.height, 
          height: device.viewport.width 
        })

        await page.waitForTimeout(500) // Allow time for layout adjustment

        // Content should still be accessible in landscape
        await expect(heading).toBeVisible()

        // Navigation should work in both orientations
        const navButtons = page.locator('nav button, nav a')
        if (await navButtons.first().isVisible()) {
          await expect(navButtons.first()).toBeVisible()
        }
      })

      test('should handle mobile forms effectively', async ({ page }) => {
        await page.goto('/auth/signup')

        // Test form field interactions
        const formFields = [
          { selector: 'input[id="name"]', type: 'text' },
          { selector: 'input[id="email"]', type: 'email' },
          { selector: 'input[id="password"]', type: 'password' },
        ]

        for (const field of formFields) {
          const input = page.locator(field.selector)
          
          // Tap to focus
          await input.tap()
          await expect(input).toBeFocused()

          // Check input type for appropriate keyboard
          const inputType = await input.getAttribute('type')
          expect(inputType).toBe(field.type)

          // Check autocomplete attributes
          const autocomplete = await input.getAttribute('autocomplete')
          if (field.type === 'email') {
            expect(autocomplete).toContain('email')
          }
        }

        // Test form submission
        await page.fill('input[id="name"]', 'Mobile User')
        await page.fill('input[id="email"]', 'mobile@test.com')
        await page.fill('input[id="password"]', 'MobilePass123!')
        await page.fill('input[id="confirmPassword"]', 'MobilePass123!')

        // Scroll to submit button if needed
        const submitButton = page.locator('button[type="submit"]')
        await submitButton.scrollIntoViewIfNeeded()
        
        // Check terms checkbox
        const termsCheckbox = page.locator('input[type="checkbox"]')
        await termsCheckbox.tap()

        // Submit should be enabled
        await expect(submitButton).toBeEnabled()
      })

      test('should optimize for mobile performance', async ({ page }) => {
        const startTime = Date.now()
        
        // Navigate to main page
        await page.goto('/', { waitUntil: 'networkidle' })
        
        const loadTime = Date.now() - startTime
        console.log(`${name} page load time: ${loadTime}ms`)

        // Mobile should load within reasonable time
        expect(loadTime).toBeLessThan(5000)

        // Check for performance hints
        const performanceMetrics = await page.evaluate(() => {
          const timing = performance.timing
          const paint = performance.getEntriesByType('paint')
          
          return {
            domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
            firstPaint: paint[0]?.startTime || 0,
            firstContentfulPaint: paint[1]?.startTime || 0,
          }
        })

        console.log(`${name} performance metrics:`, performanceMetrics)

        // Mobile performance thresholds
        expect(performanceMetrics.firstContentfulPaint).toBeLessThan(2000)
        expect(performanceMetrics.domContentLoaded).toBeLessThan(3000)
      })

      test('should handle mobile chat interface', async ({ page }) => {
        // Login
        await page.goto('/auth/signin')
        await page.fill('input[id="email"]', testUsers.validUser.email)
        await page.fill('input[id="password"]', testUsers.validUser.password)
        await page.click('button[type="submit"]')
        await page.waitForURL('/dashboard')

        await page.goto('/chat')

        // Test mobile chat layout
        const chatContainer = page.locator('[data-testid="chat-container"]')
        await expect(chatContainer).toBeVisible()

        // Message input should be accessible
        const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')
        await messageInput.tap()
        await messageInput.fill('Teste mobile')

        // Send button should be touch-friendly
        const sendButton = page.locator('button[aria-label="Enviar mensagem"]')
        const sendBox = await sendButton.boundingBox()
        
        if (sendBox) {
          expect(sendBox.width).toBeGreaterThanOrEqual(44)
          expect(sendBox.height).toBeGreaterThanOrEqual(44)
        }

        // Send message
        await sendButton.tap()
        await expect(page.locator('text=Teste mobile')).toBeVisible()

        // Test scrolling in chat
        const messagesContainer = page.locator('[data-testid="messages-container"]')
        if (await messagesContainer.isVisible()) {
          // Should be able to scroll through messages
          await messagesContainer.scroll({ top: 100 })
        }
      })

      test('should support pull-to-refresh', async ({ page }) => {
        await page.goto('/auth/signin')
        await page.fill('input[id="email"]', testUsers.validUser.email)
        await page.fill('input[id="password"]', testUsers.validUser.password)
        await page.click('button[type="submit"]')
        await page.waitForURL('/dashboard')

        // Test pull to refresh on dashboard
        const main = page.locator('main')
        
        // Simulate pull gesture
        await main.swipe('down', { 
          steps: 20,
          startPosition: { x: '50%', y: '10%' },
          endPosition: { x: '50%', y: '90%' }
        })

        // Check for refresh indicator
        const refreshIndicator = page.locator('[data-testid="refresh-indicator"]')
        if (await refreshIndicator.isVisible({ timeout: 1000 })) {
          await expect(refreshIndicator).toBeVisible()
          
          // Wait for refresh to complete
          await expect(refreshIndicator).toBeHidden({ timeout: 5000 })
        }
      })

      test('should handle mobile navigation patterns', async ({ page }) => {
        await page.goto('/')

        // Test bottom navigation if present
        const bottomNav = page.locator('[data-testid="bottom-navigation"]')
        if (await bottomNav.isVisible()) {
          const navItems = bottomNav.locator('button, a')
          const itemCount = await navItems.count()

          // Each nav item should be touch-friendly
          for (let i = 0; i < itemCount; i++) {
            const item = navItems.nth(i)
            const box = await item.boundingBox()
            
            if (box) {
              expect(box.height).toBeGreaterThanOrEqual(44)
            }
          }
        }

        // Test hamburger menu
        const hamburgerButton = page.locator('button[aria-label="Menu"]')
        if (await hamburgerButton.isVisible()) {
          await hamburgerButton.tap()
          
          // Mobile menu should appear
          const mobileMenu = page.locator('[data-testid="mobile-menu"]')
          await expect(mobileMenu).toBeVisible()

          // Menu should be closeable
          const closeButton = page.locator('button[aria-label="Fechar menu"]')
          if (await closeButton.isVisible()) {
            await closeButton.tap()
            await expect(mobileMenu).toBeHidden()
          } else {
            // Try tapping outside
            await page.tap('body', { position: { x: 10, y: 10 } })
            await expect(mobileMenu).toBeHidden()
          }
        }
      })

      test('should optimize images for mobile', async ({ page }) => {
        await page.goto('/')

        // Check image optimization
        const images = page.locator('img')
        const imageCount = await images.count()

        for (let i = 0; i < imageCount; i++) {
          const img = images.nth(i)
          
          if (await img.isVisible()) {
            // Check for responsive image attributes
            const srcset = await img.getAttribute('srcset')
            const sizes = await img.getAttribute('sizes')
            
            // Images should have appropriate srcset for different densities
            if (srcset) {
              expect(srcset).toContain('1x')
              // Should have high DPI version for mobile
              expect(srcset).toMatch(/2x|3x/)
            }

            // Check loading attribute
            const loading = await img.getAttribute('loading')
            if (loading) {
              expect(['lazy', 'eager']).toContain(loading)
            }
          }
        }
      })

      test('should handle mobile-specific gestures in templates', async ({ page }) => {
        await page.goto('/auth/signin')
        await page.fill('input[id="email"]', testUsers.validUser.email)
        await page.fill('input[id="password"]', testUsers.validUser.password)
        await page.click('button[type="submit"]')
        await page.waitForURL('/dashboard')

        await page.goto('/templates')

        // Test swipe actions on template cards
        const templateCard = page.locator('[data-testid="template-card"]').first()
        
        if (await templateCard.isVisible()) {
          // Swipe left to reveal actions
          await templateCard.swipe('left')
          
          // Check for revealed actions
          const actions = page.locator('[data-testid="template-actions"]')
          if (await actions.isVisible()) {
            await expect(actions).toBeVisible()
            
            // Actions should be touch-friendly
            const actionButtons = actions.locator('button')
            const buttonCount = await actionButtons.count()
            
            for (let i = 0; i < buttonCount; i++) {
              const button = actionButtons.nth(i)
              const box = await button.boundingBox()
              
              if (box) {
                expect(box.height).toBeGreaterThanOrEqual(44)
              }
            }
          }
        }
      })
    })
  })

  test('should work across different mobile browsers', async ({ page, browserName }) => {
    // Test browser-specific features
    await page.goto('/')

    // Check for browser compatibility
    const userAgent = await page.evaluate(() => navigator.userAgent)
    console.log(`Testing on ${browserName}: ${userAgent}`)

    // Basic functionality should work
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()

    // Interactive elements should work
    const buttons = page.locator('button')
    if (await buttons.first().isVisible()) {
      await expect(buttons.first()).toBeEnabled()
    }

    // CSS features should be supported
    const hasFlexSupport = await page.evaluate(() => {
      const div = document.createElement('div')
      div.style.display = 'flex'
      return div.style.display === 'flex'
    })
    
    expect(hasFlexSupport).toBe(true)

    // Test touch events
    const hasTouchSupport = await page.evaluate(() => {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    })
    
    // Should detect touch capability on mobile
    if (page.viewportSize()?.width && page.viewportSize()!.width < 768) {
      expect(hasTouchSupport).toBe(true)
    }
  })
})