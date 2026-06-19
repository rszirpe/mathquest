import confetti from 'canvas-confetti'

let audioCtx: AudioContext | null = null

function ctx(): AudioContext | null {
  try {
    if (!audioCtx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtx = new Ctor()
    }
    return audioCtx
  } catch {
    return null
  }
}

function tone(freq: number, dur: number, when = 0, type: OscillatorType = 'sine', gain = 0.07) {
  const ac = ctx()
  if (!ac) return
  const osc = ac.createOscillator()
  const g = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  osc.connect(g)
  g.connect(ac.destination)
  const t = ac.currentTime + when
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.start(t)
  osc.stop(t + dur + 0.02)
}

export function playCorrect() {
  tone(660, 0.12)
  tone(880, 0.14, 0.1)
}

export function playWrong() {
  tone(196, 0.22, 0, 'sawtooth', 0.05)
}

export function playLevelUp() {
  ;[523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, i * 0.11, 'triangle', 0.08))
}

export function celebrate() {
  confetti({ particleCount: 55, spread: 75, origin: { y: 0.7 }, scalar: 0.9 })
}

export function bigCelebrate() {
  const end = Date.now() + 700
  ;(function frame() {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0 } })
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1 } })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
  confetti({ particleCount: 90, spread: 100, origin: { y: 0.6 } })
}
