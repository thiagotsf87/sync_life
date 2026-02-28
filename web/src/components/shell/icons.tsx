import { cn } from '@/lib/utils'
import type { ComponentType, CSSProperties } from 'react'
import {
  Activity,
  Bell,
  BookOpen,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  Globe,
  Layers,
  Plane,
  Settings,
  TrendingUp,
  Trophy,
} from 'lucide-react'

// ── Infinity Flow Logo ───────────────────────────────────

const CURVE_PATH =
  'M256 120 C178 120, 100 170, 100 256 C100 342, 178 392, 256 308 C334 224, 412 174, 412 256 C412 342, 334 392, 256 392'

interface SyncLifeIconProps {
  size?: number
  animated?: boolean
  className?: string
}

/**
 * SyncLifeIcon — Infinity Flow logo icon.
 *
 * Size-adaptive rendering:
 * - <= 34px: thick stroke, 1 particle, no blur/glow
 * - 35-48px: medium stroke, 2 particles, glow filter
 * - > 48px:  thin stroke, 2 particles + center pulse, glow + drop-shadow
 */
export function SyncLifeIcon({ size = 28, animated = true, className }: SyncLifeIconProps) {
  const isSmall = size <= 34
  const isMedium = size > 34 && size <= 48
  const isLarge = size > 48

  const strokeW = isSmall ? 28 : isMedium ? 24 : 18
  const uid = `sl-if-${size}`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#051c14" />
          <stop offset="100%" stopColor="#03091f" />
        </linearGradient>
        <linearGradient id={`${uid}-curve`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0055ff" />
        </linearGradient>
        {!isSmall && (
          <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
        {isLarge && (
          <filter id={`${uid}-drop`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor="#10b981" floodOpacity="0.4" />
          </filter>
        )}
      </defs>

      {/* Background */}
      <rect width="512" height="512" rx="112" ry="112" fill={`url(#${uid}-bg)`} />

      {/* Main curve */}
      <path
        d={CURVE_PATH}
        fill="none"
        stroke={`url(#${uid}-curve)`}
        strokeWidth={strokeW}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={isLarge ? `url(#${uid}-drop)` : undefined}
      />

      {/* Animated particles */}
      {animated && (
        <>
          {/* Particle 1 — emerald */}
          <circle
            r={isSmall ? 10 : 12}
            fill="#10b981"
            filter={!isSmall ? `url(#${uid}-glow)` : undefined}
          >
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              path={CURVE_PATH}
            />
          </circle>

          {/* Particle 2 — blue (medium + large only) */}
          {!isSmall && (
            <circle
              r={isLarge ? 10 : 8}
              fill="#0055ff"
              filter={`url(#${uid}-glow)`}
            >
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                path={CURVE_PATH}
                begin="-2s"
              />
            </circle>
          )}

          {/* Center pulse (large only) */}
          {isLarge && (
            <circle cx="256" cy="256" r="6" fill="#10b981" opacity="0.6">
              <animate
                attributeName="r"
                values="6;14;6"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.15;0.6"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </>
      )}
    </svg>
  )
}

/** Backward-compatible alias */
export const SyncLifeLogo = SyncLifeIcon

// ── SyncLifeBrand (Icon + Wordmark) ─────────────────────

type BrandSize = 'sm' | 'md' | 'lg' | 'xl' | 'splash'

interface SyncLifeBrandProps {
  size?: BrandSize
  animated?: boolean
  className?: string
}

const BRAND_PRESETS: Record<BrandSize, { icon: number; font: number; gap: number; vertical: boolean }> = {
  sm:     { icon: 28, font: 16, gap: 8,  vertical: false },
  md:     { icon: 32, font: 18, gap: 10, vertical: false },
  lg:     { icon: 38, font: 18, gap: 10, vertical: false },
  xl:     { icon: 88, font: 28, gap: 14, vertical: true },
  splash: { icon: 120, font: 32, gap: 16, vertical: true },
}

export function SyncLifeBrand({ size = 'md', animated, className }: SyncLifeBrandProps) {
  const preset = BRAND_PRESETS[size]
  const shouldAnimate = animated ?? (size !== 'sm')

  return (
    <div
      className={cn(
        'inline-flex items-center',
        preset.vertical && 'flex-col',
        className,
      )}
      style={{ gap: preset.gap }}
    >
      <SyncLifeIcon size={preset.icon} animated={shouldAnimate} />
      <span
        className="font-[Syne] font-extrabold leading-none whitespace-nowrap"
        style={{ fontSize: preset.font }}
      >
        <span className="text-[var(--sl-t1)] [.landing-page_&]:text-white [.auth-left_&]:text-white [.onboarding-page_&]:text-white">Sync</span>
        <span
          style={{
            background: 'linear-gradient(135deg, #10b981, #0055ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Life
        </span>
      </span>
    </div>
  )
}

// ── Module icons (unchanged) ────────────────────────────

interface IconProps {
  className?: string
  size?: number
  style?: CSSProperties
}

function makeIcon(
  Icon: ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: CSSProperties }>,
  defaultSize: number,
) {
  return function WrappedIcon({ className, size = defaultSize, style }: IconProps) {
    return <Icon size={size} strokeWidth={1.8} className={cn('shrink-0', className)} style={style} />
  }
}

export const IconPanorama = makeIcon(Globe, 22)
export const IconFinancas = makeIcon(DollarSign, 22)
export const IconTempo = makeIcon(Clock, 22)
export const IconFuturo = makeIcon(Layers, 22)
export const IconCorpo = makeIcon(Activity, 22)
export const IconMente = makeIcon(BookOpen, 22)
export const IconPatrimonio = makeIcon(TrendingUp, 22)
export const IconCarreira = makeIcon(Briefcase, 22)
export const IconExperiencias = makeIcon(Plane, 22)
export const IconConquistas = makeIcon(Trophy, 22)
export const IconConfig = makeIcon(Settings, 22)
export const IconBell = makeIcon(Bell, 20)
export const IconChevronLeft = makeIcon(ChevronLeft, 18)
export const IconChevronRight = makeIcon(ChevronRight, 18)

export const MODULE_ICONS = {
  panorama: IconPanorama,
  financas: IconFinancas,
  futuro: IconFuturo,
  tempo: IconTempo,
  corpo: IconCorpo,
  mente: IconMente,
  patrimonio: IconPatrimonio,
  carreira: IconCarreira,
  experiencias: IconExperiencias,
  conquistas: IconConquistas,
  configuracoes: IconConfig,
} as const
