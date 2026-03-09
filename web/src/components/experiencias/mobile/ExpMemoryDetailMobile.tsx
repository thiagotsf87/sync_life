import { ChevronLeft } from 'lucide-react'
import { EXP_PRIMARY } from '@/lib/exp-colors'
import { MEMORY_DETAIL_PORTUGAL } from '@/lib/exp-mock-data'

interface ExpMemoryDetailMobileProps {
  onBack: () => void
}

export function ExpMemoryDetailMobile({ onBack }: ExpMemoryDetailMobileProps) {
  const accent = EXP_PRIMARY
  const detail = MEMORY_DETAIL_PORTUGAL
  const economy = detail.budgetPlanned - detail.budgetReal
  const economyPct = ((economy / detail.budgetPlanned) * 100).toFixed(1)

  const textFields = [
    { icon: '⭐', label: 'Momento épico', value: detail.favoriteMoment },
    { icon: '🍽️', label: 'Melhor comida', value: detail.bestFood },
    { icon: '📸', label: 'Lugar mais bonito', value: detail.beautifulPlace },
    { icon: '💡', label: 'O que aprendi', value: detail.learning },
  ]

  return (
    <div className="px-5">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-[12px] font-medium mb-3"
        style={{ color: '#c4b5fd' }}
      >
        <ChevronLeft size={16} />
        Voltar
      </button>

      {/* Hero */}
      <div className="rounded-[16px] overflow-hidden mb-[14px]">
        <div
          className="h-[90px] flex items-end px-[14px] pb-[10px] relative"
          style={{
            background: 'linear-gradient(135deg, #1a0a2e 0%, #2d1b69 50%, #ec4899 150%)',
          }}
        >
          <span className="text-[30px] mr-[10px]">{detail.flag}</span>
          <div>
            <p className="font-[Syne] text-[16px] font-bold text-white">
              ✅ {detail.name.split(' — ')[0]} Conquistado
            </p>
            <p className="text-[11px] text-white/70 mt-[2px]">
              {detail.dates} · +50 XP
            </p>
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="text-center mb-[14px]">
        <div className="flex justify-center gap-[6px] mb-1">
          {[1, 2, 3, 4, 5].map(star => {
            const filled = star <= Math.round(detail.rating)
            return (
              <div
                key={star}
                className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[18px]"
                style={{
                  background: filled ? 'rgba(245,158,11,0.2)' : 'var(--sl-s2)',
                  border: `1px solid ${filled ? 'rgba(245,158,11,0.3)' : 'var(--sl-border)'}`,
                }}
              >
                {filled ? '⭐' : '☆'}
              </div>
            )
          })}
        </div>
        <p className="text-[11px] text-[var(--sl-t3)]">
          Experiência: {detail.rating} / 5
        </p>
      </div>

      {/* Text fields */}
      {textFields.map((field, i) => (
        <div key={i} className="mb-3">
          <p className="text-[11px] font-semibold text-[var(--sl-t2)] mb-1 flex items-center gap-1">
            {field.icon} {field.label}
          </p>
          <div
            className="rounded-[10px] px-3 py-[10px] text-[12px] text-[var(--sl-t1)] leading-[1.5]"
            style={{ background: 'var(--sl-s2)', border: '1px solid var(--sl-border)' }}
          >
            {field.value}
          </div>
        </div>
      ))}

      {/* Tags */}
      <div className="mb-[14px]">
        <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)] mb-[10px]">
          Emoções da Aventura
        </p>
        <div className="flex flex-wrap gap-[6px]">
          {detail.tags.map((tag, i) => (
            <span
              key={i}
              className="text-[11px] px-[10px] py-1 rounded-[20px]"
              style={{
                background: tag.selected
                  ? 'rgba(139,92,246,0.15)'
                  : 'var(--sl-s2)',
                border: `1px solid ${tag.selected
                  ? 'rgba(139,92,246,0.3)'
                  : 'var(--sl-border)'}`,
                color: tag.selected
                  ? '#c4b5fd'
                  : 'var(--sl-t2)',
              }}
            >
              {tag.label}
            </span>
          ))}
        </div>
      </div>

      {/* Budget comparison */}
      <div
        className="rounded-[14px] p-[14px] mb-4"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
      >
        <p className="text-[12px] font-semibold text-[var(--sl-t1)] mb-[10px]">
          💰 Orçado vs Real
        </p>
        <div className="flex justify-between items-center py-[6px]">
          <span className="text-[11px] text-[var(--sl-t2)]">Orçado</span>
          <span className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t1)]">
            R$ {detail.budgetPlanned.toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="flex justify-between items-center py-[6px]">
          <span className="text-[11px] text-[var(--sl-t2)]">Real gasto</span>
          <span className="font-[DM_Mono] text-[13px] font-medium text-[var(--sl-t1)]">
            R$ {detail.budgetReal.toLocaleString('pt-BR')}
          </span>
        </div>
        <div className="h-px my-[6px]" style={{ background: 'var(--sl-border)' }} />
        <div className="flex justify-between items-center py-[6px]">
          <span className="text-[11px] text-[var(--sl-t2)]">
            Economia 🎉
          </span>
          <span className="font-[DM_Mono] text-[13px] font-medium" style={{ color: economy >= 0 ? '#10b981' : '#f43f5e' }}>
            R$ {Math.abs(economy).toLocaleString('pt-BR')} ({economyPct}%)
          </span>
        </div>
      </div>
    </div>
  )
}
