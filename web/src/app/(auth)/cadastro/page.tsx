'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { SyncLifeIcon } from '@/components/shell/icons'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function calculateStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const labels = ['', 'Fraca', 'Media', 'Forte', 'Muito forte']
  const colors = ['', 'var(--red)', 'var(--yellow)', 'var(--green)', 'var(--green)']
  return { score, label: labels[score] ?? '', color: colors[score] ?? '' }
}

const MODULE_ITEMS = [
  { name: 'Financas', color: '#10b981', bg: 'rgba(16,185,129,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
  { name: 'Tempo', color: '#06b6d4', bg: 'rgba(6,182,212,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
  { name: 'Futuro', color: '#0055ff', bg: 'rgba(0,85,255,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0055ff" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg> },
  { name: 'Corpo', color: '#f97316', bg: 'rgba(249,115,22,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
  { name: 'Mente', color: '#eab308', bg: 'rgba(234,179,8,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round"><path d="M12 2a8 8 0 0 0-8 8c0 6 8 12 8 12s8-6 8-12a8 8 0 0 0-8-8z"/></svg> },
  { name: 'Patrimonio', color: '#3b82f6', bg: 'rgba(59,130,246,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg> },
  { name: 'Carreira', color: '#f43f5e', bg: 'rgba(244,63,94,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg> },
  { name: 'Experiencias', color: '#ec4899', bg: 'rgba(236,72,153,.1)', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg> },
]

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const strength = calculateStrength(password)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error('A senha deve ter pelo menos 8 caracteres')
      return
    }
    if (password !== confirmPassword) {
      toast.error('As senhas nao coincidem')
      return
    }
    if (!acceptTerms) {
      toast.error('Voce precisa aceitar os termos de uso')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })

      if (error) { toast.error(error.message); return }

      if (data.user?.id) {
        try {
          await (supabase as any)
            .from('profiles')
            .upsert({ id: data.user.id, full_name: name }, { onConflict: 'id' })
        } catch { /* trigger handles this */ }
      }

      toast.success('Conta criada! Verifique seu e-mail para confirmar.')
      router.push('/login')
    } catch {
      toast.error('Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) toast.error('Erro ao conectar com Google')
    } catch {
      toast.error('Erro ao conectar com Google')
    }
  }

  return (
    <div className="auth-layout">
      {/* Form Side (LEFT on cadastro — inverted) */}
      <div className="auth-form-side">
        {/* Mobile logo */}
        <div className="auth-mobile-logo">
          <SyncLifeIcon size={40} animated />
          <div className="auth-mobile-logo-sub">Sua vida em sincronia</div>
        </div>

        <div className="auth-form">
          <Link href="/" className="auth-logo-brand">
            <SyncLifeIcon size={24} animated={false} />
            SyncLife
          </Link>

          <h1>Crie sua conta</h1>
          <div className="subtitle">Comece a organizar todas as areas da sua vida</div>

          <button type="button" className="btn-google" onClick={handleGoogleSignUp}>
            <GoogleIcon />
            Cadastrar com Google
          </button>

          <div className="form-divider">ou com e-mail</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nome completo</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Seu nome"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-right-icon"
                  placeholder="Minimo 8 caracteres"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password.length > 0 && (
                <>
                  <div className="strength-bars">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`strength-bar ${i <= strength.score ? `active-${strength.score}` : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`strength-label level-${strength.score}`}>
                    {strength.label}
                  </span>
                </>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">Confirmar senha</label>
              <div className="input-wrap">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  className={`form-input has-right-icon${confirmPassword && password !== confirmPassword ? ' error' : ''}`}
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <span className="form-error">As senhas nao coincidem</span>
              )}
            </div>

            <div className="form-checkbox-row">
              <input
                id="terms"
                type="checkbox"
                className="form-checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <label htmlFor="terms" className="form-checkbox-label">
                Concordo com os{' '}
                <a href="#">Termos de uso</a>
                {' '}e{' '}
                <a href="#">Politica de privacidade</a>
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading || !acceptTerms}>
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="auth-footer">
            Ja tem conta? <Link href="/login">Entrar</Link>
          </div>
        </div>
      </div>

      {/* Visual Panel (RIGHT on cadastro) */}
      <div className="auth-visual">
        <div className="av-orb" style={{ width: 250, height: 250, background: 'var(--cyan)', top: -80, left: -60, borderRadius: '50%', filter: 'blur(80px)', opacity: .25, position: 'absolute' as const }} />
        <div className="av-orb" style={{ width: 200, height: 200, background: 'var(--green)', bottom: -40, right: -40, borderRadius: '50%', filter: 'blur(80px)', opacity: .2, position: 'absolute' as const }} />
        <div className="auth-visual-content" style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "var(--font-syne, 'Syne', sans-serif)", fontWeight: 800, fontSize: 24, marginBottom: 12 }}>8 dimensoes. 1 plataforma.</div>
          <div style={{ fontSize: 14, color: 'var(--t2)', marginBottom: 36, lineHeight: 1.7 }}>Cada dimensao da sua vida tem espaco proprio, mas funciona conectada com as outras.</div>

          <div className="av-modules-grid">
            {MODULE_ITEMS.map((mod) => (
              <div key={mod.name} className="av-mod-item">
                <div className="av-mod-icon" style={{ background: mod.bg }}>{mod.icon}</div>
                <div className="av-mod-name">{mod.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
