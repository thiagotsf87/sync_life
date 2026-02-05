export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-animated overflow-x-hidden overflow-y-auto">
      {/* Floating decorative shapes */}
      <div className="floating-shape w-96 h-96 bg-[var(--color-sync-500)] -top-48 -left-48" style={{ animationDelay: '0s' }}></div>
      <div className="floating-shape w-64 h-64 bg-[var(--color-sync-400)] top-1/4 -right-32" style={{ animationDelay: '-5s' }}></div>
      <div className="floating-shape w-80 h-80 bg-[var(--color-sync-600)] -bottom-40 left-1/4" style={{ animationDelay: '-10s' }}></div>
      
      {children}
    </div>
  )
}
