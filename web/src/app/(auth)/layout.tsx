import '@/styles/auth.css'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-page" data-theme="navy-deep" data-scheme="dark">
      {children}
    </div>
  )
}
