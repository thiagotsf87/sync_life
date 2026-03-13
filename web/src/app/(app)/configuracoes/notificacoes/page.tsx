'use client'

import { useState, useEffect } from 'react'
import { ToggleSwitch } from '@/components/settings/toggle-switch'

const NOTIF_KEY = 'sl_notif_settings'

interface NotifState {
  push: boolean
  email: boolean
  budget75: boolean
  budgetExceeded: boolean
  financialTomorrow: boolean
  negativeProjection: boolean
  goalAtRisk: boolean
  goalComplete: boolean
  dailyReminder: boolean
  dailyReminderTime: string
  weeklyReview: boolean
  achievements: boolean
  inactivity: boolean
}

type NotifKey = keyof NotifState

function NotifRow({
  icon,
  label,
  description,
  checked,
  onChange,
  extra,
  noBorder,
  modeBadge,
  disabled,
}: {
  icon: string
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
  extra?: React.ReactNode
  noBorder?: boolean
  modeBadge?: 'foco' | 'jornada' | 'both'
  disabled?: boolean
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 py-3 ${noBorder ? '' : 'border-b border-[var(--sl-border)]'}`}
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="w-8 h-8 rounded-[9px] bg-[var(--sl-s3)] flex items-center justify-center text-base shrink-0 mt-0.5">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[var(--sl-t1)]">
            {label}
            {modeBadge === 'foco' && (
              <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[rgba(16,185,129,0.1)] text-[#10b981] align-middle">
                Foco
              </span>
            )}
            {modeBadge === 'jornada' && (
              <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[rgba(0,85,255,0.1)] text-[#6e9fff] align-middle">
                Jornada
              </span>
            )}
            {modeBadge === 'both' && (
              <>
                <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[rgba(16,185,129,0.1)] text-[#10b981] align-middle">
                  Foco
                </span>
                <span className="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[rgba(0,85,255,0.1)] text-[#6e9fff] align-middle">
                  Jornada
                </span>
              </>
            )}
          </p>
          <p className="text-[11px] text-[var(--sl-t3)] mt-0.5 leading-snug">{description}</p>
          {extra}
        </div>
      </div>
      <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  )
}

const DEFAULT_NOTIF: NotifState = {
  push: false,
  email: false,
  budget75: true,
  budgetExceeded: true,
  financialTomorrow: true,
  negativeProjection: true,
  goalAtRisk: true,
  goalComplete: true,
  dailyReminder: true,
  dailyReminderTime: '21:00',
  weeklyReview: true,
  achievements: true,
  inactivity: false,
}

export default function NotificacoesPage() {
  const [notif, setNotif] = useState<NotifState>(DEFAULT_NOTIF)

  // RN-FUT-51: persistir configurações de notificação no localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NOTIF_KEY)
      if (saved) setNotif({ ...DEFAULT_NOTIF, ...JSON.parse(saved) })
    } catch (err) { console.warn('[Settings] Falha ao ler notificações do localStorage:', err) }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(NOTIF_KEY, JSON.stringify(notif))
    } catch (err) { console.warn('[Settings] Falha ao salvar notificações no localStorage:', err) }
  }, [notif])

  const toggle = async (key: NotifKey) => {
    if (key === 'dailyReminderTime') return

    if (key === 'push' && !notif.push) {
      // Requesting push permission when enabling
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return // user denied — don't toggle on
      }
    }

    setNotif((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="max-w-[680px]">
      <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)] mb-1">Notificações</h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-6">
        Configure como e quando o SyncLife entra em contato com você.
      </p>

      {/* Canal de entrega */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-4">
          Canal de entrega
        </p>
        <NotifRow
          icon="🔔"
          label="Notificações push"
          description="Alertas direto no navegador (requer permissão)"
          checked={notif.push}
          onChange={() => toggle('push')}
        />
        <NotifRow
          icon="📧"
          label="E-mail"
          description="Resumos semanais e alertas importantes por e-mail"
          checked={notif.email}
          onChange={() => toggle('email')}
          noBorder
        />
      </div>

      {/* Alertas financeiros */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-4">
          Alertas financeiros
        </p>
        <NotifRow
          icon="💰"
          label="Orçamento atingindo 75%"
          description="Avise quando um envelope estiver próximo do limite"
          checked={notif.budget75}
          onChange={() => toggle('budget75')}
          modeBadge="both"
        />
        <NotifRow
          icon="🚨"
          label="Orçamento excedido"
          description="Notifique quando um envelope ultrapassar o limite"
          checked={notif.budgetExceeded}
          onChange={() => toggle('budgetExceeded')}
          modeBadge="both"
        />
        <NotifRow
          icon="📅"
          label="Evento financeiro amanhã"
          description="Lembrete de vencimentos e recorrências no dia seguinte"
          checked={notif.financialTomorrow}
          onChange={() => toggle('financialTomorrow')}
          modeBadge="both"
        />
        <NotifRow
          icon="📉"
          label="Saldo projetado negativo"
          description="Alerta quando a projeção mensal ficar no vermelho"
          checked={notif.negativeProjection}
          onChange={() => toggle('negativeProjection')}
          modeBadge="both"
          noBorder
        />
      </div>

      {/* Metas e progresso */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-4">
          Metas e progresso
        </p>
        <NotifRow
          icon="⚠️"
          label="Meta em risco"
          description="Alerta quando uma meta estiver com progresso abaixo do esperado"
          checked={notif.goalAtRisk}
          onChange={() => toggle('goalAtRisk')}
        />
        <NotifRow
          icon="🎉"
          label="Meta concluída"
          description="Comemore quando atingir 100% de uma meta"
          checked={notif.goalComplete}
          onChange={() => toggle('goalComplete')}
          noBorder
        />
      </div>

      {/* Jornada exclusivos */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 transition-colors hover:border-[var(--sl-border-h)]">
        <div className="flex items-center gap-2 mb-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)]">
            Exclusivos do Modo Jornada
          </p>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[rgba(0,85,255,0.1)] text-[#6e9fff]">
            Jornada
          </span>
        </div>

        <NotifRow
          icon="🔥"
          label="Lembrete diário de registro"
          description="Lembrete para registrar seus gastos no horário escolhido"
          checked={notif.dailyReminder}
          onChange={() => toggle('dailyReminder')}
          disabled={false}
          extra={
            notif.dailyReminder ? (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-[var(--sl-t3)]">Horário:</span>
                <input
                  type="time"
                  value={notif.dailyReminderTime}
                  onChange={(e) => setNotif((p) => ({ ...p, dailyReminderTime: e.target.value }))}
                  className="bg-[var(--sl-s3)] border border-[var(--sl-border)] rounded-[8px] px-2.5 py-1 font-[DM_Mono] text-[12px] text-[var(--sl-t1)] outline-none w-[90px]"
                />
              </div>
            ) : null
          }
        />
        <NotifRow
          icon="📊"
          label="Review semanal (domingo)"
          description="Resumo da semana com comparações e destaques todo domingo"
          checked={notif.weeklyReview}
          onChange={() => toggle('weeklyReview')}
          disabled={false}
        />
        <NotifRow
          icon="🏆"
          label="Conquistas desbloqueadas"
          description="Notifique quando uma nova conquista for desbloqueada"
          checked={notif.achievements}
          onChange={() => toggle('achievements')}
          disabled={false}
        />
        <NotifRow
          icon="😴"
          label="Inatividade de 7 dias"
          description="Lembrete amigável quando você ficar 7 dias sem registrar"
          checked={notif.inactivity}
          onChange={() => toggle('inactivity')}
          disabled={false}
          noBorder
        />
      </div>
    </div>
  )
}
