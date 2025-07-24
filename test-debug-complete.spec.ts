import { test, expect } from "@playwright/test";

test.describe("Debug Completo - Captura de Erros", () => {
  test("Capturar todos os logs e erros", async ({ page }) => {
    const consoleErrors = [];
    const networkErrors = [];
    const consoleLogs = [];

    // Capturar erros do console
    page.on("console", msg => {
      const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
      consoleLogs.push(text);
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
        console.log(" Console Error:", msg.text());
      }
    });

    // Capturar erros de rede
    page.on("response", response => {
      if (response.status() >= 400) {
        const error = `${response.status()} - ${response.url()}`;
        networkErrors.push(error);
        console.log(" Network Error:", error);
      }
    });

    // Capturar erros JavaScript
    page.on("pageerror", error => {
      console.log(" JS Error:", error.message);
    });

    try {
      console.log(" Iniciando debug completo...");
      
      // 1. Homepage
      await page.goto("http://localhost:3050/", { waitUntil: "networkidle" });
      await page.screenshot({ path: "test-screenshots/debug-01-homepage.png" });
      
      // 2. Login
      await page.goto("http://localhost:3050/auth/signin", { waitUntil: "networkidle" });
      await page.screenshot({ path: "test-screenshots/debug-02-login.png" });
      
      // 3. Fazer login
      await page.locator("input[id=\"email\"]").fill("11@gmail.com");
      await page.locator("input[id=\"password\"]").fill("Y*mare2025");
      await page.getByRole("button", { name: "Entrar" }).click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: "test-screenshots/debug-03-after-login.png" });
      
      // 4. Chat
      await page.goto("http://localhost:3050/dashboard/chat", { waitUntil: "networkidle" });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: "test-screenshots/debug-04-chat.png" });
      
      // 5. Testar chat
      const chatInput = page.locator("textarea").first();
      if (await chatInput.isVisible()) {
        await chatInput.fill("Teste de debug");
        await chatInput.press("Enter");
        await page.waitForTimeout(5000);
        await page.screenshot({ path: "test-screenshots/debug-05-message-sent.png" });
      }
      
      // Relatório
      console.log(" RELATÓRIO:");
      console.log(`Erros Console: ${consoleErrors.length}`);
      console.log(`Erros Rede: ${networkErrors.length}`);
      
      if (consoleErrors.length > 0) {
        console.log(" ERROS CONSOLE:");
        consoleErrors.forEach(error => console.log(`- ${error}`));
      }
      
      if (networkErrors.length > 0) {
        console.log(" ERROS REDE:");
        networkErrors.forEach(error => console.log(`- ${error}`));
      }
      
    } catch (error) {
      console.error(" Erro:", error);
      await page.screenshot({ path: "test-screenshots/debug-error.png" });
    }
  });
});
