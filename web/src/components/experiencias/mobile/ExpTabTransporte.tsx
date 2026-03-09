'use client'

import { ExpTransportCard } from './ExpTransportCard'

export function ExpTabTransporte() {
  return (
    <div className="pt-3">
      <ExpTransportCard
        icon="✈️"
        route="GRU → NRT"
        company="ANA Airlines · NH7020"
        dateTime="10 Jul · 08:00"
        duration="23h"
        cost="R$ 4.200"
        status="✓ Pago"
        statusType="paid"
      />
      <ExpTransportCard
        icon="🚆"
        route="Tóquio → Kyoto"
        company="Shinkansen (Nozomi) · JR Pass"
        dateTime="14 Jul · 10:00"
        duration="2h15"
        cost="¥ 13.320"
        status="Pendente"
        statusType="pending"
      />
      <ExpTransportCard
        icon="🚆"
        route="Kyoto → Osaka"
        company="Shinkansen · 15 min"
        dateTime="18 Jul · 11:00"
        duration="15min"
        cost="¥ 560"
        status="Pendente"
        statusType="pending"
      />
      <ExpTransportCard
        icon="✈️"
        route="KIX → GRU"
        company="ANA Airlines · NH7021"
        dateTime="22 Jul · 11:00"
        duration="24h"
        cost="Incluído no trecho ida"
        status="✓"
        statusType="included"
      />
    </div>
  )
}
