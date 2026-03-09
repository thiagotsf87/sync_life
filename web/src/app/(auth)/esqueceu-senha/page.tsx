'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Mail, CheckCircle, ArrowRight } from 'lucide-react'

function StepDots({ active }: { active: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6 lg:hidden">
      {[1, 2].map((step) => (
        <div
          key={step}
          className="h-[6px] rounded-full transition-all duration-300"
          style={{
            width: step === active ? 20 : 6,
            background: step === active ? 'var(--em)' : 'var(--s3)',
          }}
        />
      ))}
    </div>
  )
}

function StepIcon({ emoji }: { emoji: string }) {
  return (
    <div
      className="mx-auto mb-4 flex h-[56px] w-[56px] items-center justify-center rounded-full lg:hidden"
      style={{
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
      }}
    >
      <span className="text-2xl">{emoji}</span>
    </div>
  )
}

export default function EsqueceuSenhaPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
      })
      if (error) { toast.error(error.message); return }
      setIsEmailSent(true)
    } catch {
      toast.error('Erro ao enviar e-mail. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <>
        <StepDots active={2} />
        <div className="auth-success-icon">
          <CheckCircle size={28} />
        </div>
        <h2 className="auth-success-title">E-mail enviado!</h2>
        <p className="auth-success-sub">
          Enviamos um link de recuperação para{' '}
          <strong style={{ color: 'var(--t1)' }}>{email}</strong>.
          {' '}Verifique sua caixa de entrada e spam.
        </p>
        <Link href="/login">
          <button className="btn-submit">
            Voltar para o login <ArrowRight size={16} />
          </button>
        </Link>
      </>
    )
  }

  return (
    <>
      <StepDots active={1} />
      <StepIcon emoji="📧" />

      <h2 className="form-title max-[900px]:text-center">Esqueceu a senha?</h2>
      <p className="form-subtitle max-[900px]:text-center">
        Digite seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <form onSubmit={handleSubmit}>
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

        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? 'Enviando...' : <>Enviar link de recuperação <ArrowRight size={16} /></>}
        </button>
      </form>

      <p className="auth-footer-link">
        Lembrou a senha?{' '}
        <Link href="/login">Fazer login</Link>
      </p>
    </>
  )
}
