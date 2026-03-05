import '@/styles/auth.css'
import { AuthLeftPanel } from '@/components/auth/AuthLeftPanel'
import { SyncLifeBrand } from '@/components/shell/icons'
import { AuthRightPanel } from '@/components/auth/AuthRightPanel'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-page">
      <AuthLeftPanel />
      <AuthRightPanel>
        {/* Mobile-only logo (hidden on desktop via CSS) */}
        <div className="auth-mobile-logo">
          <SyncLifeBrand size="xl" animated />
          <div className="auth-mobile-logo-sub">Sua vida em sincronia</div>
        </div>
        <div className="auth-form-container">
          {children}
        </div>
      </AuthRightPanel>
    </div>
  )
}
