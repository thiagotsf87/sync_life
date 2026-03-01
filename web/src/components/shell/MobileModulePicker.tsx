'use client'

import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import { MODULES } from '@/lib/modules'
import { isDarkTheme } from '@/types/shell'
import { MODULE_ICONS, SyncLifeBrand } from './icons'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { ModuleId } from '@/types/shell'

// Módulos exibidos no grid 3×3 (excluindo conquistas e configuracoes que ficam abaixo)
const MODULE_GRID: ModuleId[] = [
  'panorama', 'financas', 'futuro',
  'tempo',    'corpo',    'mente',
  'patrimonio', 'carreira', 'experiencias',
]

export function MobileModulePicker() {
  const router = useRouter()
  const activeModule = useShellStore((s) => s.activeModule)
  const open = useShellStore((s) => s.modulePickerOpen)
  const setOpen = useShellStore((s) => s.setModulePickerOpen)
  const mode = useShellStore((s) => s.mode)
  const setMode = useShellStore((s) => s.setMode)
  const resolvedTheme = useShellStore((s) => s.resolvedTheme)

  const navigate = (href: string) => {
    router.push(href)
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="w-[85vw] max-w-[320px] p-0 bg-[var(--sl-s1)] border-r border-[var(--sl-border)] flex flex-col gap-0"
      >
        {/* ── Cabeçalho ── */}
        <SheetHeader className="px-4 pt-5 pb-4 border-b border-[var(--sl-border)] shrink-0">
          <SheetTitle asChild>
            <SyncLifeBrand size="sm" animated={false} />
          </SheetTitle>
        </SheetHeader>

        {/* ── Conteúdo scrollável ── */}
        <div className="flex-1 overflow-y-auto">

          {/* Grid de módulos */}
          <div className="px-4 pt-4 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-3">
              Módulos
            </p>
            <div className="grid grid-cols-3 gap-2">
              {MODULE_GRID.map((moduleId) => {
                const mod = MODULES[moduleId]
                const Icon = MODULE_ICONS[moduleId]
                const isActive = activeModule === moduleId

                return (
                  <button
                    key={moduleId}
                    onClick={() => navigate(mod.basePath)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-colors',
                      isActive
                        ? 'bg-[var(--sl-s2)]'
                        : 'border-transparent hover:bg-[var(--sl-s2)]',
                    )}
                    style={isActive ? { borderColor: `${mod.color}40` } : undefined}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${mod.color}18` }}
                    >
                      <Icon size={20} style={{ color: mod.color }} />
                    </div>
                    <span className="text-[11px] font-medium text-[var(--sl-t2)] leading-tight text-center">
                      {mod.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Divisor */}
          <div className="mx-4 my-3 h-px bg-[var(--sl-border)]" />

          {/* Links rápidos: Conquistas + Configurações */}
          <div className="px-4 pb-1">
            {(['conquistas', 'configuracoes'] as ModuleId[]).map((moduleId) => {
              const mod = MODULES[moduleId]
              const Icon = MODULE_ICONS[moduleId]
              return (
                <button
                  key={moduleId}
                  onClick={() => navigate(mod.basePath)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                             text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${mod.color}18` }}
                  >
                    <Icon size={17} style={{ color: mod.color }} />
                  </div>
                  <span className="text-[13px] font-medium">{mod.label}</span>
                </button>
              )
            })}
          </div>

          {/* Divisor */}
          <div className="mx-4 my-3 h-px bg-[var(--sl-border)]" />

          {/* Preferências */}
          <div className="px-4 pb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--sl-t3)] mb-3">
              Preferências
            </p>

            {/* Toggle Foco / Jornada */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] text-[var(--sl-t2)]">Modo</span>
              <div className="flex gap-0.5 bg-[var(--sl-s2)] rounded-full p-0.5">
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
                    mode === 'jornada' ? 'text-[var(--sl-accent)]' : 'text-[var(--sl-t3)]',
                  )}
                  style={
                    mode === 'jornada'
                      ? { background: 'rgba(var(--sl-accent-rgb), 0.15)' }
                      : undefined
                  }
                >
                  🌱 Jornada
                </button>
              </div>
            </div>

            {/* Atalho de tema */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--sl-t2)]">Tema</span>
              <button
                onClick={() => navigate('/configuracoes/aparencia')}
                className="px-3 py-1.5 rounded-full text-[11px] font-medium
                           bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:text-[var(--sl-t1)] transition-colors"
              >
                {isDarkTheme(resolvedTheme) ? '🌙' : '☀️'} Personalizar
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
