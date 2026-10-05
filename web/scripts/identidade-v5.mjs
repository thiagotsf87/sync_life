// Teste de identidade v5: protótipo aprovado × rota real (Fase 1 em diante).
//
// Uso (de dentro de web/):
//   node scripts/identidade-v5.mjs login      abre um Chromium visível em /login; VOCÊ entra,
//                                             o script só guarda a sessão em
//                                             ../.playwright-mcp/auth-state.json (ignorado pelo git)
//   node scripts/identidade-v5.mjs comparar   captura protótipo e rota, desktop 1440 e mobile 390,
//                                             e escreve o diff em ../.playwright-mcp/identidade/
//
// Requisitos: app em `next start` (nunca dev: Turbopack e service worker) em APP_URL
// (default http://localhost:3006) e os protótipos servidos em PROTO_URL
// (default http://localhost:8765, `python -m http.server 8765` em prototypes/v5).
// O script nunca lê nem digita senha.

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import pixelmatch from 'pixelmatch'
import { PNG } from 'pngjs'

const APP = process.env.APP_URL ?? 'http://localhost:3006'
const PROTO = process.env.PROTO_URL ?? 'http://localhost:8765'
const RAIZ = path.resolve(process.cwd(), '..', '.playwright-mcp')
const ESTADO = path.join(RAIZ, 'auth-state.json')
const SAIDA = path.join(RAIZ, 'identidade')

const PARES = [
  { nome: 'meu-dia', proto: 'app/meu-dia-d', rota: '/dashboard' },
  { nome: 'financas', proto: 'app/financas-a', rota: '/financas' },
  { nome: 'life-score', proto: 'app/life-score-v2', rota: '/dashboard/score' },
  { nome: 'sua-semana', proto: 'app/sua-semana', rota: '/dashboard/review' },
  { nome: 'conversa', proto: 'app/conversa', rota: '/coach' },
]
const VIEWPORTS = [
  { nome: 'desktop', width: 1440, height: 900, mobile: false },
  { nome: 'mobile', width: 390, height: 844, mobile: true },
]

// Partes vivas que nunca batem pixel a pixel: o Enxame (WebGL) e o grão.
// A anotação do protótipo (.proto-estados) não existe no app. Camadas fechadas ficam fora: estão fora da viewport por transform e o fullPage as capturaria.
const NEUTRALIZA = `
  .sy40 canvas{visibility:hidden!important}
  .grain{display:none!important}
  .camada:not(.open),.scrim:not(.open){display:none!important}
  .proto-estados{display:none!important}
  *,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}
`

async function login() {
  fs.mkdirSync(RAIZ, { recursive: true })
  const b = await chromium.launch({ headless: false })
  const ctx = await b.newContext({ viewport: { width: 1280, height: 860 } })
  const p = await ctx.newPage()
  await p.goto(`${APP}/login`)
  console.log('Entre com a sua conta na janela aberta. Esperando chegar em /dashboard (até 5 min)...')
  await p.waitForURL(/\/dashboard/, { timeout: 5 * 60 * 1000 })
  await ctx.storageState({ path: ESTADO })
  console.log(`Sessão guardada em ${ESTADO}`)
  await b.close()
}

async function capturar(b, url, vp, comSessao) {
  const ctx = await b.newContext({
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    ...(comSessao && fs.existsSync(ESTADO) ? { storageState: ESTADO } : {}),
  })
  const p = await ctx.newPage()
  const erros = []
  p.on('pageerror', (e) => erros.push(e.message))
  p.on('console', (m) => { if (m.type() === 'error' && !/GL Driver|GPU stall|Failed to fetch/.test(m.text())) erros.push(m.text()) })
  // ERR_ABORTED é prefetch do Next cancelado ao fechar o contexto: ruído, não erro
  p.on('requestfailed', (r) => { const t = r.failure()?.errorText ?? '?'; if (t !== 'net::ERR_ABORTED') erros.push(`request falhou: ${r.method()} ${r.url()} (${t})`) })
  await p.goto(url, { waitUntil: 'networkidle' })
  await p.waitForTimeout(1500)
  await p.addStyleTag({ content: NEUTRALIZA })
  await p.evaluate(() => document.querySelectorAll('.rv,.boot').forEach((e) => e.classList.add('in')))
  await p.waitForTimeout(300)
  const png = await p.screenshot({ fullPage: true })
  const final = p.url()
  await ctx.close()
  return { png, erros, final }
}

function diff(aBuf, bBuf, arquivo) {
  const a = PNG.sync.read(aBuf)
  const b = PNG.sync.read(bBuf)
  const w = Math.max(a.width, b.width)
  const h = Math.max(a.height, b.height)
  const pad = (img) => {
    const out = new PNG({ width: w, height: h })
    out.data.fill(0)
    PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0)
    return out
  }
  const A = pad(a)
  const B = pad(b)
  const D = new PNG({ width: w, height: h })
  const n = pixelmatch(A.data, B.data, D.data, w, h, { threshold: 0.1 })
  fs.writeFileSync(arquivo, PNG.sync.write(D))
  return { diferentes: n, total: w * h, pct: (100 * n) / (w * h), alturaProto: a.height, alturaRota: b.height }
}

async function comparar() {
  fs.mkdirSync(SAIDA, { recursive: true })
  if (!fs.existsSync(ESTADO)) console.log('Aviso: sem sessão guardada; rodando sem login (rotas autenticadas vão redirecionar).')
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] })
  const linhas = []
  for (const par of PARES) {
    for (const vp of VIEWPORTS) {
      const sufixo = vp.mobile ? '.mobile' : ''
      const proto = await capturar(b, `${PROTO}/${par.proto}${sufixo}.html?v=${Date.now()}`, vp, false)
      const rota = await capturar(b, `${APP}${par.rota}`, vp, true)
      const base = path.join(SAIDA, `${par.nome}-${vp.nome}`)
      fs.writeFileSync(`${base}-proto.png`, proto.png)
      fs.writeFileSync(`${base}-rota.png`, rota.png)
      const d = diff(proto.png, rota.png, `${base}-diff.png`)
      linhas.push({
        tela: par.nome, vp: vp.nome,
        pct: d.pct.toFixed(2), alturas: `${d.alturaProto}/${d.alturaRota}`,
        redirecionou: !rota.final.includes(par.rota) ? rota.final : '',
        errosRota: rota.erros.length,
      })
      for (const e of rota.erros) console.log(`  [${par.nome} ${vp.nome}] ${e.slice(0, 300)}`)
    }
  }
  await b.close()
  console.table(linhas)
  fs.writeFileSync(path.join(SAIDA, 'relatorio.json'), JSON.stringify(linhas, null, 2))
}

const modo = process.argv[2]
if (modo === 'login') await login()
else if (modo === 'comparar') await comparar()
else console.log('uso: node scripts/identidade-v5.mjs login|comparar')
