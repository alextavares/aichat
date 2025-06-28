import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { testConfig } from '../e2e/test.config'
import testUsers from '../config/test-users.json'

test.describe('Accessibility Tests', () => {
  test('should pass WCAG 2.1 AA compliance on public pages', async ({ page }) => {
    const publicPages = [
      { url: '/', name: 'Home' },
      { url: '/pricing', name: 'Pricing' },
      { url: '/auth/signin', name: 'Sign In' },
      { url: '/auth/signup', name: 'Sign Up' },
    ]

    for (const pageInfo of publicPages) {
      await page.goto(pageInfo.url)
      await page.waitForLoadState('networkidle')

      // Run axe-core accessibility scan
      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()

      // Log violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n${pageInfo.name} page violations:`)
        accessibilityScanResults.violations.forEach(violation => {
          console.log(`- ${violation.id}: ${violation.description}`)
          violation.nodes.forEach(node => {
            console.log(`  Target: ${node.target}`)
          })
        })
      }

      // Assert no violations
      expect(accessibilityScanResults.violations).toEqual([])
    }
  })

  test('should pass accessibility scan on authenticated pages', async ({ page }) => {
    // Login first
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    const authenticatedPages = [
      { url: '/dashboard', name: 'Dashboard' },
      { url: '/chat', name: 'Chat' },
      { url: '/templates', name: 'Templates' },
      { url: '/knowledge', name: 'Knowledge Base' },
      { url: '/settings', name: 'Settings' },
    ]

    for (const pageInfo of authenticatedPages) {
      await page.goto(pageInfo.url)
      await page.waitForLoadState('networkidle')

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze()

      if (accessibilityScanResults.violations.length > 0) {
        console.log(`\n${pageInfo.name} page violations:`)
        accessibilityScanResults.violations.forEach(violation => {
          console.log(`- ${violation.id}: ${violation.description}`)
        })
      }

      expect(accessibilityScanResults.violations).toEqual([])
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/auth/signin')

    // Test tab navigation through form
    await page.keyboard.press('Tab')
    await expect(page.locator('input[id="email"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('input[id="password"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('button[type="submit"]')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.locator('a:has-text("Esqueceu a senha?")')).toBeFocused()

    // Test shift+tab (reverse navigation)
    await page.keyboard.press('Shift+Tab')
    await expect(page.locator('button[type="submit"]')).toBeFocused()

    // Test form submission with Enter
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.keyboard.press('Enter')

    // Should submit form
    await expect(page).toHaveURL('/dashboard')
  })

  test('should provide proper focus management', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    // Navigate to chat
    await page.goto('/chat')

    // Test modal focus management
    await page.click('button[aria-label="Nova conversa"]')
    
    // Focus should move to modal
    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()
    
    // First focusable element in modal should be focused
    await expect(modal.locator('button').first()).toBeFocused()

    // Escape should close modal and return focus
    await page.keyboard.press('Escape')
    await expect(modal).toBeHidden()
  })

  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('/')

    // Check main navigation
    const nav = page.locator('nav[role="navigation"]')
    await expect(nav).toBeVisible()

    // Check buttons have proper labels
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      if (await button.isVisible()) {
        const ariaLabel = await button.getAttribute('aria-label')
        const textContent = await button.textContent()
        
        // Button should have either aria-label or text content
        expect(ariaLabel || textContent?.trim()).toBeTruthy()
      }
    }

    // Check images have alt text
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const ariaLabel = await img.getAttribute('aria-label')
      
      // Image should have alt text or be decorative
      if (alt === null && ariaLabel === null) {
        const role = await img.getAttribute('role')
        expect(role).toBe('presentation')
      }
    }
  })

  test('should support screen reader announcements', async ({ page }) => {
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')

    await page.goto('/chat')

    // Send a message to test live announcements
    await page.fill('textarea[placeholder*="Digite sua mensagem"]', 'Teste de anúncio')
    await page.keyboard.press('Enter')

    // Check for live region with loading announcement
    const liveRegion = page.locator('[aria-live="polite"]')
    await expect(liveRegion).toContainText(/Processando|Enviando/)

    // Wait for response and check completion announcement
    await page.waitForSelector('[data-testid="loading-indicator"]', { state: 'hidden', timeout: 30000 })
    await expect(liveRegion).toContainText(/Resposta recebida|Concluído/)
  })

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/')

    // Run color contrast audit
    const colorResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze()

    expect(colorResults.violations).toEqual([])

    // Test specific elements for contrast
    const textElements = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'span', 'a', 'button',
      'label', 'input'
    ]

    for (const selector of textElements) {
      const elements = page.locator(selector)
      const count = await elements.count()

      if (count > 0) {
        // Check first visible element of each type
        const element = elements.first()
        if (await element.isVisible()) {
          const styles = await element.evaluate(el => {
            const computed = window.getComputedStyle(el)
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor,
              fontSize: computed.fontSize,
            }
          })

          // Log for manual verification if needed
          console.log(`${selector}: color=${styles.color}, bg=${styles.backgroundColor}`)
        }
      }
    }
  })

  test('should support zoom up to 200%', async ({ page }) => {
    await page.goto('/')

    // Test zoom levels
    const zoomLevels = [1.0, 1.25, 1.5, 2.0]

    for (const zoom of zoomLevels) {
      await page.setViewportSize({ 
        width: Math.floor(1920 / zoom), 
        height: Math.floor(1080 / zoom) 
      })

      // Simulate zoom by setting CSS transform
      await page.addStyleTag({
        content: `body { transform: scale(${zoom}); transform-origin: top left; }`
      })

      await page.waitForTimeout(500)

      // Check that main content is still visible and usable
      await expect(page.locator('h1').first()).toBeVisible()
      
      // Check that navigation is accessible
      const navLinks = page.locator('nav a')
      const navCount = await navLinks.count()
      
      if (navCount > 0) {
        await expect(navLinks.first()).toBeVisible()
      }

      // Reset styles
      await page.addStyleTag({
        content: `body { transform: none; }`
      })
    }
  })

  test('should work with keyboard-only navigation', async ({ page }) => {
    await page.goto('/')

    // Track which elements can be focused
    const focusableElements = []
    let currentIndex = 0

    // Start tabbing through the page
    for (let i = 0; i < 20; i++) { // Limit to prevent infinite loop
      await page.keyboard.press('Tab')
      
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tagName: el?.tagName,
          type: el?.getAttribute('type'),
          role: el?.getAttribute('role'),
          ariaLabel: el?.getAttribute('aria-label'),
          text: el?.textContent?.trim().substring(0, 50),
        }
      })

      focusableElements.push(focusedElement)
      
      // If we've cycled back to the first element, break
      if (i > 0 && JSON.stringify(focusedElement) === JSON.stringify(focusableElements[0])) {
        break
      }
    }

    // Verify we can navigate through interactive elements
    expect(focusableElements.length).toBeGreaterThan(1)
    
    // Verify no focus traps (unless intentional)
    const uniqueFocusableElements = new Set(focusableElements.map(el => JSON.stringify(el)))
    expect(uniqueFocusableElements.size).toBeGreaterThan(1)
  })

  test('should provide skip links', async ({ page }) => {
    await page.goto('/')

    // Press Tab to reveal skip link
    await page.keyboard.press('Tab')

    // Check for skip link
    const skipLink = page.locator('a:has-text("Pular para o conteúdo")')
    if (await skipLink.isVisible()) {
      await skipLink.click()
      
      // Focus should move to main content
      const mainContent = page.locator('main, [role="main"]')
      await expect(mainContent).toBeFocused()
    }
  })

  test('should handle form validation accessibly', async ({ page }) => {
    await page.goto('/auth/signup')

    // Submit empty form to trigger validation
    await page.click('button[type="submit"]')

    // Check for accessible error messages
    const nameField = page.locator('input[id="name"]')
    const nameError = page.locator('[aria-describedby="name-error"]')
    
    if (await nameError.isVisible()) {
      // Error should be associated with field
      const ariaDescribedBy = await nameField.getAttribute('aria-describedby')
      expect(ariaDescribedBy).toContain('name-error')
      
      // Error should be announced
      const errorText = await nameError.textContent()
      expect(errorText).toBeTruthy()
    }

    // Check aria-invalid attribute
    const invalidAttribute = await nameField.getAttribute('aria-invalid')
    expect(invalidAttribute).toBe('true')
  })

  test('should support different input methods', async ({ page }) => {
    await page.goto('/chat')
    
    // Login first
    await page.goto('/auth/signin')
    await page.fill('input[id="email"]', testUsers.validUser.email)
    await page.fill('input[id="password"]', testUsers.validUser.password)
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    await page.goto('/chat')

    const messageInput = page.locator('textarea[placeholder*="Digite sua mensagem"]')

    // Test different input methods
    // 1. Keyboard input
    await messageInput.fill('Teste via teclado')
    await page.keyboard.press('Enter')
    await expect(page.locator('text=Teste via teclado')).toBeVisible()

    // 2. Voice input simulation (setting via JavaScript)
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea')
      if (textarea) {
        textarea.value = 'Teste via voz'
        textarea.dispatchEvent(new Event('input', { bubbles: true }))
      }
    })
    await page.keyboard.press('Enter')
    await expect(page.locator('text=Teste via voz')).toBeVisible()

    // 3. Copy/paste
    await page.keyboard.press('Control+a')
    await page.keyboard.type('Texto colado')
    await page.keyboard.press('Enter')
    await expect(page.locator('text=Texto colado')).toBeVisible()
  })

  test('should provide clear heading structure', async ({ page }) => {
    await page.goto('/')

    // Check heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    const headingLevels = []

    for (const heading of headings) {
      if (await heading.isVisible()) {
        const tagName = await heading.evaluate(el => el.tagName)
        const level = parseInt(tagName.charAt(1))
        const text = await heading.textContent()
        
        headingLevels.push({ level, text: text?.trim() })
      }
    }

    // Should have at least one H1
    const h1Count = headingLevels.filter(h => h.level === 1).length
    expect(h1Count).toBeGreaterThanOrEqual(1)

    // Check for logical heading progression
    for (let i = 1; i < headingLevels.length; i++) {
      const current = headingLevels[i]
      const previous = headingLevels[i - 1]
      
      // Don't skip heading levels (max jump is 1)
      if (current.level > previous.level) {
        expect(current.level - previous.level).toBeLessThanOrEqual(1)
      }
    }
  })

  test('should work with reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    await page.goto('/')
    
    // Check that animations respect reduced motion
    const animatedElements = page.locator('[class*="animate"], [style*="transition"], [style*="animation"]')
    const count = await animatedElements.count()
    
    for (let i = 0; i < count; i++) {
      const element = animatedElements.nth(i)
      const styles = await element.evaluate(el => {
        const computed = window.getComputedStyle(el)
        return {
          animationDuration: computed.animationDuration,
          transitionDuration: computed.transitionDuration,
        }
      })
      
      // Animations should be disabled or very short
      if (styles.animationDuration !== 'none' && styles.animationDuration !== '0s') {
        console.log(`Element has animation: ${styles.animationDuration}`)
      }
      if (styles.transitionDuration !== 'none' && styles.transitionDuration !== '0s') {
        console.log(`Element has transition: ${styles.transitionDuration}`)
      }
    }
  })

  test('should support browser zoom', async ({ page }) => {
    await page.goto('/')

    // Test different zoom levels by changing viewport and font size
    const zoomTests = [
      { zoom: 1.0, fontSize: '16px' },
      { zoom: 1.5, fontSize: '24px' },
      { zoom: 2.0, fontSize: '32px' },
    ]

    for (const { zoom, fontSize } of zoomTests) {
      // Simulate zoom by changing root font size
      await page.addStyleTag({
        content: `html { font-size: ${fontSize} !important; }`
      })

      await page.waitForTimeout(500)

      // Verify content is still accessible
      const heading = page.locator('h1').first()
      await expect(heading).toBeVisible()

      // Verify navigation still works
      const buttons = page.locator('button').first()
      if (await buttons.isVisible()) {
        await expect(buttons).toBeVisible()
      }

      // Check for horizontal scrolling (should be minimal)
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
      const viewportWidth = await page.evaluate(() => window.innerWidth)
      
      // Allow some horizontal scroll at high zoom levels
      if (zoom <= 1.5) {
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth * 1.1)
      }

      // Reset
      await page.addStyleTag({
        content: `html { font-size: 16px !important; }`
      })
    }
  })
})