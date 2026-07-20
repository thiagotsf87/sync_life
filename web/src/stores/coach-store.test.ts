import { describe, it, expect, beforeEach } from 'vitest'
import { useCoachStore } from './coach-store'

const reset = () => useCoachStore.setState({ open: null, pendingPrompt: null })

describe('coach-store', () => {
  beforeEach(reset)

  it('abre um overlay por vez (abrir palette fecha drawer)', () => {
    useCoachStore.getState().openOverlay('coachDrawer')
    expect(useCoachStore.getState().open).toBe('coachDrawer')
    useCoachStore.getState().openOverlay('palette')
    expect(useCoachStore.getState().open).toBe('palette')
  })

  it('toggleOverlay fecha se já estava aberto', () => {
    useCoachStore.getState().toggleOverlay('cheat')
    expect(useCoachStore.getState().open).toBe('cheat')
    useCoachStore.getState().toggleOverlay('cheat')
    expect(useCoachStore.getState().open).toBe(null)
  })

  it('closeAll zera overlay e prompt pendente', () => {
    useCoachStore.getState().openDrawerWithPrompt('Como está meu mês?')
    expect(useCoachStore.getState().open).toBe('coachDrawer')
    expect(useCoachStore.getState().pendingPrompt).toBe('Como está meu mês?')
    useCoachStore.getState().closeAll()
    expect(useCoachStore.getState().open).toBe(null)
    expect(useCoachStore.getState().pendingPrompt).toBe(null)
  })
})
