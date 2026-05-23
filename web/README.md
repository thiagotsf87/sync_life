# SyncLife — App Web

Aplicação Next.js do SyncLife. Documentação completa do projeto: [`../README.md`](../README.md).

---

## Quick start

```bash
cd web
npm install
cp .env.example .env.local
# Preencher NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY

npm run dev
```

Abra [http://localhost:3005](http://localhost:3005) (porta definida em `package.json`).

Atalho Windows: [`INICIAR-SYNCLIFE.bat`](./INICIAR-SYNCLIFE.bat)

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Desenvolvimento (porta 3005) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | ESLint |
| `npm run test:unit` | Vitest |
| `npm run test:e2e` | Playwright (requer credenciais de teste) |
| `npm run test:e2e:auth` | E2E sem login |

---

## Estrutura

```
src/
├── app/           # App Router — (app), (auth), api/
├── components/    # UI por módulo + shell
├── hooks/         # Data fetching e lógica de domínio
├── lib/           # Supabase, engines, utilitários
├── stores/        # Zustand (shell)
└── types/         # TypeScript

supabase/migrations/   # Schema SQL (25 migrations)
e2e/                   # Testes Playwright
public/                # PWA (manifest, service worker)
```

---

## Variáveis de ambiente

Ver [`.env.example`](./.env.example). Mínimo para rodar localmente:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Opcionais: chaves de IA (`GOOGLE_GENERATIVE_AI_API_KEY`, `GROQ_API_KEY`), Stripe, Sentry, Upstash.

---

## Documentação

- [`../CLAUDE.md`](../CLAUDE.md) — guia de desenvolvimento
- [`../docs/README.md`](../docs/README.md) — índice de specs e features
