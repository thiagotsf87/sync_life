'use client'

import { useRouter } from 'next/navigation'
import { Globe, Plane, Clock, Layers, BookOpen } from 'lucide-react'
import { usePassportData, useTrips } from '@/hooks/use-experiencias'
import { ModuleHeader } from '@/components/ui/module-header'
import { ExperienciasMobile } from '@/components/experiencias/ExperienciasMobile'

export default function PassaportePage() {
  const router = useRouter()
  const { passport, loading } = usePassportData()
  const { trips } = useTrips()

  const completedTrips = trips.filter(t => t.status === 'completed')
  const totalDays = completedTrips.reduce((s, t) => {
    const start = new Date(t.start_date)
    const end = new Date(t.end_date)
    return s + Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }, 0)
  const avgDays = completedTrips.length > 0 ? (totalDays / completedTrips.length).toFixed(1) : '0'
  const memoriesCount = passport?.badges?.filter(b => b.unlocked).length ?? 0

  // SVG ring calculation
  const countriesCount = passport?.countries ?? 0
  const radius = 68
  const circumference = 2 * Math.PI * radius
  const progressPct = countriesCount / 195
  const dashOffset = circumference - (circumference * progressPct)

  return (
    <>
      {/* Mobile */}
      <ExperienciasMobile />

      {/* Desktop */}
      <div className="hidden lg:block max-w-[1160px] mx-auto px-10 py-9 pb-16">

        {/* Module Header */}
        <ModuleHeader
          icon={Globe}
          iconBg="rgba(236,72,153,.1)"
          iconColor="#ec4899"
          title="Passaporte do Explorador"
          subtitle="Seu progresso pelo mundo"
        >
          <button
            onClick={() => router.push('/experiencias/memorias')}
            className="flex items-center gap-[7px] px-[22px] py-[10px] rounded-[11px] text-[13px] font-semibold border border-[var(--sl-border)] text-[var(--sl-t2)] bg-transparent hover:border-[var(--sl-border-h)] hover:text-[var(--sl-t1)] transition-all"
          >
            <BookOpen size={16} />
            Memorias
          </button>
        </ModuleHeader>

        {loading ? (
          <div className="flex flex-col gap-4">
            <div className="h-[200px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
            <div className="h-[120px] rounded-[18px] bg-[var(--sl-s2)] animate-pulse" />
          </div>
        ) : (
          <>
            {/* Progress Ring + Stats Grid */}
            <div className="grid gap-6 mb-7 sl-fade-up sl-delay-2" style={{ gridTemplateColumns: '280px 1fr' }}>
              {/* Ring Card */}
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] flex flex-col items-center justify-center p-8 hover:border-[var(--sl-border-h)] transition-colors">
                <div style={{ filter: 'drop-shadow(0 0 20px rgba(236,72,153,.2))' }}>
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--sl-s3)" strokeWidth="10" />
                    <circle
                      cx="80" cy="80" r={radius}
                      fill="none"
                      stroke="url(#passportGrad)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                      transform="rotate(-90 80 80)"
                    />
                    <defs>
                      <linearGradient id="passportGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                    <text x="80" y="72" textAnchor="middle" fill="var(--sl-t1)" fontFamily="Syne" fontWeight="800" fontSize="36">
                      {countriesCount}
                    </text>
                    <text x="80" y="94" textAnchor="middle" fill="var(--sl-t3)" fontFamily="DM Sans" fontWeight="600" fontSize="11">
                      de 195 paises
                    </text>
                  </svg>
                </div>
                <div className="text-[12px] text-[var(--sl-t2)] mt-3 text-center">
                  {passport?.worldPct ?? '0%'} do mundo explorado
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-[14px]">
                {/* Continentes */}
                <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-5 hover:border-[var(--sl-border-h)] transition-colors">
                  <div className="flex items-center gap-[10px] mb-[14px]">
                    <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(236,72,153,.1)' }}>
                      <Globe size={18} className="text-[#ec4899]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em]">Continentes</div>
                      <div className="font-[DM_Mono] text-[22px] font-medium mt-[2px]">
                        {passport?.continents ?? 0} <span className="text-[13px] text-[var(--sl-t3)]">/ 7</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-full h-[5px] bg-[var(--sl-s3)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${((passport?.continents ?? 0) / 7) * 100}%`, background: '#ec4899' }} />
                  </div>
                </div>

                {/* Total Viagens */}
                <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-5 hover:border-[var(--sl-border-h)] transition-colors">
                  <div className="flex items-center gap-[10px] mb-[14px]">
                    <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(6,182,212,.1)' }}>
                      <Plane size={18} className="text-[#06b6d4]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em]">Total Viagens</div>
                      <div className="font-[DM_Mono] text-[22px] font-medium mt-[2px]">{trips.length}</div>
                    </div>
                  </div>
                  <div className="text-[12px] text-[var(--sl-t3)]">
                    {completedTrips.length > 0 ? `Desde ${new Date(completedTrips[completedTrips.length - 1]?.start_date ?? '').getFullYear()}` : 'Nenhuma ainda'}
                  </div>
                </div>

                {/* Dias no Exterior */}
                <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-5 hover:border-[var(--sl-border-h)] transition-colors">
                  <div className="flex items-center gap-[10px] mb-[14px]">
                    <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(245,158,11,.1)' }}>
                      <Clock size={18} className="text-[#f59e0b]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em]">Dias no Exterior</div>
                      <div className="font-[DM_Mono] text-[22px] font-medium mt-[2px]">{totalDays}</div>
                    </div>
                  </div>
                  <div className="text-[12px] text-[var(--sl-t3)]">Media: {avgDays} dias/viagem</div>
                </div>

                {/* Memorias */}
                <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[18px] p-5 hover:border-[var(--sl-border-h)] transition-colors">
                  <div className="flex items-center gap-[10px] mb-[14px]">
                    <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center" style={{ background: 'rgba(168,85,247,.1)' }}>
                      <Layers size={18} className="text-[#a855f7]" />
                    </div>
                    <div>
                      <div className="text-[10px] text-[var(--sl-t3)] font-bold uppercase tracking-[.08em]">Memorias</div>
                      <div className="font-[DM_Mono] text-[22px] font-medium mt-[2px]">{memoriesCount}</div>
                    </div>
                  </div>
                  <div className="text-[12px] text-[var(--sl-t3)]">de {completedTrips.length} viagens concluidas</div>
                </div>
              </div>
            </div>

            {/* Continents Section */}
            <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[14px] sl-fade-up sl-delay-3">Continentes</h2>
            <div className="grid grid-cols-7 gap-[10px] mb-7 sl-fade-up sl-delay-3">
              {(passport?.continentProgress ?? []).map(cont => {
                const isVisited = cont.visited > 0
                return (
                  <div
                    key={cont.name}
                    className={`bg-[var(--sl-s1)] border rounded-[14px] p-[18px] text-center relative overflow-hidden transition-all hover:border-[var(--sl-border-h)] ${
                      isVisited ? 'border-[rgba(236,72,153,.3)]' : 'border-[var(--sl-border)] opacity-50'
                    }`}
                  >
                    {isVisited && (
                      <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-[#ec4899]" />
                    )}
                    <div
                      className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center mx-auto mb-[10px]"
                      style={{ background: isVisited ? 'rgba(236,72,153,.1)' : 'var(--sl-s2)' }}
                    >
                      <Globe size={20} className={isVisited ? 'text-[#ec4899]' : 'text-[var(--sl-t3)]'} />
                    </div>
                    <div className="font-semibold text-[12.5px] mb-[2px]">{cont.name}</div>
                    <div className={`text-[11px] font-semibold ${isVisited ? 'text-[#ec4899]' : 'text-[var(--sl-t3)]'}`}>
                      {isVisited ? `${cont.visited} paises` : '\u2014'}
                    </div>
                  </div>
                )
              })}
              {/* Antartica (not in CONTINENT_TOTALS) */}
              <div className="bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[14px] p-[18px] text-center relative overflow-hidden opacity-50 hover:border-[var(--sl-border-h)] transition-all">
                <div className="w-[40px] h-[40px] rounded-[12px] flex items-center justify-center mx-auto mb-[10px]" style={{ background: 'var(--sl-s2)' }}>
                  <Globe size={20} className="text-[var(--sl-t3)]" />
                </div>
                <div className="font-semibold text-[12.5px] text-[var(--sl-t3)] mb-[2px]">Antartica</div>
                <div className="text-[11px] text-[var(--sl-t3)]">{'\u2014'}</div>
              </div>
            </div>

            {/* Countries Visited */}
            {passport && passport.countriesList.length > 0 && (
              <>
                <h2 className="font-[Syne] font-bold text-[15px] text-[var(--sl-t1)] mb-[14px] sl-fade-up sl-delay-4">Paises Visitados</h2>
                <div className="flex flex-wrap gap-2 sl-fade-up sl-delay-4">
                  {passport.countriesList.map(c => (
                    <div
                      key={c.name}
                      className="inline-flex items-center gap-2 px-[14px] py-2 bg-[var(--sl-s1)] border border-[var(--sl-border)] rounded-[10px] text-[12.5px] font-medium hover:border-[var(--sl-border-h)] transition-colors"
                    >
                      <span className="text-base">{c.flag}</span>
                      <div>
                        <div className="font-semibold">{c.name}</div>
                        <div className="text-[11px] text-[var(--sl-t3)]">
                          {c.visits} viagem{c.visits > 1 ? 'ns' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  )
}
