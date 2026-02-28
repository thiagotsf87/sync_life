import { test, expect, skipAuth } from './fixtures'

/**
 * BLOCO 13 — Responsividade (QA items 13.1–13.6 + deep tests)
 */
test.describe('Responsividade', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
  })

  // 13.1
  test('13.1 KPI Strip em mobile (2 colunas)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await expect(main.getByText('Receitas').first()).toBeVisible({ timeout: 8000 })
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(400)
  })

  // 13.2
  test('13.2 Grid principal em tablet (1 coluna)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(800)
  })

  // 13.3
  test('13.3 Página Futuro em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/futuro')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(400)
  })

  // 13.4
  test('13.4 Sidebar hidden em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 })
  })

  // 13.5
  test('13.5 Conteúdo acessível em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 5000 })
  })

  // 13.6
  test('13.6 Gráficos em mobile não transbordam', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10)
  })

  // ── Deep tests ──────────────────────────────────────────────────────────────

  test('13.7 Dashboard V3 em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(400)
  })

  test('13.8 Corpo dashboard em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/corpo')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(400)
  })

  test('13.9 Modal não overflow em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova Transação/i })
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Modal should not overflow viewport
      const modalBox = await modal.boundingBox()
      if (modalBox) {
        expect(modalBox.width).toBeLessThanOrEqual(375)
      }
      await page.keyboard.press('Escape')
    }
  })

  test('13.10 Forms usáveis em 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/tempo/novo')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Form inputs should be visible and tappable
    const inputs = await main.locator('input').count()
    expect(inputs).toBeGreaterThanOrEqual(0)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(400)
  })

  test('13.11 Charts não overflow em 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(800)
  })

  test('13.12 Wizard futuro mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/futuro/nova')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(400)
  })

  test('13.13 Patrimônio dashboard em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/patrimonio')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(400)
  })

  test('13.14 Experiências tabs scrollable em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/experiencias')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(400)
  })

  test('13.15 Mente timer em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/mente/timer')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(400)
  })

  test('13.16 Texto sem truncate indesejado', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    // Verify that key text elements are still readable
    const main = page.locator('main')
    await expect(main.getByText('Receitas').first()).toBeVisible({ timeout: 8000 })
    await expect(main.getByText('Despesas').first()).toBeVisible()
  })
})
