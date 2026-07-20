'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { SyncLifeLockup } from '@/components/SyncLifeLockup'

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

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setEmailNotConfirmed(false)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          setEmailNotConfirmed(true)
          toast.error('E-mail ainda não confirmado. Verifique sua caixa de entrada.')
        } else {
          toast.error('Credenciais incorretas')
        }
        return
      }

      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()

      if (!profile?.onboarding_completed) {
        router.push('/onboarding')
      } else {
        router.push('/dashboard')
      }
      router.refresh()
    } catch {
      toast.error('Erro ao fazer login. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      toast.error('Informe o e-mail para reenviar.')
      return
    }
    setResendLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() })
      if (error) { toast.error(error.message); return }
      toast.success('E-mail de confirmação reenviado!')
      setEmailNotConfirmed(false)
    } catch {
      toast.error('Erro ao reenviar. Tente novamente.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
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

  const handleAppleLogin = () => {
    toast.info('Login com Apple chega em breve.')
  }

  return (
    <div className="auth-layout">
      {/* Visual Panel (Left) */}
      <aside className="auth-visual">
        <div className="auth-visual-content">
          <div className="auth-brand-logo">
            <SyncLifeLockup height={120} withTagline />
          </div>

          <h2 className="auth-headline">
            Finanças, saúde, rotina, mente.
            <br />
            <span style={{ color: 'var(--sl-em)' }}>Tudo no mesmo lugar.</span>
          </h2>

          <p className="auth-sub">
            Mais de 24.000 brasileiros já organizam a vida com SyncLife.
            Sem planilhas, sem 8 apps abertos, sem ansiedade.
          </p>

          <div className="auth-stats">
            <div className="auth-stat">
              <div className="auth-stat-value">24k</div>
              <div className="auth-stat-label">Clientes</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-value">4.9★</div>
              <div className="auth-stat-label">Avaliação média</div>
            </div>
            <div className="auth-stat">
              <div className="auth-stat-value">LGPD</div>
              <div className="auth-stat-label">Conforme</div>
            </div>
          </div>
        </div>

        <div className="auth-copyright">
          © 2026 SyncLife · São Paulo
        </div>
      </aside>

      {/* Form Side (Right) */}
      <div className="auth-form-side">
        {/* Mobile logo */}
        <div className="auth-mobile-logo">
          <SyncLifeLockup height={48} />
        </div>

        <div className="auth-form">
          <h1>Que bom te ver de volta.</h1>
          <div className="subtitle">Entre na sua conta para continuar.</div>

          <div className="oauth-grid">
            <button type="button" className="btn-oauth" onClick={handleGoogleLogin}>
              <GoogleIcon />
              <span>Google</span>
            </button>
            <button type="button" className="btn-oauth" onClick={handleAppleLogin}>
              <AppleIcon />
              <span>Apple</span>
            </button>
          </div>

          <div className="form-divider">OU COM E-MAIL</div>

          <form onSubmit={handleSubmit}>
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
              <div className="form-label-row">
                <label htmlFor="password">Senha</label>
                <Link href="/esqueceu-senha" className="link-forgot">Esqueci a senha</Link>
              </div>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-right-icon"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
            </div>

            <label className="form-check-row">
              <input type="checkbox" />
              <span>Manter conectado por 30 dias</span>
            </label>

            {emailNotConfirmed && (
              <div className="auth-warning-banner">
                <p className="auth-warning-text">
                  Seu e-mail ainda não foi confirmado. Verifique a caixa de entrada e spam.
                </p>
                <button
                  type="button"
                  className="btn-resend"
                  disabled={resendLoading}
                  onClick={handleResendConfirmation}
                >
                  {resendLoading ? 'Enviando...' : 'Reenviar confirmação'}
                </button>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-footer">
            Ainda não tem conta? <Link href="/cadastro">Criar conta</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
