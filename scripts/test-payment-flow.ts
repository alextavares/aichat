import puppeteer from 'puppeteer'
import { readFileSync } from 'fs'
import path from 'path'

async function testPaymentFlow() {
  console.log('🚀 Iniciando teste do fluxo de pagamento...\n')
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 720 }
  })

  try {
    const page = await browser.newPage()
    
    // 1. Acessar página inicial
    console.log('📍 Acessando página inicial...')
    await page.goto('http://localhost:3001')
    await page.waitForSelector('h1', { timeout: 10000 })
    await takeScreenshot(page, '1-home')
    
    // 2. Ir para página de pricing
    console.log('📍 Navegando para página de preços...')
    await page.goto('http://localhost:3001/pricing')
    await page.waitForSelector('.grid', { timeout: 10000 })
    await takeScreenshot(page, '2-pricing')
    
    // 3. Clicar no botão de upgrade do plano Pro
    console.log('📍 Clicando no botão de upgrade...')
    const upgradeButton = await page.$('button:has-text("Assinar Pro")')
    if (upgradeButton) {
      await upgradeButton.click()
      console.log('✅ Botão de upgrade clicado')
    } else {
      // Tentar outra abordagem
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'))
        const proButton = buttons.find(btn => 
          btn.textContent?.toLowerCase().includes('assinar pro') ||
          btn.textContent?.toLowerCase().includes('pro')
        )
        if (proButton) {
          (proButton as HTMLButtonElement).click()
        }
      })
    }
    
    // Aguardar navegação ou redirecionamento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 4. Verificar se foi redirecionado para login ou checkout
    const currentUrl = page.url()
    console.log(`📍 URL atual: ${currentUrl}`)
    
    if (currentUrl.includes('auth/signin')) {
      console.log('📍 Redirecionado para login. Fazendo login...')
      await takeScreenshot(page, '3-login')
      
      // Fazer login
      await page.type('input[name="email"]', 'template-test@example.com')
      await page.type('input[name="password"]', 'template123')
      await takeScreenshot(page, '3b-login-filled')
      
      await page.click('button[type="submit"]')
      await page.waitForNavigation({ waitUntil: 'networkidle0' })
      console.log('✅ Login realizado')
      
      // Voltar para pricing após login
      await page.goto('http://localhost:3001/pricing')
      await page.waitForSelector('.grid')
      
      // Tentar clicar no upgrade novamente
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'))
        const proButton = buttons.find(btn => 
          btn.textContent?.toLowerCase().includes('assinar pro')
        )
        if (proButton) {
          (proButton as HTMLButtonElement).click()
        }
      })
      
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
    // 5. Verificar página de checkout
    if (page.url().includes('checkout')) {
      console.log('📍 Na página de checkout')
      await page.waitForSelector('h1', { timeout: 10000 })
      await takeScreenshot(page, '4-checkout')
      
      // Selecionar método de pagamento
      console.log('📍 Selecionando método de pagamento...')
      const pixOption = await page.$('input[value="pix"]')
      if (pixOption) {
        await pixOption.click()
        console.log('✅ Pix selecionado')
      }
      
      await takeScreenshot(page, '5-payment-method')
      
      // Finalizar pagamento
      const finishButton = await page.$('button:has-text("Finalizar Pagamento")')
      if (finishButton) {
        console.log('📍 Clicando em finalizar pagamento...')
        await finishButton.click()
        await new Promise(resolve => setTimeout(resolve, 3000))
        await takeScreenshot(page, '6-processing')
      }
    }
    
    // 6. Verificar página de mock checkout
    if (page.url().includes('mock-checkout')) {
      console.log('📍 Na página de mock checkout')
      await takeScreenshot(page, '7-mock-checkout')
      
      // Simular pagamento aprovado
      const approveButton = await page.$('button:has-text("Simular Pagamento Aprovado")')
      if (approveButton) {
        console.log('📍 Simulando pagamento aprovado...')
        await approveButton.click()
        await page.waitForNavigation({ waitUntil: 'networkidle0' })
        await takeScreenshot(page, '8-success')
        console.log('✅ Pagamento simulado com sucesso!')
      }
    }
    
    // 7. Verificar página final
    const finalUrl = page.url()
    console.log(`\n📍 URL final: ${finalUrl}`)
    
    if (finalUrl.includes('subscription') && finalUrl.includes('success')) {
      console.log('✅ Upgrade concluído com sucesso!')
      await takeScreenshot(page, '9-subscription-success')
    }
    
    console.log('\n✅ Teste concluído! Screenshots salvos na pasta screenshots/')
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error)
    const page = (await browser.pages())[0]
    if (page) {
      await takeScreenshot(page, 'error')
    }
  } finally {
    console.log('\n🔍 Navegador permanecerá aberto por 10 segundos para inspeção...')
    await new Promise(resolve => setTimeout(resolve, 10000))
    await browser.close()
  }
}

async function takeScreenshot(page: puppeteer.Page, name: string) {
  const screenshotPath = path.join(process.cwd(), 'screenshots', `payment-${name}.png`)
  await page.screenshot({ 
    path: screenshotPath,
    fullPage: true 
  })
  console.log(`📸 Screenshot salvo: ${name}.png`)
}

// Executar teste
testPaymentFlow().catch(console.error)