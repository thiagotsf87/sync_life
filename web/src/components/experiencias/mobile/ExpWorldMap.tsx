import type { MapPin } from '@/lib/exp-mock-data'
import {
  EXP_PRIMARY,
} from '@/lib/exp-colors'

interface ExpWorldMapProps {
  pins: MapPin[]
  showLegend?: boolean
  mini?: boolean
}

const PIN_COLORS = {
  visited: EXP_PRIMARY,
  planned: '#f59e0b',
  bucket: '#f97316',
}

// Continent path data (simplified world map)
const CONTINENTS = [
  // North America
  { d: 'M30,25 L55,20 L75,22 L95,18 L105,25 L110,35 L105,42 L100,48 L90,52 L85,58 L80,65 L75,68 L68,72 L60,74 L55,70 L48,62 L42,55 L35,52 L30,48 L28,40 L25,32 Z', cls: 'base' },
  // Central America
  { d: 'M60,74 L65,76 L68,80 L66,84 L62,88 L58,86 L56,82 L57,78 Z', cls: 'base' },
  // South America (visited)
  { d: 'M62,88 L72,86 L80,90 L86,96 L90,105 L92,115 L90,125 L85,135 L78,142 L70,148 L64,150 L60,146 L56,138 L54,128 L52,118 L50,108 L52,98 L55,92 Z', cls: 'visited' },
  // Europe (partial)
  { d: 'M160,18 L170,15 L178,16 L175,22 L180,26 L186,22 L190,18 L195,22 L192,28 L188,30 L185,34 L180,38 L176,42 L170,45 L164,44 L158,40 L155,35 L154,28 L156,23 Z', cls: 'partial' },
  // Iberian Peninsula (visited)
  { d: 'M155,35 L158,40 L164,44 L160,48 L154,50 L148,48 L146,43 L148,38 L152,36 Z', cls: 'visited' },
  // Africa
  { d: 'M160,52 L170,48 L180,50 L190,52 L196,56 L200,62 L204,70 L206,80 L204,90 L200,100 L194,108 L186,115 L178,118 L170,116 L164,110 L160,102 L156,92 L154,82 L152,72 L154,62 L156,56 Z', cls: 'base' },
  // Asia
  { d: 'M195,15 L220,10 L245,12 L265,16 L280,20 L295,18 L310,22 L318,28 L320,38 L315,48 L308,55 L298,58 L288,62 L278,58 L268,55 L258,52 L248,48 L238,50 L228,48 L218,45 L208,42 L200,38 L195,32 L192,25 Z', cls: 'base' },
  // Japan (planned)
  { d: 'M310,30 L315,28 L318,32 L316,38 L312,42 L308,40 L306,36 L308,32 Z', cls: 'planned' },
  // Middle East / India
  { d: 'M208,42 L218,45 L228,48 L238,50 L240,58 L238,66 L232,72 L224,76 L216,74 L210,68 L206,62 L204,55 L206,48 Z', cls: 'base' },
  // Southeast Asia
  { d: 'M268,55 L278,58 L288,62 L292,68 L288,74 L282,78 L274,76 L268,72 L264,66 L266,60 Z', cls: 'base' },
  // Australia
  { d: 'M290,110 L305,105 L318,108 L328,115 L332,125 L328,134 L318,140 L305,142 L294,138 L288,130 L286,120 L288,114 Z', cls: 'base' },
  // Tasmania
  { d: 'M310,142 L316,141 L318,146 L314,148 L310,146 Z', cls: 'base' },
  // Greenland
  { d: 'M110,8 L125,5 L138,8 L142,15 L138,22 L130,24 L120,22 L112,18 L108,12 Z', cls: 'base' },
  // Madagascar
  { d: 'M210,108 L214,105 L218,110 L216,118 L212,120 L208,116 L208,112 Z', cls: 'base' },
]

function getContinentStyle(cls: string): React.CSSProperties {
  const accent = EXP_PRIMARY
  switch (cls) {
    case 'visited':
      return { fill: accent, opacity: 0.35 }
    case 'partial':
      return { fill: accent, opacity: 0.18 }
    case 'planned':
      return { fill: 'none', stroke: '#f59e0b', strokeWidth: 0.8, strokeDasharray: '3 2', opacity: 0.7 }
    default:
      return { fill: 'var(--sl-s3)', opacity: 0.6 }
  }
}

export function ExpWorldMap({ pins, showLegend, mini }: ExpWorldMapProps) {
  return (
    <div
      className="rounded-[12px] overflow-hidden"
      style={{
        background: mini ? 'var(--sl-s1)' : 'var(--sl-s1)',
        border: '1px solid var(--sl-border)',
        padding: mini ? 10 : 14,
      }}
    >
      <div
        className="rounded-[10px] overflow-hidden"
        style={{ background: 'var(--sl-s2)' }}
      >
        <svg viewBox="0 0 360 180" xmlns="http://www.w3.org/2000/svg" className="block w-full h-auto">
          {CONTINENTS.map((c, i) => (
            <path key={i} d={c.d} style={getContinentStyle(c.cls)} />
          ))}
          {pins.map((pin, i) => {
            const color = PIN_COLORS[pin.type]
            if (pin.type === 'bucket') {
              return (
                <circle
                  key={i}
                  cx={pin.cx}
                  cy={pin.cy}
                  r={3.5}
                  fill={color}
                  stroke="var(--sl-bg)"
                  strokeWidth={0.5}
                />
              )
            }
            return <circle key={i} cx={pin.cx} cy={pin.cy} r={3} fill={color} />
          })}
        </svg>
      </div>
      {showLegend && (
        <div className="flex gap-[14px] justify-center mt-[10px] flex-wrap">
          <LegendItem color={EXP_PRIMARY} label="Conquistado" />
          <LegendItem color="#f59e0b" label="Planejado" dashed />
          <LegendItem color="var(--sl-s3)" label="Não explorado" />
        </div>
      )}
    </div>
  )
}

function LegendItem({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <div className="flex items-center gap-[5px] text-[10px] text-[var(--sl-t3)]">
      <div
        className="w-2 h-2 rounded-full"
        style={{
          background: dashed ? 'transparent' : color,
          border: dashed ? `1px dashed ${color}` : 'none',
        }}
      />
      {label}
    </div>
  )
}
