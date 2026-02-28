'use client'

import { Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Skill, SkillCategory } from '@/hooks/use-carreira'
import { SKILL_CATEGORY_LABELS, SKILL_LEVEL_LABELS } from '@/hooks/use-carreira'

interface SkillCardProps {
  skill: Skill
  onEdit?: (skill: Skill) => void
  onDelete?: (id: string) => Promise<void>
}

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  hard_skill: '#0055ff',
  soft_skill: '#10b981',
  language: '#f59e0b',
  certification: '#a855f7',
}

export function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
  const color = CATEGORY_COLORS[skill.category]

  return (
    <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-xl p-4 hover:border-[var(--sl-border-h)] transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[var(--sl-t1)] leading-tight">{skill.name}</p>
          <span
            className="inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full mt-0.5"
            style={{ color, background: color + '20' }}
          >
            {SKILL_CATEGORY_LABELS[skill.category]}
          </span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit && (
            <button onClick={() => onEdit(skill)} className="p-1.5 rounded-lg hover:bg-[var(--sl-s3)] transition-colors">
              <Edit2 size={12} className="text-[var(--sl-t3)]" />
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(skill.id)} className="p-1.5 rounded-lg hover:bg-[rgba(244,63,94,0.1)] transition-colors">
              <Trash2 size={12} className="text-[var(--sl-t3)]" />
            </button>
          )}
        </div>
      </div>

      {/* Proficiency dots */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full transition-all"
              style={{ background: i < skill.proficiency_level ? color : 'var(--sl-s3)' }}
            />
          ))}
        </div>
        <span className="text-[10px] text-[var(--sl-t3)]">
          {SKILL_LEVEL_LABELS[skill.proficiency_level] ?? 'N/A'}
        </span>
      </div>

      {skill.notes && (
        <p className="text-[11px] text-[var(--sl-t3)] mt-1.5 line-clamp-1 italic">{skill.notes}</p>
      )}
      {skill.linked_track_ids && skill.linked_track_ids.length > 0 && (
        <p className="text-[10px] text-[var(--sl-t3)] mt-1">
          📚 {skill.linked_track_ids.length} trilha{skill.linked_track_ids.length !== 1 ? 's' : ''} vinculada{skill.linked_track_ids.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
