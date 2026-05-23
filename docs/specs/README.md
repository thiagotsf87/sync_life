# Specs E2E — SyncLife

Documentação de planos e cenários de testes E2E.

## Documentos

| Documento | Descrição |
|-----------|-----------|
| [E2E-TEST-SCENARIOS.md](./E2E-TEST-SCENARIOS.md) | Plano consolidado com todos os cenários por módulo |

## Implementação

Os testes ficam em `web/e2e/` (Playwright). Consulte o documento principal para o mapeamento Spec → Cenário.

## Comandos

```bash
cd web
npm run test:e2e:auth   # sem login
npm run test:e2e        # suite completa (requer PLAYWRIGHT_TEST_EMAIL/PASSWORD)
```

## Nota histórica

Cenários que validavam Modo Foco/Jornada foram substituídos por testes de experiência unificada (ver `shell-navigation.spec.ts`).
