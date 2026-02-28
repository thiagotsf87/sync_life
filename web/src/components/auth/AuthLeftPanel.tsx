import Link from 'next/link'
import { SyncLifeBrand } from '@/components/shell/icons'

export function AuthLeftPanel() {
  return (
    <div className="auth-left">
      {/* Decorative */}
      <div className="left-orb left-orb-1" />
      <div className="left-orb left-orb-2" />
      <div className="left-grid" />

      {/* Logo */}
      <Link href="/" className="auth-logo">
        <SyncLifeBrand size="lg" />
      </Link>

      {/* Hero content */}
      <div className="auth-left-content">
        <div>
          <h1 className="auth-left-headline">
            Sua vida em<br />
            <span className="grad">sincronia.</span>
          </h1>
          <p className="auth-left-sub" style={{ marginTop: 12 }}>
            Finanças, metas e agenda integrados em um único lugar.
            Evolua com clareza.
          </p>
        </div>

        {/* Stats */}
        <div className="auth-stats">
          <div className="auth-stat">
            <span className="auth-stat-num">3</span>
            <span className="auth-stat-label">módulos</span>
          </div>
          <div className="auth-stat">
            <span className="auth-stat-num">2</span>
            <span className="auth-stat-label">modos</span>
          </div>
          <div className="auth-stat">
            <span className="auth-stat-num">100</span>
            <span className="auth-stat-label">pontos máx.</span>
          </div>
        </div>

        {/* Mini Dashboard Card */}
        <div className="mini-card">
          <div className="mini-card-header">
            <span className="mini-card-month">Fevereiro 2026</span>
            <span className="mini-badge">Modo Jornada</span>
          </div>

          <div>
            <div className="mini-score-row">
              <span className="mini-score-num">74</span>
              <div className="mini-score-meta">
                <span className="mini-score-label">LIFE SYNC SCORE</span>
                <span className="mini-score-delta">↑ +3 esta semana</span>
              </div>
            </div>
            <div className="mini-bar-wrap" style={{ marginTop: 10 }}>
              <div className="mini-bar-fill" />
            </div>
          </div>

          <div className="mini-rows">
            <div className="mini-row">
              <span className="mini-row-label">Saldo do mês</span>
              <span className="mini-row-val green">+R$ 1.800</span>
            </div>
            <div className="mini-row">
              <span className="mini-row-label">Meta: Viagem</span>
              <span className="mini-row-val yellow">28% ████░░░░</span>
            </div>
            <div className="mini-row">
              <span className="mini-row-label">Orçamento</span>
              <span className="mini-row-val green">✓ No controle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quote */}
      <p className="auth-quote">
        "Finalmente um app que entende que organização é libertação."
        <span className="auth-quote-author">— Rafael M., usuário beta</span>
      </p>
    </div>
  )
}
