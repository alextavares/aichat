import { test, expect } from '@playwright/test';

test.describe('InnerAI - Teste de Login Específico', () => {
  const baseURL = 'http://localhost:3050';
  const credentials = {
    email: '11@gmail.com',
    password: 'Y*mare2025'
  };

  test('Login completo com verificação detalhada', async ({ page }) => {
    console.log('🚀 Iniciando teste de login detalhado...');
    
    // Configurar listeners de erro
    const errors: string[] = [];
    const consoleMessages: string[] = [];
    
    page.on('console', msg => {
      const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
      consoleMessages.push(text);
      if (msg.type() === 'error') {
        errors.push(text);
      }
    });

    page.on('pageerror', error => {
      errors.push(`[PAGE ERROR] ${error.message}`);
    });

    page.on('requestfailed', request => {
      errors.push(`[REQUEST FAILED] ${request.method()} ${request.url()}`);
    });

    // 1. Navegar para homepage
    console.log('📍 Navegando para homepage...');
    await page.goto(baseURL);
    await page.screenshot({ path: 'test-results/detailed-01-homepage.png' });
    
    // 2. Navegar para login
    console.log('🔐 Navegando para página de login...');
    await page.goto(`${baseURL}/auth/signin`);
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/detailed-02-login-page.png' });
    
    // 3. Verificar elementos do formulário
    console.log('🔍 Verificando elementos do formulário...');
    
    const emailInput = await page.waitForSelector('[data-testid="email-input"]', { timeout: 10000 });
    const passwordInput = await page.waitForSelector('[data-testid="password-input"]', { timeout: 10000 });
    const loginButton = await page.waitForSelector('[data-testid="login-button"]', { timeout: 10000 });
    
    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(loginButton).toBeTruthy();
    
    console.log('✅ Todos os elementos do formulário encontrados');
    
    // 4. Preencher credenciais
    console.log('📝 Preenchendo credenciais...');
    await emailInput.fill(credentials.email);
    await passwordInput.fill(credentials.password);
    await page.screenshot({ path: 'test-results/detailed-03-credentials-filled.png' });
    
    // 5. Submeter formulário
    console.log('📤 Submetendo formulário...');
    await loginButton.click();
    
    // 6. Aguardar resposta
    console.log('⏳ Aguardando resposta do login...');
    await page.waitForTimeout(3000); // Aguardar processamento
    await page.screenshot({ path: 'test-results/detailed-04-after-submit.png' });
    
    // 7. Verificar se houve redirecionamento ou mensagem de sucesso
    const currentUrl = page.url();
    console.log(`📍 URL atual: ${currentUrl}`);
    
    // Verificar se há mensagem de sucesso
    const successMessage = await page.locator('text=Login realizado com sucesso').first();
    const isSuccessVisible = await successMessage.isVisible().catch(() => false);
    
    if (isSuccessVisible) {
      console.log('✅ Mensagem de sucesso encontrada');
      await page.waitForTimeout(2000); // Aguardar redirecionamento
      await page.screenshot({ path: 'test-results/detailed-05-success-message.png' });
    }
    
    // 8. Verificar se foi redirecionado para dashboard
    const finalUrl = page.url();
    console.log(`📍 URL final: ${finalUrl}`);
    
    if (finalUrl.includes('/dashboard')) {
      console.log('✅ Redirecionamento para dashboard bem-sucedido');
      await page.screenshot({ path: 'test-results/detailed-06-dashboard.png' });
      
      // Testar navegação para chat
      await page.goto(`${baseURL}/dashboard/chat`);
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-results/detailed-07-chat-page.png' });
      
      // Verificar se há input de chat
      const chatInput = await page.locator('textarea, input[placeholder*="mensagem"], input[placeholder*="message"]').first();
      const isChatInputVisible = await chatInput.isVisible().catch(() => false);
      
      if (isChatInputVisible) {
        console.log('✅ Input de chat encontrado');
        await chatInput.fill('Teste automatizado');
        await page.screenshot({ path: 'test-results/detailed-08-chat-test.png' });
      } else {
        console.log('⚠️ Input de chat não encontrado');
      }
    } else {
      console.log('⚠️ Não foi redirecionado para dashboard');
      
      // Verificar se há mensagem de erro
      const errorMessage = await page.locator('[role="alert"], .alert-destructive').first();
      const isErrorVisible = await errorMessage.isVisible().catch(() => false);
      
      if (isErrorVisible) {
        const errorText = await errorMessage.textContent();
        console.log(`❌ Erro encontrado: ${errorText}`);
      }
    }
    
    // 9. Relatório final
    console.log('\n=== RELATÓRIO FINAL ===');
    console.log(`Total de mensagens de console: ${consoleMessages.length}`);
    console.log(`Total de erros: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 ERROS ENCONTRADOS:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ Nenhum erro JavaScript encontrado!');
    }
    
    console.log('\n📊 MENSAGENS DE CONSOLE:');
    consoleMessages.slice(-10).forEach((msg, index) => {
      console.log(`${index + 1}. ${msg}`);
    });
    
    await page.screenshot({ path: 'test-results/detailed-09-final.png' });
    console.log('🏁 Teste concluído!');
  });
});