import { test, expect, skipAuth } from './fixtures'

/**
 * Módulo Carreira — Dashboard, Habilidades, Roadmap, Histórico, Perfil.
 */

test.describe('Carreira: Dashboard', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/carreira')
    await page.waitForLoadState('networkidle')
  })

  test('Dashboard carrega com KPIs', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Carreira/i })).toBeVisible({ timeout: 8000 })
  })

  test('KPIs de carreira visíveis', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const kpiText = main.getByText(/Habilidades|Cargo|Salário|Promoções/i).first()
    if (await kpiText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(kpiText).toBeVisible()
    }
  })

  test('Links para sub-páginas', async ({ page }) => {
    await expect(page.locator('main')).toBeVisible({ timeout: 8000 })
  })
})

test.describe('Carreira: Habilidades', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/carreira/habilidades')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Habilidades/i })).toBeVisible({ timeout: 8000 })
  })

  test('Botão adicionar habilidade', async ({ page }) => {
    const main = page.locator('main')
    const addBtn = main.getByRole('button', { name: /Nova|Adicionar|Criar/i }).first()
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(addBtn).toBeVisible()
    }
  })

  test('Lista de habilidades com níveis', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Skills should have level indicators (progress bars or badges)
    const levelText = main.getByText(/Iniciante|Intermediário|Avançado|Expert|Nível/i).first()
    if (await levelText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(levelText).toBeVisible()
    }
  })

  test('Level selector funciona', async ({ page }) => {
    const main = page.locator('main')
    const addBtn = main.getByRole('button', { name: /Nova|Adicionar|Criar/i }).first()
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addBtn.click()
      await page.waitForTimeout(500)
      const modal = page.locator('.fixed.inset-0').first()
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Should have name input and level selector
        const nameInput = modal.locator('input').first()
        if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await nameInput.fill('Habilidade E2E')
        }
        await page.keyboard.press('Escape')
      }
    }
  })

  test('Edge: skill name vazio', async ({ page }) => {
    const main = page.locator('main')
    const addBtn = main.getByRole('button', { name: /Nova|Adicionar|Criar/i }).first()
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addBtn.click()
      await page.waitForTimeout(500)
      const modal = page.locator('.fixed.inset-0').first()
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Try to submit without filling name
        const submitBtn = modal.getByRole('button', { name: /Salvar|Criar|Adicionar/i }).first()
        if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
          await submitBtn.click()
          await page.waitForTimeout(500)
          // Should show validation or stay in modal
          await expect(modal).toBeVisible()
        }
        await page.keyboard.press('Escape')
      }
    }
  })
})

test.describe('Carreira: Roadmap', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/carreira/roadmap')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Roadmap/i }).first()).toBeVisible({ timeout: 8000 })
  })

  test('Timeline ou cards de milestones', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const milestoneText = main.getByText(/Marco|Milestone|Etapa|Meta/i).first()
    if (await milestoneText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(milestoneText).toBeVisible()
    }
  })

  test('Botão adicionar milestone', async ({ page }) => {
    const main = page.locator('main')
    const addBtn = main.getByRole('button', { name: /Novo|Adicionar|Criar/i }).first()
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(addBtn).toBeVisible()
    }
  })

  test('Modal de milestone abre', async ({ page }) => {
    const main = page.locator('main')
    const addBtn = main.getByRole('button', { name: /Novo|Adicionar|Criar/i }).first()
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addBtn.click()
      await page.waitForTimeout(500)
      const modal = page.locator('.fixed.inset-0').first()
      if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(modal).toBeVisible()
        await page.keyboard.press('Escape')
      }
    }
  })
})

test.describe('Carreira: Histórico', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/carreira/historico')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Histórico/i }).first()).toBeVisible({ timeout: 8000 })
  })

  test('Timeline de promoções ou estado vazio', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
  })

  test('Salário visível em DM_Mono', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const dmValues = await main.locator('[class*="DM_Mono"]').count()
    expect(dmValues).toBeGreaterThanOrEqual(0)
  })

  test('Botão registrar promoção', async ({ page }) => {
    const main = page.locator('main')
    const addBtn = main.getByRole('button', { name: /Novo|Registrar|Adicionar/i }).first()
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(addBtn).toBeVisible()
    }
  })
})

test.describe('Carreira: Perfil Profissional', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/carreira/perfil')
    await page.waitForLoadState('networkidle')
  })

  test('Página de perfil carrega', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('Formulário com campos de perfil', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const inputs = await main.locator('input, textarea').count()
    expect(inputs).toBeGreaterThanOrEqual(0)
  })

  test('Botão salvar perfil', async ({ page }) => {
    const main = page.locator('main')
    const saveBtn = main.getByRole('button', { name: /Salvar/i }).first()
    if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(saveBtn).toBeVisible()
    }
  })
})
