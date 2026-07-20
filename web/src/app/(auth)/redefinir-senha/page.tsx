'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ChevronLeft, Eye, EyeOff, KeyRound } from 'lucide-react'
import { SyncLifeLockup } from '@/components/SyncLifeLockup'

function calculateStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const labels = ['', 'Fraca', 'Média', 'Forte', 'Muito forte']
  const colors = ['', 'var(--sl-danger)', 'var(--sl-warning)', 'var(--sl-em)', 'var(--sl-em)']
  return { score, label: labels[score] ?? '', color: colors[score] ?? '' }
}

export default function RedefinirSenhaPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success('Senha redefinida com sucesso')
      router.push('/dashboard')
    } catch {
      toast.error('Erro ao redefinir senha. Tente novamente.')
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

      {/* Brand lockup */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        <SyncLifeLockup height={56} />
      </div>

      <div className="recover-card anim">
        <div className="recover-steps">
          <div className="recover-step active" />
          <div className="recover-step active" />
          <div className="recover-step active" />
        </div>

        <div className="recover-icon">
          <KeyRound size={22} />
        </div>

        <h1 className="font-[Syne] tracking-tight">Nova senha</h1>
        <div className="subtitle">
          Escolha uma senha forte para proteger sua conta.
        </div>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="form-group">
            <label htmlFor="new-password">Nova senha</label>
            <div className="input-wrap">
              <input
                id="new-password"
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
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 3,
                        borderRadius: 2,
                        background: i <= strength.score ? strength.color : 'var(--sl-s3)',
                        transition: 'background 0.2s',
                      }}
                    />
                  ))}
                </div>
                <p
                  className="font-[DM_Sans]"
                  style={{
                    fontSize: 11,
                    marginTop: 6,
                    color: strength.color || 'var(--sl-t3)',
                    fontWeight: 600,
                  }}
                >
                  {strength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label htmlFor="confirm-password">Confirmar nova senha</label>
            <div className="input-wrap">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                className="form-input has-right-icon"
                placeholder="Repita a nova senha"
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
              <p
                className="font-[DM_Sans]"
                style={{ marginTop: 6, fontSize: 11, color: 'var(--sl-danger)' }}
              >
                As senhas não coincidem
              </p>
            )}
          </div>

          <button
            type="submit"
            className="btn-submit"
            style={{ marginTop: 8 }}
            disabled={isLoading}
          >
            {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
