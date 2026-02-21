import { defineConfig, devices } from '@playwright/test'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Carrega web/.env.local para usar PLAYWRIGHT_TEST_EMAIL e PLAYWRIGHT_TEST_PASSWORD
try {
  const envPath = resolve(__dirname, '.env.local')
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const m = line.trim().match(/^PLAYWRIGHT_TEST_(EMAIL|PASSWORD)=(.*)$/)
    if (m) process.env[`PLAYWRIGHT_TEST_${m[1]}`] = m[2].replace(/^["']|["']$/g, '').trim()
  }
} catch {
  // .env.local opcional; use variáveis de ambiente ou defaults
}

// Credenciais para testes que exigem usuário logado (podem ser sobrescritas por variáveis de ambiente)
process.env.PLAYWRIGHT_TEST_EMAIL = process.env.PLAYWRIGHT_TEST_EMAIL ?? 'thiago@teste.com'
process.env.PLAYWRIGHT_TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'JVmljosi@1'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
