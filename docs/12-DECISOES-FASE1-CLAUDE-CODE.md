# 12 — Decisões Técnicas: Fase 1 — Respostas ao Claude Code

> **Contexto:** Respostas às perguntas levantadas pelo Claude Code durante o planejamento
> da Fase 1 (Fundação). Este documento serve como referência de decisões para evitar
> ambiguidades durante o desenvolvimento.
>
> **Data:** 23/02/2026  
> **Fase:** 1 — Fundação (Shell, Auth, Onboarding, Configurações)

---

## 1. Zustand — Instalar agora?

**Decisão: Sim, instale no início da Fase 1.**

O shell inteiro depende do store. ModuleBar, Sidebar e TopHeader não podem ser construídos sem ele. Instale junto com a configuração dos tokens CSS, antes de qualquer componente.

Se já estiver no `package.json`, confirme a versão e siga em frente. Se não estiver:

```bash
pnpm add zustand
```

---

## 2. Migration do Supabase — Agora ou sob demanda?

**Decisão: Rode tudo agora, de uma vez.**

Fazer migration parcial é caminho certo para bug difícil de rastrear. A regra é: antes de escrever qualquer componente que leia ou escreva no banco, o schema tem que estar completo.

**Ação:** Rode a migration completa da tabela `profiles` agora — todos os campos da seção 16.1 da `configuracoes-dev-spec.md` de uma vez. Isso inclui:

- `mode`, `theme`, `sidebar_open`
- `currency`, `timezone`, `month_start_day`, `date_format`
- `compact_numbers`, `reduced_motion`, `agenda_default_view`
- `plan` ('free' | 'pro')
- Todos os campos `notif_*`
- Campos que a spec do shell exige (`life_moments`, `active_modules`, `monthly_income`, etc.)

O custo de rodar uma migration a mais hoje é zero. O custo de descobrir campo faltando no meio da Fase 2 é alto.

---

## 3. Ícones SVG inline vs. Lucide — Qual usar no ModuleBar?

**Decisão: Extraia os SVGs do protótipo e use inline.**

Essa é uma decisão de fidelidade visual sem meio-termo. Os ícones do ModuleBar (logo S, cifrão estilizado, target de metas, calendário) são identidade visual aprovada. O Lucide tem aproximações, mas não são iguais — e numa barra de 58px onde o ícone é o único elemento visual, qualquer diferença aparece.

**Como implementar:**
1. Extraia os paths SVG diretamente do `proto-navigation-v3.html`
2. Crie `src/components/shell/icons/ModuleIcons.tsx` com cada ícone como componente React
3. Use esses componentes inline no ModuleBar

**Regra geral de ícones no projeto:**
- **ModuleBar e elementos de identidade visual:** SVG inline extraído do protótipo
- **UI genérico (fechar, editar, chevron, sino, lixeira):** Lucide React normalmente

---

## 4. Rotas placeholder — Página em branco ou estrutura mínima?

**Decisão: Crie todas as rotas com página mínima funcional.**

Não página em branco e não "Em breve". Cada rota deve renderizar o shell funcionando com apenas um `<h1>` com o nome da tela.

**Exemplo:**
```tsx
// app/(app)/financas/transacoes/page.tsx
export default function TransacoesPage() {
  return <h1>Transações</h1>
}
```

**Motivo:** Você precisa conseguir navegar pelo ModuleBar e pela Sidebar para testar o shell. Se as rotas não existirem, a navegação quebra com 404 e fica impossível validar o shell completo.

**Crie todas as rotas do mapa de arquivos da `17-NAVEGACAO-SHELL-DEV-SPEC.md`:**

```
(app)/page.tsx                      ← Home / Dashboard placeholder
(app)/financas/page.tsx
(app)/financas/transacoes/page.tsx
(app)/financas/orcamentos/page.tsx
(app)/financas/planejamento/page.tsx
(app)/financas/recorrentes/page.tsx
(app)/financas/calendario/page.tsx
(app)/financas/relatorios/page.tsx
(app)/metas/page.tsx
(app)/metas/nova/page.tsx
(app)/metas/[id]/page.tsx
(app)/agenda/page.tsx
(app)/agenda/mensal/page.tsx
(app)/conquistas/page.tsx
(app)/configuracoes/page.tsx
```

---

## 5. Dashboard atual em `/dashboard` — Mover agora ou depois?

**Decisão: Crie placeholder em `/` e migre depois. Não mova o conteúdo agora.**

O dashboard atual (`(app)/dashboard/page.tsx`) usa dados reais e foi construído para o schema V1. Mover agora mistura dois problemas distintos: refatoração do shell (Fase 1) e reconstrução do dashboard (Fase 5).

**O que fazer na Fase 1:**
- Criar `(app)/page.tsx` com placeholder simples
- Ajustar o redirect pós-login para `/financas` (não para `/dashboard` nem para `/`)
- O `dashboard/page.tsx` antigo fica intacto e inacessível por enquanto

**O que fazer na Fase 5:**
- Reconstruir o Dashboard Home do zero, seguindo a spec do `proto-dashboard-revisado.html`
- Descartar o código V1 naquele momento

---

## 6. Componentes V1 com classes hardcoded — Migrar agora?

**Decisão: Não migre agora. Mantenha os componentes V1 intactos.**

Migrar `bg-slate-900` para `var(--s1)` nos componentes existentes de dashboard e transações é desperdício nesta fase por dois motivos:

1. Esses componentes serão **reconstruídos do zero** nas Fases 2 e 5 — o código V1 será descartado, não evoluído
2. Misturar refatoração de tokens com implementação do shell aumenta risco de conflito visual e dificulta debug

**Regra para o projeto daqui em diante:**
- Componente **novo**: usa tokens CSS (`var(--s1)`, `var(--em)`, etc.) desde o primeiro commit
- Componente **V1 existente**: fica como está até ser reconstruído na fase correspondente

---

## 7. Framer Motion — Usar ou CSS puro?

**Decisão: Apenas CSS transitions na Fase 1.**

Framer Motion adiciona ~30KB ao bundle e uma camada de complexidade desnecessária para validar o shell. CSS transitions puras são suficientes para todas as animações da Fase 1 e são exatamente o que o protótipo usa.

**Transições CSS a implementar:**

| Elemento | Transition |
|----------|-----------|
| Sidebar open/close | `width 0.25s ease` |
| Mode/Theme switch (body) | `background 0.4s, color 0.3s` |
| Botões hover | `background 0.15s, color 0.15s` |
| Toast aparecer/sumir | `opacity 0.25s ease-out, transform 0.25s ease-out` |
| ModuleBar pill ativo | `height 0.2s cubic-bezier(.4,0,.2,1)` |

**Quando usar Framer Motion (futuro):**
Considerar na Fase 5 para micro-animações do Modo Jornada: celebrates overlay, conquistas, progress bars animadas. Não antes.

---

## Resumo das Decisões

| # | Tema | Decisão |
|---|------|---------|
| 1 | Zustand | Instalar agora |
| 2 | Migration Supabase | Rodar schema completo antes de qualquer componente |
| 3 | Ícones ModuleBar | SVG inline extraído do protótipo |
| 4 | Rotas placeholder | Criar todas com página mínima funcional |
| 5 | Dashboard V1 | Criar placeholder em `/`, manter V1 intacto, migrar na Fase 5 |
| 6 | Componentes V1 | Não migrar — reconstruir do zero na fase correspondente |
| 7 | Framer Motion | CSS transitions puras na Fase 1, Framer só na Fase 5 se necessário |

---

*Documento criado em: 23/02/2026*  
*Versão: 1.0*  
*Contexto: Respostas ao planejamento da Fase 1 pelo Claude Code*
