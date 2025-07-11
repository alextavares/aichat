const puppeteer = require('puppeteer');
const fs = require('fs');

async function analyzeTokenSystem() {
  let browser;
  try {
    console.log('🚀 Starting browser to analyze token/credits system...');
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/home/alext/.cache/puppeteer/chrome/linux-138.0.7204.49/chrome-linux64/chrome',
      defaultViewport: { width: 1400, height: 900 },
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    
    console.log('📱 Navigating to InnerAI...');
    await page.goto('https://app.innerai.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('🔍 Analyzing token/credit system...');
    
    const tokenAnalysis = await page.evaluate(() => {
      const results = {
        credits: [],
        tokens: [],
        usage: [],
        pricing: [],
        limits: [],
        indicators: [],
        balanceDisplays: []
      };

      // Look for credit/token related elements
      const creditKeywords = ['credit', 'token', 'coin', 'balance', 'usage', 'limit', 'remaining', 'consumed'];
      
      // Search for elements containing credit/token keywords
      const allElements = document.querySelectorAll('*');
      
      allElements.forEach(el => {
        try {
          const text = el.textContent ? el.textContent.toLowerCase() : '';
          const classes = el.className ? String(el.className).toLowerCase() : '';
          const id = el.id ? String(el.id).toLowerCase() : '';
          
          creditKeywords.forEach(keyword => {
            if (text.includes(keyword) || classes.includes(keyword) || id.includes(keyword)) {
              // Only include elements with meaningful content
              if (el.textContent && el.textContent.trim().length > 0 && el.textContent.trim().length < 200) {
                results.credits.push({
                  text: el.textContent.trim(),
                  tagName: el.tagName,
                  className: String(el.className || ''),
                  id: String(el.id || ''),
                  keyword: keyword
                });
              }
            }
          });
        } catch (e) {
          // Skip problematic elements
        }
      });

      // Look for numerical indicators that might be tokens/credits
      const numberPattern = /\d+/g;
      const potentialNumbers = document.querySelectorAll('[class*="count"], [class*="number"], [class*="amount"], [class*="balance"]');
      
      potentialNumbers.forEach(el => {
        if (el.textContent && numberPattern.test(el.textContent)) {
          results.usage.push({
            text: el.textContent.trim(),
            className: el.className,
            parent: el.parentElement?.textContent?.trim().substring(0, 100)
          });
        }
      });

      // Look for progress bars or usage indicators
      const progressElements = document.querySelectorAll('[class*="progress"], [class*="bar"], [class*="meter"], [role="progressbar"]');
      progressElements.forEach(el => {
        results.indicators.push({
          text: el.textContent?.trim() || 'Progress element',
          className: el.className,
          role: el.getAttribute('role'),
          value: el.getAttribute('value') || el.getAttribute('aria-valuenow'),
          max: el.getAttribute('max') || el.getAttribute('aria-valuemax')
        });
      });

      // Look for pricing or subscription info
      const pricingElements = document.querySelectorAll('[class*="price"], [class*="plan"], [class*="subscription"]');
      pricingElements.forEach(el => {
        if (el.textContent && el.textContent.trim().length > 0) {
          results.pricing.push({
            text: el.textContent.trim(),
            className: el.className
          });
        }
      });

      return results;
    });

    console.log('📸 Taking screenshot of current page...');
    await page.screenshot({ 
      path: 'token-system-analysis.png', 
      fullPage: true 
    });

    // Try to look for user profile or account section
    console.log('🔍 Looking for user profile/account section...');
    
    try {
      // Look for profile or account buttons
      const profileButtons = await page.$$eval('button, a', elements => {
        return elements
          .filter(el => {
            const text = el.textContent?.toLowerCase() || '';
            return text.includes('profile') || text.includes('account') || text.includes('settings') || text.includes('plan');
          })
          .map(el => ({
            text: el.textContent?.trim(),
            href: el.href,
            className: el.className
          }));
      });

      if (profileButtons.length > 0) {
        console.log('Found profile buttons:', profileButtons);
        
        // Try clicking the first profile-related element
        try {
          await page.click(profileButtons[0].href ? `a[href="${profileButtons[0].href}"]` : 'button');
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          console.log('📸 Taking screenshot after clicking profile...');
          await page.screenshot({ 
            path: 'token-system-profile.png', 
            fullPage: true 
          });
        } catch (e) {
          console.log('Could not click profile button:', e.message);
        }
      }
    } catch (e) {
      console.log('Error looking for profile section:', e.message);
    }

    console.log('💾 Saving token analysis results...');
    fs.writeFileSync('token-system-analysis.json', JSON.stringify(tokenAnalysis, null, 2));

    console.log('✅ Token system analysis complete!');
    console.log(`\n📋 FINDINGS SUMMARY:`);
    console.log(`Credit-related elements: ${tokenAnalysis.credits.length}`);
    console.log(`Usage indicators: ${tokenAnalysis.usage.length}`);
    console.log(`Progress bars: ${tokenAnalysis.indicators.length}`);
    console.log(`Pricing elements: ${tokenAnalysis.pricing.length}`);

    // Print some key findings
    if (tokenAnalysis.credits.length > 0) {
      console.log('\n🏆 Key Credit/Token Elements Found:');
      tokenAnalysis.credits.slice(0, 5).forEach((item, i) => {
        console.log(`${i + 1}. "${item.text}" (${item.tagName}, keyword: ${item.keyword})`);
      });
    }

  } catch (error) {
    console.error('❌ Error during token analysis:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

analyzeTokenSystem();