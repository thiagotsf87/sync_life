import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock dependencies ──────────────────────────────────────────────────────────

const mockInsert = vi.fn(() => Promise.resolve({ data: null, error: null }))
const mockUpdate = vi.fn(() => ({
  eq: vi.fn(() => ({
    eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
  })),
}))
const mockSelect = vi.fn(() => ({
  eq: vi.fn(() => ({
    ilike: vi.fn(() => ({
      limit: vi.fn(() => Promise.resolve({ data: [{ id: 'cat-1' }], error: null })),
    })),
    eq: vi.fn(() => Promise.resolve({
      data: [{ id: 'skill-1', current_level: 2 }],
      error: null,
    })),
  })),
}))

const mockFrom = vi.fn((table: string) => ({
  insert: mockInsert,
  select: mockSelect,
  update: mockUpdate,
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: mockFrom }),
}))

// We need to control the integration settings returned by getCachedIntegrationSettings
let mockSettings: Record<string, boolean> = {}

vi.mock('@/lib/user-preferences', () => ({
  getCachedIntegrationSettings: () => mockSettings,
}))

// ─── Import module under test (AFTER mocks) ────────────────────────────────────

import {
  onAppointmentCreated,
  onDividendReceived,
  onAssetPurchased,
  onTripExpenseAdded,
  onTripCreated,
  onPromotionRecorded,
  onStudySessionCompleted,
  onSkillLinkedToTrack,
  onTrackCompleted,
} from '../cross-module'

// ─── Tests ──────────────────────────────────────────────────────────────────────

describe('Cross-Module Integration Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSettings = {}
  })

  // ── onAppointmentCreated ──────────────────────────────────────────────

  describe('onAppointmentCreated', () => {
    it('creates auto-transaction when corpo_financas is enabled and cost > 0', async () => {
      mockSettings = { corpo_financas: true }

      await onAppointmentCreated('user1', 'Cardiologista', 'Silva', 250, '2024-01-15')

      expect(mockFrom).toHaveBeenCalledWith('categories')
      expect(mockFrom).toHaveBeenCalledWith('transactions')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user1',
          type: 'expense',
          amount: 250,
          description: expect.stringContaining('Cardiologista'),
        }),
      )
    })

    it('creates auto-event when corpo_tempo is enabled', async () => {
      mockSettings = { corpo_tempo: true }

      await onAppointmentCreated('user1', 'Cardiologista', 'Silva', null, '2024-01-15')

      expect(mockFrom).toHaveBeenCalledWith('agenda_events')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user1',
          title: expect.stringContaining('Cardiologista'),
          date: '2024-01-15',
          type: 'saude',
        }),
      )
    })

    it('does nothing when integration is disabled', async () => {
      mockSettings = { corpo_financas: false, corpo_tempo: false }

      await onAppointmentCreated('user1', 'Cardiologista', 'Silva', 250, '2024-01-15')

      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('does not create transaction when cost is null', async () => {
      mockSettings = { corpo_financas: true }

      await onAppointmentCreated('user1', 'Cardio', 'Dr', null, '2024-01-15')

      // Should not call insert for transactions (cost is null)
      const transactionsInsertCalls = mockFrom.mock.calls.filter(
        (c: unknown[]) => c[0] === 'transactions',
      )
      expect(transactionsInsertCalls).toHaveLength(0)
    })
  })

  // ── onDividendReceived ────────────────────────────────────────────────

  describe('onDividendReceived', () => {
    it('creates income transaction when patrimonio_financas is enabled', async () => {
      mockSettings = { patrimonio_financas: true }

      await onDividendReceived('user1', 'ITSA4', 150, '2024-01-15')

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'income',
          amount: 150,
          description: expect.stringContaining('ITSA4'),
        }),
      )
    })

    it('does nothing when amount is 0', async () => {
      mockSettings = { patrimonio_financas: true }

      await onDividendReceived('user1', 'ITSA4', 0, '2024-01-15')

      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('does nothing when integration is disabled', async () => {
      mockSettings = { patrimonio_financas: false }

      await onDividendReceived('user1', 'ITSA4', 150, '2024-01-15')

      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  // ── onAssetPurchased ──────────────────────────────────────────────────

  describe('onAssetPurchased', () => {
    it('creates expense transaction when patrimonio_financas is enabled', async () => {
      mockSettings = { patrimonio_financas: true }

      await onAssetPurchased('user1', 'PETR4', 1000)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'expense',
          amount: 1000,
          description: expect.stringContaining('PETR4'),
        }),
      )
    })

    it('does nothing when amount is 0', async () => {
      mockSettings = { patrimonio_financas: true }

      await onAssetPurchased('user1', 'PETR4', 0)

      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  // ── onTripExpenseAdded ────────────────────────────────────────────────

  describe('onTripExpenseAdded', () => {
    it('creates expense transaction when experiencias_financas is enabled', async () => {
      mockSettings = { experiencias_financas: true }

      await onTripExpenseAdded('user1', 'Paris', 'Hotel', 500)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'expense',
          amount: 500,
          description: expect.stringContaining('Paris'),
        }),
      )
    })

    it('does nothing when amount is 0', async () => {
      mockSettings = { experiencias_financas: true }

      await onTripExpenseAdded('user1', 'Paris', 'Hotel', 0)

      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  // ── onTripCreated ─────────────────────────────────────────────────────

  describe('onTripCreated', () => {
    it('creates departure and return events when experiencias_tempo is enabled', async () => {
      mockSettings = { experiencias_tempo: true }

      await onTripCreated('user1', 'Paris', '2024-06-01', '2024-06-15')

      // Two inserts: departure + return
      expect(mockInsert).toHaveBeenCalledTimes(2)
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Início'),
          date: '2024-06-01',
        }),
      )
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Volta'),
          date: '2024-06-15',
        }),
      )
    })

    it('creates only departure event when start and end dates are the same', async () => {
      mockSettings = { experiencias_tempo: true }

      await onTripCreated('user1', 'Local', '2024-06-01', '2024-06-01')

      expect(mockInsert).toHaveBeenCalledTimes(1)
    })

    it('does nothing when integration is disabled', async () => {
      mockSettings = { experiencias_tempo: false }

      await onTripCreated('user1', 'Paris', '2024-06-01', '2024-06-15')

      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  // ── onPromotionRecorded ───────────────────────────────────────────────

  describe('onPromotionRecorded', () => {
    it('creates income transaction when carreira_financas is enabled', async () => {
      mockSettings = { carreira_financas: true }

      await onPromotionRecorded('user1', 'Senior Dev', 2000)

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'income',
          description: expect.stringContaining('Senior Dev'),
        }),
      )
    })

    it('does nothing when salary increase is null', async () => {
      mockSettings = { carreira_financas: true }

      await onPromotionRecorded('user1', 'Senior Dev', null)

      expect(mockInsert).not.toHaveBeenCalled()
    })

    it('does nothing when salary increase is 0', async () => {
      mockSettings = { carreira_financas: true }

      await onPromotionRecorded('user1', 'Senior Dev', 0)

      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  // ── onStudySessionCompleted ───────────────────────────────────────────

  describe('onStudySessionCompleted', () => {
    it('creates study event when mente_tempo is enabled', async () => {
      mockSettings = { mente_tempo: true }

      await onStudySessionCompleted('user1', 'TypeScript', 45, '2024-01-15')

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('45min'),
          type: 'estudo',
        }),
      )
    })

    it('does nothing when integration is disabled', async () => {
      mockSettings = { mente_tempo: false }

      await onStudySessionCompleted('user1', 'TypeScript', 45, '2024-01-15')

      expect(mockInsert).not.toHaveBeenCalled()
    })
  })

  // ── onSkillLinkedToTrack ──────────────────────────────────────────────

  describe('onSkillLinkedToTrack', () => {
    it('updates skill with linked track when carreira_mente is enabled', async () => {
      mockSettings = { carreira_mente: true }

      await onSkillLinkedToTrack('user1', 'skill-1', 'track-1')

      expect(mockFrom).toHaveBeenCalledWith('skills')
      expect(mockUpdate).toHaveBeenCalledWith({ linked_track_id: 'track-1' })
    })

    it('does nothing when integration is disabled', async () => {
      mockSettings = { carreira_mente: false }

      await onSkillLinkedToTrack('user1', 'skill-1', 'track-1')

      expect(mockUpdate).not.toHaveBeenCalled()
    })
  })

  // ── onTrackCompleted ──────────────────────────────────────────────────

  describe('onTrackCompleted', () => {
    it('increments skill level when carreira_mente is enabled', async () => {
      mockSettings = { carreira_mente: true }

      await onTrackCompleted('user1', 'track-1')

      expect(mockFrom).toHaveBeenCalledWith('skills')
      expect(mockSelect).toHaveBeenCalled()
    })

    it('does nothing when integration is disabled', async () => {
      mockSettings = { carreira_mente: false }

      await onTrackCompleted('user1', 'track-1')

      expect(mockSelect).not.toHaveBeenCalled()
    })
  })
})
