'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { Palette } from 'lucide-react'
import { cn } from '@/lib/utils'

const THEME_LABELS: Record<string, string> = {
  'navy-deep': 'Navy Deep',
  'midnight':  'Midnight',
  'charcoal':  'Charcoal',
  'cream':     'Cream',
  'system':    'Sistema',
}

export function ThemePill() {
  const theme = useShellStore((s) => s.theme)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const label = mounted ? (THEME_LABELS[theme] || 'Sistema') : 'Sistema'

  return (
    <button
      onClick={() => router.push('/configuracoes/aparencia')}
      className={cn(
        'sl-pill flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium',
        'border transition-colors duration-200',
        'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)]',
        'hover:border-[var(--sl-border-h)]',
      )}
    >
      <Palette size={14} />
      <span>{label}</span>
    </button>
  )
}
