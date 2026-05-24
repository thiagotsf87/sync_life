'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, X, AlertTriangle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAccounts, type CreateAccountData } from '@/hooks/use-accounts'
import { BANK_PRESETS, ACCOUNT_TYPE_LABELS } from '@/constants/bank-presets'
import { createClient } from '@/lib/supabase/client'

const PRESET_ICONS = [
  '🏦', '💳', '💰', '🟣', '🟠', '🔴',
  '🟡', '🔵', '⚫', '🟢', '💵', '📊',
]

const PRESET_COLORS = [
  '#820AD1', '#FF7A00', '#EC7000', '#CC092F',
  '#FFED00', '#005CA9', '#CC0000', '#242424',
  '#1C3D73', '#21C25E', '#009EE3', '#0F766E',
]

const ACCOUNT_TYPES: { value: CreateAccountData['type']; label: string }[] = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'investment', label: 'Investimento' },
  { value: 'wallet', label: 'Carteira' },
]

interface AccountFormState {
  name: string
  bank: string
  type: CreateAccountData['type']
  icon: string
  color: string
}

const DEFAULT_FORM: AccountFormState = {
  name: '',
  bank: '',
  type: 'checking',
  icon: '🏦',
  color: '#4F88D4',
}

export function AccountManager() {
  const { accounts, isLoading, createAccount, updateAccount, deleteAccount, refetch } = useAccounts()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AccountFormState>(DEFAULT_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string; usageCount: number | null } | null>(null)
  const [isCheckingUsage, setIsCheckingUsage] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Which bank presets are already added
  const addedBanks = new Set(accounts.map(a => a.bank))

  const openNewForm = () => {
    setEditingId(null)
    setForm(DEFAULT_FORM)
    setIsFormOpen(true)
  }

  const openEditForm = (acc: typeof accounts[0]) => {
    setEditingId(acc.id)
    setForm({ name: acc.name, bank: acc.bank, type: acc.type, icon: acc.icon, color: acc.color })
    setIsFormOpen(true)
  }

  const handleQuickAdd = async (preset: typeof BANK_PRESETS[0]) => {
    if (addedBanks.has(preset.bank)) return
    try {
      await createAccount({
        name: preset.bank,
        bank: preset.bank,
        type: preset.type,
        icon: preset.icon,
        color: preset.color,
      })
      showToast(`${preset.bank} adicionado!`)
    } catch {
      showToast('Erro ao adicionar conta', 'err')
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Preencha o nome da conta', 'err'); return }
    if (!form.bank.trim()) { showToast('Preencha o banco', 'err'); return }
    setIsSaving(true)
    try {
      if (editingId) {
        await updateAccount(editingId, {
          name: form.name.trim(),
          bank: form.bank.trim(),
          type: form.type,
          icon: form.icon,
          color: form.color,
        })
        showToast('Conta atualizada!')
      } else {
        await createAccount({
          name: form.name.trim(),
          bank: form.bank.trim(),
          type: form.type,
          icon: form.icon,
          color: form.color,
        })
        showToast('Conta criada!')
      }
      setIsFormOpen(false)
    } catch {
      showToast('Erro ao salvar conta', 'err')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = async (acc: typeof accounts[0]) => {
    setIsCheckingUsage(true)
    try {
      const supabase = createClient()
      const sb = supabase as any
      const { count: fromCount } = await sb
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('account_from_id', acc.id) as { count: number | null }
      const { count: toCount } = await sb
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('account_to_id', acc.id) as { count: number | null }
      const total = (fromCount ?? 0) + (toCount ?? 0)
      setDeleteConfirm({ id: acc.id, name: acc.name, usageCount: total })
    } catch {
      setDeleteConfirm({ id: acc.id, name: acc.name, usageCount: null })
    } finally {
      setIsCheckingUsage(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return
    setIsDeleting(true)
    try {
      await deleteAccount(deleteConfirm.id)
      showToast('Conta desativada!')
      setDeleteConfirm(null)
    } catch {
      showToast('Erro ao excluir conta', 'err')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      {/* Quick-add presets */}
      <div className="mb-5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)] mb-2.5">Adicionar rapidamente</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {BANK_PRESETS.map(preset => {
            const isAdded = addedBanks.has(preset.bank)
            return (
              <button
                key={preset.bank}
                onClick={() => handleQuickAdd(preset)}
                disabled={isAdded}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-[11px] border text-left transition-all',
                  isAdded
                    ? 'bg-[var(--sl-s2)] border-[var(--sl-border)] opacity-50 cursor-default'
                    : 'bg-[var(--sl-s1)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:-translate-y-px active:scale-[0.98]'
                )}
              >
                <span className="text-base shrink-0">{preset.icon}</span>
                <span className="text-[12px] font-medium text-[var(--sl-t1)] truncate flex-1">{preset.bank}</span>
                {isAdded && <Check size={12} className="text-[#0F766E] shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Accounts list */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-5 transition-colors hover:border-[var(--sl-border-h)]">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--sl-t3)]">Suas contas</p>
          <span className="text-[11px] text-[var(--sl-t3)]">{accounts.length} contas</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[52px] rounded-xl bg-[var(--sl-s3)] animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-3xl block mb-2 opacity-50">🏦</span>
            <p className="text-[13px] text-[var(--sl-t2)] mb-1">Nenhuma conta cadastrada</p>
            <p className="text-[11px] text-[var(--sl-t3)]">Use os presets acima ou crie manualmente.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {accounts.map(acc => (
              <div
                key={acc.id}
                className="group flex items-center gap-2.5 p-2.5 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]"
              >
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base shrink-0"
                  style={{ background: acc.color + '22' }}
                >
                  {acc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[var(--sl-t1)] truncate">{acc.name}</p>
                  <p className="text-[10px] text-[var(--sl-t3)]">{acc.bank} · {ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: acc.color }} />
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => openEditForm(acc)}
                    className="p-1 rounded-md text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s3)] transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(acc)}
                    disabled={isCheckingUsage}
                    className="p-1 rounded-md text-[var(--sl-t3)] hover:text-[#DB6478] hover:bg-[var(--sl-s3)] transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new button */}
        <button
          onClick={openNewForm}
          className="flex items-center justify-center gap-2 w-full mt-3 p-2.5 rounded-xl border border-dashed border-[var(--sl-border-h)] text-[var(--sl-t3)] hover:text-[#0B2D34] hover:border-[rgba(0,85,255,0.4)] hover:bg-[rgba(0,85,255,0.04)] transition-all text-[12px] font-medium min-h-[44px]"
        >
          <Plus size={14} />
          Nova conta manual
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-[Space_Grotesk] font-bold text-base text-[var(--sl-t1)]">
                {editingId ? 'Editar conta' : 'Nova conta'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s3)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--sl-t3)] mb-1.5">Nome da conta</p>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Nubank Principal"
                  className="w-full bg-[var(--sl-s3)] border border-[var(--sl-border)] rounded-[9px] px-3 py-2 text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#0B2D34] transition-colors"
                />
              </div>

              {/* Bank */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--sl-t3)] mb-1.5">Banco / Instituição</p>
                <input
                  value={form.bank}
                  onChange={e => setForm(f => ({ ...f, bank: e.target.value }))}
                  placeholder="Ex: Nubank"
                  className="w-full bg-[var(--sl-s3)] border border-[var(--sl-border)] rounded-[9px] px-3 py-2 text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)] outline-none focus:border-[#0B2D34] transition-colors"
                />
              </div>

              {/* Type */}
              <div>
                <p className="text-[11px] font-semibold text-[var(--sl-t3)] mb-1.5">Tipo</p>
                <div className="grid grid-cols-2 gap-2">
                  {ACCOUNT_TYPES.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, type: t.value }))}
                      className={cn(
                        'py-1.5 px-3 rounded-[9px] text-[12px] font-semibold border transition-all',
                        form.type === t.value
                          ? 'bg-[rgba(0,85,255,0.12)] text-[#0B2D34] border-[rgba(0,85,255,0.3)]'
                          : 'bg-transparent text-[var(--sl-t2)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
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
                          ? 'bg-[rgba(0,85,255,0.15)] ring-2 ring-[rgba(0,85,255,0.5)]'
                          : 'bg-[var(--sl-s3)] hover:ring-1 hover:ring-[var(--sl-border-h)]',
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
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base shrink-0"
                  style={{ background: form.color + '22' }}
                >
                  {form.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-[var(--sl-t1)]">
                    {form.name || 'Nome da conta'}
                  </p>
                  <p className="text-[10px] text-[var(--sl-t3)]">
                    {form.bank || 'Banco'} · {ACCOUNT_TYPE_LABELS[form.type]}
                  </p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full shrink-0 ml-auto" style={{ background: form.color }} />
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
                style={{ background: '#0B2D34' }}
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
              <AlertTriangle size={18} className="text-[#DB6478]" />
              <h3 className="font-[Space_Grotesk] font-bold text-base text-[var(--sl-t1)]">Desativar conta?</h3>
            </div>

            <p className="text-[13px] text-[var(--sl-t2)] mb-3">
              A conta <strong>&quot;{deleteConfirm.name}&quot;</strong> será desativada. Transferências existentes não serão afetadas.
            </p>

            {deleteConfirm.usageCount !== null && deleteConfirm.usageCount > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl border mb-4"
                style={{ background: 'rgba(217,150,46,0.08)', borderColor: 'rgba(217,150,46,0.25)' }}>
                <AlertTriangle size={14} className="text-[#D9962E] mt-0.5 shrink-0" />
                <p className="text-[12px] text-[var(--sl-t2)] leading-snug">
                  Esta conta está em uso em{' '}
                  <span className="font-bold text-[#D9962E]">{deleteConfirm.usageCount}</span>{' '}
                  {deleteConfirm.usageCount === 1 ? 'transferência' : 'transferências'}.
                </p>
              </div>
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
                style={{ background: '#DB6478' }}
              >
                <span className="flex items-center justify-center gap-1.5">
                  <Trash2 size={13} />
                  {isDeleting ? 'Desativando...' : 'Desativar'}
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
            background: toast.type === 'ok' ? 'rgba(15,118,110,0.1)' : 'rgba(219,100,120,0.1)',
            borderColor: toast.type === 'ok' ? 'rgba(15,118,110,0.25)' : 'rgba(219,100,120,0.25)',
            color: toast.type === 'ok' ? '#0F766E' : '#DB6478',
          }}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
