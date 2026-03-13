'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#0a0f1e', color: '#e2e8f0' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '100vh', padding: '24px', textAlign: 'center', gap: '16px',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700 }}>Algo deu errado</h2>
          <p style={{ fontSize: '14px', color: '#94a3b8', maxWidth: '400px' }}>
            Ocorreu um erro inesperado. A equipe já foi notificada.
          </p>
          {error.digest && (
            <p style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
              ID: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            style={{
              padding: '10px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
              background: '#10b981', color: '#fff', fontSize: '14px', fontWeight: 600,
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
