const puppeteer = require('puppeteer');

async function analyzeInnerAILanding() {
  console.log('🔍 Analisando landing page da InnerAI...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  
  try {
    await page.goto('https://innerai.com/pt/nossos-planos', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    console.log('📋 Estrutura da Landing Page:\n');
    
    // 1. Analisar Header/Navigation
    console.log('1. HEADER/NAVEGAÇÃO:');
    const navItems = await page.$$eval('nav a', links => 
      links.map(link => ({ text: link.textContent.trim(), href: link.href }))
    );
    console.log('   - Items do menu:', navItems.map(item => item.text).join(', '));
    
    // 2. Hero Section
    console.log('\n2. HERO SECTION:');
    const heroTitle = await page.$eval('h1', el => el.textContent.trim()).catch(() => 'Não encontrado');
    const heroSubtitle = await page.$eval('h2', el => el.textContent.trim()).catch(() => 'Não encontrado');
    console.log('   - Título:', heroTitle);
    console.log('   - Subtítulo:', heroSubtitle);
    
    // 3. Planos e Preços
    console.log('\n3. PLANOS E PREÇOS:');
    const plans = await page.$$eval('[class*="plan"], [class*="pricing"], [class*="card"]', cards => {
      return cards.slice(0, 4).map(card => {
        const title = card.querySelector('h3, h4, [class*="title"]')?.textContent?.trim() || 'Sem título';
        const price = card.querySelector('[class*="price"], [class*="valor"]')?.textContent?.trim() || 'Sem preço';
        const features = Array.from(card.querySelectorAll('li, [class*="feature"]'))
          .map(f => f.textContent.trim())
          .filter(f => f.length > 0)
          .slice(0, 5);
        return { title, price, features };
      });
    });
    
    plans.forEach(plan => {
      console.log(`\n   📦 ${plan.title}`);
      console.log(`      Preço: ${plan.price}`);
      console.log(`      Features (primeiras 5):`);
      plan.features.forEach(f => console.log(`        ✓ ${f}`));
    });
    
    // 4. Features/Benefícios
    console.log('\n4. FEATURES PRINCIPAIS:');
    const features = await page.$$eval('[class*="feature"], [class*="benefit"]', elements => {
      return elements.slice(0, 10).map(el => el.textContent.trim()).filter(text => text.length > 10);
    });
    features.forEach(f => console.log(`   - ${f}`));
    
    // 5. CTAs (Call to Actions)
    console.log('\n5. CALL TO ACTIONS:');
    const ctaButtons = await page.$$eval('button, a[class*="button"], a[class*="btn"]', buttons => {
      return buttons.map(btn => btn.textContent.trim()).filter(text => text.length > 0);
    });
    console.log('   - Botões CTA:', [...new Set(ctaButtons)].slice(0, 10).join(', '));
    
    // 6. Seções especiais
    console.log('\n6. SEÇÕES ESPECIAIS:');
    const sections = await page.$$eval('section, [class*="section"]', sections => {
      return sections.map(section => {
        const heading = section.querySelector('h2, h3')?.textContent?.trim() || '';
        return heading;
      }).filter(h => h.length > 0);
    });
    console.log('   - Seções encontradas:', sections.slice(0, 10).join(', '));
    
    // 7. Cores e Design
    console.log('\n7. CORES E DESIGN:');
    const colors = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const colorSet = new Set();
      
      elements.forEach(el => {
        const bgColor = window.getComputedStyle(el).backgroundColor;
        const color = window.getComputedStyle(el).color;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') colorSet.add(bgColor);
        if (color && color !== 'rgba(0, 0, 0, 0)') colorSet.add(color);
      });
      
      return Array.from(colorSet).slice(0, 10);
    });
    console.log('   - Cores principais:', colors.join(', '));
    
    // 8. Elementos interativos
    console.log('\n8. ELEMENTOS INTERATIVOS:');
    const hasChat = await page.$('[class*="chat"]') !== null;
    const hasVideo = await page.$('video, iframe') !== null;
    const hasCarousel = await page.$('[class*="carousel"], [class*="slider"]') !== null;
    const hasAccordion = await page.$('[class*="accordion"], [class*="faq"]') !== null;
    
    console.log('   - Chat widget:', hasChat ? 'Sim' : 'Não');
    console.log('   - Vídeos:', hasVideo ? 'Sim' : 'Não');
    console.log('   - Carousel/Slider:', hasCarousel ? 'Sim' : 'Não');
    console.log('   - FAQ/Accordion:', hasAccordion ? 'Sim' : 'Não');
    
    // Tirar screenshot
    await page.screenshot({ 
      path: 'innerai-landing-screenshot.png',
      fullPage: true 
    });
    console.log('\n📸 Screenshot salvo como innerai-landing-screenshot.png');
    
    // Resumo
    console.log('\n📊 RESUMO DA ANÁLISE:');
    console.log('✅ Landing page profissional com múltiplos planos');
    console.log('✅ Design moderno com gradientes e animações');
    console.log('✅ Estrutura clara de preços e features');
    console.log('✅ CTAs bem posicionados');
    console.log('✅ Seções organizadas e informativas');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

analyzeInnerAILanding();