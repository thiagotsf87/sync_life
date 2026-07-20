import { cn } from '@/lib/utils'

export type Rarity = 'comum' | 'rara' | 'epica' | 'lendaria'

const RARITY_MAP: Record<Rarity, { label: string; color: string; bg: string; border: string }> = {
  comum: {
    label: 'COMUM',
    color: 'var(--sl-t3)',
    bg: 'rgba(111,121,134,0.10)',
    border: 'rgba(111,121,134,0.30)',
  },
  rara: {
    label: 'RARA',
    color: 'var(--sl-info)',
    bg: 'rgba(60,160,181,0.10)',
    border: 'rgba(60,160,181,0.40)',
  },
  epica: {
    label: 'ÉPICA',
    color: 'var(--sl-mod-fut)',
    bg: 'rgba(139,123,212,0.12)',
    border: 'rgba(139,123,212,0.40)',
  },
  lendaria: {
    label: 'LENDÁRIA',
    color: 'var(--sl-gold)',
    bg: 'rgba(217,200,154,0.12)',
    border: 'rgba(217,200,154,0.45)',
  },
}

interface RarityPillProps {
  rarity: Rarity
  className?: string
}

export function RarityPill({ rarity, className }: RarityPillProps) {
  const r = RARITY_MAP[rarity] ?? RARITY_MAP.comum
  return (
    <span
      className={cn(
        'inline-flex items-center text-[9px] font-bold uppercase tracking-[0.10em] px-2 py-[2px] rounded-full border',
        className,
      )}
      style={{ color: r.color, background: r.bg, borderColor: r.border }}
    >
      {r.label}
    </span>
  )
}

// Helper: map engine rarity (common/uncommon/rare/legendary) → PT rarity
export function mapEngineRarity(r: string): Rarity {
  switch (r) {
    case 'rare':
      return 'rara'
    case 'uncommon':
      return 'epica'
    case 'legendary':
      return 'lendaria'
    case 'common':
    default:
      return 'comum'
  }
}
