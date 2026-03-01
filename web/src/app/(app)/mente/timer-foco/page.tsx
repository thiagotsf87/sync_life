'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function TimerFocoRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace('/mente?tab=timer') }, [router])
  return null
}
