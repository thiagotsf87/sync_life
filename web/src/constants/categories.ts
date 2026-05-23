export type CategoryType = 'income' | 'expense'

export interface DefaultCategory {
  id: string
  name: string
  icon: string
  color: string
  type: CategoryType
}

export const EXPENSE_CATEGORIES: DefaultCategory[] = [
  { id: 'alimentacao', name: 'Alimentação', icon: '🍔', color: '#f97316', type: 'expense' },
  { id: 'moradia', name: 'Moradia', icon: '🏠', color: '#8b5cf6', type: 'expense' },
  { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#06b6d4', type: 'expense' },
  { id: 'contas', name: 'Contas', icon: '💡', color: '#eab308', type: 'expense' },
  { id: 'saude', name: 'Saúde', icon: '💊', color: '#ef4444', type: 'expense' },
  { id: 'educacao', name: 'Educação', icon: '📚', color: '#3b82f6', type: 'expense' },
  { id: 'lazer', name: 'Lazer', icon: '🎮', color: '#22c55e', type: 'expense' },
  { id: 'vestuario', name: 'Vestuário', icon: '👔', color: '#ec4899', type: 'expense' },
  { id: 'compras', name: 'Compras', icon: '🛍️', color: '#f472b6', type: 'expense' },
  { id: 'servicos', name: 'Serviços', icon: '🔧', color: '#f59e0b', type: 'expense' },
  { id: 'impostos', name: 'Impostos', icon: '🏛️', color: '#ef4444', type: 'expense' },
  { id: 'diarista', name: 'Diarista/Domésticos', icon: '🧹', color: '#8b5cf6', type: 'expense' },
  { id: 'investimentos-despesa', name: 'Investimentos', icon: '📊', color: '#14b8a6', type: 'expense' },
  { id: 'pets', name: 'Pets', icon: '🐾', color: '#f97316', type: 'expense' },
  { id: 'assinaturas', name: 'Assinaturas', icon: '📱', color: '#3b82f6', type: 'expense' },
  { id: 'outros-despesa', name: 'Outros', icon: '📦', color: '#64748b', type: 'expense' },
]

export const INCOME_CATEGORIES: DefaultCategory[] = [
  { id: 'salario', name: 'Salário', icon: '💼', color: '#22c55e', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💰', color: '#10b981', type: 'income' },
  { id: 'investimentos', name: 'Investimentos', icon: '📈', color: '#14b8a6', type: 'income' },
  { id: 'presente', name: 'Presente', icon: '🎁', color: '#06b6d4', type: 'income' },
  { id: 'reembolso', name: 'Reembolso', icon: '🔄', color: '#0ea5e9', type: 'income' },
  { id: 'outros-receita', name: 'Outros', icon: '✨', color: '#64748b', type: 'income' },
]

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

export const getCategoryById = (id: string): DefaultCategory | undefined => {
  return ALL_CATEGORIES.find(cat => cat.id === id)
}

export const getCategoryByName = (name: string): DefaultCategory | undefined => {
  return ALL_CATEGORIES.find(cat => cat.name.toLowerCase() === name.toLowerCase())
}

export interface CustomCategory {
  id: string   // UUID — usado como category_key nas transactions custom
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUUID(value: string): boolean {
  return UUID_REGEX.test(value)
}

export function resolveCategory(
  key: string | null,
  customCategories: CustomCategory[]
): { name: string; icon: string; color: string } {
  if (!key) return { name: 'Outros', icon: '📦', color: '#64748b' }
  if (isUUID(key)) {
    return customCategories.find(c => c.id === key) ?? { name: 'Outros', icon: '📦', color: '#64748b' }
  }
  return getCategoryById(key) ?? { name: 'Outros', icon: '📦', color: '#64748b' }
}
