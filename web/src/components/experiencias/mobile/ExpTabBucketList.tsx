'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ExpWorldMap } from '@/components/experiencias/mobile/ExpWorldMap'
import { ExpBucketItemFormMobile } from '@/components/experiencias/mobile/ExpBucketItemFormMobile'
import { ExpUpgradeModal } from '@/components/experiencias/mobile/ExpUpgradeModal'
import { useDeleteBucketItem, useTransformToTrip } from '@/hooks/use-experiencias'
import type { BucketListItem } from '@/hooks/use-experiencias'
import type { MapPin } from '@/lib/exp-mock-data'
import { BUCKET_PINS } from '@/lib/exp-mock-data'

interface ExpTabBucketListProps {
  items: BucketListItem[]
  loading: boolean
  onReload: () => void
  onCreateTrip?: (prefillData: Record<string, unknown>) => void
}

type BucketFilter = 'all' | 'visited' | 'pending'

const PRIORITY_STYLE: Record<string, { bg: string; color: string; label: string; jornada: string }> = {
  high:   { bg: 'rgba(244,63,94,0.15)',   color: '#f43f5e', label: 'Alta',  jornada: '🔥' },
  medium: { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', label: 'Média', jornada: '⚡' },
  low:    { bg: 'rgba(236,72,153,0.15)',  color: '#ec4899', label: 'Baixa', jornada: '💎' },
}

const FREE_LIMIT = 10

export function ExpTabBucketList({
  items,
  loading,
  onReload,
  onCreateTrip,
}: ExpTabBucketListProps) {
  const [filter, setFilter] = useState<BucketFilter>('all')
  const [showForm, setShowForm] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const accentLight = '#c4b5fd'
  const deleteItem = useDeleteBucketItem()
  const transformToTrip = useTransformToTrip()

  const filtered = filter === 'all'
    ? items
    : filter === 'visited'
      ? items.filter(b => b.status === 'visited')
      : items.filter(b => b.status === 'pending')

  const totalCost = items.reduce((s, b) => s + (b.estimated_budget ?? 0), 0)
  const visited = items.filter(b => b.status === 'visited').length
  const pending = items.filter(b => b.status === 'pending').length

  const filters = [
    { key: 'all'     as BucketFilter, label: 'Todos',                             count: items.length },
    { key: 'visited' as BucketFilter, label: 'Conquistados', count: visited },
    { key: 'pending' as BucketFilter, label: 'Pendentes',                         count: pending },
  ]

  // Build simple pins from bucket items (using mock pins as fallback for now)
  const pins: MapPin[] = items.length > 0 ? [] : BUCKET_PINS

  function handleAddClick() {
    if (items.length >= FREE_LIMIT) {
      setUpgradeOpen(true)
    } else {
      setShowForm(true)
    }
  }

  async function handleTransformToTrip(item: BucketListItem) {
    try {
      const prefill = await transformToTrip(item.id)
      onCreateTrip?.(prefill as Record<string, unknown>)
    } catch (err) { console.warn('[Experiências] Falha ao converter bucket list em viagem:', err) }
  }

  if (loading) {
    return (
      <div className="px-5">
        <div className="h-[100px] rounded-[12px] animate-pulse mb-3" style={{ background: 'var(--sl-s2)' }} />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[110px] rounded-[14px] animate-pulse mb-3" style={{ background: 'var(--sl-s2)' }} />
        ))}
      </div>
    )
  }

  return (
    <div className="px-5">
      {/* Mini map */}
      <div className="mb-[14px]">
        <ExpWorldMap pins={pins} mini />
      </div>

      {/* Add button row */}
      <div className="flex justify-between items-center mb-[14px]">
        <p className="font-[Syne] text-[13px] font-bold text-[var(--sl-t1)]">
          Lista de Aventuras
          {items.length >= FREE_LIMIT && (
            <span className="ml-2 text-[9px] px-[6px] py-[2px] rounded-[6px]"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
              LIMITE
            </span>
          )}
        </p>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-1 text-[12px] font-semibold px-3 py-[6px] rounded-[20px]"
          style={{
            background: 'rgba(139,92,246,0.15)',
            color: '#c4b5fd',
          }}
        >
          <Plus size={12} />
          Nova Aventura
        </button>
      </div>

      {/* Filter pills */}
      <div className="flex gap-[6px] mb-[14px] flex-wrap">
        {filters.map(f => {
          const active = filter === f.key
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="text-[11px] font-medium px-3 py-[5px] rounded-[20px] transition-colors"
              style={{
                background: active ? 'rgba(139,92,246,0.15)' : 'var(--sl-s2)',
                color: active ? '#c4b5fd' : 'var(--sl-t2)',
                border: `1px solid ${active ? 'rgba(139,92,246,0.3)' : 'var(--sl-border)'}`,
              }}
            >
              {f.label} ({f.count})
            </button>
          )
        })}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[36px] mb-3">🗺️</p>
          <p className="text-[14px] font-semibold text-[var(--sl-t1)] mb-1">
            Sua lista de aventuras está vazia!
          </p>
          <p className="text-[12px] text-[var(--sl-t2)] mb-4">
            Adicione destinos épicos que você quer conquistar!
          </p>
          <button
            onClick={handleAddClick}
            className="px-5 py-2 rounded-[12px] text-[13px] font-semibold"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#c4b5fd' }}
          >
            + Adicionar primeira aventura
          </button>
        </div>
      )}

      {/* Bucket cards */}
      {filtered.map(item => {
        const ps = PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE['medium']
        return (
          <div
            key={item.id}
            className="rounded-[14px] p-[14px] mb-[10px]"
            style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
          >
            {/* Top */}
            <div className="flex items-center gap-[10px] mb-2">
              <span className="text-[24px]">{item.flag_emoji ?? '🌍'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[var(--sl-t1)] truncate">
                  {item.status !== 'visited'
                    ? `Missão: ${item.destination_city ?? item.destination_country}`
                    : (item.destination_city ? `${item.destination_city}, ${item.destination_country}` : item.destination_country)}
                </p>
                <p className="text-[11px] text-[var(--sl-t3)] mt-[1px]">
                  {item.destination_country}
                  {item.continent ? ` · ${item.continent}` : ''}
                </p>
              </div>
              {item.status !== 'visited' ? (
                <span
                  className="text-[10px] font-semibold px-2 py-[3px] rounded-[8px]"
                  style={{ background: ps.bg, color: ps.color }}
                >
                  {ps.jornada}
                </span>
              ) : (
                <span className="text-[10px] font-semibold" style={{ color: '#10b981' }}>
                  ✅
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex gap-3 mb-2 flex-wrap">
              {item.estimated_budget && (
                <span className="text-[10px] text-[var(--sl-t3)]">
                  💰 R$ {item.estimated_budget.toLocaleString('pt-BR')}
                </span>
              )}
              {item.target_year && (
                <span className="text-[10px] text-[var(--sl-t3)]">📅 {item.target_year}</span>
              )}
              {item.trip_type && (
                <span className="text-[10px] text-[var(--sl-t3)]">
                  👤 {item.trip_type === 'solo' ? 'Solo' : item.trip_type === 'couple' ? 'Casal' : item.trip_type === 'family' ? 'Família' : 'Amigos'}
                </span>
              )}
            </div>

            {/* Motivation */}
            {item.motivation && (
              <p className="text-[11px] text-[var(--sl-t2)] italic py-[6px] mt-1"
                style={{ borderTop: '1px solid var(--sl-border)' }}>
                &ldquo;{item.motivation}&rdquo;
              </p>
            )}

            {/* Transform to trip CTA */}
            {item.status === 'pending' && (
              <button
                onClick={() => handleTransformToTrip(item)}
                className="block w-full text-center text-[12px] font-semibold py-2 rounded-[10px] mt-2"
                style={{
                  background: 'rgba(139,92,246,0.15)',
                  color: '#c4b5fd',
                }}
              >
                Transformar em Missão →
              </button>
            )}
          </div>
        )
      })}

      {/* Summary card */}
      {items.length > 0 && (
        <div
          className="rounded-[12px] p-3 text-center mt-1 mb-4"
          style={{ background: 'var(--sl-s1)', border: '1px solid var(--sl-border)' }}
        >
          <p className="text-[11px] text-[var(--sl-t3)] mb-1">Custo total estimado</p>
          <p className="font-[DM_Mono] text-[22px] font-medium" style={{ color: accentLight }}>
            R$ {totalCost.toLocaleString('pt-BR')}
          </p>
          <p className="text-[10px] text-[var(--sl-t3)] mt-[2px]">
            {items.length} aventuras · {visited} conquistadas · {pending} pendentes
          </p>
        </div>
      )}

      {/* Form overlay */}
      <ExpBucketItemFormMobile
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={() => { setShowForm(false); onReload() }}
      />

      {/* Upgrade modal */}
      <ExpUpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        feature="bucket list"
        limitDescription={`Você atingiu o limite de ${FREE_LIMIT} itens no plano gratuito. Faça upgrade para adicionar destinos ilimitados.`}
      />
    </div>
  )
}
