'use client'

import { cn } from '@/lib/utils'

interface Skill {
  name: string
  level: 1 | 2 | 3 | 4 | 5
  label: string // e.g. "Expert", "Avançado", "Intermediário"
  color?: string
}

interface SkillBarsProps {
  skills: Skill[]
  accentColor?: string
  className?: string
}

export function SkillBars({ skills, accentColor = '#f43f5e', className }: SkillBarsProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {skills.map((skill, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[13px] font-semibold text-[var(--sl-t1)] w-[110px] shrink-0 truncate">
            {skill.name}
          </span>

          {/* Segmented bar — 5 blocks */}
          <div className="flex gap-[3px] flex-1">
            {Array.from({ length: 5 }).map((_, blockIdx) => (
              <div
                key={blockIdx}
                className="h-[8px] flex-1 rounded-[2px] transition-colors duration-300"
                style={{
                  background: blockIdx < skill.level
                    ? (skill.color || accentColor)
                    : 'var(--sl-s3)',
                }}
              />
            ))}
          </div>

          <span className="text-[11px] text-[var(--sl-t3)] w-[90px] text-right shrink-0">
            {skill.label}
          </span>
        </div>
      ))}
    </div>
  )
}
