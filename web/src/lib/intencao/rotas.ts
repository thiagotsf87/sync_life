/**
 * Lógica pura das rotas da intenção (/api/ai/intencao, /api/intencao/aplicar,
 * /api/intencao/desfazer). As rotas só fazem I/O; tudo que decide fica aqui e
 * é testado sem Supabase nem modelo.
 */
import { z } from 'zod'
import { propostaFallback, type ContextoIntencao } from './classificar'
import {
  AreaId, HREF_POR_TABELA, PropostaSchema, filtrarRegistrosValidos,
  type Proposta, type Registro,
} from './schemas'

// ─── Saída do modelo (schema frouxo) ─────────────────────────────────
// O modelo recebe um schema permissivo (todos os campos de registro opcionais)
// para que um registro ruim não derrube a geração inteira; a whitelist de
// verdade é aplicada depois, item a item, por `filtrarRegistrosValidos`.

export const ModeloPropostaSchema = z.object({
  caminhos: z.array(z.object({
    id: z.string().describe('Identificador curto, sem espaço: agora, menor, esperar.'),
    titulo: z.string().describe('Até 6 palavras, ex.: "Começar agora, 2 noites".'),
    resumo: z.string().describe('Conclusão de Sy em 1 ou 2 frases, segunda pessoa.'),
    registros: z.array(z.object({
      tabela: z.string().describe('study_tracks | agenda_events | recurring_transactions | skills | goals'),
      rotulo: z.string().describe('Linha curta "Área · o que nasce", com os números.'),
      name: z.string().optional(),
      title: z.string().optional(),
      date: z.string().optional().describe('YYYY-MM-DD'),
      start_time: z.string().optional().describe('HH:MM'),
      end_time: z.string().optional().describe('HH:MM'),
      target_date: z.string().optional().describe('YYYY-MM-DD'),
      cost: z.number().optional(),
      amount: z.number().optional(),
      day_of_month: z.number().optional(),
    })),
    efeitos: z.array(z.object({
      area: z.string().describe('01 Finanças, 02 Futuro, 03 Tempo, 05 Mente, 07 Carreira'),
      texto: z.string().describe('Uma linha: "Área · efeito com número".'),
    })),
  })),
})

export type ModeloProposta = z.infer<typeof ModeloPropostaSchema>

/** Copy da casa: sem controle ASCII, sem em-dash, espaços colapsados. */
export function limparTexto(s: string): string {
  return s.replace(/[\x00-\x1F\x7F]/g, ' ').replace(/\s*—\s*/g, ', ').replace(/ {2,}/g, ' ').trim()
}

/** href nunca vem do modelo nem do client: sempre o mapa do servidor. */
export function comHrefDoServidor(r: Registro): Registro {
  return { ...r, href: HREF_POR_TABELA[r.tabela] }
}

// ─── Contexto das 5 áreas ────────────────────────────────────────────

/** Junta os pacotes de contexto por área (chaves iguais: o primeiro vence) e dedupa as fontes. */
export function juntarContextos(
  pacotes: { ctx: Record<string, unknown>; fontes: string[] }[],
): { ctx: Record<string, unknown>; fontes: string[] } {
  const ctx: Record<string, unknown> = {}
  const fontes: string[] = []
  for (const p of pacotes) {
    for (const [k, v] of Object.entries(p.ctx)) if (!(k in ctx)) ctx[k] = v
    for (const f of p.fontes) if (!fontes.includes(f)) fontes.push(f)
  }
  return { ctx, fontes }
}

// ─── /api/ai/intencao ────────────────────────────────────────────────

/**
 * Monta a proposta final a partir da saída do modelo (ou null quando não houve
 * modelo / ele falhou): filtra registro a registro pela whitelist, sobrescreve
 * `href`, limpa a copy e descarta caminhos que ficaram vazios. Se o resultado
 * não passar no `PropostaSchema` (ex.: menos de 2 caminhos), cai no fallback.
 */
export function montarRespostaIntencao(
  modelo: ModeloProposta | null,
  ctx: ContextoIntencao,
  hojeISO: string,
): { proposta: Proposta; fallback: boolean } {
  if (modelo) {
    const caminhos = modelo.caminhos.slice(0, 3).map(c => ({
      id: limparTexto(c.id).slice(0, 40),
      titulo: limparTexto(c.titulo).slice(0, 80),
      resumo: limparTexto(c.resumo).slice(0, 400),
      registros: filtrarRegistrosValidos(
        c.registros.map(r => ({ ...r, rotulo: limparTexto(r.rotulo), href: HREF_POR_TABELA[r.tabela as Registro['tabela']] ?? '-' })),
      ).map(comHrefDoServidor),
      efeitos: c.efeitos.flatMap(e => {
        const area = AreaId.safeParse(e.area)
        const texto = limparTexto(e.texto).slice(0, 240)
        return area.success && texto ? [{ area: area.data, texto }] : []
      }),
    })).filter(c => c.registros.length > 0)

    const parsed = PropostaSchema.safeParse({ tipo: 'iniciar_curso', caminhos })
    if (parsed.success) return { proposta: parsed.data, fallback: false }
  }
  return { proposta: propostaFallback(ctx, hojeISO), fallback: true }
}

/** Fala de Sy que abre a proposta (a conclusão; as cifras ficam nos registros). */
export function falaDaProposta(proposta: Proposta): string {
  const n = proposta.caminhos.length
  return `Li suas cinco áreas. Dá para começar de ${n === 2 ? 'dois' : 'três'} jeitos.`
}

// ─── /api/intencao/aplicar ───────────────────────────────────────────

/**
 * Prepara os registros escolhidos para `aplicar_intencao`: `href` do mapa do
 * servidor e no máximo uma skill (a função SQL recusa mais de uma).
 */
export function normalizarRegistrosParaAplicar(registros: Registro[]): Registro[] {
  let skillVista = false
  const out: Registro[] = []
  for (const r of registros) {
    if (r.tabela === 'skills') {
      if (skillVista) continue
      skillVista = true
    }
    out.push(comHrefDoServidor(r))
  }
  return out
}

export type Feito = { tabela: string; id: string; rotulo: string; href: string }

/** "Feito · 5 registros em 4 áreas" (cada tabela é uma área). */
export function mensagemFeito(feitos: Pick<Feito, 'tabela'>[]): string {
  const n = feitos.length
  const areas = new Set(feitos.map(f => f.tabela)).size
  return `Feito · ${n} ${n === 1 ? 'registro' : 'registros'} em ${areas} ${areas === 1 ? 'área' : 'áreas'}`
}

// ─── /api/intencao/desfazer ──────────────────────────────────────────

export function mensagemDesfeito(ficaram: number): string {
  if (ficaram === 0) return 'Desfeito · nada mudou'
  return ficaram === 1
    ? 'Desfeito · 1 registro ficou porque você já o editou'
    : `Desfeito · ${ficaram} registros ficaram porque você já os editou`
}

/** Código de erro das funções SQL (`RAISE EXCEPTION 'intencao_invalida'`). */
export function ehIntencaoInvalida(erro: { message?: string } | null | undefined): boolean {
  return !!erro?.message && erro.message.includes('intencao_invalida')
}
