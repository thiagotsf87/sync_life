'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { ALL_CATEGORIES, CustomCategory } from '@/constants/categories'
import { useUserCategories } from '@/hooks/use-user-categories'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react'

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
    if (!form.name.trim()) {
      toast.error('Por favor, preencha o nome da categoria')
      return
    }
    setIsSaving(true)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: { user } } = await (supabase as any).auth.getUser()
      if (!user) { toast.error('Usuário não autenticado'); return }

      if (editingCategory) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('categories')
          .update({ name: form.name.trim(), icon: form.icon, color: form.color, type: form.type })
          .eq('id', editingCategory.id)
        if (error) throw error
        toast.success('Categoria atualizada!')
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase as any)
          .from('categories')
          .insert({ user_id: user.id, name: form.name.trim(), icon: form.icon, color: form.color, type: form.type, is_default: false })
        if (error) throw error
        toast.success('Categoria criada!')
      }

      setIsFormOpen(false)
      refetch()
    } catch (err) {
      console.error(err)
      toast.error('Erro ao salvar categoria')
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
      toast.success('Categoria excluída!')
      setDeleteConfirm(null)
      refetch()
    } catch {
      toast.error('Erro ao excluir categoria')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-white">Categorias</h2>
        <Button
          onClick={openNewForm}
          className="bg-[var(--color-sync-500)] hover:bg-[var(--color-sync-600)] text-white"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Nova categoria
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('expense')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'expense'
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-rose-400'
          }`}
        >
          <ArrowDown className="w-3.5 h-3.5" />
          Despesas
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'income'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-emerald-400'
          }`}
        >
          <ArrowUp className="w-3.5 h-3.5" />
          Receitas
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Default categories */}
        {defaultsForTab.map(cat => (
          <div
            key={cat.id}
            className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
              style={{ backgroundColor: cat.color + '20' }}
            >
              {cat.icon}
            </div>
            <span className="text-sm text-white font-medium flex-1 min-w-0 truncate">{cat.name}</span>
            <span className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-700 text-slate-400 rounded-md flex-shrink-0">
              Padrão
            </span>
          </div>
        ))}

        {/* Custom categories */}
        {customForTab.map(cat => (
          <div
            key={cat.id}
            className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700 group"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
              style={{ backgroundColor: cat.color + '20' }}
            >
              {cat.icon}
            </div>
            <span className="text-sm text-white font-medium flex-1 min-w-0 truncate">{cat.name}</span>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => openEditForm(cat)}
                className="p-1 text-slate-500 hover:text-white hover:bg-slate-700 rounded-md transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDeleteClick(cat)}
                disabled={isCheckingUsage}
                className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded-md transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {customForTab.length === 0 && defaultsForTab.length === 0 && (
          <div className="col-span-full py-6 text-center text-slate-500 text-sm">
            Nenhuma categoria encontrada
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCategory ? 'Editar categoria' : 'Nova categoria'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Name */}
            <div>
              <Label className="text-slate-400 mb-2 block">Nome</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Nome da categoria"
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            {/* Type */}
            <div>
              <Label className="text-slate-400 mb-2 block">Tipo</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: 'expense' }))}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    form.type === 'expense'
                      ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white ring-2 ring-rose-500/50'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-rose-500/50 hover:text-rose-400'
                  }`}
                >
                  <ArrowDown className="w-4 h-4" />
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: 'income' }))}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-sm font-medium transition-all ${
                    form.type === 'income'
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white ring-2 ring-emerald-500/50'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-emerald-500/50 hover:text-emerald-400'
                  }`}
                >
                  <ArrowUp className="w-4 h-4" />
                  Receita
                </button>
              </div>
            </div>

            {/* Icon */}
            <div>
              <Label className="text-slate-400 mb-2 block">Ícone</Label>
              <div className="grid grid-cols-6 gap-1.5">
                {PRESET_ICONS.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`h-9 flex items-center justify-center rounded-lg text-lg transition-all ${
                      form.icon === icon
                        ? 'bg-[var(--color-sync-500)]/20 ring-2 ring-[var(--color-sync-500)]/60'
                        : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <Label className="text-slate-400 mb-2 block">Cor</Label>
              <div className="grid grid-cols-6 gap-1.5">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color }))}
                    className={`h-8 rounded-lg transition-all ${
                      form.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                style={{ backgroundColor: form.color + '20' }}
              >
                {form.icon}
              </div>
              <span className="text-sm text-white font-medium">{form.name || 'Pré-visualização'}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsFormOpen(false)}
              className="flex-1 bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-[var(--color-sync-500)] hover:bg-[var(--color-sync-600)] text-white"
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={open => { if (!open) setDeleteConfirm(null) }}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Excluir categoria
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-3">
            {deleteConfirm && (
              <>
                <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                    style={{ backgroundColor: deleteConfirm.category.color + '20' }}
                  >
                    {deleteConfirm.category.icon}
                  </div>
                  <span className="text-sm text-white font-medium">{deleteConfirm.category.name}</span>
                </div>

                {deleteConfirm.usageCount !== null && deleteConfirm.usageCount > 0 ? (
                  <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-amber-300">
                      Esta categoria está em uso em{' '}
                      <span className="font-semibold">{deleteConfirm.usageCount}</span>{' '}
                      {deleteConfirm.usageCount === 1 ? 'transação' : 'transações'}.
                      Ao excluir, elas ficarão sem categoria.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Esta ação não pode ser desfeita.</p>
                )}
              </>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              disabled={isDeleting}
              className="flex-1 bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Excluindo...' : deleteConfirm?.usageCount && deleteConfirm.usageCount > 0 ? 'Excluir mesmo assim' : 'Excluir'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
