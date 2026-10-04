'use client'

import { useEffect, useRef, useState } from 'react'
import { COACH_OS_ENABLED } from '@/lib/flags'

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export interface MeuDiaBriefRec {
  title: string
  detail: string
}

/** Resposta de POST /api/ai/diario-brief (texto de Sy em Meu dia). */
export interface MeuDiaBrief {
  /** 2 ou 3 frases de Sy, segunda pessoa, com os números do contexto. */
  fala: string
  recs: MeuDiaBriefRec[]
  /** Rótulos das fontes lidas no servidor (nunca vêm do modelo). */
  fontes: string[]
  /** "Atualizado às HH:MM · fontes: a, b e c", pronto para exibir. */
  fontesTexto: string
  generatedAt: string
  cached?: boolean
  fallback?: boolean
}

interface UseMeuDiaBriefReturn {
  brief: MeuDiaBrief | null
  loading: boolean
  error: string | null
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const SP_TZ = 'America/Sao_Paulo'
const NBSP = ' '

/**
 * Normaliza a prosa que vem do modelo para as regras da casa. Roda no client
 * (e não só na rota) de propósito: o payload fica cacheado o dia inteiro em
 * coach_briefs, então corrigir só na geração deixaria o texto do dia torto.
 * - "R$" sempre colado ao valor por NBSP, com ou sem espaço na origem;
 * - em-dash não existe na copy do produto, vira vírgula.
 */
const cleanProse = (s: string): string =>
  s.replace(/R\$\s*(?=\d)/g, `R$${NBSP}`).replace(/\s*—\s*/g, ', ')

function normalizeBrief(raw: MeuDiaBrief): MeuDiaBrief {
  return {
    ...raw,
    fala: cleanProse(raw.fala),
    recs: (raw.recs ?? []).map(r => ({ title: cleanProse(r.title), detail: cleanProse(r.detail) })),
    fontes: raw.fontes ?? [],
    fontesTexto: cleanProse(raw.fontesTexto ?? ''),
  }
}

/** Período atual em pt-BR no fuso de São Paulo, ex. "outubro 2026". */
function currentPeriod(): string {
  const now = new Date()
  const mes = now.toLocaleDateString('pt-BR', { timeZone: SP_TZ, month: 'long' })
  const ano = now.toLocaleDateString('en-CA', { timeZone: SP_TZ }).slice(0, 4)
  return `${mes} ${ano}`
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

/**
 * Texto de Sy em Meu dia. POST único no mount, sem retry automático e sem cache
 * local: o cache correto (1 geração/dia) é server-side.
 * Com COACH_OS desligado, pede o fallback determinístico direto (forceFallback).
 */
export function useMeuDiaBrief(): UseMeuDiaBriefReturn {
  const [brief, setBrief] = useState<MeuDiaBrief | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const started = useRef(false)

  useEffect(() => {
    // Garante 1 POST por montagem lógica (StrictMode roda o effect 2x em dev).
    if (started.current) return
    started.current = true

    async function load() {
      try {
        const res = await fetch('/api/ai/diario-brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            period: currentPeriod(),
            ...(COACH_OS_ENABLED ? {} : { forceFallback: true }),
          }),
        })

        if (res.status === 429) {
          setError('Muitas requisições. Tente de novo em instantes.')
          setLoading(false)
          return
        }
        if (!res.ok) {
          setError('Não consegui gerar o texto de hoje agora.')
          setLoading(false)
          return
        }

        const json = (await res.json()) as MeuDiaBrief
        setBrief(normalizeBrief(json))
        setLoading(false)
      } catch {
        setError('Não consegui gerar o texto de hoje agora.')
        setLoading(false)
      }
    }

    void load()
  }, [])

  return { brief, loading, error }
}

// ─── ALIAS TEMPORÁRIO (morre na Task 11, junto com DiarioV5.tsx) ──────────────

/** @deprecated Shape antigo do Diário editorial. Use MeuDiaBrief. */
export interface DiarioBrief {
  headline: string
  p1: string
  p2: string
  hand: string
  recs: MeuDiaBriefRec[]
  basedOn: string
  generatedAt: string
  cached?: boolean
  fallback?: boolean
}

/** Primeira frase de um texto (até o primeiro ". " seguido de maiúscula). */
function primeiraFrase(s: string): string {
  const m = s.match(/^.*?[.!?](?=\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ]|$)/)
  return m ? m[0] : s
}

/**
 * @deprecated Alias para DiarioV5.tsx, que ainda lê o shape antigo. Mapeia o
 * novo payload: p1 = fala, headline = primeira frase, basedOn = fontesTexto,
 * p2 e hand vazios. Morre na Task 11 (deleção do Diário editorial).
 */
export function useDiarioBrief(): { brief: DiarioBrief | null; loading: boolean; error: string | null } {
  const { brief, loading, error } = useMeuDiaBrief()
  const legado: DiarioBrief | null = brief
    ? {
        headline: primeiraFrase(brief.fala),
        p1: brief.fala,
        p2: '',
        hand: '',
        recs: brief.recs,
        basedOn: brief.fontesTexto,
        generatedAt: brief.generatedAt,
        cached: brief.cached,
        fallback: brief.fallback,
      }
    : null
  return { brief: legado, loading, error }
}
