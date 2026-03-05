'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Bot, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useShellStore } from '@/stores/shell-store'
import { useHealthProfile } from '@/hooks/use-corpo'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_PROMPTS = [
  'Como perder 5kg com saúde?',
  'Monte uma rotina de exercícios para iniciante',
  'Qual a melhor dieta para ganho de massa muscular?',
  'Como melhorar meu sono e recuperação?',
  'Dicas de alimentação pré e pós treino',
  'Como controlar a compulsão alimentar?',
]

export default function CoachPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'
  const { profile } = useHealthProfile()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text: string) {
    if (!text.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Perfil de saúde para contextualizar o coach
      const healthProfile = profile ? {
        current_weight_kg: profile.current_weight,
        height_cm: profile.height_cm,
        biological_sex: profile.biological_sex,
        birth_date: profile.birth_date,
        weight_goal_type: profile.weight_goal_type,
        weight_goal_kg: profile.weight_goal_kg,
        activity_level: profile.activity_level,
        tdee: profile.tdee,
        dietary_restrictions: profile.dietary_restrictions ?? [],
      } : null

      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          healthProfile,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text().catch(() => '')
        throw new Error(errorText || 'Erro na requisição')
      }
      if (!res.body) throw new Error('Stream não disponível')

      // Streaming
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      // Adiciona mensagem vazia do assistant para ir preenchendo
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantContent += chunk
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent }
          return updated
        })
      }

      if (!assistantContent.trim()) {
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: 'A IA não retornou uma resposta. Tente novamente.' }
          return updated
        })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Desculpe, ocorreu um erro. Tente novamente.'
      setMessages((prev) => [
        ...prev.filter(m => m.content !== ''),
        { role: 'assistant', content: msg },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-7 pb-4 flex flex-col" style={{ height: 'calc(100vh - 54px)' }}>

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-5 shrink-0">
        <button onClick={() => router.push('/corpo')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors">
          <ArrowLeft size={16} />
          Corpo
        </button>
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl flex-1',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          🤖 Coach IA
        </h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
          <Sparkles size={11} className="text-[#10b981]" />
          <span className="text-[10px] font-bold text-[#10b981]">IA</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="shrink-0 mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[11px] text-[var(--sl-t3)]">
        <Sparkles size={13} className="shrink-0 mt-0.5 text-[#f59e0b]" />
        <span>O SyncLife Coach oferece orientações gerais de saúde e bem-estar. Para diagnósticos, tratamentos e questões médicas, consulte sempre um profissional de saúde.</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f97316]/20 to-[#f59e0b]/10
                              flex items-center justify-center text-3xl">
                🤖
              </div>
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                Olá! Sou seu Coach IA
              </h2>
              <p className="text-[12px] text-[var(--sl-t2)] max-w-[300px]">
                Posso ajudar com alimentação, exercícios, sono e bem-estar geral.
                {profile && <> Já tenho acesso ao seu perfil de saúde.</>}
              </p>
            </div>

            {/* Sugestões */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-[500px]">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-3 rounded-xl bg-[var(--sl-s1)] border border-[var(--sl-border)]
                             text-[11px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)]
                             hover:border-[var(--sl-border-h)] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  'flex gap-3',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-[#f97316]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={14} className="text-[#f97316]" />
                  </div>
                )}
                <div className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-[#10b981] text-white rounded-tr-sm'
                    : 'bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t1)] rounded-tl-sm'
                )}>
                  {msg.content || (
                    <span className="flex gap-1 items-center text-[var(--sl-t3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-[#10b981]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={14} className="text-[#10b981]" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 flex items-end gap-3 p-3 rounded-2xl bg-[var(--sl-s1)] border border-[var(--sl-border)]">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pergunte ao seu coach..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-[13px] text-[var(--sl-t1)]
                     placeholder:text-[var(--sl-t3)] outline-none max-h-[120px] overflow-y-auto"
          style={{ lineHeight: '1.5' }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0
                     bg-[#10b981] text-white disabled:opacity-40 transition-opacity hover:opacity-90"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}
