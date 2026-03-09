'use client'

interface ExpTransportCardProps {
  icon: string
  route: string
  company: string
  dateTime: string
  duration: string
  cost: string
  status: string
  statusType: 'paid' | 'pending' | 'included'
}

export function ExpTransportCard({
  icon, route, company, dateTime, duration, cost, status, statusType,
}: ExpTransportCardProps) {
  const statusColor = statusType === 'paid' ? '#10b981' : statusType === 'included' ? '#10b981' : '#f59e0b'

  return (
    <div className="mx-4 mb-[10px] rounded-[10px] p-[14px] flex gap-3"
      style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}>
      <div className="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center text-[20px] shrink-0"
        style={{ background: 'rgba(236,72,153,0.15)' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[14px] font-semibold text-[var(--sl-t1)]">{route}</p>
            <p className="text-[11px] text-[var(--sl-t2)] mt-[2px]">{company}</p>
          </div>
          {statusType !== 'included' && (
            <span className="inline-flex items-center px-2 py-[3px] rounded-[10px] text-[10px] font-semibold"
              style={{ background: `${statusColor}1e`, color: statusColor }}>
              {status}
            </span>
          )}
        </div>
        <div className="flex gap-4 text-[11px] text-[var(--sl-t2)] mt-2">
          <span>📅 {dateTime}</span>
          <span>⏱️ {duration}</span>
        </div>
        <p className="font-[DM_Mono] text-[13px] text-[var(--sl-t1)] font-semibold mt-[6px]">
          {cost}{' '}
          <span className="text-[10px] font-semibold" style={{ color: statusColor }}>{status}</span>
        </p>
      </div>
    </div>
  )
}
