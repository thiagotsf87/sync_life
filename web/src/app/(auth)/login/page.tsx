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
          toast.error('E-mail ainda nao confirmado. Verifique sua caixa de entrada.')
        } else {
          toast.error('Credenciais incorretas')
        }
        return
      }

      // Check if onboarding is done
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
      toast.success('E-mail de confirmacao reenviado!')
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

  return (
    <div className="auth-layout">
      {/* Visual Panel (Left) */}
      <div className="auth-visual">
        <div className="av-orb av-orb-1" />
        <div className="av-orb av-orb-2" />
        <div className="auth-visual-content">
          <div className="av-brand">
            <SyncLifeIcon size={28} animated />
            SyncLife
          </div>
          <div className="av-tagline">
            Gerencie todas as<br />areas da sua vida<br />em um so lugar.
          </div>
          <div className="av-desc">
            8 dimensoes da sua vida integradas com um score inteligente que mostra o equilibrio entre elas.
          </div>

          {/* Mini preview card */}
          <div className="av-mini-card">
            <div className="av-mini-header">
              <div className="av-mini-ring">
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="var(--s3)" strokeWidth="3"/>
                  <circle cx="20" cy="20" r="16" fill="none" stroke="url(#sg-login)" strokeWidth="3" strokeLinecap="round" strokeDasharray="75" strokeDashoffset="22" transform="rotate(-90 20 20)"/>
                  <defs><linearGradient id="sg-login" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="var(--green)"/><stop offset="100%" stopColor="var(--cyan)"/></linearGradient></defs>
                </svg>
                <span className="av-mini-ring-num">72</span>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t1)' }}>Life Sync Score</div>
                <div style={{ fontSize: 11, color: 'var(--green)' }}>+4 pts essa semana</div>
              </div>
            </div>
            <div className="av-mini-modules">
              <div className="av-mini-mod">
                <div className="av-mini-mod-name">Financas</div>
                <div className="av-mini-mod-val" style={{ color: 'var(--green)' }}>85</div>
              </div>
              <div className="av-mini-mod">
                <div className="av-mini-mod-name">Tempo</div>
                <div className="av-mini-mod-val" style={{ color: 'var(--cyan)' }}>68</div>
              </div>
              <div className="av-mini-mod">
                <div className="av-mini-mod-name">Corpo</div>
                <div className="av-mini-mod-val" style={{ color: 'var(--orange)' }}>74</div>
              </div>
              <div className="av-mini-mod">
                <div className="av-mini-mod-name">Mente</div>
                <div className="av-mini-mod-val" style={{ color: 'var(--yellow)' }}>70</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Side (Right) */}
      <div className="auth-form-side">
        {/* Mobile logo */}
        <div className="auth-mobile-logo">
          <SyncLifeIcon size={40} animated />
          <div className="auth-mobile-logo-sub">Sua vida em sincronia</div>
        </div>

        <div className="auth-form">
          <h1>Bem-vindo de volta</h1>
          <div className="subtitle">Entre na sua conta para continuar</div>

          <button type="button" className="btn-google" onClick={handleGoogleLogin}>
            <GoogleIcon />
            Entrar com Google
          </button>

          <div className="form-divider">ou continue com e-mail</div>

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
              <label htmlFor="password">Senha</label>
              <div className="input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input has-right-icon"
                  placeholder="........"
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

            <div className="form-row">
              <label className="form-check">
                <input type="checkbox" /> Lembrar de mim
              </label>
              <Link href="/esqueceu-senha" className="form-link">Esqueceu a senha?</Link>
            </div>

            {/* Email not confirmed */}
            {emailNotConfirmed && (
              <div className="auth-warning-banner">
                <p className="auth-warning-text">
                  Seu e-mail ainda nao foi confirmado. Verifique a caixa de entrada e spam.
                </p>
                <button
                  type="button"
                  className="btn-resend"
                  disabled={resendLoading}
                  onClick={handleResendConfirmation}
                >
                  {resendLoading ? 'Enviando...' : 'Reenviar confirmacao'}
                </button>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="auth-footer">
            Nao tem conta? <Link href="/cadastro">Criar conta gratis</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
