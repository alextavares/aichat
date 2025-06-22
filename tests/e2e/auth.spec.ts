import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start with a clean state
    await page.goto('/');
  });

  test('should display signup page correctly', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Check if page loads correctly
    await expect(page.getByRole('heading', { name: 'Criar sua conta' })).toBeVisible();
    await expect(page.getByText('Junte-se ao InnerAI e comece sua jornada')).toBeVisible();
    
    // Check form fields are present
    await expect(page.getByLabel('Nome completo')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Profissão')).toBeVisible();
    await expect(page.getByLabel('Organização')).toBeVisible();
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirmar senha')).toBeVisible();
    
    // Check submit button
    await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();
  });

  test('should display signin page correctly', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Check if page loads correctly
    await expect(page.getByRole('heading', { name: 'Entrar na sua conta' })).toBeVisible();
    await expect(page.getByText('Entre com sua conta para acessar o InnerAI')).toBeVisible();
    
    // Check form fields
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Senha')).toBeVisible();
    
    // Check submit button
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible();
    
    // Check signup link
    await expect(page.getByRole('link', { name: 'Criar conta' })).toBeVisible();
  });

  test('should show validation error for password mismatch on signup', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Fill form with mismatched passwords
    await page.getByLabel('Nome completo').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('password123');
    await page.getByLabel('Confirmar senha').fill('different123');
    
    // Submit form
    await page.getByRole('button', { name: 'Criar conta' }).click();
    
    // Check for error message
    await expect(page.getByText('Senhas não coincidem')).toBeVisible();
  });

  test('should show loading state during signup', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Fill form with valid data
    await page.getByLabel('Nome completo').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Senha', { exact: true }).fill('password123');
    await page.getByLabel('Confirmar senha').fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: 'Criar conta' }).click();
    
    // Check for loading state (should appear briefly)
    await expect(page.getByText('Criando conta...')).toBeVisible({ timeout: 2000 });
  });

  test('should show loading state during signin', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Fill form
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Senha').fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Check for loading state (should appear briefly)
    await expect(page.getByText('Entrando...')).toBeVisible({ timeout: 2000 });
  });

  test('should navigate between signup and signin pages', async ({ page }) => {
    // Start at signup
    await page.goto('/auth/signup');
    await expect(page.getByRole('heading', { name: 'Criar sua conta' })).toBeVisible();
    
    // Navigate to signin
    await page.getByRole('link', { name: 'Entrar' }).click();
    await expect(page.getByRole('heading', { name: 'Entrar na sua conta' })).toBeVisible();
    
    // Navigate back to signup
    await page.getByRole('link', { name: 'Criar conta' }).click();
    await expect(page.getByRole('heading', { name: 'Criar sua conta' })).toBeVisible();
  });

  test('should handle signup form submission and show error feedback', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Fill complete form
    await page.getByLabel('Nome completo').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Profissão').fill('Developer');
    await page.getByLabel('Organização').fill('Test Company');
    await page.getByLabel('Senha', { exact: true }).fill('password123');
    await page.getByLabel('Confirmar senha').fill('password123');
    
    // Submit form
    await page.getByRole('button', { name: 'Criar conta' }).click();
    
    // Wait for response (either success or error)
    await page.waitForSelector('[role="alert"]', { timeout: 10000 });
    
    // Check that some feedback was received (error due to no DB or success)
    const alerts = page.locator('[role="alert"]');
    await expect(alerts).toHaveCount(1);
  });

  test('should handle signin form submission and show error feedback', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Fill form with test credentials
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Senha').fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: 'Entrar' }).click();
    
    // Wait for error response
    await page.waitForSelector('[role="alert"]', { timeout: 10000 });
    
    // Check for error message
    await expect(page.getByText(/Email ou senha incorretos|Erro/)).toBeVisible();
  });

  test('should show test mode button when database error occurs', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Fill and submit form to trigger potential DB error
    await page.getByLabel('Nome completo').fill('Test User');
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Profissão').fill('Developer');
    await page.getByLabel('Organização').fill('Test Company');
    await page.getByLabel('Senha', { exact: true }).fill('password123');
    await page.getByLabel('Confirmar senha').fill('password123');
    
    await page.getByRole('button', { name: 'Criar conta' }).click();
    
    // Wait for response
    await page.waitForSelector('[role="alert"]', { timeout: 10000 });
    
    // If error contains database-related text, test mode button should appear
    const errorText = await page.locator('[role="alert"]').textContent();
    if (errorText && errorText.includes('banco')) {
      await expect(page.getByRole('button', { name: /Modo de Teste/ })).toBeVisible();
    }
  });
});