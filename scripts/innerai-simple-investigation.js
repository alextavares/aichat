const puppeteer = require('puppeteer');

async function investigateInnerAI() {
  console.log('🔍 Investigando InnerAI...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // Acessar diretamente a app
    console.log('1️⃣ Acessando app.innerai.com...');
    await page.goto('https://app.innerai.com/', { waitUntil: 'networkidle2' });
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Tirar screenshot
    await page.screenshot({ path: 'screenshots/innerai-app.png' });
    console.log('✅ Screenshot salvo');
    
    // Manter aberto
    console.log('\n⏸️  Navegador aberto para exploração manual...');
    console.log('   Faça login com:');
    console.log('   Email: alexandretmoraescpa@gmail.com');
    console.log('   Senha: Y*mare2025');
    console.log('\n   Pressione Ctrl+C quando terminar.');
    
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

investigateInnerAI().catch(console.error);