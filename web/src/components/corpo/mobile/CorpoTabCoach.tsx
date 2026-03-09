'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import type { HealthProfile, Activity, WeightEntry } from '@/hooks/use-corpo'

const CORPO_COLOR = '#f97316'
const CORPO_BG = 'rgba(249,115,22,0.12)'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTED_PROMPTS = [
  'Como perder 5kg com saúde?',
  'Rotina de exercícios para iniciante',
  'Melhor dieta para ganho de massa?',
  'Como melhorar meu sono?',
]

interface CorpoTabCoachProps {
  profile: HealthProfile | null
  weekActivities: Activity[]
  latestWeight: WeightEntry | null
  isPro?: boolean
}

export function CorpoTabCoach({ profile, weekActivities, latestWeight, isPro = false }: CorpoTabCoachProps) {
  const weekGoal = profile?.weekly_activity_goal ?? 4
  const actCount = weekActivities.length
  const weekKcal = weekActivities.reduce((s, a) => s + (a.calories_burned ?? 0), 0)
  const goalKg = profile?.weight_goal_kg
  const currentKg = latestWeight?.weight

  const weekChallengePct = Math.min((actCount / weekGoal) * 100, 100)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
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
        body: JSON.stringify({ messages: newMessages, healthProfile }),
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
      const msg = err instanceof Error ? err.message : 'Ocorreu um erro. Tente novamente.'
      setMessages((prev) => [
        ...prev.filter(m => m.content !== ''),
        { role: 'assistant', content: msg },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [messages, isLoading, profile])

  // Action plan based on data
  const actionItems = [
    weekActivities.length < weekGoal && {
      n: 1,
      title: `Adicionar ${weekGoal - actCount} treino${weekGoal - actCount > 1 ? 's' : ''} esta semana`,
      sub: `Meta: ${weekGoal}x/semana · Você fez ${actCount}`,
    },
    profile?.tdee && {
      n: 2,
      title: 'Aumentar hidratação para 2,5L/dia',
      sub: 'Hidratação adequada acelera o metabolismo',
    },
    profile?.weight_goal_kg && currentKg && currentKg > profile.weight_goal_kg && {
      n: 3,
      title: `Atingir ${profile.weight_goal_kg}kg`,
      sub: `Diferença atual: ${(currentKg - profile.weight_goal_kg).toFixed(1)}kg`,
    },
    !profile && {
      n: 4,
      title: 'Configure seu perfil de saúde',
      sub: 'Para análises personalizadas de TMB e TDEE',
    },
  ].filter(Boolean) as { n: number; title: string; sub: string }[]

  if (!isPro) {
    return (
      <div className="pb-6 px-4">
        {/* PRO gate */}
        <div
          className="mt-4 rounded-2xl p-6 text-center"
          style={{
            background: 'linear-gradient(135deg,rgba(249,115,22,0.1),rgba(139,92,246,0.1))',
            border: '1px solid rgba(249,115,22,0.2)',
          }}
        >
          <p className="text-[40px] mb-3">🤖</p>
          <p className="font-[Syne] text-[18px] font-bold text-[var(--sl-t1)] mb-2">Coach IA — PRO</p>
          <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed mb-5">
            Análise semanal personalizada, plano de ação baseado nos seus dados e desafios com XP.
          </p>
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            <p className="text-[12px] font-semibold text-[var(--sl-t1)] mb-3">Funcionalidades PRO:</p>
            {[
              '🔍 Análise detalhada por semana',
              '📋 Plano de ação personalizado',
              '🏆 Desafios semanais com XP',
              '💡 Sugestões de cardápio IA',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-2 mb-2">
                <span className="text-[14px]">{feat}</span>
              </div>
            ))}
          </div>
          <div
            className="w-full py-3 rounded-[10px] font-[Syne] text-[14px] font-bold"
            style={{ background: 'linear-gradient(135deg,#f97316,#a855f7)', color: '#fff' }}
          >
            💎 Assinar PRO — R$ 29/mês
          </div>
        </div>

        {/* Preview borrado */}
        <div className="mt-4 relative">
          <div className="blur-sm pointer-events-none">
            <div className="rounded-2xl p-4 mb-3" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
              <p className="text-[16px] font-bold text-[var(--sl-t1)] mb-2">Análise da Semana</p>
              <p className="text-[13px] text-[var(--sl-t2)]">Você perdeu 1,8kg este mês treinando 3x/semana...</p>
            </div>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl"
            style={{ background: 'rgba(3,7,26,0.6)', backdropFilter: 'blur(2px)' }}
          >
            <div className="text-center">
              <p className="text-[22px] mb-1">💎</p>
              <p className="text-[13px] font-semibold text-white">Disponível no PRO</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-6">
      {/* Main insight */}
      <div
        className="mx-4 mb-3 rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg,rgba(249,115,22,0.1),rgba(139,92,246,0.1))',
          border: '1px solid rgba(249,115,22,0.2)',
        }}
      >
        <div className="flex gap-[10px] mb-3">
          <span className="text-[28px]">🤖</span>
          <div>
            <p className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)]">Análise da Semana</p>
            <p className="text-[12px] text-[var(--sl-t2)]">Baseado nos seus dados reais</p>
          </div>
        </div>
        <p className="text-[13px] text-[var(--sl-t1)] leading-relaxed">
          {actCount > 0
            ? <>Você fez <strong style={{ color: CORPO_COLOR }}>{actCount} treino{actCount > 1 ? 's' : ''}</strong> esta semana,
              queimando <strong style={{ color: '#f43f5e' }}>{Math.round(weekKcal)} kcal</strong>.
              {goalKg && currentKg && currentKg > goalKg
                ? <> Continue e atinja <strong style={{ color: CORPO_COLOR }}>{goalKg}kg</strong> em breve.</>
                : <> Ótimo ritmo! Continue assim.</>
              }</>
            : <>Nenhuma atividade esta semana. Comece com 20 min de caminhada — pequenos passos fazem grande diferença!</>
          }
        </p>
      </div>

      {/* Action plan */}
      {actionItems.length > 0 && (
        <>
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] px-5 pb-2">PLANO DE AÇÃO SEMANAL</p>
          <div className="mx-4 mb-3 rounded-2xl p-4" style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
            {actionItems.map(({ n, title, sub }) => (
              <div key={n} className="flex gap-[10px] items-start mb-3 last:mb-0">
                <div
                  className="w-6 h-6 rounded-[7px] flex items-center justify-center text-[12px] flex-shrink-0 font-bold"
                  style={{ background: CORPO_BG, color: CORPO_COLOR }}
                >
                  {n}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-[var(--sl-t1)]">{title}</p>
                  <p className="text-[12px] text-[var(--sl-t2)] mt-[2px]">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Desafio da semana */}
      <div
        className="mx-4 mb-4 rounded-2xl p-4"
        style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.2)' }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-[14px] font-semibold text-[var(--sl-t1)]">🏆 Desafio da Semana</span>
          <span
            className="text-[11px] font-medium px-2 py-[3px] rounded-full"
            style={{ background: CORPO_BG, color: CORPO_COLOR }}
          >
            +100 XP
          </span>
        </div>
        <p className="text-[13px] text-[var(--sl-t2)] mb-2">
          {weekGoal} treinos esta semana ({actCount}/{weekGoal})
        </p>
        <div className="h-[6px] rounded-full overflow-hidden" style={{ background: 'var(--sl-s3)' }}>
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${weekChallengePct}%`, background: CORPO_COLOR }}
          />
        </div>
      </div>

      {/* ── Coach Chat ── */}
      <div className="mx-4">
        {/* Disclaimer */}
        <div className="flex items-start gap-2 p-3 mb-3 rounded-xl bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[10px] text-[var(--sl-t3)]">
          <Sparkles size={12} className="shrink-0 mt-0.5 text-[#f59e0b]" />
          <span>Orientações gerais de saúde. Para diagnósticos, consulte um profissional.</span>
        </div>

        {/* Messages or empty state */}
        {messages.length === 0 ? (
          <div className="text-center mb-3">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f97316]/20 to-[#f59e0b]/10 flex items-center justify-center text-[20px]">
                🤖
              </div>
              <div className="text-left">
                <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">Pergunte ao Coach</p>
                <p className="text-[10px] text-[var(--sl-t2)]">
                  {profile ? 'Conheço seu perfil de saúde' : 'Alimentação, exercícios, sono'}
                </p>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="shrink-0 px-3 py-[7px] rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)]
                             text-[11px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] hover:border-[var(--sl-border-h)] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mb-3 max-h-[400px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-lg bg-[#f97316]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={12} className="text-[#f97316]" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-3 py-2.5 text-[12px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#10b981] text-white rounded-tr-sm'
                    : 'bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[var(--sl-t1)] rounded-tl-sm'
                }`}>
                  {msg.content || (
                    <span className="flex gap-1 items-center text-[var(--sl-t3)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                    </span>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-lg bg-[#10b981]/15 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={12} className="text-[#10b981]" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-[var(--sl-s1)] border border-[var(--sl-border)]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
            placeholder="Pergunte ao coach..."
            className="flex-1 bg-transparent text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none"
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
    </div>
  )
}
