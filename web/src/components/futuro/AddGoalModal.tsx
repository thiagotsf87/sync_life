'use client'

import { useEffect, useState } from 'react'
import { X, Target, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TextField } from '@/components/ui/text-field'
import { SelectField } from '@/components/ui/select-field'
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

// Cor do módulo Futuro (identificação)
const MOD_FUTURO = '#8B7BD4'

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
              label: `🗺 ${d.roadmap?.name ?? 'Roadmap'} · ${d.title}`,
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

  if (!open) return null

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
      <div className="w-full max-w-[440px] max-h-[90vh] flex flex-col bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--sl-border)] shrink-0">
          <div className="flex items-center gap-2">
            <Target size={16} style={{ color: MOD_FUTURO }} />
            <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)]">Nova meta</h2>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[var(--sl-s2)] transition-colors" aria-label="Fechar">
            <X size={16} className="text-[var(--sl-t2)]" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-3 overflow-y-auto">

          {/* Name */}
          <TextField
            label="Nome da meta"
            autoFocus
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Economizar R$ 50.000"
          />

          {/* Module */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5 block">
              Módulo
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {MODULES.map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, target_module: m, linked_entity_id: '' }))}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-2 rounded-[8px] text-[12px] transition-all border',
                    form.target_module === m
                      ? 'border-[var(--sl-em)] bg-[var(--sl-em-soft)] text-[var(--sl-t1)]'
                      : 'border-[var(--sl-border)] bg-[var(--sl-s2)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                  )}
                >
                  {MODULE_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          {linkOptions.length > 0 && (
            <SelectField
              label="Vincular a item existente (opcional)"
              value={form.linked_entity_id}
              onChange={e => setForm(f => ({ ...f, linked_entity_id: e.target.value }))}
              options={[
                { value: '', label: 'Nenhum' },
                ...linkOptions.map(opt => ({ value: opt.id, label: opt.label })),
              ]}
              hint="Metas vinculadas sincronizam progresso automaticamente com o item selecionado."
            />
          )}

          {/* Indicator type */}
          <SelectField
            label="Tipo de indicador"
            value={form.indicator_type}
            onChange={e => setForm(f => ({ ...f, indicator_type: e.target.value as GoalIndicatorType, target_unit: '' }))}
            options={INDICATORS.map(ind => ({ value: ind, label: INDICATOR_LABELS[ind] }))}
          />

          {/* Values (hidden for task) */}
          {!isTask && (
            <div className="grid grid-cols-2 gap-2">
              <TextField
                label={isWeight ? 'Peso atual (kg)' : 'Valor atual'}
                type="number"
                value={form.current_value}
                onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))}
                placeholder={isWeight ? 'Ex: 85' : '0'}
                className="sl-num"
              />
              <TextField
                label={isWeight ? 'Peso alvo (kg)' : 'Meta (alvo)'}
                type="number"
                value={form.target_value}
                onChange={e => setForm(f => ({ ...f, target_value: e.target.value }))}
                placeholder={isWeight ? 'Ex: 75' : '0'}
                className="sl-num"
              />
            </div>
          )}

          {/* RN-FUT-17: Valor de partida */}
          {showInitialValue && (
            <div className="flex flex-col gap-1.5">
              <TextField
                label={
                  isWeight
                    ? 'Peso de partida (kg)'
                    : 'Valor de partida (opcional)'
                }
                type="number"
                value={form.initial_value}
                onChange={e => setForm(f => ({ ...f, initial_value: e.target.value }))}
                placeholder={
                  isWeight ? 'Ex: 90 (peso antes de começar)' :
                  form.indicator_type === 'monetary' ? 'Ex: 5000 (quanto já tem hoje)' :
                  'Ponto de partida'
                }
                className="sl-num"
                hint={
                  isWeight
                    ? 'Obrigatório para calcular % de progresso.'
                    : 'Use se a meta começa acima de zero.'
                }
              />
              {isWeight && form.initial_value && form.target_value && (
                <p className="text-[11px] text-[var(--sl-t3)] flex items-center gap-1">
                  {parseFloat(form.initial_value) > parseFloat(form.target_value)
                    ? (<><TrendingDown size={12} className="text-[var(--sl-success)]" /> Meta de perda: {(parseFloat(form.initial_value) - parseFloat(form.target_value)).toFixed(1)} kg</>)
                    : (<><TrendingUp size={12} className="text-[var(--sl-success)]" /> Meta de ganho: {(parseFloat(form.target_value) - parseFloat(form.initial_value)).toFixed(1)} kg</>)
                  }
                </p>
              )}
            </div>
          )}

          {/* Unit */}
          {!isTask && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5 block">
                Unidade {suggestions.length > 0 && '(sugestões)'}
              </span>
              {suggestions.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, target_unit: s }))}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                        form.target_unit === s
                          ? 'border-[var(--sl-em)] bg-[var(--sl-em-soft)] text-[var(--sl-em)]'
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
                  className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px]
                             bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[var(--sl-t1)]
                             placeholder:text-[var(--sl-t3)] outline-none focus:border-[var(--sl-border-em)] transition-colors"
                />
              )}
            </div>
          )}

          {/* RN-FUT-03/16: Peso da meta */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5 block">
              Peso (importância)
            </span>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(w => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, weight: String(w) }))}
                  className={cn(
                    'flex-1 py-1.5 rounded-[8px] text-[11px] font-medium border transition-all',
                    parseInt(form.weight) === w
                      ? 'border-[var(--sl-em)] bg-[var(--sl-em-soft)] text-[var(--sl-t1)]'
                      : 'border-[var(--sl-border)] text-[var(--sl-t2)] hover:border-[var(--sl-border-h)]'
                  )}
                >
                  {w === 1 ? '1 · Normal' : w === 2 ? '2 · Importante' : '3 · Crítica'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[var(--sl-t3)] mt-1">Metas com peso maior influenciam mais o progresso geral.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--sl-border)] shrink-0">
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
                ? 'text-white hover:opacity-90'
                : 'bg-[var(--sl-s3)] text-[var(--sl-t3)] cursor-not-allowed'
            )}
            style={canSave && !isLoading ? { background: 'var(--sl-em)' } : undefined}
          >
            {isLoading ? 'Adicionando...' : 'Adicionar meta'}
          </button>
        </div>
      </div>
    </div>
  )
}
