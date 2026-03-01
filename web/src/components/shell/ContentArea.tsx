'use client'

interface ContentAreaProps {
  children: React.ReactNode
}

export function ContentArea({ children }: ContentAreaProps) {
  return (
    <main className="flex-1 overflow-y-auto min-h-0">
      <div className="sl-fade p-[22px] pb-[calc(var(--mob-bottom-nav-height)+var(--mob-safe-bottom)+8px)] lg:pb-[22px]">
        {children}
      </div>
    </main>
  )
}
