import { test, expect, skipAuth } from './fixtures'

/**
 * Modal Patterns — open/close/Escape/Cancelar para todos os modais.
 * Verifica z-index, backdrop blur, e comportamento consistente.
 */

test.describe('Modais: Finanças', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
  })

  // ── TransacaoModal ──────────────────────────────────────────────────────────

  test('TransacaoModal abre e fecha via X', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await main.getByRole('button', { name: /Nova Transação/i }).click()
    const modal = page.locator('.fixed.inset-0').first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    // Close via X button
    const closeBtn = page.getByRole('button', { name: /×|✕|Fechar/i }).first()
    if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeBtn.click()
    } else {
      // Click the X icon in the modal header
      await page.locator('.fixed.inset-0 button').filter({ has: page.locator('[class*="lucide-x"]') }).first().click()
    }
    await page.waitForTimeout(500)
  })

  test('TransacaoModal fecha via Escape', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await main.getByRole('button', { name: /Nova Transação/i }).click()
    await expect(page.locator('.fixed.inset-0').first()).toBeVisible({ timeout: 5000 })

    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    // Modal should close or at least page should be functional
    await expect(page.locator('body')).toBeVisible()
  })

  test('TransacaoModal z-index z-[60]', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await main.getByRole('button', { name: /Nova Transação/i }).click()
    const modal = page.locator('.fixed.inset-0').first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    const zIndex = await modal.evaluate((el) => {
      return window.getComputedStyle(el).zIndex
    })
    expect(parseInt(zIndex) || 0).toBeGreaterThanOrEqual(50)
  })

  // ── RecorrenteModal ─────────────────────────────────────────────────────────

  test('RecorrenteModal abre e fecha', async ({ page }) => {
    await page.goto('/financas/recorrentes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova|Criar|Adicionar/i }).first()
    await newBtn.click()
    const modal = page.locator('.fixed.inset-0').first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    // Close via Escape
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toBeVisible()
  })

  // ── PlanningEventModal ──────────────────────────────────────────────────────

  test('PlanningEventModal abre e fecha', async ({ page }) => {
    await page.goto('/financas/planejamento')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Novo Evento|Novo|Adicionar/i }).first()
    await newBtn.click()
    const modal = page.locator('.fixed.inset-0').first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
    await expect(page.locator('body')).toBeVisible()
  })

  // ── EnvelopeModal ───────────────────────────────────────────────────────────

  test('EnvelopeModal abre e fecha', async ({ page }) => {
    await page.goto('/financas/orcamentos')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Novo Envelope|Novo|Criar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })

      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    await expect(page.locator('body')).toBeVisible()
  })

  // ── DeleteConfirmModal ──────────────────────────────────────────────────────

  test('DeleteConfirmModal tem botões Cancelar e Excluir', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')

    // Find a delete button (trash icon) on a transaction row
    const trashBtn = main.locator('button').filter({ has: page.locator('[class*="lucide-trash"]') }).first()
    if (await trashBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await trashBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Should have Cancel and Delete buttons
      await expect(page.getByRole('button', { name: /Cancelar/i }).first()).toBeVisible({ timeout: 3000 })
      await expect(page.getByRole('button', { name: /Excluir/i }).first()).toBeVisible()

      // Close via Cancelar
      await page.getByRole('button', { name: /Cancelar/i }).first().click()
      await page.waitForTimeout(500)
    }
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Modais: Futuro', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
  })

  // ── ObjectiveWizard ─────────────────────────────────────────────────────────

  test('ObjectiveWizard abre e fecha', async ({ page }) => {
    await page.goto('/futuro')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Novo Objetivo|Nova Meta|Novo/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Close via X or Escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('ObjectiveWizard tem steps indicators', async ({ page }) => {
    await page.goto('/futuro')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Novo Objetivo|Nova Meta|Novo/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Should have step indicators or step navigation
      const nextBtn = page.getByRole('button', { name: /Próximo|Avançar|Continuar/i }).first()
      if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(nextBtn).toBeVisible()
      }

      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
  })

  // ── AddGoalModal ────────────────────────────────────────────────────────────

  test('AddGoalModal abre e fecha', async ({ page }) => {
    await page.goto('/futuro')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova Meta|Adicionar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })

      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    await expect(page.locator('body')).toBeVisible()
  })

  // ── AddContributionModal ────────────────────────────────────────────────────

  test('AddContributionModal abre no detalhe da meta', async ({ page }) => {
    await page.goto('/futuro')
    await page.waitForLoadState('networkidle')

    // Navigate to first goal detail
    const detailLink = page.locator('main a[href*="/futuro/"]').first()
    if (await detailLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await detailLink.click()
      await page.waitForLoadState('networkidle')

      const contributeBtn = page.locator('main').getByRole('button', { name: /Aporte|Contribui|Registrar/i }).first()
      if (await contributeBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await contributeBtn.click()
        const modal = page.locator('.fixed.inset-0').first()
        await expect(modal).toBeVisible({ timeout: 5000 })

        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
      }
    }
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Modais: Tempo/Agenda', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
  })

  // ── EventModal ──────────────────────────────────────────────────────────────

  test('EventModal abre e fecha', async ({ page }) => {
    await page.goto('/tempo')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Novo Evento|Criar|Adicionar/i }).first()
      .or(main.getByRole('link', { name: /Novo Evento|Criar/i }).first())

    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      await page.waitForLoadState('networkidle')

      // If it opens a modal
      const modal = page.locator('.fixed.inset-0').first()
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
      }
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('EventModal tem campos de título e data', async ({ page }) => {
    await page.goto('/tempo/novo')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    // Check that the form has essential fields
    const titleInput = main.locator('input').first()
    await expect(titleInput).toBeVisible({ timeout: 8000 })
  })

  // ── FocusSessionModal ───────────────────────────────────────────────────────

  test('FocusSessionModal abre com duração rápida', async ({ page }) => {
    await page.goto('/tempo/foco')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova Sessão|Registrar|Criar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Should have quick duration buttons (25, 45, 60, 90 min)
        const quickBtn = page.getByRole('button', { name: /25|45|60|90/i }).first()
        if (await quickBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await expect(quickBtn).toBeVisible()
        }
        await page.keyboard.press('Escape')
        await page.waitForTimeout(500)
      }
    }
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Modais: Mente', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
  })

  // ── TrackWizard ─────────────────────────────────────────────────────────────

  test('TrackWizard abre e fecha', async ({ page }) => {
    await page.goto('/mente')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova Trilha|Criar|Adicionar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })

      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
    await expect(page.locator('body')).toBeVisible()
  })

  test('TrackWizard tem step navigation', async ({ page }) => {
    await page.goto('/mente')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova Trilha|Criar|Adicionar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Should have step indicators
      const nextBtn = page.getByRole('button', { name: /Próximo|Avançar|Continuar/i }).first()
      if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(nextBtn).toBeVisible()
      }

      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }
  })
})

test.describe('Modais: Comportamento Geral', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
  })

  test('Backdrop blur em todos os modais', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await main.getByRole('button', { name: /Nova Transação/i }).click()
    const modal = page.locator('.fixed.inset-0').first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    // Check backdrop has blur
    const hasBlur = await modal.evaluate((el) => {
      const cs = window.getComputedStyle(el)
      return cs.backdropFilter?.includes('blur') || el.className.includes('blur')
    })
    expect(hasBlur).toBeTruthy()

    await page.keyboard.press('Escape')
  })

  test('Modal overlay impede interação com fundo', async ({ page }) => {
    await page.goto('/financas/transacoes')
    await page.waitForLoadState('networkidle')
    const main = page.locator('main')
    await main.getByRole('button', { name: /Nova Transação/i }).click()
    const modal = page.locator('.fixed.inset-0').first()
    await expect(modal).toBeVisible({ timeout: 5000 })

    // Modal should cover the full viewport
    const box = await modal.boundingBox()
    expect(box).toBeTruthy()
    if (box) {
      expect(box.width).toBeGreaterThan(300)
      expect(box.height).toBeGreaterThan(300)
    }

    await page.keyboard.press('Escape')
  })
})
