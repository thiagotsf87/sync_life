'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { User, Mail, DollarSign, Save } from 'lucide-react'

interface ProfileData {
  full_name: string | null
  currency: string | null
}

export default function ConfiguracoesPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [currency, setCurrency] = useState('BRL')
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('Usuário')

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setEmail(user.email || '')
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await (supabase as any)
          .from('profiles')
          .select('full_name, currency')
          .eq('id', user.id)
          .single() as { data: ProfileData | null }

        if (profile) {
          setName(profile.full_name || '')
          setCurrency(profile.currency || 'BRL')
          setUserName(profile.full_name || user.email?.split('@')[0] || 'Usuário')
        }
      }
    }

    fetchProfile()
  }, [])

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('Usuário não autenticado')
        return
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('profiles')
        .update({
          full_name: name,
          currency,
        })
        .eq('id', user.id)

      if (error) throw error

      toast.success('Configurações salvas com sucesso!')
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header title="Configurações" userName={userName} />

      <div className="flex-1 p-4 lg:p-8">
        <div className="max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Profile section */}
            <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-6">Perfil</h2>

              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-300 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">O e-mail não pode ser alterado</p>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-slate-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Moeda padrão
                  </Label>
                  <select
                    id="currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-sync-500)]/50"
                  >
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-800">
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-[var(--color-sync-500)] hover:bg-[var(--color-sync-600)]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Salvando...' : 'Salvar alterações'}
                </Button>
              </div>
            </div>

            {/* Subscription section */}
            <div className="lg:col-span-1 bg-slate-900 rounded-2xl p-6 border border-slate-800">
              <h2 className="text-lg font-semibold text-white mb-6">Plano</h2>

              <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div>
                  <h3 className="text-white font-medium">Plano Free</h3>
                  <p className="text-sm text-slate-400">
                    Acesso básico às funcionalidades
                  </p>
                </div>
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm font-medium">
                  Ativo
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-500">
                Planos pagos estarão disponíveis em breve com recursos adicionais como
                relatórios avançados, integração bancária e mais.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
