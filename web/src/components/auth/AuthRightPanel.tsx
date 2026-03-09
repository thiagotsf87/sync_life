'use client'

import { useEffect, useState } from 'react'

export function AuthRightPanel({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 900px)')
    setIsMobile(mql.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return (
    <div
      className="auth-right"
      style={isMobile ? {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      } : undefined}
    >
      {children}
    </div>
  )
}
