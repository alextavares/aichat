import puppeteer from 'puppeteer'

describe('Payment Flow Test', () => {
  let browser: puppeteer.Browser
  let page: puppeteer.Page
  
  const baseUrl = 'http://localhost:3001'
  const testEmail = 'template-test@example.com'
  const testPassword = 'template123'

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      slowMo: 50, // Slow down actions for better visibility
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    page = await browser.newPage()
    await page.setViewport({ width: 1280, height: 720 })
  })

  afterAll(async () => {
    await browser.close()
  })

  test('Complete upgrade flow from Free to Pro plan', async () => {
    // 1. Navigate to home page
    await page.goto(baseUrl)
    await page.waitForSelector('h1')
    console.log('✅ Home page loaded')

    // 2. Click on Login/Sign in
    await page.click('a[href="/auth/signin"]')
    await page.waitForNavigation()
    console.log('✅ Navigated to login page')

    // 3. Fill login form
    await page.type('input[name="email"]', testEmail)
    await page.type('input[name="password"]', testPassword)
    
    // Submit form
    await page.click('button[type="submit"]')
    await page.waitForNavigation()
    console.log('✅ Logged in successfully')

    // 4. Navigate to pricing page
    await page.goto(`${baseUrl}/pricing`)
    await page.waitForSelector('.grid')
    console.log('✅ Pricing page loaded')

    // 5. Click on Pro plan upgrade button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const proButton = buttons.find(btn => btn.textContent?.includes('Assinar Pro'))
      if (proButton) {
        (proButton as HTMLButtonElement).click()
      }
    })
    
    await page.waitForNavigation()
    console.log('✅ Navigated to checkout page')

    // 6. Verify checkout page elements
    await page.waitForSelector('h1')
    const checkoutTitle = await page.$eval('h1', el => el.textContent)
    expect(checkoutTitle).toContain('Finalizar Assinatura')

    // Check plan details
    const planTitle = await page.$eval('h3', el => el.textContent)
    expect(planTitle).toContain('Plano Pro')

    // 7. Select payment method (Card is default)
    const cardOption = await page.$('input[value="card"]')
    expect(cardOption).toBeTruthy()

    // 8. Click payment button
    await page.click('button:has-text("Finalizar Pagamento")')
    
    // Wait for redirect to mock checkout
    await page.waitForNavigation()
    console.log('✅ Redirected to mock checkout')

    // 9. Verify mock checkout page
    const mockNotice = await page.$('.warning')
    expect(mockNotice).toBeTruthy()

    // 10. Click approve payment button
    await page.click('button:has-text("Simular Pagamento Aprovado")')
    
    // Wait for redirect to success
    await page.waitForNavigation()
    console.log('✅ Payment approved')

    // 11. Verify subscription page with success message
    const url = page.url()
    expect(url).toContain('/dashboard/subscription')
    expect(url).toContain('success=true')

    // Check success alert
    await page.waitForSelector('.alert')
    const alertText = await page.$eval('.alert', el => el.textContent)
    expect(alertText).toContain('assinatura foi ativada com sucesso')

    // 12. Verify plan was upgraded
    const planBadge = await page.$eval('[data-testid="plan-badge"]', el => el.textContent)
    expect(planBadge).toContain('PRO')

    console.log('✅ Upgrade flow completed successfully!')
  }, 60000) // 60 second timeout

  test('Cancel checkout flow', async () => {
    // Navigate to pricing
    await page.goto(`${baseUrl}/pricing`)
    await page.waitForSelector('.grid')

    // Click upgrade button
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'))
      const proButton = buttons.find(btn => btn.textContent?.includes('Assinar Pro'))
      if (proButton) {
        (proButton as HTMLButtonElement).click()
      }
    })
    
    await page.waitForNavigation()

    // Click cancel/back button
    await page.click('button:has-text("Voltar")')
    await page.waitForNavigation()

    // Verify we're back on pricing page
    const url = page.url()
    expect(url).toContain('/pricing')
    
    console.log('✅ Cancel flow works correctly')
  }, 30000)

  test('Test different payment methods', async () => {
    // Navigate to checkout
    await page.goto(`${baseUrl}/checkout?plan=pro`)
    await page.waitForSelector('h1')

    // Test Pix selection
    await page.click('input[value="pix"]')
    let selectedMethod = await page.$eval('input[value="pix"]', el => (el as HTMLInputElement).checked)
    expect(selectedMethod).toBe(true)
    console.log('✅ Pix payment method selected')

    // Test Boleto selection
    await page.click('input[value="boleto"]')
    selectedMethod = await page.$eval('input[value="boleto"]', el => (el as HTMLInputElement).checked)
    expect(selectedMethod).toBe(true)
    console.log('✅ Boleto payment method selected')

    // Test installments for credit card
    await page.click('input[value="card"]')
    await page.waitForSelector('select') // Wait for installments dropdown
    
    await page.select('select', '12') // Select 12x installments
    const selectedValue = await page.$eval('select', el => (el as HTMLSelectElement).value)
    expect(selectedValue).toBe('12')
    console.log('✅ Installments selection works')
  }, 30000)
})

// Helper function to take screenshots
async function takeScreenshot(page: puppeteer.Page, name: string) {
  await page.screenshot({ 
    path: `screenshots/payment-flow-${name}.png`,
    fullPage: true 
  })
}