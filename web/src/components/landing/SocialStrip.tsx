'use client'

const logos = ['Monarch Money', 'Linear', 'Notion', 'Todoist', 'Fabulous', 'YNAB', 'Obsidian']

export function SocialStrip() {
  const doubled = [...logos, ...logos]

  return (
    <div className="social-strip">
      <div className="lp-container">
        <p className="social-strip-label">Inspirado por apps de referência</p>
        <div className="social-strip-track">
          <div className="social-logos">
            {doubled.map((name, i) => (
              <span key={i} className="social-logo">{name}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
