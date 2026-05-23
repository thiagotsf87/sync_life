# Especificações funcionais — SyncLife

Regras de negócio, fluxos e critérios de aceite por módulo.

---

## Experiência unificada (desde mar/2026)

O SyncLife **não possui mais** toggle Modo Foco / Modo Jornada.

- Migration: `web/supabase/migrations/018_remove_mode_system.sql`
- Tela "Modo de Uso" removida das Configurações
- Gamificação (XP, badges, insights narrativos) faz parte da experiência padrão
- **12 temas visuais** substituem o antigo conceito Dark/Light × Foco/Jornada

Ao ler specs escritas antes dessa mudança, ignore referências a:

- `.jornada-only` / `.foco-only`
- Gates que ocultam gamificação no "Modo Foco"
- Tabela comparativa Foco vs Jornada

O termo **"Modo Foco"** ainda existe apenas como **tela de sessão Pomodoro** em `/tempo/foco` — não é um modo global do app.

---

## Índice

| Arquivo | Escopo |
|---------|--------|
| `SPEC-FUNCIONAL-PANORAMA.md` | Dashboard, score, conquistas |
| `SPEC-FUNCIONAL-FINANCAS.md` | Transações, orçamentos, planejamento |
| `DOC-FUNCIONAL-FUTURO-COMPLETO.md` | Objetivos, metas, marcos, simulador |
| `SPEC-FUNCIONAL-TEMPO.md` | Agenda, calendário, review, foco |
| `SPEC-FUNCIONAL-CORPO.md` | Saúde, peso, cardápio, coach |
| `spec funcional - modulo mente.md` | Trilhas, timer, biblioteca |
| `SPEC-FUNCIONAL-PATRIMONIO.md` | Carteira, proventos, evolução |
| `SPEC-FUNCIONAL-CARREIRA (1).md` | Perfil, roadmap, habilidades |
| `SPEC-FUNCIONAL-EXPERIENCIAS.md` | Viagens, passaporte, bucket list |
| `SPEC-FUNCIONAL-CONFIGURACOES.md` | Perfil, temas, notificações, plano |
| `DOCUMENTO-FUNCIONAL-SYNCLIFE.md` | Documento mestre (visão ampla, parcialmente desatualizado) |

Para implementação visual e técnica, priorize [`CLAUDE.md`](../../CLAUDE.md) e [`DESIGN-SYSTEM.md`](../../DESIGN-SYSTEM.md).
