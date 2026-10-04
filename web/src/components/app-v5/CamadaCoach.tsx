'use client'

// Camada de Sy (Fase 1): porte de prototypes/v5/app/meu-dia-d.html (aside
// lateral) e meu-dia-d.mobile.html (bottom sheet <1024px). Componente CONTROLADO:
// a tela dona manda open/seed/suggestions/onClose/moduleId/leitura. A conversa é
// persistida pelo servidor em /api/ai/coach-thread (coach_messages) e as fontes
// chegam no header x-sy-fontes, nunca no texto do modelo.

import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import Link from 'next/link'
import { COACH_OS_ENABLED } from '@/lib/flags'
import type { ModuleId } from '@/types/shell'
import './chrome-v5.css'

interface CamadaCoachProps {
  open: boolean
  seed: string
  suggestions: string[]
  onClose: () => void
  /** Módulo cujo pacote de contexto Sy lê (default panorama, a tela Meu dia). */
  moduleId?: ModuleId
  /** Complemento do eyebrow "Sy · lendo: …" (default "o seu dia"). */
  leitura?: string
  /** Saudação do estado vazio (default "Já li o seu dia. O que você quer saber?"). */
  saudacao?: string
}

interface Msg {
  id: number
  role: 'user' | 'assistant'
  content: string
  /** bolha gerada no client (kill-switch, erros): renderiza, mas fica FORA do payload do modelo */
  local?: boolean
  /** fontes citadas pelo servidor (header x-sy-fontes), só em respostas de Sy */
  fontes?: string[]
}

const FALLBACK_SUGESTOES = [
  'Quanto ainda posso gastar em lazer?',
  'Resumo da minha semana',
  'Como estão as minhas metas?',
]

const ERRO_RESPOSTA = 'Não consegui responder agora. Tente de novo em instantes.'
const COACH_DESLIGADO = 'Sy está desligado no momento.'

const dotStyle = (i: number) => ({ '--i': i } as CSSProperties)

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export function CamadaCoach({
  open, seed, suggestions, onClose,
  moduleId = 'panorama', leitura = 'o seu dia', saudacao = 'Já li o seu dia. O que você quer saber?',
}: CamadaCoachProps) {
  const [sheet, setSheet] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [busy, setBusy] = useState(false)
  const [threadStart, setThreadStart] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const cbodyRef = useRef<HTMLDivElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)
  const wasOpenRef = useRef(false)
  const seedRef = useRef(seed)
  seedRef.current = seed
  const nextIdRef = useRef(1)
  const abortRef = useRef<AbortController | null>(null)

  // aborta um stream pendente SÓ no desmonte do componente
  // (fechar/reabrir a camada preserva a conversa e o stream em andamento)
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  // variante sheet (<1024px), com listener (SSR-safe: window só no effect)
  useEffect(() => {
    const mq = window.matchMedia('(max-width:1023px)')
    const apply = () => setSheet(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // abrir: guarda quem tinha o foco, semeia o input e foca (só fora do sheet);
  // fechar: devolve o foco pra quem estava com ele
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      prevFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
      setInput(seedRef.current)
      if (!window.matchMedia('(max-width:1023px)').matches) {
        inputRef.current?.focus({ preventScroll: true })
      }
    } else if (!open && wasOpenRef.current) {
      prevFocusRef.current?.focus({ preventScroll: true })
      prevFocusRef.current = null
    }
    wasOpenRef.current = open
  }, [open])

  // Esc fecha (só com a camada aberta)
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // auto-scroll do corpo pro fim a cada chunk/mensagem
  useEffect(() => {
    const el = cbodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing])

  async function send(raw: string) {
    const text = raw.trim()
    if (!text || busy) return

    const userMsg: Msg = { id: nextIdRef.current++, role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    if (!threadStart) {
      setThreadStart(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))
    }

    // bolha local (kill-switch, erros): renderiza, mas não entra no payload do modelo
    const pushLocal = (content: string) => {
      setMessages((prev) => [...prev, { id: nextIdRef.current++, role: 'assistant', content, local: true }])
    }

    // kill-switch: resposta local imediata, sem fetch
    if (!COACH_OS_ENABLED) {
      pushLocal(COACH_DESLIGADO)
      return
    }

    setBusy(true)
    setTyping(true)
    const asstId = nextIdRef.current++
    let started = false
    const push = (content: string) => {
      if (!started) {
        started = true
        setTyping(false)
        setMessages((prev) => [...prev, { id: asstId, role: 'assistant', content }])
      } else {
        setMessages((prev) => prev.map((m) => (m.id === asstId ? { ...m, content } : m)))
      }
    }

    const ctrl = new AbortController()
    abortRef.current = ctrl

    try {
      const res = await fetch('/api/ai/coach-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // bolhas locais fora do contexto; schema aceita 50, mandamos só as últimas 20
          messages: history
            .filter((m) => !m.local)
            .slice(-20)
            .map(({ role, content }) => ({ role, content })),
          moduleId,
        }),
        signal: ctrl.signal,
      })
      if (!res.ok || !res.body) {
        pushLocal(ERRO_RESPOSTA)
        return
      }
      let fontes: string[] = []
      try {
        const raw = res.headers.get('x-sy-fontes')
        if (raw) fontes = (JSON.parse(decodeURIComponent(raw)) as unknown[]).filter((f): f is string => typeof f === 'string')
      } catch { fontes = [] }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        if (acc) push(acc)
      }
      acc += decoder.decode()
      if (acc && started) push(acc)
      if (started && fontes.length > 0) {
        setMessages((prev) => prev.map((m) => (m.id === asstId ? { ...m, fontes } : m)))
      }
      if (!started) {
        if (acc) push(acc)
        else pushLocal(ERRO_RESPOSTA)
      }
    } catch {
      // abort do desmonte: silencioso; erro de rede: bolha local de erro
      if (!ctrl.signal.aborted) pushLocal(ERRO_RESPOSTA)
    } finally {
      if (abortRef.current === ctrl) abortRef.current = null
      setTyping(false)
      setBusy(false)
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    void send(input)
  }

  const chips = suggestions.length > 0 ? suggestions : FALLBACK_SUGESTOES

  return (
    <>
      <div className={'scrim' + (open ? ' open' : '')} onClick={onClose} aria-hidden="true" />
      <aside
        className={'camada' + (sheet ? ' sheet' : '') + (open ? ' open' : '')}
        role="dialog"
        aria-modal="true"
        aria-label="Sy"
        inert={!open}
      >
        {sheet && <div className="handle" />}
        <header className="chead">
          <p className="eyebrow"><b>Sy</b> · lendo: {leitura}</p>
          <button className="x" type="button" aria-label="Fechar" onClick={onClose}>
            <XIcon />
          </button>
        </header>
        <div className="cbody" ref={cbodyRef}>
          {messages.length === 0 ? (
            <div className="cempty">
              <p className="hello">{saudacao}</p>
              <div className="csug">
                {chips.map((c, i) => (
                  <button key={`${i}:${c}`} className="chip" type="button" onClick={() => void send(c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="cthread">
              <div className="divider">Hoje · {threadStart}</div>
              {messages.map((m) => (
                <div key={m.id} className={m.role === 'user' ? 'bub u' : 'bub a'}>
                  {m.content}
                  {m.fontes && m.fontes.length > 0 && (
                    <span className="meta">Fontes: {m.fontes.join(' · ')}</span>
                  )}
                </div>
              ))}
              {typing && (
                <div className="typing" aria-label="Sy digitando">
                  <i style={dotStyle(0)} /><i style={dotStyle(1)} /><i style={dotStyle(2)} />
                </div>
              )}
            </div>
          )}
        </div>
        <form className="cask" onSubmit={handleSubmit}>
          <div className="in">
            <input
              ref={inputRef}
              type="text"
              placeholder="Pergunte qualquer coisa sobre a sua vida"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <SendIcon />
          </div>
        </form>
        <Link className="cfull" href="/coach">
          Conversa completa →
        </Link>
      </aside>
    </>
  )
}
