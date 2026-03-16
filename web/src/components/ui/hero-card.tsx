'use client'

import { cn } from '@/lib/utils'

interface HeroCardProps {
  children: React.ReactNode
  gradientColors?: [string, string]
  className?: string
}

export function HeroCard({
  children,
  gradientColors = ['#10b981', '#0055ff'],
  className,
}: HeroCardProps) {
  return (
    <div
      className={cn(
        'relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 overflow-hidden',
        'sl-fade-up transition-colors hover:border-[var(--sl-border-h)]',
        className
      )}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={{
          background: `linear-gradient(90deg, ${gradientColors[0]}, ${gradientColors[1]})`,
        }}
      />
      {children}
    </div>
  )
}
