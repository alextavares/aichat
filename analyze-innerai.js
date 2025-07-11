const puppeteer = require('puppeteer');
const fs = require('fs');

async function analyzeInnerAI() {
  let browser;
  try {
    console.log('🚀 Starting browser...');
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/home/alext/.cache/puppeteer/chrome/linux-138.0.7204.49/chrome-linux64/chrome',
      defaultViewport: { width: 1400, height: 900 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    console.log('📱 Navigating to https://app.innerai.com/...');
    await page.goto('https://app.innerai.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    // Wait a bit for dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'innerai-analysis.png', 
      fullPage: true 
    });

    console.log('🔍 Analyzing page structure...');
    
    const analysis = await page.evaluate(() => {
      const results = {
        title: document.title,
        url: window.location.href,
        layout: {},
        navigation: {},
        cards: [],
        tools: [],
        chatSystem: {},
        usageSystem: {},
        visualElements: {},
        features: []
      };

      // Analyze main layout structure
      const sidebar = document.querySelector('[class*="sidebar"], [class*="menu"], nav, aside');
      if (sidebar) {
        results.layout.sidebar = {
          exists: true,
          classes: sidebar.className,
          width: getComputedStyle(sidebar).width,
          backgroundColor: getComputedStyle(sidebar).backgroundColor
        };
      }

      const header = document.querySelector('header, [class*="header"], [class*="navbar"]');
      if (header) {
        results.layout.header = {
          exists: true,
          classes: header.className,
          height: getComputedStyle(header).height,
          backgroundColor: getComputedStyle(header).backgroundColor
        };
      }

      // Analyze navigation elements
      const navItems = document.querySelectorAll('nav a, [class*="nav"] a, [class*="menu"] a');
      results.navigation.items = Array.from(navItems).map(item => ({
        text: item.textContent.trim(),
        href: item.href,
        classes: item.className
      }));

      // Analyze cards
      const cards = document.querySelectorAll('[class*="card"], [class*="panel"], [class*="widget"]');
      results.cards = Array.from(cards).slice(0, 10).map(card => ({
        text: card.textContent.trim().substring(0, 100),
        classes: card.className,
        backgroundColor: getComputedStyle(card).backgroundColor,
        borderRadius: getComputedStyle(card).borderRadius,
        boxShadow: getComputedStyle(card).boxShadow
      }));

      // Look for chat elements
      const chatContainer = document.querySelector('[class*="chat"], [class*="message"], [class*="conversation"]');
      if (chatContainer) {
        results.chatSystem = {
          exists: true,
          classes: chatContainer.className,
          text: chatContainer.textContent.trim().substring(0, 200)
        };
      }

      // Look for usage/credit indicators
      const usageElements = document.querySelectorAll('[class*="credit"], [class*="usage"], [class*="balance"], [class*="coin"], [class*="token"]');
      results.usageSystem.elements = Array.from(usageElements).map(el => ({
        text: el.textContent.trim(),
        classes: el.className
      }));

      // Analyze color scheme
      const bodyStyles = getComputedStyle(document.body);
      results.visualElements.colorScheme = {
        backgroundColor: bodyStyles.backgroundColor,
        color: bodyStyles.color,
        fontFamily: bodyStyles.fontFamily,
        fontSize: bodyStyles.fontSize
      };

      // Look for buttons and interactive elements
      const buttons = document.querySelectorAll('button, [class*="btn"]');
      results.visualElements.buttons = Array.from(buttons).slice(0, 5).map(btn => ({
        text: btn.textContent.trim(),
        classes: btn.className,
        backgroundColor: getComputedStyle(btn).backgroundColor,
        borderRadius: getComputedStyle(btn).borderRadius
      }));

      // Look for tools/features
      const toolElements = document.querySelectorAll('[class*="tool"], [class*="feature"], [class*="option"]');
      results.tools = Array.from(toolElements).slice(0, 10).map(tool => ({
        text: tool.textContent.trim().substring(0, 50),
        classes: tool.className
      }));

      return results;
    });

    console.log('💾 Saving analysis results...');
    fs.writeFileSync('innerai-analysis.json', JSON.stringify(analysis, null, 2));

    console.log('✅ Analysis complete! Results saved to:');
    console.log('- Screenshot: innerai-analysis.png');
    console.log('- Analysis: innerai-analysis.json');

    // Print summary
    console.log('\n📋 QUICK SUMMARY:');
    console.log(`Title: ${analysis.title}`);
    console.log(`Navigation items: ${analysis.navigation.items.length}`);
    console.log(`Cards found: ${analysis.cards.length}`);
    console.log(`Tools found: ${analysis.tools.length}`);
    console.log(`Chat system: ${analysis.chatSystem.exists ? 'Found' : 'Not found'}`);
    console.log(`Usage indicators: ${analysis.usageSystem.elements.length}`);

  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

analyzeInnerAI();