'use client'

import { useState } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  CHECKLIST_CATEGORY_LABELS,
  type TripChecklistItem, type ChecklistCategory,
} from '@/hooks/use-experiencias'

interface TripChecklistTabProps {
  tripId: string
  checklist: TripChecklistItem[]
  checklistDone: number
  checklistPct: number
  toggleChecklistItem: (id: string, value: boolean) => Promise<void>
  addChecklistItem: (tripId: string, title: string, category: ChecklistCategory) => Promise<void>
  deleteChecklistItem: (id: string) => Promise<void>
  reload: () => Promise<void>
}

export function TripChecklistTab({
  tripId, checklist, checklistDone, checklistPct,
  toggleChecklistItem, addChecklistItem, deleteChecklistItem, reload,
}: TripChecklistTabProps) {
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<ChecklistCategory>('other')

  async function handleToggle(id: string, current: boolean) {
    try {
      await toggleChecklistItem(id, !current)
      await reload()
    } catch {
      toast.error('Erro ao atualizar checklist')
    }
  }

  async function handleAdd() {
    if (!newTitle.trim()) return
    try {
      await addChecklistItem(tripId, newTitle.trim(), newCategory)
      setNewTitle('')
      toast.success('Item adicionado')
      await reload()
    } catch {
      toast.error('Erro ao adicionar item')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-[var(--sl-t2)]">
          {checklistDone} de {checklist.length} itens concluídos ({checklistPct.toFixed(0)}%)
        </p>
      </div>

      {(Object.keys(CHECKLIST_CATEGORY_LABELS) as ChecklistCategory[]).map(cat => {
        const catItems = checklist.filter(c => c.category === cat)
        if (catItems.length === 0) return null
        return (
          <div key={cat} className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
            <h3 className="font-[Syne] font-bold text-[12px] text-[var(--sl-t1)] mb-3">{CHECKLIST_CATEGORY_LABELS[cat]}</h3>
            <div className="flex flex-col gap-2">
              {catItems.map(item => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <button
                    onClick={() => handleToggle(item.id, item.is_completed)}
                    className={cn(
                      'w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all',
                      item.is_completed ? 'bg-[#10b981] border-[#10b981]' : 'border-[var(--sl-border)] hover:border-[#10b981]'
                    )}
                  >
                    {item.is_completed && <Check size={11} className="text-[#03071a]" />}
                  </button>
                  <span className={cn(
                    'flex-1 text-[12px] transition-colors',
                    item.is_completed ? 'line-through text-[var(--sl-t3)]' : 'text-[var(--sl-t2)]'
                  )}>
                    {item.title}
                  </span>
                  <button
                    onClick={async () => { await deleteChecklistItem(item.id); await reload() }}
                    className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[rgba(244,63,94,0.1)]"
                  >
                    <Trash2 size={11} className="text-[var(--sl-t3)]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Add item */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5">
        <h3 className="font-[Syne] font-bold text-[12px] text-[var(--sl-t1)] mb-3">+ Adicionar item</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            placeholder="Novo item..."
            className="flex-1 px-3 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]"
          />
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value as ChecklistCategory)}
            className="px-2 py-2 rounded-[10px] text-[12px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)] outline-none focus:border-[#ec4899]"
          >
            {(Object.keys(CHECKLIST_CATEGORY_LABELS) as ChecklistCategory[]).map(c => (
              <option key={c} value={c}>{CHECKLIST_CATEGORY_LABELS[c]}</option>
            ))}
          </select>
          <button onClick={handleAdd}
            className="p-2 rounded-[10px] bg-[#ec4899]/10 border border-[#ec4899] text-[#ec4899] hover:bg-[#ec4899]/20">
            <Plus size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
