'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GoalModule, GoalIndicatorType, AddGoalData } from '@/hooks/use-futuro'
import { MODULE_LABELS, INDICATOR_LABELS } from '@/hooks/use-futuro'
import { createClient } from '@/lib/supabase/client'

interface AddGoalModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: AddGoalData) => Promise<void>
  isLoading?: boolean
}

const MODULES: GoalModule[] = ['financas', 'tempo', 'corpo', 'mente', 'patrimonio', 'carreira', 'experiencias']
const INDICATORS: GoalIndicatorType[] = ['monetary', 'weight', 'task', 'frequency', 'percentage', 'quantity']

const UNIT_SUGGESTIONS: Record<GoalIndicatorType, string[]> = {
  monetary: ['R$'],
  weight: ['kg', 'lbs'],
  task: [],
  frequency: ['vezes/semana', 'vezes/mês', 'dias/semana'],
  percentage: ['%'],
  quantity: ['horas', 'livros', 'dias', 'passos', 'km'],
  linked: [],
}

interface FormState {
  name: string
  target_module: GoalModule
  indicator_type: GoalIndicatorType
  target_value: string
  current_value: string
  initial_value: string
  target_unit: string
  weight: string
  linked_entity_id: string
}

const INITIAL: FormState = {
  name: '',
  target_module: 'financas',
  indicator_type: 'monetary',
  target_value: '',
  current_value: '0',
  initial_value: '',
  target_unit: '',
  weight: '1',
  linked_entity_id: '',
}

interface LinkOption {
  id: string
  label: string
  linkedType: string
}

export function AddGoalModal({ open, onClose, onSave, isLoading = false }: AddGoalModalProps) {
  const [form, setForm] = useState<FormState>(INITIAL)
  const [linkOptions, setLinkOptions] = useState<LinkOption[]>([])

  if (!open) return null

  const isTask = form.indicator_type === 'task'
  const isFrequency = form.indicator_type === 'frequency'
  const isWeight = form.indicator_type === 'weight'
  const showInitialValue = !isTask && !isFrequency
  const suggestions = UNIT_SUGGESTIONS[form.indicator_type] ?? []
  const isLinkedGoal = form.linked_entity_id.length > 0

  useEffect(() => {
    if (!open) return
    const supabase = createClient() as any
    supabase.auth.getUser().then(({ data: { user } }: any) => {
      if (!user) return
      if (form.target_module === 'mente') {
        supabase.from('study_tracks')
          .select('id, name')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .then(({ data }: any) => {
            setLinkOptions((data ?? []).map((d: { id: string; name: string }) => ({
              id: d.id,
              label: `📚 ${d.name}`,
              linkedType: 'study_track',
            })))
          })
        return
      }
      if (form.target_module === 'carreira') {
        supabase.from('roadmap_steps')
          .select('id, title, roadmap:career_roadmaps(name, user_id)')
          .order('created_at', { ascending: false })
          .then(({ data }: any) => {
            const filtered = (data ?? []).filter((s: any) => s.roadmap?.user_id === user.id)
            setLinkOptions(filtered.map((d: any) => ({
              id: d.id,
              label: `🗺 ${d.roadmap?.name ?? 'Roadmap'} • ${d.title}`,
              linkedType: 'roadmap_step',
            })))
          })
        return
      }
      if (form.target_module === 'experiencias') {
        supabase.from('trips')
          .select('id, name')
          .eq('user_id', user.id)
          .order('start_date', { ascending: false })
          .then(({ data }: any) => {
            setLinkOptions((data ?? []).map((d: { id: string; name: string }) => ({
              id: d.id,
              label: `✈️ ${d.name}`,
              linkedType: 'trip_budget',
            })))
          })
        return
      }
      if (form.target_module === 'financas') {
        supabase.from('categories')
          .select('id, name, icon')
          .eq('user_id', user.id)
          .order('name')
          .then(({ data }: any) => {
            setLinkOptions((data ?? []).map((d: { id: string; name: string; icon: string | null }) => ({
              id: d.id,
              label: `${d.icon ?? '💰'} ${d.name}`,
              linkedType: 'finance_category',
            })))
          })
        return
      }
      setLinkOptions([])
    })
  }, [open, form.target_module])

  async function handleSave() {
    const selectedLink = linkOptions.find(o => o.id === form.linked_entity_id)
    await onSave({
      name: form.name.trim(),
      target_module: form.target_module,
      indicator_type: isLinkedGoal ? 'linked' : form.indicator_type,
      target_value: isLinkedGoal ? 100 : form.target_value ? parseFloat(form.target_value) : null,
      current_value: isLinkedGoal ? 0 : parseFloat(form.current_value) || 0,
      initial_value: isLinkedGoal ? 0 : form.initial_value ? parseFloat(form.initial_value) : null,
      target_unit: form.target_unit.trim() || undefined,
      weight: parseFloat(form.weight) || 1,
      auto_sync: !!selectedLink,
      linked_entity_type: selectedLink?.linkedType ?? null,
      linked_entity_id: selectedLink?.id ?? null,
    })
    setForm(INITIAL)
  }

  function handleClose() {
    setForm(INITIAL)
    onClose()
  }

  const canSave = form.name.trim().length >= 2

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-[440px] bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)]">
          <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Nova Meta</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[var(--sl-s2)] transition-colors">
            <X size={16} className="text-[var(--sl-t2)]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-3">

          {/* Name */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
              Nome da Meta
            </label>
            <input
              autoFocus
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Economizar R$ 50.000"
              className="w-full px-3 py-2.5 rounded-[10px] text-[13px] font-medium
                         bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                         placeholder:text-[var(--sl-t3)] outline-none focus:border-[#10b981] transition-colors"
            />
          </div>

          {/* Module */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
              Módulo
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {MODULES.map(m => (
                <button
                  key={m}
                  onClick={() => setForm(f => ({ ...f, target_module: m, linked_entity_id: '' }))}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2 rounded-[8px] text-[12px] transition-all border',
                    form.target_module === m
                      ? 'border-[#10b981] bg-[#10b981]/10 text-[var(--sl-t1)]'
                      : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                  )}
                >
                  {MODULE_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {linkOptions.length > 0 && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                Vincular a item existente (opcional)
              </label>
              <select
                value={form.linked_entity_id}
                onChange={e => setForm(f => ({ ...f, linked_entity_id: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-[10px] text-[13px]
                           bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                           outline-none focus:border-[#10b981] transition-colors"
              >
                <option value="">Nenhum</option>
                {linkOptions.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
              <p className="text-[10px] text-[var(--sl-t3)] mt-1">
                Metas vinculadas sincronizam progresso automaticamente com o item selecionado.
              </p>
            </div>
          )}

          {/* Indicator type */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
              Tipo de Indicador
            </label>
            <select
              value={form.indicator_type}
              onChange={e => setForm(f => ({ ...f, indicator_type: e.target.value as GoalIndicatorType, target_unit: '' }))}
              className="w-full px-3 py-2.5 rounded-[10px] text-[13px]
                         bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                         outline-none focus:border-[#10b981] transition-colors"
            >
              {INDICATORS.map(ind => (
                <option key={ind} value={ind}>{INDICATOR_LABELS[ind]}</option>
              ))}
            </select>
          </div>

          {/* Values (hidden for task) */}
          {!isTask && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                  {isWeight ? 'Peso Atual (kg)' : 'Valor Atual'}
                </label>
                <input
                  type="number"
                  value={form.current_value}
                  onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))}
                  placeholder={isWeight ? 'Ex: 85' : '0'}
                  className="w-full px-3 py-2 rounded-[10px] text-[13px]
                             bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                             placeholder:text-[var(--sl-t3)] outline-none focus:border-[#10b981] transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                  {isWeight ? 'Peso Alvo (kg)' : 'Meta (alvo)'}
                </label>
                <input
                  type="number"
                  value={form.target_value}
                  onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))}
                  placeholder={isWeight ? 'Ex: 75' : '0'}
                  className="w-full px-3 py-2 rounded-[10px] text-[13px]
                             bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                             placeholder:text-[var(--sl-t3)] outline-none focus:border-[#10b981] transition-colors"
                />
              </div>
            </div>
          )}

          {/* RN-FUT-17: Valor de partida — necessário para peso, opcional para monetário/quantidade */}
          {showInitialValue && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                {isWeight
                  ? 'Peso de Partida (kg) — obrigatório para calcular % de progresso'
                  : 'Valor de Partida (opcional) — se a meta começa acima de zero'}
              </label>
              <input
                type="number"
                value={form.initial_value}
                onChange={e => setForm(f => ({ ...f, initial_value: e.target.value }))}
                placeholder={
                  isWeight ? 'Ex: 90 (peso antes de começar)' :
                  form.indicator_type === 'monetary' ? 'Ex: 5000 (quanto já tem hoje)' :
                  'Ponto de partida'
                }
                className="w-full px-3 py-2 rounded-[10px] text-[13px]
                           bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                           placeholder:text-[var(--sl-t3)] outline-none focus:border-[#10b981] transition-colors"
              />
              {isWeight && form.initial_value && form.target_value && (
                <p className="text-[10px] text-[var(--sl-t3)] mt-1">
                  {parseFloat(form.initial_value) > parseFloat(form.target_value)
                    ? `📉 Meta de perda: ${(parseFloat(form.initial_value) - parseFloat(form.target_value)).toFixed(1)} kg`
                    : `📈 Meta de ganho: ${(parseFloat(form.target_value) - parseFloat(form.initial_value)).toFixed(1)} kg`}
                </p>
              )}
            </div>
          )}

          {/* Unit */}
          {!isTask && (
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
                Unidade {suggestions.length > 0 && '(sugestões)'}
              </label>
              {suggestions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => setForm(f => ({ ...f, target_unit: s }))}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                        form.target_unit === s
                          ? 'border-[#10b981] bg-[#10b981]/10 text-[#10b981]'
                          : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={form.target_unit}
                  onChange={e => setForm(f => ({ ...f, target_unit: e.target.value }))}
                  placeholder="Ex: horas, livros, km..."
                  className="w-full px-3 py-2 rounded-[10px] text-[13px]
                             bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                             placeholder:text-[var(--sl-t3)] outline-none focus:border-[#10b981] transition-colors"
                />
              )}
            </div>
          )}

          {/* RN-FUT-03/16: Peso da meta para cálculo ponderado */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-1 block">
              Peso (importância)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(w => (
                <button
                  key={w}
                  onClick={() => setForm(f => ({ ...f, weight: String(w) }))}
                  className={cn(
                    'flex-1 py-1.5 rounded-[8px] text-[11px] font-medium border transition-all',
                    parseInt(form.weight) === w
                      ? 'border-[#10b981] bg-[#10b981]/10 text-[var(--sl-t1)]'
                      : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                  )}
                >
                  {w === 1 ? '1 — Normal' : w === 2 ? '2 — Importante' : '3 — Crítica'}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--sl-t3)] mt-1">Metas com peso maior influenciam mais o progresso geral.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--sl-border)]">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-[10px] text-[13px] font-medium text-[var(--sl-t2)]
                       hover:bg-[var(--sl-s2)] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading || !canSave}
            className={cn(
              'px-5 py-2 rounded-[10px] text-[13px] font-semibold transition-all',
              canSave && !isLoading
                ? 'bg-[#10b981] text-[#03071a] hover:opacity-90'
                : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
            )}
          >
            {isLoading ? 'Adicionando...' : 'Adicionar Meta'}
          </button>
        </div>
      </div>
    </div>
  )
}
