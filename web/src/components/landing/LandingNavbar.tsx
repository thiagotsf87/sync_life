'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { SyncLifeIcon } from '@/components/shell/icons'

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <nav className="lp-nav">
        <div className="lp-nav-inner">
          <Link href="/" className="lp-nav-logo">
            <SyncLifeIcon size={28} animated={false} />
            <span className="lp-nav-logo-text">SyncLife</span>
          </Link>
          <div className="nav-links">
            <a href="#features" onClick={(e) => smoothScroll(e, 'features')}>Funcionalidades</a>
            <a href="#score" onClick={(e) => smoothScroll(e, 'score')}>Life Score</a>
            <a href="#como" onClick={(e) => smoothScroll(e, 'como')}>Como funciona</a>
          </div>
          <div className="nav-actions">
            <Link href="/login" className="btn-ghost">Entrar</Link>
            <Link href="/cadastro" className="btn-primary">Comecar gratis</Link>
            <button
              className="nav-hamburger"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${mobileOpen ? ' open' : ''}`}>
        <a href="#features" onClick={(e) => smoothScroll(e, 'features')}>Funcionalidades</a>
        <a href="#score" onClick={(e) => smoothScroll(e, 'score')}>Life Score</a>
        <a href="#como" onClick={(e) => smoothScroll(e, 'como')}>Como funciona</a>
        <div style={{ height: 12 }} />
        <Link href="/login" className="btn-ghost" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>Entrar</Link>
        <Link href="/cadastro" className="btn-primary" style={{ justifyContent: 'center' }} onClick={() => setMobileOpen(false)}>Comecar gratis</Link>
      </div>
    </>
  )
}
