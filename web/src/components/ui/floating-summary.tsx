'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface FloatingSummaryProps {
  children: React.ReactNode
  sentinelRef: React.RefObject<HTMLDivElement | null>
  className?: string
}

export function FloatingSummary({ children, sentinelRef, className }: FloatingSummaryProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [sentinelRef])

  return (
    <div
      className={cn(
        'sticky top-0 z-[20] backdrop-blur-[12px] bg-[var(--sl-s1)]/90 border-b border-[var(--sl-border)] px-5 py-3 rounded-b-xl',
        'transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  )
}
