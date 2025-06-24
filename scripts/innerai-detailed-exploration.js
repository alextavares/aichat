const puppeteer = require('puppeteer');

async function detailedExploration() {
  console.log('🔍 Explorando InnerAI em detalhes...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Ir para o dashboard
    console.log('1️⃣ Acessando dashboard...');
    await page.goto('https://app.innerai.com/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    
    // Verificar se tem modelo selecionado
    console.log('\n2️⃣ Verificando modelo de IA selecionado...');
    const selectedModel = await page.evaluate(() => {
      // Procurar por Gemini 2.5 Flash ou outros modelos
      const modelElement = document.querySelector('[aria-label*="Gemini"], [aria-label*="GPT"], [aria-label*="Claude"]');
      if (modelElement) return modelElement.textContent;
      
      // Procurar por texto que contenha o nome do modelo
      const allText = Array.from(document.querySelectorAll('*')).map(el => el.textContent);
      const modelText = allText.find(text => text && (text.includes('Gemini') || text.includes('GPT') || text.includes('Claude')));
      return modelText || 'Modelo não encontrado';
    });
    
    console.log(`   Modelo atual: ${selectedModel}`);
    
    // Clicar no seletor de modelo se possível
    console.log('\n3️⃣ Tentando abrir seletor de modelos...');
    const modelSelectorClicked = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('button, [role="button"], div[aria-label]'));
      const modelButton = elements.find(el => {
        const text = el.textContent || '';
        const aria = el.getAttribute('aria-label') || '';
        return text.includes('Gemini') || text.includes('Flash') || aria.includes('model') || aria.includes('Flash');
      });
      
      if (modelButton) {
        modelButton.click();
        return true;
      }
      return false;
    });
    
    if (modelSelectorClicked) {
      await new Promise(r => setTimeout(r, 2000));
      
      // Capturar lista de modelos disponíveis
      const availableModels = await page.evaluate(() => {
        const models = [];
        const modelElements = Array.from(document.querySelectorAll('[role="option"], [role="menuitem"], li'));
        
        modelElements.forEach(el => {
          const text = el.textContent.trim();
          if (text && (text.includes('GPT') || text.includes('Claude') || text.includes('Gemini') || text.includes('Llama'))) {
            models.push(text);
          }
        });
        
        return [...new Set(models)];
      });
      
      console.log('   Modelos disponíveis:', availableModels);
      
      // Fechar o menu
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // Procurar informações de conta/plano
    console.log('\n4️⃣ Procurando informações de conta...');
    
    // Tentar clicar no avatar/menu do usuário
    const userMenuClicked = await page.evaluate(() => {
      // Procurar por elementos que parecem ser avatar/menu
      const possibleMenus = Array.from(document.querySelectorAll('img, button, div[role="button"]'));
      
      for (const element of possibleMenus) {
        const src = element.src || '';
        const alt = element.alt || '';
        const aria = element.getAttribute('aria-label') || '';
        
        if (src.includes('avatar') || alt.includes('avatar') || aria.includes('menu') || aria.includes('account')) {
          element.click();
          return true;
        }
        
        // Procurar por elementos circulares que podem ser avatar
        const style = window.getComputedStyle(element);
        if (style.borderRadius === '50%' && element.tagName === 'IMG') {
          element.click();
          return true;
        }
      }
      
      return false;
    });
    
    if (userMenuClicked) {
      await new Promise(r => setTimeout(r, 2000));
      console.log('   ✅ Menu do usuário aberto');
      
      // Procurar por opção de conta/plano
      const accountOptionClicked = await page.evaluate(() => {
        const options = Array.from(document.querySelectorAll('a, button, [role="menuitem"]'));
        const accountOption = options.find(opt => {
          const text = opt.textContent || '';
          return text.match(/conta|account|plano|plan|subscription|assinatura|billing|faturamento/i);
        });
        
        if (accountOption) {
          accountOption.click();
          return true;
        }
        return false;
      });
      
      if (accountOptionClicked) {
        await new Promise(r => setTimeout(r, 3000));
        console.log('   ✅ Navegou para página de conta');
        
        // Capturar informações da página de conta
        const accountInfo = await page.evaluate(() => {
          const info = {};
          const bodyText = document.body.innerText;
          
          // Procurar plano atual
          const planMatch = bodyText.match(/Plano\s+(Lite|Pro|Enterprise|Free|Gratuito)/i);
          if (planMatch) info.currentPlan = planMatch[0];
          
          // Procurar limites
          const limitMatches = bodyText.match(/\d+\s*(mensagens|messages|tokens|créditos)/gi);
          if (limitMatches) info.limits = limitMatches;
          
          // Procurar preço
          const priceMatch = bodyText.match(/R\$\s*\d+[,.]?\d*/);
          if (priceMatch) info.price = priceMatch[0];
          
          // Procurar data de renovação
          const renewMatch = bodyText.match(/renova|renew|próximo pagamento|next payment/i);
          if (renewMatch) {
            const dateMatch = bodyText.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/);
            if (dateMatch) info.renewalDate = dateMatch[0];
          }
          
          return info;
        });
        
        console.log('\n📊 Informações da conta:', accountInfo);
        
        // Screenshot da página de conta
        await page.screenshot({ path: 'screenshots/innerai-account-page.png' });
        console.log('   ✅ Screenshot da página de conta salvo');
      }
    }
    
    // Voltar para o dashboard e testar funcionalidades
    console.log('\n5️⃣ Testando funcionalidades...');
    await page.goto('https://app.innerai.com/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    
    // Verificar se há limite de uso visível
    const usageLimits = await page.evaluate(() => {
      const limits = {};
      
      // Procurar por elementos que mostrem uso/limite
      const usageElements = Array.from(document.querySelectorAll('*'));
      
      usageElements.forEach(el => {
        const text = el.textContent || '';
        
        // Procurar padrões como "X/Y mensagens" ou "X de Y"
        const usageMatch = text.match(/(\d+)\s*\/\s*(\d+)/);
        if (usageMatch && text.match(/mensagem|message|token|crédito/i)) {
          limits.used = usageMatch[1];
          limits.total = usageMatch[2];
          limits.type = text;
        }
      });
      
      return limits;
    });
    
    if (usageLimits.type) {
      console.log('   Limites de uso encontrados:', usageLimits);
    }
    
    // Resumo final
    console.log('\n📊 RESUMO DA INVESTIGAÇÃO INNERAI:');
    console.log('=====================================');
    console.log('🎯 Planos disponíveis:');
    console.log('   - Lite: R$ 39,90/mês');
    console.log('   - Pro: R$ 79,90/mês (Mais Popular)');
    console.log('   - Desconto de 60% no plano anual');
    console.log('   - Garantia de 7 dias');
    console.log('\n🤖 Modelo padrão:', selectedModel);
    console.log('\n📱 Funcionalidades observadas:');
    console.log('   - Image Generation');
    console.log('   - Transcribe Video');
    console.log('   - Text Translation');
    console.log('   - Generate Video Based on Image');
    console.log('   - Image Editing');
    
    console.log('\n⏸️  Navegador permanece aberto para exploração manual...');
    console.log('   Pressione Ctrl+C quando terminar.');
    
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Erro:', error);
    await page.screenshot({ path: 'screenshots/innerai-error-detail.png' });
  }
}

detailedExploration().catch(console.error);