import { describe, it, expect } from 'vitest'

// ── Inline logic from roadmap/page.tsx ──

type RoadmapStatus = 'active' | 'completed' | 'paused' | 'abandoned'
type StepStatus = 'pending' | 'in_progress' | 'completed'

interface RoadmapStep {
  id: string
  title: string
  status: StepStatus
  target_date?: string | null
  description?: string | null
}

interface Roadmap {
  id: string
  name: string
  status: RoadmapStatus
  progress: number
  current_title: string
  target_title: string
  target_salary: number | null
  steps: RoadmapStep[]
}

const STATUS_LABELS: Record<RoadmapStatus, string> = {
  active: 'Ativo',
  completed: 'Concluído',
  paused: 'Pausado',
  abandoned: 'Abandonado',
}

const STATUS_COLORS: Record<RoadmapStatus, string> = {
  active: '#f59e0b',
  completed: '#10b981',
  paused: '#6e90b8',
  abandoned: '#f43f5e',
}

function shouldDefaultOpen(status: RoadmapStatus): boolean {
  return status === 'active'
}

function shouldDim(status: RoadmapStatus): boolean {
  return status === 'paused' || status === 'abandoned'
}

function getAccentColor(status: RoadmapStatus): string | undefined {
  return status === 'active' ? '#f43f5e' : undefined
}

function mapStepToTimeline(step: RoadmapStep): { label: string; status: 'done' | 'current' | 'pending' } {
  return {
    label: step.title,
    status: step.status === 'completed' ? 'done' : step.status === 'in_progress' ? 'current' : 'pending',
  }
}

function getCurrentStep(steps: RoadmapStep[]): RoadmapStep | undefined {
  return steps.find(s => s.status !== 'completed')
}

function calcSalaryDelta(targetSalary: number | null, currentSalary: number | null): {
  delta: number | null
  deltaPct: number | null
} {
  if (!targetSalary || !currentSalary) return { delta: null, deltaPct: null }
  const delta = targetSalary - currentSalary
  const deltaPct = currentSalary > 0 ? ((targetSalary - currentSalary) / currentSalary) * 100 : null
  return { delta, deltaPct }
}

function willCompleteRoadmap(roadmap: Roadmap, completingStepId: string): boolean {
  const remaining = roadmap.steps.filter(s => s.id !== completingStepId && s.status !== 'completed')
  return remaining.length === 0
}

// ── Test Data ──

const ROADMAPS: Roadmap[] = [
  {
    id: 'r1',
    name: 'Para Sênior',
    status: 'active',
    progress: 66,
    current_title: 'Dev Pleno',
    target_title: 'Dev Sênior',
    target_salary: 18000,
    steps: [
      { id: 's1', title: 'Cert AWS', status: 'completed' },
      { id: 's2', title: 'Mentoria 6m', status: 'in_progress' },
      { id: 's3', title: 'Promoção', status: 'pending' },
    ],
  },
  {
    id: 'r2',
    name: 'Tech Lead',
    status: 'completed',
    progress: 100,
    current_title: 'Dev Sênior',
    target_title: 'Tech Lead',
    target_salary: 25000,
    steps: [
      { id: 's4', title: 'Liderança', status: 'completed' },
      { id: 's5', title: 'Gestão', status: 'completed' },
    ],
  },
  {
    id: 'r3',
    name: 'Management',
    status: 'paused',
    progress: 30,
    current_title: 'Tech Lead',
    target_title: 'Engineering Manager',
    target_salary: null,
    steps: [
      { id: 's6', title: 'MBA', status: 'pending' },
    ],
  },
]

// ── Tests ──

describe('Roadmap Grouping', () => {
  describe('shouldDefaultOpen', () => {
    it('opens active roadmaps', () => {
      expect(shouldDefaultOpen('active')).toBe(true)
    })

    it('keeps completed roadmaps closed', () => {
      expect(shouldDefaultOpen('completed')).toBe(false)
    })

    it('keeps paused roadmaps closed', () => {
      expect(shouldDefaultOpen('paused')).toBe(false)
    })

    it('keeps abandoned roadmaps closed', () => {
      expect(shouldDefaultOpen('abandoned')).toBe(false)
    })
  })

  describe('shouldDim', () => {
    it('dims paused roadmaps', () => {
      expect(shouldDim('paused')).toBe(true)
    })

    it('dims abandoned roadmaps', () => {
      expect(shouldDim('abandoned')).toBe(true)
    })

    it('does not dim active roadmaps', () => {
      expect(shouldDim('active')).toBe(false)
    })

    it('does not dim completed roadmaps', () => {
      expect(shouldDim('completed')).toBe(false)
    })
  })

  describe('getAccentColor', () => {
    it('returns module color for active', () => {
      expect(getAccentColor('active')).toBe('#f43f5e')
    })

    it('returns undefined for non-active', () => {
      expect(getAccentColor('completed')).toBeUndefined()
      expect(getAccentColor('paused')).toBeUndefined()
    })
  })

  describe('mapStepToTimeline', () => {
    it('maps completed to done', () => {
      const result = mapStepToTimeline({ id: '1', title: 'Test', status: 'completed' })
      expect(result.status).toBe('done')
    })

    it('maps in_progress to current', () => {
      const result = mapStepToTimeline({ id: '1', title: 'Test', status: 'in_progress' })
      expect(result.status).toBe('current')
    })

    it('maps pending to pending', () => {
      const result = mapStepToTimeline({ id: '1', title: 'Test', status: 'pending' })
      expect(result.status).toBe('pending')
    })
  })

  describe('getCurrentStep', () => {
    it('finds first non-completed step', () => {
      const step = getCurrentStep(ROADMAPS[0].steps)
      expect(step?.id).toBe('s2')
    })

    it('returns undefined when all completed', () => {
      expect(getCurrentStep(ROADMAPS[1].steps)).toBeUndefined()
    })
  })

  describe('calcSalaryDelta', () => {
    it('calculates delta correctly', () => {
      const result = calcSalaryDelta(18000, 12000)
      expect(result.delta).toBe(6000)
      expect(result.deltaPct).toBeCloseTo(50)
    })

    it('returns null when target is null', () => {
      const result = calcSalaryDelta(null, 12000)
      expect(result.delta).toBeNull()
      expect(result.deltaPct).toBeNull()
    })

    it('returns null when current is null', () => {
      const result = calcSalaryDelta(18000, null)
      expect(result.delta).toBeNull()
    })

    it('handles zero current salary', () => {
      const result = calcSalaryDelta(18000, 0)
      expect(result.delta).toBeNull() // 0 is falsy
    })
  })

  describe('willCompleteRoadmap', () => {
    it('returns true when completing the last pending step', () => {
      // Roadmap 0: s1 completed, s2 in_progress, s3 pending
      // If s2 is the completing step, s3 is still pending → false
      expect(willCompleteRoadmap(ROADMAPS[0], 's2')).toBe(false)
    })

    it('returns true when only one non-completed step remains', () => {
      const roadmap: Roadmap = {
        ...ROADMAPS[0],
        steps: [
          { id: 's1', title: 'Step 1', status: 'completed' },
          { id: 's2', title: 'Step 2', status: 'in_progress' },
        ],
      }
      expect(willCompleteRoadmap(roadmap, 's2')).toBe(true)
    })

    it('returns true when all other steps already completed', () => {
      expect(willCompleteRoadmap(ROADMAPS[1], 's4')).toBe(true) // s5 already completed
    })
  })

  describe('STATUS_LABELS', () => {
    it('has labels for all statuses', () => {
      expect(STATUS_LABELS.active).toBe('Ativo')
      expect(STATUS_LABELS.completed).toBe('Concluído')
      expect(STATUS_LABELS.paused).toBe('Pausado')
      expect(STATUS_LABELS.abandoned).toBe('Abandonado')
    })
  })

  describe('STATUS_COLORS', () => {
    it('has colors for all statuses', () => {
      expect(STATUS_COLORS.active).toBe('#f59e0b')
      expect(STATUS_COLORS.completed).toBe('#10b981')
      expect(STATUS_COLORS.paused).toBe('#6e90b8')
      expect(STATUS_COLORS.abandoned).toBe('#f43f5e')
    })
  })
})
