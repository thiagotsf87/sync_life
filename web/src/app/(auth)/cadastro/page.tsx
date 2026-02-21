'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, User, Shield } from 'lucide-react'

export default function CadastroPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const getPasswordStrength = () => {
    if (password.length === 0) return { level: 0, label: '', color: '' }
    if (password.length < 6) return { level: 1, label: 'Fraca', color: 'bg-red-500' }
    if (password.length < 8) return { level: 2, label: 'Média', color: 'bg-yellow-500' }
    if (password.length < 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
      return { level: 3, label: 'Boa', color: 'bg-[var(--color-sync-500)]' }
    }
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return { level: 4, label: 'Forte', color: 'bg-[var(--color-sync-400)]' }
    }
    return { level: 2, label: 'Média', color: 'bg-yellow-500' }
  }

  const passwordStrength = getPasswordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
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
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      // Criar perfil no public.profiles (fallback se o trigger do DB falhar; só funciona se já houver sessão)
      if (data.user?.id) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase as any)
            .from('profiles')
            .upsert({ id: data.user.id, full_name: name }, { onConflict: 'id' })
        } catch {
          // Ignora; o trigger no Supabase deve criar o perfil, ou será criado no próximo login
        }
      }

      toast.success('Conta criada com sucesso! Verifique seu e-mail.')
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
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        toast.error('Erro ao conectar com Google')
      }
    } catch {
      toast.error('Erro ao conectar com Google')
    }
  }

  return (
    <>
      {/* Logo and tagline */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Logo size="lg" href="/" />
        </div>
        <p className="text-slate-400 text-sm">
          Comece sua jornada de organização hoje.
        </p>
      </div>

      {/* Register card */}
      <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-8 card-glow">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-2">Criar conta grátis</h2>
            <p className="text-slate-400 text-sm">Preencha os dados abaixo para começar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Nome completo</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-500" />
                </div>
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  required
                  className="pl-12 bg-slate-800/50 border-slate-700/50 focus:border-[var(--color-sync-500)]/50 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

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

            {/* Password field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Senha</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-500" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  required
                  minLength={6}
                  className="pl-12 pr-12 bg-slate-800/50 border-slate-700/50 focus:border-[var(--color-sync-500)]/50 text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password.length > 0 && (
                <>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.level ? passwordStrength.color : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Força: {passwordStrength.label}</p>
                </>
              )}
            </div>

            {/* Confirm Password field */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-slate-300">Confirmar senha</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Shield className="w-5 h-5 text-slate-500" />
                </div>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                  required
                  className="pl-12 bg-slate-800/50 border-slate-700/50 focus:border-[var(--color-sync-500)]/50 text-white placeholder:text-slate-500"
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-400 mt-1">As senhas não coincidem</p>
              )}
            </div>

            {/* Terms checkbox — quebra controlada para não estourar o modal nem órfãos */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                className="mt-1 shrink-0 border-slate-600 data-[state=checked]:bg-[var(--color-sync-500)] data-[state=checked]:border-[var(--color-sync-500)]"
              />
              <Label
                htmlFor="terms"
                className="text-sm text-slate-400 cursor-pointer leading-relaxed flex-1 min-w-0"
              >
                <span className="block w-full">Li e concordo com os</span>
                <span className="block w-full mt-0.5">
                  <Link href="#" className="text-[var(--color-sync-400)] hover:text-[var(--color-sync-300)] transition-colors">
                    Termos{'\u00a0'}de{'\u00a0'}Uso
                  </Link>
                  {' e '}
                  <Link href="#" className="text-[var(--color-sync-400)] hover:text-[var(--color-sync-300)] transition-colors">
                    Política{'\u00a0'}de{'\u00a0'}Privacidade
                  </Link>
                </span>
              </Label>
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading || !acceptTerms}
              className="w-full bg-gradient-to-r from-[var(--color-sync-500)] to-[var(--color-sync-600)] hover:from-[var(--color-sync-400)] hover:to-[var(--color-sync-500)] text-white font-semibold py-6 rounded-xl transition-all duration-300 btn-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Criando conta...' : 'Criar minha conta'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900 text-slate-500">ou</span>
            </div>
          </div>

          {/* Social signup */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignUp}
            className="w-full bg-slate-800/50 hover:bg-slate-800 border-slate-700/50 text-slate-300 py-6 rounded-xl"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
              <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
              <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
              <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
            </svg>
            Cadastrar com Google
          </Button>
        </div>

        {/* Login link */}
        <p className="text-center mt-8 text-slate-400 text-sm">
          Já tem uma conta?{' '}
          <Link href="/login" className="text-[var(--color-sync-400)] hover:text-[var(--color-sync-300)] font-medium transition-colors">
            Fazer login
          </Link>
        </p>

      {/* Footer */}
      <p className="text-center mt-6 text-slate-600 text-xs">
        © 2026 SyncLife. Organize sua vida, transforme sua história.
      </p>
    </>
  )
}
