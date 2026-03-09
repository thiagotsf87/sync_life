'use client'

import { ExpHotelCard } from './ExpHotelCard'

export function ExpTabHospedagem() {
  return (
    <div className="pt-3">
      <ExpHotelCard
        emoji="🏨"
        name="Gracery Hotel Shinjuku"
        location="Shinjuku, Tóquio"
        dates="10 — 14 Jul"
        nights={4}
        pricePerNight="¥ 8.200"
        total="¥ 32.800"
        status="✓ Reservado"
        statusType="confirmed"
      />
      <ExpHotelCard
        emoji="🏯"
        name="Ryokan Kyoto Nanzenji"
        location="Nanzenji, Kyoto"
        dates="14 — 18 Jul"
        nights={4}
        pricePerNight="¥ 15.000"
        total="¥ 60.000"
        status="Pendente"
        statusType="pending"
      />
      <ExpHotelCard
        emoji="🏨"
        name="Cross Hotel Osaka"
        location="Shinsaibashi, Osaka"
        dates="18 — 22 Jul"
        nights={4}
        pricePerNight="¥ 9.800"
        total="¥ 39.200"
        status="Pendente"
        statusType="pending"
      />
    </div>
  )
}
