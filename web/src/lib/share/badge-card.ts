const CARD_WIDTH = 600
const CARD_HEIGHT = 400
const BG_COLOR = '#0a1628'
const GRAD_START = '#0F766E'
const GRAD_END = '#0B2D34'

const RARITY_COLORS: Record<string, string> = {
  Comum: '#6F7986',
  Raro: '#4F88D4',
  Épico: '#a855f7',
  Lendário: '#D9962E',
}

export async function generateBadgeShareCard(badge: {
  icon: string
  name: string
  desc: string
  rarity: string
  date: string | null
}): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = CARD_WIDTH
  canvas.height = CARD_HEIGHT
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = BG_COLOR
  ctx.roundRect(0, 0, CARD_WIDTH, CARD_HEIGHT, 16)
  ctx.fill()

  // Gradient bar at top
  const grad = ctx.createLinearGradient(0, 0, CARD_WIDTH, 0)
  grad.addColorStop(0, GRAD_START)
  grad.addColorStop(1, GRAD_END)
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, CARD_WIDTH, 5)

  // Subtle glow behind emoji
  const glowGrad = ctx.createRadialGradient(CARD_WIDTH / 2, 130, 0, CARD_WIDTH / 2, 130, 120)
  glowGrad.addColorStop(0, 'rgba(15, 118, 110, 0.15)')
  glowGrad.addColorStop(1, 'rgba(15, 118, 110, 0)')
  ctx.fillStyle = glowGrad
  ctx.fillRect(0, 30, CARD_WIDTH, 200)

  // Emoji
  ctx.font = '64px serif'
  ctx.textAlign = 'center'
  ctx.fillText(badge.icon, CARD_WIDTH / 2, 150)

  // Badge name
  ctx.font = 'bold 24px "Syne", system-ui, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.textAlign = 'center'
  ctx.fillText(badge.name, CARD_WIDTH / 2, 200)

  // Rarity pill
  const rarityColor = RARITY_COLORS[badge.rarity] ?? '#6F7986'
  const pillText = badge.rarity.toUpperCase()
  ctx.font = 'bold 11px system-ui, sans-serif'
  const pillWidth = ctx.measureText(pillText).width + 20
  const pillX = (CARD_WIDTH - pillWidth) / 2
  const pillY = 215

  ctx.fillStyle = rarityColor + '33'
  ctx.beginPath()
  ctx.roundRect(pillX, pillY, pillWidth, 22, 6)
  ctx.fill()

  ctx.fillStyle = rarityColor
  ctx.textAlign = 'center'
  ctx.fillText(pillText, CARD_WIDTH / 2, pillY + 15)

  // Description (word-wrapped)
  ctx.font = '14px system-ui, sans-serif'
  ctx.fillStyle = '#94a3b8'
  ctx.textAlign = 'center'
  const words = badge.desc.split(' ')
  let line = ''
  let lineY = 265
  const maxLineWidth = CARD_WIDTH - 80
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxLineWidth && line) {
      ctx.fillText(line, CARD_WIDTH / 2, lineY)
      line = word
      lineY += 20
    } else {
      line = testLine
    }
  }
  if (line) ctx.fillText(line, CARD_WIDTH / 2, lineY)

  // Date (if unlocked)
  if (badge.date) {
    ctx.font = '12px system-ui, sans-serif'
    ctx.fillStyle = '#0F766E'
    ctx.fillText(`Conquistado em ${badge.date}`, CARD_WIDTH / 2, 330)
  }

  // Watermark
  ctx.font = 'bold 12px system-ui, sans-serif'
  const waterGrad = ctx.createLinearGradient(0, 0, 200, 0)
  waterGrad.addColorStop(0, '#0F766E')
  waterGrad.addColorStop(1, '#0B2D34')
  ctx.fillStyle = waterGrad
  ctx.fillText('Conquista SyncLife', CARD_WIDTH / 2, CARD_HEIGHT - 25)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to generate image'))),
      'image/png',
    )
  })
}
