const puppeteer = require('puppeteer');

async function testCompleteFlow() {
  console.log('🚀 Iniciando teste completo do Inner AI Clone...\n');
  
  let browser;
  try {
    // Configurar Puppeteer
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // 1. Testar Homepage
    console.log('1️⃣ Testando Homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'test-homepage.png' });
    
    const title = await page.title();
    console.log(`   ✅ Título: ${title}`);
    
    // Verificar botões
    const loginButton = await page.$('a[href="/auth/signin"]');
    console.log(`   ✅ Botão Login: ${loginButton ? 'Encontrado' : 'Não encontrado'}`);
    
    // 2. Testar Página de Login
    console.log('\n2️⃣ Testando Login...');
    await page.click('a[href="/auth/signin"]');
    await page.waitForNavigation();
    await page.screenshot({ path: 'test-login.png' });
    
    // Preencher formulário
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'test123');
    await page.screenshot({ path: 'test-login-filled.png' });
    
    // Fazer login
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    console.log(`   ✅ URL após login: ${currentUrl}`);
    await page.screenshot({ path: 'test-after-login.png' });
    
    // 3. Testar Dashboard
    if (currentUrl.includes('dashboard')) {
      console.log('\n3️⃣ Testando Dashboard...');
      
      // Verificar elementos
      const chatInput = await page.$('textarea[placeholder*="Type your message"]');
      console.log(`   ✅ Chat input: ${chatInput ? 'Encontrado' : 'Não encontrado'}`);
      
      // Testar envio de mensagem
      if (chatInput) {
        console.log('\n4️⃣ Testando Chat...');
        await page.type('textarea[placeholder*="Type your message"]', 'Hello, AI! Can you help me?');
        await page.screenshot({ path: 'test-chat-typed.png' });
        
        // Enviar mensagem
        await page.keyboard.press('Enter');
        
        // Aguardar resposta
        console.log('   ⏳ Aguardando resposta da IA...');
        await page.waitForTimeout(5000);
        await page.screenshot({ path: 'test-chat-response.png' });
        
        // Verificar resposta
        const messages = await page.$$('.message-assistant');
        console.log(`   ✅ Respostas da IA: ${messages.length}`);
      }
      
      // 5. Testar Templates
      console.log('\n5️⃣ Testando Templates...');
      const templateButton = await page.$('button:has-text("Templates")');
      if (templateButton) {
        await templateButton.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-templates.png' });
        console.log('   ✅ Modal de templates aberto');
        
        // Fechar modal
        await page.keyboard.press('Escape');
      }
      
      // 6. Testar Analytics
      console.log('\n6️⃣ Testando Analytics...');
      const analyticsLink = await page.$('a[href="/analytics"]');
      if (analyticsLink) {
        await analyticsLink.click();
        await page.waitForNavigation();
        await page.screenshot({ path: 'test-analytics.png' });
        console.log('   ✅ Página de analytics carregada');
      }
    }
    
    console.log('\n✅ Teste completo finalizado!');
    console.log('📸 Screenshots salvos no diretório atual');
    
  } catch (error) {
    console.error('\n❌ Erro durante teste:', error.message);
    await page.screenshot({ path: 'test-error.png' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Executar teste
testCompleteFlow();