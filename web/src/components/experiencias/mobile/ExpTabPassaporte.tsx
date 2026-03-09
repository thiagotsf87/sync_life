import { EXP_PRIMARY } from '@/lib/exp-colors'
import { ExpWorldMap } from '@/components/experiencias/mobile/ExpWorldMap'
import type { PassportData } from '@/hooks/use-experiencias'
import {
  PASSPORT_STATS,
  PASSPORT_CONTINENTS,
  PASSPORT_BADGES,
  PASSPORT_COUNTRIES,
  PASSPORT_PINS,
} from '@/lib/exp-mock-data'
import type { MapPin } from '@/lib/exp-mock-data'

interface ExpTabPassaporteProps {
  passport?: PassportData | null
  loading?: boolean
}

export function ExpTabPassaporte({ passport, loading }: ExpTabPassaporteProps) {
  const accent = EXP_PRIMARY
  const accentLight = '#c4b5fd'

  // Use real data if available, fallback to mock
  const stats = passport
    ? { countries: passport.countries, continents: passport.continents, worldPct: passport.worldPct }
    : PASSPORT_STATS

  const badges = passport ? passport.badges.map(b => ({
    icon: b.icon,
    name: b.name,
    desc: b.desc,
    unlocked: b.unlocked,
    xp: b.xp,
  })) : PASSPORT_BADGES

  const continents = passport ? passport.continentProgress.map(c => ({
    emoji: c.emoji,
    name: c.name,
    visited: c.visited,
    total: c.total,
    xp: c.xp,
    note: undefined as string | undefined,
  })) : PASSPORT_CONTINENTS

  // Build pins from real passport data
  const pins: MapPin[] = passport && passport.countriesList.length > 0
    ? [] // TODO: map country names to coordinates (not critical for MVP)
    : PASSPORT_PINS

  const countries = passport && passport.countriesList.length > 0
    ? passport.countriesList.map(c => ({ flag: c.flag, name: c.name, visits: c.visits, xp: c.visits * 30 }))
    : PASSPORT_COUNTRIES

  if (loading) {
    return (
      <div className="px-5">
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-[60px] rounded-[12px] animate-pulse" style={{ background: 'var(--sl-s2)' }} />
          ))}
        </div>
        <div className="h-[130px] rounded-[12px] animate-pulse mb-3" style={{ background: 'var(--sl-s2)' }} />
      </div>
    )
  }

  return (
    <div className="px-5">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-[14px]">
        {[
          { val: String(stats.countries),   label: 'Países' },
          { val: String(stats.continents),  label: 'Continentes' },
          { val: stats.worldPct,            label: 'do Mundo' },
        ].map((s, i) => (
          <div
            key={i}
            className="rounded-[12px] py-[10px] px-2 text-center"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            <p className="font-[DM_Mono] text-[20px] font-medium leading-none" style={{ color: accentLight }}>
              {s.val}
            </p>
            <p className="text-[10px] text-[var(--sl-t3)] mt-[3px]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* World Map */}
      <div className="mb-[14px]">
        <ExpWorldMap pins={pins} showLegend />
      </div>

      {/* Continent Progress */}
      <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)] mb-[10px]">
        Progresso por Continente
      </p>
      <div
        className="rounded-[12px] px-3 mb-[14px]"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
      >
        {continents.map((c, i) => (
          <div
            key={i}
            className="flex items-center gap-[10px] py-2"
            style={{ borderBottom: i < continents.length - 1 ? '1px solid var(--sl-border)' : 'none' }}
          >
            <span className="text-[18px] w-7 text-center">{c.emoji}</span>
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-[var(--sl-t1)]">{c.name}</p>
              <p className="text-[10px] text-[var(--sl-t3)] mt-[2px]">
                {c.visited} de {c.total}
                {c.note ? ` — ${c.note}` : ' países'}
                {c.xp > 0 ? ` — +${c.xp} XP` : ''}
              </p>
            </div>
            <div className="w-[50px] h-1 rounded-[3px] overflow-hidden" style={{ background: 'var(--sl-s3)' }}>
              <div
                className="h-full rounded-[3px]"
                style={{
                  width: `${c.total > 0 ? Math.round((c.visited / c.total) * 100) : 0}%`,
                  background: accent,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)] mb-[10px]">
        Badges
      </p>
      <div className="grid grid-cols-2 gap-2 mb-[14px]">
        {badges.map((badge, i) => (
          <div
            key={i}
            className="rounded-[10px] p-[10px] text-center"
            style={{
              background: 'var(--sl-s2)',
              border: '1px solid var(--sl-border)',
              opacity: badge.unlocked ? 1 : 0.4,
            }}
          >
            <div className="text-[22px] mb-1">{badge.icon}</div>
            <p className="text-[10px] font-semibold text-[var(--sl-t1)]">{badge.name}</p>
            <p className="text-[9px] text-[var(--sl-t3)] mt-[2px]">{badge.desc}</p>
            <p className="text-[9px] font-semibold mt-[3px]" style={{ color: EXP_PRIMARY }}>
              +{badge.xp} XP{badge.unlocked ? ' ✅' : ''}
            </p>
          </div>
        ))}
      </div>

      {/* Countries list */}
      <p className="font-[Syne] text-[14px] font-bold text-[var(--sl-t1)] mb-[10px]">
        Países Conquistados
      </p>
      <div
        className="rounded-[12px] px-3 mb-4"
        style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
      >
        {countries.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-[12px] text-[var(--sl-t3)]">
              Conquiste viagens para ver seus países!
            </p>
          </div>
        )}
        {countries.map((country, i) => (
          <div
            key={i}
            className="flex items-center gap-[10px] py-2"
            style={{ borderBottom: i < countries.length - 1 ? '1px solid var(--sl-border)' : 'none' }}
          >
            <span className="text-[20px]">{country.flag}</span>
            <span className="text-[12px] font-medium text-[var(--sl-t1)] flex-1">{country.name}</span>
            <span className="text-[10px] text-[var(--sl-t3)]">
              {country.visits === 0
                ? 'Base'
                : `${country.visits}× · +${country.xp} XP`}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
