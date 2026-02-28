'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Bot, Sparkles, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { formatMoneyWithBrl } from '@/lib/currency'
import { calcTripDays, type ItineraryCategory, type Trip, type TripItineraryItem } from '@/hooks/use-experiencias'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at?: string
}

interface TripAIChatProps {
  tripId: string
  trip: Trip
  itinerary: TripItineraryItem[]
  onItineraryAdded?: () => Promise<void> | void
}

const QUICK_PROMPTS = [
  'Quais são os melhores restaurantes locais?',
  'Sugira atividades para o primeiro dia',
  'Faça uma estimativa de custo por dia no destino',
  'Como me locomover neste destino?',
  'Dicas de segurança para esta região',
  'Quais documentos preciso levar e qual validade ideal do passaporte?',
]

interface AISuggestedItineraryItem {
  day_offset?: number
  title?: string
  category?: string
  address?: string
  estimated_time?: string
  estimated_cost?: number
  notes?: string
}

interface AIBudgetEstimate {
  daily_estimate?: number
  total_estimate?: number
  assumptions?: string[]
}

function stripSyncBlocks(content: string): string {
  return content
    .replace(/<sync_suggestions>[\s\S]*?<\/sync_suggestions>/g, '')
    .replace(/<sync_budget_estimate>[\s\S]*?<\/sync_budget_estimate>/g, '')
    .trim()
}

function parseSyncSuggestions(content: string): AISuggestedItineraryItem[] {
  const match = content.match(/<sync_suggestions>([\s\S]*?)<\/sync_suggestions>/)
  if (!match?.[1]) return []
  try {
    const parsed = JSON.parse(match[1])
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function parseBudgetEstimate(content: string): AIBudgetEstimate | null {
  const match = content.match(/<sync_budget_estimate>([\s\S]*?)<\/sync_budget_estimate>/)
  if (!match?.[1]) return null
  try {
    const parsed = JSON.parse(match[1])
    return parsed && typeof parsed === 'object' ? parsed as AIBudgetEstimate : null
  } catch {
    return null
  }
}

const VALID_ITINERARY_CATEGORIES: ItineraryCategory[] = [
  'sightseeing',
  'restaurant',
  'museum',
  'beach',
  'shopping',
  'transport',
  'rest',
  'other',
]

function normalizeCategory(category?: string): ItineraryCategory {
  if (category && VALID_ITINERARY_CATEGORIES.includes(category as ItineraryCategory)) {
    return category as ItineraryCategory
  }
  return 'other'
}

export function TripAIChat({ tripId, trip, itinerary, onItineraryAdded }: TripAIChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const latestBudget = [...messages]
    .reverse()
    .find(m => m.role === 'assistant' && parseBudgetEstimate(m.content))
  const parsedBudget = latestBudget ? parseBudgetEstimate(latestBudget.content) : null

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load conversation history from DB
  useEffect(() => {
    async function loadHistory() {
      setIsLoadingHistory(true)
      try {
        const supabase = createClient()
        const { data } = await (supabase as any)
          .from('trip_ai_conversations')
          .select('id, user_message, ai_response, created_at')
          .eq('trip_id', tripId)
          .order('created_at', { ascending: true })

        if (data) {
          const parsed: Message[] = []
          for (const row of data) {
            parsed.push({
              id: row.id + '_user',
              role: 'user',
              content: row.user_message,
              created_at: row.created_at,
            })
            parsed.push({
              id: row.id + '_ai',
              role: 'assistant',
              content: row.ai_response,
              created_at: row.created_at,
            })
          }
          setMessages(parsed)
        }
      } catch {
        // silent — no history is fine
      } finally {
        setIsLoadingHistory(false)
      }
    }

    loadHistory()
  }, [tripId])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  async function handleSend(text?: string) {
    const userText = (text ?? input).trim()
    if (!userText || isLoading) return

    const userMsg: Message = {
      id: Date.now() + '_user',
      role: 'user',
      content: userText,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    // Build context from trip data
    const tripContext = {
      nome: trip.name,
      destinos: trip.destinations.join(', '),
      tipo: trip.trip_type,
      inicio: trip.start_date,
      fim: trip.end_date,
      viajantes: trip.travelers_count,
      orcamento_total: trip.total_budget,
      moeda: trip.currency,
      status: trip.status,
    }

    // Build messages for API (only pairs from history, exclude current user msg)
    const historyMessages = messages
      .filter(m => m.role === 'user' || m.role === 'assistant')
      .reduce<{ role: string; content: string }[]>((acc, m) => {
        acc.push({ role: m.role, content: m.content })
        return acc
      }, [])
    historyMessages.push({ role: 'user', content: userText })

    let fullResponse = ''
    const assistantMsgId = Date.now() + '_ai'

    // Add placeholder assistant message for streaming
    setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/ai/viagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyMessages,
          context: tripContext,
        }),
      })

      if (!res.ok) {
        const errorText = await res.text().catch(() => '')
        throw new Error(errorText || 'Erro na resposta da IA')
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMsgId ? { ...m, content: fullResponse } : m
            )
          )
        }
      }

      if (!fullResponse.trim()) {
        throw new Error('A IA não retornou uma resposta. Tente novamente.')
      }

      // Persist to DB
      const supabase = createClient()
      await (supabase as any)
        .from('trip_ai_conversations')
        .insert({
          trip_id: tripId,
          user_message: userText,
          ai_response: fullResponse,
        })

    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao consultar a IA. Tente novamente.'
      toast.error(msg)
      // Remove placeholder if failed
      setMessages(prev => prev.filter(m => m.id !== assistantMsgId))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleAddSuggestion(item: AISuggestedItineraryItem) {
    if (!item.title) {
      toast.error('Sugestão sem título válido')
      return
    }
    const dayOffset = Math.max(0, Math.floor(item.day_offset ?? 0))
    const tripDays = calcTripDays(trip.start_date, trip.end_date)
    const clampedOffset = Math.min(dayOffset, Math.max(0, tripDays - 1))
    const targetDate = new Date(trip.start_date + 'T12:00:00')
    targetDate.setDate(targetDate.getDate() + clampedOffset)
    const dayDate = targetDate.toISOString().split('T')[0]

    const alreadyExists = itinerary.some(
      it => it.day_date === dayDate && it.title.trim().toLowerCase() === item.title!.trim().toLowerCase()
    )
    if (alreadyExists) {
      toast.info('Essa atividade já existe no roteiro deste dia.')
      return
    }

    const sortOrder = itinerary.filter(it => it.day_date === dayDate).length
    const supabase = createClient()
    const { error } = await (supabase as any)
      .from('trip_itinerary_items')
      .insert({
        trip_id: tripId,
        day_date: dayDate,
        sort_order: sortOrder,
        title: item.title.trim(),
        category: normalizeCategory(item.category),
        address: item.address?.trim() || null,
        estimated_time: item.estimated_time?.trim() || null,
        estimated_cost: typeof item.estimated_cost === 'number' ? item.estimated_cost : null,
        currency: trip.currency,
        notes: item.notes?.trim() || null,
      })

    if (error) {
      toast.error('Erro ao adicionar sugestão ao roteiro')
      return
    }
    await onItineraryAdded?.()
    toast.success('Sugestão adicionada ao roteiro!')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col gap-4">

      {/* Header + disclaimer (RN-EXP-25) */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}>
            <Bot size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">
              🤖 Assistente de Viagem — SyncLife Travel
            </p>
            <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">
              Roteiros, dicas locais, hospedagem, transporte e orçamento na moeda da viagem
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 mt-3 p-3 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
          <AlertCircle size={13} className="text-[#f59e0b] shrink-0 mt-0.5" />
          <p className="text-[10px] text-[var(--sl-t3)] leading-relaxed">
            As sugestões da IA são geradas automaticamente e podem estar desatualizadas.
            Confirme informações em fontes oficiais antes de tomar decisões de viagem.
          </p>
        </div>

        {parsedBudget && (parsedBudget.daily_estimate || parsedBudget.total_estimate) && (
          <div className="mt-3 p-3 rounded-xl border border-[#10b981]/30 bg-[#10b981]/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1">
              Estimativa IA de custo (beta)
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {typeof parsedBudget.daily_estimate === 'number' && (
                <p className="text-[11px] text-[var(--sl-t2)]">
                  Por dia: <span className="font-[DM_Mono] text-[var(--sl-t1)]">{formatMoneyWithBrl(parsedBudget.daily_estimate, trip.currency)}</span>
                </p>
              )}
              {typeof parsedBudget.total_estimate === 'number' && (
                <p className="text-[11px] text-[var(--sl-t2)]">
                  Total: <span className="font-[DM_Mono] text-[var(--sl-t1)]">{formatMoneyWithBrl(parsedBudget.total_estimate, trip.currency)}</span>
                </p>
              )}
            </div>
            {parsedBudget.assumptions && parsedBudget.assumptions.length > 0 && (
              <p className="text-[10px] text-[var(--sl-t3)] mt-1.5">
                {parsedBudget.assumptions.join(' • ')}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl flex flex-col"
        style={{ minHeight: '480px', maxHeight: '600px' }}>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ minHeight: 0 }}>

          {isLoadingHistory ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-[#10b981] border-t-transparent animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            /* Empty state with quick prompts (RN-EXP-22) */
            <div className="flex-1 flex flex-col items-center justify-center py-8 gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(0,85,255,0.15))' }}>
                <Sparkles size={24} className="text-[#10b981]" />
              </div>
              <div className="text-center">
                <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-1">
                  O que você quer saber sobre {trip.destinations[0] ?? 'esta viagem'}?
                </p>
                <p className="text-[11px] text-[var(--sl-t3)]">Pergunte qualquer coisa ou escolha uma sugestão abaixo</p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center max-w-[420px]">
                {QUICK_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full text-[11px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[#10b981] hover:text-[#10b981] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex gap-2.5',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}>
                      <Bot size={14} className="text-white" />
                    </div>
                  )}
                  <div className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-[12px] leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-[#10b981]/15 border border-[#10b981]/30 text-[var(--sl-t1)] rounded-tr-sm'
                      : 'bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t2)] rounded-tl-sm'
                  )}>
                    {msg.content === '' && msg.role === 'assistant' ? (
                      <div className="flex gap-1 items-center py-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{stripSyncBlocks(msg.content)}</p>
                    )}
                    {msg.role === 'assistant' && parseSyncSuggestions(msg.content).length > 0 && (
                      <div className="mt-2 flex flex-col gap-1.5">
                        {parseSyncSuggestions(msg.content).map((suggestion, idx) => (
                          <button
                            key={`${msg.id}-s-${idx}`}
                            onClick={() => handleAddSuggestion(suggestion)}
                            className="text-left px-2.5 py-1.5 rounded-lg border border-[#10b981]/40 bg-[#10b981]/10 hover:bg-[#10b981]/15 transition-colors"
                          >
                            <p className="text-[10px] font-semibold text-[var(--sl-t1)]">
                              + Adicionar ao roteiro: {suggestion.title ?? 'Atividade sugerida'}
                            </p>
                            <p className="text-[10px] text-[var(--sl-t3)]">
                              Dia +{Math.max(0, Math.floor(suggestion.day_offset ?? 0))}
                              {suggestion.estimated_time ? ` · ${suggestion.estimated_time}` : ''}
                              {typeof suggestion.estimated_cost === 'number' ? ` · ${formatMoneyWithBrl(suggestion.estimated_cost, trip.currency)}` : ''}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-[var(--sl-border)] p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                rows={1}
                placeholder="Pergunte algo sobre a viagem… (Enter para enviar)"
                className="flex-1 px-3 py-2.5 rounded-[12px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#10b981] resize-none transition-colors disabled:opacity-50"
                style={{ maxHeight: '100px', overflowY: 'auto' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
              >
                <Send size={15} className="text-white" />
              </button>
            </div>
        </div>
      </div>

      {/* Quick prompts when there are messages */}
      {messages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.slice(0, 3).map(prompt => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full text-[11px] border border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[#10b981] hover:text-[#10b981] transition-colors disabled:opacity-40"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
