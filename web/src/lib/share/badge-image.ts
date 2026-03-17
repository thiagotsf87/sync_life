export async function generateBadgeImage(badge: {
  icon: string
  name: string
  desc: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
}): Promise<Blob> {
  const W = 600, H = 400
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, W, H)
  grad.addColorStop(0, '#0a1628')
  grad.addColorStop(1, '#0d2847')
  ctx.fillStyle = grad
  ctx.beginPath()
  ctx.roundRect(0, 0, W, H, 24)
  ctx.fill()

  // Top accent bar
  const accentGrad = ctx.createLinearGradient(0, 0, W, 0)
  accentGrad.addColorStop(0, '#10b981')
  accentGrad.addColorStop(1, '#0055ff')
  ctx.fillStyle = accentGrad
  ctx.fillRect(0, 0, W, 4)

  // Badge emoji
  ctx.font = '72px serif'
  ctx.textAlign = 'center'
  ctx.fillText(badge.icon, W / 2, 120)

  // Rarity pill
  const rarityColors: Record<string, string> = {
    common: '#64748b',
    uncommon: '#10b981',
    rare: '#8b5cf6',
    legendary: '#f59e0b',
  }
  const rarityLabels: Record<string, string> = {
    common: 'COMUM',
    uncommon: 'INCOMUM',
    rare: 'RARA',
    legendary: 'LENDÁRIA',
  }
  const pillColor = rarityColors[badge.rarity] || '#64748b'
  const pillText = rarityLabels[badge.rarity] || 'COMUM'
  ctx.font = 'bold 11px sans-serif'
  const pillW = ctx.measureText(pillText).width + 20
  ctx.fillStyle = pillColor + '40'
  ctx.beginPath()
  ctx.roundRect(W / 2 - pillW / 2, 140, pillW, 22, 8)
  ctx.fill()
  ctx.fillStyle = pillColor
  ctx.fillText(pillText, W / 2, 156)

  // Badge name
  ctx.font = 'bold 28px sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.fillText(badge.name, W / 2, 210)

  // Badge description
  ctx.font = '15px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  // Word wrap description
  const words = badge.desc.split(' ')
  let line = ''
  let y = 245
  for (const word of words) {
    const test = line + word + ' '
    if (ctx.measureText(test).width > W - 80) {
      ctx.fillText(line.trim(), W / 2, y)
      line = word + ' '
      y += 22
    } else {
      line = test
    }
  }
  if (line.trim()) ctx.fillText(line.trim(), W / 2, y)

  // Divider line
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(80, 330)
  ctx.lineTo(W - 80, 330)
  ctx.stroke()

  // Watermark
  ctx.font = 'bold 14px sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillText('SyncLife', W / 2, 365)

  // Bottom gradient bar
  ctx.fillStyle = accentGrad
  ctx.fillRect(0, H - 4, W, 4)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png')
  })
}
