'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Pencil, Shield, AlertTriangle, Download, Trash2, X, Eye, EyeOff } from 'lucide-react'
import { ToggleSwitch } from '@/components/settings/toggle-switch'
import { cn } from '@/lib/utils'

interface ProfileData {
  full_name: string | null
  currency: string | null
  timezone: string | null
  month_start_day: number | null
  avatar_url: string | null
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function SettingCard({ title, children, danger }: { title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div
      className={cn(
        'border rounded-2xl p-5 mb-3 transition-colors',
        danger
          ? 'bg-[rgba(244,63,94,0.04)] border-[rgba(244,63,94,0.18)]'
          : 'bg-[var(--sl-s1)] border-[var(--sl-border)] hover:border-[var(--sl-border-h)]',
      )}
    >
      <p
        className={cn(
          'text-[11px] font-bold uppercase tracking-[0.06em] mb-4',
          danger ? 'text-[#f43f5e]' : 'text-[var(--sl-t3)]',
        )}
      >
        {title}
      </p>
      {children}
    </div>
  )
}

function SettingRow({
  label,
  description,
  control,
  noBorder,
  icon,
}: {
  label: React.ReactNode
  description?: string
  control: React.ReactNode
  noBorder?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-3',
        !noBorder && 'border-b border-[var(--sl-border)]',
      )}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {icon && <div className="shrink-0 mt-0.5 text-base">{icon}</div>}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{label}</p>
          {description && <p className="text-[11px] text-[var(--sl-t3)] mt-0.5 leading-snug">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

function ProBadge() {
  return (
    <span
      className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md text-white"
      style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
    >
      PRO
    </span>
  )
}

// ─── Alterar Senha Modal ────────────────────────────────────────────────────
function AlterarSenhaModal({ onClose }: { onClose: () => void }) {
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const newValid = newPwd.length >= 8
  const confirmMatch = newPwd === confirmPwd && confirmPwd.length > 0
  const canSubmit = currentPwd.length > 0 && newValid && confirmMatch

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSaving(true)
    setError('')
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({ password: newPwd })
      if (err) { setError(err.message); return }
      setSuccess(true)
      setTimeout(() => onClose(), 1500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-[Syne] font-bold text-[17px] text-[var(--sl-t1)]">Alterar Senha</h3>
          <button onClick={onClose} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-[var(--sl-t2)] mb-5 leading-relaxed">Atualize sua senha de acesso ao SyncLife.</p>

        {success ? (
          <div className="flex items-center gap-2 px-3 py-3 rounded-[10px] bg-[rgba(16,185,129,0.10)] border border-[rgba(16,185,129,0.2)] text-[#10b981] text-[13px]">
            <Check size={15} /> Senha alterada com sucesso!
          </div>
        ) : (
          <>
            {/* Senha atual */}
            <label className="block text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-1.5">Senha atual</label>
            <div className="relative mb-4">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--sl-t1)] outline-none pr-10 transition-colors"
                onFocus={(e) => (e.target.style.borderColor = 'rgba(16,185,129,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = '')}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sl-t3)] hover:text-[var(--sl-t2)]"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {/* Nova senha */}
            <label className="block text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-1.5">Nova senha</label>
            <div className="relative mb-1">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--sl-t1)] outline-none pr-10 transition-colors"
                onFocus={(e) => (e.target.style.borderColor = 'rgba(16,185,129,0.4)')}
                onBlur={(e) => (e.target.style.borderColor = '')}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sl-t3)] hover:text-[var(--sl-t2)]"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {newPwd.length > 0 && (
              <p className={cn('text-[10px] mb-4', newValid ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                {newValid ? '✓ Mínimo 8 caracteres' : '✗ Mínimo 8 caracteres'}
              </p>
            )}

            {/* Confirmar */}
            <label className="block text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-1.5">Confirmar nova senha</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--sl-t1)] outline-none mb-1 transition-colors"
              onFocus={(e) => (e.target.style.borderColor = 'rgba(16,185,129,0.4)')}
              onBlur={(e) => (e.target.style.borderColor = '')}
            />
            {confirmPwd.length > 0 && (
              <p className={cn('text-[10px] mb-4', confirmMatch ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
                {confirmMatch ? '✓ Senhas coincidem' : '✗ Senhas não coincidem'}
              </p>
            )}

            {error && <p className="text-[12px] text-[#f43f5e] mb-3">{error}</p>}

            <div className="flex gap-2.5 mt-2">
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-[10px] bg-[var(--sl-s3)] text-[var(--sl-t2)] text-[14px] font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || saving}
                className="flex-1 py-3 rounded-[10px] bg-[#10b981] text-black text-[14px] font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {saving ? 'Salvando…' : 'Alterar senha'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── ConfirmDialog (genérico) ───────────────────────────────────────────────
function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirmar',
}: {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[20px] p-6 max-w-sm w-full shadow-2xl">
        <h3 className="font-[Syne] font-bold text-[17px] text-[var(--sl-t1)] mb-2">{title}</h3>
        <p className="text-[13px] text-[var(--sl-t2)] mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2.5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-[10px] bg-[var(--sl-s3)] text-[var(--sl-t2)] text-[14px] font-bold"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-[10px] bg-[#10b981] text-black text-[14px] font-bold"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function PerfilPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState('BRL')
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [monthStartDay, setMonthStartDay] = useState(1)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [memberSince, setMemberSince] = useState('')
  const [deleteText, setDeleteText] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  const originalName = useRef('')
  const originalCurrency = useRef('')
  const originalTimezone = useRef('')
  const originalDay = useRef(1)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setEmail(user.email || '')
      setMemberSince(
        new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      )

      const { data } = (await (supabase as any)
        .from('profiles')
        .select('full_name, currency, timezone, month_start_day, avatar_url')
        .eq('id', user.id)
        .single()) as { data: ProfileData | null }

      if (data) {
        const n = data.full_name || ''
        const c = data.currency || 'BRL'
        const tz = data.timezone || 'America/Sao_Paulo'
        const day = data.month_start_day || 1
        setName(n); setCurrency(c); setTimezone(tz); setMonthStartDay(day)
        setAvatarUrl(data.avatar_url || null)
        originalName.current = n; originalCurrency.current = c
        originalTimezone.current = tz; originalDay.current = day
      }
    }
    load()
  }, [])

  const checkDirty = (n: string, c: string, tz: string, day: number) => {
    setIsDirty(
      n !== originalName.current ||
      c !== originalCurrency.current ||
      tz !== originalTimezone.current ||
      day !== originalDay.current,
    )
  }

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const supabase = createClient()
      await (supabase as any)
        .from('profiles')
        .update({ full_name: name, currency, timezone, month_start_day: monthStartDay })
        .eq('id', userId)
      originalName.current = name; originalCurrency.current = currency
      originalTimezone.current = timezone; originalDay.current = monthStartDay
      setIsDirty(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCurrencyChange = (newCurrency: string) => {
    setPendingCurrency(newCurrency)
  }

  const confirmCurrencyChange = () => {
    if (!pendingCurrency) return
    setCurrency(pendingCurrency)
    checkDirty(name, pendingCurrency, timezone, monthStartDay)
    setPendingCurrency(null)
  }

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Arquivo deve ser JPG ou PNG.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Arquivo deve ter no máximo 2MB.')
      return
    }

    setAvatarUploading(true)
    try {
      const supabase = createClient()
      const ext = file.type === 'image/png' ? 'png' : 'jpg'
      const path = `${userId}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) { alert('Erro ao fazer upload.'); return }

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const newUrl = urlData.publicUrl + `?t=${Date.now()}`
      setAvatarUrl(newUrl)

      await (supabase as any).from('profiles').update({ avatar_url: newUrl }).eq('id', userId)
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      profile: { name, email, currency, timezone, monthStartDay },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synclife-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const initials = name ? getInitials(name) : (email ? email[0].toUpperCase() : '?')

  return (
    <div className="max-w-[680px]">
      <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)] mb-1">Perfil</h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-5">
        Gerencie suas informações pessoais e preferências de conta.
      </p>

      {/* ── Identidade ── */}
      <SettingCard title="Identidade">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="relative cursor-pointer shrink-0"
            onClick={handleAvatarClick}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="avatar" className="w-[60px] h-[60px] rounded-full object-cover" />
            ) : (
              <div className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#0ea5e9] to-[#10b981] flex items-center justify-center font-[Syne] font-bold text-[22px] text-white select-none">
                {initials}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-[22px] h-[22px] rounded-full bg-[var(--sl-s2)] border-2 border-[var(--sl-bg)] flex items-center justify-center">
              {avatarUploading ? (
                <span className="w-2.5 h-2.5 border-2 border-[var(--sl-t3)]/30 border-t-[var(--sl-t2)] rounded-full animate-spin" />
              ) : (
                <Pencil size={10} className="text-[var(--sl-t2)]" />
              )}
            </div>
          </div>
          <div>
            <div className="font-semibold text-[15px] text-[var(--sl-t1)]">{name || 'Sem nome'}</div>
            <div className="text-[11px] text-[var(--sl-t3)]">{email}</div>
            <div className="text-[11px] text-[var(--sl-t3)]">Membro desde {memberSince}</div>
          </div>
        </div>

        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarUpload} />

        <div className="mb-4">
          <label className="block text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-1.5">
            Nome completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); checkDirty(e.target.value, currency, timezone, monthStartDay) }}
            placeholder="Seu nome"
            className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[9px] px-3 py-2 text-[13px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)] transition-colors"
            onFocus={(e) => (e.target.style.borderColor = 'rgba(16,185,129,0.4)')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-1.5">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full bg-[var(--sl-s2)]/50 border border-[var(--sl-border)] rounded-[9px] px-3 py-2 text-[13px] text-[var(--sl-t3)] outline-none cursor-not-allowed"
          />
          <p className="text-[10px] text-[var(--sl-t3)] mt-1">O e-mail não pode ser alterado.</p>
        </div>
      </SettingCard>

      {/* ── Preferências Regionais ── */}
      <SettingCard title="Preferências Regionais">
        <SettingRow
          label="Moeda"
          description="Formato dos valores monetários no app"
          control={
            <select
              value={currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[9px] px-2.5 py-1.5 text-[12px] text-[var(--sl-t1)] outline-none cursor-pointer"
            >
              <option value="BRL">R$ Real (BRL)</option>
              <option value="USD">$ Dólar (USD)</option>
              <option value="EUR">€ Euro (EUR)</option>
              <option value="GBP">£ Libra (GBP)</option>
            </select>
          }
        />
        <SettingRow
          label="Fuso horário"
          description="Usado para alertas e eventos agendados"
          control={
            <select
              value={timezone}
              onChange={(e) => { setTimezone(e.target.value); checkDirty(name, currency, e.target.value, monthStartDay) }}
              className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[9px] px-2.5 py-1.5 text-[11px] text-[var(--sl-t1)] outline-none cursor-pointer"
            >
              <option value="America/Sao_Paulo">Sao Paulo (UTC-3)</option>
              <option value="America/Manaus">Manaus (UTC-4)</option>
              <option value="America/Fortaleza">Fortaleza (UTC-3)</option>
              <option value="America/Belem">Belém (UTC-3)</option>
              <option value="America/New_York">New York (UTC-5)</option>
              <option value="Europe/Lisbon">Lisboa (UTC+0)</option>
            </select>
          }
        />
        <SettingRow
          label="Dia de início do mês"
          description="Define quando reiniciam os orçamentos mensais"
          noBorder
          control={
            <select
              value={monthStartDay}
              onChange={(e) => { const d = Number(e.target.value); setMonthStartDay(d); checkDirty(name, currency, timezone, d) }}
              className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[9px] px-2.5 py-1.5 text-[12px] text-[var(--sl-t1)] outline-none cursor-pointer"
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>Dia {d}</option>
              ))}
            </select>
          }
        />
      </SettingCard>

      {/* ── Segurança ── */}
      <SettingCard title="Segurança">
        <SettingRow
          label="Alterar senha"
          description="Atualize sua senha de acesso"
          control={
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-1.5 rounded-[9px] border border-[var(--sl-border)] bg-transparent text-[12px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s2)] transition-colors flex items-center gap-1.5"
            >
              <Shield size={12} /> Alterar
            </button>
          }
        />
        <SettingRow
          label={<>Autenticação em 2 fatores <ProBadge /></>}
          description="Adiciona uma camada extra de segurança à sua conta"
          noBorder
          control={<ToggleSwitch checked={false} onChange={() => {}} disabled />}
        />
      </SettingCard>

      {/* ── Zona de Perigo ── */}
      <SettingCard title="Zona de Perigo" danger>
        <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[rgba(244,63,94,0.1)]">
          <div className="flex items-center gap-3">
            <Download size={16} className="text-[#f43f5e] shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-[var(--sl-t1)]">Exportar meus dados</p>
              <p className="text-[11px] text-[var(--sl-t3)]">Baixe um arquivo JSON com todos os seus dados (LGPD)</p>
            </div>
          </div>
          <button
            onClick={handleExportData}
            className="shrink-0 px-3 py-1.5 rounded-[9px] border border-[rgba(244,63,94,0.25)] text-[12px] font-semibold text-[#f43f5e] hover:bg-[rgba(244,63,94,0.08)] transition-colors"
          >
            Exportar (JSON)
          </button>
        </div>
        <div className="flex items-center justify-between gap-4 py-2.5">
          <div className="flex items-center gap-3">
            <Trash2 size={16} className="text-[#f43f5e] shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-[var(--sl-t1)]">Excluir minha conta</p>
              <p className="text-[11px] text-[var(--sl-t3)]">Ação permanente e irreversível — todos os dados serão removidos</p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="shrink-0 px-3 py-1.5 rounded-[9px] border border-[rgba(244,63,94,0.25)] text-[12px] font-semibold text-[#f43f5e] hover:bg-[rgba(244,63,94,0.08)] transition-colors"
          >
            Excluir conta
          </button>
        </div>
      </SettingCard>

      {/* ── Save bar (flutuante) ── */}
      {isDirty && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-s1)] mb-4">
          <p className="text-[13px] text-[var(--sl-t2)]">Você tem alterações não salvas.</p>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-black text-[13px] font-bold transition-all hover:brightness-110 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
          >
            {isSaving ? (
              <span className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <Check size={14} />
            )}
            Salvar
          </button>
        </div>
      )}
      {saveSuccess && (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-[9px] bg-[rgba(16,185,129,0.10)] border border-[rgba(16,185,129,0.2)] text-[#10b981] text-[13px] mb-4">
          <Check size={14} /> Perfil atualizado com sucesso!
        </div>
      )}

      {/* ── Modais ── */}
      {showPasswordModal && <AlterarSenhaModal onClose={() => setShowPasswordModal(false)} />}

      {pendingCurrency && (
        <ConfirmDialog
          title="Alterar moeda?"
          message="Isso afetará como todos os valores são exibidos. Os valores existentes não serão convertidos automaticamente."
          confirmLabel="Alterar moeda"
          onConfirm={confirmCurrencyChange}
          onCancel={() => setPendingCurrency(null)}
        />
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--sl-s1)] border border-[rgba(244,63,94,0.2)] rounded-[20px] p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center text-[32px] mb-3">⚠️</div>
            <h3 className="font-[Syne] font-bold text-[17px] text-[var(--sl-t1)] text-center mb-2">Excluir sua conta?</h3>
            <p className="text-[13px] text-[var(--sl-t2)] text-center mb-5 leading-relaxed">
              Esta ação é <span className="text-[#f43f5e] font-semibold">permanente e irreversível</span>. Todos os seus dados serão apagados: transações, orçamentos, metas, eventos, categorias e configurações.
            </p>
            <label className="block text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-1.5">
              Digite <span className="text-[#f43f5e]">EXCLUIR</span> para confirmar
            </label>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="EXCLUIR"
              className="w-full bg-[var(--sl-s2)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--sl-t1)] outline-none mb-4 transition-colors"
              style={{ border: '1px solid rgba(244,63,94,0.3)' }}
            />
            <div className="flex gap-2.5">
              <button
                onClick={() => { setShowDeleteDialog(false); setDeleteText('') }}
                className="flex-1 py-3 rounded-[10px] bg-[var(--sl-s3)] text-[var(--sl-t2)] text-[14px] font-bold"
              >
                Cancelar
              </button>
              <button
                disabled={deleteText !== 'EXCLUIR'}
                className="flex-1 py-3 rounded-[10px] bg-[#f43f5e] text-white text-[14px] font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                Excluir minha conta
              </button>
            </div>
            <p className="text-center text-[10px] text-[var(--sl-t3)] mt-3">
              O botão ficará habilitado quando você digitar &quot;EXCLUIR&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
