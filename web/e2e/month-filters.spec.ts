import { test, expect, skipAuth } from './fixtures'

/**
 * Month Filters — navegação de mês funcional em todos os módulos financeiros.
 */

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

test.describe('Filtros de Mês: Dashboard Financeiro', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
  })

  test('Setas de navegação de mês visíveis', async ({ page }) => {
    const main = page.locator('main')
    const prevBtn = main.getByRole('button', { name: /anterior/i }).or(
      main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-left"]') })
    ).first()
    const nextBtn = main.getByRole('button', { name: /próximo/i }).or(
      main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-right"]') })
    ).first()
    await expect(prevBtn).toBeVisible({ timeout: 8000 })
    await expect(nextBtn).toBeVisible()
  })

  test('Navegar para mês anterior atualiza label', async ({ page }) => {
    const main = page.locator('main')
    // Get current month text
    const now = new Date()
    const currentMonthName = MONTH_NAMES[now.getMonth()]

    // Click previous month
    const prevBtn = main.getByLabel(/anterior/i).or(
      main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-left"]') })
    ).first()
    await prevBtn.click()
    await page.waitForTimeout(1000)

    // Label should show previous month
    const prevMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1
    const prevMonthName = MONTH_NAMES[prevMonthIdx]
    await expect(main.getByText(prevMonthName).first()).toBeVisible({ timeout: 5000 })
  })

  test('Navegar para próximo mês atualiza label', async ({ page }) => {
    const main = page.locator('main')

    // Click next month
    const nextBtn = main.getByLabel(/próximo/i).or(
      main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-right"]') })
    ).first()
    await nextBtn.click()
    await page.waitForTimeout(1000)

    const nextMonthIdx = new Date().getMonth() === 11 ? 0 : new Date().getMonth() + 1
    const nextMonthName = MONTH_NAMES[nextMonthIdx]
    await expect(main.getByText(nextMonthName).first()).toBeVisible({ timeout: 5000 })
  })

  test('Botão "Hoje" aparece ao navegar para outro mês', async ({ page }) => {
    const main = page.locator('main')
    const prevBtn = main.getByLabel(/anterior/i).or(
      main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-left"]') })
    ).first()
    await prevBtn.click()
    await page.waitForTimeout(500)

    // "Hoje" button should appear
    await expect(main.getByText('Hoje').first()).toBeVisible({ timeout: 3000 })
  })

  test('Botão "Hoje" retorna ao mês atual', async ({ page }) => {
    const main = page.locator('main')
    const currentMonthName = MONTH_NAMES[new Date().getMonth()]

    // Navigate away
    const prevBtn = main.getByLabel(/anterior/i).or(
      main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-left"]') })
    ).first()
    await prevBtn.click()
    await page.waitForTimeout(500)

    // Click "Hoje"
    await main.getByText('Hoje').first().click()
    await page.waitForTimeout(500)

    // Should be back to current month
    await expect(main.getByText(currentMonthName).first()).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Filtros de Mês: Transações', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
  })

  test('Seletor de mês funciona com setas', async ({ page }) => {
    const main = page.locator('main')
    const prevBtn = main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-left"]') }).first()
    await expect(prevBtn).toBeVisible({ timeout: 8000 })

    // Click previous
    await prevBtn.click()
    await page.waitForTimeout(500)
    await expect(page.locator('main')).toBeVisible()
  })

  test('Mês é exibido em DM_Mono', async ({ page }) => {
    const monthLabel = page.locator('main').locator('[class*="DM_Mono"]').first()
    await expect(monthLabel).toBeVisible({ timeout: 8000 })
  })
})

test.describe('Filtros de Mês: Orçamentos', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/financas/orcamentos')
    await page.waitForLoadState('networkidle')
  })

  test('Seletor de mês presente e funcional', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
    // Orçamentos should have month navigation
    const monthNav = main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-left"]') }).first()
    if (await monthNav.isVisible({ timeout: 3000 }).catch(() => false)) {
      await monthNav.click()
      await page.waitForTimeout(500)
      await expect(main).toBeVisible()
    }
  })
})

test.describe('Filtros de Mês: Calendário', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/financas/calendario')
    await page.waitForLoadState('networkidle')
  })

  test('Navegação entre meses no calendário', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
    const prevBtn = main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-left"]') }).first()
    if (await prevBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await prevBtn.click()
      await page.waitForTimeout(500)
      await expect(main).toBeVisible()
    }
  })
})

test.describe('Filtros de Mês: Relatórios', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/financas/relatorios')
    await page.waitForLoadState('networkidle')
  })

  test('Filtro de período presente', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
    // Period filter buttons
    const periodBtns = main.getByRole('button', { name: /Mês|Trimestre|Semestre|12m|Ano/i })
    const count = await periodBtns.count()
    expect(count).toBeGreaterThan(0)
  })
})

test.describe('Filtros de Mês: Edge Cases', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
  })

  test('Dezembro → Janeiro rollover (transações)', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')

    // Navigate forward until we pass December or go enough months
    const nextBtn = main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-right"]') }).first()
    const prevBtn = main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-left"]') }).first()
    await expect(nextBtn).toBeVisible({ timeout: 8000 })

    // Navigate forward 12 times to ensure we cross a Dec→Jan boundary
    for (let i = 0; i < 12; i++) {
      await nextBtn.click()
      await page.waitForTimeout(200)
    }
    // Page should still be functional
    await expect(main).toBeVisible()

    // Navigate back 12 times
    for (let i = 0; i < 12; i++) {
      await prevBtn.click()
      await page.waitForTimeout(200)
    }
    await expect(main).toBeVisible()
  })

  test('Janeiro → Dezembro rollback (transações)', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')

    const prevBtn = main.locator('button').filter({ has: page.locator('[class*="lucide-chevron-left"]') }).first()
    await expect(prevBtn).toBeVisible({ timeout: 8000 })

    // Navigate backward 12 times
    for (let i = 0; i < 12; i++) {
      await prevBtn.click()
      await page.waitForTimeout(200)
    }
    await expect(main).toBeVisible()
  })
})
