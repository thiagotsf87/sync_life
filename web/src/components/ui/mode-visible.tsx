import { cn } from '@/lib/utils'

interface ModeVisibleProps {
  mode: 'foco' | 'jornada'
  children: React.ReactNode
  as?: keyof React.JSX.IntrinsicElements
  className?: string
}

export function ModeVisible({ mode, children, as: Tag = 'div', className = '' }: ModeVisibleProps) {
  const visibilityClass = mode === 'jornada' ? 'jornada-only' : 'foco-only'
  return <Tag className={cn(visibilityClass, className)}>{children}</Tag>
}
