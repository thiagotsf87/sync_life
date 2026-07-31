'use client'

// Onda 1 · Esqueceu a senha v5 — protótipo auth/esqueceu-senha{,.mobile}.html.
// Comportamento do v3: resetPasswordForEmail com redirect pro fluxo de redefinição;
// estado 02 ecoa o e-mail; reenviar volta pro formulário.

import { useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import '@/styles/tokens-v5.css'
import '@/styles/v5.css'
import '@/styles/bussola-3d.css'
import '@/styles/auth-v5.css'
import './auth-screens.css'
import { useAuthBoot, useRevealNow, BsMark, IconChevL, IconArrowR, IconClock, IconMail } from './chrome'

function Lockup() {
  return (
    <Link className="lockup" href="/" aria-label="SyncLife">
      <BsMark />
      <span className="wm">Sync<em>Life</em></span>
    </Link>
  )
}

function EstadoEnviado({ email, onReenviar }: { email: string; onReenviar: () => void }) {
  const ref = useRef<HTMLElement>(null)
  useRevealNow(ref)
  return (
    <main className="sheet rv" ref={ref}>
      <Lockup />
      <div className="passos" aria-label="Passo 2 de 3"><i className="on" /><i className="on" /><i /></div>
      <div className="ok-selo">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path className="ck" d="M20 6 L9 17 L4 12" />
        </svg>
      </div>
      <p className="eyebrow"><b>Recuperar acesso</b> · passo 02 de 03</p>
      <h1>E-mail enviado.</h1>
      <p className="sub">O link de recuperação foi pra <b>{email}</b>. Verifique a caixa de entrada e o spam.</p>
      <div className="infos">
        <div className="r"><IconClock /><span>O link expira em <b className="num">30 minutos</b></span></div>
        <div className="r"><IconMail /><span>Nada na caixa de entrada? Olhe a pasta de <b>spam</b></span></div>
      </div>
      <button type="button" className="btn btn-ghost reenviar" onClick={onReenviar}>Reenviar e-mail</button>
      <p className="footlnk">Lembrou a senha? <Link href="/login">Voltar ao login</Link></p>
    </main>
  )
}

export function EsqueceuSenhaV5() {
  const root = useRef<HTMLDivElement>(null)
  useAuthBoot(root)

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
      })
      if (error) { toast.error(error.message); return }
      setEnviado(true)
      scrollTo(0, 0)
    } catch {
      toast.error('Erro ao enviar e-mail. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="v5">
      <div className="grain" aria-hidden="true" />
      <div className="av av-sheet av-rec" ref={root}>
        <div className="aurora-fix" aria-hidden="true"><canvas /></div>

        <div className="volta">
          <Link href="/login"><IconChevL /><span className="d-only">Voltar ao login</span><span className="m-only">Login</span></Link>
        </div>

        {enviado ? (
          <EstadoEnviado email={email} onReenviar={() => setEnviado(false)} />
        ) : (
          <main className="sheet boot b1">
            <Lockup />
            <div className="passos" aria-label="Passo 1 de 3"><i className="on" /><i /><i /></div>
            <p className="eyebrow"><b>Recuperar acesso</b> · passo 01 de 03</p>
            <h1>Esqueceu a senha?</h1>
            <p className="sub">Sem drama. Informe o e-mail da conta e enviaremos um link pra redefinir.</p>
            <form onSubmit={handleSubmit}>
              <div className="fld">
                <label htmlFor="email">E-mail cadastrado</label>
                <input id="email" type="email" placeholder="seu@email.com" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <button type="submit" className="btn btn-roxo btn-full" disabled={loading}>
                {loading ? 'Enviando…' : <>Enviar link de recuperação<span className="d-only btn-ico"><IconArrowR /></span></>}
              </button>
            </form>
            <p className="footlnk">Lembrou a senha? <Link href="/login">Voltar ao login</Link></p>
          </main>
        )}
      </div>
    </div>
  )
}
