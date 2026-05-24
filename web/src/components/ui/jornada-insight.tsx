export function JornadaInsight({ text }: { text: React.ReactNode }) {
  return (
    <div className="flex mb-4 items-start gap-3 p-4
                    bg-gradient-to-br from-[#0F766E]/7 to-[#0B2D34]/9
                    border border-[#0F766E]/20 rounded-[18px] sl-fade-up">
      <span className="text-lg mt-0.5 shrink-0">💡</span>
      <p className="text-[13px] text-[var(--sl-t2)] leading-relaxed">{text}</p>
    </div>
  )
}
