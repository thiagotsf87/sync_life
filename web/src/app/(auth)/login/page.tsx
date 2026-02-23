'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M5.266 9.765C6.199 6.939 8.854 4.91 12 4.91c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
      <path fill="#34A853" d="M16.041 18.013C14.951 18.716 13.566 19.09 12 19.09c-3.133 0-5.78-2.013-6.723-4.823L1.237 17.335C3.193 21.294 7.265 24 12 24c2.933 0 5.735-1.043 7.834-3.001l-3.793-2.986z"/>
      <path fill="#4A90E2" d="M19.834 21C22.029 18.952 23.455 15.904 23.455 12c0-.71-.091-1.473-.273-2.182H12v4.636h6.436a5.595 5.595 0 01-2.395 3.559L19.834 21z"/>
      <path fill="#FBBC05" d="M5.277 14.268A7.13 7.13 0 014.91 12c0-.782.125-1.533.356-2.235L1.24 6.65A11.956 11.956 0 000 12c0 1.92.445 3.7 1.237 5.335l4.04-3.067z"/>
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

      // Check if onboarding is done
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()

      if (!profile?.onboarding_completed) {
        router.push('/onboarding')
      } else {
        router.push('/financas')
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

  return (
    <>
      <h2 className="form-title">Bem-vindo de volta.</h2>
      <p className="form-subtitle">Entre na sua conta para continuar evoluindo.</p>

      {/* Google */}
      <button type="button" className="btn-google" onClick={handleGoogleLogin}>
        <GoogleIcon />
        Continuar com Google
      </button>

      {/* Divider */}
      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-text">ou entre com e-mail</span>
        <div className="auth-divider-line" />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">E-mail</label>
          <div className="input-wrap">
            <span className="input-icon"><Mail size={16} /></span>
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
        </div>

        {/* Password */}
        <div className="form-group">
          <div className="form-label-row">
            <label className="form-label" htmlFor="password">Senha</label>
            <Link href="/esqueceu-senha" className="link-forgot">Esqueci minha senha</Link>
          </div>
          <div className="input-wrap">
            <span className="input-icon"><Lock size={16} /></span>
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

        {/* Email not confirmed */}
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
          {isLoading ? 'Entrando...' : <>Entrar <ArrowRight size={16} /></>}
        </button>
      </form>

      <p className="auth-footer-link">
        Não tem uma conta?{' '}
        <Link href="/cadastro">Criar conta grátis</Link>
      </p>
    </>
  )
}
