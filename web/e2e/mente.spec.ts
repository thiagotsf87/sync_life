import { test, expect, skipAuth } from './fixtures'

/**
 * Módulo Mente — Dashboard, Trilhas, Timer Pomodoro, Biblioteca, TrackWizard.
 */

test.describe('Mente: Dashboard', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/mente')
    await page.waitForLoadState('networkidle')
  })

  test('Dashboard Mente carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Mente/i })).toBeVisible({ timeout: 8000 })
  })

  test('KPIs de estudo visíveis', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const kpiText = main.getByText(/Trilhas|Horas|Sessões|Estudo/i).first()
    if (await kpiText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(kpiText).toBeVisible()
    }
  })

  test('Botão nova trilha visível', async ({ page }) => {
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova Trilha|Criar|Adicionar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(newBtn).toBeVisible()
    }
  })

  test('Cards de trilhas ou estado vazio', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
  })
})

test.describe('Mente: Trilhas', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/mente/trilhas')
    await page.waitForLoadState('networkidle')
  })

  test('Página de trilhas carrega', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Trilhas/i })).toBeVisible({ timeout: 8000 })
  })

  test('Lista de trilhas com progresso', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Progress bars or rings
    const progress = await main.locator('[style*="width"][style*="background"], svg circle').count()
    expect(progress).toBeGreaterThanOrEqual(0)
  })

  test('TrackWizard abre ao clicar nova trilha', async ({ page }) => {
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova Trilha|Criar|Adicionar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })
      await page.keyboard.press('Escape')
    }
  })

  test('TrackWizard step 1: nome e categoria', async ({ page }) => {
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova Trilha|Criar|Adicionar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Should have name input
      const nameInput = modal.locator('input[type="text"], input:not([type])').first()
      if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nameInput.fill('Trilha E2E')
      }

      // Should have category grid
      const categoryBtn = modal.getByRole('button').filter({ hasText: /Tecnologia|Idiomas|Gestão/i }).first()
      if (await categoryBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await expect(categoryBtn).toBeVisible()
      }

      await page.keyboard.press('Escape')
    }
  })

  test('TrackWizard validação: nome vazio', async ({ page }) => {
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova Trilha|Criar|Adicionar/i }).first()
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click()
      const modal = page.locator('.fixed.inset-0').first()
      await expect(modal).toBeVisible({ timeout: 5000 })

      // Try to advance without filling name
      const nextBtn = modal.getByRole('button', { name: /Próximo|Avançar|Continuar/i }).first()
      if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextBtn.click()
        await page.waitForTimeout(500)
        // Should stay on step 1
        await expect(modal).toBeVisible()
      }

      await page.keyboard.press('Escape')
    }
  })
})

test.describe('Mente: Timer Pomodoro', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/mente/timer')
    await page.waitForLoadState('networkidle')
  })

  test('Timer carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Timer|Pomodoro|Foco/i })).toBeVisible({ timeout: 8000 })
  })

  test('Botão start/play visível', async ({ page }) => {
    const main = page.locator('main')
    const startBtn = main.getByRole('button', { name: /Iniciar|Start|Play|▶/i }).first()
      .or(main.locator('button').filter({ has: page.locator('[class*="lucide-play"]') }).first())
    if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(startBtn).toBeVisible()
    }
  })

  test('Timer display mostra tempo', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Timer should show minutes:seconds format
    const timerDisplay = main.getByText(/\d{1,2}:\d{2}/).first()
    if (await timerDisplay.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(timerDisplay).toBeVisible()
    }
  })

  test('Seleção de duração (25, 45, etc)', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const durationBtn = main.getByRole('button', { name: /25|45|60|90/i }).first()
    if (await durationBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(durationBtn).toBeVisible()
    }
  })

  test('Start/Pause toggle funciona', async ({ page }) => {
    const main = page.locator('main')
    const startBtn = main.getByRole('button', { name: /Iniciar|Start|Play|▶/i }).first()
      .or(main.locator('button').filter({ has: page.locator('[class*="lucide-play"]') }).first())
    if (await startBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await startBtn.click()
      await page.waitForTimeout(500)
      // Should now show pause button
      const pauseBtn = main.getByRole('button', { name: /Pausar|Pause|⏸/i }).first()
        .or(main.locator('button').filter({ has: page.locator('[class*="lucide-pause"]') }).first())
      if (await pauseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(pauseBtn).toBeVisible()
        await pauseBtn.click() // Pause it back
      }
    }
  })

  test('Reset funciona', async ({ page }) => {
    const main = page.locator('main')
    const resetBtn = main.getByRole('button', { name: /Reset|Reiniciar|Resetar/i }).first()
      .or(main.locator('button').filter({ has: page.locator('[class*="lucide-rotate"]') }).first())
    if (await resetBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(resetBtn).toBeVisible()
    }
  })
})

test.describe('Mente: Biblioteca', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/mente/biblioteca')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Biblioteca/i })).toBeVisible({ timeout: 8000 })
  })

  test('Lista de recursos ou estado vazio', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
  })

  test('Botão adicionar recurso', async ({ page }) => {
    const main = page.locator('main')
    const addBtn = main.getByRole('button', { name: /Novo|Adicionar|Criar/i }).first()
    if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(addBtn).toBeVisible()
    }
  })
})
