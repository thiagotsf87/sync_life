'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CARREIRA_PRIMARY, CARREIRA_GRAD } from '@/lib/carreira-colors'
import { CARREIRA_RPG_LEVELS } from '@/lib/carreira-xp-mock'
import { type SkillCategory, type SaveSkillData } from '@/hooks/use-carreira'

interface CarreiraAddSkillModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: SaveSkillData) => Promise<void>
}

const CATEGORIES: { key: SkillCategory; label: string }[] = [
  { key: 'hard_skill', label: 'Hard Skill' },
  { key: 'soft_skill', label: 'Soft Skill' },
  { key: 'language', label: 'Idioma' },
  { key: 'certification', label: 'Certificação' },
]

export function CarreiraAddSkillModal({ open, onClose, onSave }: CarreiraAddSkillModalProps) {
  const accent = CARREIRA_PRIMARY
  const grad = CARREIRA_GRAD

  const [name, setName] = useState('')
  const [category, setCategory] = useState<SkillCategory>('hard_skill')
  const [level, setLevel] = useState(3)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const levelLabels = CARREIRA_RPG_LEVELS

  async function handleSave() {
    if (!name.trim()) return
    setSaving(true)
    try {
      await onSave({ name: name.trim(), category, proficiency_level: level, notes: notes.trim() || null })
      onClose()
      setName('')
      setCategory('hard_skill')
      setLevel(3)
      setNotes('')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end justify-center" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-[var(--sl-bg)] w-full max-h-[92vh] rounded-t-3xl overflow-y-auto animate-[modalUp_0.3s_ease]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-[14px] pb-[10px]">
          <button onClick={onClose} className="w-9 h-9 rounded-[10px] bg-[var(--sl-s1)] border border-[var(--sl-border)] flex items-center justify-center">
            <ChevronLeft size={16} className="text-[var(--sl-t2)]" />
          </button>
          <div className="text-center">
            <p className="text-[12px] font-medium" style={{ color: '#c4b5fd' }}>
              ✦ Novo Poder
            </p>
            <p className="font-[Syne] text-[16px] font-bold text-[var(--sl-t1)]">Nova Habilidade</p>
          </div>
          <button onClick={onClose} className="text-[13px] text-[var(--sl-t3)]">Cancelar</button>
        </div>

        {/* XP banner */}
        <div className="mx-4 mb-3 flex items-center gap-2 px-[13px] py-2 rounded-full border border-[rgba(139,92,246,0.2)]"
          style={{ background: 'rgba(139,92,246,0.08)' }}>
          <span className="text-[14px]">⚡</span>
          <span className="text-[12px] text-[#c4b5fd] font-semibold">
            Adicionar habilidade vale <strong className="text-[var(--sl-t1)]">+10 XP</strong>
          </span>
        </div>

        <div className="px-4 pb-4">
          {/* Name */}
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[6px] block"
            style={{ color: '#c4b5fd' }}>
            Nome do poder
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Docker"
            className="w-full px-[14px] py-3 bg-[var(--sl-s1)] border rounded-[10px] text-[14px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none mb-[14px]"
            style={{ borderColor: 'rgba(139,92,246,0.3)' }}
          />

          {/* Category */}
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[6px] block"
            style={{ color: '#c4b5fd' }}>
            Tipo de habilidade
          </label>
          <div className="flex gap-[6px] flex-wrap mb-[14px]">
            {CATEGORIES.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="px-[14px] py-2 rounded-full text-[12px] font-medium"
                style={{
                  background: category === c.key ? '#8b5cf6' : 'var(--sl-s1)',
                  color: category === c.key ? '#fff' : 'var(--sl-t2)',
                  border: category === c.key ? 'none' : '1px solid var(--sl-border)',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Level */}
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[6px] block"
            style={{ color: '#c4b5fd' }}>
            Nível de maestria
          </label>
          <div className="flex gap-[6px] mb-[6px]">
            {[1, 2, 3, 4, 5].map(l => (
              <button
                key={l}
                onClick={() => setLevel(l)}
                className="flex-1 py-[10px] rounded-[10px] text-center text-[12px]"
                style={{
                  background: level === l ? '#8b5cf6' : 'var(--sl-s1)',
                  color: level === l ? '#fff' : 'var(--sl-t2)',
                  border: level === l ? '1px solid #8b5cf6' : '1px solid var(--sl-border)',
                  fontWeight: level === l ? 600 : 400,
                }}
              >
                {l}<br />
                <span className="text-[10px]">{levelLabels[l]}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[#c4b5fd] font-semibold mb-[14px]">
            ⚡ Evoluir para Mestre = +15 XP · Lenda = +30 XP
          </p>

          {/* Link Mente */}
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[6px] block"
            style={{ color: '#c4b5fd' }}>
            Vincular a trilha (Mente)
          </label>
          <div
            className="flex items-center gap-[10px] px-[14px] py-[14px] rounded-[10px] border mb-[14px]"
            style={{
              background: 'linear-gradient(135deg, var(--sl-s1), rgba(139,92,246,0.04))',
              borderColor: 'rgba(139,92,246,0.2)',
            }}
          >
            <span className="text-[16px]">🧠</span>
            <div className="flex-1">
              <p className="text-[13px] text-[var(--sl-t1)]">Vincular trilha</p>
              <p className="text-[11px]" style={{ color: '#c4b5fd' }}>
                Trilha ativa = +5 XP bônus ao evoluir
              </p>
            </div>
            <ChevronRight size={14} style={{ color: '#c4b5fd' }} />
          </div>

          {/* Notes */}
          <label className="text-[10px] font-bold uppercase tracking-[0.5px] mb-[6px] block"
            style={{ color: '#c4b5fd' }}>
            Notas (opcional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Aprendendo Docker para deploy..."
            rows={2}
            className="w-full px-[14px] py-3 bg-[var(--sl-s1)] border rounded-[10px] text-[14px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none resize-none mb-4"
            style={{ borderColor: 'var(--sl-border)' }}
          />
        </div>

        {/* Save button */}
        <div className="px-4 pb-8">
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full h-[50px] rounded-[14px] text-[15px] font-semibold text-white disabled:opacity-50"
            style={{ background: grad }}
          >
            Adicionar ao Arsenal · +10 XP
          </button>
        </div>
      </div>
    </div>
  )
}
