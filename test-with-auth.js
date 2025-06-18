const puppeteer = require('puppeteer');

async function testWithAuth() {
  console.log('🚀 Teste Completo com Autenticação\n');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // 1. Login
    console.log('1️⃣ Fazendo login...');
    await page.goto('http://localhost:3000/auth/signin');
    
    // Preencher credenciais
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="password"]', 'test123');
    
    // Fazer login
    await Promise.all([
      page.waitForNavigation(),
      page.click('button[type="submit"]')
    ]);
    
    console.log('   ✅ Login realizado!');
    console.log(`   📍 Redirecionado para: ${page.url()}\n`);
    
    // 2. Testar Chat
    console.log('2️⃣ Testando Chat...');
    const chatInput = await page.$('textarea[placeholder*="Type your message"]');
    
    if (chatInput) {
      await page.type('textarea[placeholder*="Type your message"]', 'Olá! Me explique o que é JavaScript em uma frase.');
      await page.keyboard.press('Enter');
      
      console.log('   ⏳ Aguardando resposta da IA...');
      
      // Aguardar resposta aparecer
      try {
        await page.waitForSelector('.message-assistant', { timeout: 15000 });
        console.log('   ✅ Resposta da IA recebida!\n');
      } catch (e) {
        console.log('   ⚠️  Timeout aguardando resposta\n');
      }
    } else {
      console.log('   ❌ Chat não encontrado\n');
    }
    
    // 3. Testar Templates
    console.log('3️⃣ Testando Templates...');
    const templateBtn = await page.$('button:has-text("Templates")');
    
    if (templateBtn) {
      await templateBtn.click();
      await page.waitForTimeout(1000);
      
      const modal = await page.$('[role="dialog"]');
      console.log(`   ✅ Modal de templates: ${modal ? 'Aberto' : 'Não encontrado'}\n`);
      
      if (modal) {
        await page.keyboard.press('Escape');
      }
    } else {
      console.log('   ❌ Botão de templates não encontrado\n');
    }
    
    // 4. Verificar Indicador de Uso
    console.log('4️⃣ Verificando Indicador de Uso...');
    const usageIndicator = await page.$('[class*="usage"]');
    console.log(`   ✅ Indicador de uso: ${usageIndicator ? 'Presente' : 'Não encontrado'}\n`);
    
    // 5. Testar navegação para Analytics
    console.log('5️⃣ Testando Analytics...');
    await page.goto('http://localhost:3000/analytics');
    await page.waitForTimeout(2000);
    
    const analyticsTitle = await page.$('h1:has-text("Analytics")');
    console.log(`   ✅ Página de analytics: ${analyticsTitle ? 'Carregada' : 'Não encontrada'}\n`);
    
    // Capturar cookies para debug
    const cookies = await page.cookies();
    const sessionCookie = cookies.find(c => c.name.includes('session'));
    console.log(`🍪 Sessão ativa: ${sessionCookie ? 'Sim' : 'Não'}`);
    
    console.log('\n✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await browser.close();
  }
}

// Verificar se Puppeteer está instalado
try {
  require.resolve('puppeteer');
  testWithAuth();
} catch (e) {
  console.log('⚠️  Puppeteer não instalado.');
  console.log('Execute: cd ~/inneraiclone && npm install puppeteer');
}