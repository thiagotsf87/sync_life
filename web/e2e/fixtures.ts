import { test as base, expect } from '@playwright/test'

/**
 * Fixture de autenticação reutilizável.
 * Faz login uma vez e compartilha a sessão entre todos os testes do describe.
 */
const testEmail = process.env.PLAYWRIGHT_TEST_EMAIL
const testPassword = process.env.PLAYWRIGHT_TEST_PASSWORD
export const skipAuth = !testEmail || !testPassword

export const test = base.extend<{ authenticatedPage: void }>({
  authenticatedPage: [
    async ({ page }, use) => {
      base.skip(skipAuth, 'Defina PLAYWRIGHT_TEST_EMAIL e PLAYWRIGHT_TEST_PASSWORD')
      await page.goto('/login')
      await page.getByRole('textbox', { name: 'E-mail' }).fill(testEmail!)
      await page.getByRole('textbox', { name: 'Senha' }).fill(testPassword!)
      await page.getByRole('button', { name: 'Entrar' }).click()
      await expect(page).toHaveURL(/\/(dashboard|financas)/, { timeout: 15000 })
      await use()
    },
    { auto: false },
  ],
})

export { expect }
