import { test, expect } from "@playwright/test";

test.describe("InnerAI Chat System - Login e Teste Completo", () => {
  test("Login e teste do sistema de chat", async ({ page }) => {
    console.log(" Iniciando teste do sistema de chat com login...");

    // Capturar erros do console
    const consoleErrors = [];
    page.on("console", msg => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
        console.log(" Console Error:", msg.text());
      }
    });

    try {
      // 1. Navegar para a página de login
      console.log(" Navegando para página de login...");
      await page.goto("http://localhost:3050/auth/signin", { waitUntil: "networkidle" });
      await page.screenshot({ path: "test-screenshots/01-login-page.png" });

      // 2. Fazer login
      console.log(" Preenchendo credenciais...");
      await page.locator("input[id=\"email\"]").fill("11@gmail.com");
      await page.locator("input[id=\"password\"]").fill("Y*mare2025");
      await page.screenshot({ path: "test-screenshots/02-login-filled.png" });

      // 3. Clicar no botão de login
      await page.getByRole("button", { name: "Entrar" }).click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: "test-screenshots/03-after-login.png" });

      // 4. Navegar para chat
      console.log(" Navegando para chat...");
      await page.goto("http://localhost:3050/dashboard/chat", { waitUntil: "networkidle" });
      await page.screenshot({ path: "test-screenshots/04-chat-page.png" });

      // 5. Testar chat
      const chatInput = page.locator("textarea").first();
      if (await chatInput.isVisible()) {
        console.log(" Input de chat encontrado!");
        await chatInput.fill("Olá! Teste do sistema.");
        await page.screenshot({ path: "test-screenshots/05-message-typed.png" });
        
        // Tentar enviar
        await chatInput.press("Enter");
        await page.waitForTimeout(3000);
        await page.screenshot({ path: "test-screenshots/06-final.png" });
      } else {
        console.log(" Input de chat não encontrado");
      }

      console.log(" Teste concluído!");
    } catch (error) {
      console.error(" Erro:", error);
      await page.screenshot({ path: "test-screenshots/error.png" });
    }
  });
});
