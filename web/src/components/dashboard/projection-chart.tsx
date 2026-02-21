'use client'

/**
 * Gráfico de projeção de despesas: linha histórica (sólida) + projeção (tracejada),
 * conforme layout aprovado no prototype dashboard.html
 */
export function ProjectionChart() {
  // Dados: histórico (Nov, Dez, Jan, Fev) + projeção (Mar, Abr, Mai...)
  // Valores normalizados para o SVG (y invertido: maior valor = menor y)
  const historicalPoints = '0,80 66,75 133,70 200,65'
  const projectionPoints = '200,65 266,58 333,50 400,40'
  const projectionArea = '200,65 266,58 333,50 400,40 400,120 200,120'

  return (
    <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 min-w-0 overflow-hidden">
      <div className="flex items-start justify-between mb-4 min-w-0 flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-semibold text-white">Projeção de Despesas</h2>
          <p className="text-sm text-slate-400">Próximos 6 meses baseado na tendência</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
          <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
          <span className="text-sm font-medium text-rose-400">+3,2%/mês</span>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-amber-400">Atenção: Tendência de alta</p>
            <p className="text-xs text-slate-400 mt-1">
              Suas despesas aumentaram 3,2% ao mês nos últimos 6 meses. Se continuar assim, em agosto você pode gastar R$ 3.890.
            </p>
          </div>
        </div>
      </div>

      <div className="relative h-40 min-w-0 w-full">
        <svg className="w-full h-full min-w-0" viewBox="0 0 400 120" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="projection-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
            </linearGradient>
          </defs>
          {/* Grid lines */}
          <line x1="0" y1="30" x2="400" y2="30" stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="0" y1="60" x2="400" y2="60" stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />
          <line x1="0" y1="90" x2="400" y2="90" stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />
          {/* Linha histórica (sólida) */}
          <polyline
            points={historicalPoints}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Projeção (tracejada) */}
          <polyline
            points={projectionPoints}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="8,4"
            opacity={0.6}
          />
          {/* Área sob a projeção */}
          <polygon
            points={projectionArea}
            fill="url(#projection-gradient)"
            opacity={0.2}
          />
          {/* Ponto atual (junção histórico/projeção) */}
          <circle cx="200" cy="65" r="5" fill="#f43f5e" stroke="#0f172a" strokeWidth="2" />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-500 px-1 gap-1 min-w-0">
          <span className="flex-shrink-0">Nov</span>
          <span className="flex-shrink-0">Dez</span>
          <span className="flex-shrink-0">Jan</span>
          <span className="text-[var(--color-sync-400)] font-medium flex-shrink-0">Fev</span>
          <span className="text-slate-600 flex-shrink-0">Mar</span>
          <span className="text-slate-600 flex-shrink-0">Abr</span>
          <span className="text-slate-600 flex-shrink-0">Ago</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Insights</p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-sm text-slate-400">
            <span className="text-amber-400">•</span>
            <span>Categoria <strong className="text-white">Alimentação</strong> cresceu 8% no último trimestre</span>
          </li>
          <li className="flex items-start gap-2 text-sm text-slate-400">
            <span className="text-emerald-400">•</span>
            <span>Você economizou <strong className="text-white">R$ 1.200</strong> a mais que a média dos últimos 6 meses</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
