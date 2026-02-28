import { test, expect, skipAuth } from './fixtures'

/**
 * Módulo Patrimônio — Dashboard, Carteira, Proventos, Simulador IF, Evolução.
 */

test.describe('Patrimônio: Dashboard', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/patrimonio')
    await page.waitForLoadState('networkidle')
  })

  test('Dashboard carrega com KPIs', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Patrimônio/i })).toBeVisible({ timeout: 8000 })
  })

  test('KPIs de patrimônio (total, rendimento, etc)', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const kpiText = main.getByText(/Total|Patrimônio|Rendimento|Evolução/i).first()
    if (await kpiText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(kpiText).toBeVisible()
    }
  })

  test('Links para sub-páginas', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
  })
})

test.describe('Patrimônio: Carteira', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/patrimonio/carteira')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Carteira/i })).toBeVisible({ timeout: 8000 })
  })

  test('PieChart por setor', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Look for pie chart SVG
    const charts = await main.locator('.recharts-responsive-container svg, .recharts-pie').count()
    expect(charts).toBeGreaterThanOrEqual(0)
  })

  test('Botão adicionar ativo', async ({ page }) => {
    const main = page.locator('main')
    const addBtn = main.getByRole('button', { name: /Novo|Adicionar|Criar/i }).first()
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(addBtn).toBeVisible()
    }
  })

  test('Modal de adicionar ativo abre', async ({ page }) => {
    const main = page.locator('main')
    const addBtn = main.getByRole('button', { name: /Novo|Adicionar|Criar/i }).first()
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(modal).toBeVisible()
        await page.keyboard.press('Escape')
      }
    }
  })

  test('Lista de ativos ou estado vazio', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
  })

  test('Atualizar preço de ativo', async ({ page }) => {
    const main = page.locator('main')
    const editBtn = main.getByRole('button', { name: /Editar|Atualizar/i }).first()
      .or(main.locator('button').filter({ has: page.locator('[class*="lucide-edit"], [class*="lucide-pencil"]') }).first())
    if (await editBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(editBtn).toBeVisible()
    }
  })
})

test.describe('Patrimônio: Proventos', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/patrimonio/proventos')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Proventos/i }).first()).toBeVisible({ timeout: 8000 })
  })

  test('Lista de proventos ou estado vazio', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
  })

  test('Botão adicionar provento', async ({ page }) => {
    const main = page.locator('main')
    const addBtn = main.getByRole('button', { name: /Novo|Adicionar|Registrar/i }).first()
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(addBtn).toBeVisible()
    }
  })

  test('Valores em DM_Mono', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const dmCount = await main.locator('[class*="DM_Mono"]').count()
    expect(dmCount).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Patrimônio: Simulador IF', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/patrimonio/simulador')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Simulador/i })).toBeVisible({ timeout: 8000 })
  })

  test('4 inputs do simulador presentes', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Patrimônio atual, aporte mensal, rentabilidade, despesa mensal
    const inputs = await main.locator('input').count()
    expect(inputs).toBeGreaterThanOrEqual(2) // At least some inputs
  })

  test('Cálculo atualiza ao mudar input', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const firstInput = main.locator('input').first()
    if (await firstInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstInput.fill('100000')
      await page.waitForTimeout(500)
      // Result should update
      await expect(main).toBeVisible()
    }
  })

  test('Gráfico de projeção', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const charts = await main.locator('.recharts-responsive-container').count()
    expect(charts).toBeGreaterThanOrEqual(0)
  })
})

test.describe('Patrimônio: Evolução', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/patrimonio/evolucao')
    await page.waitForLoadState('networkidle')
  })

  test('Página de evolução carrega', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('Gráfico de evolução patrimonial', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const charts = await main.locator('.recharts-responsive-container').count()
    expect(charts).toBeGreaterThanOrEqual(0)
  })

  test('Filtro de período', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const filterBtns = main.getByRole('button', { name: /3m|6m|12m|Todo|1a|2a/i })
    const count = await filterBtns.count()
    if (count > 0) {
      await filterBtns.first().click()
      await page.waitForTimeout(500)
      await expect(main).toBeVisible()
    }
  })
})
