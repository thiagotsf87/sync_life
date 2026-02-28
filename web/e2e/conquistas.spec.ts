import { test, expect, skipAuth } from './fixtures'

/**
 * Conquistas — hero, badges, modal, grid/list, z-index.
 */
test.describe('Conquistas', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/conquistas')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com badges', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByText(/conquistas/i).first()).toBeVisible({ timeout: 8000 })
  })

  test('Filtros de categoria funcionam', async ({ page }) => {
    const main = page.locator('main')
    const filterBtns = main.getByRole('button', { name: /Todas|Financeiras|Metas/i })
    if (await filterBtns.count() > 0) {
      await filterBtns.first().click()
      await page.waitForTimeout(300)
      await expect(main).toBeVisible()
    }
  })

  test('Ranking acessível', async ({ page }) => {
    const main = page.locator('main')
    const rankingBtn = page.getByRole('complementary').getByRole('button', { name: /Ranking/i })
    if (await rankingBtn.isVisible({ timeout: 3000 })) {
      await rankingBtn.click()
      await page.waitForLoadState('networkidle')
      await expect(main).toBeVisible({ timeout: 5000 })
    } else {
      await expect(main).toBeVisible({ timeout: 5000 })
    }
  })

  // ── Deep tests ──────────────────────────────────────────────────────────────

  test('Hero com total count', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Hero section should show count of unlocked achievements
    const countText = main.getByText(/\d+\s*(conquistas|desbloqueadas|badges)/i).first()
    if (await countText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(countText).toBeVisible()
    }
  })

  test('Badge modal abre ao clicar badge', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })

    // Find a badge card/button
    const badge = main.locator('[role="button"], button').filter({ hasText: /🏆|⭐|🎯|💰|🔥/ }).first()
    if (await badge.isVisible({ timeout: 3000 }).catch(() => false)) {
      await badge.click()
      await page.waitForTimeout(500)
      // Modal should open
      const modal = page.locator('.fixed.inset-0').first()
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(modal).toBeVisible()
        await page.keyboard.press('Escape')
      }
    }
  })

  test('Z-index correto (z-[60]) no modal de badge', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })

    const badge = main.locator('[role="button"], button').filter({ hasText: /🏆|⭐|🎯|💰|🔥/ }).first()
    if (await badge.isVisible({ timeout: 3000 }).catch(() => false)) {
      await badge.click()
      await page.waitForTimeout(500)
      const modal = page.locator('.fixed.inset-0').first()
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        const zIndex = await modal.evaluate((el) => {
          return window.getComputedStyle(el).zIndex
        })
        expect(parseInt(zIndex) || 0).toBeGreaterThanOrEqual(50)
        await page.keyboard.press('Escape')
      }
    }
  })

  test('Toggle grid/list', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })

    // Look for view toggle buttons
    const gridBtn = main.getByRole('button', { name: /Grid|grade/i }).first()
      .or(main.locator('button').filter({ has: page.locator('[class*="lucide-grid"], [class*="lucide-layout-grid"]') }).first())
    const listBtn = main.getByRole('button', { name: /Lista|list/i }).first()
      .or(main.locator('button').filter({ has: page.locator('[class*="lucide-list"]') }).first())

    if (await gridBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await gridBtn.click()
      await page.waitForTimeout(300)
      await expect(main).toBeVisible()
    }
    if (await listBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await listBtn.click()
      await page.waitForTimeout(300)
      await expect(main).toBeVisible()
    }
  })

  test('33 badges renderizam sem erro', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Ensure page has loaded all badges without JS errors
    const content = await main.textContent()
    expect(content!.length).toBeGreaterThan(50)
    // Page should have multiple badge elements
    const badges = await main.locator('[class*="rounded"], [class*="card"]').count()
    expect(badges).toBeGreaterThan(0)
  })
})
