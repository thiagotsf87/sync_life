'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return

    // Quando um novo SW assume o controle, recarrega para usar os assets atualizados
    let refreshing = false
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        // Verifica updates silenciosamente
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          if (!worker) return
          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão disponível — mostra toast com ação de atualizar
              toast('Nova versão disponível!', {
                description: 'Uma atualização do SyncLife está pronta.',
                action: {
                  label: 'Atualizar agora',
                  onClick: () => {
                    worker.postMessage({ type: 'SKIP_WAITING' })
                  },
                },
                duration: Infinity,
              })
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
