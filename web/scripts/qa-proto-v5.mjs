// QA dos protótipos v5 (brief §8): console, overflow-x, palavras proibidas, dispositivos de revista,
// "O que Sy lê aqui" presente. Uso (de web/): node scripts/qa-proto-v5.mjs app/a.html app/b.mobile.html ...
// Requer `python -m http.server 8765` em prototypes/v5. Screenshots em ../.playwright-mcp/qa-proto/.
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.PROTO_URL ?? 'http://localhost:8765'
const OUT = path.resolve(process.cwd(), '..', '.playwright-mcp', 'qa-proto')
fs.mkdirSync(OUT, { recursive: true })
const PROIBIDAS = /edi[çc][aã]o|folha|manchete|colof[aã]o|jornal|byline|reda[çc][aã]o|di[aá]rio|coach|assessor|\bo Sy\b|\bao Sy\b|\bdo Sy\b|—/gi

const arquivos = process.argv.slice(2)
const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] })
const linhas = []
for (const arq of arquivos) {
  const mob = arq.includes('.mobile.')
  const ctx = await b.newContext({ viewport: mob ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mob, hasTouch: mob, deviceScaleFactor: 1 })
  const p = await ctx.newPage()
  const erros = []
  p.on('pageerror', (e) => erros.push(e.message))
  p.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/GL Driver|GPU stall|WebGL|three/i.test(m.text())) erros.push(m.type() + ': ' + m.text()) })
  p.on('requestfailed', (r) => erros.push('falhou: ' + r.url()))
  await p.goto(`${BASE}/${arq}?v=${Date.now()}`, { waitUntil: 'networkidle' })
  await p.waitForTimeout(800)
  const r = await p.evaluate((re) => {
    const rx = new RegExp(re, 'gi')
    const vis = Array.from(document.querySelectorAll('body *')).filter((e) => !e.closest('.proto-estados') && !e.closest('script,style'))
    const texto = document.body.innerText
    const anot = document.querySelector('.proto-estados')
    const texto2 = anot ? texto.replace(anot.innerText, '') : texto
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      proibidas: (texto2.match(rx) || []).join(','),
      revista: ['.ticker', '.lt', '.selo', '.hand', '.hl'].filter((s) => document.querySelector(s)).join(','),
      caveat: Array.from(document.styleSheets).some((s) => (s.href || '').includes('Caveat')),
      syLe: /o que sy lê aqui/i.test(document.body.innerText),
      alvosPequenos: (document.documentElement.classList.contains('mob'))
        ? Array.from(document.querySelectorAll('a,button,select,input,[role=button]')).filter((e) => !e.closest('.proto-estados') && !e.closest('[inert]') && e.offsetParent && (() => { const q = e.getBoundingClientRect(); return q.height > 0 && q.height < 40 })()).length
        : 0,
      n: vis.length,
    }
  }, PROIBIDAS.source)
  await p.addStyleTag({ content: '.camada:not(.open),.scrim:not(.open),.painel:not(.open){display:none!important} html.mob .bbar{position:static!important} *,*::before,*::after{transition:none!important;animation:none!important}' })
  await p.evaluate(() => document.querySelectorAll('.rv,.boot,.draw').forEach((e) => e.classList.add('in')))
  await p.waitForTimeout(200)
  await p.screenshot({ path: path.join(OUT, arq.replace(/[\/]/g, '_').replace('.html', '.png')), fullPage: true })
  linhas.push({ arq, erros: erros.length, overflow: r.overflow, proibidas: r.proibidas || '', revista: r.revista || '', caveat: r.caveat, syLe: r.syLe, alvos40: r.alvosPequenos })
  for (const e of erros) console.log(`  [${arq}] ${e.slice(0, 200)}`)
  await ctx.close()
}
await b.close()
console.table(linhas)
