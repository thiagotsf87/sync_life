'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react'

function calculateStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const labels = ['', 'Fraca', 'Média', 'Forte', 'Muito forte']
  const colors = ['', '#f43f5e', '#f59e0b', '#10b981', '#10b981']
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
      toast.success('Senha redefinida com sucesso!')
      router.push('/dashboard')
    } catch {
      toast.error('Erro ao redefinir senha. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-recover-layout">
      {/* Back to login */}
      <div className="absolute left-10 top-6">
        <Link href="/login" className="auth-btn-ghost">
          <ChevronLeft size={14} />
          Voltar ao login
        </Link>
      </div>

      <div className="auth-recover-card">
        <div className="auth-recover-steps">
          <div className="auth-recover-step active" />
          <div className="auth-recover-step active" />
          <div className="auth-recover-step active" />
        </div>

        <div className="auth-recover-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth={2} strokeLinecap="round">
            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
          </svg>
        </div>

        <h1 className="font-[Syne] text-[22px] font-extrabold mb-2">Nova senha</h1>
        <p className="text-sm text-[var(--auth-t2)] mb-6 leading-relaxed">
          Escolha uma senha forte para proteger sua conta.
        </p>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="auth-field">
            <label>Nova senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="auth-input pr-10"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--auth-t3)] hover:text-[var(--auth-t2)]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && (
              <>
                <div className="auth-pwd-bars">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`auth-pwd-bar${i <= strength.score ? ' active' : ''}${i <= strength.score && strength.score >= 3 ? ' strong' : ''}`}
                    />
                  ))}
                </div>
                <div className="auth-pwd-label" style={{ color: strength.color }}>
                  {strength.label}
                </div>
              </>
            )}
          </div>

          {/* Confirm Password */}
          <div className="auth-field">
            <label>Confirmar nova senha</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                className="auth-input pr-10"
                placeholder="Repita a nova senha"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--auth-t3)] hover:text-[var(--auth-t2)]"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-[11px] text-[#f43f5e]">As senhas não coincidem</p>
            )}
          </div>

          <button type="submit" className="auth-btn-submit mt-2" disabled={isLoading}>
            {isLoading ? 'Redefinindo...' : 'Redefinir senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
