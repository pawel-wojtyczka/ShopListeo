import { test as setup } from "@playwright/test";

setup("authenticate", async ({ page }) => {
  // Navigate to login page
  await page.goto("/login");

  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error("Test environment variables TEST_USER_EMAIL and TEST_USER_PASSWORD must be set");
  }

  // Perform login
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-button"]');

  // Wait for successful login
  await page.waitForURL("/home");

  // Save signed-in state
  await page.context().storageState({
    path: "./e2e/.auth/user.json",
  });
});
