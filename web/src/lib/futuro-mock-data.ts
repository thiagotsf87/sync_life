export interface ArchivedObjective {
  id: string
  name: string
  jornadaName?: string
  icon: string
  iconBg: string
  dateRange: string
  status: 'completed' | 'paused'
  stats: { label: string; value: string; color?: string }[]
  xpEarned?: number
  levelUnlocked?: string
}

export const MOCK_ARCHIVED: ArchivedObjective[] = [
  {
    id: 'a1',
    name: 'Reserva de Emergência',
    jornadaName: 'Missão: Reserva de Emergência',
    icon: '🛡️',
    iconBg: 'rgba(16,185,129,0.12)',
    dateRange: 'Mar 2023 → Jan 2026 · 34 meses',
    status: 'completed',
    stats: [
      { label: 'Meta', value: 'R$ 18.000', color: '#10b981' },
      { label: 'Acumulado', value: 'R$ 18.400' },
      { label: 'Atingido', value: '102%', color: '#10b981' },
    ],
    xpEarned: 350,
    levelUnlocked: 'Desbloqueou Nível 5',
  },
  {
    id: 'a2',
    name: 'Moto Honda CB 500',
    jornadaName: 'Missão: Moto CB 500',
    icon: '🏍️',
    iconBg: 'rgba(6,182,212,0.12)',
    dateRange: 'Jan 2022 → Ago 2023 · 19 meses',
    status: 'completed',
    stats: [
      { label: 'Meta', value: 'R$ 24.000', color: '#10b981' },
      { label: 'Acumulado', value: 'R$ 24.000' },
      { label: 'Tempo', value: '19 meses' },
    ],
    xpEarned: 280,
  },
  {
    id: 'a3',
    name: 'Home Office Setup',
    jornadaName: 'Home Office Setup',
    icon: '🖥️',
    iconBg: 'rgba(110,144,184,0.1)',
    dateRange: 'Pausado em Out 2024',
    status: 'paused',
    stats: [
      { label: 'Meta', value: 'R$ 8.000' },
      { label: 'Acumulado', value: 'R$ 3.200' },
      { label: 'Prog.', value: '40%' },
    ],
  },
]
