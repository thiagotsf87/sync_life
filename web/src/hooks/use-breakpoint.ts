'use client'

import { useState, useEffect } from 'react'

interface Breakpoints {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isWide: boolean
}

export function useBreakpoint(): Breakpoints {
  const [bp, setBp] = useState<Breakpoints>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isWide: false,
  })

  useEffect(() => {
    const mqMobile = window.matchMedia('(max-width: 639px)')
    const mqTablet = window.matchMedia('(min-width: 640px) and (max-width: 1023px)')
    const mqDesktop = window.matchMedia('(min-width: 1024px)')
    const mqWide = window.matchMedia('(min-width: 1440px)')

    function update() {
      setBp({
        isMobile: mqMobile.matches,
        isTablet: mqTablet.matches,
        isDesktop: mqDesktop.matches,
        isWide: mqWide.matches,
      })
    }

    update()

    mqMobile.addEventListener('change', update)
    mqTablet.addEventListener('change', update)
    mqDesktop.addEventListener('change', update)
    mqWide.addEventListener('change', update)

    return () => {
      mqMobile.removeEventListener('change', update)
      mqTablet.removeEventListener('change', update)
      mqDesktop.removeEventListener('change', update)
      mqWide.removeEventListener('change', update)
    }
  }, [])

  return bp
}
