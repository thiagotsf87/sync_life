import type { Metadata } from 'next'
import { LandingClient } from '@/components/landing/LandingClient'

export const metadata: Metadata = {
  title: 'SyncLife · Sua vida inteira, em sincronia',
  description:
    'Finanças, saúde, rotina, carreira e mente. Todas as áreas da sua vida em um só lugar. Sem planilhas. Sem 8 apps abertos. Sem ansiedade.',
  keywords: [
    'finanças pessoais',
    'controle financeiro',
    'metas pessoais',
    'agenda',
    'planejamento financeiro',
    'investimentos',
    'carreira',
    'saúde',
    'coach IA',
  ],
  openGraph: {
    title: 'SyncLife · Sua vida inteira, em sincronia',
    description:
      'Finanças, saúde, rotina, carreira e mente em um só lugar. Coach IA disponível em todos os planos.',
    url: 'https://synclife.com.br',
    siteName: 'SyncLife',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true },
}

export default function LandingPage() {
  return <LandingClient />
}
