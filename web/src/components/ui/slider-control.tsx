'use client'

import { cn } from '@/lib/utils'
import { useId } from 'react'

interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  formatValue?: (v: number) => string
  gradientColors?: [string, string]
  onChange: (v: number) => void
  className?: string
}

export function SliderControl({
  label,
  value,
  min,
  max,
  step = 1,
  formatValue,
  gradientColors = ['#10b981', '#0055ff'],
  onChange,
  className,
}: SliderControlProps) {
  const id = useId()
  const percent = ((value - min) / (max - min)) * 100
  const displayValue = formatValue ? formatValue(value) : String(value)

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[12px] font-medium text-[var(--sl-t2)]">
          {label}
        </label>
        <span className="font-[DM_Mono] text-[13px] font-semibold text-[var(--sl-t1)]">
          {displayValue}
        </span>
      </div>
      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-[6px] appearance-none cursor-pointer rounded-full outline-none
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
                     [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(0,0,0,0.3)]
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10
                     [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5
                     [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2
                     [&::-moz-range-thumb]:border-white
                     [&::-moz-range-thumb]:shadow-[0_0_6px_rgba(0,0,0,0.3)]
                     [&::-moz-range-thumb]:cursor-pointer"
          style={{
            background: `linear-gradient(90deg, ${gradientColors[0]} 0%, ${gradientColors[1]} ${percent}%, var(--sl-s3) ${percent}%)`,
            // Thumb color via CSS custom property
            ['--thumb-bg' as string]: gradientColors[0],
          }}
        />
        <style>{`
          #${CSS.escape(id)}::-webkit-slider-thumb {
            background: ${gradientColors[0]};
          }
          #${CSS.escape(id)}::-moz-range-thumb {
            background: ${gradientColors[0]};
          }
        `}</style>
      </div>
    </div>
  )
}
