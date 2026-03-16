'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ChevronLeft, Lock, Check, Clock, Mail, ArrowRight } from 'lucide-react'

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

  return (
    <div className="recover-layout">
      {/* Back to login */}
      <div className="recover-back">
        <Link href="/login" className="btn-ghost-recover">
          <ChevronLeft size={14} />
          Voltar ao login
        </Link>
      </div>

      {isEmailSent ? (
        /* ══ Step 2: Email Sent ══ */
        <div className="recover-card anim">
          <div className="recover-steps">
            <div className="recover-step active" />
            <div className="recover-step active" />
            <div className="recover-step" />
          </div>

          <div className="recover-success">
            <div className="check-circle">
              <Check size={28} strokeWidth={2.5} />
            </div>
            <h1>E-mail enviado!</h1>
            <div className="subtitle">
              Enviamos um link de recuperacao para{' '}
              <strong style={{ color: 'var(--t1)' }}>{email}</strong>.
              {' '}Verifique sua caixa de entrada e spam.
            </div>

            <div className="recover-info-box">
              <div className="recover-info-item">
                <Clock size={16} />
                <span>O link expira em <strong style={{ color: 'var(--t1)' }}>30 minutos</strong></span>
              </div>
              <div className="recover-info-item">
                <Mail size={16} />
                <span>Verifique tambem a pasta de spam</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-ghost-full"
              onClick={() => setIsEmailSent(false)}
            >
              Reenviar e-mail
            </button>
          </div>
        </div>
      ) : (
        /* ══ Step 1: Enter Email ══ */
        <div className="recover-card anim">
          <div className="recover-steps">
            <div className="recover-step active" />
            <div className="recover-step" />
            <div className="recover-step" />
          </div>

          <div className="recover-icon">
            <Lock size={24} />
          </div>
          <h1>Esqueceu sua senha?</h1>
          <div className="subtitle">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">E-mail cadastrado</label>
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

            <button
              type="submit"
              className="btn-submit"
              style={{ marginTop: 8 }}
              disabled={isLoading}
            >
              {isLoading ? 'Enviando...' : (
                <>Enviar link de recuperacao <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="recover-footer-link">
            <span>Lembrou a senha? </span>
            <Link href="/login">Voltar ao login</Link>
          </div>
        </div>
      )}
    </div>
  )
}
