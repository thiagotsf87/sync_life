export function JornadaInsight({ text }: { text: React.ReactNode }) {
  return (
    <div className="jornada-only flex mb-4 items-start gap-3 p-4
                    bg-gradient-to-br from-[#10b981]/7 to-[#0055ff]/9
                    border border-[#10b981]/20 rounded-[18px] sl-fade-up">
      <span className="text-lg mt-0.5 shrink-0">💡</span>
      <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed">{text}</p>
    </div>
  )
}
