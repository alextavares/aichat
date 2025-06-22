import { Page, expect } from '@playwright/test';

export class AuthHelpers {
  constructor(private page: Page) {}

  /**
   * Login with credentials
   */
  async login(email: string, password: string) {
    await this.page.goto('/auth/signin');
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Senha').fill(password);
    await this.page.getByRole('button', { name: 'Entrar' }).click();
    
    // Wait for navigation or error
    await Promise.race([
      this.page.waitForURL('/dashboard', { timeout: 5000 }),
      this.page.waitForSelector('[role="alert"]', { timeout: 5000 })
    ]);
  }

  /**
   * Signup with new user data
   */
  async signup(userData: {
    name: string;
    email: string;
    password: string;
    profession?: string;
    organization?: string;
  }) {
    await this.page.goto('/auth/signup');
    
    await this.page.getByLabel('Nome completo').fill(userData.name);
    await this.page.getByLabel('Email').fill(userData.email);
    
    if (userData.profession) {
      await this.page.getByLabel('Profissão').fill(userData.profession);
    }
    
    if (userData.organization) {
      await this.page.getByLabel('Organização').fill(userData.organization);
    }
    
    await this.page.getByLabel('Senha', { exact: true }).fill(userData.password);
    await this.page.getByLabel('Confirmar senha').fill(userData.password);
    
    await this.page.getByRole('button', { name: 'Criar conta' }).click();
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check if we're on dashboard or have auth cookie
      const url = this.page.url();
      if (url.includes('/dashboard')) return true;
      
      // Try to go to dashboard
      await this.page.goto('/dashboard');
      await this.page.waitForLoadState('networkidle');
      
      // If redirected to login, not logged in
      return !this.page.url().includes('/auth/signin');
    } catch {
      return false;
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    // Click user menu
    await this.page.getByRole('button', { name: /user|profile|menu/i }).click();
    
    // Click logout
    await this.page.getByRole('button', { name: /logout|sair/i }).click();
    
    // Wait for redirect to login
    await this.page.waitForURL('/auth/signin');
  }

  /**
   * Fill login form without submitting
   */
  async fillLoginForm(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Senha').fill(password);
  }

  /**
   * Get error message if present
   */
  async getErrorMessage(): Promise<string | null> {
    try {
      const alert = this.page.locator('[role="alert"]').first();
      if (await alert.isVisible()) {
        return await alert.textContent();
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Wait for successful login
   */
  async waitForSuccessfulLogin() {
    await this.page.waitForURL('/dashboard', { timeout: 10000 });
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  /**
   * Check if login button is in loading state
   */
  async isLoginButtonLoading(): Promise<boolean> {
    const button = this.page.getByRole('button', { name: /entrar|entrando/i });
    return await button.isDisabled();
  }
}