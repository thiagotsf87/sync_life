import { test, expect } from '@playwright/test'

/**
 * Testes de layout: estrutura das telas (comparação com layouts aprovados nos protótipos)
 * e regressão visual por screenshot.
 * Viewport fixo para screenshots consistentes.
 */
const LAYOUT_VIEWPORT = { width: 1280, height: 720 }

test.describe('Layout - Estrutura (telas públicas)', () => {
  test('Landing: elementos aprovados visíveis', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /sistema operacional/i })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Entrar', exact: true }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Começar grátis/ }).first()).toBeVisible()
  })

  test('Login: elementos aprovados visíveis', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /Bem-vindo de volta/i })).toBeVisible()
    await expect(page.getByText('Entre na sua conta para continuar evoluindo.')).toBeVisible()
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.locator('#password')).toBeVisible()
    await expect(page.getByRole('link', { name: /Esqueci minha senha/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Entrar/ })).toBeVisible()
    await expect(page.getByText(/ou entre com e-mail/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /Continuar com Google/i })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Criar conta grátis' })).toBeVisible()
  })

  test('Cadastro: elementos aprovados visíveis', async ({ page }) => {
    await page.goto('/cadastro')
    await expect(page.getByRole('heading', { name: /Criar conta grátis/i })).toBeVisible()
    await expect(page.getByText('Comece sua jornada de organização hoje.')).toBeVisible()
    await expect(page.getByLabel('Nome completo')).toBeVisible()
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByLabel('Senha', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Confirmar senha')).toBeVisible()
    await expect(page.getByLabel(/Termos de Uso/)).toBeVisible()
    await expect(page.getByRole('button', { name: /Criar minha conta/ })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Fazer login' })).toBeVisible()
  })

  test('Esqueceu senha: elementos aprovados visíveis', async ({ page }) => {
    await page.goto('/esqueceu-senha')
    await expect(page.getByRole('link', { name: /Voltar para login/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Esqueceu a senha/i })).toBeVisible()
    await expect(page.getByText(/e-mail/i).first()).toBeVisible()
    await expect(page.getByLabel('E-mail')).toBeVisible()
    await expect(page.getByRole('button', { name: /Enviar link de recuperação/i })).toBeVisible()
  })
})

test.describe('Layout - Regressão visual (screenshot)', () => {
  test.use({ viewport: LAYOUT_VIEWPORT })

  test('Landing - screenshot', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveScreenshot('layout-landing.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Login - screenshot', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveScreenshot('layout-login.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Cadastro - screenshot', async ({ page }) => {
    await page.goto('/cadastro')
    await expect(page).toHaveScreenshot('layout-cadastro.png', { maxDiffPixelRatio: 0.02 })
  })

  test('Esqueceu senha - screenshot', async ({ page }) => {
    await page.goto('/esqueceu-senha')
    await expect(page).toHaveScreenshot('layout-esqueceu-senha.png', { maxDiffPixelRatio: 0.02 })
  })
})

const testEmail = process.env.PLAYWRIGHT_TEST_EMAIL
const testPassword = process.env.PLAYWRIGHT_TEST_PASSWORD
const skipAuth = !testEmail || !testPassword

test.describe('Layout - Estrutura (telas autenticadas)', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(skipAuth, 'Defina PLAYWRIGHT_TEST_EMAIL e PLAYWRIGHT_TEST_PASSWORD para testes de layout autenticado')
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'E-mail' }).fill(testEmail!)
    await page.getByRole('textbox', { name: 'Senha' }).fill(testPassword!)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/(dashboard|financas)/, { timeout: 15000 })
  })

  test('Dashboard: elementos aprovados visíveis', async ({ page }) => {
    // Login redireciona para /financas — verificar que carregou conteúdo autenticado
    await expect(page.getByText('Receitas').first()).toBeVisible({ timeout: 8000 })
    await expect(page.getByText('Despesas').first()).toBeVisible({ timeout: 5000 })
  })

  test('Transações: elementos aprovados visíveis', async ({ page }) => {
    await page.goto('/transacoes')
    await expect(page).toHaveURL('/transacoes')
    await expect(page.getByRole('button', { name: /Nova transação|Nova Transação/i })).toBeVisible({ timeout: 5000 })
  })

  test('Modal Nova transação: elementos aprovados visíveis', async ({ page }) => {
    await page.goto('/transacoes')
    await page.getByRole('button', { name: /Nova transação|Nova Transação/i }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText(/Nova Transação/i)).toBeVisible({ timeout: 3000 })
    await expect(dialog.getByText('Tipo de transação')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Despesa' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Receita' })).toBeVisible()
    await expect(dialog.getByRole('textbox', { name: 'Descrição' })).toBeVisible()
    await expect(dialog.getByLabel('Valor')).toBeVisible()
    await expect(dialog.getByLabel('Data')).toBeVisible()
    await expect(dialog.getByText('Categoria')).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Cancelar' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Salvar transação' })).toBeVisible()
  })
})
