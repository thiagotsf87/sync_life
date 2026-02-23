'use client'

import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES } from '@/lib/modules'
import { IconConquistas, IconConfig } from './icons'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface MobileMoreSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileMoreSheet({ open, onOpenChange }: MobileMoreSheetProps) {
  const router = useRouter()
  const mode = useShellStore((s) => s.mode)
  const theme = useShellStore((s) => s.theme)
  const setMode = useShellStore((s) => s.setMode)
  const setTheme = useShellStore((s) => s.setTheme)

  const navigate = (href: string) => {
    router.push(href)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-[var(--sl-s1)] border-t border-[var(--sl-border)] rounded-t-2xl pb-8">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-[var(--sl-t1)] font-[Syne] font-bold text-base">
            Mais opções
          </SheetTitle>
        </SheetHeader>

        {/* Navigation items */}
        <div className="flex flex-col gap-1 mb-4">
          <button
            onClick={() => navigate(MODULES.conquistas.basePath)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-[var(--sl-t2)]
                       hover:bg-[var(--sl-s2)] transition-colors"
          >
            <IconConquistas size={20} className="text-[#f59e0b]" />
            <span className="text-sm font-medium">Conquistas</span>
          </button>
          <button
            onClick={() => navigate(MODULES.configuracoes.basePath)}
            className="flex items-center gap-3 px-3 py-3 rounded-xl text-[var(--sl-t2)]
                       hover:bg-[var(--sl-s2)] transition-colors"
          >
            <IconConfig size={20} className="text-[var(--sl-t2)]" />
            <span className="text-sm font-medium">Configurações</span>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[var(--sl-border)] mb-4" />

        {/* Toggles */}
        <div className="flex flex-col gap-3">
          {/* Mode toggle */}
          <div className="flex items-center justify-between px-3">
            <span className="text-sm text-[var(--sl-t2)]">Modo</span>
            <div className="flex gap-1 bg-[var(--sl-s2)] rounded-full p-0.5">
              <button
                onClick={() => setMode('foco')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors',
                  mode === 'foco'
                    ? 'bg-[var(--sl-s1)] text-[var(--sl-t1)] shadow-sm'
                    : 'text-[var(--sl-t3)]',
                )}
              >
                🎯 Foco
              </button>
              <button
                onClick={() => setMode('jornada')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors',
                  mode === 'jornada'
                    ? 'bg-[#10b981]/15 text-[#10b981] shadow-sm'
                    : 'text-[var(--sl-t3)]',
                )}
              >
                🌱 Jornada
              </button>
            </div>
          </div>

          {/* Theme toggle */}
          <div className="flex items-center justify-between px-3">
            <span className="text-sm text-[var(--sl-t2)]">Tema</span>
            <div className="flex gap-1 bg-[var(--sl-s2)] rounded-full p-0.5">
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors',
                  theme === 'dark'
                    ? 'bg-[var(--sl-s1)] text-[var(--sl-t1)] shadow-sm'
                    : 'text-[var(--sl-t3)]',
                )}
              >
                🌙 Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors',
                  theme === 'light'
                    ? 'bg-[var(--sl-s1)] text-[var(--sl-t1)] shadow-sm'
                    : 'text-[var(--sl-t3)]',
                )}
              >
                ☀️ Light
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
