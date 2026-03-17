'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHealthProfile } from '@/hooks/use-corpo'
import { useTransactions } from '@/hooks/use-transactions'
import { useMetas } from '@/hooks/use-metas'
import { usePatrimonioDashboard } from '@/hooks/use-patrimonio'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_PROMPTS = [
  'Como melhorar meu Life Sync Score?',
  'Analise meu progresso financeiro este mês',
  'Monte um plano de 30 dias para mim',
  'Como equilibrar saúde e finanças?',
  'Dicas para atingir minhas metas mais rápido',
  'Como melhorar minha produtividade?',
]

function CoachChat() {
  const { profile } = useHealthProfile()
  const now = useMemo(() => new Date(), [])
  const { transactions } = useTransactions({ month: now.getMonth() + 1, year: now.getFullYear() })
  const { goals } = useMetas({ status: 'active' })
  const { assets } = usePatrimonioDashboard()

  const lifeContext = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    const ctx: Record<string, unknown> = {}

    if (totalIncome > 0 || totalExpense > 0) {
      ctx.financas = {
        income: totalIncome,
        expenses: totalExpense,
        balance: totalIncome - totalExpense,
        savingsRate: totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0,
      }
    }

    if (goals.length > 0) {
      ctx.futuro = {
        activeGoals: goals.length,
        goals: goals.slice(0, 5).map(g => ({
          name: g.name,
          progress: g.target_amount > 0 ? Math.round((g.current_amount / g.target_amount) * 100) : 0,
        })),
      }
    }

    if (profile) {
      ctx.corpo = {
        weight: profile.current_weight,
        height: profile.height_cm,
        weightGoal: profile.weight_goal_kg,
        activityLevel: profile.activity_level,
      }
    }

    if (assets.length > 0) {
      const totalValue = assets.reduce((s, a) => s + a.quantity * (a.current_price ?? a.avg_price), 0)
      ctx.patrimonio = { totalValue, assetCount: assets.length }
    }

    return Object.keys(ctx).length > 0 ? ctx : undefined
  }, [transactions, goals, profile, assets])

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
      const res = await fetch('/api/ai/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          healthProfile: profile ? {
            current_weight_kg: profile.current_weight,
            height_cm: profile.height_cm,
            activity_level: profile.activity_level,
            weight_goal_kg: profile.weight_goal_kg,
          } : undefined,
          lifeContext,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text().catch(() => '')
        throw new Error(errorText || 'Erro na requisição')
      }
      if (!res.body) throw new Error('Stream não disponível')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

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
        <h1 className="font-[Syne] font-extrabold text-xl flex-1 text-sl-grad">
          Coach IA
        </h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/20">
          <Sparkles size={11} className="text-[#10b981]" />
          <span className="text-[10px] font-bold text-[#10b981]">Cross-Module</span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="shrink-0 mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[11px] text-[var(--sl-t3)]">
        <Sparkles size={13} className="shrink-0 mt-0.5 text-[#f59e0b]" />
        <span>O Coach IA analisa seus dados de todos os módulos — finanças, metas, saúde, patrimônio — para dar recomendações personalizadas. Para questões médicas, consulte um profissional.</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-1 mb-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                   style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,85,255,0.1))' }}>
                <Bot size={28} className="text-[#10b981]" />
              </div>
              <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">
                Coach de Vida SyncLife
              </h2>
              <p className="text-[12px] text-[var(--sl-t2)] max-w-[320px]">
                Analiso seus dados de finanças, metas, saúde e patrimônio para orientações personalizadas.
              </p>
            </div>

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
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                       style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,85,255,0.1))' }}>
                    <Bot size={14} className="text-[#10b981]" />
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
          placeholder="Pergunte sobre finanças, metas, saúde, carreira..."
          rows={1}
          className="flex-1 resize-none bg-transparent text-[13px] text-[var(--sl-t1)]
                     placeholder:text-[var(--sl-t3)] outline-none max-h-[120px] overflow-y-auto"
          style={{ lineHeight: '1.5' }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
          className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0
                     text-white disabled:opacity-40 transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  )
}

export default function CoachPageWrapper() {
  return <CoachChat />
}
