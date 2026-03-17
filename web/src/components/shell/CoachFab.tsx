'use client'

import { Bot } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
export function CoachFab() {
  const router = useRouter()
  const pathname = usePathname()

  // Don't show on coach page itself or settings
  if (pathname.startsWith('/coach') || pathname.startsWith('/configuracoes')) {
    return null
  }

  return (
    <button
      onClick={() => router.push('/coach')}
      className="fixed bottom-5 right-5 z-50 w-[52px] h-[52px] rounded-full flex items-center justify-center
                 text-white shadow-xl transition-all hover:scale-105 hover:shadow-2xl
                 max-lg:bottom-[72px]"
      style={{
        background: 'linear-gradient(135deg, #10b981, #0055ff)',
        boxShadow: '0 4px 24px rgba(16,185,129,0.35)',
      }}
      aria-label="Coach IA"
    >
      <Bot size={22} />
    </button>
  )
}
