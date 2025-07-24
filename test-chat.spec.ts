import { test, expect } from '@playwright/test';

test('Teste do Sistema de Chat InnerAI', async ({ page }) => {
  console.log('🚀 Iniciando teste do sistema de chat...');
  
  // Navegar para a aplicação
  console.log('📍 Navegando para http://localhost:3050/');
  await page.goto('http://localhost:3050/');
  
  // Capturar screenshot da página inicial
  await page.screenshot({ path: 'test-screenshots/01-homepage.png' });
  console.log('📸 Screenshot da página inicial capturada');
  
  // Verificar se está na página de login
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passwordInput = page.locator('input[type="password"], input[name="password"]');
  
  if (await emailInput.isVisible()) {
    console.log('🔐 Fazendo login...');
    
    await emailInput.fill('11@gmail.com');
    await passwordInput.fill('Y*mare2025');
    
    // Procurar botão de login
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Entrar"), button[type="submit"]').first();
    await loginButton.click();
    
    // Aguardar redirecionamento
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-screenshots/02-after-login.png' });
    console.log('✅ Login realizado');
  }
  
  // Tentar navegar para o chat
  await page.goto('http://localhost:3050/dashboard/chat');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'test-screenshots/03-chat-page.png' });
  
  // Verificar elementos da página de chat
  const chatInput = page.locator('textarea, input[placeholder*="mensagem"], input[placeholder*="message"], [contenteditable="true"]').first();
  
  if (await chatInput.isVisible()) {
    console.log('💬 Input de chat encontrado');
    
    // Verificar seletores de modelo
    const modelSelectors = page.locator('select, [role="combobox"], [data-testid*="model"]');
    const modelCount = await modelSelectors.count();
    console.log(`🤖 Encontrados ${modelCount} seletores de modelo`);
    
    // Testar envio de mensagem
    await chatInput.fill('Teste: Olá! Este é um teste do sistema. Você pode responder?');
    
    const sendButton = page.locator('button:has-text("Enviar"), button:has-text("Send"), [data-testid*="send"]').first();
    
    if (await sendButton.isVisible()) {
      await sendButton.click();
      console.log('✅ Mensagem enviada');
      
      // Aguardar resposta
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'test-screenshots/04-after-message.png' });
    }
  } else {
    console.log('❌ Input de chat não encontrado');
  }
  
  // Capturar erros do console
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  await page.waitForTimeout(3000);
  
  if (errors.length > 0) {
    console.log('🚨 Erros encontrados:');
    errors.forEach(error => console.log(`   - ${error}`));
  }
  
  await page.screenshot({ path: 'test-screenshots/05-final.png' });
  console.log('🏁 Teste finalizado');
});