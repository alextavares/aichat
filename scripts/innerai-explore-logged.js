const puppeteer = require('puppeteer');

async function exploreInnerAI() {
  console.log('🔍 Explorando InnerAI (já logado)...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Acessar dashboard
    console.log('1️⃣ Acessando dashboard...');
    await page.goto('https://app.innerai.com/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    
    // Screenshot do dashboard
    await page.screenshot({ path: 'screenshots/innerai-dashboard-logged.png' });
    console.log('✅ Screenshot do dashboard salvo');
    
    // Procurar informações sobre plano/limites
    console.log('\n2️⃣ Extraindo informações do dashboard...');
    
    const dashboardInfo = await page.evaluate(() => {
      const info = {};
      
      // Procurar por elementos que contenham informações de plano
      const allText = document.body.innerText;
      
      // Regex para encontrar informações relevantes
      const planMatch = allText.match(/Plano\s*([\w\s]+)/i);
      const tokensMatch = allText.match(/(\d+[\.,]?\d*)\s*(?:tokens|créditos)/i);
      const messagesMatch = allText.match(/(\d+)\s*(?:mensagens|messages)/i);
      
      if (planMatch) info.plan = planMatch[1].trim();
      if (tokensMatch) info.tokens = tokensMatch[1];
      if (messagesMatch) info.messages = messagesMatch[1];
      
      // Procurar elementos específicos
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        const text = el.textContent.trim();
        if (text.includes('Lite') || text.includes('Pro') || text.includes('Enterprise')) {
          info.planType = text;
        }
        if (text.includes('limite') || text.includes('limit')) {
          info.limits = text;
        }
      });
      
      return info;
    });
    
    console.log('📊 Informações encontradas:', dashboardInfo);
    
    // Tentar acessar configurações/conta
    console.log('\n3️⃣ Procurando menu de configurações...');
    
    // Clicar em possíveis menus
    const clicked = await page.evaluate(() => {
      // Procurar por ícones/botões de menu
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      const menuButton = buttons.find(btn => {
        const aria = btn.getAttribute('aria-label') || '';
        const text = btn.textContent || '';
        return aria.includes('menu') || aria.includes('config') || 
               text.includes('⚙') || btn.querySelector('svg');
      });
      
      if (menuButton) {
        menuButton.click();
        return true;
      }
      return false;
    });
    
    if (clicked) {
      await new Promise(r => setTimeout(r, 2000));
      console.log('✅ Menu clicado');
      
      // Procurar opção de plano/assinatura
      const planClicked = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a, button, [role="menuitem"]'));
        const planLink = links.find(link => {
          const text = link.textContent || '';
          const href = link.href || '';
          return text.match(/plano|assinatura|subscription|billing|conta/i) ||
                 href.includes('subscription') || href.includes('billing');
        });
        
        if (planLink) {
          planLink.click();
          return true;
        }
        return false;
      });
      
      if (planClicked) {
        await new Promise(r => setTimeout(r, 3000));
        console.log('✅ Navegou para página de plano');
        
        // Screenshot da página de plano
        await page.screenshot({ path: 'screenshots/innerai-plan-page.png' });
        console.log('✅ Screenshot da página de plano salvo');
        
        // Extrair detalhes do plano
        const planDetails = await page.evaluate(() => {
          const details = {};
          const bodyText = document.body.innerText;
          
          // Procurar informações específicas
          const priceMatch = bodyText.match(/R\$\s*(\d+[,.]?\d*)/);
          const planNameMatch = bodyText.match(/Plano\s*(Lite|Pro|Enterprise)/i);
          const limitMatches = bodyText.match(/\d+\s*(?:mensagens|tokens|créditos)/gi);
          
          if (priceMatch) details.price = priceMatch[0];
          if (planNameMatch) details.planName = planNameMatch[0];
          if (limitMatches) details.limits = limitMatches;
          
          // Procurar lista de features
          const lists = Array.from(document.querySelectorAll('ul, ol'));
          const features = [];
          
          lists.forEach(list => {
            const items = Array.from(list.querySelectorAll('li'));
            items.forEach(item => {
              const text = item.textContent.trim();
              if (text.length > 5 && text.length < 200) {
                features.push(text);
              }
            });
          });
          
          if (features.length > 0) details.features = features;
          
          return details;
        });
        
        console.log('\n📋 Detalhes do plano:', planDetails);
      }
    }
    
    // Navegar para histórico de conversas
    console.log('\n4️⃣ Procurando histórico/conversas...');
    await page.goto('https://app.innerai.com/chat', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    
    await page.screenshot({ path: 'screenshots/innerai-chat-page.png' });
    console.log('✅ Screenshot da página de chat salvo');
    
    // Verificar modelos disponíveis
    const models = await page.evaluate(() => {
      const modelElements = Array.from(document.querySelectorAll('*'));
      const foundModels = [];
      
      modelElements.forEach(el => {
        const text = el.textContent || '';
        if (text.match(/GPT|Claude|Gemini|Llama/i) && text.length < 100) {
          foundModels.push(text.trim());
        }
      });
      
      return [...new Set(foundModels)];
    });
    
    console.log('\n🤖 Modelos encontrados:', models);
    
    // Resumo final
    console.log('\n📊 RESUMO DA INVESTIGAÇÃO:');
    console.log('========================');
    console.log('Dashboard Info:', dashboardInfo);
    console.log('Modelos:', models);
    
    console.log('\n⏸️  Mantendo navegador aberto...');
    console.log('   Explore manualmente e pressione Ctrl+C quando terminar.');
    
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Erro:', error);
    await page.screenshot({ path: 'screenshots/innerai-error.png' });
  }
}

exploreInnerAI().catch(console.error);