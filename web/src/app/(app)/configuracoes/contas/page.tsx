import { AccountManager } from '@/components/settings/account-manager'

export default function ContasPage() {
  return (
    <div className="max-w-[680px]">
      <h1 className="font-[Space_Grotesk] font-extrabold text-xl text-[var(--sl-t1)] mb-1">Contas Bancárias</h1>
      <p className="text-[13px] text-[var(--sl-t2)] mb-5">
        Gerencie suas contas para rastrear transferências entre bancos.
      </p>
      <AccountManager />
    </div>
  )
}
