/**
 * Schemas Zod da intenção composta (spec §6.2, plano Fase 1 Task 16).
 *
 * Whitelist por tabela decidida aqui, no servidor, nunca pelo modelo.
 * O que não bate no schema é descartado, não corrigido.
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Primitivos
// ---------------------------------------------------------------------------

/** YYYY-MM-DD com mês 01..12 e dia 01..31. */
const DataISO = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, 'Data no formato YYYY-MM-DD')

/** HH:MM em 24h. */
const HoraHM = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora no formato HH:MM')

const Nome = z.string().min(1).max(120)
const Rotulo = z.string().min(1).max(160)
const Href = z.string().min(1).max(200)

// ---------------------------------------------------------------------------
// Registros por tabela (whitelist)
// ---------------------------------------------------------------------------

export const RegStudyTrack = z.object({
  tabela: z.literal('study_tracks'),
  name: Nome,
  target_date: DataISO,
  cost: z.number().min(0),
  rotulo: Rotulo,
  href: Href,
})

export const RegAgendaEvento = z.object({
  tabela: z.literal('agenda_events'),
  title: Nome,
  date: DataISO,
  start_time: HoraHM,
  end_time: HoraHM,
  rotulo: Rotulo,
  href: Href,
})

export const RegRecorrente = z.object({
  tabela: z.literal('recurring_transactions'),
  name: Nome,
  amount: z.number().positive(),
  day_of_month: z.number().int().min(1).max(31),
  /** primeira cobrança; ausente = hoje (o caminho "esperar" manda janeiro) */
  start_date: DataISO.optional(),
  rotulo: Rotulo,
  href: Href,
})

export const RegSkill = z.object({
  tabela: z.literal('skills'),
  name: Nome,
  rotulo: Rotulo,
  href: Href,
})

export const RegGoal = z.object({
  tabela: z.literal('goals'),
  name: Nome,
  target_date: DataISO,
  rotulo: Rotulo,
  href: Href,
})

export const RegistroSchema = z.discriminatedUnion('tabela', [
  RegStudyTrack,
  RegAgendaEvento,
  RegRecorrente,
  RegSkill,
  RegGoal,
])

export type Registro = z.infer<typeof RegistroSchema>
export type TabelaIntencao = Registro['tabela']

const Registros = z.array(RegistroSchema).min(1).max(8)

// ---------------------------------------------------------------------------
// Proposta (saída do modelo, validada no servidor)
// ---------------------------------------------------------------------------

export const AreaId = z.enum(['01', '02', '03', '04', '05', '06', '07', '08'])

export const EfeitoSchema = z.object({
  area: AreaId,
  texto: z.string().min(1).max(240),
})

export const CaminhoSchema = z.object({
  id: z.string().min(1).max(40),
  titulo: z.string().min(1).max(80),
  resumo: z.string().min(1).max(400),
  registros: Registros,
  efeitos: z.array(EfeitoSchema),
})

export const PropostaSchema = z.object({
  tipo: z.literal('iniciar_curso'),
  caminhos: z.array(CaminhoSchema).min(2).max(3),
})

export type Caminho = z.infer<typeof CaminhoSchema>
export type Proposta = z.infer<typeof PropostaSchema>
export type TipoIntencao = Proposta['tipo']

// ---------------------------------------------------------------------------
// Inputs das rotas
// ---------------------------------------------------------------------------

/** POST /api/ai/intencao */
export const IntencaoInput = z.object({
  texto: z.string().min(3).max(500),
  moduleId: z.string().min(1).max(40),
})

/** POST /api/intencao/aplicar */
export const AplicarInput = z.object({
  intencaoId: z.uuid(),
  caminho: z.string().min(1).max(40),
  registros: Registros,
})

/** POST /api/intencao/desfazer */
export const DesfazerInput = z.object({
  intencaoId: z.uuid(),
})

export type IntencaoInputT = z.infer<typeof IntencaoInput>
export type AplicarInputT = z.infer<typeof AplicarInput>
export type DesfazerInputT = z.infer<typeof DesfazerInput>

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Valida item a item e descarta o que não bate. Nunca corrige: um registro
 * inválido do modelo simplesmente não entra na proposta.
 */
export function filtrarRegistrosValidos(registros: unknown[]): Registro[] {
  const validos: Registro[] = []
  for (const item of registros) {
    const r = RegistroSchema.safeParse(item)
    if (r.success) validos.push(r.data)
  }
  return validos
}

/** Rota real de cada tabela da whitelist; resolvida no servidor, nunca pelo modelo. */
export const HREF_POR_TABELA: Record<TabelaIntencao, string> = {
  recurring_transactions: '/financas/recorrentes',
  goals: '/futuro',
  agenda_events: '/tempo/agenda',
  study_tracks: '/mente/trilhas',
  skills: '/carreira/habilidades',
}
