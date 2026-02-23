'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, Pencil, Shield, AlertTriangle, Download, Trash2 } from 'lucide-react'
import { ToggleSwitch } from '@/components/settings/toggle-switch'

interface ProfileData {
  full_name: string | null
  currency: string | null
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Reusable card wrapper
function SettingCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-5 mb-3 transition-colors hover:border-[var(--sl-border-h)]">
      <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-4">{title}</p>
      {children}
    </div>
  )
}

// Reusable setting row
function SettingRow({
  label,
  description,
  control,
  noBorder,
}: {
  label: string
  description?: string
  control: React.ReactNode
  noBorder?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 py-3 ${
        noBorder ? '' : 'border-b border-[var(--sl-border)]'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--sl-t1)]">{label}</p>
        {description && <p className="text-[11px] text-[var(--sl-t3)] mt-0.5 leading-snug">{description}</p>}
      </div>
      <div className="shrink-0">{control}</div>
    </div>
  )
}

export default function PerfilPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState('BRL')
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [memberSince, setMemberSince] = useState('')
  const [deleteText, setDeleteText] = useState('')
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const originalName = useRef('')
  const originalCurrency = useRef('')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)
      setEmail(user.email || '')
      setMemberSince(
        new Date(user.created_at).toLocaleDateString('pt-BR', {
          month: 'long',
          year: 'numeric',
        }),
      )

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = (await (supabase as any)
        .from('profiles')
        .select('full_name, currency')
        .eq('id', user.id)
        .single()) as { data: ProfileData | null }

      if (data) {
        const n = data.full_name || ''
        const c = data.currency || 'BRL'
        setName(n)
        setCurrency(c)
        originalName.current = n
        originalCurrency.current = c
      }
    }
    load()
  }, [])

  const markDirty = (n: string, c: string) => {
    setIsDirty(n !== originalName.current || c !== originalCurrency.current)
  }

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const supabase = createClient()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from('profiles')
        .update({ full_name: name, currency })
        .eq('id', userId)
      originalName.current = name
      originalCurrency.current = currency
      setIsDirty(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } finally {
      setIsSaving(false)
    }
  }

  const initials = name ? getInitials(name) : (email ? email[0].toUpperCase() : '?')

  return (
    <div className="max-w-[680px]">
      {/* Section header */}
      <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)] mb-1">Perfil</h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-6">
        Gerencie suas informações pessoais e preferências de conta.
      </p>

      {/* Avatar + basic info */}
      <SettingCard title="Identidade">
        <div className="flex items-center gap-4 mb-5">
          <div className="relative cursor-pointer">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10b981] to-[#0055ff] flex items-center justify-center font-[Syne] font-bold text-2xl text-white select-none">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-[22px] h-[22px] rounded-full bg-[var(--sl-s3)] border-2 border-[var(--sl-bg)] flex items-center justify-center">
              <Pencil size={10} className="text-[var(--sl-t2)]" />
            </div>
          </div>
          <div>
            <h3 className="font-[Syne] font-bold text-base text-[var(--sl-t1)]">
              {name || 'Sem nome'}
            </h3>
            <p className="text-[12px] text-[var(--sl-t3)]">
              {email} · Membro desde {memberSince}
            </p>
          </div>
        </div>

        {/* Name input */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-1.5">
            Nome completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              markDirty(e.target.value, currency)
            }}
            placeholder="Seu nome"
            className="w-full bg-[var(--sl-s3)] border border-[var(--sl-border)] rounded-[9px] px-3 py-2 text-[13px] text-[var(--sl-t1)] outline-none placeholder:text-[var(--sl-t3)] transition-colors"
            style={{ '--tw-ring-shadow': 'none' } as React.CSSProperties}
            onFocus={(e) => (e.target.style.borderColor = 'rgba(16,185,129,0.4)')}
            onBlur={(e) => (e.target.style.borderColor = '')}
          />
        </div>

        {/* Email input (read-only) */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-1.5">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full bg-[var(--sl-s3)]/50 border border-[var(--sl-border)] rounded-[9px] px-3 py-2 text-[13px] text-[var(--sl-t3)] outline-none cursor-not-allowed"
          />
          <p className="text-[11px] text-[var(--sl-t3)] mt-1">O e-mail não pode ser alterado</p>
        </div>

        {isDirty && (
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-white text-[13px] font-bold transition-all hover:brightness-110 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
            >
              {isSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Salvar
            </button>
          </div>
        )}
        {saveSuccess && (
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-[9px] bg-[rgba(16,185,129,0.10)] border border-[rgba(16,185,129,0.2)] text-[#10b981] text-[13px]">
            <Check size={14} /> Perfil atualizado com sucesso!
          </div>
        )}
      </SettingCard>

      {/* Regional preferences */}
      <SettingCard title="Preferências regionais">
        <SettingRow
          label="Moeda"
          description="Formato dos valores monetários no app"
          control={
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value)
                markDirty(name, e.target.value)
              }}
              className="bg-[var(--sl-s3)] border border-[var(--sl-border)] rounded-[9px] px-3 py-1.5 text-[13px] text-[var(--sl-t1)] outline-none cursor-pointer"
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
            <select className="bg-[var(--sl-s3)] border border-[var(--sl-border)] rounded-[9px] px-3 py-1.5 text-[13px] text-[var(--sl-t1)] outline-none cursor-pointer">
              <option>America/Sao_Paulo (UTC-3)</option>
              <option>America/Manaus (UTC-4)</option>
              <option>America/Fortaleza (UTC-3)</option>
              <option>America/Belem (UTC-3)</option>
            </select>
          }
        />
        <SettingRow
          label="Dia de início do mês"
          description="Define quando reiniciam os orçamentos mensais"
          noBorder
          control={
            <select className="bg-[var(--sl-s3)] border border-[var(--sl-border)] rounded-[9px] px-3 py-1.5 text-[13px] text-[var(--sl-t1)] outline-none cursor-pointer">
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  Dia {d}
                </option>
              ))}
            </select>
          }
        />
        {isDirty && (
          <div className="flex justify-end mt-3">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-white text-[13px] font-bold transition-all hover:brightness-110 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #10b981, #0055ff)' }}
            >
              <Check size={14} /> Salvar
            </button>
          </div>
        )}
      </SettingCard>

      {/* Security */}
      <SettingCard title="Segurança">
        <SettingRow
          label="Alterar senha"
          description="Atualizar sua senha de acesso"
          control={
            <button className="px-3 py-1.5 rounded-[9px] border border-[var(--sl-border)] bg-transparent text-[12px] font-semibold text-[var(--sl-t2)] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] hover:bg-[var(--sl-s3)] transition-colors flex items-center gap-1.5">
              <Shield size={13} /> Alterar
            </button>
          }
        />
        <SettingRow
          label="Autenticação em 2 fatores"
          description="Adiciona uma camada extra de segurança à sua conta"
          noBorder
          control={<ToggleSwitch checked={false} onChange={() => {}} />}
        />
      </SettingCard>

      {/* Danger Zone */}
      <div className="bg-[rgba(244,63,94,0.04)] border border-[rgba(244,63,94,0.12)] rounded-2xl p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#f43f5e] mb-4">
          Zona de perigo
        </p>

        <div className="flex items-center justify-between gap-4 py-2.5 border-b border-[rgba(244,63,94,0.08)]">
          <div className="flex items-center gap-3">
            <Download size={15} className="text-[#f43f5e] shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-[var(--sl-t1)]">Exportar meus dados</p>
              <p className="text-[11px] text-[var(--sl-t3)]">
                Baixe um arquivo JSON com todos os seus dados (LGPD)
              </p>
            </div>
          </div>
          <button className="shrink-0 px-3 py-1.5 rounded-[9px] border border-[rgba(244,63,94,0.25)] bg-[rgba(244,63,94,0.08)] text-[12px] font-semibold text-[#f43f5e] hover:bg-[rgba(244,63,94,0.15)] transition-colors">
            Exportar (JSON)
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 py-2.5">
          <div className="flex items-center gap-3">
            <Trash2 size={15} className="text-[#f43f5e] shrink-0" />
            <div>
              <p className="text-[13px] font-semibold text-[var(--sl-t1)]">Excluir minha conta</p>
              <p className="text-[11px] text-[var(--sl-t3)]">
                Ação permanente e irreversível — todos os dados serão removidos
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="shrink-0 px-3 py-1.5 rounded-[9px] border border-[rgba(244,63,94,0.25)] bg-[rgba(244,63,94,0.08)] text-[12px] font-semibold text-[#f43f5e] hover:bg-[rgba(244,63,94,0.15)] transition-colors"
          >
            Excluir conta
          </button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[rgba(244,63,94,0.12)] flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-[#f43f5e]" />
              </div>
              <div>
                <h3 className="font-[Syne] font-bold text-base text-[var(--sl-t1)]">Excluir conta</h3>
                <p className="text-[12px] text-[var(--sl-t3)]">Ação permanente e irreversível</p>
              </div>
            </div>
            <p className="text-[13px] text-[var(--sl-t2)] mb-4 leading-relaxed">
              Todos os seus dados serão removidos: transações, metas, orçamentos, eventos e
              configurações.
            </p>
            <p className="text-[12px] font-semibold text-[var(--sl-t3)] mb-2">
              Digite <span className="text-[#f43f5e] font-bold">EXCLUIR</span> para confirmar:
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="EXCLUIR"
              className="w-full bg-[var(--sl-s3)] border border-[var(--sl-border)] rounded-[9px] px-3 py-2 text-[13px] text-[var(--sl-t1)] outline-none mb-4"
              onFocus={(e) => (e.target.style.borderColor = 'rgba(244,63,94,0.4)')}
              onBlur={(e) => (e.target.style.borderColor = '')}
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowDeleteDialog(false)
                  setDeleteText('')
                }}
                className="flex-1 px-4 py-2 rounded-[9px] border border-[var(--sl-border)] bg-transparent text-[13px] font-semibold text-[var(--sl-t2)] hover:bg-[var(--sl-s3)] transition-colors"
              >
                Cancelar
              </button>
              <button
                disabled={deleteText !== 'EXCLUIR'}
                className="flex-1 px-4 py-2 rounded-[9px] bg-[#f43f5e] text-white text-[13px] font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                Excluir definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
