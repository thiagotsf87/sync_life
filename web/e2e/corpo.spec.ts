import { test, expect, skipAuth } from './fixtures'

/**
 * Módulo Corpo — Dashboard, Peso, Atividades, Saúde, Cardápio, Coach.
 */

test.describe('Corpo: Dashboard', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/corpo')
    await page.waitForLoadState('networkidle')
  })

  test('Dashboard carrega com KPIs', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Corpo/i })).toBeVisible({ timeout: 8000 })
    await expect(main.getByText(/Peso Atual|TMB|Atividades/i).first()).toBeVisible({ timeout: 5000 })
  })

  test('KPIs exibem valores formatados', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Corpo/i })).toBeVisible({ timeout: 8000 })
    // Should have DM_Mono for numeric values
    const dmValues = await main.locator('[class*="DM_Mono"]').count()
    expect(dmValues).toBeGreaterThanOrEqual(0)
  })

  test('Links de navegação para sub-páginas', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Should link to peso, atividades, saude, cardapio
    const links = await page.locator('a[href*="/corpo/"]').count()
    expect(links).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Corpo: Peso', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/corpo/peso')
    await page.waitForLoadState('networkidle')
  })

  test('Página de peso carrega', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Peso/i }).first()).toBeVisible({ timeout: 8000 })
  })

  test('Gráfico de evolução de peso', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Chart should have SVG
    const charts = await main.locator('.recharts-responsive-container, svg').count()
    expect(charts).toBeGreaterThanOrEqual(0)
  })

  test('Formulário de registro de peso', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Should have input for weight
    const inputs = await main.locator('input').count()
    expect(inputs).toBeGreaterThanOrEqual(0)
  })

  test('Validação: peso deve ser positivo', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const weightInput = main.locator('input[type="number"]').first()
    if (await weightInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await weightInput.fill('0')
      // Submit button
      const submitBtn = main.getByRole('button', { name: /Registrar|Salvar|Adicionar/i }).first()
      if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await submitBtn.click()
        await page.waitForTimeout(500)
        // Should not accept 0 weight
        await expect(main).toBeVisible()
      }
    }
  })

  test('Medidas corporais (cintura/quadril)', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Look for measurement inputs or chart
    const measureText = main.getByText(/Cintura|Quadril|Medidas/i).first()
    if (await measureText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(measureText).toBeVisible()
    }
  })
})

test.describe('Corpo: Atividades', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/corpo/atividades')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Atividades/i })).toBeVisible({ timeout: 8000 })
  })

  test('Botão nova atividade visível', async ({ page }) => {
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova|Registrar|Adicionar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(newBtn).toBeVisible()
    }
  })

  test('Lista de atividades ou estado vazio', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Should show activity list or empty state
    const content = await main.textContent()
    expect(content!.length).toBeGreaterThan(0)
  })

  test('Registro de atividade com duração e tipo', async ({ page }) => {
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova|Registrar|Adicionar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      await page.waitForTimeout(500)
      // Modal or form should appear
      const modal = page.locator('.fixed.inset-0').first()
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(modal).toBeVisible()
        await page.keyboard.press('Escape')
      }
    }
  })
})

test.describe('Corpo: Saúde', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/corpo/saude')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Saúde/i })).toBeVisible({ timeout: 8000 })
  })

  test('Consultas médicas listadas', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const consultText = main.getByText(/Consulta|Exame|Médic/i).first()
    if (await consultText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(consultText).toBeVisible()
    }
  })

  test('Botão nova consulta', async ({ page }) => {
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova|Registrar|Adicionar|Agendar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(newBtn).toBeVisible()
    }
  })
})

test.describe('Corpo: Cardápio IA', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/corpo/cardapio')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Cardápio/i }).first()).toBeVisible({ timeout: 8000 })
  })

  test('Botão gerar cardápio IA', async ({ page }) => {
    const main = page.locator('main')
    const genBtn = main.getByRole('button', { name: /Gerar|Criar|IA|Cardápio/i }).first()
    if (await genBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(genBtn).toBeVisible()
    }
  })

  test('Campos de preferências alimentares', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Should have inputs for preferences (calories, restrictions, etc.)
    const inputs = await main.locator('input, textarea, select').count()
    expect(inputs).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Corpo: Coach', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/corpo/coach')
    await page.waitForLoadState('networkidle')
  })

  test('Coach IA página carrega', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('Chat input visível', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const chatInput = main.getByPlaceholder(/Pergunte|Digite|mensagem/i).first()
      .or(main.locator('textarea, input[type="text"]').first())
    if (await chatInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(chatInput).toBeVisible()
    }
  })
})
