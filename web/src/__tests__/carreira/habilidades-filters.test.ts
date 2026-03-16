import { describe, it, expect } from 'vitest'

// ── Inline logic from habilidades/page.tsx ──

type SkillCategory = 'hard_skill' | 'soft_skill' | 'language' | 'certification'

interface Skill {
  id: string
  name: string
  category: SkillCategory
  proficiency_level: number
}

function filterSkills(
  skills: Skill[],
  filterCat: SkillCategory | 'all',
  search: string
): Skill[] {
  return skills.filter(s => {
    const matchCat = filterCat === 'all' || s.category === filterCat
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })
}

function countByCategory(skills: Skill[]): Record<SkillCategory, number> {
  return {
    hard_skill: skills.filter(s => s.category === 'hard_skill').length,
    soft_skill: skills.filter(s => s.category === 'soft_skill').length,
    language: skills.filter(s => s.category === 'language').length,
    certification: skills.filter(s => s.category === 'certification').length,
  }
}

function calcAvgProficiency(skills: Skill[]): number {
  if (skills.length === 0) return 0
  return skills.reduce((a, s) => a + s.proficiency_level, 0) / skills.length
}

function findStrongestCategory(skills: Skill[]): SkillCategory | null {
  const categories: SkillCategory[] = ['hard_skill', 'soft_skill', 'language', 'certification']
  const catAvgs = categories.map(cat => {
    const catSkills = skills.filter(s => s.category === cat)
    return {
      cat,
      avg: catSkills.length > 0 ? catSkills.reduce((a, s) => a + s.proficiency_level, 0) / catSkills.length : 0,
      count: catSkills.length,
    }
  }).filter(c => c.count > 0)

  if (catAvgs.length === 0) return null
  return catAvgs.reduce((a, b) => a.avg >= b.avg ? a : b).cat
}

function findWeakestCategory(skills: Skill[]): SkillCategory | null {
  const categories: SkillCategory[] = ['hard_skill', 'soft_skill', 'language', 'certification']
  const catAvgs = categories.map(cat => {
    const catSkills = skills.filter(s => s.category === cat)
    return {
      cat,
      avg: catSkills.length > 0 ? catSkills.reduce((a, s) => a + s.proficiency_level, 0) / catSkills.length : 0,
      count: catSkills.length,
    }
  }).filter(c => c.count > 0)

  if (catAvgs.length <= 1) return null
  return catAvgs.reduce((a, b) => a.avg <= b.avg ? a : b).cat
}

// ── Test Data ──

const SKILLS: Skill[] = [
  { id: '1', name: 'React', category: 'hard_skill', proficiency_level: 5 },
  { id: '2', name: 'TypeScript', category: 'hard_skill', proficiency_level: 4 },
  { id: '3', name: 'Python', category: 'hard_skill', proficiency_level: 3 },
  { id: '4', name: 'Liderança', category: 'soft_skill', proficiency_level: 3 },
  { id: '5', name: 'Comunicação', category: 'soft_skill', proficiency_level: 4 },
  { id: '6', name: 'Inglês', category: 'language', proficiency_level: 4 },
  { id: '7', name: 'Espanhol', category: 'language', proficiency_level: 2 },
  { id: '8', name: 'AWS Solutions Architect', category: 'certification', proficiency_level: 5 },
]

// ── Tests ──

describe('Habilidades Filters', () => {
  describe('filterSkills', () => {
    it('returns all with filter "all" and no search', () => {
      expect(filterSkills(SKILLS, 'all', '')).toHaveLength(8)
    })

    it('filters by hard_skill category', () => {
      const result = filterSkills(SKILLS, 'hard_skill', '')
      expect(result).toHaveLength(3)
      expect(result.every(s => s.category === 'hard_skill')).toBe(true)
    })

    it('filters by certification category', () => {
      const result = filterSkills(SKILLS, 'certification', '')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('AWS Solutions Architect')
    })

    it('filters by search text (case insensitive)', () => {
      const result = filterSkills(SKILLS, 'all', 'react')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('React')
    })

    it('combines category and search', () => {
      const result = filterSkills(SKILLS, 'hard_skill', 'type')
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('TypeScript')
    })

    it('returns empty when no match', () => {
      expect(filterSkills(SKILLS, 'certification', 'react')).toHaveLength(0)
    })
  })

  describe('countByCategory', () => {
    it('counts correctly', () => {
      const counts = countByCategory(SKILLS)
      expect(counts.hard_skill).toBe(3)
      expect(counts.soft_skill).toBe(2)
      expect(counts.language).toBe(2)
      expect(counts.certification).toBe(1)
    })

    it('returns zeros for empty array', () => {
      const counts = countByCategory([])
      expect(counts.hard_skill).toBe(0)
      expect(counts.soft_skill).toBe(0)
      expect(counts.language).toBe(0)
      expect(counts.certification).toBe(0)
    })
  })

  describe('calcAvgProficiency', () => {
    it('calculates correct average', () => {
      // (5+4+3+3+4+4+2+5) / 8 = 30/8 = 3.75
      expect(calcAvgProficiency(SKILLS)).toBeCloseTo(3.75)
    })

    it('returns 0 for empty array', () => {
      expect(calcAvgProficiency([])).toBe(0)
    })

    it('handles single skill', () => {
      expect(calcAvgProficiency([SKILLS[0]])).toBe(5)
    })
  })

  describe('findStrongestCategory', () => {
    it('finds the strongest category by average proficiency', () => {
      // hard_skill avg: (5+4+3)/3 = 4.0
      // soft_skill avg: (3+4)/2 = 3.5
      // language avg: (4+2)/2 = 3.0
      // certification avg: 5/1 = 5.0
      expect(findStrongestCategory(SKILLS)).toBe('certification')
    })

    it('returns null for empty array', () => {
      expect(findStrongestCategory([])).toBeNull()
    })
  })

  describe('findWeakestCategory', () => {
    it('finds the weakest category by average proficiency', () => {
      // language avg: 3.0 → weakest
      expect(findWeakestCategory(SKILLS)).toBe('language')
    })

    it('returns null for single category', () => {
      const singleCat = SKILLS.filter(s => s.category === 'hard_skill')
      expect(findWeakestCategory(singleCat)).toBeNull()
    })

    it('returns null for empty array', () => {
      expect(findWeakestCategory([])).toBeNull()
    })
  })
})
