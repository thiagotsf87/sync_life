'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'

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

  return (
    <>
      <h2 className="form-title">Criar conta grátis.</h2>
      <p className="form-subtitle">Comece sua jornada de organização hoje.</p>

      {/* Google */}
      <button type="button" className="btn-google" onClick={handleGoogleSignUp}>
        <GoogleIcon />
        Cadastrar com Google
      </button>

      {/* Divider */}
      <div className="auth-divider">
        <div className="auth-divider-line" />
        <span className="auth-divider-text">ou cadastre com e-mail</span>
        <div className="auth-divider-line" />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="name">Nome completo</label>
          <div className="input-wrap">
            <span className="input-icon"><User size={16} /></span>
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
        </div>

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
          <label className="form-label" htmlFor="password">Senha</label>
          <div className="input-wrap">
            <span className="input-icon"><Lock size={16} /></span>
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
          {/* Strength meter */}
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
                Força: {strength.label}
              </span>
            </>
          )}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="confirm-password">Confirmar senha</label>
          <div className="input-wrap">
            <span className="input-icon"><Lock size={16} /></span>
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

        {/* Terms */}
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
            <a href="#">Termos de Uso</a>
            {' '}e{' '}
            <a href="#">Política de Privacidade</a>
          </label>
        </div>

        <button type="submit" className="btn-submit" disabled={isLoading || !acceptTerms}>
          {isLoading ? 'Criando conta...' : <>Criar minha conta <ArrowRight size={16} /></>}
        </button>
      </form>

      <p className="auth-footer-link">
        Já tem uma conta?{' '}
        <Link href="/login">Fazer login</Link>
      </p>
    </>
  )
}
