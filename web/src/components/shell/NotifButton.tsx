'use client'

import { IconBell } from './icons'

interface NotifButtonProps {
  unreadCount?: number
}

export function NotifButton({ unreadCount = 0 }: NotifButtonProps) {
  return (
    <button
      className="sl-notif-btn relative flex h-[34px] w-[34px] items-center justify-center rounded-xl
                 text-[var(--sl-t2)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)]
                 transition-colors"
    >
      <IconBell size={18} />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 h-[6px] w-[6px] rounded-full bg-[#f43f5e]" />
      )}
    </button>
  )
}
