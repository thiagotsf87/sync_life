'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Check, CheckCheck, Bell } from 'lucide-react'
import { useNotifications, type AppNotification } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

const MODULE_COLORS: Record<string, string> = {
  futuro:       '#8B7BD4',
  corpo:        '#D97534',
  experiencias: '#C76795',
  mente:        '#D9962E',
  patrimonio:   '#4F88D4',
  carreira:     '#DB6478',
  financas:     '#0F766E',
}

const TYPE_ICON: Record<string, string> = {
  deadline_risk:       '⚠️',
  goal_stale:          '💤',
  followup_due:        '🏥',
  objective_completed: '🎉',
  trip_upcoming:       '✈️',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}sem`
}

function NotifItem({
  notif,
  onRead,
  onDismiss,
  onNavigate,
}: {
  notif: AppNotification
  onRead: (id: string) => void
  onDismiss: (id: string) => void
  onNavigate: (url: string) => void
}) {
  const accent = MODULE_COLORS[notif.module ?? ''] ?? '#0F766E'
  const icon = TYPE_ICON[notif.type] ?? '🔔'
  const isUnread = !notif.read_at

  return (
    <div
      className={cn(
        'group relative flex gap-3 px-4 py-3 border-b border-[var(--sl-border)]',
        'transition-colors cursor-pointer',
        isUnread ? 'bg-[var(--sl-s2)]' : 'hover:bg-[var(--sl-s2)]/50'
      )}
      onClick={() => {
        if (isUnread) onRead(notif.id)
        if (notif.action_url) onNavigate(notif.action_url)
      }}
    >
      {/* Barra de acento esquerda para não lidas */}
      {isUnread && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
          style={{ background: accent }}
        />
      )}

      {/* Ícone */}
      <div className="shrink-0 text-lg leading-none mt-0.5">{icon}</div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] font-semibold leading-snug',
          isUnread ? 'text-[var(--sl-t1)]' : 'text-[var(--sl-t2)]'
        )}>
          {notif.title}
        </p>
        <p className="text-[12px] text-[var(--sl-t2)] leading-relaxed mt-0.5 line-clamp-2">
          {notif.body}
        </p>
        <p className="text-[11px] text-[var(--sl-t3)] mt-1">{timeAgo(notif.created_at)}</p>
      </div>

      {/* Botão remover */}
      <button
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity
                   h-6 w-6 flex items-center justify-center rounded-lg
                   text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s3)]"
        onClick={(e) => {
          e.stopPropagation()
          onDismiss(notif.id)
        }}
      >
        <X size={12} />
      </button>
    </div>
  )
}

export function NotifButton() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, dismiss } = useNotifications()

  // Fecha ao clicar fora
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  function handleNavigate(url: string) {
    setOpen(false)
    router.push(url)
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Botão sino */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative flex h-[34px] w-[34px] items-center justify-center rounded-xl transition-colors',
          open
            ? 'bg-[var(--sl-s2)] text-[var(--sl-t1)]'
            : 'text-[var(--sl-t2)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)]'
        )}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1
                           flex items-center justify-center rounded-full
                           bg-[#DB6478] text-white text-[10px] font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel dropdown */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50
                        w-[340px] max-h-[480px]
                        bg-[var(--sl-s1)] border border-[var(--sl-border)]
                        rounded-2xl shadow-xl overflow-hidden
                        flex flex-col">

          {/* Cabeçalho */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--sl-border)] shrink-0">
            <Bell size={14} className="text-[var(--sl-t2)]" />
            <span className="font-[Space_Grotesk] font-bold text-[14px] text-[var(--sl-t1)] flex-1">
              Notificações
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[11px] text-[var(--sl-t3)] hover:text-[#0F766E] transition-colors"
              >
                <CheckCheck size={12} />
                Marcar todas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-5 h-5 border-2 border-[var(--sl-border)] border-t-[#0F766E] rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <Check size={28} className="text-[var(--sl-t3)]" />
                <p className="text-[13px] text-[var(--sl-t3)]">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotifItem
                  key={n.id}
                  notif={n}
                  onRead={markAsRead}
                  onDismiss={dismiss}
                  onNavigate={handleNavigate}
                />
              ))
            )}
          </div>

          {/* Rodapé */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-[var(--sl-border)] shrink-0">
              <p className="text-[11px] text-[var(--sl-t3)] text-center">
                {unreadCount > 0
                  ? `${unreadCount} não lida${unreadCount !== 1 ? 's' : ''}`
                  : 'Tudo em dia ✓'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
