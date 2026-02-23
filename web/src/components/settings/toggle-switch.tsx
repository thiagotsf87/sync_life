'use client'

interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function ToggleSwitch({ checked, onChange, disabled }: ToggleSwitchProps) {
  return (
    <label className="relative w-11 h-6 shrink-0 cursor-pointer" style={{ opacity: disabled ? 0.5 : 1 }}>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
      />
      <div
        className="absolute inset-0 rounded-full transition-all duration-200"
        style={{
          background: checked
            ? 'linear-gradient(90deg, #10b981, #0055ff)'
            : 'var(--sl-s3)',
          border: checked
            ? '1px solid rgba(16,185,129,0.4)'
            : '1px solid var(--sl-border-h)',
        }}
      />
      <div
        className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all duration-200 shadow-sm"
        style={{ left: checked ? '22px' : '3px' }}
      />
    </label>
  )
}
