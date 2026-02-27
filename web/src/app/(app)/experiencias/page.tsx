export default function ExperienciasPage() {
  return (
    <div className="max-w-[1140px] mx-auto px-6 py-7">
      <div className="flex items-center gap-3 mb-5">
        <h1 className="font-[Syne] font-extrabold text-2xl text-[var(--sl-t1)]">
          ✈️ Experiências
        </h1>
      </div>
      <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🚧</div>
        <h2 className="font-[Syne] font-bold text-lg text-[var(--sl-t1)] mb-2">
          Módulo em Construção
        </h2>
        <p className="text-[13px] text-[var(--sl-t2)] max-w-md mx-auto">
          O módulo Experiências está sendo implementado na Fase 12 do MVP V3.
          Em breve você poderá planejar viagens, criar roteiros com IA e gerenciar orçamento de viagem.
        </p>
      </div>
    </div>
  )
}
