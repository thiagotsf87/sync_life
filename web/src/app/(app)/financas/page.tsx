'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useShellStore } from '@/stores/shell-store'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTip,
  ResponsiveContainer
} from 'recharts'
import { cn } from '@/lib/utils'
import {
  CalendarDays, Plus, ChevronDown, ExternalLink,
  TrendingUp, TrendingDown, AlertTriangle
} from 'lucide-react'

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

const HIST_DATA = [
  { mes: 'Set', rec: 4200, des: 3600 },
  { mes: 'Out', rec: 4800, des: 3900 },
  { mes: 'Nov', rec: 5100, des: 4400 },
  { mes: 'Dez', rec: 6200, des: 5800 },
  { mes: 'Jan', rec: 4600, des: 3750 },
  { mes: 'Fev', rec: 5000, des: 3200 },
]

const CAT_DATA = [
  { nome: '🏠 Moradia', pct: 38, val: 1216, cor: '#3b82f6', delta: '+2%', tipo: 'stable' as const },
  { nome: '🍔 Alimentação', pct: 22, val: 704, cor: '#10b981', delta: '-8%', tipo: 'down' as const },
  { nome: '🚗 Transporte', pct: 16, val: 512, cor: '#f59e0b', delta: '+18%', tipo: 'warn' as const },
  { nome: '🎮 Lazer', pct: 13, val: 416, cor: '#f97316', delta: '+21%', tipo: 'alert' as const },
  { nome: '💊 Saúde', pct: 7, val: 224, cor: '#8b5cf6', delta: '-3%', tipo: 'stable' as const },
  { nome: '📦 Outros', pct: 4, val: 128, cor: '#64748b', delta: '0%', tipo: 'stable' as const },
]

const ENVELOPES = [
  { ico: '🏠', nome: 'Moradia', gasto: 1216, limite: 1400, pct: 87 },
  { ico: '🍔', nome: 'Alimentação', gasto: 704, limite: 900, pct: 78 },
  { ico: '🚗', nome: 'Transporte', gasto: 512, limite: 500, pct: 102 },
  { ico: '🎮', nome: 'Lazer', gasto: 416, limite: 500, pct: 83 },
  { ico: '💊', nome: 'Saúde', gasto: 224, limite: 400, pct: 56 },
]

const ULTIMAS_TXN = [
  { ico: '🏠', nome: 'Condomínio', data: '22/02', metodo: 'Débito', val: -850, cat: 'Moradia' },
  { ico: '🍔', nome: 'Mercado Extra', data: '21/02', metodo: 'Crédito', val: -187.5, cat: 'Alimentação' },
  { ico: '💰', nome: 'Salário', data: '20/02', metodo: 'Pix', val: 5000, cat: 'Receita' },
  { ico: '🚗', nome: 'Gasolina', data: '19/02', metodo: 'Crédito', val: -182, cat: 'Transporte' },
  { ico: '🎮', nome: 'Netflix', data: '18/02', metodo: 'Crédito', val: -45.9, cat: 'Lazer' },
  { ico: '💊', nome: 'Farmácia', data: '17/02', metodo: 'Débito', val: -67, cat: 'Saúde' },
  { ico: '🍔', nome: 'iFood', data: '16/02', metodo: 'Crédito', val: -89.9, cat: 'Alimentação' },
]

const RECORRENTES = [
  { ico: '🏠', nome: 'Aluguel', dt: '05/03', val: 1200, status: 'fut' as const },
  { ico: '💡', nome: 'Energia', dt: '10/03', val: 185, status: 'fut' as const },
  { ico: '🎮', nome: 'Netflix', dt: '25/02', val: 45.9, status: 'due' as const },
  { ico: '🎵', nome: 'Spotify', dt: 'pago', val: 21.9, status: 'ok' as const },
  { ico: '☁️', nome: 'iCloud', dt: '28/02', val: 16.9, status: 'due' as const },
]

const PROJ_MESES = [
  { mes: 'Fev', val: 1800, delta: '', nota: 'Mês atual', tipo: 'current' as const },
  { mes: 'Mar', val: 2100, delta: '+16%', nota: 'IPTU parcela', tipo: 'good' as const },
  { mes: 'Abr', val: 1950, delta: '-7%', nota: 'IPVA estimado', tipo: 'warn' as const },
  { mes: 'Mai', val: 2350, delta: '+21%', nota: 'Tendência +', tipo: 'good' as const },
  { mes: 'Jun', val: 2600, delta: '+11%', nota: 'Tendência +', tipo: 'good' as const },
]

// Cash flow: 28 days of Feb — deterministic data (no Math.random to avoid hydration errors)
const today = 22
const CF_DAYS = [
  { d:  1, inc: 800,  exp: 0,   isToday: false, isFuture: false },
  { d:  2, inc: 0,    exp: 120, isToday: false, isFuture: false },
  { d:  3, inc: 0,    exp: 0,   isToday: false, isFuture: false },
  { d:  4, inc: 0,    exp: 95,  isToday: false, isFuture: false },
  { d:  5, inc: 0,    exp: 850, isToday: false, isFuture: false },
  { d:  6, inc: 0,    exp: 0,   isToday: false, isFuture: false },
  { d:  7, inc: 0,    exp: 65,  isToday: false, isFuture: false },
  { d:  8, inc: 0,    exp: 45,  isToday: false, isFuture: false },
  { d:  9, inc: 0,    exp: 0,   isToday: false, isFuture: false },
  { d: 10, inc: 0,    exp: 180, isToday: false, isFuture: false },
  { d: 11, inc: 0,    exp: 0,   isToday: false, isFuture: false },
  { d: 12, inc: 0,    exp: 90,  isToday: false, isFuture: false },
  { d: 13, inc: 0,    exp: 30,  isToday: false, isFuture: false },
  { d: 14, inc: 0,    exp: 145, isToday: false, isFuture: false },
  { d: 15, inc: 0,    exp: 0,   isToday: false, isFuture: false },
  { d: 16, inc: 0,    exp: 90,  isToday: false, isFuture: false },
  { d: 17, inc: 0,    exp: 67,  isToday: false, isFuture: false },
  { d: 18, inc: 0,    exp: 46,  isToday: false, isFuture: false },
  { d: 19, inc: 0,    exp: 182, isToday: false, isFuture: false },
  { d: 20, inc: 5000, exp: 0,   isToday: false, isFuture: false },
  { d: 21, inc: 0,    exp: 187, isToday: false, isFuture: false },
  { d: 22, inc: 0,    exp: 0,   isToday: true,  isFuture: false },
  { d: 23, inc: 0,    exp: 0,   isToday: false, isFuture: true  },
  { d: 24, inc: 0,    exp: 0,   isToday: false, isFuture: true  },
  { d: 25, inc: 0,    exp: 46,  isToday: false, isFuture: true  },
  { d: 26, inc: 0,    exp: 0,   isToday: false, isFuture: true  },
  { d: 27, inc: 0,    exp: 0,   isToday: false, isFuture: true  },
  { d: 28, inc: 0,    exp: 850, isToday: false, isFuture: true  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function fmtR$(n: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.abs(n))
}

function getEnvColor(pct: number): string {
  if (pct >= 100) return '#f43f5e'
  if (pct >= 80) return '#f97316'
  if (pct >= 61) return '#f59e0b'
  return '#10b981'
}

// ─── DONUT CHART ─────────────────────────────────────────────────────────────

function DonutChart() {
  const R = 58, cx = 70, cy = 70, stroke = 11
  const total = CAT_DATA.reduce((s, c) => s + c.pct, 0)
  let offset = 0
  const circ = 2 * Math.PI * R
  const gaps = CAT_DATA.length * 2
  const usable = circ - gaps

  return (
    <div className="relative w-[140px] h-[140px] shrink-0">
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--sl-s3)" strokeWidth={stroke} />
        {CAT_DATA.map((cat) => {
          const len = (cat.pct / total) * usable
          const dashArr = `${len} ${circ - len}`
          const dashOff = -offset
          offset += len + 2
          return (
            <circle
              key={cat.nome}
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={cat.cor}
              strokeWidth={stroke}
              strokeDasharray={dashArr}
              strokeDashoffset={dashOff}
              strokeLinecap="round"
            />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t1)] leading-none">
          R$ 3.200
        </span>
        <span className="text-[9px] uppercase tracking-wider text-[var(--sl-t3)]">Gasto</span>
      </div>
    </div>
  )
}

// ─── CASH FLOW CHART ─────────────────────────────────────────────────────────

function FluxoCaixaChart() {
  const maxVal = Math.max(...CF_DAYS.map(d => Math.max(d.inc, 5000, d.exp)))
  const h = 88
  const n = CF_DAYS.length

  // Cumulative balance line (starts at a seed balance of 14850)
  const SEED_BAL = 14850
  const balances: number[] = []
  let running = SEED_BAL
  for (const d of CF_DAYS) {
    running += d.inc - d.exp
    balances.push(running)
  }
  const minBal = Math.min(...balances)
  const maxBal = Math.max(...balances)
  const balRange = Math.max(1, maxBal - minBal)

  const balPts = balances
    .map((b, i) => {
      const x = ((i + 0.5) / n) * 100
      const y = (1 - (b - minBal) / balRange) * (h - 6) + 3
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <div className="relative">
      {/* Legend */}
      <div className="flex items-center gap-3 mb-2">
        <span className="flex items-center gap-1 text-[10px] text-[var(--sl-t3)]">
          <span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#10b981', opacity: 0.8 }} />
          Receitas
        </span>
        <span className="flex items-center gap-1 text-[10px] text-[var(--sl-t3)]">
          <span className="w-3 h-2 rounded-sm inline-block" style={{ background: '#f43f5e', opacity: 0.7 }} />
          Despesas
        </span>
        <span className="flex items-center gap-1 text-[10px] text-[var(--sl-t3)]">
          <span className="w-6 h-px inline-block" style={{ background: '#0055ff' }} />
          Saldo
        </span>
      </div>
      {/* Y axis */}
      <div className="flex gap-1.5 items-start">
        <div className="relative shrink-0 w-8" style={{ height: h + 22 }}>
          {[5, 3.5, 2, 0.5].map((v, i) => (
            <span
              key={v}
              className="absolute right-0 font-[DM_Mono] text-[9px] text-[var(--sl-t3)]"
              style={{ top: `${(i / 3) * h}px`, transform: 'translateY(-50%)' }}
            >
              {v}k
            </span>
          ))}
        </div>
        <div className="flex-1 min-w-0 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ height: h }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="w-full h-px bg-[var(--sl-border)]" />
            ))}
          </div>
          {/* Bars */}
          <div className="flex items-end gap-px" style={{ height: h }}>
            {CF_DAYS.map(({ d, inc, exp, isToday, isFuture }) => {
              const incH = inc > 0 ? Math.max(4, (inc / maxVal) * h) : 0
              const expH = exp > 0 ? Math.max(2, (exp / maxVal) * h) : 0
              return (
                <div
                  key={d}
                  className="flex-1 flex flex-col items-center justify-end h-full relative group"
                >
                  {isToday && (
                    <>
                      <div className="absolute top-0 bottom-0 left-1/2 w-px bg-[#10b981] opacity-50 -translate-x-1/2" />
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-bold text-[#10b981] whitespace-nowrap bg-[rgba(16,185,129,0.1)] px-1 py-0.5 rounded">
                        Hoje
                      </div>
                    </>
                  )}
                  <div className="flex flex-col items-center w-full justify-end" style={{ height: h }}>
                    {incH > 0 && (
                      <div
                        className="w-4/5 max-w-[13px] rounded-t-sm"
                        style={{ height: incH, background: '#10b981', opacity: isFuture ? 0.3 : 0.8 }}
                      />
                    )}
                    {expH > 0 && (
                      <div
                        className="w-4/5 max-w-[13px] rounded-b-sm mt-px"
                        style={{ height: expH, background: '#f43f5e', opacity: isFuture ? 0.3 : 0.7 }}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Balance line SVG overlay */}
          <svg
            className="absolute top-0 left-0 w-full pointer-events-none"
            style={{ height: h }}
            viewBox={`0 0 100 ${h}`}
            preserveAspectRatio="none"
          >
            <polyline
              points={balPts}
              fill="none"
              stroke="#0055ff"
              strokeWidth="1"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {/* X axis labels */}
          <div className="flex gap-px mt-1.5">
            {CF_DAYS.map(({ d, isFuture }) => (
              d % 7 === 1 || d === CF_DAYS[CF_DAYS.length - 1].d ? (
                <div
                  key={d}
                  className="flex-1 text-center font-[DM_Mono] text-[10px] text-[var(--sl-t2)]"
                  style={{ opacity: isFuture ? 0.5 : 1 }}
                >
                  {String(d).padStart(2, '0')}
                </div>
              ) : <div key={d} className="flex-1" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CUSTOM BAR TOOLTIP ───────────────────────────────────────────────────────

function CustomHistTip({ active, payload, label }: { active?: boolean; payload?: {value:number;name:string}[]; label?: string }) {
  if (!active || !payload?.length) return null
  const rec = payload.find(p => p.name === 'rec')?.value ?? 0
  const des = payload.find(p => p.name === 'des')?.value ?? 0
  return (
    <div className="bg-[var(--sl-s2)] border border-[var(--sl-border-h)] rounded-xl px-3 py-2.5 text-[11px] shadow-xl">
      <p className="font-bold uppercase text-[10px] text-[var(--sl-t3)] mb-1.5">{label}</p>
      <div className="flex justify-between gap-3 mb-0.5">
        <span className="text-[var(--sl-t3)]">Receitas</span>
        <span className="font-[DM_Mono] text-[#10b981] font-medium">R$ {fmtR$(rec)}</span>
      </div>
      <div className="flex justify-between gap-3">
        <span className="text-[var(--sl-t3)]">Despesas</span>
        <span className="font-[DM_Mono] text-[#f43f5e] font-medium">R$ {fmtR$(des)}</span>
      </div>
      <div className="flex justify-between gap-3 border-t border-[var(--sl-border)] mt-2 pt-1.5">
        <span className="text-[var(--sl-t3)]">Saldo</span>
        <span className={cn('font-[DM_Mono] font-medium', rec - des >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]')}>
          R$ {fmtR$(rec - des)}
        </span>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function FinancasDashboardPage() {
  const mode = useShellStore((s) => s.mode)
  const isJornada = mode === 'jornada'
  const router = useRouter()
  const [fabOpen, setFabOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const fabRef = useRef<HTMLDivElement>(null)

  // Close FAB on outside click
  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) setFabOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const now = new Date()
  const mesAno = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())

  return (
    <div className="max-w-[1140px] mx-auto">

      {/* ① PAGE HEADER */}
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#10b981] mb-1">
            <div className="w-[5px] h-[5px] rounded-full bg-[#10b981]" />
            Módulo Finanças
          </div>
          <h1 className="font-[Syne] font-extrabold text-[22px] text-[var(--sl-t1)] tracking-tight leading-none">
            Visão Geral
          </h1>
          <p className="text-[11px] text-[var(--sl-t3)] mt-1">
            Fevereiro 2026 · semana 3 de 4 · 6 dias restantes
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] border border-[var(--sl-border)] bg-[var(--sl-s1)] text-[var(--sl-t2)] text-[12px] hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-colors">
            <CalendarDays size={12} />
            Fevereiro 2026
            <ChevronDown size={10} />
          </button>
          <button
            onClick={() => router.push('/financas/transacoes')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-[9px] border-none text-white text-[12px] font-bold transition-all hover:brightness-110"
            style={{ background: '#10b981' }}
          >
            <Plus size={12} />
            Nova Transação
          </button>
        </div>
      </div>

      {/* ② KPI STRIP */}
      <div className="grid grid-cols-4 gap-2.5 mb-3 max-sm:grid-cols-2">
        {/* Receitas */}
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
          <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#10b981' }} />
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(16,185,129,0.12)' }}>💰</div>
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Receitas</p>
          <p className="font-[DM_Mono] text-[21px] font-medium leading-none text-[#10b981] mb-1">R$ 5.000</p>
          <p className="text-[11px] text-[#10b981] flex items-center gap-1"><TrendingUp size={11} />↑ +12% vs. janeiro</p>
        </div>
        {/* Despesas */}
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
          <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#f43f5e' }} />
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(244,63,94,0.12)' }}>📤</div>
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Despesas</p>
          <p className="font-[DM_Mono] text-[21px] font-medium leading-none text-[#f43f5e] mb-1">R$ 3.200</p>
          <p className="text-[11px] text-[#f43f5e] flex items-center gap-1"><TrendingUp size={11} />↑ +8% vs. janeiro</p>
        </div>
        {/* Saldo */}
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
          <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#10b981' }} />
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(16,185,129,0.12)' }}>💚</div>
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Saldo do Mês</p>
          <p className="font-[DM_Mono] text-[21px] font-medium leading-none text-[var(--sl-t1)] mb-1">R$ 1.800</p>
          <p className="text-[11px] text-[#10b981]">↑ +R$ 342 vs. janeiro</p>
          <div className="mt-2 px-1.5 py-1 rounded-[6px] bg-[var(--sl-s2)] text-[11px] text-[var(--sl-t3)]">
            Disponível livre: <strong className="text-[#10b981]">R$ 620</strong>
          </div>
        </div>
        {/* Taxa Poupança */}
        <div className="relative bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] px-4 py-4 overflow-hidden hover:border-[var(--sl-border-h)] transition-colors">
          <div className="absolute top-0 left-4 right-4 h-0.5 rounded-b" style={{ background: '#0055ff' }} />
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-sm mb-2.5" style={{ background: 'rgba(0,85,255,0.12)' }}>📊</div>
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Taxa de Poupança</p>
          <p className="font-[DM_Mono] text-[21px] font-medium leading-none mb-1" style={{ color: '#0055ff' }}>36%</p>
          <p className="text-[11px] text-[#10b981]">↑ +4pp vs. janeiro</p>
          <div className="mt-2 px-1.5 py-1 rounded-[6px] bg-[var(--sl-s2)] text-[11px] text-[var(--sl-t3)]">
            Meta: <strong className="text-[var(--sl-t1)]">30%</strong> · <span className="text-[#10b981]">✓ acima</span>
          </div>
        </div>
      </div>

      {/* ③ SAÚDE / FOCO BAND */}
      {isJornada ? (
        <div
          className="flex items-center gap-4 rounded-[14px] px-4 py-3 mb-3"
          style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.07),rgba(0,85,255,.07))', border: '1px solid rgba(16,185,129,.18)' }}
        >
          <div className="shrink-0 text-center">
            <p className="font-[Syne] font-extrabold text-[42px] leading-none" style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>88</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-[var(--sl-t3)] mt-0.5">Saúde Fin.</p>
          </div>
          <div className="w-px h-11 bg-[var(--sl-border)] shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)] mb-0.5">Mês excelente até aqui! 🎉</p>
            <p className="text-[12px] text-[var(--sl-t3)] italic leading-snug">22 dias seguidos registrando tudo. Despesas 8% acima do planejado, mas receita compensou. Atenção ao Lazer.</p>
            <div className="flex gap-1.5 flex-wrap mt-2">
              {['✓ Poupança acima da meta', '✓ 3 metas no ritmo'].map(t => (
                <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.12)] text-[#10b981]">{t}</span>
              ))}
              {['⚠ Lazer em 82%', '⚠ 1 meta atrasada'].map(t => (
                <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(245,158,11,0.12)] text-[#f59e0b]">{t}</span>
              ))}
            </div>
          </div>
          <button
            onClick={() => router.push('/financas/relatorios')}
            className="shrink-0 px-3 py-1.5 rounded-[9px] border-none text-white text-[11px] font-bold"
            style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)' }}
          >
            Ver análise
          </button>
        </div>
      ) : (
        <div className="flex bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] mb-3 overflow-hidden">
          {[
            { lbl: 'Orçamentos OK', val: '4 / 5', color: '#10b981' },
            { lbl: 'Maior categoria', val: 'Moradia', color: '#0055ff' },
            { lbl: 'Streak de registro', val: '22 dias', color: '#10b981' },
            { lbl: 'Recorrentes pendentes', val: '2', color: '#f59e0b' },
          ].map((m, i) => (
            <div key={m.lbl} className={cn('flex-1 px-4 py-3', i < 3 && 'border-r border-[var(--sl-border)]')}>
              <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">{m.lbl}</p>
              <p className="font-[DM_Mono] text-[18px] font-medium leading-none" style={{ color: m.color }}>{m.val}</p>
            </div>
          ))}
        </div>
      )}

      {/* ④ CONSULTOR IA */}
      <div
        className="relative overflow-hidden rounded-[14px] px-5 py-[18px] mb-3"
        style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.10),rgba(0,85,255,.10))', border: '1px solid rgba(16,185,129,.28)' }}
      >
        {/* Decorative glows */}
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(16,185,129,.14),transparent 70%)' }} />
        <div className="absolute -bottom-10 left-1/3 w-44 h-44 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle,rgba(0,85,255,.10),transparent 70%)' }} />

        <div className="flex items-center gap-3 mb-4 relative">
          <div className="w-[38px] h-[38px] rounded-[12px] flex items-center justify-center text-lg shrink-0" style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)', boxShadow: '0 4px 16px rgba(16,185,129,.35)' }}>
            💡
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-[Syne] font-extrabold text-[15px] text-[var(--sl-t1)] tracking-tight">Consultor Financeiro IA</p>
            <p className="text-[11px] text-[var(--sl-t3)] mt-0.5">Análise personalizada · Fevereiro 2026 · atualizado agora</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold text-[#10b981] shrink-0" style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.20)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            4 insights hoje
          </div>
        </div>

        {/* Insights 2x2 grid */}
        <div className="grid grid-cols-2 gap-2 mb-4 max-sm:grid-cols-1 relative">
          {[
            { type: 'urgent', ico: '🔥', tag: 'Alerta', border: 'rgba(244,63,94,.25)', bg: 'rgba(244,63,94,.04)', tagColor: '#f43f5e', text: <><strong>Lazer atingiu 82%</strong> do orçamento. Com 8 dias restantes, risco de estouro de <span className="text-[#f43f5e]">R$ 84</span>.</> },
            { type: 'action', ico: '🎯', tag: 'Ação recomendada', border: 'rgba(0,85,255,.20)', bg: 'rgba(0,85,255,.04)', tagColor: '#0055ff', text: <>Meta <strong>Reserva de emergência</strong> está <span className="text-[#f43f5e]">3%</span> abaixo. Aporte de <span className="text-[#0055ff]">R$ 120</span> colocaria no ritmo.</> },
            { type: 'positive', ico: '🌟', tag: 'Conquista', border: 'rgba(16,185,129,.20)', bg: 'rgba(16,185,129,.04)', tagColor: '#10b981', text: <><strong>Alimentação reduziu 8%</strong> vs. janeiro. Economia de <span className="text-[#10b981]">R$ 63</span> neste mês. Continue!</> },
            { type: 'heads-up', ico: '📅', tag: 'Previsão', border: 'rgba(245,158,11,.20)', bg: 'rgba(245,158,11,.04)', tagColor: '#f59e0b', text: <>IPVA estimado em <strong>março</strong>: <span className="text-[#f59e0b]">R$ 820</span>. Reserve essa quantia este mês para não impactar o saldo.</> },
          ].map(ins => (
            <div
              key={ins.type}
              className="flex gap-2.5 px-3 py-3 rounded-[11px] cursor-default group relative overflow-hidden transition-all duration-200"
              style={{ border: `1px solid ${ins.border}`, background: ins.bg }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 16px ${ins.border}` }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none' }}
            >
              <span className="text-[20px] shrink-0 leading-none mt-0.5">{ins.ico}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] mb-1" style={{ color: ins.tagColor }}>{ins.tag}</p>
                <p className="text-[12px] text-[var(--sl-t2)] leading-snug">{ins.text}</p>
              </div>
              {/* Shine line */}
              <div className="absolute bottom-0 left-[10%] right-[10%] h-0.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: ins.tagColor, boxShadow: `0 0 8px ${ins.tagColor}` }} />
            </div>
          ))}
        </div>

        {/* Ask AI input */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-[12px] relative"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(16,185,129,.15)' }}
        >
          <span className="text-sm opacity-70">💬</span>
          <input
            type="text"
            value={aiQuery}
            onChange={e => setAiQuery(e.target.value)}
            placeholder='Pergunte algo... ex: "Quanto gastei em lazer este mês?"'
            className="flex-1 bg-transparent border-none outline-none text-[13px] text-[var(--sl-t1)] placeholder:text-[var(--sl-t3)]"
          />
          <button
            className="shrink-0 px-3 py-1.5 rounded-[8px] border-none text-white text-[12px] font-bold transition-opacity hover:opacity-85"
            style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)' }}
          >
            Perguntar
          </button>
        </div>
      </div>

      {/* ⑤ TOP GRID: Histórico + Gastos por Categoria */}
      <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: '1fr 400px' }}>
        {/* Histórico */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Histórico — Receitas vs Despesas</p>
          </div>
          <div className="flex gap-1.5 items-start">
            <div className="flex flex-col justify-between text-right" style={{ height: 130, paddingBottom: 24 }}>
              {['7k', '5k', '3k', '1k'].map(v => (
                <span key={v} className="font-[DM_Mono] text-[9px] text-[var(--sl-t3)] leading-none">{v}</span>
              ))}
            </div>
            <div className="flex-1 min-w-0">
              <ResponsiveContainer width="100%" height={130}>
                <BarChart data={HIST_DATA} barCategoryGap="20%" barGap={2}>
                  <CartesianGrid vertical={false} stroke="var(--sl-border)" strokeOpacity={0.5} />
                  <XAxis dataKey="mes" tick={{ fill: 'var(--sl-t3)', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <RechartsTip content={<CustomHistTip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="rec" fill="#10b981" fillOpacity={0.75} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="des" fill="#f43f5e" fillOpacity={0.65} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex gap-3 mt-2 pt-2 border-t border-[var(--sl-border)]">
            {[{ cor: '#10b981', label: 'Receitas' }, { cor: '#f43f5e', label: 'Despesas' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t3)]">
                <div className="w-[7px] h-[7px] rounded-sm" style={{ background: l.cor }} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Gastos por Categoria */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-4">
            <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Gastos por Categoria</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[rgba(245,158,11,0.12)] text-[#f59e0b]">⚠ Lazer +21%</span>
          </div>
          <div className="flex gap-4 items-start">
            <DonutChart />
            <div className="flex-1 min-w-0">
              {CAT_DATA.map(cat => (
                <div key={cat.nome} className="flex items-center gap-2 py-1.5 border-b border-[var(--sl-border)] last:border-b-0">
                  <div className="w-[9px] h-[9px] rounded-full shrink-0" style={{ background: cat.cor }} />
                  <span className="flex-1 min-w-0 text-[12px] text-[var(--sl-t2)] truncate">
                    {cat.nome}
                    {' '}
                    <span className={cn('text-[10px]', cat.tipo === 'down' ? 'text-[#10b981]' : cat.tipo === 'warn' ? 'text-[#f59e0b]' : cat.tipo === 'alert' ? 'text-[#f97316]' : 'text-[var(--sl-t3)]')}>
                      {cat.tipo === 'down' ? '↓' : cat.tipo === 'alert' ? '⚠' : cat.tipo === 'warn' ? '↑' : '='} {cat.delta}
                    </span>
                  </span>
                  <span className="font-bold text-[13px] text-[var(--sl-t1)] shrink-0">{cat.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ⑥ FLUXO DE CAIXA */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 mb-3 hover:border-[var(--sl-border-h)] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Fluxo de Caixa — Dia a Dia</p>
        </div>
        {/* Explanation */}
        <div className="flex gap-2.5 px-3 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] text-[12px] text-[var(--sl-t3)] leading-relaxed mb-4">
          <span className="text-[15px] shrink-0 mt-0.5">ℹ️</span>
          <p>
            <strong className="text-[var(--sl-t1)]">Como ler:</strong> Cada coluna = 1 dia.{' '}
            <strong className="text-[var(--sl-t1)]">■ Verde</strong> = dinheiro que entrou.{' '}
            <strong className="text-[var(--sl-t1)]">■ Vermelho</strong> = quanto saiu.
            Colunas esmaecidas após {today}/02 são previsões.
          </p>
        </div>
        <FluxoCaixaChart />
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-2 mt-3 max-sm:grid-cols-2">
          {[
            { lbl: 'Maior entrada', val: 'R$ 5.000', sub: 'dia 20 · Salário', color: '#10b981' },
            { lbl: 'Maior saída num dia', val: 'R$ 850', sub: 'dia 05 · Aluguel', color: '#f43f5e' },
            { lbl: 'Saldo mais baixo', val: 'R$ 312', sub: 'dia 14', color: '#f43f5e' },
            { lbl: 'Saldo hoje', val: 'R$ 2.150', sub: `22/02 · ${isJornada ? 'ótimo ritmo!' : 'disponível'}`, color: '#0055ff' },
          ].map(s => (
            <div key={s.lbl} className="flex flex-col gap-0.5 px-3 py-2 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)]">{s.lbl}</p>
              <p className="font-[DM_Mono] text-[14px] font-medium" style={{ color: s.color }}>{s.val}</p>
              <p className="text-[10px] text-[var(--sl-t3)]">{s.sub}</p>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex gap-3.5 mt-2.5 pt-2.5 border-t border-[var(--sl-border)] flex-wrap">
          {[
            { tipo: 'sq', cor: '#10b981', label: 'Entrada no dia' },
            { tipo: 'sq', cor: '#f43f5e', label: 'Saída no dia' },
            { tipo: 'line', cor: '#0055ff', label: 'Saldo na conta' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-[var(--sl-t3)]">
              {l.tipo === 'sq'
                ? <div className="w-[9px] h-[9px] rounded-sm" style={{ background: l.cor }} />
                : <div className="w-4 h-0.5 rounded" style={{ background: l.cor }} />
              }
              {l.label}
            </div>
          ))}
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-[var(--sl-t3)]">
            <div className="w-[9px] h-[9px] rounded-sm border border-dashed border-[var(--sl-t3)] opacity-60" />
            Dias previstos
          </div>
        </div>
      </div>

      {/* ⑦ MID GRID: Orçamentos + Últimas Transações */}
      <div className="grid grid-cols-2 gap-3 mb-3 max-lg:grid-cols-1">
        {/* Orçamentos */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Orçamentos do Mês</p>
            <button onClick={() => router.push('/financas/orcamentos')} className="text-[11px] text-[#10b981] hover:underline">Ver todos</button>
          </div>
          {/* Budget Health Score */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-[var(--sl-s2)] rounded-[9px] border border-[var(--sl-border)]">
            <span className="text-[11px] text-[var(--sl-t3)] flex-1">Saúde dos envelopes</span>
            <div className="flex gap-1">
              {ENVELOPES.map(e => (
                <div key={e.nome} className="w-2 h-2 rounded-full" style={{ background: getEnvColor(e.pct) }} />
              ))}
            </div>
            <span className="text-[11px] font-bold text-[var(--sl-t2)]">3 ok · 2 atenção</span>
          </div>
          {/* Envelopes list */}
          <div className="flex flex-col gap-2">
            {ENVELOPES.map(e => (
              <div key={e.nome} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-[13px]">{e.ico}</span>
                    <span className="text-[12px] text-[var(--sl-t2)] truncate">{e.nome}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-[DM_Mono] text-[11px] text-[var(--sl-t3)] whitespace-nowrap">
                      <strong className="text-[var(--sl-t2)]">R$ {fmtR$(e.gasto)}</strong> / {fmtR$(e.limite)}
                    </span>
                    <span className="text-[10px] font-bold w-[26px] text-right" style={{ color: getEnvColor(e.pct) }}>{e.pct}%</span>
                  </div>
                </div>
                <div className="h-1 bg-[var(--sl-s3)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(e.pct, 100)}%`, background: getEnvColor(e.pct) }} />
                </div>
              </div>
            ))}
          </div>
          {/* Não alocado */}
          <div className="mt-3 px-2.5 py-2 rounded-[9px] flex items-center justify-between" style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.14)' }}>
            <span className="text-[11px] text-[var(--sl-t2)]">Não alocado</span>
            <span className="font-[DM_Mono] text-[13px] font-medium text-[#10b981]">R$ 300</span>
          </div>
        </div>

        {/* Últimas Transações */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 hover:border-[var(--sl-border-h)] transition-colors">
          <div className="flex items-center justify-between mb-3">
            <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Últimas Transações</p>
            <button onClick={() => router.push('/financas/transacoes')} className="text-[11px] text-[#10b981] hover:underline flex items-center gap-1">
              Ver todas <ExternalLink size={9} />
            </button>
          </div>
          <div className="flex flex-col">
            {ULTIMAS_TXN.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 py-2 border-b border-[var(--sl-border)] last:border-b-0 cursor-pointer rounded-[8px] hover:bg-[var(--sl-s2)] hover:px-2 hover:-mx-2 transition-all"
              >
                <div className="w-[29px] h-[29px] rounded-[8px] flex items-center justify-center text-[13px] shrink-0 bg-[var(--sl-s3)]">{t.ico}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-[var(--sl-t1)] truncate">{t.nome}</p>
                  <p className="text-[10px] text-[var(--sl-t3)]">{t.data} · {t.metodo}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={cn('font-[DM_Mono] text-[12px] font-medium', t.val < 0 ? 'text-[#f43f5e]' : 'text-[#10b981]')}>
                    {t.val > 0 ? '+' : ''}R$ {fmtR$(t.val)}
                  </p>
                  <p className="text-[10px] text-[var(--sl-t3)]">{t.cat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ⑧ PROJEÇÃO DE SALDO */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-5 mb-3 hover:border-[var(--sl-border-h)] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Projeção de Saldo — Timeline</p>
          <button onClick={() => router.push('/financas/planejamento')} className="text-[11px] text-[#10b981] hover:underline flex items-center gap-1">
            Ver planejamento <ExternalLink size={9} />
          </button>
        </div>

        {/* Saldo atual highlight */}
        <div className="flex items-center gap-4 px-4 py-3 rounded-[12px] mb-4" style={{ background: 'linear-gradient(135deg,rgba(16,185,129,.08),rgba(0,85,255,.06))', border: '1px solid rgba(16,185,129,.18)' }}>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-[var(--sl-t3)] mb-1">Saldo disponível agora</p>
            <p className="font-[DM_Mono] text-[28px] font-medium text-[var(--sl-t1)] leading-none">R$ 2.150</p>
            <p className="text-[11px] text-[var(--sl-t3)] mt-1">22 de fevereiro de 2026 · após condomínio</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {[
              { lbl: 'Comprometido', val: 'R$ 1.530', cor: '#f43f5e' },
              { lbl: 'Livre estimado', val: 'R$ 620', cor: '#10b981' },
              { lbl: 'Taxa poupança', val: '36%', cor: '#0055ff' },
            ].map(p => (
              <div key={p.lbl} className="text-center px-3 py-1.5 rounded-[8px] bg-[var(--sl-s2)]">
                <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)]">{p.lbl}</p>
                <p className="font-[DM_Mono] text-[13px] font-medium" style={{ color: p.cor }}>{p.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Rail */}
          <div className="absolute top-[18px] left-[10%] right-[10%] h-0.5 bg-[var(--sl-s3)] rounded">
            <div className="h-full rounded" style={{ width: '20%', background: 'linear-gradient(90deg,#10b981,#0055ff)' }} />
          </div>
          <div className="flex gap-2">
            {PROJ_MESES.map(m => (
              <div
                key={m.mes}
                className={cn('flex-1 rounded-[9px] px-3 py-3 cursor-pointer transition-all', m.tipo === 'warn' && 'hover:brightness-105')}
                style={{
                  border: m.tipo === 'current' ? '1px solid rgba(16,185,129,.30)' : m.tipo === 'warn' ? '1px solid rgba(244,63,94,.30)' : '1px solid rgba(0,85,255,.20)',
                  background: m.tipo === 'current' ? 'rgba(16,185,129,.06)' : m.tipo === 'warn' ? 'rgba(244,63,94,.05)' : 'rgba(0,85,255,.04)',
                }}
              >
                {/* Dot */}
                <div className="flex justify-center mb-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 border-white"
                    style={{
                      background: m.tipo === 'current' ? '#10b981' : m.tipo === 'warn' ? '#f43f5e' : '#0055ff',
                      boxShadow: m.tipo === 'current' ? '0 0 8px rgba(16,185,129,.5)' : m.tipo === 'warn' ? '0 0 8px rgba(244,63,94,.5)' : '0 0 8px rgba(0,85,255,.4)',
                    }}
                  />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--sl-t3)] mb-0.5">{m.mes}</p>
                <p className={cn('font-[DM_Mono] text-[16px] font-medium leading-none mb-0.5', m.tipo === 'warn' ? 'text-[#f43f5e]' : 'text-[var(--sl-t1)]')}>
                  R$ {fmtR$(m.val)}
                </p>
                {m.delta && (
                  <p className={cn('text-[10px] mb-0.5', m.tipo === 'warn' ? 'text-[#f43f5e]' : 'text-[#10b981]')}>
                    {m.tipo === 'warn' ? '↓' : '↑'} {m.delta}
                  </p>
                )}
                <p className={cn('text-[10px]', m.tipo === 'warn' ? 'text-[#f43f5e]' : 'text-[var(--sl-t3)]')}>{m.nota}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alert */}
        <div className="flex items-start gap-2 mt-3 px-3 py-2 rounded-[8px]" style={{ background: 'rgba(244,63,94,.06)', border: '1px solid rgba(244,63,94,.20)' }}>
          <AlertTriangle size={14} className="text-[#f43f5e] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#f43f5e]">
            <strong>Abril pode ter queda de 7%</strong> por causa do IPVA. Recomendamos reservar R$ 120/mês a partir de março para cobrir sem impacto no saldo.
          </p>
        </div>
      </div>

      {/* ⑨ PRÓXIMAS RECORRENTES */}
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-4 mb-6 hover:border-[var(--sl-border-h)] transition-colors">
        <div className="flex items-center justify-between mb-3">
          <p className="font-[Syne] font-bold text-[13px] text-[var(--sl-t1)]">Próximas Recorrentes</p>
          <button onClick={() => router.push('/financas/recorrentes')} className="text-[11px] text-[#10b981] hover:underline">Ver todas</button>
        </div>
        <div className="grid grid-cols-5 gap-2 max-sm:grid-cols-3">
          {RECORRENTES.map(r => (
            <div
              key={r.nome}
              className="flex flex-col gap-1.5 px-2.5 py-2.5 rounded-[10px] bg-[var(--sl-s2)] border border-[var(--sl-border)] cursor-pointer hover:border-[var(--sl-border-h)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{r.ico}</span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                  style={{
                    background: r.status === 'ok' ? 'rgba(16,185,129,.12)' : r.status === 'due' ? 'rgba(245,158,11,.12)' : 'rgba(110,144,184,.10)',
                    color: r.status === 'ok' ? '#10b981' : r.status === 'due' ? '#f59e0b' : 'var(--sl-t3)',
                  }}
                >
                  {r.status === 'ok' ? 'pago' : r.status === 'due' ? r.dt : r.dt}
                </span>
              </div>
              <p className="text-[11px] font-semibold text-[var(--sl-t1)] leading-tight">{r.nome}</p>
              <p className="font-[DM_Mono] text-[12px] font-medium text-[#f43f5e]">R$ {fmtR$(r.val)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ⑩ FAB */}
      <div ref={fabRef} className="fixed bottom-5 right-5 flex flex-col items-end gap-2 z-50">
        {fabOpen && (
          <div className="flex flex-col items-end gap-1.5 mb-1">
            {[
              { label: 'Nova Transação', ico: '💳', href: '/financas/transacoes' },
              { label: 'Nova Recorrente', ico: '🔄', href: '/financas/recorrentes' },
              { label: 'Novo Orçamento', ico: '💼', href: '/financas/orcamentos' },
            ].map(a => (
              <button
                key={a.label}
                onClick={() => { router.push(a.href); setFabOpen(false) }}
                className="flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl bg-[var(--sl-s1)] border border-[var(--sl-border)] text-[12px] font-semibold text-[var(--sl-t1)] shadow-xl hover:border-[var(--sl-border-h)] transition-all"
              >
                <span>{a.ico}</span>
                {a.label}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setFabOpen(o => !o)}
          className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:brightness-110 hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#10b981,#0055ff)', boxShadow: '0 4px 20px rgba(16,185,129,.35)', transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          <Plus size={20} />
        </button>
      </div>

    </div>
  )
}
