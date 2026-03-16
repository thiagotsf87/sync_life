import { describe, it, expect } from 'vitest'

// ── Inline logic from carreira/page.tsx ──

interface Skill {
  id: string
  name: string
  proficiency_level: number
  category: string
}

interface RoadmapStep {
  id: string
  title: string
  status: string
  description?: string
  target_date?: string
}

interface Roadmap {
  id: string
  name: string
  progress: number
  steps: RoadmapStep[]
}

function getExpertCount(skills: Skill[]): number {
  return skills.filter(s => s.proficiency_level >= 4).length
}

function getRoadmapProgress(roadmap: Roadmap | null): number {
  return roadmap ? Math.round(roadmap.progress) : 0
}

function getNextStep(roadmap: Roadmap | null): RoadmapStep | undefined {
  return roadmap?.steps?.find(s => s.status !== 'completed')
}

function getXpPercent(currentXp: number, nextLevelXp: number): number {
  return Math.round(currentXp / nextLevelXp * 100)
}

// ── Tests ──

describe('Carreira Dashboard Logic', () => {
  describe('getExpertCount', () => {
    it('counts skills with level >= 4', () => {
      const skills: Skill[] = [
        { id: '1', name: 'React', proficiency_level: 5, category: 'hard_skill' },
        { id: '2', name: 'TypeScript', proficiency_level: 4, category: 'hard_skill' },
        { id: '3', name: 'CSS', proficiency_level: 3, category: 'hard_skill' },
        { id: '4', name: 'Liderança', proficiency_level: 2, category: 'soft_skill' },
      ]
      expect(getExpertCount(skills)).toBe(2)
    })

    it('returns 0 when no skills are expert level', () => {
      const skills: Skill[] = [
        { id: '1', name: 'React', proficiency_level: 3, category: 'hard_skill' },
      ]
      expect(getExpertCount(skills)).toBe(0)
    })

    it('returns 0 for empty array', () => {
      expect(getExpertCount([])).toBe(0)
    })
  })

  describe('getRoadmapProgress', () => {
    it('returns rounded progress', () => {
      const roadmap: Roadmap = {
        id: '1',
        name: 'Senior',
        progress: 66.67,
        steps: [],
      }
      expect(getRoadmapProgress(roadmap)).toBe(67)
    })

    it('returns 0 for null roadmap', () => {
      expect(getRoadmapProgress(null)).toBe(0)
    })

    it('returns 100 for completed roadmap', () => {
      const roadmap: Roadmap = { id: '1', name: 'Test', progress: 100, steps: [] }
      expect(getRoadmapProgress(roadmap)).toBe(100)
    })
  })

  describe('getNextStep', () => {
    it('returns first non-completed step', () => {
      const roadmap: Roadmap = {
        id: '1',
        name: 'Test',
        progress: 50,
        steps: [
          { id: 's1', title: 'Certificação', status: 'completed' },
          { id: 's2', title: 'Mentoria', status: 'in_progress' },
          { id: 's3', title: 'Promoção', status: 'pending' },
        ],
      }
      const next = getNextStep(roadmap)
      expect(next?.id).toBe('s2')
      expect(next?.title).toBe('Mentoria')
    })

    it('returns undefined when all steps are completed', () => {
      const roadmap: Roadmap = {
        id: '1',
        name: 'Test',
        progress: 100,
        steps: [
          { id: 's1', title: 'Step 1', status: 'completed' },
          { id: 's2', title: 'Step 2', status: 'completed' },
        ],
      }
      expect(getNextStep(roadmap)).toBeUndefined()
    })

    it('returns undefined for null roadmap', () => {
      expect(getNextStep(null)).toBeUndefined()
    })

    it('returns first step when none are completed', () => {
      const roadmap: Roadmap = {
        id: '1',
        name: 'Test',
        progress: 0,
        steps: [
          { id: 's1', title: 'Step 1', status: 'pending' },
          { id: 's2', title: 'Step 2', status: 'pending' },
        ],
      }
      expect(getNextStep(roadmap)?.id).toBe('s1')
    })
  })

  describe('getXpPercent', () => {
    it('calculates correct percentage', () => {
      expect(getXpPercent(750, 1000)).toBe(75)
    })

    it('returns 0 for 0 XP', () => {
      expect(getXpPercent(0, 1000)).toBe(0)
    })

    it('returns 100 for max XP', () => {
      expect(getXpPercent(1000, 1000)).toBe(100)
    })

    it('rounds correctly', () => {
      expect(getXpPercent(333, 1000)).toBe(33)
      expect(getXpPercent(666, 1000)).toBe(67)
    })
  })
})
