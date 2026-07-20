export type CategoryType = 'income' | 'expense'

export interface DefaultCategory {
  id: string
  name: string
  icon: string
  color: string
  type: CategoryType
}

export const EXPENSE_CATEGORIES: DefaultCategory[] = [
  { id: 'alimentacao', name: 'Alimentação', icon: '🍔', color: '#D97534', type: 'expense' },
  { id: 'moradia', name: 'Moradia', icon: '🏠', color: '#8B7BD4', type: 'expense' },
  { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#3CA0B5', type: 'expense' },
  { id: 'contas', name: 'Contas', icon: '💡', color: '#D9962E', type: 'expense' },
  { id: 'saude', name: 'Saúde', icon: '💊', color: '#ef4444', type: 'expense' },
  { id: 'educacao', name: 'Educação', icon: '📚', color: '#4F88D4', type: 'expense' },
  { id: 'lazer', name: 'Lazer', icon: '🎮', color: '#0F766E', type: 'expense' },
  { id: 'vestuario', name: 'Vestuário', icon: '👔', color: '#C76795', type: 'expense' },
  { id: 'compras', name: 'Compras', icon: '🛍️', color: '#f472b6', type: 'expense' },
  { id: 'servicos', name: 'Serviços', icon: '🔧', color: '#D9962E', type: 'expense' },
  { id: 'impostos', name: 'Impostos', icon: '🏛️', color: '#ef4444', type: 'expense' },
  { id: 'diarista', name: 'Diarista/Domésticos', icon: '🧹', color: '#8B7BD4', type: 'expense' },
  { id: 'investimentos-despesa', name: 'Investimentos', icon: '📊', color: '#14b8a6', type: 'expense' },
  { id: 'pets', name: 'Pets', icon: '🐾', color: '#D97534', type: 'expense' },
  { id: 'assinaturas', name: 'Assinaturas', icon: '📱', color: '#4F88D4', type: 'expense' },
  { id: 'outros-despesa', name: 'Outros', icon: '📦', color: '#6F7986', type: 'expense' },
]

export const INCOME_CATEGORIES: DefaultCategory[] = [
  { id: 'salario', name: 'Salário', icon: '💼', color: '#0F766E', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💰', color: '#0F766E', type: 'income' },
  { id: 'investimentos', name: 'Investimentos', icon: '📈', color: '#14b8a6', type: 'income' },
  { id: 'presente', name: 'Presente', icon: '🎁', color: '#3CA0B5', type: 'income' },
  { id: 'reembolso', name: 'Reembolso', icon: '🔄', color: '#0ea5e9', type: 'income' },
  { id: 'outros-receita', name: 'Outros', icon: '✨', color: '#6F7986', type: 'income' },
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
  if (!key) return { name: 'Outros', icon: '📦', color: '#6F7986' }
  if (isUUID(key)) {
    return customCategories.find(c => c.id === key) ?? { name: 'Outros', icon: '📦', color: '#6F7986' }
  }
  return getCategoryById(key) ?? { name: 'Outros', icon: '📦', color: '#6F7986' }
}
