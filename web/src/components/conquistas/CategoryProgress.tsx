'use client'

export interface CategoryProgressItem {
  id:       string
  name:     string
  unlocked: number
  total:    number
  color:    string  // CSS var (e.g. 'var(--sl-mod-fin)') or hex
}

interface CategoryProgressProps {
  categories: CategoryProgressItem[]
  title?:     string
}

export function CategoryProgress({
  categories,
  title = 'Progresso por categoria',
}: CategoryProgressProps) {
  return (
    <article className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-[22px]">
      <h3 className="font-[Syne] font-semibold text-[16px] tracking-tight text-[var(--sl-t1)] m-0 mb-4">
        {title}
      </h3>

      <div className="flex flex-col gap-3">
        {categories.map((c) => {
          const pct = c.total > 0 ? Math.min(100, (c.unlocked / c.total) * 100) : 0
          return (
            <div key={c.id}>
              <div className="flex justify-between items-baseline mb-[5px]">
                <span className="text-[12.5px] text-[var(--sl-t1)] font-medium">{c.name}</span>
                <span className="sl-num text-[11.5px] text-[var(--sl-t3)]">
                  {c.unlocked}{' '}
                  <span className="text-[var(--sl-t4)]">/ {c.total}</span>
                </span>
              </div>
              <div className="h-1 bg-[var(--sl-s3)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{ width: `${pct}%`, background: c.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}
