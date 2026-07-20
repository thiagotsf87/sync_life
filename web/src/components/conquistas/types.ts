import type { LucideIcon } from 'lucide-react'
import type { Rarity } from './RarityPill'

export interface UiBadge {
  id:          string
  name:        string
  description: string
  Icon:        LucideIcon
  category:    string      // free-form category id (e.g. 'fin', 'corpo')
  categoryLabel: string    // human-readable
  color:       string      // accent color (CSS var or hex)
  rarity:      Rarity
  unlocked:    boolean
  unlockedAt?: string | null
  progress?:   number      // current value
  progressMax?: number     // target value
}
