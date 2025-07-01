import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import path from 'path';

const APP_URL = 'https://seahorse-app-k5pag.ondigitalocean.app';
const SCREENSHOTS_DIR = path.join(process.cwd(), 'test-screenshots');

// Criar diretório para screenshots
async function ensureScreenshotsDir() {
  try {
    await fs.mkdir(SCREENSHOTS_DIR, { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretório de screenshots:', error);
  }
}

// Função para tirar screenshot com nome descritivo
async function takeScreenshot(page: any, name: string) {
  const filename = `${new Date().getTime()}-${name}.png`;
  const filepath = path.join(SCREENSHOTS_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`📸 Screenshot salva: ${filename}`);
  return filepath;
}

// Função principal de teste
async function testUserFlow() {
  console.log('🚀 Iniciando teste automatizado do fluxo do usuário...\n');
  
  await ensureScreenshotsDir();
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  const testResults = {
    login: false,
    pricing: false,
    upgrade: false,
    chat: false,
    models: [] as string[],
    errors: [] as string[]
  };

  try {
    // 1. Acessar página inicial
    console.log('1️⃣ Acessando página inicial...');
    await page.goto(APP_URL, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '01-home');
    
    // 2. Navegar para página de preços
    console.log('\n2️⃣ Navegando para página de preços...');
    const pricingLink = await page.$('a[href="/pricing"]');
    if (pricingLink) {
      await pricingLink.click();
      await page.waitForNavigation({ waitUntil: 'networkidle0' });
      await takeScreenshot(page, '02-pricing');
      
      // Verificar planos
      const plansText = await page.evaluate(() => document.body.innerText);
      if (plansText.includes('Starter') && plansText.includes('Pro') && plansText.includes('Ultimate')) {
        console.log('✅ Planos encontrados: Starter, Pro, Ultimate');
        testResults.pricing = true;
        
        // Verificar preços
        if (plansText.includes('29,90') && plansText.includes('59,90') && plansText.includes('99,90')) {
          console.log('✅ Preços corretos: R$ 29,90 | R$ 59,90 | R$ 99,90');
        }
      }
    }
    
    // 3. Ir para página de login
    console.log('\n3️⃣ Acessando página de login...');
    await page.goto(`${APP_URL}/login`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '03-login');
    
    // 4. Simular login com email
    console.log('\n4️⃣ Simulando login com email...');
    const emailInput = await page.$('input[type="email"]');
    if (emailInput) {
      await emailInput.type('teste@example.com');
      await takeScreenshot(page, '04-email-typed');
      
      // Procurar botão de continuar com email
      const emailButton = await page.$('button:has-text("email")');
      if (emailButton) {
        console.log('✅ Opção de login por email disponível');
        testResults.login = true;
      }
    }
    
    // 5. Verificar integração com providers OAuth
    console.log('\n5️⃣ Verificando providers de autenticação...');
    const providers = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons
        .map(btn => btn.textContent?.toLowerCase())
        .filter(text => text && ['google', 'microsoft', 'apple', 'github'].some(provider => text.includes(provider)));
    });
    
    if (providers.length > 0) {
      console.log(`✅ Providers encontrados: ${providers.join(', ')}`);
    }
    
    // 6. Simular acesso ao chat (após login)
    console.log('\n6️⃣ Tentando acessar área do chat...');
    await page.goto(`${APP_URL}/chat`, { waitUntil: 'networkidle0' });
    await takeScreenshot(page, '06-chat-attempt');
    
    // Verificar se foi redirecionado para login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('⚠️ Redirecionado para login (esperado sem autenticação)');
    }
    
    // 7. Verificar elementos do MercadoPago
    console.log('\n7️⃣ Verificando integração MercadoPago...');
    await page.goto(`${APP_URL}/pricing`, { waitUntil: 'networkidle0' });
    
    const mercadoPagoPresent = await page.evaluate(() => {
      // Procurar por scripts ou elementos do MercadoPago
      const scripts = Array.from(document.querySelectorAll('script'));
      const hasMPScript = scripts.some(script => 
        script.src?.includes('mercadopago') || 
        script.textContent?.includes('mercadopago')
      );
      
      // Procurar por botões de assinatura
      const buttons = Array.from(document.querySelectorAll('button'));
      const hasSubscribeButtons = buttons.some(btn => 
        btn.textContent?.toLowerCase().includes('assinar') ||
        btn.textContent?.toLowerCase().includes('começar')
      );
      
      return { hasMPScript, hasSubscribeButtons };
    });
    
    if (mercadoPagoPresent.hasSubscribeButtons) {
      console.log('✅ Botões de assinatura encontrados');
      testResults.upgrade = true;
    }
    
    if (mercadoPagoPresent.hasMPScript) {
      console.log('✅ Script do MercadoPago detectado');
    }
    
    // 8. Coletar informações sobre modelos mencionados
    console.log('\n8️⃣ Verificando menção aos modelos de IA...');
    const pageContent = await page.evaluate(() => document.body.innerText);
    
    const modelsToCheck = [
      'gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo',
      'claude-3-haiku', 'claude-3.5-sonnet', 'claude-3-opus',
      'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash',
      'o1-preview', 'o1-mini', 'command-r'
    ];
    
    const mentionedModels = modelsToCheck.filter(model => 
      pageContent.toLowerCase().includes(model.toLowerCase())
    );
    
    if (mentionedModels.length > 0) {
      console.log(`✅ Modelos mencionados: ${mentionedModels.join(', ')}`);
      testResults.models = mentionedModels;
    }
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    testResults.errors.push(error instanceof Error ? error.message : String(error));
  } finally {
    await browser.close();
  }
  
  // Gerar relatório
  console.log('\n📊 RELATÓRIO FINAL:');
  console.log('==================');
  console.log(`Login disponível: ${testResults.login ? '✅' : '❌'}`);
  console.log(`Página de preços: ${testResults.pricing ? '✅' : '❌'}`);
  console.log(`Upgrade disponível: ${testResults.upgrade ? '✅' : '❌'}`);
  console.log(`Modelos encontrados: ${testResults.models.length > 0 ? testResults.models.length : '0'}`);
  console.log(`Erros: ${testResults.errors.length}`);
  
  // Salvar relatório JSON
  const reportPath = path.join(process.cwd(), 'test-report.json');
  await fs.writeFile(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Relatório salvo em: ${reportPath}`);
  console.log(`📸 Screenshots salvas em: ${SCREENSHOTS_DIR}`);
  
  return testResults;
}

// Executar teste
if (require.main === module) {
  testUserFlow()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Erro fatal:', error);
      process.exit(1);
    });
}

export { testUserFlow };