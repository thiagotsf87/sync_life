'use client'

// Onda 1 · Cadastro v5 — visual do protótipo aprovado (auth/cadastro{,.mobile}.html),
// comportamento herdado do v3: Supabase signUp + upsert do profile, OAuth Google,
// validações (8+ chars, confirmação, termos). E-mail já cadastrado vira banner inline.

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
  useAuthBoot, BsMark, AreaIconSlot, AREAS_V5, Forca,
  GoogleIcon, AppleIcon, IconEye, IconCheck, IconCheckWhite, HandArrow,
} from './chrome'

function WinAreas({ mobile }: { mobile?: boolean }) {
  return (
    <div className="win">
      <div className="tb"><i /><i /><i /><span className="nm">A sua bússola</span><span className="ix num">01 · 08</span></div>
      <div className="bd">
        {!mobile && <p className="eyebrow">Oito áreas · uma única interface</p>}
        <div className="arealist">
          {AREAS_V5.map((a, i) => (
            <div className="arow" key={a.nome}>
              <AreaIconSlot i={i} size={34} sizeM={30} />
              <span className="nm">{a.nome}</span>
              <span className="ix num">{String(i + 1).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Proof() {
  return (
    <div className="proof">
      <span><IconCheck size={13} />14 dias PRO grátis</span>
      <span><IconCheck size={13} /><span className="d-only">Sem cartão de crédito</span><span className="m-only">Sem cartão</span></span>
      <span><IconCheck size={13} />LGPD-ready</span>
    </div>
  )
}

export function CadastroV5() {
  const router = useRouter()
  const root = useRef<HTMLDivElement>(null)
  useAuthBoot(root)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [senha2, setSenha2] = useState('')
  const [show, setShow] = useState(false)
  const [show2, setShow2] = useState(false)
  const [termos, setTermos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [jaCadastrado, setJaCadastrado] = useState(false)

  const naoCoincidem = senha2.length > 0 && senha !== senha2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (senha.length < 8) { toast.error('A senha deve ter pelo menos 8 caracteres'); return }
    if (senha !== senha2) return
    if (!termos) { toast.error('Você precisa aceitar os termos de uso'); return }
    setLoading(true)
    setJaCadastrado(false)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { full_name: nome } },
      })
      if (error) {
        if (/already registered|already exists/i.test(error.message)) setJaCadastrado(true)
        else toast.error(error.message)
        return
      }
      if (data.user?.id) {
        try {
          await (supabase as any)
            .from('profiles')
            .upsert({ id: data.user.id, full_name: nome }, { onConflict: 'id' })
        } catch { /* trigger cobre */ }
      }
      toast.success('Conta criada. Verifique seu e-mail para confirmar.')
      router.push('/login')
    } catch {
      toast.error('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
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
      <div className="av av-split av-cad" ref={root}>
        <div className="aurora-fix" aria-hidden="true"><canvas /></div>

        <div className="navwrap">
          <nav>
            <Link className="brand" href="/"><BsMark /><span className="wm">Sync<em>Life</em></span></Link>
            <div className="nav-cta">
              <Link className="alt" href="/login">Já tem conta?</Link>
              <Link className="btn btn-ghost" href="/login">Entrar</Link>
            </div>
          </nav>
        </div>

        <main className="wrap auth-grid">
          <div className="fcol">
            <p className="eyebrow boot b1"><b>Criar conta</b> · leva um minuto</p>
            <h1 className="boot b2">Comece a sincronizar.</h1>
            <p className="sub boot b2"><b>14 dias de PRO grátis.</b> Sem cartão de crédito, sem pegadinha.</p>

            <div className="boot b3">
              <div className="oauth">
                <button type="button" className="btn-oauth" onClick={handleGoogle}><GoogleIcon />Google</button>
                <button type="button" className="btn-oauth" onClick={() => toast.info('Cadastro com Apple chega em breve.')}><AppleIcon />Apple</button>
              </div>
              <div className="divisor">ou com e-mail</div>
            </div>

            <form className="boot b4" onSubmit={handleSubmit}>
              <div className="fld">
                <label htmlFor="nome">Nome</label>
                <input id="nome" type="text" placeholder="Como prefere ser chamado" autoComplete="name" required minLength={2}
                  value={nome} onChange={(e) => setNome(e.target.value)} />
              </div>
              <div className="fld">
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" placeholder="seu@email.com" autoComplete="email" required
                  value={email} onChange={(e) => { setEmail(e.target.value); setJaCadastrado(false) }} />
              </div>
              <div className="fld">
                <label htmlFor="senha">Senha</label>
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
                <label htmlFor="senha2">Confirmar senha</label>
                <div className="inwrap">
                  <input id="senha2" type={show2 ? 'text' : 'password'} placeholder="Repita a senha" autoComplete="new-password" required
                    className={naoCoincidem ? 'err' : undefined}
                    value={senha2} onChange={(e) => setSenha2(e.target.value)} />
                  <button type="button" className="eyebtn" aria-label={show2 ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow2(!show2)}>
                    <IconEye />
                  </button>
                </div>
                {naoCoincidem && <p className="msg err">As senhas não coincidem.</p>}
              </div>
              <label className="ckrow">
                <input type="checkbox" checked={termos} onChange={(e) => setTermos(e.target.checked)} />
                <span className="ck"><IconCheckWhite /></span>
                <span>Li e concordo com os <a href="#">Termos de uso</a> e a <a href="#">Política de privacidade</a>.</span>
              </label>
              {jaCadastrado && (
                <div className="banner-err">
                  <span><b>Esse e-mail já tem conta.</b> Entre com ele ou recupere a senha.</span>
                  <Link className="btn btn-ghost" href="/login">Ir pro login</Link>
                </div>
              )}
              <button type="submit" className="btn btn-roxo btn-full" disabled={loading || !termos}>
                {loading ? 'Criando conta…' : 'Criar conta grátis'}
              </button>
            </form>

            <p className="foot boot b5">Já tem conta? <Link href="/login">Entrar</Link></p>
          </div>

          <div className="wcol boot b4">
            <WinAreas />
            <div className="handrow draw rv">
              <HandArrow />
              <span className="hand" style={{ transform: 'rotate(-2deg)' }}>você escolhe as suas no primeiro acesso</span>
            </div>
            <Proof />
          </div>
        </main>

        <section className="wrap tease rv">
          <p className="eyebrow"><b>Oito áreas</b> · uma única interface</p>
          <WinAreas mobile />
          <div className="handrow draw rv">
            <HandArrow w={34} />
            <span className="hand" style={{ transform: 'rotate(-2deg)' }}>você escolhe as suas no primeiro acesso</span>
          </div>
          <Proof />
        </section>
      </div>
    </div>
  )
}
