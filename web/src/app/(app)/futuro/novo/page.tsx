'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useState } from 'react'
import { useCreateObjective } from '@/hooks/use-futuro'
import { ObjectiveWizard } from '@/components/futuro/ObjectiveWizard'

export default function NovoObjetivoPage() {
  const router = useRouter()
  const createObjective = useCreateObjective()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSave(data: Parameters<typeof createObjective>[0]) {
    setIsLoading(true)
    try {
      await createObjective(data)
      toast.success(`Objetivo "${data.name}" criado!`)
      router.push('/futuro')
    } catch {
      toast.error('Erro ao criar objetivo')
      setIsLoading(false)
    }
  }

  return (
    <>
      <ObjectiveWizard
        open
        onClose={() => router.push('/futuro')}
        onSave={handleSave}
        isLoading={isLoading}
      />
      <div className="max-w-[1140px] mx-auto px-6 py-7">
        <h1 className="font-[Syne] font-extrabold text-2xl text-[var(--sl-t1)]">
          🔮 Novo Objetivo
        </h1>
        <p className="text-[var(--sl-t2)] mt-2 text-sm">Preencha o wizard para criar seu objetivo.</p>
      </div>
    </>
  )
}
