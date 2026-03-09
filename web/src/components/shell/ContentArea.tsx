'use client'

interface ContentAreaProps {
  children: React.ReactNode
}

export function ContentArea({ children }: ContentAreaProps) {
  return (
    <main className="flex-1 overflow-y-auto min-h-0">
      <div className="sl-fade px-4 py-4 pb-[calc(68px+16px+env(safe-area-inset-bottom,0px))] lg:p-[22px] lg:pb-[22px]">
        {children}
      </div>
    </main>
  )
}
