const puppeteer = require('puppeteer');

async function fullSystemTest() {
  console.log('🧪 TESTE COMPLETO DO SISTEMA INNER AI CLONE\n');
  console.log('===========================================\n');
  
  let browser;
  let page;
  const results = {
    homepage: false,
    login: false,
    dashboard: false,
    chat: false,
    templates: false,
    analytics: false,
    usage: false,
    errors: []
  };
  
  try {
    // Inicializar navegador
    browser = await puppeteer.launch({
      headless: false, // Mostrar navegador para debug
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });
    
    page = await browser.newPage();
    
    // Capturar erros de console
    page.on('console', msg => {
      if (msg.type() === 'error') {
        results.errors.push(msg.text());
      }
    });
    
    // 1. TESTAR HOMEPAGE
    console.log('1️⃣ TESTANDO HOMEPAGE...');
    try {
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
      const title = await page.title();
      results.homepage = title.includes('Inner AI');
      console.log(`   ✅ Homepage carregada: ${title}`);
      await page.screenshot({ path: 'test-1-homepage.png' });
    } catch (error) {
      console.log(`   ❌ Erro na homepage: ${error.message}`);
    }
    
    // 2. TESTAR LOGIN
    console.log('\n2️⃣ TESTANDO SISTEMA DE LOGIN...');
    try {
      // Ir para página de login
      await page.goto('http://localhost:3000/auth/signin', { waitUntil: 'networkidle2' });
      
      // Aguardar formulário carregar
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      
      // Preencher credenciais
      await page.type('input[type="email"]', 'test@example.com', { delay: 50 });
      await page.type('input[type="password"]', 'test123', { delay: 50 });
      
      console.log('   ✅ Credenciais preenchidas');
      await page.screenshot({ path: 'test-2-login-form.png' });
      
      // Fazer login
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle2' }),
        page.click('button[type="submit"]')
      ]);
      
      const afterLoginUrl = page.url();
      results.login = afterLoginUrl.includes('dashboard');
      console.log(`   ✅ Login realizado, redirecionado para: ${afterLoginUrl}`);
      await page.screenshot({ path: 'test-3-after-login.png' });
      
    } catch (error) {
      console.log(`   ❌ Erro no login: ${error.message}`);
      await page.screenshot({ path: 'test-login-error.png' });
    }
    
    // 3. TESTAR DASHBOARD
    console.log('\n3️⃣ TESTANDO DASHBOARD...');
    if (results.login) {
      try {
        // Verificar elementos do dashboard
        await page.waitForSelector('textarea', { timeout: 5000 });
        results.dashboard = true;
        console.log('   ✅ Dashboard carregado com sucesso');
        
        // Verificar indicador de uso
        const usageIndicator = await page.$('.usage-indicator, [class*="usage"]');
        results.usage = !!usageIndicator;
        console.log(`   ${results.usage ? '✅' : '❌'} Indicador de uso: ${results.usage ? 'Presente' : 'Não encontrado'}`);
        
      } catch (error) {
        console.log(`   ❌ Erro no dashboard: ${error.message}`);
      }
    }
    
    // 4. TESTAR CHAT
    console.log('\n4️⃣ TESTANDO FUNCIONALIDADE DO CHAT...');
    if (results.dashboard) {
      try {
        // Enviar mensagem
        const chatInput = await page.$('textarea');
        if (chatInput) {
          await chatInput.type('Olá! Me diga o que é JavaScript em uma linha.', { delay: 30 });
          await page.screenshot({ path: 'test-4-chat-typed.png' });
          
          // Enviar
          await page.keyboard.press('Enter');
          console.log('   ⏳ Aguardando resposta da IA...');
          
          // Aguardar resposta (máximo 30 segundos)
          try {
            await page.waitForSelector('.message-assistant, [class*="assistant"]', { timeout: 30000 });
            results.chat = true;
            console.log('   ✅ Resposta da IA recebida!');
            await page.screenshot({ path: 'test-5-chat-response.png' });
          } catch (e) {
            console.log('   ⚠️  Timeout aguardando resposta da IA');
          }
        }
      } catch (error) {
        console.log(`   ❌ Erro no chat: ${error.message}`);
      }
    }
    
    // 5. TESTAR TEMPLATES
    console.log('\n5️⃣ TESTANDO SISTEMA DE TEMPLATES...');
    if (results.dashboard) {
      try {
        // Procurar botão de templates
        const templateButton = await page.$('button:has-text("Templates"), button:has-text("📝")');
        if (templateButton) {
          await templateButton.click();
          await page.waitForTimeout(1000);
          
          // Verificar se modal abriu
          const modal = await page.$('[role="dialog"], .modal, [class*="modal"]');
          results.templates = !!modal;
          console.log(`   ${results.templates ? '✅' : '❌'} Modal de templates: ${results.templates ? 'Aberto' : 'Não encontrado'}`);
          await page.screenshot({ path: 'test-6-templates.png' });
          
          // Fechar modal
          if (modal) {
            await page.keyboard.press('Escape');
          }
        } else {
          console.log('   ⚠️  Botão de templates não encontrado');
        }
      } catch (error) {
        console.log(`   ❌ Erro nos templates: ${error.message}`);
      }
    }
    
    // 6. TESTAR ANALYTICS
    console.log('\n6️⃣ TESTANDO PÁGINA DE ANALYTICS...');
    try {
      await page.goto('http://localhost:3000/analytics', { waitUntil: 'networkidle2' });
      
      // Verificar se carregou
      const analyticsTitle = await page.$('h1:has-text("Analytics"), h2:has-text("Analytics")');
      results.analytics = !!analyticsTitle;
      console.log(`   ${results.analytics ? '✅' : '❌'} Página de analytics: ${results.analytics ? 'Carregada' : 'Não encontrada'}`);
      await page.screenshot({ path: 'test-7-analytics.png' });
      
    } catch (error) {
      console.log(`   ❌ Erro no analytics: ${error.message}`);
    }
    
    // RELATÓRIO FINAL
    console.log('\n📊 RELATÓRIO FINAL DO TESTE');
    console.log('============================\n');
    
    const totalTests = Object.keys(results).filter(k => k !== 'errors').length;
    const passedTests = Object.values(results).filter(v => v === true).length;
    
    console.log('Funcionalidades testadas:');
    console.log(`  Homepage:    ${results.homepage ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`  Login:       ${results.login ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`  Dashboard:   ${results.dashboard ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`  Chat:        ${results.chat ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`  Templates:   ${results.templates ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`  Analytics:   ${results.analytics ? '✅ PASSOU' : '❌ FALHOU'}`);
    console.log(`  Usage:       ${results.usage ? '✅ PASSOU' : '❌ FALHOU'}`);
    
    console.log(`\n📈 Taxa de sucesso: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    
    if (results.errors.length > 0) {
      console.log('\n⚠️  Erros de console detectados:');
      results.errors.forEach(err => console.log(`  - ${err}`));
    }
    
    // RECOMENDAÇÕES
    console.log('\n💡 RECOMENDAÇÕES:');
    if (!results.chat) {
      console.log('  - Verificar configuração da API OpenAI');
      console.log('  - Confirmar que OPENAI_API_KEY está configurada');
    }
    if (!results.templates) {
      console.log('  - Verificar implementação do modal de templates');
    }
    if (!results.usage) {
      console.log('  - Implementar indicador visual de uso');
    }
    
    console.log('\n📸 Screenshots salvos: test-*.png');
    
  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO:', error.message);
  } finally {
    if (browser) {
      console.log('\n🔚 Fechando navegador em 5 segundos...');
      await page.waitForTimeout(5000);
      await browser.close();
    }
  }
}

// Executar teste
fullSystemTest();