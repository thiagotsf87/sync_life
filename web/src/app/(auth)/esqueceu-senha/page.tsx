'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

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

      if (error) {
        toast.error(error.message)
        return
      }

      setIsEmailSent(true)
      toast.success('E-mail enviado com sucesso!')
    } catch {
      toast.error('Erro ao enviar e-mail. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size="lg" href="/" />
            </div>
          </div>

          {/* Success card */}
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 card-glow text-center">
            <div className="w-16 h-16 bg-[var(--color-sync-500)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[var(--color-sync-400)]" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-3">E-mail enviado!</h2>
            <p className="text-slate-400 mb-6">
              Enviamos um link de recuperação para <strong className="text-white">{email}</strong>. 
              Verifique sua caixa de entrada e spam.
            </p>
            <Link href="/login">
              <Button className="w-full bg-gradient-to-r from-[var(--color-sync-500)] to-[var(--color-sync-600)] hover:from-[var(--color-sync-400)] hover:to-[var(--color-sync-500)] text-white font-semibold py-6 rounded-xl">
                Voltar para o login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" href="/" />
          </div>
        </div>

        {/* Forgot password card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 card-glow">
          {/* Back link */}
          <Link href="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            Voltar para login
          </Link>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Esqueceu a senha?</h2>
            <p className="text-slate-400 text-sm">
              Digite seu e-mail e enviaremos um link para você redefinir sua senha.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">E-mail</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-500" />
                </div>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="pl-12 bg-slate-800/50 border-slate-700/50 focus:border-[var(--color-sync-500)]/50 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[var(--color-sync-500)] to-[var(--color-sync-600)] hover:from-[var(--color-sync-400)] hover:to-[var(--color-sync-500)] text-white font-semibold py-6 rounded-xl transition-all duration-300 btn-glow"
            >
              {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-slate-600 text-xs">
          © 2026 SyncLife. Organize sua vida, transforme sua história.
        </p>
      </div>
    </div>
  )
}
