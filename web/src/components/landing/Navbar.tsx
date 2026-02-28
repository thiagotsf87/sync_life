'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { SyncLifeBrand } from '@/components/shell/icons'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <nav className={`lp-navbar${scrolled ? ' scrolled' : ''}`}>
        {/* Logo */}
        <a href="#" className="nav-logo">
          <SyncLifeBrand size="md" />
        </a>

        {/* Nav links */}
        <div className="nav-links">
          <a href="#features" className="nav-link" onClick={(e) => smoothScroll(e, 'features')}>Funcionalidades</a>
          <a href="#modos" className="nav-link" onClick={(e) => smoothScroll(e, 'modos')}>Modos</a>
          <a href="#score" className="nav-link" onClick={(e) => smoothScroll(e, 'score')}>Life Score</a>
          <a href="#precos" className="nav-link" onClick={(e) => smoothScroll(e, 'precos')}>Preços</a>
        </div>

        {/* CTA */}
        <div className="nav-cta">
          <Link href="/login" className="btn-ghost">Entrar</Link>
          <Link href="/cadastro" className="btn-primary">Começar grátis</Link>
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <a href="#features" className="nav-link" onClick={(e) => smoothScroll(e, 'features')}>Funcionalidades</a>
        <a href="#modos" className="nav-link" onClick={(e) => smoothScroll(e, 'modos')}>Modos</a>
        <a href="#score" className="nav-link" onClick={(e) => smoothScroll(e, 'score')}>Life Score</a>
        <a href="#precos" className="nav-link" onClick={(e) => smoothScroll(e, 'precos')}>Preços</a>
        <div style={{ height: 12 }} />
        <Link href="/login" className="btn-ghost" onClick={() => setMobileOpen(false)}>Entrar</Link>
        <Link href="/cadastro" className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>Começar grátis</Link>
      </div>
    </>
  )
}
