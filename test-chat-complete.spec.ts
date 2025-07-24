import { test, expect } from '@playwright/test';

test('Teste Completo do Sistema de Chat InnerAI', async ({ page }) => {
  console.log('🚀 Iniciando teste completo do sistema de chat...');
  
  // Configurar listener para erros do console
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`🚨 Console Error: ${msg.text()}`);
    }
  });
  
  // Navegar para a aplicação
  console.log('📍 Navegando para http://localhost:3050/');
  await page.goto('http://localhost:3050/', { waitUntil: 'networkidle' });
  
  // Screenshot da página inicial
  await page.screenshot({ path: 'test-screenshots/step-01-homepage.png', fullPage: true });
  console.log('📸 Screenshot da página inicial capturada');
  
  // Verificar se há formulário de login
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="senha"]');
  
  if (await emailInput.isVisible()) {
    console.log('🔐 Formulário de login encontrado, fazendo login...');
    
    // Preencher credenciais
    await emailInput.fill('11@gmail.com');
    await passwordInput.fill('Y*mare2025');
    
    await page.screenshot({ path: 'test-screenshots/step-02-login-filled.png', fullPage: true });
    
    // Procurar e clicar no botão de login
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Entrar"), button:has-text("Sign in"), button[type="submit"]').first();
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      console.log('✅ Botão de login clicado');
      
      // Aguardar redirecionamento
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-screenshots/step-03-after-login.png', fullPage: true });
    } else {
      console.log('❌ Botão de login não encontrado');
    }
  } else {
    console.log('ℹ️ Não há formulário de login visível, pode já estar logado');
  }
  
  // Tentar navegar para diferentes páginas de chat
  const chatUrls = [
    'http://localhost:3050/dashboard/chat',
    'http://localhost:3050/chat',
    'http://localhost:3050/dashboard',
  ];
  
  let chatPageFound = false;
  
  for (const url of chatUrls) {
    console.log(`🔍 Tentando acessar: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Verificar se há elementos de chat
      const chatInput = page.locator('textarea, input[placeholder*="mensagem"], input[placeholder*="message"], [contenteditable="true"], input[placeholder*="Digite"]').first();
      
      if (await chatInput.isVisible()) {
        console.log(`✅ Página de chat encontrada em: ${url}`);
        chatPageFound = true;
        await page.screenshot({ path: 'test-screenshots/step-04-chat-found.png', fullPage: true });
        break;
      }
    } catch (error) {
      console.log(`❌ Erro ao acessar ${url}: ${error.message}`);
    }
  }
  
  if (!chatPageFound) {
    console.log('🔍 Procurando elementos de chat na página atual...');
    
    // Verificar se há links para chat
    const chatLinks = page.locator('a:has-text("Chat"), a:has-text("Conversa"), [href*="chat"]');
    const chatLinkCount = await chatLinks.count();
    
    if (chatLinkCount > 0) {
      console.log(`🔗 Encontrados ${chatLinkCount} links para chat`);
      await chatLinks.first().click();
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: 'test-screenshots/step-05-chat-via-link.png', fullPage: true });
    }
  }
  
  // Verificar elementos da interface de chat
  console.log('🔍 Analisando interface de chat...');
  
  // Procurar input de chat
  const chatInput = page.locator('textarea, input[placeholder*="mensagem"], input[placeholder*="message"], [contenteditable="true"], input[placeholder*="Digite"]').first();
  const hasChatInput = await chatInput.isVisible();
  console.log(`💬 Input de chat encontrado: ${hasChatInput}`);
  
  // Procurar seletores de modelo/IA
  const modelSelectors = page.locator('select, [role="combobox"], [data-testid*="model"], [class*="model"], [aria-label*="model"]');
  const modelCount = await modelSelectors.count();
  console.log(`🤖 Seletores de modelo encontrados: ${modelCount}`);
  
  // Listar opções de modelo se disponíveis
  if (modelCount > 0) {
    for (let i = 0; i < modelCount; i++) {
      const selector = modelSelectors.nth(i);
      const isVisible = await selector.isVisible();
      if (isVisible) {
        console.log(`   - Seletor ${i + 1}: visível`);
        
        // Tentar obter opções
        const options = selector.locator('option');
        const optionCount = await options.count();
        
        if (optionCount > 0) {
          console.log(`     Opções disponíveis: ${optionCount}`);
          for (let j = 0; j < Math.min(optionCount, 5); j++) {
            const optionText = await options.nth(j).textContent();
            console.log(`       - ${optionText}`);
          }
        }
      }
    }
  }
  
  // Testar envio de mensagem se input estiver disponível
  if (hasChatInput) {
    console.log('📝 Testando envio de mensagem...');
    
    const testMessage = 'Olá! Este é um teste automatizado do sistema de chat. Você pode me responder com uma mensagem simples?';
    await chatInput.fill(testMessage);
    
    await page.screenshot({ path: 'test-screenshots/step-06-message-typed.png', fullPage: true });
    
    // Procurar botão de envio
    const sendButton = page.locator('button:has-text("Enviar"), button:has-text("Send"), button[type="submit"], [data-testid*="send"], button[aria-label*="send"]').first();
    const hasSendButton = await sendButton.isVisible();
    
    if (hasSendButton) {
      console.log('✅ Botão de envio encontrado, enviando mensagem...');
      await sendButton.click();
      
      // Aguardar resposta (máximo 30 segundos)
      console.log('⏳ Aguardando resposta da IA...');
      try {
        await page.waitForSelector('[data-testid*="message"], .message, [class*="response"], [class*="chat-message"]', { timeout: 30000 });
        console.log('✅ Resposta da IA recebida');
        
        await page.screenshot({ path: 'test-screenshots/step-07-response-received.png', fullPage: true });
        
        // Verificar se há múltiplas mensagens
        const messages = page.locator('[data-testid*="message"], .message, [class*="chat-message"]');
        const messageCount = await messages.count();
        console.log(`💬 Total de mensagens na conversa: ${messageCount}`);
        
      } catch (error) {
        console.log('⚠️ Timeout aguardando resposta da IA');
        await page.screenshot({ path: 'test-screenshots/step-07-no-response.png', fullPage: true });
      }
    } else {
      console.log('❌ Botão de envio não encontrado');
      
      // Tentar enviar com Enter
      console.log('🔄 Tentando enviar com Enter...');
      await chatInput.press('Enter');
      await page.waitForTimeout(5000);
      await page.screenshot({ path: 'test-screenshots/step-06b-enter-attempt.png', fullPage: true });
    }
  }
  
  // Testar diferentes modelos se disponíveis
  if (modelCount > 0) {
    console.log('🔄 Testando diferentes modelos de IA...');
    
    const firstSelector = modelSelectors.first();
    if (await firstSelector.isVisible()) {
      const options = firstSelector.locator('option');
      const optionCount = await options.count();
      
      // Testar até 3 modelos diferentes
      for (let i = 0; i < Math.min(optionCount, 3); i++) {
        const option = options.nth(i);
        const optionText = await option.textContent();
        
        console.log(`🤖 Testando modelo: ${optionText}`);
        
        try {
          await option.click();
          await page.waitForTimeout(2000);
          
          if (hasChatInput) {
            await chatInput.fill(`Teste com modelo ${optionText}: Olá, você pode me responder?`);
            
            const sendButton = page.locator('button:has-text("Enviar"), button:has-text("Send")').first();
            if (await sendButton.isVisible()) {
              await sendButton.click();
              await page.waitForTimeout(5000);
            }
          }
          
          await page.screenshot({ path: `test-screenshots/step-08-model-${i + 1}.png`, fullPage: true });
          
        } catch (error) {
          console.log(`❌ Erro ao testar modelo ${optionText}: ${error.message}`);
        }
      }
    }
  }
  
  // Screenshot final
  await page.screenshot({ path: 'test-screenshots/step-09-final.png', fullPage: true });
  
  // Relatório de erros
  if (consoleErrors.length > 0) {
    console.log('🚨 ERROS ENCONTRADOS NO CONSOLE:');
    consoleErrors.forEach((error, index) => {
      console.log(`   ${index + 1}. ${error}`);
    });
  } else {
    console.log('✅ Nenhum erro encontrado no console');
  }
  
  console.log('🏁 Teste completo finalizado');
});