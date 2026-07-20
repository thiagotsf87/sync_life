'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { SyncLifeLockup } from '@/components/SyncLifeLockup'
import {
  Eye,
  EyeOff,
  DollarSign,
  Clock,
  Target,
  HeartPulse,
  Brain,
  TrendingUp,
  Briefcase,
  Plane,
} from 'lucide-react'

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

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M11.18 0a3.5 3.5 0 0 1-.85 2.55 2.95 2.95 0 0 1-2.37 1.1 3.32 3.32 0 0 1 .85-2.47A3.55 3.55 0 0 1 11.18 0zm3.45 12.05a7.78 7.78 0 0 1-.78 1.4c-.51.74-1 1.48-1.77 1.5-.76.01-1-.45-1.86-.45-.86 0-1.13.43-1.85.46-.74.03-1.31-.8-1.82-1.54-1.05-1.51-1.85-4.27-.77-6.13a2.86 2.86 0 0 1 2.43-1.48c.73-.01 1.42.5 1.86.5.45 0 1.28-.61 2.16-.52a2.94 2.94 0 0 1 2.3 1.25 2.86 2.86 0 0 0-1.37 2.4 2.78 2.78 0 0 0 1.69 2.55c-.04.13-.1.27-.15.4z"/>
    </svg>
  )
}

function calculateStrength(password: string): { score: number; label: string } {
  if (!password) return { score: 0, label: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const labels = ['', 'Fraca', 'Média', 'Forte', 'Muito forte']
  return { score, label: labels[score] ?? '' }
}

const MODULE_ITEMS: Array<{
  name: string
  color: string
  bg: string
  Icon: typeof DollarSign
}> = [
  { name: 'Finanças',     color: '#0F766E', bg: 'rgba(15,118,110,.1)',  Icon: DollarSign },
  { name: 'Tempo',        color: '#3CA0B5', bg: 'rgba(60,160,181,.1)',  Icon: Clock },
  { name: 'Futuro',       color: '#8B7BD4', bg: 'rgba(139,123,212,.1)', Icon: Target },
  { name: 'Corpo',        color: '#D97534', bg: 'rgba(217,117,52,.1)',  Icon: HeartPulse },
  { name: 'Mente',        color: '#D9962E', bg: 'rgba(217,150,46,.1)',  Icon: Brain },
  { name: 'Patrimônio',   color: '#4F88D4', bg: 'rgba(79,136,212,.1)',  Icon: TrendingUp },
  { name: 'Carreira',     color: '#DB6478', bg: 'rgba(219,100,120,.1)', Icon: Briefcase },
  { name: 'Experiências', color: '#C76795', bg: 'rgba(199,103,149,.1)', Icon: Plane },
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
      toast.error('As senhas não coincidem')
      return
    }
    if (!acceptTerms) {
      toast.error('Você precisa aceitar os termos de uso')
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

  const handleAppleSignUp = () => {
    toast.info('Cadastro com Apple chega em breve.')
  }

  return (
    <div className="auth-layout">
      {/* Form Side (LEFT on cadastro) */}
      <div className="auth-form-side">
        {/* Mobile logo */}
        <div className="auth-mobile-logo">
          <SyncLifeLockup height={48} />
        </div>

        <div className="auth-form">
          <Link href="/" className="auth-logo-brand-link">
            <SyncLifeLockup height={56} />
          </Link>

          <h1>Comece a sincronizar.</h1>
          <div className="subtitle">14 dias de PRO grátis. Sem cartão de crédito.</div>

          <div className="oauth-grid">
            <button type="button" className="btn-oauth" onClick={handleGoogleSignUp}>
              <GoogleIcon />
              <span>Google</span>
            </button>
            <button type="button" className="btn-oauth" onClick={handleAppleSignUp}>
              <AppleIcon />
              <span>Apple</span>
            </button>
          </div>

          <div className="form-divider">OU COM E-MAIL</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Como prefere ser chamado"
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
                  placeholder="Mínimo 8 caracteres"
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
                <span className="form-error">As senhas não coincidem</span>
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
                Li e concordo com os{' '}
                <a href="#">Termos de uso</a>
                {' '}e a{' '}
                <a href="#">Política de privacidade</a>.
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading || !acceptTerms}>
              {isLoading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>

          <div className="auth-footer">
            Já tem conta? <Link href="/login">Entrar</Link>
          </div>
        </div>
      </div>

      {/* Visual Panel (RIGHT on cadastro) */}
      <aside className="auth-visual">
        <div className="auth-visual-content auth-visual-modules">
          <div className="auth-eyebrow">Cada dimensão, seu próprio espaço</div>

          <h2 className="auth-headline">
            8 dimensões.
            <br />
            <span style={{ color: 'var(--sl-em)' }}>1 plataforma.</span>
          </h2>

          <p className="auth-sub">
            Cada dimensão da sua vida tem espaço próprio, mas funciona conectada com as outras.
          </p>

          <div className="auth-modules-grid">
            {MODULE_ITEMS.map(({ name, color, bg, Icon }) => (
              <div key={name} className="auth-mod-item">
                <div className="auth-mod-icon" style={{ background: bg }}>
                  <Icon size={16} color={color} strokeWidth={2} />
                </div>
                <div className="auth-mod-name">{name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-copyright">
          © 2026 SyncLife · São Paulo
        </div>
      </aside>
    </div>
  )
}
