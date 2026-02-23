'use client'

interface ContentAreaProps {
  children: React.ReactNode
}

export function ContentArea({ children }: ContentAreaProps) {
  return (
    <main className="flex-1 overflow-y-auto min-h-0">
      <div className="sl-fade-up p-[22px] pb-20 lg:pb-[22px]">
        {children}
      </div>
    </main>
  )
}
