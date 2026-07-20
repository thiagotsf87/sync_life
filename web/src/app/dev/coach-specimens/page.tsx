import { notFound } from 'next/navigation'
import { SpecimensContent } from './specimens-content'

// Galeria de specimens só para desenvolvimento. Em produção a rota responde 404
// (gate no servidor, sem enviar/renderizar o conteúdo client).
export default function CoachSpecimensPage() {
  if (process.env.NODE_ENV === 'production') notFound()
  return <SpecimensContent />
}
