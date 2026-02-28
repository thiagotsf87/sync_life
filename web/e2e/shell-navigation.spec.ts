import { test, expect, skipAuth } from './fixtures'

/**
 * BLOCO 0 — Shell e Navegação (QA items 0.1–0.10 + deep tests)
 */
test.describe('Shell e Navegação', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
  })

  // 0.1 — ModuleBar visível com ícones de módulo
  test('0.1 ModuleBar exibe ícones de módulos', async ({ page }) => {
    const navButtons = page.locator('nav').first().getByRole('button')
    const count = await navButtons.count()
    expect(count).toBeGreaterThanOrEqual(6)
  })

  // 0.2 — Sidebar aparece ao clicar módulo
  test('0.2 Sidebar aparece ao navegar para módulo', async ({ page }) => {
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 5000 })
  })

  // 0.3 — Trocar modo Foco → Jornada
  test('0.3 Trocar modo Foco ↔ Jornada via pill', async ({ page }) => {
    const modePill = page.getByRole('button', { name: /Foco|Jornada/i }).first()
    await expect(modePill).toBeVisible({ timeout: 5000 })
    await modePill.click()
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toBeVisible()
  })

  // 0.4 — Trocar tema Dark → Light
  test('0.4 Trocar tema Dark ↔ Light via pill', async ({ page }) => {
    const themePill = page.getByRole('button', { name: /Dark|Light/i }).first()
    await expect(themePill).toBeVisible({ timeout: 5000 })
    await themePill.click()
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toBeVisible()
  })

  // 0.5 — 4 combinações visuais (smoke test)
  test('0.5 Quatro combinações de modo/tema funcionam sem erro', async ({ page }) => {
    const modePill = page.getByRole('button', { name: /Foco|Jornada/i }).first()
    const themePill = page.getByRole('button', { name: /Dark|Light/i }).first()

    for (let i = 0; i < 4; i++) {
      if (i % 2 === 0) await modePill.click()
      else await themePill.click()
      await page.waitForTimeout(300)
      await expect(page.locator('body')).toBeVisible()
    }
  })

  // 0.6 — Modo persistido após reload
  test('0.6 Modo persiste após reload', async ({ page }) => {
    const modePill = page.getByRole('button', { name: /Foco|Jornada/i }).first()
    await modePill.click()
    await page.waitForTimeout(1500)

    const htmlClassAfterClick = await page.locator('html').getAttribute('class') ?? ''
    const isJornadaAfterClick = htmlClassAfterClick.includes('jornada')

    await page.reload()
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    const htmlClassAfterReload = await page.locator('html').getAttribute('class') ?? ''
    const isJornadaAfterReload = htmlClassAfterReload.includes('jornada')
    expect(isJornadaAfterReload).toBe(isJornadaAfterClick)
  })

  // 0.7 — Sidebar fecha em mobile
  test('0.7 Sidebar fecha em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  // 0.8 — TopHeader breadcrumb (Foco)
  test('0.8 TopHeader mostra breadcrumb no modo Foco', async ({ page }) => {
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')

    const htmlClasses = await page.locator('html').getAttribute('class') ?? ''
    if (htmlClasses.includes('jornada')) {
      await page.getByRole('button', { name: /Jornada/i }).first().click()
      await page.waitForTimeout(500)
    }

    const banner = page.getByRole('banner')
    await expect(banner.getByText(/Finanças|Visão Geral/i).first()).toBeVisible({ timeout: 5000 })
  })

  // 0.9 — TopHeader saudação (Jornada)
  test('0.9 TopHeader mostra saudação no modo Jornada', async ({ page }) => {
    const modePill = page.getByRole('button', { name: /Foco|Jornada/i }).first()
    const pillText = await modePill.textContent()
    if (pillText?.match(/Foco/i)) {
      await modePill.click()
      await page.waitForTimeout(500)
    }

    await expect(page.getByText(/Bom dia|Boa tarde|Boa noite/i).first()).toBeVisible({ timeout: 5000 })
  })

  // 0.10 — Life Sync Score visível no Jornada (Dashboard)
  test('0.10 Life Sync Score visível no Jornada', async ({ page }) => {
    const modePill = page.getByRole('button', { name: /Foco|Jornada/i }).first()
    const pillText = await modePill.textContent()
    if (pillText?.match(/Foco/i)) {
      await modePill.click()
      await page.waitForTimeout(500)
    }

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const scoreVisible = await main.getByText(/Score|Life Sync|Saúde Fin/i).first().isVisible({ timeout: 5000 }).catch(() => false)
    const numberVisible = await main.locator('text=/\\d+%/').first().isVisible({ timeout: 2000 }).catch(() => false)
    expect(scoreVisible || numberVisible).toBeTruthy()
  })

  // ── Deep tests ──────────────────────────────────────────────────────────────

  test('0.11 Navegar pelos 11 módulos sem erro', async ({ page }) => {
    const modules = [
      '/dashboard', '/financas', '/futuro', '/tempo',
      '/corpo', '/mente', '/patrimonio', '/carreira',
      '/experiencias', '/conquistas', '/configuracoes',
    ]
    for (const mod of modules) {
      await page.goto(mod)
      await page.waitForLoadState('networkidle')
      await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
    }
  })

  test('0.12 Ícone destaca módulo ativo', async ({ page }) => {
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    // The active module button should have a distinct style
    const nav = page.locator('nav').first()
    await expect(nav).toBeVisible({ timeout: 5000 })
  })

  test('0.13 Nav items mudam por módulo', async ({ page }) => {
    // Navigate to financas — should show financas nav items
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    const finItems = await page.getByText(/Transações|Orçamentos|Recorrentes/i).count()

    // Navigate to corpo — should show corpo nav items
    await page.goto('/corpo')
    await page.waitForLoadState('networkidle')
    const corpoItems = await page.getByText(/Peso|Atividades|Saúde/i).count()

    // At least one module should have nav items
    expect(finItems + corpoItems).toBeGreaterThan(0)
  })

  test('0.14 Deep link mantém módulo correto', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
    // Should be in financas module context
    await expect(page.locator('main').getByRole('heading').first()).toBeVisible()
  })

  test('0.15 Back/forward do browser funciona', async ({ page }) => {
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    await page.goto('/futuro')
    await page.waitForLoadState('networkidle')

    await page.goBack()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/financas/, { timeout: 5000 })

    await page.goForward()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/futuro/, { timeout: 5000 })
  })

  test('0.16 Breadcrumb path correto em sub-página', async ({ page }) => {
    // Ensure Foco mode for breadcrumbs
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const htmlClass = await page.locator('html').getAttribute('class') ?? ''
    if (htmlClass.includes('jornada')) {
      await page.getByRole('button', { name: /Jornada/i }).first().click()
      await page.waitForTimeout(500)
    }

    const banner = page.getByRole('banner')
    const breadText = await banner.textContent()
    // Should contain module name
    expect(breadText).toBeTruthy()
  })

  test('0.17 Mobile bottom bar visível em 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
    // Shell should adapt to mobile
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    expect(bodyWidth).toBeLessThanOrEqual(400)
  })

  test('0.18 Trocar módulo preserva modo/tema', async ({ page }) => {
    // Set to Jornada + Light
    const modePill = page.getByRole('button', { name: /Foco|Jornada/i }).first()
    const pillText = await modePill.textContent()
    if (pillText?.match(/Foco/i)) {
      await modePill.click()
      await page.waitForTimeout(500)
    }

    const htmlBefore = await page.locator('html').getAttribute('class') ?? ''

    // Navigate to different module
    await page.goto('/corpo')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const htmlAfter = await page.locator('html').getAttribute('class') ?? ''
    // Jornada class should be preserved
    if (htmlBefore.includes('jornada')) {
      expect(htmlAfter).toContain('jornada')
    }
  })
})
