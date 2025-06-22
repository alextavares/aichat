import { Page, expect } from '@playwright/test';

export class NavigationHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to a specific dashboard section
   */
  async navigateToDashboardSection(section: 'chat' | 'history' | 'templates' | 'analytics' | 'profile' | 'settings' | 'subscription') {
    // First ensure we're on dashboard
    if (!this.page.url().includes('/dashboard')) {
      await this.page.goto('/dashboard');
    }

    // Map section names to expected URLs and link texts
    const sectionMap = {
      chat: { url: '/dashboard', text: 'Chat' },
      history: { url: '/dashboard/history', text: 'Histórico' },
      templates: { url: '/dashboard/templates', text: 'Templates' },
      analytics: { url: '/analytics', text: 'Analytics' },
      profile: { url: '/dashboard/profile', text: 'Perfil' },
      settings: { url: '/dashboard/settings', text: 'Configurações' },
      subscription: { url: '/dashboard/subscription', text: 'Assinatura' }
    };

    const { url, text } = sectionMap[section];

    // Click on navigation link
    await this.page.getByRole('link', { name: text }).click();
    
    // Wait for navigation
    await this.page.waitForURL(`**${url}**`);
  }

  /**
   * Check if a navigation item is active
   */
  async isNavigationItemActive(itemText: string): Promise<boolean> {
    const navItem = this.page.getByRole('link', { name: itemText });
    const classes = await navItem.getAttribute('class') || '';
    return classes.includes('active') || classes.includes('bg-primary');
  }

  /**
   * Get all visible navigation items
   */
  async getVisibleNavigationItems(): Promise<string[]> {
    const navItems = await this.page.getByRole('link').all();
    const visibleItems: string[] = [];
    
    for (const item of navItems) {
      if (await item.isVisible()) {
        const text = await item.textContent();
        if (text) visibleItems.push(text.trim());
      }
    }
    
    return visibleItems;
  }

  /**
   * Check if sidebar is visible
   */
  async isSidebarVisible(): Promise<boolean> {
    const sidebar = this.page.locator('[data-testid="sidebar"], aside, nav');
    return await sidebar.isVisible();
  }

  /**
   * Toggle sidebar (mobile)
   */
  async toggleSidebar() {
    const menuButton = this.page.getByRole('button', { name: /menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
  }

  /**
   * Navigate using breadcrumbs
   */
  async navigateViaBreadcrumb(breadcrumbText: string) {
    await this.page.getByRole('link', { name: breadcrumbText }).click();
  }

  /**
   * Check current page title
   */
  async getCurrentPageTitle(): Promise<string> {
    const heading = this.page.getByRole('heading', { level: 1 }).first();
    return await heading.textContent() || '';
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
    // Also wait for any loading spinners to disappear
    await this.page.waitForSelector('.loading, .spinner, [data-loading="true"]', { 
      state: 'hidden',
      timeout: 5000 
    }).catch(() => {}); // Ignore if no loading indicators
  }

  /**
   * Check if user is on expected page
   */
  async verifyCurrentPage(expectedUrl: string, expectedTitle?: string) {
    await expect(this.page).toHaveURL(new RegExp(expectedUrl));
    
    if (expectedTitle) {
      const title = await this.getCurrentPageTitle();
      expect(title).toContain(expectedTitle);
    }
  }
}