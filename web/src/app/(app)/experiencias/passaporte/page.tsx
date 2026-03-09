'use client'

import { usePassportData } from '@/hooks/use-experiencias'
import { JornadaInsight } from '@/components/ui/jornada-insight'
import { ExperienciasMobile } from '@/components/experiencias/ExperienciasMobile'
import { ExpTabPassaporte } from '@/components/experiencias/mobile/ExpTabPassaporte'

export default function PassaportePage() {
  const { passport, loading } = usePassportData()

  return (
    <>
      {/* Mobile — usa tabs do ExperienciasMobile */}
      <ExperienciasMobile />

      {/* Desktop */}
      <div className="hidden lg:block max-w-[1140px] mx-auto px-6 py-7 pb-16">

        {/* Topbar */}
        <div className="flex items-center gap-3 mb-5">
          <h1 className="font-[Syne] font-extrabold text-2xl text-sl-grad">
            🗺️ Mapa do Explorador
          </h1>
        </div>

        {/* Jornada insight */}
        <JornadaInsight
          text={
            passport && passport.countries > 0
              ? <>Você explorou <strong className="text-[#ec4899]">{passport.countries} países</strong> em <strong className="text-[var(--sl-t1)]">{passport.continents} continentes</strong>. Isso representa <strong className="text-[#ec4899]">{passport.worldPct}</strong> do mundo!</>
              : <>Complete viagens para construir seu passaporte do explorador e desbloquear badges de aventura.</>
          }
        />

        {/* Content — reutiliza o componente mobile em wrapper desktop */}
        <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-2xl p-6 max-w-[680px]">
          <ExpTabPassaporte passport={passport} loading={loading} />
        </div>
      </div>
    </>
  )
}
