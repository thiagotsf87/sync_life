import { test, expect } from '@playwright/test'

test.describe('Landing', () => {
  test('exibe logo e links Entrar / Criar conta', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Criar conta' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Sua vida em sincronia/i })).toBeVisible()
  })
})

test.describe('Login', () => {
  test('redireciona para /login ao clicar em Entrar', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible()
  })

  test('exibe erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('invalido@teste.com')
    await page.getByRole('textbox', { name: 'Senha' }).fill('senhaerrada')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page.getByText('E-mail ou senha incorretos')).toBeVisible({ timeout: 5000 })
  })

  test('exibe link Esqueceu a senha e Criar conta grátis', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: 'Esqueceu a senha?' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Criar conta grátis' })).toBeVisible()
  })

  test('permanece em /login ao submeter com campos vazios', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL('/login')
    await expect(page.getByText('E-mail ou senha incorretos')).not.toBeVisible()
  })

  test('navegação Login → Cadastro', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('link', { name: 'Criar conta grátis' }).click()
    await expect(page).toHaveURL('/cadastro')
    await expect(page.getByRole('heading', { name: 'Criar conta grátis' })).toBeVisible()
  })
})

test.describe('Cadastro', () => {
  test('formulário de cadastro carrega e botão fica habilitado após termos', async ({ page }) => {
    await page.goto('/cadastro')
    await expect(page.getByRole('heading', { name: 'Criar conta grátis' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Criar minha conta' })).toBeDisabled()
    await page.getByRole('textbox', { name: 'Nome completo' }).fill('Teste')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('teste@example.com')
    await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('SenhaForte123!')
    await page.getByRole('textbox', { name: 'Confirmar senha' }).fill('SenhaForte123!')
    await page.getByRole('checkbox', { name: /Termos de Uso/ }).click()
    await expect(page.getByRole('button', { name: 'Criar minha conta' })).toBeEnabled()
  })

  test('link Fazer login leva para /login', async ({ page }) => {
    await page.goto('/cadastro')
    await page.getByRole('link', { name: 'Fazer login' }).click()
    await expect(page).toHaveURL('/login')
  })

  test('exibe erro ao cadastrar com senha com menos de 6 caracteres', async ({ page }) => {
    await page.goto('/cadastro')
    await page.getByRole('textbox', { name: 'Nome completo' }).fill('Teste Silva')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('teste@example.com')
    await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('12345')
    await page.getByRole('textbox', { name: 'Confirmar senha' }).fill('12345')
    await page.getByRole('checkbox', { name: /Termos de Uso/ }).click()
    await page.evaluate(() => {
      const form = document.querySelector('form')
      if (form) (form as HTMLFormElement).noValidate = true
    })
    await page.getByRole('button', { name: 'Criar minha conta' }).click()
    await expect(page.getByText('A senha deve ter pelo menos 6 caracteres')).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL('/cadastro')
  })

  test('exibe erro quando senhas não coincidem', async ({ page }) => {
    await page.goto('/cadastro')
    await page.getByRole('textbox', { name: 'Nome completo' }).fill('Teste Silva')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('teste@example.com')
    await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('SenhaForte123!')
    await page.getByRole('textbox', { name: 'Confirmar senha' }).fill('OutraSenha123!')
    await page.getByRole('checkbox', { name: /Termos de Uso/ }).click()
    await page.getByRole('button', { name: 'Criar minha conta' }).click()
    await expect(page.getByText('As senhas não coincidem')).toBeVisible({ timeout: 5000 })
    await expect(page).toHaveURL('/cadastro')
  })

  test('botão Criar minha conta permanece desabilitado sem aceitar termos', async ({ page }) => {
    await page.goto('/cadastro')
    await page.getByRole('textbox', { name: 'Nome completo' }).fill('Teste')
    await page.getByRole('textbox', { name: 'E-mail' }).fill('teste@example.com')
    await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('SenhaForte123!')
    await page.getByRole('textbox', { name: 'Confirmar senha' }).fill('SenhaForte123!')
    await expect(page.getByRole('button', { name: 'Criar minha conta' })).toBeDisabled()
  })
})

test.describe('Esqueceu senha', () => {
  test('formulário e envio exibem sucesso', async ({ page }) => {
    await page.goto('/esqueceu-senha')
    await expect(page.getByRole('heading', { name: 'Esqueceu a senha?' })).toBeVisible()
    await page.getByRole('textbox', { name: 'E-mail' }).fill('teste@example.com')
    await page.getByRole('button', { name: 'Enviar link de recuperação' }).click()
    await expect(page.getByRole('heading', { name: 'E-mail enviado!' })).toBeVisible({ timeout: 8000 })
    await expect(page.getByRole('link', { name: 'Voltar para o login' })).toBeVisible()
  })

  test('Voltar para login leva para /login', async ({ page }) => {
    await page.goto('/esqueceu-senha')
    await page.getByRole('link', { name: 'Voltar para login' }).click()
    await expect(page).toHaveURL('/login')
  })
})

test.describe('Rotas protegidas', () => {
  test('acesso a /dashboard sem login redireciona para /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('acesso a /transacoes sem login redireciona para /login', async ({ page }) => {
    await page.goto('/transacoes')
    await expect(page).toHaveURL('/login')
  })

  test('acesso a /configuracoes sem login redireciona para /login', async ({ page }) => {
    await page.goto('/configuracoes')
    await expect(page).toHaveURL('/login')
  })
})
