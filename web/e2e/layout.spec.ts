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
    await expect(page.getByRole('heading', { name: /Sua vida em sincronia/i })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Criar conta' })).toBeVisible()
  })

  test('Login: elementos aprovados visíveis', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Sua vida em sincronia')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible()
    await expect(page.getByText('Entre para continuar sua jornada')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'E-mail' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Senha' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Esqueceu a senha?' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: 'Manter conectado' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByText('ou continue com')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continuar com Google' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Criar conta grátis' })).toBeVisible()
  })

  test('Cadastro: elementos aprovados visíveis', async ({ page }) => {
    await page.goto('/cadastro')
    await expect(page.getByRole('heading', { name: 'Criar conta grátis' })).toBeVisible()
    await expect(page.getByText('Preencha os dados abaixo para começar')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Nome completo' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'E-mail' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Senha', exact: true })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Confirmar senha' })).toBeVisible()
    await expect(page.getByRole('checkbox', { name: /Termos de Uso/ })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Criar minha conta' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Fazer login' })).toBeVisible()
  })

  test('Esqueceu senha: elementos aprovados visíveis', async ({ page }) => {
    await page.goto('/esqueceu-senha')
    await expect(page.getByRole('link', { name: 'Voltar para login' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Esqueceu a senha?' })).toBeVisible()
    await expect(page.getByText('Digite seu e-mail e enviaremos um link')).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'E-mail' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Enviar link de recuperação' })).toBeVisible()
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
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 })
  })

  test('Dashboard: elementos aprovados visíveis', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Dashboard|Visão geral/i })).toBeVisible({ timeout: 5000 })
    await expect(page.getByText(/Receitas|Despesas|Saldo/i)).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Despesas por categoria')).toBeVisible({ timeout: 5000 })
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
