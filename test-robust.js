const puppeteer = require('puppeteer');

async function robustTest() {
  console.log('🧪 Teste Robusto do Inner AI Clone\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // 1. Verificar Homepage
    console.log('1️⃣ Verificando Homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    const homeTitle = await page.title();
    console.log(`   Título: ${homeTitle}`);
    
    // Salvar screenshot
    await page.screenshot({ path: 'home.png' });
    console.log('   📸 Screenshot: home.png\n');
    
    // 2. Navegar para Login
    console.log('2️⃣ Navegando para Login...');
    
    // Tentar diferentes seletores
    const loginSelectors = [
      'a[href="/auth/signin"]',
      'button:has-text("Entrar")',
      'button:has-text("Sign in")',
      'a:has-text("Entrar")'
    ];
    
    let loginClicked = false;
    for (const selector of loginSelectors) {
      try {
        await page.click(selector);
        loginClicked = true;
        console.log(`   ✅ Clicou em: ${selector}`);
        break;
      } catch (e) {
        // Continuar tentando
      }
    }
    
    if (!loginClicked) {
      // Navegar diretamente
      await page.goto('http://localhost:3000/auth/signin');
      console.log('   📍 Navegação direta para /auth/signin');
    }
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'login.png' });
    console.log('   📸 Screenshot: login.png\n');
    
    // 3. Tentar fazer login
    console.log('3️⃣ Tentando fazer login...');
    
    // Debug: listar todos os inputs
    const inputs = await page.$$eval('input', elements => 
      elements.map(el => ({
        type: el.type,
        name: el.name,
        id: el.id,
        placeholder: el.placeholder
      }))
    );
    console.log('   Inputs encontrados:', inputs);
    
    // Tentar diferentes seletores para email
    const emailSelectors = [
      'input[name="email"]',
      'input[type="email"]',
      'input[id="email"]',
      'input[placeholder*="email"]'
    ];
    
    let emailFilled = false;
    for (const selector of emailSelectors) {
      try {
        await page.type(selector, 'test@example.com');
        emailFilled = true;
        console.log(`   ✅ Email preenchido com: ${selector}`);
        break;
      } catch (e) {
        // Continuar tentando
      }
    }
    
    // Tentar diferentes seletores para senha
    const passwordSelectors = [
      'input[name="password"]',
      'input[type="password"]',
      'input[id="password"]',
      'input[placeholder*="senha"]',
      'input[placeholder*="password"]'
    ];
    
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        await page.type(selector, 'test123');
        passwordFilled = true;
        console.log(`   ✅ Senha preenchida com: ${selector}`);
        break;
      } catch (e) {
        // Continuar tentando
      }
    }
    
    await page.screenshot({ path: 'login-filled.png' });
    console.log('   📸 Screenshot: login-filled.png\n');
    
    if (emailFilled && passwordFilled) {
      // Tentar submit
      console.log('4️⃣ Submetendo formulário...');
      
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Entrar")',
        'button:has-text("Login")',
        'button:has-text("Sign in")'
      ];
      
      for (const selector of submitSelectors) {
        try {
          await page.click(selector);
          console.log(`   ✅ Clicou em: ${selector}`);
          break;
        } catch (e) {
          // Continuar tentando
        }
      }
      
      // Aguardar navegação
      await page.waitForTimeout(3000);
      const afterLoginUrl = page.url();
      console.log(`   📍 URL após login: ${afterLoginUrl}`);
      
      await page.screenshot({ path: 'after-login.png' });
      console.log('   📸 Screenshot: after-login.png\n');
      
      // Verificar se chegou ao dashboard
      if (afterLoginUrl.includes('dashboard')) {
        console.log('5️⃣ Dashboard carregado!');
        
        // Verificar elementos do dashboard
        const elements = {
          chat: await page.$('textarea'),
          templates: await page.$('button:has-text("Templates")'),
          analytics: await page.$('a[href="/analytics"]')
        };
        
        console.log(`   Chat: ${elements.chat ? '✅' : '❌'}`);
        console.log(`   Templates: ${elements.templates ? '✅' : '❌'}`);
        console.log(`   Analytics: ${elements.analytics ? '✅' : '❌'}`);
      }
    }
    
    console.log('\n📊 Teste concluído!');
    console.log('Verifique os screenshots gerados para análise visual.');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    await page.screenshot({ path: 'error.png' });
  } finally {
    await browser.close();
  }
}

robustTest();