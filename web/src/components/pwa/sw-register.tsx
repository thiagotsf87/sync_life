'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Verifica updates silenciosamente
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          if (!worker) return
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível — poderia mostrar toast aqui no futuro
              console.info('[SW] Nova versão disponível.')
            }
          })
        })
      })
      .catch((err) => {
        // Falha silenciosa em dev (HTTP) — não interrompe o app
        if (process.env.NODE_ENV === 'development') {
          console.warn('[SW] Registro ignorado em dev:', err.message)
        }
      })
  }, [])

  return null
}
