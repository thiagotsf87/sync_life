import { cn } from '@/lib/utils'

interface IconProps {
  className?: string
  size?: number
}

export function SyncLifeLogo({ className, size = 28 }: IconProps) {
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
        <linearGradient id="sl-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#051c14" />
          <stop offset="100%" stopColor="#03091f" />
        </linearGradient>
        <linearGradient id="sl-brand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0055ff" />
        </linearGradient>
        <linearGradient id="sl-ring1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#0055ff" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="sl-ring2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0055ff" stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id="sl-ring3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0055ff" stopOpacity="0.15" />
        </linearGradient>
        <filter id="sl-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="sl-sglow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <rect width="512" height="512" rx="112" ry="112" fill="url(#sl-bg)" />

      {/* Concentric rings */}
      <circle cx="256" cy="256" r="210" fill="none" stroke="url(#sl-ring3)" strokeWidth="1.5" />
      <circle cx="256" cy="256" r="170" fill="none" stroke="url(#sl-ring2)" strokeWidth="2" />
      <circle cx="256" cy="256" r="130" fill="none" stroke="url(#sl-ring1)" strokeWidth="2.5" />

      {/* Arc accents */}
      <path d="M 256 46 A 210 210 0 0 1 466 256" fill="none" stroke="#10b981" strokeWidth="3" strokeOpacity="0.5" strokeLinecap="round" />
      <path d="M 256 466 A 210 210 0 0 1 46 256" fill="none" stroke="#0055ff" strokeWidth="3" strokeOpacity="0.5" strokeLinecap="round" />

      {/* Center disc */}
      <circle cx="256" cy="256" r="110" fill="url(#sl-bg)" opacity="0.9" />
      <circle cx="256" cy="256" r="108" fill="none" stroke="url(#sl-brand)" strokeWidth="2.5" opacity="0.8" />

      {/* S letterform */}
      <g filter="url(#sl-sglow)">
        <text x="256" y="316" fontFamily="'Helvetica Neue', Arial, sans-serif" fontWeight="800" fontSize="190" textAnchor="middle" fill="url(#sl-brand)" letterSpacing="-4">S</text>
      </g>

      {/* Node dots on rings */}
      <circle cx="256" cy="86"  r="7" fill="#10b981" filter="url(#sl-glow)" />
      <circle cx="404" cy="138" r="6" fill="#10b981" opacity="0.8" filter="url(#sl-glow)" />
      <circle cx="446" cy="256" r="6" fill="#0066ff" opacity="0.8" filter="url(#sl-glow)" />
      <circle cx="374" cy="374" r="5" fill="#0055ff" opacity="0.7" filter="url(#sl-glow)" />
      <circle cx="256" cy="426" r="6" fill="#0055ff" opacity="0.8" filter="url(#sl-glow)" />
      <circle cx="138" cy="374" r="5" fill="#10b981" opacity="0.7" filter="url(#sl-glow)" />
      <circle cx="66"  cy="256" r="6" fill="#10b981" opacity="0.8" filter="url(#sl-glow)" />
      <circle cx="108" cy="138" r="5" fill="#10b981" opacity="0.7" filter="url(#sl-glow)" />

      {/* Spoke lines */}
      <g stroke="url(#sl-brand)" strokeWidth="1" opacity="0.15">
        <line x1="256" y1="146" x2="256" y2="86" />
        <line x1="256" y1="146" x2="404" y2="138" />
        <line x1="256" y1="146" x2="446" y2="256" />
        <line x1="256" y1="146" x2="374" y2="374" />
        <line x1="256" y1="146" x2="256" y2="426" />
        <line x1="256" y1="146" x2="138" y2="374" />
        <line x1="256" y1="146" x2="66"  y2="256" />
        <line x1="256" y1="146" x2="108" y2="138" />
      </g>
    </svg>
  )
}

export function IconHome({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
      <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

export function IconFinancas({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2" />
      <path d="M2 9.1C3 12 5 14 8 14.5" />
      <circle cx="12.5" cy="11" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconMetas({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

export function IconAgenda({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  )
}

export function IconConquistas({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  )
}

export function IconConfig({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconBell({ className, size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

export function IconChevronLeft({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function IconChevronRight({ className, size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function IconFuturo({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="M12 2a7 7 0 1 0 7 7" />
      <path d="M22 2 12 12" />
      <path d="m22 2-5 0 0 5" />
      <path d="M12 19v3" />
      <path d="M8 21h8" />
    </svg>
  )
}

export function IconTempo({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function IconCorpo({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  )
}

export function IconMente({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66" />
    </svg>
  )
}

export function IconPatrimonio({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  )
}

export function IconCarreira({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <rect width="20" height="14" x="2" y="7" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}

export function IconExperiencias({ className, size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={cn('shrink-0', className)}>
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 2c-2-2-4-2-5.5-.5L10 5 1.8 6.2c-.5.1-.9.6-.9 1.1l.1.9 2.8 2.8L1.4 19c-.2.6.1 1.2.6 1.5l.9.5 7.4-3.4 2.9 2.8c.3.3.7.5 1.1.5l.8-.1c.5-.2.9-.7.9-1.2z" />
    </svg>
  )
}

export const MODULE_ICONS = {
  home: IconHome,
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
