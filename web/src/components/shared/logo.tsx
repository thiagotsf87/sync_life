'use client'

import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  href?: string
}

const sizes = {
  sm: { icon: 'w-8 h-8', svg: 'w-5 h-5', text: 'text-lg' },
  md: { icon: 'w-10 h-10', svg: 'w-6 h-6', text: 'text-xl' },
  lg: { icon: 'w-12 h-12', svg: 'w-7 h-7', text: 'text-3xl' },
}

export function Logo({ size = 'md', showText = true, href = '/' }: LogoProps) {
  const { icon, svg, text } = sizes[size]

  const content = (
    <div className="flex items-center gap-3">
      <div className={`${icon} bg-gradient-to-br from-[var(--color-sync-400)] to-[var(--color-sync-600)] rounded-xl flex items-center justify-center shadow-lg`}>
        <svg className={`${svg} text-white`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
          <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(0 12 12)" strokeOpacity="0.6"/>
          <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" strokeOpacity="0.6"/>
          <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)" strokeOpacity="0.6"/>
        </svg>
      </div>
      {showText && (
        <span className={`${text} font-bold text-white`}>
          Sync<span className="text-[var(--color-sync-400)]">Life</span>
        </span>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
