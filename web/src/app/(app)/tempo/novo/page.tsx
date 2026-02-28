'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NovoEventoPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/tempo?new=1')
  }, [router])

  return (
    <div className="max-w-[1140px] mx-auto px-4 py-7 flex items-center justify-center min-h-[200px]">
      <p className="text-[13px] text-[var(--sl-t3)]">Redirecionando...</p>
    </div>
  )
}
