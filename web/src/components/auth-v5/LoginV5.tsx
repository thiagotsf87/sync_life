'use client'

// Onda 1 · Login v5 — visual do protótipo aprovado (auth/login{,.mobile}.html),
// comportamento herdado do app v3: Supabase signInWithPassword, checagem de onboarding,
// OAuth Google, reenvio de confirmação. Erros dos estados aprovados viram UI inline
// (credenciais → msg no campo · não confirmado → banner com reenviar).

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
import {
  useAuthBoot, BsMark, GoogleIcon, AppleIcon, IconEye, IconCheckWhite, HandArrow,
} from './chrome'

function WinBriefing({ mobile }: { mobile?: boolean }) {
  return (
    <div className="win">
      <div className="tb"><i /><i /><i /><span className="nm">Panorama · hoje</span><span className="ix num">07:12</span></div>
      <div className="bd">
        {!mobile && <p className="eyebrow">Briefing de hoje</p>}
        <p className="quote">
          &quot;Seu score subiu 3 pontos. Só o lazer passou do limite: <strong className="num warn">R$&nbsp;8</strong>. Um ajuste hoje resolve.&quot;
        </p>
        <div className="score-row">
          <span className="n num">74</span>
          <div className="meta">
            <span className="up num">+3 hoje</span>
            <span className="lbl">As 8 áreas da sua vida num número só.</span>
          </div>
        </div>
        {!mobile && (
          <div className="rowlist">
            <div className="r"><time className="num">07:30</time><span><b>Fisioterapia</b> · agenda de hoje</span></div>
            <div className="r"><time className="num">sex</time><span>Aporte de <b className="num">R$&nbsp;580</b> agendado · Viagem Itália</span></div>
          </div>
        )}
        <p className="assin">Escrito às 07:12 · com base em orçamentos · agenda · metas</p>
      </div>
    </div>
  )
}

export function LoginV5() {
  const router = useRouter()
  const root = useRef<HTMLDivElement>(null)
  useAuthBoot(root)

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [credErr, setCredErr] = useState(false)
  const [naoConfirmado, setNaoConfirmado] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setCredErr(false)
    setNaoConfirmado(false)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) {
        if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
          setNaoConfirmado(true)
        } else {
          setCredErr(true)
        }
        return
      }
      const { data: profile } = await (supabase as any)
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', data.user.id)
        .single()
      router.push(profile?.onboarding_completed ? '/dashboard' : '/onboarding')
      router.refresh()
    } catch {
      toast.error('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email.trim()) { toast.error('Informe o e-mail para reenviar.'); return }
    setResendLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.resend({ type: 'signup', email: email.trim() })
      if (error) { toast.error(error.message); return }
      toast.success('E-mail de confirmação reenviado.')
      setNaoConfirmado(false)
    } catch {
      toast.error('Erro ao reenviar. Tente novamente.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleGoogle = async () => {
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
    <div className="v5">
      <div className="grain" aria-hidden="true" />
      <div className="av av-split av-login" ref={root}>
        <div className="aurora-fix" aria-hidden="true"><canvas /></div>

        <div className="navwrap">
          <nav>
            <Link className="brand" href="/"><BsMark /><span className="wm">Sync<em>Life</em></span></Link>
            <div className="nav-cta">
              <Link className="alt" href="/cadastro">Ainda não tem conta?</Link>
              <Link className="btn btn-roxo" href="/cadastro">
                <span className="d-only">Criar conta grátis</span><span className="m-only">Criar conta</span>
              </Link>
            </div>
          </nav>
        </div>

        <main className="wrap auth-grid">
          <div className="fcol">
            <p className="eyebrow boot b1"><b>Entrar</b> · bem-vindo de volta</p>
            <h1 className="boot b2">Que bom te ver.</h1>
            <p className="sub boot b2">Seu dia já chegou lido: entre pra ver o briefing de hoje.</p>

            <div className="boot b3">
              <div className="oauth">
                <button type="button" className="btn-oauth" onClick={handleGoogle}><GoogleIcon />Google</button>
                <button type="button" className="btn-oauth" onClick={() => toast.info('Login com Apple chega em breve.')}><AppleIcon />Apple</button>
              </div>
              <div className="divisor">ou com e-mail</div>
            </div>

            <form className="boot b4" onSubmit={handleSubmit}>
              <div className="fld">
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" placeholder="seu@email.com" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="fld">
                <div className="lblrow">
                  <label htmlFor="senha">Senha</label>
                  <Link className="lnk" href="/esqueceu-senha">Esqueci a senha</Link>
                </div>
                <div className="inwrap">
                  <input id="senha" type={show ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" required
                    className={credErr ? 'err' : undefined}
                    value={senha} onChange={(e) => { setSenha(e.target.value); setCredErr(false) }} />
                  <button type="button" className="eyebtn" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow(!show)}>
                    <IconEye />
                  </button>
                </div>
                {credErr && <p className="msg err">E-mail ou senha incorretos. Tente de novo ou recupere a senha.</p>}
              </div>
              <label className="ckrow">
                <input type="checkbox" />
                <span className="ck"><IconCheckWhite /></span>
                <span>Manter conectado por 30 dias</span>
              </label>
              {naoConfirmado && (
                <div className="banner-err">
                  <span><b>Seu e-mail ainda não foi confirmado.</b> Verifique a caixa de entrada e a pasta de spam.</span>
                  <button type="button" className="btn btn-ghost" disabled={resendLoading} onClick={handleResend}>
                    {resendLoading ? 'Enviando…' : 'Reenviar confirmação'}
                  </button>
                </div>
              )}
              <button type="submit" className="btn btn-roxo btn-full" disabled={loading}>
                {loading ? 'Entrando…' : 'Entrar'}
              </button>
            </form>

            <p className="foot boot b5">Ainda não tem conta? <Link href="/cadastro">Criar conta grátis</Link></p>
          </div>

          <div className="wcol boot b4">
            <WinBriefing />
            <div className="handrow draw rv">
              <HandArrow />
              <span className="hand" style={{ transform: 'rotate(-2deg)' }}>entre: o dia de hoje já está pronto</span>
            </div>
          </div>
        </main>

        <section className="wrap tease rv">
          <p className="eyebrow"><b>Enquanto isso</b> · lá dentro</p>
          <WinBriefing mobile />
          <div className="handrow draw rv">
            <HandArrow w={34} />
            <span className="hand" style={{ transform: 'rotate(-2deg)' }}>entre: o dia de hoje já está pronto</span>
          </div>
        </section>
      </div>
    </div>
  )
}
