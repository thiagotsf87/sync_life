import { Page, expect } from '@playwright/test'

/**
 * CRUD helpers — ações reutilizáveis para formulários e modais.
 */

let _counter = 0

/** Gera um ID único para dados de teste */
export function uniqueTestId(prefix = 'test'): string {
  _counter++
  return `${prefix}-${Date.now()}-${_counter}`
}

/** Abre modal de criação via botão (custom overlay .fixed.inset-0) */
export async function openCreateModal(page: Page, buttonName: string | RegExp) {
  const main = page.locator('main')
  const btn = main.getByRole('button', { name: buttonName }).first()
  await btn.click()
  const modal = page.locator('.fixed.inset-0')
  await expect(modal).toBeVisible({ timeout: 5000 })
  return modal
}

/** Preenche campo de texto por placeholder ou label */
export async function fillField(page: Page, nameOrPlaceholder: string | RegExp, value: string) {
  const input = page.getByPlaceholder(nameOrPlaceholder).or(
    page.getByLabel(nameOrPlaceholder)
  ).first()
  await input.fill(value)
}

/** Aguarda toast de sucesso ou erro */
export async function waitForToast(page: Page, text: string | RegExp, timeout = 5000) {
  // Toasts can be implemented in various ways. Try common patterns:
  const toast = page.getByText(text).first()
  await expect(toast).toBeVisible({ timeout })
  return toast
}

/** Fecha modal via botão X, Cancelar ou Escape */
export async function closeModal(page: Page, method: 'button' | 'escape' = 'button') {
  if (method === 'escape') {
    await page.keyboard.press('Escape')
  } else {
    // Try close/cancel buttons
    const closeBtn = page.getByRole('button', { name: /Fechar|Cancelar|×|✕/i }).first()
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click()
    } else {
      // Try clicking the overlay backdrop
      const overlay = page.locator('.fixed.inset-0.bg-black\\/50, .fixed.inset-0[class*="bg-black"]').first()
      if (await overlay.isVisible({ timeout: 1000 }).catch(() => false)) {
        await overlay.click({ position: { x: 5, y: 5 } })
      }
    }
  }
  // Wait for modal to disappear
  await page.waitForTimeout(500)
}

/** Verifica que o modal está fechado */
export async function assertModalClosed(page: Page) {
  const modal = page.locator('.fixed.inset-0')
  // Modal may not exist at all, or be hidden
  const count = await modal.count()
  if (count > 0) {
    // Check if any are visible
    for (let i = 0; i < count; i++) {
      const isVisible = await modal.nth(i).isVisible().catch(() => false)
      if (isVisible) {
        // Check if it's a modal backdrop (not the shell sidebar)
        const hasBackdrop = await modal.nth(i).evaluate((el) => {
          return el.classList.contains('bg-black/50') || el.style.background?.includes('rgba')
        })
        if (hasBackdrop) {
          expect(false, 'Modal overlay still visible').toBeTruthy()
        }
      }
    }
  }
}

/** Navega para o mês anterior no seletor de mês */
export async function goToPrevMonth(page: Page) {
  const main = page.locator('main')
  const prevBtn = main.getByRole('button', { name: /anterior/i }).or(
    main.locator('button').filter({ has: page.locator('svg.lucide-chevron-left') })
  ).first()
  await prevBtn.click()
  await page.waitForTimeout(500)
}

/** Navega para o próximo mês no seletor de mês */
export async function goToNextMonth(page: Page) {
  const main = page.locator('main')
  const nextBtn = main.getByRole('button', { name: /próximo/i }).or(
    main.locator('button').filter({ has: page.locator('svg.lucide-chevron-right') })
  ).first()
  await nextBtn.click()
  await page.waitForTimeout(500)
}

/** Click a tab/pill by name */
export async function clickTab(page: Page, name: string | RegExp) {
  const main = page.locator('main')
  const tab = main.getByRole('button', { name }).first()
  await tab.click()
  await page.waitForTimeout(300)
}

/** Aguarda a página carregar completamente */
export async function waitForPageLoad(page: Page, path: string) {
  await page.goto(path)
  await page.waitForLoadState('networkidle')
  await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
}

/** Verifica que não há erros JS no console */
export function setupConsoleErrorTracker(page: Page) {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      // Ignore known non-critical errors
      if (!text.includes('Failed to load resource') && !text.includes('favicon')) {
        errors.push(text)
      }
    }
  })
  return errors
}
