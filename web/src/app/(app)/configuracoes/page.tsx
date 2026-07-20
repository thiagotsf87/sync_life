'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Check,
  Pencil,
  ArrowRight,
  AlertTriangle,
  Download,
  Trash2,
  X,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react'
import { SectionHeader } from '@/components/ui/section-header'
import { SaveBar } from '@/components/ui/save-bar'
import { DangerZone } from '@/components/ui/danger-zone'
import { ToggleRow } from '@/components/ui/toggle-row'
import { cn } from '@/lib/utils'

interface ProfileData {
  full_name: string | null
  preferred_name: string | null
  phone: string | null
  bio: string | null
  currency: string | null
  timezone: string | null
  month_start_day: number | null
  language: string | null
  date_format: string | null
  week_start: string | null
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

/* ─── FormCard wrapper ─────────────────────────────────────────────────── */
function FormCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <article
      className={cn(
        'bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-6 flex flex-col gap-4',
        className,
      )}
    >
      {children}
    </article>
  )
}

/* ─── Inline Text Field (controlled, uniform with prototype) ──────────── */
function CfgTextField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = 'text',
  readOnly,
  suffix,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  hint?: string
  type?: string
  readOnly?: boolean
  suffix?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[var(--sl-t2)]">{label}</label>
      <div className="flex items-center gap-2 bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3 py-2.5 transition-colors focus-within:border-[var(--sl-border-em)]">
        <input
          type={type}
          value={value}
          placeholder={placeholder}
          readOnly={readOnly}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'flex-1 bg-transparent border-none outline-none font-[DM_Sans] text-[13.5px] placeholder:text-[var(--sl-t3)]',
            readOnly ? 'text-[var(--sl-t3)]' : 'text-[var(--sl-t1)]',
          )}
        />
        {suffix && (
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--sl-em)] font-semibold">
            {suffix}
          </span>
        )}
      </div>
      {hint && <div className="text-[11px] text-[var(--sl-t3)]">{hint}</div>}
    </div>
  )
}

/* ─── Inline Select Field (controlled) ─────────────────────────────────── */
function CfgSelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange?: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-medium text-[var(--sl-t2)]">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3 py-2.5 pr-8 font-[DM_Sans] text-[13.5px] text-[var(--sl-t1)] outline-none appearance-none cursor-pointer transition-colors focus:border-[var(--sl-border-em)]"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[var(--sl-s1)] text-[var(--sl-t1)]">
              {opt.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sl-t3)] pointer-events-none"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  )
}

/* ─── Alterar Senha Modal ─────────────────────────────────────────────── */
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
      if (err) {
        setError(err.message)
        return
      }
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
          <h3 className="font-[Space_Grotesk] font-bold text-[17px] text-[var(--sl-t1)]">
            Alterar senha
          </h3>
          <button onClick={onClose} className="text-[var(--sl-t3)] hover:text-[var(--sl-t1)] transition-colors">
            <X size={18} />
          </button>
        </div>
        <p className="text-[13px] text-[var(--sl-t2)] mb-5 leading-relaxed">
          Atualize sua senha de acesso ao SyncLife.
        </p>

        {success ? (
          <div className="flex items-center gap-2 px-3 py-3 rounded-[10px] bg-[rgba(15,118,110,0.10)] border border-[rgba(15,118,110,0.2)] text-[var(--sl-em)] text-[13px]">
            <Check size={15} /> Senha alterada com sucesso.
          </div>
        ) : (
          <>
            <label className="block text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-1.5">
              Senha atual
            </label>
            <div className="relative mb-4">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--sl-t1)] outline-none pr-10 transition-colors focus:border-[var(--sl-border-em)]"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sl-t3)] hover:text-[var(--sl-t2)]"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <label className="block text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-1.5">
              Nova senha
            </label>
            <div className="relative mb-1">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--sl-t1)] outline-none pr-10 transition-colors focus:border-[var(--sl-border-em)]"
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
              <p
                className={cn('text-[10px] mb-4', newValid ? 'text-[var(--sl-em)]' : 'text-[var(--sl-danger)]')}
              >
                {newValid ? 'Mínimo 8 caracteres ok.' : 'Mínimo 8 caracteres.'}
              </p>
            )}

            <label className="block text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-1.5">
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--sl-t1)] outline-none mb-1 transition-colors focus:border-[var(--sl-border-em)]"
            />
            {confirmPwd.length > 0 && (
              <p
                className={cn(
                  'text-[10px] mb-4',
                  confirmMatch ? 'text-[var(--sl-em)]' : 'text-[var(--sl-danger)]',
                )}
              >
                {confirmMatch ? 'Senhas coincidem.' : 'Senhas não coincidem.'}
              </p>
            )}

            {error && <p className="text-[12px] text-[var(--sl-danger)] mb-3">{error}</p>}

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
                className="flex-1 py-3 rounded-[10px] bg-[var(--sl-em)] text-white text-[14px] font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                {saving ? 'Salvando...' : 'Alterar senha'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── ConfirmDialog (genérico) ────────────────────────────────────────── */
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
        <h3 className="font-[Space_Grotesk] font-bold text-[17px] text-[var(--sl-t1)] mb-2">{title}</h3>
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
            className="flex-1 py-3 rounded-[10px] bg-[var(--sl-em)] text-white text-[14px] font-bold"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Page ───────────────────────────────────────────────────────── */
export default function PerfilPage() {
  // Profile fields
  const [name, setName] = useState('')
  const [preferredName, setPreferredName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  // Localidade
  const [language, setLanguage] = useState('pt-BR')
  const [timezone, setTimezone] = useState('America/Sao_Paulo')
  const [currency, setCurrency] = useState('BRL')
  const [dateFormat, setDateFormat] = useState('dd/mm/yyyy')
  const [weekStart, setWeekStart] = useState('monday')
  // Segurança (toggles)
  const [twoFa, setTwoFa] = useState(true)
  const [rememberSession, setRememberSession] = useState(true)
  const [notifyLogin, setNotifyLogin] = useState(false)
  // Privacidade
  const [publicRanking, setPublicRanking] = useState(true)
  const [allowFriends, setAllowFriends] = useState(true)
  const [shareAchievements, setShareAchievements] = useState(false)
  const [searchable, setSearchable] = useState(false)
  // Avatar/meta
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [memberSince, setMemberSince] = useState('')
  const [memberSinceShort, setMemberSinceShort] = useState('')
  const [userLocation, setUserLocation] = useState('São Paulo')

  // Plan badge (uses existing hook — pode estar carregando)
  const [isPro, setIsPro] = useState(false)

  // Dirty / saving state
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [deleteText, setDeleteText] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [pendingCurrency, setPendingCurrency] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  // Originals (for dirty tracking + discard)
  const originals = useRef({
    name: '',
    preferredName: '',
    phone: '',
    bio: '',
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    currency: 'BRL',
    dateFormat: 'dd/mm/yyyy',
    weekStart: 'monday',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  /* ── Load profile ─────────────────────────────────────────────── */
  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      setEmail(user.email || '')
      const created = new Date(user.created_at)
      setMemberSince(
        created.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }),
      )
      setMemberSinceShort(
        created.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).toUpperCase(),
      )

      const { data } = (await (supabase as any)
        .from('profiles')
        .select(
          'full_name, preferred_name, phone, bio, currency, timezone, month_start_day, language, date_format, week_start, avatar_url, plan_type',
        )
        .eq('id', user.id)
        .single()) as { data: (ProfileData & { plan_type?: string }) | null }

      if (data) {
        const next = {
          name: data.full_name || '',
          preferredName: data.preferred_name || '',
          phone: data.phone || '',
          bio: data.bio || '',
          language: data.language || 'pt-BR',
          timezone: data.timezone || 'America/Sao_Paulo',
          currency: data.currency || 'BRL',
          dateFormat: data.date_format || 'dd/mm/yyyy',
          weekStart: data.week_start || 'monday',
        }
        setName(next.name)
        setPreferredName(next.preferredName)
        setPhone(next.phone)
        setBio(next.bio)
        setLanguage(next.language)
        setTimezone(next.timezone)
        setCurrency(next.currency)
        setDateFormat(next.dateFormat)
        setWeekStart(next.weekStart)
        setAvatarUrl(data.avatar_url || null)
        setIsPro(data.plan_type === 'pro')
        originals.current = next
      }
    }
    load()
  }, [])

  /* ── Dirty checker ────────────────────────────────────────────── */
  useEffect(() => {
    const o = originals.current
    const dirty =
      name !== o.name ||
      preferredName !== o.preferredName ||
      phone !== o.phone ||
      bio !== o.bio ||
      language !== o.language ||
      timezone !== o.timezone ||
      currency !== o.currency ||
      dateFormat !== o.dateFormat ||
      weekStart !== o.weekStart
    setIsDirty(dirty)
  }, [name, preferredName, phone, bio, language, timezone, currency, dateFormat, weekStart])

  /* ── Discard / Save ───────────────────────────────────────────── */
  const handleDiscard = () => {
    const o = originals.current
    setName(o.name)
    setPreferredName(o.preferredName)
    setPhone(o.phone)
    setBio(o.bio)
    setLanguage(o.language)
    setTimezone(o.timezone)
    setCurrency(o.currency)
    setDateFormat(o.dateFormat)
    setWeekStart(o.weekStart)
  }

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const supabase = createClient()
      await (supabase as any)
        .from('profiles')
        .update({
          full_name: name,
          preferred_name: preferredName,
          phone,
          bio,
          language,
          timezone,
          currency,
          date_format: dateFormat,
          week_start: weekStart,
        })
        .eq('id', userId)

      originals.current = {
        name,
        preferredName,
        phone,
        bio,
        language,
        timezone,
        currency,
        dateFormat,
        weekStart,
      }
      setIsDirty(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  /* ── Currency: confirm before applying ────────────────────────── */
  const handleCurrencyChange = (newCurrency: string) => {
    if (newCurrency === currency) return
    setPendingCurrency(newCurrency)
  }

  const confirmCurrencyChange = () => {
    if (!pendingCurrency) return
    setCurrency(pendingCurrency)
    setPendingCurrency(null)
  }

  /* ── Avatar upload ────────────────────────────────────────────── */
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
      if (uploadError) {
        alert('Erro ao fazer upload.')
        return
      }

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
      profile: { name, preferredName, email, phone, bio, currency, timezone, language },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synclife-export-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const initials = name ? getInitials(name) : email ? email[0].toUpperCase() : '?'

  return (
    <div className="max-w-[980px] py-2 pb-28 flex flex-col gap-5">
      {/* ─── TopBar ────────────────────────────────────────────── */}
      <header>
        <p className="font-[DM_Sans] text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5">
          CONFIGURAÇÕES · PERFIL
        </p>
        <h1 className="font-[Space_Grotesk] font-bold text-[32px] tracking-[-0.02em] text-[var(--sl-t1)]">
          Seu perfil
        </h1>
      </header>

      {/* ─── Profile Hero ──────────────────────────────────────── */}
      <article
        className="border border-[var(--sl-border)] rounded-[22px] px-7 py-6 flex items-center gap-5 max-md:flex-col max-md:items-start"
        style={{
          background:
            'radial-gradient(circle at 20% 0%, var(--sl-em-soft) 0%, transparent 55%), var(--sl-s-hero, var(--sl-s1))',
        }}
      >
        {/* Avatar */}
        <div className="relative shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-[88px] h-[88px] rounded-full object-cover border-[3px] border-[var(--sl-s-hero,var(--sl-s1))]"
              style={{ boxShadow: '0 8px 32px -8px rgba(0,0,0,0.5)' }}
            />
          ) : (
            <div
              className="w-[88px] h-[88px] rounded-full flex items-center justify-center font-[Space_Grotesk] font-bold text-[38px] tracking-[-0.02em] select-none border-[3px] border-[var(--sl-s-hero,var(--sl-s1))]"
              style={{
                background: 'linear-gradient(135deg, #1F8A8A 0%, #3D6BD9 100%)',
                color: '#0B0F14',
                boxShadow: '0 8px 32px -8px rgba(0,0,0,0.5)',
              }}
            >
              {initials}
            </div>
          )}
          {/* Pencil overlay btn */}
          <button
            onClick={handleAvatarClick}
            className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-[var(--sl-s1)] border border-[var(--sl-border-h)] text-[var(--sl-t1)] flex items-center justify-center cursor-pointer hover:bg-[var(--sl-s2)] transition-colors"
          >
            {avatarUploading ? (
              <span className="w-3 h-3 border-2 border-[var(--sl-t3)]/30 border-t-[var(--sl-t2)] rounded-full animate-spin" />
            ) : (
              <Pencil size={11} />
            )}
          </button>
          {/* online dot */}
          <span className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#10b981] border-2 border-[var(--sl-s-hero,var(--sl-s1))]" />
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleAvatarUpload}
        />

        {/* Identity */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sl-em)] mb-1">
            {isPro ? 'PRO' : 'FREE'} · DESDE {memberSinceShort}
          </p>
          <h2 className="font-[Space_Grotesk] font-semibold text-[28px] tracking-[-0.02em] text-[var(--sl-t1)] m-0 truncate">
            {name || 'Sem nome'}
          </h2>
          <p className="font-[DM_Sans] text-[13.5px] text-[var(--sl-t3)] mt-1 truncate">
            {email} · {userLocation} · membro desde {memberSince}
          </p>
        </div>

        {/* Ghost CTA */}
        <button
          className="shrink-0 px-[18px] py-[9px] bg-transparent border border-[var(--sl-border)] rounded-full text-[var(--sl-t1)] text-[13px] font-medium inline-flex items-center gap-1.5 cursor-pointer hover:border-[var(--sl-border-h)] transition-colors"
        >
          Ver perfil público <ArrowRight size={11} />
        </button>
      </article>

      {/* ─── 01 · IDENTIDADE ───────────────────────────────────── */}
      <FormCard>
        <SectionHeader
          eyebrow="01 · IDENTIDADE"
          title="Informações pessoais"
          sub="Como você quer ser identificado dentro do SyncLife."
        />
        <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
          <CfgTextField
            label="Nome completo"
            value={name}
            onChange={setName}
            placeholder="Seu nome"
          />
          <CfgTextField
            label="Como prefere ser chamado"
            value={preferredName}
            onChange={setPreferredName}
            placeholder="Apelido"
            hint="Aparece nas saudações e mensagens."
          />
        </div>
        <div className="grid grid-cols-[1.4fr_1fr] gap-3.5 max-sm:grid-cols-1">
          <CfgTextField
            label="E-mail"
            value={email}
            readOnly
            suffix={<><Check size={11} /> verificado</>}
            hint="Você não pode alterar, fale com o suporte."
          />
          <CfgTextField
            label="Telefone"
            value={phone}
            onChange={setPhone}
            placeholder="+55 11 9 0000 0000"
            hint="Usado apenas para 2FA."
          />
        </div>
        <CfgTextField
          label="Bio (opcional)"
          value={bio}
          onChange={setBio}
          placeholder="Em uma frase, o que você está construindo agora..."
          hint="Aparece no seu perfil público de Conquistas."
        />
      </FormCard>

      {/* ─── 02 · LOCALIDADE ───────────────────────────────────── */}
      <FormCard>
        <SectionHeader
          eyebrow="02 · LOCALIDADE"
          title="Idioma, fuso e formato"
          sub="Como números, datas e horários aparecem em todo o app."
        />
        <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
          <CfgSelectField
            label="Idioma"
            value={language}
            onChange={setLanguage}
            options={[
              { value: 'pt-BR', label: 'Português (Brasil)' },
              { value: 'en-US', label: 'English (US)' },
              { value: 'es-ES', label: 'Español' },
            ]}
          />
          <CfgSelectField
            label="Fuso horário"
            value={timezone}
            onChange={setTimezone}
            options={[
              { value: 'America/Sao_Paulo', label: '(GMT-03) São Paulo' },
              { value: 'America/Manaus', label: '(GMT-04) Manaus' },
              { value: 'America/Fortaleza', label: '(GMT-03) Fortaleza' },
              { value: 'America/Belem', label: '(GMT-03) Belém' },
              { value: 'America/New_York', label: '(GMT-05) New York' },
              { value: 'Europe/Lisbon', label: '(GMT+00) Lisboa' },
            ]}
          />
        </div>
        <div className="grid grid-cols-3 gap-3.5 max-sm:grid-cols-1">
          <CfgSelectField
            label="Moeda padrão"
            value={currency}
            onChange={handleCurrencyChange}
            options={[
              { value: 'BRL', label: 'R$ Real (BRL)' },
              { value: 'USD', label: '$ Dólar (USD)' },
              { value: 'EUR', label: '€ Euro (EUR)' },
              { value: 'GBP', label: '£ Libra (GBP)' },
            ]}
          />
          <CfgSelectField
            label="Formato de data"
            value={dateFormat}
            onChange={setDateFormat}
            options={[
              { value: 'dd/mm/yyyy', label: 'dd/mm/aaaa' },
              { value: 'mm/dd/yyyy', label: 'mm/dd/aaaa' },
              { value: 'yyyy-mm-dd', label: 'aaaa-mm-dd' },
            ]}
          />
          <CfgSelectField
            label="Primeiro dia da semana"
            value={weekStart}
            onChange={setWeekStart}
            options={[
              { value: 'monday', label: 'Segunda-feira' },
              { value: 'sunday', label: 'Domingo' },
              { value: 'saturday', label: 'Sábado' },
            ]}
          />
        </div>
      </FormCard>

      {/* ─── 03 · SEGURANÇA ────────────────────────────────────── */}
      <FormCard>
        <SectionHeader
          eyebrow="03 · SEGURANÇA"
          title="Acesso à conta"
          sub="Senha, autenticação em duas etapas e sessões ativas."
        />
        <div className="grid grid-cols-[1fr_auto] gap-3.5 items-end">
          <CfgTextField label="Senha" value="••••••••••••" readOnly />
          <button
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-[9px] bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-[10px] text-[var(--sl-t1)] text-[13px] font-medium cursor-pointer hover:border-[var(--sl-border-h)] transition-colors inline-flex items-center gap-1.5"
          >
            <Shield size={13} /> Trocar senha
          </button>
        </div>
        <div className="border-t border-[var(--sl-border)] pt-1.5">
          <ToggleRow
            label="Autenticação em duas etapas (2FA)"
            sub="Receba um código no seu telefone toda vez que entrar de um novo dispositivo."
            checked={twoFa}
            onChange={setTwoFa}
          />
          <ToggleRow
            label="Sessão lembrada por 30 dias"
            sub="Você pode revogar sessões a qualquer momento."
            checked={rememberSession}
            onChange={setRememberSession}
          />
          <ToggleRow
            label="Notificar tentativas de login"
            sub="E-mail quando alguém tentar entrar de fora do Brasil."
            checked={notifyLogin}
            onChange={setNotifyLogin}
          />
        </div>
      </FormCard>

      {/* ─── 04 · PRIVACIDADE ─────────────────────────────────── */}
      <FormCard>
        <SectionHeader
          eyebrow="04 · PRIVACIDADE"
          title="O que outros podem ver"
          sub="Controla seu perfil público de Conquistas e Ranking."
        />
        <div>
          <ToggleRow
            label="Mostrar meu nome no ranking público"
            checked={publicRanking}
            onChange={setPublicRanking}
          />
          <ToggleRow
            label="Permitir solicitações de amizade"
            checked={allowFriends}
            onChange={setAllowFriends}
          />
          <ToggleRow
            label="Compartilhar conquistas no feed dos amigos"
            checked={shareAchievements}
            onChange={setShareAchievements}
          />
          <ToggleRow
            label="Aparecer em buscas pelo nome"
            checked={searchable}
            onChange={setSearchable}
          />
        </div>
      </FormCard>

      {/* ─── 05 · ZONA DE PERIGO ──────────────────────────────── */}
      <DangerZone title="05 · ZONA DE PERIGO">
        <div className="flex items-center justify-between gap-4 py-2 border-b border-[var(--sl-border)]">
          <div className="flex items-center gap-3">
            <Download size={16} className="text-[var(--sl-danger)] shrink-0" />
            <div>
              <p className="text-[13.5px] font-semibold text-[var(--sl-t1)]">
                Exportar todos os meus dados
              </p>
              <p className="text-[12px] text-[var(--sl-t3)] mt-0.5">
                Receba um arquivo .zip com tudo (LGPD).
              </p>
            </div>
          </div>
          <button
            onClick={handleExportData}
            className="shrink-0 px-3.5 py-[7px] bg-transparent border border-[var(--sl-border)] rounded-full text-[var(--sl-t1)] text-[12px] font-medium cursor-pointer hover:border-[var(--sl-border-h)] transition-colors"
          >
            Solicitar
          </button>
        </div>
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <Trash2 size={16} className="text-[var(--sl-danger)] shrink-0" />
            <div>
              <p className="text-[13.5px] font-semibold text-[var(--sl-danger)]">
                Excluir conta permanentemente
              </p>
              <p className="text-[12px] text-[var(--sl-t3)] mt-0.5">
                Esta ação é irreversível. Todos os seus dados serão apagados em até 30 dias.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="shrink-0 px-3.5 py-[7px] rounded-full text-[12px] font-semibold cursor-pointer transition-colors"
            style={{
              background: 'rgba(219,100,120,0.10)',
              border: '1px solid rgba(219,100,120,0.30)',
              color: 'var(--sl-danger)',
            }}
          >
            Excluir conta
          </button>
        </div>
      </DangerZone>

      {/* ─── SaveBar sticky (G-08) ────────────────────────────── */}
      <SaveBar
        hasChanges={isDirty}
        onSave={handleSave}
        onDiscard={handleDiscard}
        saving={isSaving}
      />

      {saveSuccess && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-3 py-2.5 rounded-[9px] bg-[rgba(15,118,110,0.10)] border border-[rgba(15,118,110,0.2)] text-[var(--sl-em)] text-[13px]">
          <Check size={14} /> Perfil atualizado com sucesso.
        </div>
      )}

      {/* ─── Modais ───────────────────────────────────────────── */}
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
          <div className="bg-[var(--sl-s1)] border border-[rgba(219,100,120,0.25)] rounded-[20px] p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-center mb-3">
              <AlertTriangle size={32} className="text-[var(--sl-danger)]" />
            </div>
            <h3 className="font-[Space_Grotesk] font-bold text-[17px] text-[var(--sl-t1)] text-center mb-2">
              Excluir sua conta?
            </h3>
            <p className="text-[13px] text-[var(--sl-t2)] text-center mb-5 leading-relaxed">
              Esta ação é{' '}
              <span className="text-[var(--sl-danger)] font-semibold">permanente e irreversível</span>.
              Todos os seus dados serão apagados: transações, orçamentos, metas, eventos, categorias
              e configurações.
            </p>
            <label className="block text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sl-t3)] mb-1.5">
              Digite <span className="text-[var(--sl-danger)]">EXCLUIR</span> para confirmar
            </label>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="EXCLUIR"
              className="w-full bg-[var(--sl-s2)] rounded-[10px] px-3 py-2.5 text-[14px] text-[var(--sl-t1)] outline-none mb-4 transition-colors"
              style={{ border: '1px solid rgba(219,100,120,0.3)' }}
            />
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setShowDeleteDialog(false)
                  setDeleteText('')
                }}
                className="flex-1 py-3 rounded-[10px] bg-[var(--sl-s3)] text-[var(--sl-t2)] text-[14px] font-bold"
              >
                Cancelar
              </button>
              <button
                disabled={deleteText !== 'EXCLUIR'}
                className="flex-1 py-3 rounded-[10px] text-[14px] font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                style={{
                  background: 'rgba(219,100,120,0.10)',
                  color: 'var(--sl-danger)',
                  border: '1px solid rgba(219,100,120,0.25)',
                }}
              >
                Excluir minha conta
              </button>
            </div>
            <p className="text-center text-[10px] text-[var(--sl-t3)] mt-3">
              O botão ficará habilitado quando você digitar &quot;EXCLUIR&quot;.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
