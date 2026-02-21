export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden overflow-y-auto relative">
      {/* Camada de fundo em tela cheia (evita barra lateral) */}
      <div className="fixed top-0 left-0 w-[100vw] min-w-full h-full bg-animated -z-10" style={{ width: '100vw' }} aria-hidden />
      {/* Formas decorativas (dentro da viewport, sem overflow) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-[5]" aria-hidden>
        <div className="floating-shape w-96 h-96 bg-[var(--color-sync-500)] -top-48 -left-48" style={{ animationDelay: '0s' }} />
        <div className="floating-shape w-64 h-64 bg-[var(--color-sync-400)] top-1/4 right-0 translate-x-1/2" style={{ animationDelay: '-5s' }} />
        <div className="floating-shape w-80 h-80 bg-[var(--color-sync-600)] -bottom-40 left-1/4" style={{ animationDelay: '-10s' }} />
      </div>
      {/* Conteúdo centralizado (igual ao protótipo aprovado) */}
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
