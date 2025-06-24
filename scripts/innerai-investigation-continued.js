const puppeteer = require('puppeteer');

async function investigateInnerAI() {
  console.log('🔍 Continuando investigação do InnerAI...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Passo 1: Acessar página de login
    console.log('1️⃣ Acessando página de login...');
    await page.goto('https://innerai.com.br/auth/signin', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Preencher credenciais
    console.log('2️⃣ Preenchendo credenciais...');
    await page.type('input[type="email"]', 'alexandretmoraescpa@gmail.com');
    await page.waitForTimeout(1000);
    await page.type('input[type="password"]', 'Y*mare2025');
    await page.waitForTimeout(1000);
    
    // Fazer login
    console.log('3️⃣ Fazendo login...');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    console.log('4️⃣ Aguardando carregamento do dashboard...');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Capturar URL atual
    const currentUrl = page.url();
    console.log(`   URL atual: ${currentUrl}`);
    
    // Tirar screenshot do dashboard
    await page.screenshot({ path: 'screenshots/innerai-dashboard.png' });
    console.log('   ✅ Screenshot do dashboard salvo');
    
    // Procurar informações sobre o plano atual
    console.log('\n5️⃣ Procurando informações do plano...');
    
    // Tentar encontrar menu de conta ou configurações
    const possibleSelectors = [
      'button[aria-label*="conta"]',
      'button[aria-label*="menu"]',
      'button[aria-label*="perfil"]',
      'button[aria-label*="config"]',
      '[data-testid="user-menu"]',
      '[class*="user-menu"]',
      '[class*="profile"]',
      '[class*="avatar"]',
      'img[alt*="avatar"]',
      'img[alt*="profile"]',
      'button:has(img[src*="avatar"])',
      'button:has(svg)',
      '[role="button"]:has(img)',
      '.MuiAvatar-root'
    ];
    
    let menuFound = false;
    for (const selector of possibleSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`   Encontrado elemento com selector: ${selector}`);
          await element.click();
          await page.waitForTimeout(2000);
          menuFound = true;
          break;
        }
      } catch (e) {
        // Continue tentando outros seletores
      }
    }
    
    if (menuFound) {
      // Procurar opção de plano/assinatura
      const planSelectors = [
        'a[href*="subscription"]',
        'a[href*="plano"]',
        'a[href*="assinatura"]',
        'a[href*="billing"]',
        'button:has-text("Plano")',
        'button:has-text("Assinatura")',
        '[role="menuitem"]:has-text("Plano")',
        '[role="menuitem"]:has-text("Assinatura")'
      ];
      
      for (const selector of planSelectors) {
        try {
          await page.evaluate((sel) => {
            const links = Array.from(document.querySelectorAll('a, button, [role="menuitem"]'));
            const link = links.find(el => 
              el.textContent.toLowerCase().includes('plano') ||
              el.textContent.toLowerCase().includes('assinatura') ||
              el.textContent.toLowerCase().includes('subscription') ||
              el.textContent.toLowerCase().includes('billing') ||
              (el.href && (el.href.includes('subscription') || el.href.includes('plano')))
            );
            if (link) link.click();
          });
          
          await page.waitForTimeout(3000);
          break;
        } catch (e) {
          // Continue
        }
      }
    }
    
    // Capturar informações visíveis na página
    console.log('\n6️⃣ Extraindo informações da página...');
    
    const pageContent = await page.evaluate(() => {
      const texts = [];
      
      // Procurar por textos relacionados a plano
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const text = el.textContent.trim();
        if (text && (
          text.includes('Plano') ||
          text.includes('plano') ||
          text.includes('Lite') ||
          text.includes('Pro') ||
          text.includes('limite') ||
          text.includes('tokens') ||
          text.includes('mensagens') ||
          text.includes('créditos')
        )) {
          texts.push(text);
        }
      });
      
      return [...new Set(texts)].slice(0, 20); // Primeiros 20 textos únicos
    });
    
    console.log('\n📋 Textos encontrados relacionados a planos:');
    pageContent.forEach(text => {
      if (text.length < 200) { // Filtrar textos muito longos
        console.log(`   - ${text}`);
      }
    });
    
    // Navegar para página de preços se possível
    console.log('\n7️⃣ Tentando acessar página de preços...');
    await page.goto('https://innerai.com.br/pricing', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(3000);
    
    // Extrair detalhes dos planos
    const planDetails = await page.evaluate(() => {
      const plans = [];
      
      // Procurar cards de planos
      const planCards = document.querySelectorAll('[class*="plan"], [class*="pricing"], [class*="card"]');
      
      planCards.forEach(card => {
        const planInfo = {
          name: '',
          price: '',
          features: []
        };
        
        // Nome do plano
        const nameEl = card.querySelector('h2, h3, [class*="title"]');
        if (nameEl) planInfo.name = nameEl.textContent.trim();
        
        // Preço
        const priceEl = card.querySelector('[class*="price"], [class*="valor"]');
        if (priceEl) planInfo.price = priceEl.textContent.trim();
        
        // Features
        const features = card.querySelectorAll('li, [class*="feature"]');
        features.forEach(feat => {
          const text = feat.textContent.trim();
          if (text) planInfo.features.push(text);
        });
        
        if (planInfo.name || planInfo.price) {
          plans.push(planInfo);
        }
      });
      
      return plans;
    });
    
    if (planDetails.length > 0) {
      console.log('\n📊 Detalhes dos planos encontrados:');
      planDetails.forEach(plan => {
        console.log(`\n   ${plan.name}`);
        console.log(`   Preço: ${plan.price}`);
        console.log('   Recursos:');
        plan.features.forEach(feat => console.log(`     - ${feat}`));
      });
    }
    
    // Screenshot final
    await page.screenshot({ path: 'screenshots/innerai-pricing-details.png' });
    console.log('\n✅ Screenshot dos detalhes salvo');
    
    console.log('\n⏸️  Navegador permanecerá aberto para inspeção manual...');
    console.log('   Pressione Ctrl+C quando terminar de explorar.');
    
    // Manter navegador aberto
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Erro:', error);
    await page.screenshot({ path: 'screenshots/innerai-error.png' });
  }
}

investigateInnerAI().catch(console.error);