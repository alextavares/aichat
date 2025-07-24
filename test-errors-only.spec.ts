import { test } from "@playwright/test";

test("Capturar erros específicos", async ({ page }) => {
  const errors = [];
  
  page.on("console", msg => {
    if (msg.type() === "error") {
      console.log("ERROR:", msg.text());
      errors.push(msg.text());
    }
  });
  
  page.on("response", response => {
    if (response.status() >= 400) {
      console.log("HTTP ERROR:", response.status(), response.url());
    }
  });
  
  await page.goto("http://localhost:3050/auth/signin");
  await page.locator("input[id=\"email\"]").fill("11@gmail.com");
  await page.locator("input[id=\"password\"]").fill("Y*mare2025");
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.waitForTimeout(2000);
  
  await page.goto("http://localhost:3050/dashboard/chat");
  await page.waitForTimeout(3000);
  
  console.log("Total errors:", errors.length);
  errors.forEach(error => console.log("- " + error));
});
