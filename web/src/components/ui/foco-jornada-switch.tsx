export function FocoJornadaSwitch({
  foco,
  jornada,
}: {
  foco: React.ReactNode
  jornada: React.ReactNode
}) {
  return (
    <>
      <div className="[.jornada_&]:hidden">{foco}</div>
      <div className="hidden [.jornada_&]:block">{jornada}</div>
    </>
  )
}
