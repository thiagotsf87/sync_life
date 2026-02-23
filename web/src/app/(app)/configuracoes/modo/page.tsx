'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { createClient } from '@/lib/supabase/client'
import { Check, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModeType = 'foco' | 'jornada'

const MODE_FEATURES = [
  { label: 'Dashboard', foco: 'Só números', jornada: 'Score + frases' },
  { label: 'Life Sync Score', foco: 'Oculto', jornada: 'Em destaque' },
  { label: 'Notificações', foco: 'Só críticas', jornada: 'Motivacionais também' },
  { label: 'Review semanal', foco: 'Desativado', jornada: 'Todo domingo' },
  { label: 'Animações', foco: 'Nenhuma', jornada: 'Micro-animações' },
  { label: 'Conquistas', foco: 'Badge discreto', jornada: 'Tela celebrativa' },
]

export default function ModoDeUsoPage() {
  const shellMode = useShellStore((s) => s.mode)
  const setShellMode = useShellStore((s) => s.setMode)
  const [selectedMode, setSelectedMode] = useState<ModeType>(shellMode)
  const [toastMsg, setToastMsg] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  useEffect(() => {
    setSelectedMode(shellMode)
  }, [shellMode])

  const handleSelect = async (mode: ModeType) => {
    if (mode === selectedMode) return
    setSelectedMode(mode)
    setShellMode(mode)

    // Persist to Supabase
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from('profiles')
          .update({ mode: mode === 'jornada' ? 'journey' : 'focus' })
          .eq('id', user.id)
      }
    } catch {
      // Silent fail — local state already updated
    }

    // Toast
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToastMsg(
      mode === 'foco'
        ? '🎯 Modo Foco ativado. Interface atualizada para você.'
        : '🌱 Modo Jornada ativado. Vamos juntos nessa jornada!',
    )
    setShowToast(true)
    toastTimer.current = setTimeout(() => setShowToast(false), 3500)
  }

  return (
    <div className="max-w-[680px]">
      <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)] mb-1">Modo de Uso</h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-6">
        Escolha como o SyncLife se apresenta para você. O modo pode ser alterado a qualquer momento.
      </p>

      {/* Mode cards */}
      <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-4">
          Selecione seu modo
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
          {/* Foco card */}
          <button
            onClick={() => handleSelect('foco')}
            className={cn(
              'relative text-left border-2 rounded-2xl p-5 transition-all cursor-pointer overflow-hidden',
              selectedMode === 'foco'
                ? 'border-[#10b981] bg-[rgba(16,185,129,0.05)]'
                : 'border-[var(--sl-border)] bg-[var(--sl-s3)] hover:border-[var(--sl-border-h)]',
            )}
          >
            {/* Check badge */}
            <div
              className={cn(
                'absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                selectedMode === 'foco'
                  ? 'border-[#10b981] bg-[#10b981]'
                  : 'border-[var(--sl-border-h)]',
              )}
            >
              {selectedMode === 'foco' && <Check size={10} className="text-white" />}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.12)] flex items-center justify-center text-xl">
                🎯
              </div>
            </div>
            <p className="font-[Syne] font-extrabold text-[15px] text-[var(--sl-t1)] mb-1.5">
              Modo Foco
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] leading-snug mb-3">
              Interface limpa e objetiva. Dados diretos, sem distrações.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Sem animações', 'Dados em destaque', 'Sidebar compacta'].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(16,185,129,0.10)] text-[#10b981]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>

          {/* Jornada card */}
          <button
            onClick={() => handleSelect('jornada')}
            className={cn(
              'relative text-left border-2 rounded-2xl p-5 transition-all cursor-pointer overflow-hidden',
              selectedMode === 'jornada'
                ? 'border-[#0055ff] bg-[rgba(0,85,255,0.05)]'
                : 'border-[var(--sl-border)] bg-[var(--sl-s3)] hover:border-[var(--sl-border-h)]',
            )}
          >
            {/* Check badge */}
            <div
              className={cn(
                'absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                selectedMode === 'jornada'
                  ? 'border-[#0055ff] bg-[#0055ff]'
                  : 'border-[var(--sl-border-h)]',
              )}
            >
              {selectedMode === 'jornada' && <Check size={10} className="text-white" />}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(0,85,255,0.12)] flex items-center justify-center text-xl">
                🌱
              </div>
            </div>
            <p className="font-[Syne] font-extrabold text-[15px] text-[var(--sl-t1)] mb-1.5">
              Modo Jornada
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] leading-snug mb-3">
              Interface motivacional. Celebra progresso e te acompanha como um coach.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {['Life Sync Score', 'Conquistas', 'Frases motivacionais'].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[rgba(0,85,255,0.10)] text-[#6e9fff]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </button>
        </div>

        {/* Toast */}
        <div
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[rgba(16,185,129,0.10)] border border-[rgba(16,185,129,0.2)] text-[#10b981] text-[13px] font-medium transition-all duration-300"
          style={{
            opacity: showToast ? 1 : 0,
            transform: showToast ? 'translateY(0)' : 'translateY(4px)',
            pointerEvents: showToast ? 'auto' : 'none',
          }}
        >
          <Check size={14} />
          {toastMsg}
        </div>
      </div>

      {/* Comparison table */}
      <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-4">
          Comparativo dos modos
        </p>
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[var(--sl-border)]">
              <th className="text-left py-2 text-[var(--sl-t3)] font-semibold pr-4">Elemento</th>
              <th className="text-center py-2 text-[#10b981] font-semibold w-1/3">🎯 Foco</th>
              <th className="text-center py-2 text-[#6e9fff] font-semibold w-1/3">🌱 Jornada</th>
            </tr>
          </thead>
          <tbody>
            {MODE_FEATURES.map(({ label, foco, jornada }, i) => (
              <tr
                key={label}
                className={i < MODE_FEATURES.length - 1 ? 'border-b border-[var(--sl-border)]' : ''}
              >
                <td className="py-2.5 text-[var(--sl-t2)] font-medium pr-4">{label}</td>
                <td className="py-2.5 text-center text-[var(--sl-t3)]">{foco}</td>
                <td className="py-2.5 text-center text-[var(--sl-t3)]">{jornada}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reconfigure card */}
      <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-5 transition-colors hover:border-[var(--sl-border-h)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(16,185,129,0.10)] flex items-center justify-center shrink-0">
            <RotateCcw size={18} className="text-[#10b981]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[var(--sl-t1)]">Reconfigurar SyncLife</p>
            <p className="text-[11px] text-[var(--sl-t3)]">
              Refaça o setup inicial. Seus dados serão mantidos.
            </p>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="shrink-0 px-3 py-1.5 rounded-[9px] border border-[var(--sl-border)] bg-transparent text-[12px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s3)] transition-colors"
          >
            Reconfigurar
          </button>
        </div>
      </div>

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-[Syne] font-bold text-base text-[var(--sl-t1)] mb-2">
              Reconfigurar SyncLife?
            </h3>
            <p className="text-[13px] text-[var(--sl-t2)] mb-5 leading-relaxed">
              Refazer o onboarding irá guiar você pelo setup inicial novamente. Seus dados atuais
              (transações, metas, eventos) serão mantidos.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 rounded-[9px] border border-[var(--sl-border)] bg-transparent text-[13px] font-semibold text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => router.push('/onboarding?reconfigure=true')}
                className="flex-1 px-4 py-2 rounded-[9px] text-white text-[13px] font-bold transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
              >
                Reconfigurar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
