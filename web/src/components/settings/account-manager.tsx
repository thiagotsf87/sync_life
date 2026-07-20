'use client'

import { useState } from 'react'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Check,
  Landmark,
  Wallet,
  PiggyBank,
  TrendingUp,
  CreditCard,
  Building2,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAccounts, type CreateAccountData } from '@/hooks/use-accounts'
import { BANK_PRESETS, ACCOUNT_TYPE_LABELS } from '@/constants/bank-presets'
import { createClient } from '@/lib/supabase/client'
import { SLCard } from '@/components/ui/sl-card'
import { SectionHeader } from '@/components/ui/section-header'
import { TextField } from '@/components/ui/text-field'
import { SelectField } from '@/components/ui/select-field'
import { DangerZone } from '@/components/ui/danger-zone'

// Paleta v3 — cores dessaturadas para personalização de conta
const PRESET_COLORS = [
  '#0F766E', '#4F88D4', '#8B7BD4', '#C76795',
  '#D97534', '#D9962E', '#DB6478', '#3CA0B5',
  '#6B6FD4', '#1FA67A', '#6F7986', '#0B2D34',
]

// Ícones Lucide tinted (G-07 — sem emoji em chrome)
const PRESET_ICONS = [
  { id: 'landmark', Icon: Landmark, label: 'Banco' },
  { id: 'wallet', Icon: Wallet, label: 'Carteira' },
  { id: 'piggy', Icon: PiggyBank, label: 'Poupança' },
  { id: 'trend', Icon: TrendingUp, label: 'Investimento' },
  { id: 'card', Icon: CreditCard, label: 'Cartão' },
  { id: 'building', Icon: Building2, label: 'Instituição' },
]

const ACCOUNT_TYPES: { value: CreateAccountData['type']; label: string }[] = [
  { value: 'checking', label: 'Conta corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'investment', label: 'Investimento' },
  { value: 'wallet', label: 'Carteira' },
]

// Map persiste emoji legacy para backwards compat, mas exibe icon Lucide quando reconhece
const LEGACY_ICON_FALLBACK: Record<string, typeof Landmark> = {
  '🏦': Landmark,
  '💳': CreditCard,
  '💰': PiggyBank,
  '🟣': Landmark,
  '🟠': Landmark,
  '🔴': Landmark,
  '🟡': Landmark,
  '🔵': Landmark,
  '⚫': Landmark,
  '🟢': Wallet,
  '💵': Wallet,
  '📊': TrendingUp,
}

function renderAccountIcon(icon: string, size = 16, color?: string) {
  // tenta encontrar nos PRESET_ICONS por id
  const preset = PRESET_ICONS.find((p) => p.id === icon)
  if (preset) {
    const Icon = preset.Icon
    return <Icon size={size} style={{ color }} />
  }
  // fallback para emojis legacy salvos no DB
  const FallbackIcon = LEGACY_ICON_FALLBACK[icon] ?? Landmark
  return <FallbackIcon size={size} style={{ color }} />
}

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
  icon: 'landmark',
  color: '#0F766E',
}

export function AccountManager() {
  const { accounts, isLoading, createAccount, updateAccount, deleteAccount } = useAccounts()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<AccountFormState>(DEFAULT_FORM)
  const [isSaving, setIsSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{
    id: string
    name: string
    usageCount: number | null
  } | null>(null)
  const [isCheckingUsage, setIsCheckingUsage] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const addedBanks = new Set(accounts.map((a) => a.bank))

  const openNewForm = () => {
    setEditingId(null)
    setForm(DEFAULT_FORM)
    setIsFormOpen(true)
  }

  const openEditForm = (acc: typeof accounts[0]) => {
    setEditingId(acc.id)
    setForm({
      name: acc.name,
      bank: acc.bank,
      type: acc.type,
      icon: acc.icon,
      color: acc.color,
    })
    setIsFormOpen(true)
  }

  const handleQuickAdd = async (preset: typeof BANK_PRESETS[0]) => {
    if (addedBanks.has(preset.bank)) return
    try {
      await createAccount({
        name: preset.bank,
        bank: preset.bank,
        type: preset.type,
        icon: 'landmark',
        color: preset.color,
      })
      showToast(`${preset.bank} adicionado.`)
    } catch {
      showToast('Erro ao adicionar conta', 'err')
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast('Preencha o nome da conta', 'err')
      return
    }
    if (!form.bank.trim()) {
      showToast('Preencha o banco', 'err')
      return
    }
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
        showToast('Conta atualizada.')
      } else {
        await createAccount({
          name: form.name.trim(),
          bank: form.bank.trim(),
          type: form.type,
          icon: form.icon,
          color: form.color,
        })
        showToast('Conta criada.')
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
      const { count: fromCount } = (await sb
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('account_from_id', acc.id)) as { count: number | null }
      const { count: toCount } = (await sb
        .from('transactions')
        .select('id', { count: 'exact', head: true })
        .eq('account_to_id', acc.id)) as { count: number | null }
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
      showToast('Conta desativada.')
      setDeleteConfirm(null)
    } catch {
      showToast('Erro ao excluir conta', 'err')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* 01 · Quick-add presets */}
        <SLCard hover className="!p-5">
          <SectionHeader
            eyebrow="01 · ADICIONAR RAPIDAMENTE"
            title="Bancos populares"
            sub="Toque em um banco para criar a conta instantaneamente."
            className="mb-4"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {BANK_PRESETS.map((preset) => {
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
                      : 'bg-[var(--sl-s1)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)] hover:-translate-y-px active:scale-[0.98]',
                  )}
                >
                  <span
                    className="w-7 h-7 rounded-[8px] flex items-center justify-center shrink-0"
                    style={{ background: preset.color + '22' }}
                  >
                    <Landmark size={13} style={{ color: preset.color }} />
                  </span>
                  <span className="text-[12px] font-medium text-[var(--sl-t1)] truncate flex-1">
                    {preset.bank}
                  </span>
                  {isAdded && <Check size={12} className="text-[var(--sl-em)] shrink-0" />}
                </button>
              )
            })}
          </div>
        </SLCard>

        {/* 02 · Lista de contas */}
        <SLCard hover className="!p-5">
          <div className="flex items-center justify-between gap-2 mb-4">
            <SectionHeader
              eyebrow="02 · SUAS CONTAS"
              title="Contas cadastradas"
              sub={`${accounts.length} ${accounts.length === 1 ? 'conta ativa' : 'contas ativas'}`}
            />
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[52px] rounded-xl bg-[var(--sl-s3)] animate-pulse" />
              ))}
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <span className="inline-flex w-12 h-12 rounded-full items-center justify-center bg-[var(--sl-s2)] mb-2">
                <Landmark size={20} className="text-[var(--sl-t3)]" />
              </span>
              <p className="text-[13px] text-[var(--sl-t2)] mb-1">Nenhuma conta cadastrada</p>
              <p className="text-[11px] text-[var(--sl-t3)]">Use os presets acima ou crie manualmente.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="group flex items-center gap-2.5 p-2.5 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)] transition-colors hover:border-[var(--sl-border-h)]"
                >
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                    style={{ background: acc.color + '22' }}
                  >
                    {renderAccountIcon(acc.icon, 16, acc.color)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[var(--sl-t1)] truncate">{acc.name}</p>
                    <p className="text-[10px] text-[var(--sl-t3)]">
                      {acc.bank} · {ACCOUNT_TYPE_LABELS[acc.type] ?? acc.type}
                    </p>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: acc.color }} />
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      onClick={() => openEditForm(acc)}
                      aria-label="Editar conta"
                      className="p-1.5 rounded-md text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s3)] transition-colors"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(acc)}
                      disabled={isCheckingUsage}
                      aria-label="Excluir conta"
                      className="p-1.5 rounded-md text-[var(--sl-t3)] hover:text-[var(--sl-danger)] hover:bg-[var(--sl-s3)] transition-colors disabled:opacity-40"
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
            className="flex items-center justify-center gap-2 w-full mt-3 p-2.5 rounded-xl border border-dashed border-[var(--sl-border-h)] text-[var(--sl-t3)] hover:text-[var(--sl-em)] hover:border-[var(--sl-border-em)] hover:bg-[rgba(15,118,110,0.04)] transition-all text-[12px] font-medium min-h-[44px]"
          >
            <Plus size={14} />
            Nova conta manual
          </button>
        </SLCard>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-[Syne] font-bold text-base text-[var(--sl-t1)]">
                {editingId ? 'Editar conta' : 'Nova conta'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                aria-label="Fechar"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--sl-t3)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <TextField
                label="Nome da conta"
                placeholder="Ex: Nubank principal"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />

              <TextField
                label="Banco / instituição"
                placeholder="Ex: Nubank"
                value={form.bank}
                onChange={(e) => setForm((f) => ({ ...f, bank: e.target.value }))}
              />

              <SelectField
                label="Tipo"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as CreateAccountData['type'] }))
                }
                options={ACCOUNT_TYPES}
              />

              {/* Ícone */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                  Ícone
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {PRESET_ICONS.map(({ id, Icon, label }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, icon: id }))}
                      aria-label={label}
                      className={cn(
                        'h-9 flex items-center justify-center rounded-[9px] transition-all',
                        form.icon === id
                          ? 'bg-[rgba(15,118,110,0.15)] ring-2 ring-[var(--sl-border-em)]'
                          : 'bg-[var(--sl-s2)] hover:ring-1 hover:ring-[var(--sl-border-h)]',
                      )}
                    >
                      <Icon
                        size={14}
                        className={form.icon === id ? 'text-[var(--sl-em)]' : 'text-[var(--sl-t2)]'}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Cor */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)]">
                  Cor
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, color }))}
                      aria-label={`Cor ${color}`}
                      className={cn(
                        'h-8 rounded-[9px] transition-all',
                        form.color === color
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-[var(--sl-s1)] scale-110'
                          : 'hover:scale-110',
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-2.5 p-2.5 bg-[var(--sl-s2)] rounded-xl border border-[var(--sl-border)]">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: form.color + '22' }}
                >
                  {renderAccountIcon(form.icon, 16, form.color)}
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
                className="flex-1 px-4 py-2 rounded-[9px] border border-[var(--sl-border)] bg-transparent text-[13px] font-semibold text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 px-4 py-2 rounded-[9px] text-white text-[13px] font-bold transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5"
                style={{ background: 'var(--sl-em)' }}
              >
                {isSaving && <Loader2 size={13} className="animate-spin" />}
                {isSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal — DangerZone style */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <DangerZone title="DESATIVAR CONTA" className="!p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-[var(--sl-danger)] shrink-0" />
                <h3 className="font-[Syne] font-bold text-base text-[var(--sl-t1)]">
                  Desativar conta?
                </h3>
              </div>

              <p className="text-[13px] text-[var(--sl-t2)] mb-3 font-[DM_Sans]">
                A conta <strong>&quot;{deleteConfirm.name}&quot;</strong> será desativada. Transferências existentes não serão afetadas.
              </p>

              {deleteConfirm.usageCount !== null && deleteConfirm.usageCount > 0 && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl border mb-4"
                  style={{ background: 'rgba(217,150,46,0.08)', borderColor: 'rgba(217,150,46,0.25)' }}
                >
                  <AlertTriangle size={14} className="text-[var(--sl-warning)] mt-0.5 shrink-0" />
                  <p className="text-[12px] text-[var(--sl-t2)] leading-snug font-[DM_Sans]">
                    Esta conta está em uso em{' '}
                    <span className="sl-num-strong text-[var(--sl-warning)]">
                      {deleteConfirm.usageCount}
                    </span>{' '}
                    {deleteConfirm.usageCount === 1 ? 'transferência' : 'transferências'}.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-[9px] border border-[var(--sl-border)] bg-transparent text-[13px] font-semibold text-[var(--sl-t2)] hover:bg-[var(--sl-s2)] transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 rounded-[9px] text-white text-[13px] font-bold transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5"
                  style={{ background: 'var(--sl-danger)' }}
                >
                  {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  {isDeleting ? 'Desativando...' : 'Desativar'}
                </button>
              </div>
            </DangerZone>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-2.5 rounded-xl border shadow-lg text-[13px] font-medium font-[DM_Sans]"
          style={{
            background: toast.type === 'ok' ? 'rgba(15,118,110,0.1)' : 'rgba(219,100,120,0.1)',
            borderColor: toast.type === 'ok' ? 'rgba(15,118,110,0.25)' : 'rgba(219,100,120,0.25)',
            color: toast.type === 'ok' ? 'var(--sl-em)' : 'var(--sl-danger)',
          }}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
