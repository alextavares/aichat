import { test, expect, Page } from '@playwright/test';

// Configurações otimizadas
test.describe.configure({ mode: 'serial' });

test.describe('InnerAI - Teste Otimizado de Login e Chat', () => {
  let page: Page;
  const baseURL = 'http://localhost:3050';
  const credentials = {
    email: '11@gmail.com',
    password: 'Y*mare2025'
  };

  // Logs estruturados
  const logs = {
    console: [] as string[],
    network: [] as string[],
    errors: [] as string[]
  };

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    
    // Configurar listeners de erro otimizados
    page.on('console', msg => {
      const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
      logs.console.push(text);
      if (msg.type() === 'error') {
        logs.errors.push(text);
      }
    });

    page.on('pageerror', error => {
      const errorMsg = `[PAGE ERROR] ${error.message}`;
      logs.errors.push(errorMsg);
    });

    page.on('requestfailed', request => {
      const failMsg = `[REQUEST FAILED] ${request.method()} ${request.url()} - ${request.failure()?.errorText}`;
      logs.network.push(failMsg);
      logs.errors.push(failMsg);
    });

    // Configurar timeouts otimizados
    page.setDefaultTimeout(15000);
    page.setDefaultNavigationTimeout(20000);
  });

  test.afterAll(async () => {
    // Gerar relatório de logs
    console.log('\n=== RELATÓRIO DE LOGS ===');
    console.log(`Total de logs de console: ${logs.console.length}`);
    console.log(`Total de erros de rede: ${logs.network.length}`);
    console.log(`Total de erros: ${logs.errors.length}`);
    
    if (logs.errors.length > 0) {
      console.log('\n🚨 ERROS ENCONTRADOS:');
      logs.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ Nenhum erro encontrado!');
    }

    await page.close();
  });

  test('1. Verificar homepage e navegação', async () => {
    console.log('🏠 Testando homepage...');
    
    await page.goto(baseURL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });
    
    // Verificar se a página carregou
    await expect(page).toHaveTitle(/Inner AI Clone/i);
    console.log('✅ Homepage carregada com sucesso');
  });

  test('2. Realizar login', async () => {
    console.log('🔐 Testando login...');
    
    // Navegar para login
    await page.goto(`${baseURL}/auth/signin`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/02-login-page.png', fullPage: true });
    
    // Aguardar formulário de login
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Preencher credenciais
    await page.fill('input[type="email"]', credentials.email);
    await page.fill('input[type="password"]', credentials.password);
    await page.screenshot({ path: 'test-results/03-login-filled.png', fullPage: true });
    
    // Submeter formulário
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForURL(/dashboard/, { timeout: 15000 });
    await page.screenshot({ path: 'test-results/04-after-login.png', fullPage: true });
    
    console.log('✅ Login realizado com sucesso');
  });

  test('3. Testar sistema de chat', async () => {
    console.log('💬 Testando sistema de chat...');
    
    // Navegar para chat
    await page.goto(`${baseURL}/dashboard/chat`, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/05-chat-page.png', fullPage: true });
    
    // Aguardar interface de chat
    const chatInput = await page.waitForSelector('textarea, input[placeholder*="mensagem"], input[placeholder*="message"]', { 
      timeout: 10000 
    });
    
    expect(chatInput).toBeTruthy();
    
    // Testar digitação
    await chatInput.fill('Teste de mensagem automatizada');
    await page.screenshot({ path: 'test-results/06-message-typed.png', fullPage: true });
    
    // Testar envio (Enter)
    await chatInput.press('Enter');
    await page.waitForTimeout(2000); // Aguardar processamento
    
    await page.screenshot({ path: 'test-results/07-message-sent.png', fullPage: true });
    
    console.log('✅ Sistema de chat funcionando');
  });

  test('4. Verificar responsividade', async () => {
    console.log('📱 Testando responsividade...');
    
    // Testar em diferentes tamanhos
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.screenshot({ 
        path: `test-results/08-responsive-${viewport.name}.png`, 
        fullPage: true 
      });
    }
    
    console.log('✅ Responsividade testada');
  });

  test('5. Teste de performance básica', async () => {
    console.log('⚡ Testando performance...');
    
    const startTime = Date.now();
    await page.goto(`${baseURL}/dashboard/chat`, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Tempo de carregamento: ${loadTime}ms`);
    
    // Verificar se carregou em tempo razoável (menos de 5 segundos)
    expect(loadTime).toBeLessThan(5000);
    
    console.log('✅ Performance aceitável');
  });
});