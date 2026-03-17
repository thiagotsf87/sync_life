import { generateBadgeImage } from './badge-image'

interface ShareBadge {
  icon: string
  name: string
  desc: string
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary'
}

export async function shareBadgeImage(badge: ShareBadge): Promise<void> {
  const blob = await generateBadgeImage(badge)
  const file = new File([blob], `synclife-badge-${badge.name.toLowerCase().replace(/\s+/g, '-')}.png`, { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: `Conquista: ${badge.name}`,
      text: `Desbloqueei "${badge.name}" no SyncLife! ${badge.desc}`,
      files: [file],
    })
    return
  }

  // Fallback: download image
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
  URL.revokeObjectURL(url)
}

export function shareToWhatsApp(badge: ShareBadge): void {
  const text = encodeURIComponent(`🏆 Desbloqueei a conquista "${badge.name}" no SyncLife!\n${badge.desc}`)
  window.open(`https://wa.me/?text=${text}`, '_blank')
}

export function shareToTwitter(badge: ShareBadge): void {
  const text = encodeURIComponent(`🏆 Desbloqueei "${badge.name}" no SyncLife! ${badge.desc}`)
  window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
}

export function copyBadgeLink(badge: ShareBadge): Promise<void> {
  const text = `🏆 Desbloqueei "${badge.name}" no SyncLife! ${badge.desc}`
  return navigator.clipboard.writeText(text)
}
