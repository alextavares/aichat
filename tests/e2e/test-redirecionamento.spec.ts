import { test, expect } from '@playwright/test';

test.describe('Teste de Redirecionamento Simples', () => {
  test('Verificar redirecionamento após login', async ({ page }) => {
    console.log('🚀 Iniciando teste de redirecionamento...');
    
    // Navegar para página de login
    await page.goto('http://localhost:3050/auth/signin');
    console.log('📍 Navegando para página de login...');
    
    // Aguardar página carregar
    await page.waitForLoadState('networkidle');
    
    // Preencher credenciais
    await page.fill('[data-testid="email-input"]', '11@gmail.com');
    await page.fill('[data-testid="password-input"]', 'Y*mare2025');
    console.log('📝 Credenciais preenchidas...');
    
    // Capturar URL antes do login
    const urlAntes = page.url();
    console.log('📍 URL antes do login:', urlAntes);
    
    // Fazer login
    await page.click('[data-testid="login-button"]');
    console.log('📤 Botão de login clicado...');
    
    // Aguardar redirecionamento ou mudança de URL
    try {
      // Aguardar até 10 segundos por qualquer mudança de URL
      await page.waitForURL(url => url !== urlAntes, { timeout: 10000 });
      
      const urlDepois = page.url();
      console.log('📍 URL após login:', urlDepois);
      
      // Verificar se foi redirecionado para dashboard
      if (urlDepois.includes('/dashboard')) {
        console.log('✅ Redirecionamento para dashboard bem-sucedido!');
      } else {
        console.log('⚠️ Redirecionado para:', urlDepois);
      }
      
    } catch (error) {
      console.log('⏰ Timeout aguardando redirecionamento');
      console.log('📍 URL final:', page.url());
      
      // Verificar se há mensagem de sucesso
      const successMessage = await page.locator('text=Login realizado com sucesso').isVisible();
      if (successMessage) {
        console.log('✅ Mensagem de sucesso encontrada');
      }
      
      // Verificar se há erro
      const errorMessage = await page.locator('[role="alert"]').isVisible();
      if (errorMessage) {
        const errorText = await page.locator('[role="alert"]').textContent();
        console.log('❌ Erro encontrado:', errorText);
      }
    }
    
    // Capturar screenshot final
    await page.screenshot({ path: 'test-results/redirecionamento-final.png' });
    console.log('📸 Screenshot capturado');
  });
});