'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const PRESET_ICONS = [
  '🏛️', '💼', '💰', '💳', '🏦', '📊', '📈', '🍔', '🍕', '☕', '🛒', '🏠',
  '⚡', '🚗', '✈️', '🚌', '💊', '🏋️', '🎮', '🎬', '🎵', '📚', '🎁', '🏖️',
  '👔', '🛍️', '✂️', '🔧', '📱', '🐾', '📦', '🧹',
]

const PRESET_COLORS = [
  '#ef4444', '#D97534', '#D9962E', '#D9962E',
  '#84cc16', '#0F766E', '#0F766E', '#14b8a6',
  '#3CA0B5', '#4F88D4', '#8B7BD4', '#C76795',
]

interface InlineCategoryFormProps {
  defaultType?: 'income' | 'expense'
  defaultName?: string
  onCreated: (category: { id: string; name: string; icon: string; color: string; type: 'income' | 'expense' }) => void
  onCancel: () => void
}

export function InlineCategoryForm({ defaultType = 'expense', defaultName = '', onCreated, onCancel }: InlineCategoryFormProps) {
  const [type, setType] = useState<'income' | 'expense'>(defaultType)
  const [name, setName] = useState(defaultName)
  const [icon, setIcon] = useState('📦')
  const [color, setColor] = useState('#4F88D4')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    if (!name.trim()) { setError('Nome obrigatório'); return }
    setSaving(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data: { user } } = await (supabase as any).auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { data, error: err } = await (supabase as any)
        .from('categories')
        .insert({
          user_id: user.id,
          name: name.trim(),
          icon,
          color,
          type,
          is_default: false,
        })
        .select('id, name, icon, color, type')
        .single()

      if (err) throw new Error(err.message)

      onCreated(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[var(--sl-t1)]">Criar categoria</p>
        <button
          onClick={onCancel}
          className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      {/* Tipo */}
      <div className="flex gap-2">
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={cn(
              'flex-1 py-2 rounded-[10px] border text-[12px] font-medium transition-all',
              type === t
                ? t === 'expense'
                  ? 'border-[#DB6478] bg-[rgba(219,100,120,.08)] text-[#DB6478]'
                  : 'border-[#0F766E] bg-[rgba(15,118,110,.08)] text-[#0F766E]'
                : 'border-[var(--sl-border)] text-[var(--sl-t2)]'
            )}
          >
            {t === 'expense' ? 'Despesa' : 'Receita'}
          </button>
        ))}
      </div>

      {/* Nome */}
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nome da categoria"
        className="w-full px-3 py-2 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#0F766E] transition-colors"
      />

      {/* Ícones */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5">Ícone</p>
        <div className="flex flex-wrap gap-1">
          {PRESET_ICONS.map(ic => (
            <button
              key={ic}
              onClick={() => setIcon(ic)}
              className={cn(
                'w-8 h-8 rounded-[8px] flex items-center justify-center text-[16px] border transition-colors',
                icon === ic
                  ? 'border-[#0F766E] bg-[rgba(15,118,110,.12)]'
                  : 'border-transparent hover:bg-[var(--sl-s2)]'
              )}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      {/* Cores */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1.5">Cor</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                'w-7 h-7 rounded-full border-2 transition-all',
                color === c ? 'border-[var(--sl-t1)] scale-110' : 'border-transparent'
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)]">
        <span className="text-[18px]">{icon}</span>
        <span className="text-[13px] font-medium text-[var(--sl-t1)]">{name || 'Preview'}</span>
        <div className="w-6 h-1.5 rounded-full ml-auto" style={{ background: color }} />
      </div>

      {/* Error */}
      {error && <p className="text-[11px] text-[#DB6478]">{error}</p>}

      {/* Submit */}
      <button
        onClick={handleCreate}
        disabled={saving || !name.trim()}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-[10px] text-[13px] font-bold text-[#03071a] transition-all hover:brightness-110 disabled:opacity-60"
        style={{ background: '#0F766E' }}
      >
        {saving && <Loader2 size={14} className="animate-spin" />}
        Criar e selecionar
      </button>
    </div>
  )
}
