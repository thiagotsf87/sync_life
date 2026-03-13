export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--sl-bg)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--sl-s3)] border-t-[#10b981]" />
        <p className="text-sm text-[var(--sl-t2)]">Carregando...</p>
      </div>
    </div>
  )
}
