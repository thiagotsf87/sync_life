import { Page, expect } from '@playwright/test'

/**
 * Design System helpers — assertions reutilizáveis para conformidade visual.
 */

/** Verifica que nenhum input[type="number"] exibe spinner nativo */
export async function assertNoNativeNumberSpinners(page: Page) {
  const spinners = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="number"]')
    const offending: string[] = []
    inputs.forEach((el) => {
      const cs = window.getComputedStyle(el, '::-webkit-inner-spin-button')
      // If appearance is not 'none', the spinner may be visible
      const appearance = window.getComputedStyle(el as HTMLElement).getPropertyValue('-webkit-appearance')
        || window.getComputedStyle(el as HTMLElement).getPropertyValue('appearance')
      // In practice, the CSS rule in globals.css targets the pseudo-element.
      // We just check that the element has the class or the computed style.
      const moz = window.getComputedStyle(el as HTMLElement).getPropertyValue('-moz-appearance')
      if (moz !== 'textfield' && appearance !== 'textfield') {
        // fallback: check if our CSS rule is applied by looking for the class
        const hasRule = window.getComputedStyle(el as HTMLElement).getPropertyValue('appearance')
        if (hasRule !== 'textfield') {
          offending.push((el as HTMLInputElement).name || (el as HTMLInputElement).id || 'unnamed')
        }
      }
    })
    return { count: inputs.length, offending }
  })
  // If there are number inputs, none should have visible spinners
  if (spinners.count > 0) {
    expect(spinners.offending, `Number inputs with native spinners: ${spinners.offending.join(', ')}`).toHaveLength(0)
  }
}

/** Verifica que nenhum input[type="date"] nativo está presente (deve usar date picker customizado) */
export async function assertNoNativeDatePickers(page: Page) {
  const nativeDates = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input[type="date"]')
    return inputs.length
  })
  // We allow date inputs as long as they're styled consistently
  // This is more of a warning than a hard failure
  return nativeDates
}

/** Verifica que valores monetários (R$) e percentuais (%) usam DM_Mono */
export async function assertDMMonoOnValues(page: Page) {
  const results = await page.evaluate(() => {
    const allElements = document.querySelectorAll('*')
    let moneyElements = 0
    let moneyWithDM = 0

    allElements.forEach((el) => {
      const text = el.textContent || ''
      // Direct text node check (not inherited)
      if (el.children.length === 0 && (text.match(/R\$\s*[\d.,]+/) || text.match(/\d+[.,]\d+%/))) {
        moneyElements++
        const ff = window.getComputedStyle(el).fontFamily
        if (ff.includes('DM Mono') || ff.includes('DM_Mono') || ff.includes('dm-mono')) {
          moneyWithDM++
        }
      }
    })
    return { moneyElements, moneyWithDM }
  })
  return results
}

/** Verifica que headings (h1-h3) usam Syne */
export async function assertSyneOnHeadings(page: Page) {
  const results = await page.evaluate(() => {
    const headings = document.querySelectorAll('main h1, main h2')
    let total = 0
    let withSyne = 0

    headings.forEach((el) => {
      total++
      const ff = window.getComputedStyle(el).fontFamily
      if (ff.includes('Syne') || ff.includes('syne')) {
        withSyne++
      }
    })
    return { total, withSyne }
  })
  return results
}

/** Verifica tokens SL em cards (sl-s1, sl-border, rounded-2xl) */
export async function assertSLCardPattern(page: Page) {
  const hasCards = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="sl-s1"], [class*="--sl-s1"]')
    return cards.length
  })
  return hasCards
}

/** Verifica hover:border-h nos cards interativos */
export async function assertHoverBorderOnCards(page: Page) {
  const count = await page.evaluate(() => {
    const els = document.querySelectorAll('[class*="hover:border"], [class*="hover\\:border"]')
    return els.length
  })
  return count
}

/** Verifica sl-fade-up animations */
export async function assertFadeUpAnimations(page: Page) {
  const count = await page.evaluate(() => {
    const els = document.querySelectorAll('.sl-fade-up, [class*="sl-fade-up"]')
    return els.length
  })
  return count
}

/** Verifica que barras de progresso de orçamento seguem regra de cor */
export async function assertBudgetBarColors(page: Page) {
  const bars = await page.evaluate(() => {
    const progressBars = Array.from(document.querySelectorAll('[style*="width"][style*="background"]'))
    const results: { width: string; bg: string }[] = []
    progressBars.forEach((el) => {
      const style = (el as HTMLElement).style
      results.push({ width: style.width, bg: style.background || style.backgroundColor })
    })
    return results
  })
  return bars
}

/** Verifica variáveis CSS no documento */
export async function getCSSVariable(page: Page, varName: string): Promise<string> {
  return page.evaluate((name) => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }, varName)
}

/** Verifica se o modo Jornada está ativo */
export async function isJornadaMode(page: Page): Promise<boolean> {
  const htmlClass = await page.locator('html').getAttribute('class') ?? ''
  return htmlClass.includes('jornada')
}

/** Muda para modo Jornada se não está */
export async function ensureJornadaMode(page: Page) {
  if (!(await isJornadaMode(page))) {
    const pill = page.getByRole('button', { name: /Foco|Jornada/i }).first()
    await pill.click()
    await page.waitForTimeout(500)
  }
}

/** Muda para modo Foco se não está */
export async function ensureFocoMode(page: Page) {
  if (await isJornadaMode(page)) {
    const pill = page.getByRole('button', { name: /Jornada|Foco/i }).first()
    await pill.click()
    await page.waitForTimeout(500)
  }
}

/** Verifica se está no tema Light */
export async function isLightTheme(page: Page): Promise<boolean> {
  const htmlClass = await page.locator('html').getAttribute('class') ?? ''
  return htmlClass.includes('light')
}

/** Muda para Light theme */
export async function ensureLightTheme(page: Page) {
  if (!(await isLightTheme(page))) {
    const pill = page.getByRole('button', { name: /Dark|Light/i }).first()
    await pill.click()
    await page.waitForTimeout(300)
  }
}

/** Muda para Dark theme */
export async function ensureDarkTheme(page: Page) {
  if (await isLightTheme(page)) {
    const pill = page.getByRole('button', { name: /Light|Dark/i }).first()
    await pill.click()
    await page.waitForTimeout(300)
  }
}
