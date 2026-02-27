'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useShellStore } from '@/stores/shell-store'
import { useStudyTracks, useSaveSession, type SaveSessionData } from '@/hooks/use-mente'
import { PomodoroTimer } from '@/components/mente/PomodoroTimer'

export default function TimerPage() {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'

  const { tracks, loading } = useStudyTracks()
  const saveSession = useSaveSession()

  const handleSessionComplete = useCallback(async (data: Omit<SaveSessionData, 'session_notes'>) => {
    try {
      await saveSession({
        ...data,
        focus_minutes: data.focus_minutes,
        break_minutes: data.break_minutes,
      })
      toast.success(`Sessão salva! ${data.focus_minutes}m de foco, ${data.cycles_completed} ciclos.`)
    } catch {
      toast.error('Erro ao salvar sessão')
    }
  }, [saveSession])

  const activeTracks = tracks.filter(t => t.status === 'in_progress')

  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7 pb-16">

      {/* Topbar */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.push('/mente')}
          className="flex items-center gap-1.5 text-[13px] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
        >
          <ArrowLeft size={16} />
          Mente
        </button>
        <div className="flex-1" />
        <h1 className={cn(
          'font-[Syne] font-extrabold text-xl',
          isJornada ? 'text-sl-grad' : 'text-[var(--sl-t1)]'
        )}>
          ⏱ Timer Pomodoro
        </h1>
        <div className="flex-1" />
      </div>

      {/* Timer card */}
      <div className="max-w-[500px] mx-auto">
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 sl-fade-up">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-12 h-12 rounded-full border-2 border-[#a855f7] border-t-transparent animate-spin" />
            </div>
          ) : (
            <PomodoroTimer
              tracks={activeTracks}
              onSessionComplete={handleSessionComplete}
            />
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-3">Técnica Pomodoro</p>
          <div className="flex flex-col gap-2">
            {[
              { step: '1', text: 'Escolha uma tarefa ou trilha para estudar' },
              { step: '2', text: 'Trabalhe com foco total pelo tempo definido' },
              { step: '3', text: 'Faça uma pausa curta ao final de cada ciclo' },
              { step: '4', text: 'A cada 4 ciclos, faça uma pausa longa' },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: '#a855f7', color: 'white' }}>
                  <span className="text-[10px] font-bold">{step}</span>
                </div>
                <p className="text-[12px] text-[var(--sl-t2)]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
