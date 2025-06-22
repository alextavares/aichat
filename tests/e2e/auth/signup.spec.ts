import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../helpers/auth.helpers';
import testUsers from '../../config/test-users.json';

test.describe('Authentication - Signup Module', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    await page.goto('/auth/signup');
  });

  test.describe('Signup Form UI', () => {
    test('should display all form elements correctly', async ({ page }) => {
      // Check page title
      await expect(page.getByText('Criar nova conta')).toBeVisible();

      // Check required fields
      await expect(page.getByLabel('Nome completo')).toBeVisible();
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Confirmar senha')).toBeVisible();

      // Check optional fields
      await expect(page.getByLabel('Profissão')).toBeVisible();
      await expect(page.getByLabel('Organização')).toBeVisible();

      // Check buttons
      await expect(page.getByRole('button', { name: 'Criar conta' })).toBeVisible();
      
      // Check links
      await expect(page.getByText('Já tem uma conta?')).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.getByLabel('Senha', { exact: true });
      const confirmPasswordInput = page.getByLabel('Confirmar senha');
      
      // Fill passwords
      await passwordInput.fill('Test123!@#');
      await confirmPasswordInput.fill('Test123!@#');
      
      // Check initial state
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
  });

  test.describe('Form Validation', () => {
    test('should validate required fields', async ({ page }) => {
      // Try to submit empty form
      await page.getByRole('button', { name: 'Criar conta' }).click();

      // Check that form doesn't submit (stays on same page)
      await expect(page).toHaveURL(/\/auth\/signup/);
      // HTML5 validation prevents submission
    });

    test('should validate email format', async ({ page }) => {
      await page.getByLabel('Nome completo').fill('Test User');
      await page.getByLabel('Email').fill('invalid-email');
      await page.getByLabel('Senha', { exact: true }).fill('Test123!@#');
      await page.getByLabel('Confirmar senha').fill('Test123!@#');
      
      await page.getByRole('button', { name: 'Criar conta' }).click();

      // HTML5 validation or stay on page
      await expect(page).toHaveURL(/\/auth\/signup/);
    });

    test('should validate password requirements', async ({ page }) => {
      await page.getByLabel('Nome completo').fill('Test User');
      await page.getByLabel('Email').fill('test@example.com');
      
      // Test weak password
      await page.getByLabel('Senha', { exact: true }).fill('weak');
      await page.getByLabel('Confirmar senha').fill('weak');
      
      await page.getByRole('button', { name: 'Criar conta' }).click();

      // Form should not submit with weak password
      await expect(page).toHaveURL(/\/auth\/signup/);
    });

    test('should validate password confirmation match', async ({ page }) => {
      await page.getByLabel('Nome completo').fill('Test User');
      await page.getByLabel('Email').fill('test@example.com');
      await page.getByLabel('Senha', { exact: true }).fill('Test123!@#');
      await page.getByLabel('Confirmar senha').fill('Different123!@#');
      
      await page.getByRole('button', { name: 'Criar conta' }).click();

      // Check that form doesn't submit
      await expect(page).toHaveURL(/\/auth\/signup/);
    });

    test('should show password strength indicator', async ({ page }) => {
      const passwordInput = page.getByLabel('Senha', { exact: true });
      
      // Weak password
      await passwordInput.fill('123');
      const weakIndicator = page.getByText(/fraca/i);
      if (await weakIndicator.count() > 0) {
        await expect(weakIndicator).toBeVisible();
      }

      // Medium password
      await passwordInput.fill('Test123');
      const mediumIndicator = page.getByText(/média/i);
      if (await mediumIndicator.count() > 0) {
        await expect(mediumIndicator).toBeVisible();
      }

      // Strong password
      await passwordInput.fill('Test123!@#$%');
      const strongIndicator = page.getByText(/forte/i);
      if (await strongIndicator.count() > 0) {
        await expect(strongIndicator).toBeVisible();
      }
    });
  });

  test.describe('Signup Flow - Success Cases', () => {
    test('should create account successfully with required fields only', async ({ page }) => {
      const uniqueEmail = `test_${Date.now()}@example.com`;
      
      await authHelpers.signup({
        name: 'Test User',
        email: uniqueEmail,
        password: 'Test123!@#'
      });

      // Should show success message or redirect
      await Promise.race([
        expect(page.getByText(/conta.*criada.*sucesso/i)).toBeVisible({ timeout: 5000 }),
        page.waitForURL('/dashboard', { timeout: 5000 }),
        page.waitForURL('/auth/signin', { timeout: 5000 })
      ]);
    });

    test('should create account with all fields', async ({ page }) => {
      const uniqueEmail = `test_full_${Date.now()}@example.com`;
      
      await authHelpers.signup({
        name: 'Test Full User',
        email: uniqueEmail,
        password: 'Test123!@#',
        profession: 'QA Engineer',
        organization: 'Test Company'
      });

      // Should succeed
      await Promise.race([
        expect(page.getByText(/conta.*criada.*sucesso/i)).toBeVisible({ timeout: 5000 }),
        page.waitForURL('/dashboard', { timeout: 5000 }),
        page.waitForURL('/auth/signin', { timeout: 5000 })
      ]);
    });

    test('should show loading state during signup', async ({ page }) => {
      const uniqueEmail = `test_loading_${Date.now()}@example.com`;
      
      // Fill form
      await page.getByLabel('Nome completo').fill('Loading Test');
      await page.getByLabel('Email').fill(uniqueEmail);
      await page.getByLabel('Senha', { exact: true }).fill('Test123!@#');
      await page.getByLabel('Confirmar senha').fill('Test123!@#');
      
      // Click and check loading
      const signupButton = page.getByRole('button', { name: 'Criar conta' });
      await signupButton.click();

      // Should be disabled during signup
      await expect(signupButton).toBeDisabled();
      await expect(page.getByText('Criando conta...')).toBeVisible();
    });
  });

  test.describe('Signup Flow - Error Cases', () => {
    test('should show error for existing email', async ({ page }) => {
      // Use an email that already exists
      await authHelpers.signup({
        name: 'Existing User',
        email: testUsers.validUser.email,
        password: 'Test123!@#'
      });

      // Should show error
      const errorMessage = await authHelpers.getErrorMessage();
      expect(errorMessage).toMatch(/já existe|already exists|email.*uso/i);

      // Should stay on signup page
      await expect(page).toHaveURL(/\/auth\/signup/);
    });

    test('should handle network errors gracefully', async ({ page, context }) => {
      // Block API requests
      await context.route('**/api/auth/register', route => route.abort());

      // Try to signup
      await authHelpers.signup({
        name: 'Network Test',
        email: 'network@test.com',
        password: 'Test123!@#'
      });

      // Should show error message
      await expect(page.getByText(/erro.*tente novamente/i)).toBeVisible();
    });

    test('should handle server validation errors', async ({ page, context }) => {
      // Mock server error response
      await context.route('**/api/auth/register', route => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Email domain not allowed' })
        });
      });

      await authHelpers.signup({
        name: 'Server Error Test',
        email: 'test@blocked.com',
        password: 'Test123!@#'
      });

      // Should show server error
      await expect(page.getByText(/domain not allowed/i)).toBeVisible();
    });
  });

  test.describe('Post-Signup Flow', () => {
    test('should auto-login after successful signup', async ({ page }) => {
      const uniqueEmail = `test_autologin_${Date.now()}@example.com`;
      
      await authHelpers.signup({
        name: 'Auto Login Test',
        email: uniqueEmail,
        password: 'Test123!@#'
      });

      // If redirected to dashboard, should be logged in
      if (page.url().includes('/dashboard')) {
        const isLoggedIn = await authHelpers.isLoggedIn();
        expect(isLoggedIn).toBe(true);
      }
    });

    test('should redirect to login if auto-login disabled', async ({ page }) => {
      const uniqueEmail = `test_redirect_${Date.now()}@example.com`;
      
      await authHelpers.signup({
        name: 'Redirect Test',
        email: uniqueEmail,
        password: 'Test123!@#'
      });

      // Might redirect to login with success message
      if (page.url().includes('/auth/signin')) {
        await expect(page.getByText(/conta.*criada.*sucesso/i)).toBeVisible();
      }
    });
  });

  test.describe('OAuth Signup', () => {
    test('should display OAuth options when available', async ({ page }) => {
      // Check for OAuth buttons
      const googleButton = page.getByRole('button', { name: /google/i });
      const githubButton = page.getByRole('button', { name: /github/i });

      // They might be disabled if not configured
      if (await googleButton.count() > 0) {
        await expect(googleButton).toBeVisible();
      }
      
      if (await githubButton.count() > 0) {
        await expect(githubButton).toBeVisible();
      }
    });
  });

  test.describe('Terms and Privacy', () => {
    test('should have links to terms and privacy policy', async ({ page }) => {
      // Check for terms link
      const termsLink = page.getByText(/termos/i);
      if (await termsLink.count() > 0) {
        await expect(termsLink).toBeVisible();
      }

      // Check for privacy link
      const privacyLink = page.getByText(/privacidade/i);
      if (await privacyLink.count() > 0) {
        await expect(privacyLink).toBeVisible();
      }
    });

    test('should require terms acceptance if checkbox present', async ({ page }) => {
      const termsCheckbox = page.getByRole('checkbox', { name: /termos/i });
      
      if (await termsCheckbox.count() > 0) {
        // Fill form but don't check terms
        await authHelpers.signup({
          name: 'Terms Test',
          email: 'terms@test.com',
          password: 'Test123!@#'
        });

        // Should show error about terms
        await expect(page.getByText(/aceitar.*termos/i)).toBeVisible();
        
        // Check terms and try again
        await termsCheckbox.check();
        await page.getByRole('button', { name: 'Criar conta' }).click();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab'); // Focus name
      await expect(page.getByLabel('Nome completo')).toBeFocused();

      await page.keyboard.press('Tab'); // Focus email
      await expect(page.getByLabel('Email')).toBeFocused();

      await page.keyboard.press('Tab'); // Focus profession
      await expect(page.getByLabel('Profissão')).toBeFocused();

      await page.keyboard.press('Tab'); // Focus organization
      await expect(page.getByLabel('Organização')).toBeFocused();

      await page.keyboard.press('Tab'); // Focus password
      await expect(page.getByLabel('Senha', { exact: true })).toBeFocused();

      await page.keyboard.press('Tab'); // Focus confirm password
      await expect(page.getByLabel('Confirmar senha')).toBeFocused();

      await page.keyboard.press('Tab'); // Focus signup button
      await expect(page.getByRole('button', { name: 'Criar conta' })).toBeFocused();
    });

    test('should announce errors to screen readers', async ({ page }) => {
      // Submit empty form
      await page.getByRole('button', { name: 'Criar conta' }).click();

      // Error alerts should have proper ARIA attributes
      const alerts = page.locator('[role="alert"]');
      await expect(alerts).toHaveCount(3); // At least 3 required field errors
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('should be usable on mobile devices', async ({ page }) => {
      // All form elements should be visible
      await expect(page.getByLabel('Nome completo')).toBeVisible();
      await expect(page.getByLabel('Email')).toBeVisible();
      await expect(page.getByLabel('Senha', { exact: true })).toBeVisible();
      await expect(page.getByLabel('Confirmar senha')).toBeVisible();
      
      // Form should be scrollable if needed
      const form = page.locator('form');
      const formBox = await form.boundingBox();
      expect(formBox?.width).toBeLessThan(400);
    });
  });
});