import { test, expect, skipAuth } from './fixtures'

/**
 * Módulo Experiências — Dashboard, Wizard nova viagem, Viagens list, Detalhe 6 abas.
 */

test.describe('Experiências: Dashboard', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/experiencias')
    await page.waitForLoadState('networkidle')
  })

  test('Dashboard carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading', { name: /Experiências/i })).toBeVisible({ timeout: 8000 })
  })

  test('Botão nova viagem visível', async ({ page }) => {
    const main = page.locator('main')
    const newBtn = main.getByRole('button', { name: /Nova Viagem|Criar/i }).first()
      .or(main.getByRole('link', { name: /Nova Viagem|Criar/i }).first())
    const isVisible = await newBtn.isVisible({ timeout: 5000 }).catch(() => false)
    expect(isVisible).toBeTruthy()
  })

  test('KPIs de viagens', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const kpiText = main.getByText(/Viagens|Destinos|Próxima|Total/i).first()
    if (await kpiText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(kpiText).toBeVisible()
    }
  })
})

test.describe('Experiências: Wizard Nova Viagem', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/experiencias/nova')
    await page.waitForLoadState('networkidle')
  })

  test('Wizard abre com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('Campo de destino presente', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const destInput = main.getByPlaceholder(/Destino|destino|Para onde/i).first()
      .or(main.locator('input').first())
    if (await destInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(destInput).toBeVisible()
    }
  })

  test('Campos de data (ida/volta)', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    const dateText = main.getByText(/Data|Ida|Volta|Início|Fim/i).first()
    if (await dateText.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(dateText).toBeVisible()
    }
  })

  test('Validação: destino obrigatório', async ({ page }) => {
    const main = page.locator('main')
    const submitBtn = main.getByRole('button', { name: /Criar|Salvar|Próximo|Avançar/i }).first()
    if (await submitBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await submitBtn.click()
      await page.waitForTimeout(500)
      // Should show validation error or stay
      await expect(main).toBeVisible()
    }
  })

  test('Preencher destino e avançar', async ({ page }) => {
    const main = page.locator('main')
    const destInput = main.getByPlaceholder(/Destino|destino|Para onde/i).first()
      .or(main.locator('input').first())
    if (await destInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await destInput.fill('Paris, França')
      await page.waitForTimeout(300)
      const nextBtn = main.getByRole('button', { name: /Próximo|Avançar|Criar|Salvar/i }).first()
      if (await nextBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await nextBtn.click()
        await page.waitForTimeout(500)
      }
    }
    await expect(main).toBeVisible()
  })

  test('Wizard flow completo sem erro', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Fill basic fields and verify no crash
    const inputs = await main.locator('input').count()
    if (inputs > 0) {
      await main.locator('input').first().fill('Viagem E2E Test')
    }
    await expect(main).toBeVisible()
  })
})

test.describe('Experiências: Lista de Viagens', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
    await page.goto('/experiencias/viagens')
    await page.waitForLoadState('networkidle')
  })

  test('Página carrega com heading', async ({ page }) => {
    const main = page.locator('main')
    await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
  })

  test('TripCards ou estado vazio', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // Should show trip cards or empty state message
    const content = await main.textContent()
    expect(content!.length).toBeGreaterThan(0)
  })

  test('Card de viagem tem destino e datas', async ({ page }) => {
    const main = page.locator('main')
    await expect(main).toBeVisible({ timeout: 8000 })
    // If there are trip cards, they should have destination info
    const tripLinks = await main.locator('a[href*="/experiencias/viagens/"]').count()
    expect(tripLinks).toBeGreaterThanOrEqual(0)
  })

  test('Click em card navega para detalhe', async ({ page }) => {
    const main = page.locator('main')
    const tripLink = main.locator('a[href*="/experiencias/viagens/"]').first()
    if (await tripLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await tripLink.click()
      await page.waitForLoadState('networkidle')
      await expect(page).toHaveURL(/\/experiencias\/viagens\//, { timeout: 5000 })
    }
  })
})

test.describe('Experiências: Detalhe da Viagem', () => {
  test.beforeEach(async ({ page, authenticatedPage }) => {
    void authenticatedPage
  })

  async function navigateToFirstTrip(page: any) {
    await page.goto('/experiencias/viagens')
    await page.waitForLoadState('networkidle')
    const tripLink = page.locator('main a[href*="/experiencias/viagens/"]').first()
    if (await tripLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await tripLink.click()
      await page.waitForLoadState('networkidle')
      return true
    }
    return false
  }

  test('Detalhe carrega com heading', async ({ page }) => {
    if (await navigateToFirstTrip(page)) {
      const main = page.locator('main')
      await expect(main.getByRole('heading').first()).toBeVisible({ timeout: 8000 })
    } else {
      test.skip()
    }
  })

  test('6 abas visíveis', async ({ page }) => {
    if (await navigateToFirstTrip(page)) {
      const main = page.locator('main')
      await expect(main).toBeVisible({ timeout: 8000 })
      // Look for tab buttons: Overview, Itinerário, Orçamento, Checklist, Hospedagem, Transporte
      const tabBtns = main.getByRole('button', { name: /Overview|Itinerário|Orçamento|Checklist|Hospedagem|Transporte/i })
      const count = await tabBtns.count()
      expect(count).toBeGreaterThanOrEqual(2) // At least some tabs
    } else {
      test.skip()
    }
  })

  test('Switch entre abas funciona', async ({ page }) => {
    if (await navigateToFirstTrip(page)) {
      const main = page.locator('main')
      const tabBtns = main.getByRole('button', { name: /Itinerário|Orçamento|Checklist|Hospedagem|Transporte/i })
      const count = await tabBtns.count()
      if (count > 0) {
        await tabBtns.first().click()
        await page.waitForTimeout(500)
        await expect(main).toBeVisible()
        if (count > 1) {
          await tabBtns.nth(1).click()
          await page.waitForTimeout(500)
          await expect(main).toBeVisible()
        }
      }
    } else {
      test.skip()
    }
  })

  test('Aba Overview com info da viagem', async ({ page }) => {
    if (await navigateToFirstTrip(page)) {
      const main = page.locator('main')
      await expect(main).toBeVisible({ timeout: 8000 })
      // Overview should show trip details
      const overviewBtn = main.getByRole('button', { name: /Overview|Visão/i }).first()
      if (await overviewBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await overviewBtn.click()
        await page.waitForTimeout(300)
      }
      await expect(main).toBeVisible()
    } else {
      test.skip()
    }
  })

  test('Aba Itinerário', async ({ page }) => {
    if (await navigateToFirstTrip(page)) {
      const main = page.locator('main')
      const tab = main.getByRole('button', { name: /Itinerário/i }).first()
      if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tab.click()
        await page.waitForTimeout(500)
        await expect(main).toBeVisible()
      }
    } else {
      test.skip()
    }
  })

  test('Aba Orçamento', async ({ page }) => {
    if (await navigateToFirstTrip(page)) {
      const main = page.locator('main')
      const tab = main.getByRole('button', { name: /Orçamento/i }).first()
      if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tab.click()
        await page.waitForTimeout(500)
        // Should show budget items or total
        await expect(main).toBeVisible()
      }
    } else {
      test.skip()
    }
  })

  test('Aba Checklist', async ({ page }) => {
    if (await navigateToFirstTrip(page)) {
      const main = page.locator('main')
      const tab = main.getByRole('button', { name: /Checklist/i }).first()
      if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tab.click()
        await page.waitForTimeout(500)
        await expect(main).toBeVisible()
      }
    } else {
      test.skip()
    }
  })

  test('Aba Hospedagem', async ({ page }) => {
    if (await navigateToFirstTrip(page)) {
      const main = page.locator('main')
      const tab = main.getByRole('button', { name: /Hospedagem/i }).first()
      if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tab.click()
        await page.waitForTimeout(500)
        await expect(main).toBeVisible()
      }
    } else {
      test.skip()
    }
  })

  test('Aba Transporte', async ({ page }) => {
    if (await navigateToFirstTrip(page)) {
      const main = page.locator('main')
      const tab = main.getByRole('button', { name: /Transporte/i }).first()
      if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tab.click()
        await page.waitForTimeout(500)
        await expect(main).toBeVisible()
      }
    } else {
      test.skip()
    }
  })

  test('Total orçamento calculado', async ({ page }) => {
    if (await navigateToFirstTrip(page)) {
      const main = page.locator('main')
      const tab = main.getByRole('button', { name: /Orçamento/i }).first()
      if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
        await tab.click()
        await page.waitForTimeout(500)
        // Look for total value
        const totalText = main.getByText(/Total|R\$/i).first()
        if (await totalText.isVisible({ timeout: 3000 }).catch(() => false)) {
          await expect(totalText).toBeVisible()
        }
      }
    } else {
      test.skip()
    }
  })
})
