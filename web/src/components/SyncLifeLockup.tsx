import Image from 'next/image'

interface SyncLifeLockupProps {
  height?: number
  withTagline?: boolean
  className?: string
}

export function SyncLifeLockup({
  height = 48,
  withTagline = false,
  className,
}: SyncLifeLockupProps) {
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: height * 0.18,
      }}
    >
      <Image
        src="/logo-mark.png"
        alt=""
        width={height}
        height={height}
        priority
        style={{ display: 'block', objectFit: 'contain', width: 'auto', height }}
      />
      <div
        style={{
          fontFamily: 'var(--font-syne), sans-serif',
          fontSize: height * 0.62,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          lineHeight: 1,
        }}
      >
        <span style={{ color: 'var(--sl-t1)' }}>Sync</span>
        <span style={{ color: 'var(--sl-em)' }}>Life</span>
      </div>
      {withTagline && (
        <div
          style={{
            fontFamily: 'var(--font-dm-sans), sans-serif',
            fontSize: Math.max(9, height * 0.12),
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--sl-t2)',
            marginTop: 2,
            textAlign: 'center',
          }}
        >
          O sistema operacional da sua vida
        </div>
      )}
    </div>
  )
}
