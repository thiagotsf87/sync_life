/**
 * Fallback determinístico do texto de Sy em Meu dia (briefing sem IA).
 *
 * Usado quando o modelo está indisponível (sem chave, erro no generateObject ou
 * kill-switch `forceFallback`). Puro: recebe o contexto do panorama já montado e
 * nunca inventa números. Mesmas regras de prioridade do briefing antigo
 * (orçamento > 85% > saldo negativo > poupança ≥ 20% > saldo > começar), agora
 * no formato sem metáfora: `fala` em 2 frases + 3 `recs`.
 */
import { fmtBRL } from '@/lib/format/currency'
import type { PanoramaContext } from '@/lib/coach/context'

export interface MeuDiaRec { title: string; detail: string }
export interface MeuDiaBriefBase { fala: string; recs: MeuDiaRec[] }

const TZ = 'America/Sao_Paulo'

/** "a, b e c" (junção pt-BR, sem vírgula antes do "e"). */
export function listaPt(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return items.slice(0, -1).join(', ') + ' e ' + items[items.length - 1]
}

/** "7h12" no fuso de São Paulo (máscara de hora do DS, E-07). */
function horaSP(iso: string): string {
  const [h, m] = new Intl.DateTimeFormat('pt-BR', { timeZone: TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .format(new Date(iso))
    .split(':')
  return `${Number(h)}h${m}`
}

/** Linha de procedência do texto de Sy (E-07): "Atualizado às 7h12 · fontes: a, b e c". */
export function textoFontes(fontes: string[], iso: string): string {
  const base = `Atualizado às ${horaSP(iso)}`
  return fontes.length > 0 ? `${base} · fontes: ${listaPt(fontes)}` : base
}

export function buildFallbackMeuDia(ctx: PanoramaContext, period: string): MeuDiaBriefBase {
  const f = ctx.financas
  const orcamentos = ctx.orcamentos ?? []
  const contas = ctx.contas ?? []
  const metas = ctx.metas ?? []
  const tenso = orcamentos[0] ?? null
  const hasTx = f.txCount > 0
  const saldoTxt = f.balance < 0
    ? `saldo negativo de ${fmtBRL(Math.abs(f.balance))}`
    : `saldo de ${fmtBRL(f.balance)}`
  const movimento = `${fmtBRL(f.income)} de receitas e ${fmtBRL(f.expenses)} de despesas`

  // Fala: frase 1 = o que pede atenção (prioridade fixa); frase 2 = os números do mês.
  let fala: string
  if (tenso && tenso.pct > 85) {
    const frase1 = tenso.gasto > tenso.limite
      ? `O orçamento de ${tenso.category} passou do limite por ${fmtBRL(tenso.gasto - tenso.limite)}: foram ${fmtBRL(tenso.gasto)} de ${fmtBRL(tenso.limite)}.`
      : `O orçamento de ${tenso.category} chegou a ${tenso.pct}% do limite: restam ${fmtBRL(tenso.limite - tenso.gasto)} de ${fmtBRL(tenso.limite)}.`
    let frase2: string
    if (!hasTx) frase2 = `Fora isso, ainda não há outras transações em ${period}.`
    else if (f.income > 0 && f.balance >= 0) frase2 = `Fora isso, em ${period} você registrou ${movimento}, com poupança de ${f.savingsRate}%.`
    else frase2 = `Fora isso, em ${period} você registrou ${movimento}, com ${saldoTxt}.`
    fala = `${frase1} ${frase2}`
  } else if (f.income > 0 && f.balance < 0) {
    fala = `As despesas do mês passaram as receitas em ${fmtBRL(Math.abs(f.balance))} até aqui. Em ${period}, são ${fmtBRL(f.income)} de receitas contra ${fmtBRL(f.expenses)} de despesas.`
  } else if (f.income > 0 && f.savingsRate >= 20) {
    fala = `Você está guardando ${f.savingsRate}% do que ganhou em ${period}. São ${movimento} até aqui, com ${saldoTxt}.`
  } else if (hasTx) {
    fala = `Seu mês segue com ${saldoTxt} até aqui. Em ${period}, são ${movimento}.`
  } else {
    fala = `Ainda não há transações em ${period}, e o jeito mais simples de começar é registrar o primeiro gasto do dia. Com receitas e despesas registradas, os números do mês aparecem aqui.`
  }

  const candidatos: MeuDiaRec[] = []
  if (tenso && tenso.pct > 85) {
    candidatos.push({ title: `Segurar ${tenso.category}`, detail: `Já foram ${fmtBRL(tenso.gasto)} de ${fmtBRL(tenso.limite)}, ${tenso.pct}% do limite.` })
  } else if (tenso && tenso.pct > 70) {
    candidatos.push({ title: `De olho em ${tenso.category}`, detail: `O orçamento está em ${tenso.pct}% do limite, ainda dá para fechar o mês dentro dele.` })
  }
  if (contas.length > 0) {
    const conta = contas[0]
    candidatos.push({
      title: `Separar ${conta.name}`,
      detail: conta.day_of_month ? `${fmtBRL(conta.amount)}, vence no dia ${conta.day_of_month}.` : `${fmtBRL(conta.amount)} por mês em conta fixa.`,
    })
  }
  if (metas.length > 0) {
    const meta = metas[0]
    const falta = Math.max(0, meta.target_amount - meta.current_amount)
    candidatos.push({
      title: `Aportar em ${meta.name}`,
      detail: falta > 0 ? `Faltam ${fmtBRL(falta)} para o alvo de ${fmtBRL(meta.target_amount)}.` : 'A meta chegou ao alvo, vale revisar o próximo passo.',
    })
  }
  const topCat = f.topCategories[0]
  if (topCat && (!tenso || tenso.category !== topCat.name)) {
    candidatos.push({ title: `Revisar ${topCat.name}`, detail: `Foi a categoria com mais gastos no mês: ${fmtBRL(topCat.total)}.` })
  }
  if (f.income > 0) {
    candidatos.push({ title: 'Acompanhar a poupança', detail: `A taxa do mês está em ${f.savingsRate}%, e registrar os gastos do dia mantém o número fiel.` })
  }
  candidatos.push({ title: 'Registrar o dia', detail: 'Uma entrada de hoje mantém os números fiéis ao que aconteceu.' })
  candidatos.push({ title: 'Percorrer suas áreas', detail: 'Suas áreas mostram como cada parte da sua vida está agora.' })
  candidatos.push({ title: 'Falar com Sy', detail: 'Pergunte sobre qualquer área, a resposta usa os seus dados.' })

  return { fala, recs: candidatos.slice(0, 3) }
}
