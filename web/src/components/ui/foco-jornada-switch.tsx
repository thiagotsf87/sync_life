export function FocoJornadaSwitch({
  foco,
  jornada,
}: {
  foco: React.ReactNode
  jornada: React.ReactNode
}) {
  return (
    <>
      <div className="foco-only">{foco}</div>
      <div className="jornada-only">{jornada}</div>
    </>
  )
}
