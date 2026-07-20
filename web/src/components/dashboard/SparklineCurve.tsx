'use client'

interface SparklineCurveProps {
  data: number[]
  color?: string
  width?: number
  height?: number
  showEndDot?: boolean
}

export function SparklineCurve({
  data,
  color = 'var(--sl-em)',
  width = 420,
  height = 56,
  showEndDot = true,
}: SparklineCurveProps) {
  if (!data || data.length === 0) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="var(--sl-border)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </svg>
    )
  }

  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const step = width / Math.max(data.length - 1, 1)
  const pts = data.map<[number, number]>((v, i) => [
    i * step,
    height - ((v - min) / range) * (height - 6) - 3,
  ])

  // Smooth curve via Catmull-Rom-to-Bezier
  let path = `M${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2[0]},${p2[1]}`
  }

  const area = `${path} L${width},${height} L0,${height} Z`
  const last = pts[pts.length - 1]
  const gradId = `spk-grad-${Math.random().toString(36).slice(2, 8)}`

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0F766E" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#0F766E" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEndDot && <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />}
    </svg>
  )
}
