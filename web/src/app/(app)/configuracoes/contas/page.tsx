import { AccountManager } from '@/components/settings/account-manager'

export default function ContasPage() {
  return (
    <div className="max-w-[680px]">
      <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)] mb-1">Contas bancárias</h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-6">
        Gerencie suas contas para rastrear transferências entre bancos.
      </p>
      <AccountManager />
    </div>
  )
}
