'use client'

import { ScrollReveal } from './ScrollReveal'

export function LifeScoreSection() {
  return (
    <section className="score-section lp-section" id="score">
      <div className="lp-container">
        <div className="score-inner">
          {/* Visual */}
          <ScrollReveal>
            <div className="score-visual">
              <div className="score-ring-outer">
                <div className="score-ring-inner">
                  <span className="score-big-num">74</span>
                  <span className="score-big-label">Life Score</span>
                </div>
              </div>
              {/* Pillars */}
              <div className="score-pillars">
                <div className="score-pillar-dot fin">
                  <span className="pillar-icon">💰</span>
                  <div className="pillar-pct">85%</div>
                  <div className="pillar-lbl">Finanças</div>
                </div>
                <div className="score-pillar-dot meta">
                  <span className="pillar-icon">🔮</span>
                  <div className="pillar-pct">72%</div>
                  <div className="pillar-lbl">Futuro</div>
                </div>
                <div className="score-pillar-dot con">
                  <span className="pillar-icon">⏳</span>
                  <div className="pillar-pct">60%</div>
                  <div className="pillar-lbl">Tempo</div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Content */}
          <ScrollReveal delay={1}>
            <div className="score-content">
              <div className="section-label">Life Sync Score</div>
              <h2 className="section-title">Um número que resume sua evolução.</h2>
              <p className="section-sub">
                O Life Sync Score calcula, em tempo real, como você está indo em 8 dimensões da vida organizada — finanças, futuro, tempo, corpo, mente, patrimônio, carreira e experiências.
              </p>

              <div className="score-pillars-list">
                <div className="pillar-item">
                  <div className="pillar-item-top">
                    <div className="pillar-item-name">
                      <span>💰</span> Saúde Financeira
                    </div>
                    <span className="pillar-item-weight">Finanças + Patrimônio</span>
                  </div>
                  <div className="pillar-item-bar">
                    <div className="pillar-item-fill fin-fill" />
                  </div>
                  <p className="pillar-item-desc">Saldo positivo, orçamentos respeitados, patrimônio crescendo.</p>
                </div>
                <div className="pillar-item">
                  <div className="pillar-item-top">
                    <div className="pillar-item-name">
                      <span>🔮</span> Progresso Futuro
                    </div>
                    <span className="pillar-item-weight">Futuro + Carreira</span>
                  </div>
                  <div className="pillar-item-bar">
                    <div className="pillar-item-fill meta-fill" />
                  </div>
                  <p className="pillar-item-desc">Objetivos no caminho, aportes em dia, carreira evoluindo.</p>
                </div>
                <div className="pillar-item">
                  <div className="pillar-item-top">
                    <div className="pillar-item-name">
                      <span>🏃</span> Bem-estar
                    </div>
                    <span className="pillar-item-weight">Corpo + Mente + Tempo</span>
                  </div>
                  <div className="pillar-item-bar">
                    <div className="pillar-item-fill con-fill" />
                  </div>
                  <p className="pillar-item-desc">Atividades em dia, agenda organizada, foco e leitura consistentes.</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}
