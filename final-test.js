const puppeteer = require('puppeteer');

async function finalTest() {
  console.log('🧪 Teste Final do Inner AI Clone\n');
  
  let browser;
  let page;
  
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    page = await browser.newPage();
    
    // 1. Homepage
    console.log('1️⃣ Testando Homepage...');
    await page.goto('http://localhost:3000');
    const title = await page.title();
    console.log(`   ✅ Título: ${title}`);
    await page.screenshot({ path: 'test-1-home.png' });
    
    // 2. Ir para login
    console.log('\n2️⃣ Navegando para Login...');
    await page.goto('http://localhost:3000/auth/signin');
    await page.screenshot({ path: 'test-2-login.png' });
    
    // Aguardar página carregar
    await new Promise(r => setTimeout(r, 2000));
    
    // 3. Preencher login
    console.log('\n3️⃣ Preenchendo formulário...');
    try {
      // Tentar preencher email
      const emailInput = await page.$('input[type="email"]');
      if (emailInput) {
        await emailInput.type('test@example.com');
        console.log('   ✅ Email preenchido');
      }
      
      // Tentar preencher senha
      const passwordInput = await page.$('input[type="password"]');
      if (passwordInput) {
        await passwordInput.type('test123');
        console.log('   ✅ Senha preenchida');
      }
      
      await page.screenshot({ path: 'test-3-filled.png' });
      
      // Submeter
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        console.log('   ✅ Formulário enviado');
      }
      
      // Aguardar resposta
      await new Promise(r => setTimeout(r, 3000));
      
      const currentUrl = page.url();
      console.log(`   📍 URL atual: ${currentUrl}`);
      await page.screenshot({ path: 'test-4-result.png' });
      
    } catch (error) {
      console.log('   ❌ Erro no login:', error.message);
    }
    
    console.log('\n✅ Teste concluído!');
    console.log('📸 Screenshots salvos como test-*.png');
    
  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

finalTest();