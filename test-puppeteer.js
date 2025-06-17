const puppeteer = require('puppeteer');

async function testInnerAI() {
  console.log('🚀 Iniciando testes automatizados do Inner AI Clone...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await puppeteer.launch({
      headless: false, // Set to true for CI/CD
      slowMo: 50, // Slow down actions for visibility
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Test results
    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };

    // Helper function to log test results
    const logTest = (name, passed, error = null) => {
      if (passed) {
        console.log(`✅ ${name}`);
        results.passed++;
      } else {
        console.log(`❌ ${name}: ${error}`);
        results.failed++;
      }
      results.tests.push({ name, passed, error });
    };

    // 1. Test Homepage
    console.log('\n📋 Testing Homepage...');
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      await page.waitForSelector('text/Inner AI Clone', { timeout: 5000 });
      logTest('Homepage loads correctly', true);
    } catch (error) {
      logTest('Homepage loads correctly', false, error.message);
    }

    // 2. Test Sign In
    console.log('\n📋 Testing Authentication...');
    try {
      // Click sign in button
      await page.click('text/Entrar');
      await page.waitForSelector('input[name="email"]', { timeout: 5000 });
      
      // Fill in credentials
      await page.type('input[name="email"]', 'test@example.com');
      await page.type('input[name="password"]', 'test123');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Wait for dashboard
      await page.waitForSelector('text/Inner AI', { timeout: 10000 });
      logTest('Authentication works', true);
    } catch (error) {
      logTest('Authentication works', false, error.message);
    }

    // 3. Test Dashboard Elements
    console.log('\n📋 Testing Dashboard...');
    try {
      // Check for welcome message
      await page.waitForSelector('text/Olá Test User', { timeout: 5000 });
      logTest('Welcome message displays', true);
      
      // Check for templates
      const templates = await page.$$('.grid > div');
      logTest('Template cards load', templates.length >= 6);
      
      // Check for sidebar
      await page.waitForSelector('text/Analytics', { timeout: 5000 });
      logTest('Sidebar navigation present', true);
    } catch (error) {
      logTest('Dashboard elements', false, error.message);
    }

    // 4. Test Chat Functionality
    console.log('\n📋 Testing Chat...');
    try {
      // Type a message
      const chatInput = await page.$('input[placeholder*="Digite sua mensagem"]');
      await chatInput.type('Olá, como você está?');
      
      // Send message
      await page.click('text/Enviar');
      
      // Wait for response
      await page.waitForSelector('.animate-pulse', { timeout: 5000 });
      logTest('Chat message sends', true);
      
      // Wait for streaming response
      await page.waitForFunction(
        () => !document.querySelector('.animate-pulse'),
        { timeout: 30000 }
      );
      logTest('AI response received', true);
    } catch (error) {
      logTest('Chat functionality', false, error.message);
    }

    // 5. Test Templates
    console.log('\n📋 Testing Templates...');
    try {
      // Click templates button
      await page.click('text/Templates');
      await page.waitForSelector('text/Templates de Prompts', { timeout: 5000 });
      logTest('Template modal opens', true);
      
      // Check categories
      const categories = await page.$$('button:has-text("Marketing")');
      logTest('Template categories present', categories.length > 0);
      
      // Close modal
      await page.click('text/Fechar');
      await page.waitForTimeout(500);
    } catch (error) {
      logTest('Template system', false, error.message);
    }

    // 6. Test Analytics
    console.log('\n📋 Testing Analytics...');
    try {
      // Navigate to analytics
      await page.click('text/Analytics');
      await page.waitForSelector('text/Analytics', { timeout: 5000 });
      
      // Check for stats
      await page.waitForSelector('text/Uso Hoje', { timeout: 5000 });
      await page.waitForSelector('text/Este Mês', { timeout: 5000 });
      logTest('Analytics dashboard loads', true);
      
      // Check for usage data
      const usageElements = await page.$$('text/1');
      logTest('Usage data displays', usageElements.length > 0);
    } catch (error) {
      logTest('Analytics page', false, error.message);
    }

    // 7. Test Usage Limits
    console.log('\n📋 Testing Usage Limits...');
    try {
      // Go back to chat
      await page.click('text/Início');
      await page.waitForTimeout(1000);
      
      // Check usage indicator
      const usageText = await page.$eval('text/msg', el => el.textContent);
      logTest('Usage indicator present', usageText.includes('/10'));
    } catch (error) {
      logTest('Usage limits', false, error.message);
    }

    // Final results
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📋 Total: ${results.tests.length}`);
    
    if (results.failed === 0) {
      console.log('\n🎉 All tests passed! Inner AI Clone is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the errors above.');
    }

  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
  } finally {
    if (browser) {
      console.log('\n🔚 Closing browser...');
      await browser.close();
    }
  }
}

// Run tests
testInnerAI().catch(console.error);