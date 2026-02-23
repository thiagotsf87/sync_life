import '@/styles/auth.css'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-page">
      <AuthLeftPanel />
      <div className="auth-right">
        <div className="auth-form-container">
          {children}
        </div>
      </div>
    </div>
  )
}
