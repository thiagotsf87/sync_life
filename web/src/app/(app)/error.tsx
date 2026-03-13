'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[SyncLife Error]', error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f43f5e]/10">
        <AlertTriangle className="h-8 w-8 text-[#f43f5e]" />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-[Syne] text-xl font-extrabold text-[var(--sl-t1)]">
          Algo deu errado
        </h2>
        <p className="max-w-md text-sm text-[var(--sl-t2)]">
          Ocorreu um erro inesperado. Tente recarregar a página ou volte ao dashboard.
        </p>
        {error.digest && (
          <p className="font-[DM_Mono] text-xs text-[var(--sl-t3)]">
            ID: {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--sl-s2)] px-5 py-2.5 text-sm font-medium text-[var(--sl-t1)] transition-colors hover:bg-[var(--sl-s3)]"
        >
          <RotateCcw className="h-4 w-4" />
          Tentar novamente
        </button>
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-[#10b981] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0d9668]"
        >
          Ir ao Dashboard
        </a>
      </div>
    </div>
  )
}
