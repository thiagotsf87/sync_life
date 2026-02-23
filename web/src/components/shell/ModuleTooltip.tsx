'use client'

interface ModuleTooltipProps {
  text: string
  visible: boolean
  position: { top: number }
}

export function ModuleTooltip({ text, visible, position }: ModuleTooltipProps) {
  return (
    <div
      className="fixed z-[100] pointer-events-none px-3 py-1.5 rounded-lg text-xs font-medium
                 bg-[var(--sl-s2)] text-[var(--sl-t1)] border border-[var(--sl-border)]
                 shadow-lg transition-opacity duration-[120ms]"
      style={{
        left: 68,
        top: position.top,
        opacity: visible ? 1 : 0,
      }}
    >
      {text}
    </div>
  )
}
