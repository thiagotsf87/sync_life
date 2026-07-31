'use client'

// Onda 1 · Redefinir senha v5 — protótipo auth/redefinir-senha{,.mobile}.html.
// Comportamento do v3: updateUser({ password }) → panorama; validação viva da confirmação.

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import '@/styles/tokens-v5.css'
import '@/styles/v5.css'
import '@/styles/bussola-3d.css'
import '@/styles/auth-v5.css'
import './auth-screens.css'
import { useAuthBoot, BsMark, IconChevL, IconEye, Forca } from './chrome'

export function RedefinirSenhaV5() {
  const router = useRouter()
  const root = useRef<HTMLDivElement>(null)
  useAuthBoot(root)

  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('')
  const [show, setShow] = useState(false)
  const [show2, setShow2] = useState(false)
  const [loading, setLoading] = useState(false)

  const naoCoincidem = senha2.length > 0 && senha !== senha2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (senha.length < 8) { toast.error('A senha deve ter pelo menos 8 caracteres'); return }
    if (senha !== senha2) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password: senha })
      if (error) { toast.error(error.message); return }
      toast.success('Senha redefinida.')
      router.push('/dashboard')
    } catch {
      toast.error('Erro ao redefinir senha. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="v5">
      <div className="grain" aria-hidden="true" />
      <div className="av av-sheet av-red" ref={root}>
        <div className="aurora-fix" aria-hidden="true"><canvas /></div>

        <div className="volta">
          <Link href="/login"><IconChevL /><span className="d-only">Voltar ao login</span><span className="m-only">Login</span></Link>
        </div>

        <main className="sheet boot b1">
          <Link className="lockup" href="/" aria-label="SyncLife">
            <BsMark />
            <span className="wm">Sync<em>Life</em></span>
          </Link>
          <div className="passos" aria-label="Passo 3 de 3"><i className="on" /><i className="on" /><i className="on" /></div>
          <p className="eyebrow"><b>Recuperar acesso</b> · passo 03 de 03</p>
          <h1>Escolha a nova senha.</h1>
          <p className="sub">Uma senha forte protege a sua vida inteira, que agora mora aqui.</p>
          <form onSubmit={handleSubmit}>
            <div className="fld">
              <label htmlFor="senha">Nova senha</label>
              <div className="inwrap">
                <input id="senha" type={show ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" autoComplete="new-password" required minLength={8}
                  value={senha} onChange={(e) => setSenha(e.target.value)} />
                <button type="button" className="eyebtn" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow(!show)}>
                  <IconEye />
                </button>
              </div>
              <Forca senha={senha} />
            </div>
            <div className="fld">
              <label htmlFor="senha2">Confirmar nova senha</label>
              <div className="inwrap">
                <input id="senha2" type={show2 ? 'text' : 'password'} placeholder="Repita a nova senha" autoComplete="new-password" required
                  className={naoCoincidem ? 'err' : undefined}
                  value={senha2} onChange={(e) => setSenha2(e.target.value)} />
                <button type="button" className="eyebtn" aria-label={show2 ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow2(!show2)}>
                  <IconEye />
                </button>
              </div>
              {naoCoincidem && <p className="msg err">As senhas não coincidem.</p>}
            </div>
            <button type="submit" className="btn btn-roxo btn-full" disabled={loading}>
              {loading ? 'Salvando…' : 'Salvar nova senha'}
            </button>
          </form>
          <p className="nota">Depois de salvar, você entra direto no seu panorama. Sessões antigas são desconectadas por segurança.</p>
        </main>
      </div>
    </div>
  )
}
