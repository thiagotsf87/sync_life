// Lucide-style stroke icons. Centralized so the system stays consistent.
const SLIcon = ({ children, size = 18, strokeWidth = 1.75 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
    style={{ display: 'block', flexShrink: 0 }}>
    {children}
  </svg>
);

const SLIcons = {
  // Módulos
  panorama: ({ size }) => <SLIcon size={size}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></SLIcon>,
  financas: ({ size }) => <SLIcon size={size}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></SLIcon>,
  tempo: ({ size }) => <SLIcon size={size}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></SLIcon>,
  futuro: ({ size }) => <SLIcon size={size}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></SLIcon>,
  corpo: ({ size }) => <SLIcon size={size}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></SLIcon>,
  mente: ({ size }) => <SLIcon size={size}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></SLIcon>,
  patrimonio: ({ size }) => <SLIcon size={size}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></SLIcon>,
  carreira: ({ size }) => <SLIcon size={size}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></SLIcon>,
  experiencias: ({ size }) => <SLIcon size={size}><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></SLIcon>,
  conquistas: ({ size }) => <SLIcon size={size}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z"/></SLIcon>,
  config: ({ size }) => <SLIcon size={size}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></SLIcon>,
  // UI
  bell:        ({ size }) => <SLIcon size={size}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></SLIcon>,
  trending:    ({ size }) => <SLIcon size={size}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></SLIcon>,
  trendingDown:({ size }) => <SLIcon size={size}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></SLIcon>,
  arrowRight:  ({ size }) => <SLIcon size={size}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></SLIcon>,
  arrowUpRight:({ size }) => <SLIcon size={size}><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></SLIcon>,
  arrowDownRight:({ size }) => <SLIcon size={size}><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></SLIcon>,
  check:       ({ size }) => <SLIcon size={size}><polyline points="20 6 9 17 4 12"/></SLIcon>,
  plus:        ({ size }) => <SLIcon size={size}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></SLIcon>,
  sparkles:    ({ size }) => <SLIcon size={size}><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/></SLIcon>,
  fileText:    ({ size }) => <SLIcon size={size}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></SLIcon>,
  calendar:    ({ size }) => <SLIcon size={size}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></SLIcon>,
  send:        ({ size }) => <SLIcon size={size}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></SLIcon>,
  more:        ({ size }) => <SLIcon size={size}><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></SLIcon>,
  chevronDown: ({ size }) => <SLIcon size={size}><polyline points="6 9 12 15 18 9"/></SLIcon>,
  chevronLeft: ({ size }) => <SLIcon size={size}><polyline points="15 18 9 12 15 6"/></SLIcon>,
  chevronRight:({ size }) => <SLIcon size={size}><polyline points="9 18 15 12 9 6"/></SLIcon>,
  search:      ({ size }) => <SLIcon size={size}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></SLIcon>,
  pieChart:    ({ size }) => <SLIcon size={size}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></SLIcon>,
  trophy:      ({ size }) => <SLIcon size={size}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></SLIcon>,
  flame:       ({ size }) => <SLIcon size={size}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></SLIcon>,
  moon:        ({ size }) => <SLIcon size={size}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></SLIcon>,
  // Logo SyncLife — mark only (PNG, mesmo em qualquer tema)
  logo: ({ size = 32 }) => (
    <img
      src="logo-mark.png"
      alt="SyncLife"
      width={size} height={size}
      style={{ display: 'block', objectFit: 'contain' }}
    />
  ),
  // Lockup vertical: mark + wordmark RENDERIZADO COMO TEXTO (adapta perfeitamente ao tema)
  // Por que texto? PNG branco sobre branco perde transparência. Texto Space Grotesk +
  // var(--sl-t1)/var(--sl-em) adapta corretamente em qualquer fundo.
  logoLockup: ({ height = 48, withTagline = false }) => (
    <div style={{
      display: 'inline-flex', flexDirection: 'column',
      alignItems: 'center', gap: height * 0.18,
    }}>
      <img src="logo-mark.png" alt="" height={height}
           style={{ display: 'block', objectFit: 'contain' }}/>
      <div style={{
        fontFamily: 'var(--sl-font-display)',
        fontSize: height * 0.62,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        lineHeight: 1,
      }}>
        <span style={{ color: 'var(--sl-t1)' }}>Sync</span>
        <span style={{ color: 'var(--sl-em)' }}>Life</span>
      </div>
      {withTagline && (
        <div style={{
          fontFamily: 'var(--sl-font-body)',
          fontSize: Math.max(9, height * 0.12),
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--sl-t2)',
          marginTop: 2,
        }}>
          O sistema operacional da sua vida
        </div>
      )}
    </div>
  ),
};

Object.assign(window, { SLIcon, SLIcons });
