# Documentação SyncLife

Índice da documentação ativa do projeto. Documentos históricos (prompts de implementação, protótipos HTML e validações pontuais) foram removidos em maio/2026.

---

## Guias de desenvolvimento

| Documento | Descrição |
|-----------|-----------|
| [`../CLAUDE.md`](../CLAUDE.md) | Stack, convenções, design system, checklist — **fonte principal para dev/IA** |
| [`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md) | Tokens, tipografia, componentes, estrutura de tela |
| [`../synclife-tokens.css`](../synclife-tokens.css) | Tokens CSS standalone (referência; app usa `web/src/app/globals.css` + `themes.css`) |
| [`../README.md`](../README.md) | Visão geral do produto e quick start |

---

## Especificações funcionais

Pasta [`Especificacoes funcionais/`](./Especificacoes%20funcionais/) — regras de negócio por módulo.

> **Nota:** Algumas specs ainda mencionam "Modo Foco" e "Modo Jornada". Esse sistema dual foi **removido** na migration `018_remove_mode_system.sql` (mar/2026). A experiência hoje é **unificada** (gamificação, insights e labels narrativos para todos). Leia [`Especificacoes funcionais/README.md`](./Especificacoes%20funcionais/README.md).

| Documento | Módulo |
|-----------|--------|
| `SPEC-FUNCIONAL-PANORAMA.md` | Panorama / Dashboard |
| `SPEC-FUNCIONAL-FINANCAS.md` | Finanças |
| `DOC-FUNCIONAL-FUTURO-COMPLETO.md` | Futuro (objetivos) |
| `SPEC-FUNCIONAL-TEMPO.md` | Tempo / Agenda |
| `SPEC-FUNCIONAL-CORPO.md` | Corpo |
| `spec funcional - modulo mente.md` | Mente |
| `SPEC-FUNCIONAL-PATRIMONIO.md` | Patrimônio |
| `SPEC-FUNCIONAL-CARREIRA (1).md` | Carreira |
| `SPEC-FUNCIONAL-EXPERIENCIAS.md` | Experiências |
| `SPEC-FUNCIONAL-CONFIGURACOES.md` | Configurações |
| `DOCUMENTO-FUNCIONAL-SYNCLIFE.md` | Visão funcional consolidada (legado amplo) |

---

## Features em desenvolvimento

| Documento | Descrição |
|-----------|-----------|
| [`FEATURE-TRANSFERENCIAS.md`](./FEATURE-TRANSFERENCIAS.md) | Contas bancárias e transferências neutras |

---

## Testes E2E

| Documento | Descrição |
|-----------|-----------|
| [`specs/README.md`](./specs/README.md) | Índice de cenários E2E |
| [`specs/E2E-TEST-SCENARIOS.md`](./specs/E2E-TEST-SCENARIOS.md) | Plano consolidado Playwright |

Implementação: `web/e2e/`

---

## Auditoria

| Documento | Descrição |
|-----------|-----------|
| [`AUDITORIA-COMPLETA-2026-03.md`](./AUDITORIA-COMPLETA-2026-03.md) | Snapshot de mar/2026 (métricas, scorecard, backlog) — referência histórica |

---

*Última atualização: maio 2026*
