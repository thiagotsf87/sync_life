'use client'

import { Check, X } from 'lucide-react'

const FREE_FEATURES = [
  { text: 'Transações: até 200/mês', included: true },
  { text: 'Orçamentos por envelope', included: true },
  { text: 'Metas: até 3 ativas', included: true },
  { text: 'Recorrentes: até 5 ativas', included: true },
  { text: 'Agenda: 50 eventos/mês', included: true },
  { text: 'Google Calendar', included: false },
  { text: 'Open Finance (bancos)', included: false },
  { text: 'WhatsApp Bot', included: false },
  { text: 'Exportação automática', included: false },
]

const PRO_FEATURES = [
  { text: 'Transações: ilimitadas' },
  { text: 'Orçamentos por envelope' },
  { text: 'Metas: ilimitadas' },
  { text: 'Recorrentes: ilimitadas' },
  { text: 'Agenda: ilimitados' },
  { text: 'Google Calendar (bidirecional)' },
  { text: 'Open Finance — 5 contas' },
  { text: 'WhatsApp Bot' },
  { text: 'Exportação automática mensal' },
]

const USAGE = [
  { label: 'Transações este mês', used: 47, limit: 200 },
  { label: 'Metas ativas', used: 2, limit: 3 },
  { label: 'Recorrentes ativas', used: 4, limit: 5 },
  { label: 'Eventos este mês', used: 12, limit: 50 },
]

function getBarColor(pct: number): string {
  if (pct > 90) return '#f43f5e'
  if (pct > 75) return '#f59e0b'
  return '#10b981'
}

function getValueColor(pct: number): string {
  if (pct > 90) return '#f43f5e'
  if (pct > 75) return '#f59e0b'
  return 'var(--sl-t2)'
}

export default function PlanoPage() {
  return (
    <div className="max-w-[680px]">
      <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)] mb-1">Meu Plano</h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-6">
        Gerencie sua assinatura e veja os limites do seu plano atual.
      </p>

      {/* Plan grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 max-sm:grid-cols-1">
        {/* FREE card */}
        <div className="bg-[var(--sl-s2)] border-2 border-[var(--sl-border)] rounded-[18px] p-5">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-md bg-[var(--sl-s3)] text-[var(--sl-t3)] mb-3">
            Free
          </span>
          <div className="mb-3">
            <p className="font-[Syne] font-extrabold text-3xl text-[var(--sl-t1)] leading-none">
              <sup className="text-base font-semibold align-super">R$</sup>0
              <sub className="text-[13px] font-normal text-[var(--sl-t3)] align-baseline">/mês</sub>
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] mt-1">Para sempre gratuito</p>
          </div>
          <div className="flex flex-col gap-2 mb-5">
            {FREE_FEATURES.map(({ text, included }) => (
              <div key={text} className="flex items-start gap-2 text-[12px]">
                {included ? (
                  <Check size={13} className="text-[#10b981] shrink-0 mt-0.5" />
                ) : (
                  <X size={13} className="text-[var(--sl-t3)] shrink-0 mt-0.5" />
                )}
                <span
                  className={included ? 'text-[var(--sl-t1)]' : 'text-[var(--sl-t3)] line-through'}
                >
                  {text}
                </span>
              </div>
            ))}
          </div>
          <button
            disabled
            className="w-full py-2.5 rounded-[10px] bg-[var(--sl-s3)] text-[var(--sl-t3)] text-[13px] font-bold cursor-default"
          >
            Plano atual
          </button>
        </div>

        {/* PRO card */}
        <div
          className="bg-[var(--sl-s2)] border-2 rounded-[18px] p-5 relative"
          style={{
            borderColor: '#10b981',
            boxShadow: '0 0 0 1px rgba(16,185,129,0.2), 0 8px 32px rgba(16,185,129,0.12)',
          }}
        >
          <div className="absolute top-3.5 right-3.5 text-[9px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-md bg-[rgba(16,185,129,0.15)] text-[#10b981]">
            Mais popular
          </div>
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-[0.06em] px-2 py-0.5 rounded-md mb-3 text-white"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(0,85,255,0.3))' }}
          >
            Pro
          </span>
          <div className="mb-3">
            <p className="font-[Syne] font-extrabold text-3xl text-[var(--sl-t1)] leading-none">
              <sup className="text-base font-semibold align-super">R$</sup>19
              <span className="text-xl">,90</span>
              <sub className="text-[13px] font-normal text-[var(--sl-t3)] align-baseline">/mês</sub>
            </p>
            <p className="text-[12px] text-[var(--sl-t3)] mt-1">ou R$ 179/ano (25% off)</p>
          </div>
          <div className="flex flex-col gap-2 mb-5">
            {PRO_FEATURES.map(({ text }) => (
              <div key={text} className="flex items-start gap-2 text-[12px]">
                <Check size={13} className="text-[#10b981] shrink-0 mt-0.5" />
                <span className="text-[var(--sl-t1)]">{text}</span>
              </div>
            ))}
          </div>
          <button
            className="w-full py-2.5 rounded-[10px] text-white text-[13px] font-bold transition-all hover:brightness-110 hover:-translate-y-px"
            style={{
              background: 'linear-gradient(135deg, #10b981, #0055ff)',
              boxShadow: '0 4px 20px rgba(16,185,129,0.25)',
            }}
          >
            ✦ Fazer upgrade para Pro
          </button>
          <p className="text-[11px] text-[var(--sl-t3)] text-center mt-2">
            7 dias grátis, cancele quando quiser
          </p>
        </div>
      </div>

      {/* Usage card (FREE users) */}
      <div className="bg-[var(--sl-s2)] border border-[var(--sl-border)] rounded-2xl p-5 transition-colors hover:border-[var(--sl-border-h)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--sl-t3)] mb-4">
          Uso atual do plano Free
        </p>
        <div className="flex flex-col gap-4">
          {USAGE.map(({ label, used, limit }) => {
            const pct = Math.round((used / limit) * 100)
            return (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] text-[var(--sl-t2)]">{label}</span>
                  <span
                    className="text-[12px] font-[DM_Mono] font-medium"
                    style={{ color: getValueColor(pct) }}
                  >
                    {used} / {limit}
                  </span>
                </div>
                <div className="h-[5px] bg-[var(--sl-s3)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{
                      width: `${pct}%`,
                      background: getBarColor(pct),
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
