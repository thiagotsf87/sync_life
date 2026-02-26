'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useMetas, type GoalFormData } from '@/hooks/use-metas'
import { MetaModal } from '@/components/metas/MetaModal'

export default function NovaMetaPage() {
  const router = useRouter()
  const { create } = useMetas()

  async function handleSave(data: GoalFormData) {
    try {
      await create(data)
      toast.success('Meta criada com sucesso!')
      router.push('/metas')
    } catch {
      toast.error('Erro ao criar meta')
      throw new Error('create failed')
    }
  }

  return (
    <>
      {/* Abre o wizard automaticamente em modal fullscreen */}
      <MetaModal
        open
        mode="create"
        onClose={() => router.push('/metas')}
        onSave={handleSave}
      />
      {/* Fundo escuro caso o modal seja fechado antes do redirect */}
      <div className="max-w-[1140px] mx-auto px-6 py-7">
        <h1 className="font-[Syne] font-extrabold text-2xl text-[var(--sl-t1)]">
          🎯 Nova Meta
        </h1>
        <p className="text-[var(--sl-t2)] mt-2 text-sm">Preencha o formulário para criar sua meta.</p>
      </div>
    </>
  )
}
