// Timer sounds using Web Audio API — no external files needed

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

/** Play a two-tone completion chime */
export function playCompletionSound() {
  try {
    const ctx = getCtx()
    const now = ctx.currentTime

    // First tone (C5 = 523Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.value = 523
    gain1.gain.setValueAtTime(0.3, now)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4)
    osc1.connect(gain1).connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.4)

    // Second tone (E5 = 659Hz) — slightly delayed
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.value = 659
    gain2.gain.setValueAtTime(0.3, now + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
    osc2.connect(gain2).connect(ctx.destination)
    osc2.start(now + 0.15)
    osc2.stop(now + 0.6)

    // Third tone (G5 = 784Hz) — delayed more
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = 'sine'
    osc3.frequency.value = 784
    gain3.gain.setValueAtTime(0.3, now + 0.3)
    gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.9)
    osc3.connect(gain3).connect(ctx.destination)
    osc3.start(now + 0.3)
    osc3.stop(now + 0.9)
  } catch {
    // Audio not available
  }
}

export type AmbientSound = 'none' | 'rain' | 'forest' | 'waves' | 'whitenoise'

export const AMBIENT_OPTIONS: { value: AmbientSound; label: string; icon: string }[] = [
  { value: 'none', label: 'Silêncio', icon: '🔇' },
  { value: 'rain', label: 'Chuva', icon: '🌧️' },
  { value: 'forest', label: 'Floresta', icon: '🌿' },
  { value: 'waves', label: 'Ondas', icon: '🌊' },
  { value: 'whitenoise', label: 'Ruído branco', icon: '📻' },
]

let ambientNodes: { source: AudioBufferSourceNode | OscillatorNode; gain: GainNode } | null = null

function createNoiseBuffer(ctx: AudioContext, type: AmbientSound): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * 4 // 4 seconds, will loop
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  if (type === 'whitenoise') {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  } else if (type === 'rain') {
    // Brown noise (deeper, rain-like)
    let last = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.5
    }
  } else if (type === 'forest') {
    // Pink-ish noise (natural)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      b0 = 0.99886 * b0 + white * 0.0555179
      b1 = 0.99332 * b1 + white * 0.0750759
      b2 = 0.96900 * b2 + white * 0.1538520
      b3 = 0.86650 * b3 + white * 0.3104856
      b4 = 0.55000 * b4 + white * 0.5329522
      b5 = -0.7616 * b5 - white * 0.0168980
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
      b6 = white * 0.115926
    }
  } else if (type === 'waves') {
    // Slow modulated brown noise
    let last = 0
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      const mod = 0.5 + 0.5 * Math.sin(2 * Math.PI * i / (sampleRate * 3))
      data[i] = last * 3.5 * mod
    }
  }

  return buffer
}

export function startAmbientSound(type: AmbientSound, volume = 0.15) {
  stopAmbientSound()
  if (type === 'none') return

  try {
    const ctx = getCtx()
    const buffer = createNoiseBuffer(ctx, type)
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1) // Fade in

    source.connect(gain).connect(ctx.destination)
    source.start()

    ambientNodes = { source, gain }
  } catch {
    // Audio not available
  }
}

export function stopAmbientSound() {
  if (!ambientNodes) return
  try {
    const ctx = getCtx()
    ambientNodes.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5) // Fade out
    const nodes = ambientNodes
    setTimeout(() => {
      try { nodes.source.stop() } catch { /* already stopped */ }
    }, 600)
    ambientNodes = null
  } catch {
    ambientNodes = null
  }
}
