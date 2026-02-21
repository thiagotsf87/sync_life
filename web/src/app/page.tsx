import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-animated flex flex-col">
      {/* Floating shapes */}
      <div className="floating-shape w-96 h-96 bg-[var(--color-sync-500)] -top-48 -left-48 fixed" style={{ animationDelay: '0s' }}></div>
      <div className="floating-shape w-64 h-64 bg-[var(--color-sync-400)] top-1/4 -right-32 fixed" style={{ animationDelay: '-5s' }}></div>
      <div className="floating-shape w-80 h-80 bg-[var(--color-sync-600)] -bottom-40 left-1/4 fixed" style={{ animationDelay: '-10s' }}></div>

      {/* Header */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-sync-400)] to-[var(--color-sync-600)] rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" fill="currentColor"/>
                <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(0 12 12)" strokeOpacity="0.6"/>
                <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(60 12 12)" strokeOpacity="0.6"/>
                <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(120 12 12)" strokeOpacity="0.6"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white">Sync<span className="text-[var(--color-sync-400)]">Life</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-slate-300 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link 
              href="/cadastro" 
              className="bg-[var(--color-sync-500)] hover:bg-[var(--color-sync-600)] text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Sua vida em <span className="text-[var(--color-sync-400)]">sincronia</span>.
            <br />
            Organize, evolua, conquiste.
          </h1>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            SyncLife é o app de controle financeiro que vai além dos números.
            Entenda seus padrões, defina metas e transforme sua relação com o dinheiro.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/cadastro"
              className="w-full sm:w-auto bg-gradient-to-r from-[var(--color-sync-500)] to-[var(--color-sync-600)] hover:from-[var(--color-sync-400)] hover:to-[var(--color-sync-500)] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 btn-glow transform hover:scale-105"
            >
              Começar grátis
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-slate-300 hover:text-white py-4 px-8 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-[var(--color-sync-500)]/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[var(--color-sync-400)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Controle Total</h3>
            <p className="text-slate-400 text-sm">Registre receitas e despesas com categorias inteligentes em segundos.</p>
          </div>
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Insights Visuais</h3>
            <p className="text-slate-400 text-sm">Gráficos claros para entender seus gastos por categoria e tendências mensais.</p>
          </div>
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-white font-semibold mb-2">Projeção Inteligente</h3>
            <p className="text-slate-400 text-sm">Saiba para onde suas finanças estão indo nos próximos meses com projeções automáticas.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 text-center">
        <p className="text-slate-600 text-sm">
          © 2026 SyncLife. Organize sua vida, transforme sua história.
        </p>
      </footer>
    </div>
  );
}
