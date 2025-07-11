const puppeteer = require('puppeteer');
const fs = require('fs');

async function analyzePricingSystem() {
  let browser;
  try {
    console.log('🚀 Starting browser to analyze pricing/token system...');
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/home/alext/.cache/puppeteer/chrome/linux-138.0.7204.49/chrome-linux64/chrome',
      defaultViewport: { width: 1400, height: 900 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    // First check the main site for pricing
    console.log('📱 Navigating to InnerAI pricing page...');
    await page.goto('https://innerai.com/pt/nossos-planos', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📸 Taking screenshot of pricing page...');
    await page.screenshot({ 
      path: 'innerai-pricing.png', 
      fullPage: true 
    });

    console.log('🔍 Analyzing pricing structure...');
    
    const pricingAnalysis = await page.evaluate(() => {
      const results = {
        plans: [],
        features: [],
        tokens: [],
        limits: [],
        pricing: []
      };

      // Look for pricing plans
      const planElements = document.querySelectorAll('[class*="plan"], [class*="price"], [class*="tier"]');
      planElements.forEach(el => {
        if (el.textContent && el.textContent.trim().length > 0) {
          results.plans.push({
            text: el.textContent.trim(),
            className: String(el.className || ''),
            tagName: el.tagName
          });
        }
      });

      // Look for feature lists
      const featureElements = document.querySelectorAll('li, [class*="feature"], [class*="benefit"]');
      featureElements.forEach(el => {
        const text = el.textContent ? el.textContent.trim() : '';
        if (text && text.length > 10 && text.length < 200) {
          // Look for token/credit mentions
          if (text.toLowerCase().includes('token') || 
              text.toLowerCase().includes('credit') || 
              text.toLowerCase().includes('request') ||
              text.toLowerCase().includes('message') ||
              text.toLowerCase().includes('uso') ||
              text.toLowerCase().includes('limite')) {
            results.features.push({
              text: text,
              className: String(el.className || ''),
              type: 'usage-related'
            });
          } else {
            results.features.push({
              text: text,
              className: String(el.className || ''),
              type: 'general'
            });
          }
        }
      });

      // Look for numbers that might indicate limits
      const numberPattern = /\d+/g;
      const textContent = document.body.textContent || '';
      const numbers = textContent.match(numberPattern);
      if (numbers) {
        numbers.forEach(num => {
          if (parseInt(num) > 10 && parseInt(num) < 1000000) {
            results.limits.push({
              number: num,
              context: 'Found in page content'
            });
          }
        });
      }

      return results;
    });

    console.log('📱 Now checking platform login page...');
    await page.goto('https://platform.innerai.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📸 Taking screenshot of platform page...');
    await page.screenshot({ 
      path: 'innerai-platform.png', 
      fullPage: true 
    });

    const platformAnalysis = await page.evaluate(() => {
      const results = {
        authElements: [],
        pricingMentions: [],
        usageIndicators: []
      };

      // Look for authentication and usage elements
      const allText = document.body.textContent || '';
      
      if (allText.toLowerCase().includes('credit') || 
          allText.toLowerCase().includes('token') ||
          allText.toLowerCase().includes('usage') ||
          allText.toLowerCase().includes('limit')) {
        
        const elements = document.querySelectorAll('*');
        elements.forEach(el => {
          const text = el.textContent ? el.textContent.trim() : '';
          if (text && text.length > 5 && text.length < 200) {
            if (text.toLowerCase().includes('credit') || 
                text.toLowerCase().includes('token') ||
                text.toLowerCase().includes('usage') ||
                text.toLowerCase().includes('limit')) {
              results.usageIndicators.push({
                text: text,
                tagName: el.tagName,
                className: String(el.className || '')
              });
            }
          }
        });
      }

      return results;
    });

    console.log('💾 Saving pricing analysis results...');
    const fullAnalysis = {
      pricing: pricingAnalysis,
      platform: platformAnalysis,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('pricing-system-analysis.json', JSON.stringify(fullAnalysis, null, 2));

    console.log('✅ Pricing analysis complete!');
    console.log(`\n📋 FINDINGS SUMMARY:`);
    console.log(`Pricing plans found: ${pricingAnalysis.plans.length}`);
    console.log(`Features found: ${pricingAnalysis.features.length}`);
    console.log(`Usage-related features: ${pricingAnalysis.features.filter(f => f.type === 'usage-related').length}`);
    console.log(`Platform usage indicators: ${platformAnalysis.usageIndicators.length}`);

    // Print key findings
    console.log('\n🏆 Key Usage/Token Related Features:');
    const usageFeatures = pricingAnalysis.features.filter(f => f.type === 'usage-related');
    usageFeatures.slice(0, 5).forEach((feature, i) => {
      console.log(`${i + 1}. "${feature.text}"`);
    });

    if (platformAnalysis.usageIndicators.length > 0) {
      console.log('\n💰 Platform Usage Indicators:');
      platformAnalysis.usageIndicators.slice(0, 3).forEach((indicator, i) => {
        console.log(`${i + 1}. "${indicator.text}"`);
      });
    }

  } catch (error) {
    console.error('❌ Error during pricing analysis:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

analyzePricingSystem();