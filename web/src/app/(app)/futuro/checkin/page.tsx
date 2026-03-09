'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { useObjectives } from '@/hooks/use-futuro'
import { FUTURO_PRIMARY, FUTURO_GRAD, FUTURO_PRIMARY_LIGHT } from '@/lib/futuro-colors'
import { ProGate } from '@/components/ui/pro-gate'

const CHECKIN_KEY = 'sl_futuro_checkin'

const MOOD_EMOJIS = ['😔', '😟', '😐', '🙂', '😊', '😄', '🤩', '🚀']

export default function FuturoCheckinPage() {
  const router = useRouter()
  const accent = FUTURO_PRIMARY

  const { active, loading } = useObjectives()

  const [mood, setMood] = useState(5)
  const [note, setNote] = useState('')
  const [progressMap, setProgressMap] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const moodEmoji = MOOD_EMOJIS[Math.min(Math.floor((mood / 10) * MOOD_EMOJIS.length), MOOD_EMOJIS.length - 1)]
  const moodLabel = mood <= 2 ? '😔 Difícil' : mood >= 8 ? '🚀 Incrível' : '😊 Indo bem'

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      // Persist last checkin date
      localStorage.setItem(CHECKIN_KEY, new Date().toISOString())
      toast.success('Check-in salvo! 🎉')
      router.push('/futuro')
    } catch {
      toast.error('Erro ao salvar check-in')
    } finally {
      setSaving(false)
    }
  }, [router])

  const handleSkip = () => {
    router.push('/futuro')
  }

  return (
    <div className="lg:hidden min-h-screen bg-[var(--sl-bg)] flex flex-col pb-[calc(68px+16px)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-[14px] pb-4 border-b border-[var(--sl-border)]">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={17} className="text-[var(--sl-t2)]" />
        </button>
        <div className="flex-1">
          <h1 className="font-[Syne] text-[17px] font-bold text-[var(--sl-t1)]">
            📋 Check-in de Jornada
          </h1>
          <p className="text-[11px] text-[var(--sl-t3)] mt-[1px]">
            Como foi sua semana nesta missão?
          </p>
        </div>
        <span
          className="text-[10px] font-semibold px-2 py-[3px] rounded-[20px]"
          style={{ background: 'rgba(139,92,246,0.1)', color: FUTURO_PRIMARY_LIGHT }}
        >
          FREE — Mensal
        </span>
      </div>

      <ProGate module="futuro" feature="checkin" label="Check-in semanal é exclusivo PRO" preview>
      <div className="flex-1 px-5 pt-5 flex flex-col gap-4">

        {/* Mood Slider */}
        <div
          className="rounded-[16px] p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(236,72,153,0.06))',
            border: `1px solid ${accent}30`,
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.8px] mb-3" style={{ color: accent }}>
            Como você está se sentindo?
          </p>
          <div className="flex items-center justify-center mb-3">
            <span className="text-[48px]">{moodEmoji}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={mood}
            onChange={e => setMood(Number(e.target.value))}
            className="w-full h-1 rounded-full appearance-none cursor-pointer mb-2"
            style={{
              background: `linear-gradient(to right, ${accent} ${(mood / 10) * 100}%, var(--sl-s3) ${(mood / 10) * 100}%)`,
              accentColor: accent,
            }}
          />
          <div className="flex justify-between text-[10px] text-[var(--sl-t3)]">
            <span>😔 Difícil</span>
            <span className="font-[DM_Mono] font-medium" style={{ color: accent }}>{mood}/10</span>
            <span>🚀 Incrível</span>
          </div>
        </div>

        {/* Note */}
        <div
          className="rounded-[16px] p-4"
          style={{
            background: 'var(--sl-s1)',
            border: '1px solid var(--sl-border)',
          }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.8px] mb-2 text-[var(--sl-t2)]">
            Como foi sua semana com os objetivos?
          </p>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 300))}
            placeholder="Ex: Consegui poupar R$ 600 este mês, acima da meta..."
            rows={3}
            className="w-full bg-transparent text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none resize-none leading-[1.6]"
          />
          <p className="text-[10px] text-[var(--sl-t3)] text-right mt-1">{note.length}/300</p>
        </div>

        {/* Progress per objective */}
        {!loading && active.length > 0 && (
          <div
            className="rounded-[16px] overflow-hidden"
            style={{
              background: 'var(--sl-s1)',
              border: '1px solid var(--sl-border)',
            }}
          >
            <div className="px-4 py-3 border-b border-[var(--sl-border)]">
              <p className="text-[12px] font-bold text-[var(--sl-t1)]">
                Progresso das missões
              </p>
              <p className="text-[10px] text-[var(--sl-t3)] mt-[2px]">Atualização rápida de progresso</p>
            </div>
            {active.slice(0, 5).map((obj, idx) => (
              <div
                key={obj.id}
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: idx < Math.min(active.length, 5) - 1 ? '1px solid var(--sl-border)' : 'none' }}
              >
                <span className="text-[20px] shrink-0">{obj.icon ?? '🎯'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-[var(--sl-t1)] truncate">{obj.name}</p>
                  <p className="text-[10px] text-[var(--sl-t3)] mt-[1px]">Progresso atual: {obj.progress}%</p>
                </div>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="%"
                  value={progressMap[obj.id] ?? ''}
                  onChange={e => setProgressMap(prev => ({ ...prev, [obj.id]: e.target.value }))}
                  className="w-[52px] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[8px] px-2 py-1.5 text-[12px] font-[DM_Mono] text-[var(--sl-t1)] text-center outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* PRO upsell */}
        <div
          className="rounded-[14px] p-3 flex items-center gap-3"
          style={{
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <span className="text-[20px]">⭐</span>
          <div>
            <p className="text-[11px] font-semibold text-[#f59e0b]">PRO — Check-in Semanal</p>
            <p className="text-[10px] text-[var(--sl-t3)] mt-[1px]">Faça check-in toda semana e ganhe +20 XP/semana</p>
          </div>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="px-5 pt-3 pb-6 flex flex-col gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-[50px] rounded-[14px] text-[14px] font-semibold text-white disabled:opacity-60"
          style={{ background: FUTURO_GRAD }}
        >
          {saving ? 'Salvando...' : '✅ Salvar check-in de jornada'}
        </button>
        <button
          onClick={handleSkip}
          className="w-full h-[40px] rounded-[12px] text-[13px] font-medium text-[var(--sl-t3)]"
        >
          Pular por agora
        </button>
      </div>
      </ProGate>
    </div>
  )
}
