'use client'

import { useEffect, useRef, useState } from 'react'
import { Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CoachMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface CoachChatProps {
  /** Rota AI a chamar (Fase 2: /api/ai/coach; Fase 3: /api/ai/coach-thread). */
  endpoint: string
  /** Monta o body do POST a partir do histórico (injeta contexto/moduleId). */
  buildBody: (messages: CoachMessage[]) => Record<string, unknown>
  suggestedPrompts?: string[]
  accent?: string
  placeholder?: string
  disclaimer?: string
  /** Prompt inicial injetado (drawer aberto via palette/sugestão). */
  initialPrompt?: string | null
  className?: string
}

/** Chat streaming compartilhado (drawer + /coach + hero-ask). Lê text stream via getReader(). */
export function CoachChat({
  endpoint, buildBody, suggestedPrompts = [], accent = 'var(--sl-em)',
  placeholder = 'Pergunte ao Coach', disclaimer, initialPrompt, className,
}: CoachChatProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)
  const sentInitial = useRef(false)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return
    const next = [...messages, { role: 'user' as const, content: trimmed }]
    setMessages([...next, { role: 'assistant', content: '' }])
    setInput('')
    setIsLoading(true)
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(next)),
      })
      if (!res.ok || !res.body) throw new Error(String(res.status))
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages(() => [...next, { role: 'assistant', content: acc }])
      }
      if (!acc) setMessages(() => [...next, { role: 'assistant', content: 'Não consegui responder agora. Tente de novo.' }])
    } catch {
      setMessages(() => [...next, { role: 'assistant', content: 'Erro ao consultar a IA. Tente novamente.' }])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (initialPrompt && !sentInitial.current) { sentInitial.current = true; void send(initialPrompt) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt])

  return (
    <div className={cn('flex h-full flex-col', className)}>
      <div className="flex-1 space-y-3 overflow-y-auto phone-scroll">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-2">
            {suggestedPrompts.map((p) => (
              <button key={p} type="button" onClick={() => send(p)}
                className="rounded-xl border border-dashed border-[var(--sl-border-em)] px-3 py-2 text-left text-[13px] text-[var(--sl-t2)] hover:bg-[var(--sl-em-soft)]">
                <Sparkles size={13} className="mr-2 inline text-[var(--sl-em)]" />{p}
              </button>
            ))}
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cn('max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-normal',
              m.role === 'user'
                ? 'ml-auto bg-[var(--sl-em)] text-white'
                : 'bg-[var(--sl-s2)] text-[var(--sl-t1)]')}>
              {m.content || (isLoading && i === messages.length - 1 ? '…' : '')}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input) }}
        className="mt-3 flex items-end gap-2 border-t border-[var(--sl-border)] pt-3">
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }}
          rows={1} placeholder={placeholder}
          className="max-h-32 flex-1 resize-none bg-transparent text-[13px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)]" />
        <button type="submit" disabled={isLoading || !input.trim()} aria-label="Enviar"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40"
          style={{ background: accent }}>
          <Send size={14} />
        </button>
      </form>
      {disclaimer && <p className="mt-1.5 text-[10px] text-[var(--sl-t4)]">{disclaimer}</p>}
    </div>
  )
}
