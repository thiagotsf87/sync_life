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
    await page.getByRole('textbox', { name: 'E-mail' }).fill(testEmail!)
    await page.getByRole('textbox', { name: 'Senha' }).fill(testPassword!)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
  })

  test('Dashboard carrega com resumo e gráficos', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Dashboard|Visão geral/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/Receitas|Despesas|Saldo/i)).toBeVisible({ timeout: 5000 })
  })

  test('Transações: lista e botão Nova transação', async ({ page }) => {
    await page.goto('/transacoes')
    await expect(page).toHaveURL('/transacoes')
    await expect(page.getByRole('button', { name: /Nova transação|Nova Transação/i })).toBeVisible({ timeout: 5000 })
  })

  test('Nova transação: modal abre e fecha', async ({ page }) => {
    await page.goto('/transacoes')
    await page.getByRole('button', { name: /Nova transação|Nova Transação/i }).click()
    await expect(page.getByRole('dialog').getByText(/Nova Transação|Editar Transação/i)).toBeVisible({ timeout: 3000 })
    await page.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('Configurações: formulário de perfil', async ({ page }) => {
    await page.goto('/configuracoes')
    await expect(page).toHaveURL('/configuracoes')
    await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible({ timeout: 5000 })
    await expect(page.getByLabel(/Nome completo|Nome/)).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('button', { name: /Salvar alterações/ })).toBeVisible()
  })
})

test.describe('Nova transação - validações', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(skipAuth, 'Defina PLAYWRIGHT_TEST_EMAIL e PLAYWRIGHT_TEST_PASSWORD para rodar estes testes')
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'E-mail' }).fill(testEmail!)
    await page.getByRole('textbox', { name: 'Senha' }).fill(testPassword!)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
  })

  test('exibe erro ao salvar sem descrição', async ({ page }) => {
    await page.goto('/transacoes')
    await page.getByRole('button', { name: /Nova transação|Nova Transação/i }).click()
    await expect(page.getByRole('dialog').getByText(/Nova Transação/i)).toBeVisible({ timeout: 3000 })
    await page.getByLabel('Valor').fill('100,00')
    await page.getByRole('button', { name: 'Salvar transação' }).click()
    await expect(page.getByText('Por favor, preencha a descrição')).toBeVisible({ timeout: 5000 })
  })

  test('exibe erro ao salvar sem valor', async ({ page }) => {
    await page.goto('/transacoes')
    await page.getByRole('button', { name: /Nova transação|Nova Transação/i }).click()
    await expect(page.getByRole('dialog').getByText(/Nova Transação/i)).toBeVisible({ timeout: 3000 })
    await page.getByRole('textbox', { name: 'Descrição' }).fill('Supermercado')
    await page.getByRole('button', { name: 'Salvar transação' }).click()
    await expect(page.getByText('Por favor, preencha o valor')).toBeVisible({ timeout: 5000 })
  })

  test('exibe erro ao salvar sem categoria', async ({ page }) => {
    await page.goto('/transacoes')
    await page.getByRole('button', { name: /Nova transação|Nova Transação/i }).click()
    await expect(page.getByRole('dialog').getByText(/Nova Transação/i)).toBeVisible({ timeout: 3000 })
    await page.getByRole('textbox', { name: 'Descrição' }).fill('Supermercado')
    await page.getByLabel('Valor').fill('100,00')
    await page.getByRole('button', { name: 'Salvar transação' }).click()
    await expect(page.getByText('Por favor, selecione uma categoria')).toBeVisible({ timeout: 5000 })
  })
})
