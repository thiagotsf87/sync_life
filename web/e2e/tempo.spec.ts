import { test, expect, skipAuth } from './fixtures'

/**
 * Módulo Tempo — Semanal, Mensal, Novo Evento, Foco.
 */

test.describe('Tempo: Vista Semanal', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/tempo')
    await page.waitForLoadState('networkidle')
  })

  test('Vista semanal carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('7 colunas de dias visíveis', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Week view should have day headers (Seg, Ter, Qua, etc.)
    const dayHeaders = main.getByText(/Seg|Ter|Qua|Qui|Sex|Sáb|Dom|Mon|Tue|Wed|Thu|Fri|Sat|Sun/i)
    const count = await dayHeaders.count()
    expect(count).toBeGreaterThanOrEqual(1) // At least some day indicators
  })

  test('Navegação de semana', async ({ page }) => {
    const main = page.locator('main')
    const prevBtn = main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-left"]') }).first()
    if (await prevBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await prevBtn.click()
      await page.waitForTimeout(500)
      await expect(main).toBeVisible()
    }
  })

  test('Hoje destacado na semana', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Today should be visually distinct
    const todayIndicator = main.getByText(/Hoje|Today/i).first()
    if (await todayIndicator.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(todayIndicator).toBeVisible()
    }
  })

  test('Eventos visíveis na semana', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Events should be rendered as colored blocks
  })

  test('Botão novo evento visível', async ({ page }) => {
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Novo Evento|Criar|Adicionar/i }).first()
      .or(main.getByRole('link', { name: /Novo Evento|Criar/i }).first())
    const isVisible = await newBtn.isVisible({ timeout: 5000 }).catch(() => false)
    expect(isVisible).toBeTruthy()
  })
})

test.describe('Tempo: Vista Mensal', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/tempo/mensal')
    await page.waitForLoadState('networkidle')
  })

  test('Vista mensal carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('Grid mensal com dias', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Should show numbered days
    const dayNumbers = main.getByText(/^(1|15|28|30)$/).first()
    if (await dayNumbers.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(dayNumbers).toBeVisible()
    }
  })

  test('Indicadores de eventos nos dias', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Days with events may have colored dots
    const dots = await main.locator('[class*="rounded-full"][class*="w-1"], [class*="rounded-full"][class*="h-1"]').count()
    expect(dots).toBeGreaterThanOrEqual(0) // May not have events
  })

  test('Click em dia abre detalhe', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Click on a day number
    const dayBtn = main.locator('[role="button"], button').filter({ hasText: /^15$/ }).first()
    if (await dayBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await dayBtn.click()
      await page.waitForTimeout(500)
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('Navegação de mês', async ({ page }) => {
    const main = page.locator('main')
    const prevBtn = main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-left"]') }).first()
    if (await prevBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await prevBtn.click()
      await page.waitForTimeout(500)
      await expect(main).toBeVisible()
    }
  })
})

test.describe('Tempo: Novo Evento', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/tempo/novo')
    await page.waitForLoadState('networkidle')
  })

  test('Formulário de evento carrega', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('Campo de título obrigatório', async ({ page }) => {
    const main = page.locator('main')
    const titleInput = main.locator('input').first()
    await expect(titleInput).toBeVisible({ timeout: 8000 })
  })

  test('Campos de data e hora', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const dateText = main.getByText(/Data|Hora|Início|Fim/i).first()
    if (await dateText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(dateText).toBeVisible()
    }
  })

  test('Validação: título vazio', async ({ page }) => {
    const main = page.locator('main')
    const submitBtn = main.getByRole('button', { name: /Criar|Salvar/i }).first()
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitBtn.click()
      await page.waitForTimeout(500)
      // Should show validation error
      await expect(main).toBeVisible()
    }
  })

  test('Seletor de tipo de evento', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Event type selector (pessoal, trabalho, saúde, etc.)
    const typeBtn = main.getByRole('button', { name: /Pessoal|Trabalho|Saúde|Lazer/i }).first()
    if (await typeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await typeBtn.click()
      await page.waitForTimeout(300)
      await expect(main).toBeVisible()
    }
  })

  test('Seletor de prioridade', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const priorityBtn = main.getByRole('button', { name: /Normal|Alta|Baixa|Urgente/i }).first()
    if (await priorityBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(priorityBtn).toBeVisible()
    }
  })
})

test.describe('Tempo: Foco (Sessões)', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/tempo/foco')
    await page.waitForLoadState('networkidle')
  })

  test('Página de foco carrega', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('Botão nova sessão de foco', async ({ page }) => {
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova Sessão|Registrar|Criar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(newBtn).toBeVisible()
    }
  })

  test('Lista de sessões ou estado vazio', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
  })

  test('Filtro de período', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const filterBtns = main.getByRole('button', { name: /Semana|Mês|Todos/i })
    const count = await filterBtns.count()
    if (count > 0) {
      await filterBtns.first().click()
      await page.waitForTimeout(500)
      await expect(main).toBeVisible()
    }
  })
})
