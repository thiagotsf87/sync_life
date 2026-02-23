import { CategoryManager } from '@/components/settings/category-manager'

export default function CategoriasPage() {
  return (
    <div className="max-w-[680px]">
      <h1 className="font-[Syne] font-extrabold text-xl text-[var(--sl-t1)] mb-1">Categorias</h1>
      <p className="text-[13px] text-[var(--sl-t3)] mb-6">
        Crie e gerencie categorias personalizadas para suas transações.
      </p>
      <CategoryManager />
    </div>
  )
}
