'use client'

import { useState } from 'react'
import { ToggleSwitch } from '@/components/settings/toggle-switch'

interface ToggleRowProps {
  label: string
  sub?: string
  defaultOn?: boolean
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
}

export function ToggleRow({
  label,
  sub,
  defaultOn = false,
  checked,
  disabled,
  onChange,
}: ToggleRowProps) {
  const isControlled = checked !== undefined
  const [internal, setInternal] = useState(defaultOn)
  const value = isControlled ? checked! : internal

  const handleChange = (next: boolean) => {
    if (!isControlled) setInternal(next)
    onChange?.(next)
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-[var(--sl-border)] last:border-b-0">
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-[var(--sl-t1)]">{label}</p>
        {sub && <p className="text-[12px] text-[var(--sl-t3)] mt-0.5">{sub}</p>}
      </div>
      <ToggleSwitch checked={value} onChange={handleChange} disabled={disabled} />
    </div>
  )
}
