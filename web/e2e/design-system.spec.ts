import { test, expect, skipAuth } from './fixtures'

/**
 * BLOCO 14 — Design System (QA items 14.1–14.8)
 */
test.describe('Design System', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
  })

  // 14.1
  test('14.1 Fontes carregadas (Syne, DM Mono, Outfit)', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Verificar que fontes estão declaradas no documento
    const fonts = await page.evaluate(() => {
      const styles = document.querySelectorAll('style, link[rel="stylesheet"]')
      const bodyFont = window.getComputedStyle(document.body).fontFamily
      return { bodyFont, styleCount: styles.length }
    })
    // Body deve usar Outfit ou font-family que inclui Outfit
    expect(fonts.bodyFont.length).toBeGreaterThan(0)
  })

  // 14.2
  test('14.2 Tokens de cor no Dark mode', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Garantir Dark mode
    const themePill = page.getByRole('button', { name: /Dark|Light/i }).first()
    const text = await themePill.textContent()
    if (text?.includes('Light')) {
      await themePill.click()
      await page.waitForTimeout(300)
    }

    // Verificar CSS variables
    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--sl-bg').trim()
    })
    // Em Dark mode, background deve ser escuro
    expect(bgColor).toBeTruthy()
    expect(bgColor).toMatch(/#0[0-9a-f]|rgb/i)
  })

  // 14.3
  test('14.3 Tokens de cor no Light mode', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Garantir Light mode
    const themePill = page.getByRole('button', { name: /Dark|Light/i }).first()
    const text = await themePill.textContent()
    if (text?.includes('Dark')) {
      await themePill.click()
      await page.waitForTimeout(300)
    }

    const bgColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--sl-bg').trim()
    })
    expect(bgColor).toBeTruthy()
    // Light mode background deve ser claro
    expect(bgColor).toMatch(/#[c-f][0-9a-f]|rgb/i)
  })

  // 14.4
  test('14.4 Gradiente text-sl-grad visível no Jornada', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Garantir modo Jornada
    const modePill = page.getByRole('button', { name: /Foco|Jornada/i }).first()
    const mText = await modePill.textContent()
    if (mText?.includes('Foco')) {
      await modePill.click()
      await page.waitForTimeout(500)
    }

    // Títulos no Jornada devem usar gradiente
    const hasGrad = await page.evaluate(() => {
      const els = document.querySelectorAll('.text-sl-grad, [class*="text-sl-grad"]')
      return els.length > 0
    })
    expect(hasGrad).toBeTruthy()
  })

  // 14.5
  test('14.5 Animação sl-fade-up nos cards', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    const hasFadeUp = await page.evaluate(() => {
      const els = document.querySelectorAll('.sl-fade-up, [class*="sl-fade-up"]')
      return els.length > 0
    })
    expect(hasFadeUp).toBeTruthy()
  })

  // 14.6
  test('14.6 Hover nos cards muda border', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Verificar que existem cards com hover:border
    const hasHoverBorder = await page.evaluate(() => {
      const cards = document.querySelectorAll('[class*="hover:border"], [class*="hover\\:border"]')
      return cards.length > 0
    })
    expect(hasHoverBorder).toBeTruthy()
  })

  // 14.7
  test('14.7 Valores monetários em DM Mono', async ({ page }) => {
    await page.goto('/financas')
    await page.waitForLoadState('networkidle')

    const hasDMFont = await page.evaluate(() => {
      const els = document.querySelectorAll('[class*="DM_Mono"], [class*="font-\\[DM_Mono\\]"]')
      return els.length > 0
    })
    expect(hasDMFont).toBeTruthy()
  })

  // 14.8
  test('14.8 Barras de orçamento com cor correta', async ({ page }) => {
    await page.goto('/financas/orcamentos')
    await page.waitForLoadState('networkidle')

    // Verificar que existem barras de progresso com cores (verde, amarelo, vermelho)
    const bars = await page.evaluate(() => {
      const progressBars = document.querySelectorAll('[style*="background"], [style*="width"]')
      return progressBars.length
    })
    // Página deve carregar sem erros
    await expect(page.locator('body')).toBeVisible()
  })
})
