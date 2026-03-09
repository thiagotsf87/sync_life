'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ALL_CATEGORIES, CustomCategory } from '@/constants/categories'
import { useUserCategories } from '@/hooks/use-user-categories'
import { Plus, Pencil, Trash2, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRESET_ICONS = [
  '💼', '💰', '💳', '🏦', '📊', '📈',
  '🍔', '🍕', '☕', '🛒', '🏠', '⚡',
  '🚗', '✈️', '🚌', '💊', '🏋️', '🎮',
  '🎬', '🎵', '📚', '🎁', '🏖️', '👔',
  '🛍️', '✂️', '🔧', '📱', '🐾', '📦',
]

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
]

interface CategoryFormState {
  name: string
  type: 'income' | 'expense'
  icon: string
  color: string
}

const DEFAULT_FORM: CategoryFormState = {
  name: '',
  type: 'expense',
  icon: '📦',
  color: '#3b82f6',
}

interface DeleteConfirmState {
  category: CustomCategory
  usageCount: number | null
}

export function CategoryManager() {
  const { customCategories, refetch } = useUserCategories()
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null)
  const [form, setForm] = useState<CategoryFormState>(DEFAULT_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null)
  const [isCheckingUsage, setIsCheckingUsage] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const defaultsForTab = ALL_CATEGORIES.filter(c => c.type === activeTab)
  const customForTab = customCategories.filter(c => c.type === activeTab)

  const openNewForm = () => {
    setEditingCategory(null)
    setForm({ ...DEFAULT_FORM, type: activeTab })
    setIsFormOpen(true)
  }

  const openEditForm = (cat: CustomCategory) => {
    setEditingCategory(cat)
    setForm({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color })
    setIsFormOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Preencha o nome da categoria', 'err'); return }
    setIsSaving(true)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: { user } } = await (supabase as any).auth.getUser()
      if (!user) { showToast('Usuário não autenticado', 'err'); return }

      if (editingCategory) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('categories')
          .update({ name: form.name.trim(), icon: form.icon, color: form.color, type: form.type })
          .eq('id', editingCategory.id)
        if (error) throw error
        showToast('Categoria atualizada!')
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('categories')
          .insert({ user_id: user.id, name: form.name.trim(), icon: form.icon, color: form.color, type: form.type, is_default: false })
        if (error) throw error
        showToast('Categoria criada!')
      }

      setIsFormOpen(false)
      refetch()
    } catch (err) {
      console.error(err)
      showToast('Erro ao salvar categoria', 'err')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = async (cat: CustomCategory) => {
    setIsCheckingUsage(true)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { count } = await (supabase as any)
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('category_key', cat.id) as { count: number | null }

      setDeleteConfirm({ category: cat, usageCount: count ?? 0 })
    } catch {
      setDeleteConfirm({ category: cat, usageCount: null })
    } finally {
      setIsCheckingUsage(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('categories')
        .delete()
        .eq('id', deleteConfirm.category.id)
      if (error) throw error
      showToast('Categoria excluída!')
      setDeleteConfirm(null)
      refetch()
    } catch {
      showToast('Erro ao excluir categoria', 'err')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Filter pills */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('expense')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all',
            activeTab === 'expense'
              ? 'bg-[rgba(244,63,94,0.12)] text-[#f43f5e] border-[rgba(244,63,94,0.3)]'
              : 'bg-transparent text-[var(--sl-t2)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
          )}
        >
          📤 Despesas
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={cn(
            'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[12px] font-semibold border transition-all',
            activeTab === 'income'
              ? 'bg-[rgba(16,185,129,0.12)] text-[#10b981] border-[rgba(16,185,129,0.3)]'
              : 'bg-transparent text-[var(--sl-t2)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
          )}
        >
          💰 Receitas
        </button>
      </div>

      {/* Grid */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 transition-colors hover:border-[var(--sl-border-h)]">
        <div className="grid grid-cols-2 gap-2.5">
          {/* Default categories */}
          {defaultsForTab.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-2.5 p-2.5 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]"
            >
              <div
                className="w-8 h-8 rounded-[9px] flex items-center justify-center text-base shrink-0"
                style={{ background: cat.color + '22' }}
              >
                {cat.icon}
              </div>
              <span className="text-[12px] font-medium text-[var(--sl-t1)] flex-1 min-w-0 truncate">{cat.name}</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--sl-s3)] text-[var(--sl-t3)] shrink-0">
                Padrão
              </span>
            </div>
          ))}

          {/* Custom categories */}
          {customForTab.map(cat => (
            <div
              key={cat.id}
              className="group flex items-center gap-2.5 p-2.5 bg-[var(--sl-s2)] rounded-xl border border-dashed border-[var(--sl-border-h)]"
            >
              <div
                className="w-8 h-8 rounded-[9px] flex items-center justify-center text-base shrink-0"
                style={{ background: cat.color + '22' }}
              >
                {cat.icon}
              </div>
              <span className="text-[12px] font-medium text-[var(--sl-t1)] flex-1 min-w-0 truncate">{cat.name}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => openEditForm(cat)}
                  className="p-1 rounded-md text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s3)] transition-colors"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => handleDeleteClick(cat)}
                  disabled={isCheckingUsage}
                  className="p-1 rounded-md text-[var(--sl-t3)] hover:text-[#f43f5e] hover:bg-[var(--sl-s3)] transition-colors disabled:opacity-40"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}

          {/* Add new button */}
          <button
            onClick={openNewForm}
            className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-[var(--sl-border-h)] text-[var(--sl-t3)] hover:text-[#10b981] hover:border-[rgba(16,185,129,0.4)] hover:bg-[rgba(16,185,129,0.04)] transition-all text-[12px] font-medium min-h-[52px]"
          >
            <Plus size={14} />
            Nova categoria
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-[Syne] font-bold text-base text-[var(--sl-t1)]">
                {editingCategory ? 'Editar categoria' : 'Nova categoria'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s3)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
                  className={cn(
                    'py-1.5 px-3 rounded-[9px] text-[12px] font-semibold border transition-all',
                    form.type === 'expense'
                      ? 'bg-[rgba(244,63,94,0.12)] text-[#f43f5e] border-[rgba(244,63,94,0.3)]'
                      : 'bg-transparent text-[var(--sl-t2)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
                  )}
                >
                  📤 Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: 'income' }))}
                  className={cn(
                    'py-1.5 px-3 rounded-[9px] text-[12px] font-semibold border transition-all',
                    form.type === 'income'
                      ? 'bg-[rgba(16,185,129,0.12)] text-[#10b981] border-[rgba(16,185,129,0.3)]'
                      : 'bg-transparent text-[var(--sl-t2)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
                  )}
                >
                  💰 Receita
                </button>
              </div>

              {/* Name */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--sl-t3)] mb-1.5">Nome</p>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nome da categoria"
                  className="w-full bg-[var(--sl-s3)] border border-[var(--sl-border)] rounded-[9px] px-3 py-2 text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#10b981] transition-colors"
                />
              </div>

              {/* Icon */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--sl-t3)] mb-1.5">Ícone</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {PRESET_ICONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, icon }))}
                      className={cn(
                        'h-9 flex items-center justify-center rounded-[9px] text-base transition-all',
                        form.icon === icon
                          ? 'bg-[rgba(16,185,129,0.15)] ring-2 ring-[rgba(16,185,129,0.5)]'
                          : 'bg-[var(--sl-s3)] hover:bg-[var(--sl-s3)] hover:ring-1 hover:ring-[var(--sl-border-h)]',
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--sl-t3)] mb-1.5">Cor</p>
                <div className="grid grid-cols-6 gap-1.5">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, color }))}
                      className={cn(
                        'h-8 rounded-[9px] transition-all',
                        form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--sl-s2)] scale-110' : 'hover:scale-110',
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-2.5 p-2.5 bg-[var(--sl-s3)] rounded-xl border border-[var(--sl-border)]">
                <div
                  className="w-8 h-8 rounded-[9px] flex items-center justify-center text-base shrink-0"
                  style={{ background: form.color + '22' }}
                >
                  {form.icon}
                </div>
                <span className="text-[12px] font-medium text-[var(--sl-t1)]">
                  {form.name || 'Pré-visualização'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setIsFormOpen(false)}
                className="flex-1 px-4 py-2 rounded-[9px] border border-[var(--sl-border)] bg-transparent text-[13px] font-semibold text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 rounded-[9px] text-white text-[13px] font-bold transition-all hover:brightness-110 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
              >
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-[#f43f5e]" />
              <h3 className="font-[Syne] font-bold text-base text-[var(--sl-t1)]">Excluir categoria?</h3>
            </div>

            <div className="flex items-center gap-2.5 p-2.5 bg-[var(--sl-s3)] rounded-xl border border-[var(--sl-border)] mb-4">
              <div
                className="w-8 h-8 rounded-[9px] flex items-center justify-center text-base shrink-0"
                style={{ background: deleteConfirm.category.color + '22' }}
              >
                {deleteConfirm.category.icon}
              </div>
              <span className="text-[12px] font-medium text-[var(--sl-t1)]">{deleteConfirm.category.name}</span>
            </div>

            {deleteConfirm.usageCount !== null && deleteConfirm.usageCount > 0 ? (
              <div className="flex items-start gap-2 p-3 rounded-xl border mb-4"
                style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' }}>
                <AlertTriangle size={14} className="text-[#f59e0b] mt-0.5 shrink-0" />
                <p className="text-[12px] text-[var(--sl-t2)] leading-snug">
                  Esta categoria está em uso em{' '}
                  <span className="font-bold text-[#f59e0b]">{deleteConfirm.usageCount}</span>{' '}
                  {deleteConfirm.usageCount === 1 ? 'transação' : 'transações'}.
                  Ao excluir, elas ficarão sem categoria.
                </p>
              </div>
            ) : (
              <p className="text-[12px] text-[var(--sl-t3)] mb-4">Esta ação não pode ser desfeita.</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-[9px] border border-[var(--sl-border)] bg-transparent text-[13px] font-semibold text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-[9px] text-white text-[13px] font-bold transition-all hover:brightness-110 disabled:opacity-60"
                style={{ background: '#f43f5e' }}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Trash2 size={13} />
                  {isDeleting ? 'Excluindo...' : deleteConfirm.usageCount && deleteConfirm.usageCount > 0 ? 'Excluir mesmo assim' : 'Excluir'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-lg text-[13px] font-medium transition-all"
          style={{
            background: toast.type === 'ok' ? 'rgba(16,185,129,0.1)' : 'rgba(244,63,94,0.1)',
            borderColor: toast.type === 'ok' ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)',
            color: toast.type === 'ok' ? '#10b981' : '#f43f5e',
          }}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
