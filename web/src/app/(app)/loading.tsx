import Link from 'next/link'

export default function AppLoading() {
  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7">
      {/* Topbar skeleton */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--sl-s2)]" />
        <div className="flex-1" />
        <div className="h-9 w-28 animate-pulse rounded-xl bg-[var(--sl-s2)]" />
      </div>

      {/* KPI strip skeleton */}
      <div className="grid grid-cols-4 gap-3 mb-5 max-sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-s1)]"
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-[1fr_340px] gap-4 max-lg:grid-cols-1">
        <div className="flex flex-col gap-4">
          <div className="h-64 animate-pulse rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-s1)]" />
          <div className="h-48 animate-pulse rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-s1)]" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="h-40 animate-pulse rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-s1)]" />
          <div className="h-40 animate-pulse rounded-2xl border border-[var(--sl-border)] bg-[var(--sl-s1)]" />
        </div>
      </div>

      {/* Fallback se demorar — permite tentar login novamente */}
      <div className="mt-6 text-center">
        <p className="text-[12px] text-[var(--sl-t3)] mb-2">
          Carregando...
        </p>
        <Link
          href="/login"
          className="text-[12px] text-[#f97316] hover:underline"
        >
          Demorando? Ir para login
        </Link>
      </div>
    </div>
  )
}
