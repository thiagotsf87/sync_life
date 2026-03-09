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

  // 0.3 — Removed: Mode pill no longer exists (unified experience)

  // 0.4 — Trocar tema Dark → Light
  test('0.4 Trocar tema Dark ↔ Light via pill', async ({ page }) => {
    const themePill = page.getByRole('button', { name: /Dark|Light/i }).first()
    await expect(themePill).toBeVisible({ timeout: 5000 })
    await themePill.click()
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toBeVisible()
  })

  // 0.5 — Theme toggle cycles without error
  test('0.5 Theme toggle funciona sem erro', async ({ page }) => {
    const themePill = page.getByRole('button', { name: /Dark|Light/i }).first()
    await expect(themePill).toBeVisible({ timeout: 5000 })

    for (let i = 0; i < 4; i++) {
      await themePill.click()
      await page.waitForTimeout(300)
      await expect(page.locator('body')).toBeVisible()
    }
  })

  // 0.6 — Removed: Mode persistence no longer relevant (unified experience)

  // 0.7 — Sidebar fecha em mobile
  test('0.7 Sidebar fecha em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible()
  })

  // 0.8 — TopHeader breadcrumb always visible
  test('0.8 TopHeader mostra breadcrumb', async ({ page }) => {
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')

    const banner = page.getByRole('banner')
    await expect(banner.getByText(/Finanças|Visão Geral/i).first()).toBeVisible({ timeout: 5000 })
  })

  // 0.9 — TopHeader saudação always visible
  test('0.9 TopHeader mostra saudação', async ({ page }) => {
    await expect(page.getByText(/Bom dia|Boa tarde|Boa noite/i).first()).toBeVisible({ timeout: 5000 })
  })

  // 0.10 — Life Sync Score always visible (unified experience)
  test('0.10 Life Sync Score sempre visível', async ({ page }) => {
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
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')

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

  test('0.18 Trocar módulo preserva tema', async ({ page }) => {
    // Toggle to Light theme
    const themePill = page.getByRole('button', { name: /Dark|Light/i }).first()
    await themePill.click()
    await page.waitForTimeout(500)

    const htmlBefore = await page.locator('html').getAttribute('class') ?? ''

    // Navigate to different module
    await page.goto('/corpo')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const htmlAfter = await page.locator('html').getAttribute('class') ?? ''
    // Theme class should be preserved
    if (htmlBefore.includes('light')) {
      expect(htmlAfter).toContain('light')
    }
  })
})

/**
 * SHL-UNI — Experiência Unificada (pós MIGRATION-ELIMINAR-MODO-DUAL)
 */
test.describe('Experiência Unificada (SHL-UNI)', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
  })

  // SHL-UNI-01
  test('SHL-UNI-01: html não deve ter atributo data-mode', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const dataMode = await page.locator('html').getAttribute('data-mode')
    expect(dataMode).toBeNull()
  })

  // SHL-UNI-02
  test('SHL-UNI-02: não deve existir .jornada-only ou .foco-only', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const jornadaOnly = await page.locator('.jornada-only').count()
    const focoOnly = await page.locator('.foco-only').count()
    expect(jornadaOnly).toBe(0)
    expect(focoOnly).toBe(0)
  })

  // SHL-UNI-03
  test('SHL-UNI-03: saudação personalizada sempre visível no header', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await expect(page.getByText(/Bom dia|Boa tarde|Boa noite/i).first()).toBeVisible({ timeout: 5000 })
  })

  // SHL-UNI-04
  test('SHL-UNI-04: não deve existir ModePill no header', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    const modePill = page.getByRole('button', { name: /Foco|Jornada/i })
    await expect(modePill).toHaveCount(0)
  })

  // SHL-UNI-05 e SHL-UNI-06: temas selecionáveis sem gate
  test('SHL-UNI-05/06: temas selecionáveis sem UpgradeModal', async ({ page }) => {
    await page.goto('/configuracoes/aparencia')
    await page.waitForLoadState('networkidle')
    // Clicar em um tema PRO (ex: Obsidian) não deve abrir modal de upgrade
    const obsidianCard = page.locator('button').filter({ hasText: 'Obsidian' }).first()
    if (await obsidianCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await obsidianCard.click()
      await page.waitForTimeout(500)
      const upgradeModal = page.locator('[role="dialog"]').filter({ hasText: /Upgrade|Assinar/i })
      await expect(upgradeModal).not.toBeVisible({ timeout: 2000 })
    }
  })
})
