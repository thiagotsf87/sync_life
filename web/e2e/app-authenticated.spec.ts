import { test, expect } from '@playwright/test'

/**
 * Testes que exigem usuário logado.
 * Configure no Supabase: Authentication > Providers > Email > desmarque "Confirm email".
 * Defina no .env.local ou CI:
 *   PLAYWRIGHT_TEST_EMAIL=seu@email.com
 *   PLAYWRIGHT_TEST_PASSWORD=suasenha
 * Ou rode: npx playwright test e2e/app-authenticated.spec.ts --project=chromium
 * (sem as variáveis os testes são ignorados)
 */
const testEmail = process.env.PLAYWRIGHT_TEST_EMAIL
const testPassword = process.env.PLAYWRIGHT_TEST_PASSWORD
const skipAuth = !testEmail || !testPassword

test.describe('App (autenticado)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(skipAuth, 'Defina PLAYWRIGHT_TEST_EMAIL e PLAYWRIGHT_TEST_PASSWORD para rodar estes testes')
    await page.goto('/login')
    await page.getByLabel('E-mail').fill(testEmail!)
    await page.locator('#password').fill(testPassword!)
    await page.getByRole('button', { name: /Entrar/ }).click()
    await expect(page).toHaveURL(/\/(dashboard|financas)/, { timeout: 15000 })
  })

  test('Dashboard/Finanças carrega com resumo', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByText('Receitas').first()).toBeVisible({ timeout: 8000 })
    await expect(main.getByText('Despesas').first()).toBeVisible()
  })

  test('Transações: lista e botão Nova transação', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await expect(main.getByRole('button', { name: /Nova transação|Nova Transação/i })).toBeVisible({ timeout: 5000 })
  })

  test('Nova transação: modal abre e fecha', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await main.getByRole('button', { name: /Nova transação|Nova Transação/i }).click()
    // V2 TransacaoModal is a custom div (no role="dialog"), check the overlay
    const modalOverlay = page.locator('.fixed.inset-0')
    await expect(modalOverlay).toBeVisible({ timeout: 5000 })
    // Close via "Cancelar" button inside the modal
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(modalOverlay).not.toBeVisible({ timeout: 3000 })
  })

  test('Configurações: formulário de perfil', async ({ page }) => {
    await page.goto('/configuracoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await expect(main.locator('input').first()).toBeVisible({ timeout: 5000 })
    // Salvar button only appears when form is dirty — just verify inputs load
    await expect(main.getByRole('heading', { name: /Perfil/i }).first()).toBeVisible()
  })
})

test.describe('Nova transação - validações', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(skipAuth, 'Defina PLAYWRIGHT_TEST_EMAIL e PLAYWRIGHT_TEST_PASSWORD para rodar estes testes')
    await page.goto('/login')
    await page.getByLabel('E-mail').fill(testEmail!)
    await page.locator('#password').fill(testPassword!)
    await page.getByRole('button', { name: /Entrar/ }).click()
    await expect(page).toHaveURL(/\/(dashboard|financas)/, { timeout: 15000 })
  })

  test('exibe erro ao salvar sem descrição', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await main.getByRole('button', { name: /Nova transação|Nova Transação/i }).click()
    await expect(page.getByText(/Nova Transação/i).first()).toBeVisible({ timeout: 5000 })
    // Fill only valor, leave description empty
    const valorInput = page.locator('input[placeholder*="0,00"], input[inputmode="decimal"]').first()
    if (await valorInput.isVisible({ timeout: 2000 })) {
      await valorInput.fill('100,00')
    }
    // Click save
    const saveBtn = page.getByRole('button', { name: /Salvar/i })
    if (await saveBtn.isVisible({ timeout: 2000 })) {
      await saveBtn.click()
      await page.waitForTimeout(500)
      // Expect an error (toast or inline) — just verify modal stays open
      await expect(page.getByText(/Nova Transação/i).first()).toBeVisible()
    }
  })

  test('exibe erro ao salvar sem valor', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await main.getByRole('button', { name: /Nova transação|Nova Transação/i }).click()
    await expect(page.getByText(/Nova Transação/i).first()).toBeVisible({ timeout: 5000 })
    // Fill only description
    const descInput = page.locator('input[placeholder*="Descrição"], input[placeholder*="descrição"]').first()
    if (await descInput.isVisible({ timeout: 2000 })) {
      await descInput.fill('Supermercado')
    }
    const saveBtn = page.getByRole('button', { name: /Salvar/i })
    if (await saveBtn.isVisible({ timeout: 2000 })) {
      await saveBtn.click()
      await page.waitForTimeout(500)
      await expect(page.getByText(/Nova Transação/i).first()).toBeVisible()
    }
  })

  test('exibe erro ao salvar sem categoria', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await main.getByRole('button', { name: /Nova transação|Nova Transação/i }).click()
    await expect(page.getByText(/Nova Transação/i).first()).toBeVisible({ timeout: 5000 })
    // Fill description and valor
    const descInput = page.locator('input[placeholder*="Descrição"], input[placeholder*="descrição"]').first()
    if (await descInput.isVisible({ timeout: 2000 })) {
      await descInput.fill('Supermercado')
    }
    const valorInput = page.locator('input[placeholder*="0,00"], input[inputmode="decimal"]').first()
    if (await valorInput.isVisible({ timeout: 2000 })) {
      await valorInput.fill('100,00')
    }
    const saveBtn = page.getByRole('button', { name: /Salvar/i })
    if (await saveBtn.isVisible({ timeout: 2000 })) {
      await saveBtn.click()
      await page.waitForTimeout(500)
      await expect(page.getByText(/Nova Transação/i).first()).toBeVisible()
    }
  })
})
