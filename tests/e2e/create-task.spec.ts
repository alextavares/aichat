import { test, expect } from '@playwright/test';

test.describe('Task Creation Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/auth/signin');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard'); // Assuming task creation is accessible from dashboard
  });

  test('should create a new task', async ({ page }) => {
    const taskDescription = 'Minha nova tarefa de teste: Comprar mantimentos';

    // Assuming there's a text area or input for new tasks, similar to chat
    // You might need to adjust the selector based on your actual UI
    const taskInput = page.getByPlaceholder('Digite sua mensagem...'); // Or a more specific task input selector
    const submitButton = page.getByRole('button', { name: 'Enviar' }); // Or a more specific submit button selector

    await taskInput.fill(taskDescription);
    await submitButton.click();

    // Verify the task appears on the page
    // This selector might need adjustment based on how tasks are displayed
    await expect(page.getByText(taskDescription)).toBeVisible();
  });
});
