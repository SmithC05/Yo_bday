import { useCallback, useEffect, useRef, useState } from 'react'

type BirthdayAudioOptions = {
  /** Wishes scene BGM — plays on AdvancedLockScene */
  wishesUrl?: string
  /** Main experience BGM — plays from CountdownIntroScene onwards */
  mainUrl?: string
  /** Finale BGM — plays on FinaleScene */
  finaleUrl?: string
  /** Special BGM — plays on One Last Thing click */
  specialUrl?: string
  /** Fade-in duration for all tracks (ms) */
  bgmFadeInDuration?: number
}

type ToneOptions = {
  frequency: number
  gain?: number
  duration?: number
  type?: OscillatorType
  delay?: number
}

export type BirthdayAudioControls = {
  isEnabled: boolean
  isReady: boolean
  unlock: () => Promise<void>
  toggle: () => Promise<void>
  playWishesBgm: () => void
  stopWishesBgm: () => void
  playMainBgm: () => void
  playFinaleBgm: () => void
  playSpecialBgm: () => void
  playSparkle: () => void
  playPulse: () => void
  playTransition: () => void
  playUnlock: () => void
  playHeartPop: () => void
  playHighScore: () => void
  playWish: () => void
  playFinale: () => void
}

const AMBIENT_CHORDS = [
  [220, 329.63, 392],
  [246.94, 369.99, 440],
  [196, 293.66, 392],
  [261.63, 392, 493.88],
]

const WISHES_VOLUME = 0.22
const MAIN_VOLUME = 0.32
const FINALE_VOLUME = 0.28
const DEFAULT_FADE_IN_MS = 3000

// ─── Helpers ────────────────────────────────────────────────────────────────

function createAudioEl(src: string, loop: boolean): HTMLAudioElement {
  const el = new Audio(src)
  el.loop = loop
  el.volume = 0
  el.preload = 'auto'
  return el
}

function fadeIn(
  audio: HTMLAudioElement,
  targetVolume: number,
  durationMs: number,
  onDone?: () => void,
): () => void {
  const steps = 60
  const stepMs = durationMs / steps
  let step = 0
  audio.volume = 0

  const id = window.setInterval(() => {
    step++
    const progress = step / steps
    audio.volume = Math.min(targetVolume * (progress * progress), targetVolume)
    if (step >= steps) {
      audio.volume = targetVolume
      window.clearInterval(id)
      onDone?.()
    }
  }, stepMs)

  return () => window.clearInterval(id)
}

function fadeOut(
  audio: HTMLAudioElement,
  durationMs: number,
  onDone?: () => void,
): () => void {
  const steps = 60
  const stepMs = durationMs / steps
  let step = 0
  const startVol = audio.volume

  const id = window.setInterval(() => {
    step++
    const progress = step / steps
    audio.volume = Math.max(startVol * (1 - progress), 0)
    if (step >= steps) {
      audio.pause()
      audio.volume = 0
      window.clearInterval(id)
      onDone?.()
    }
  }, stepMs)

  return () => window.clearInterval(id)
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useBirthdayAudio(options: BirthdayAudioOptions = {}): BirthdayAudioControls {
  const [isReady, setIsReady] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const isEnabledRef = useRef(false)

  const contextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const ambientGainsRef = useRef<GainNode[]>([])
  const ambientOscillatorsRef = useRef<OscillatorNode[]>([])
  const ambientIntervalRef = useRef<number | null>(null)

  // Three separate audio elements
  const wishesRef = useRef<HTMLAudioElement | null>(null)
  const mainRef = useRef<HTMLAudioElement | null>(null)
  const finaleRef = useRef<HTMLAudioElement | null>(null)
  const specialRef = useRef<HTMLAudioElement | null>(null)

  // Active fade cleanup refs
  const fadeCleanupRef = useRef<(() => void)[]>([])

  const fadeInDuration = options.bgmFadeInDuration ?? DEFAULT_FADE_IN_MS

  // Pre-create audio elements once URLs are known
  useEffect(() => {
    if (options.wishesUrl) {
      wishesRef.current = createAudioEl(options.wishesUrl, true) // loop
    }
    if (options.mainUrl) {
      mainRef.current = createAudioEl(options.mainUrl, true)
    }
    if (options.finaleUrl) {
      finaleRef.current = createAudioEl(options.finaleUrl, true)
    }
    if (options.specialUrl) {
      specialRef.current = createAudioEl(options.specialUrl, true)
    }

    return () => {
      wishesRef.current?.pause()
      mainRef.current?.pause()
      finaleRef.current?.pause()
      specialRef.current?.pause()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.wishesUrl, options.mainUrl, options.finaleUrl, options.specialUrl])

  // ── Cancel all active fades ──────────────────────────────────────────────
  const cancelFades = useCallback(() => {
    fadeCleanupRef.current.forEach(fn => fn())
    fadeCleanupRef.current = []
  }, [])

  // ── Stop any currently-playing BGM track ─────────────────────────────────
  const stopAllBgm = useCallback(
    (fadeDuration = 1000, onDone?: () => void) => {
      cancelFades()
      const running = [wishesRef.current, mainRef.current, finaleRef.current, specialRef.current].filter(
        el => el && !el.paused,
      ) as HTMLAudioElement[]

      if (running.length === 0) {
        onDone?.()
        return
      }

      let completed = 0
      running.forEach(el => {
        const cleanup = fadeOut(el, fadeDuration, () => {
          completed++
          if (completed === running.length) onDone?.()
        })
        fadeCleanupRef.current.push(cleanup)
      })
    },
    [cancelFades],
  )

  // ── Stop Wishes BGM (called on transition to Countdown or auto-fade) ───────
  const stopWishesBgm = useCallback(() => {
    if (!wishesRef.current || wishesRef.current.paused) return
    cancelFades()
    const cleanup = fadeOut(wishesRef.current, 1000)
    fadeCleanupRef.current.push(cleanup)
  }, [cancelFades])
  // ── Play Wishes BGM (metro-proposal) ───────────────
  const playWishesBgm = useCallback(() => {
    if (!wishesRef.current || !isEnabledRef.current) return
    stopAllBgm(500, () => {
      if (!wishesRef.current) return
      wishesRef.current.currentTime = 0
      void wishesRef.current.play().then(() => {
        if (!wishesRef.current) return
        const cleanup = fadeIn(wishesRef.current, WISHES_VOLUME, 2000)
        fadeCleanupRef.current.push(cleanup)
      }).catch(() => undefined)
    })
  }, [isEnabled, stopAllBgm])



  // ── Play Main BGM (remo) — looping, medium volume ────────────────────────
  const playMainBgm = useCallback(() => {
    if (!mainRef.current || !isEnabledRef.current) return
    stopAllBgm(1000, () => {
      if (!mainRef.current) return
      mainRef.current.currentTime = 0
      void mainRef.current.play().then(() => {
        if (!mainRef.current) return
        const cleanup = fadeIn(mainRef.current, MAIN_VOLUME, fadeInDuration)
        fadeCleanupRef.current.push(cleanup)
      }).catch(() => undefined)
    })
  }, [isEnabled, stopAllBgm, fadeInDuration])

  // ── Play Finale BGM (dheema) — looping, crossfade from main ─────────────
  const playFinaleBgm = useCallback(() => {
    if (!finaleRef.current || !isEnabledRef.current) return
    stopAllBgm(1500, () => {
      if (!finaleRef.current) return
      finaleRef.current.currentTime = 0
      void finaleRef.current.play().then(() => {
        if (!finaleRef.current) return
        const cleanup = fadeIn(finaleRef.current, FINALE_VOLUME, 2000)
        fadeCleanupRef.current.push(cleanup)
      }).catch(() => undefined)
    })
  }, [isEnabled, stopAllBgm])

  // ── Play Special BGM (akka) — looping, crossfade from finale ─────────────
  const playSpecialBgm = useCallback(() => {
    if (!specialRef.current || !isEnabledRef.current) return
    stopAllBgm(1500, () => {
      if (!specialRef.current) return
      specialRef.current.currentTime = 0
      void specialRef.current.play().then(() => {
        if (!specialRef.current) return
        const cleanup = fadeIn(specialRef.current, MAIN_VOLUME, 2000)
        fadeCleanupRef.current.push(cleanup)
      }).catch(() => undefined)
    })
  }, [isEnabled, stopAllBgm])

  // ─── AudioContext helpers ─────────────────────────────────────────────────

  const getAudioContext = useCallback(() => {
    if (contextRef.current) return contextRef.current

    const AudioContextConstructor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

    if (!AudioContextConstructor) return null

    const context = new AudioContextConstructor()
    const masterGain = context.createGain()
    masterGain.gain.value = 0.7
    masterGain.connect(context.destination)

    contextRef.current = context
    masterGainRef.current = masterGain

    return context
  }, [])

  const playTone = useCallback(
    ({ frequency, gain = 0.05, duration = 0.24, type = 'sine', delay = 0 }: ToneOptions) => {
      const context = getAudioContext()
      const masterGain = masterGainRef.current

      if (!context || !masterGain || !isEnabledRef.current) return

      const startTime = context.currentTime + delay
      const oscillator = context.createOscillator()
      const envelope = context.createGain()

      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, startTime)

      envelope.gain.setValueAtTime(0.0001, startTime)
      envelope.gain.exponentialRampToValueAtTime(gain, startTime + 0.03)
      envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

      oscillator.connect(envelope)
      envelope.connect(masterGain)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration + 0.05)
    },
    [getAudioContext, isEnabled],
  )

  const stopAmbient = useCallback(() => {
    if (ambientIntervalRef.current) {
      window.clearInterval(ambientIntervalRef.current)
      ambientIntervalRef.current = null
    }

    ambientOscillatorsRef.current.forEach(osc => {
      try { osc.stop() } catch { return }
    })

    ambientOscillatorsRef.current = []
    ambientGainsRef.current = []
  }, [])

  const startAmbient = useCallback(() => {
    const context = getAudioContext()
    const masterGain = masterGainRef.current

    if (!context || !masterGain) return

    // If a real BGM is provided, rely on those — skip procedural chords
    if (options.wishesUrl || options.mainUrl || options.finaleUrl || options.specialUrl) return

    if (ambientOscillatorsRef.current.length > 0) return

    const filter = context.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 980
    filter.Q.value = 0.5
    filter.connect(masterGain)

    const oscillators = AMBIENT_CHORDS[0].map((frequency, index) => {
      const oscillator = context.createOscillator()
      const gainNode = context.createGain()

      oscillator.type = index === 0 ? 'sine' : 'triangle'
      oscillator.frequency.value = frequency
      gainNode.gain.value = index === 0 ? 0.015 : 0.012

      oscillator.connect(gainNode)
      gainNode.connect(filter)
      oscillator.start()

      ambientGainsRef.current.push(gainNode)
      return oscillator
    })

    ambientOscillatorsRef.current = oscillators

    let chordIndex = 0
    ambientIntervalRef.current = window.setInterval(() => {
      chordIndex = (chordIndex + 1) % AMBIENT_CHORDS.length
      const nextChord = AMBIENT_CHORDS[chordIndex]

      ambientOscillatorsRef.current.forEach((osc, index) => {
        const targetFreq = nextChord[index] ?? nextChord[0]
        osc.frequency.setTargetAtTime(targetFreq, context.currentTime, 1.8)
      })

      ambientGainsRef.current.forEach((gainNode, index) => {
        const targetGain = index === 0 ? 0.015 + chordIndex * 0.001 : 0.011 + index * 0.001
        gainNode.gain.setTargetAtTime(targetGain, context.currentTime, 1.2)
      })
    }, 2800)
  }, [getAudioContext, options.wishesUrl, options.mainUrl, options.finaleUrl])

  const unlock = useCallback(async () => {
    const context = getAudioContext()
    if (!context) return

    await context.resume()
    setIsReady(true)
    setIsEnabled(true)
    isEnabledRef.current = true
    startAmbient()
  }, [getAudioContext, startAmbient])

  const toggle = useCallback(async () => {
    const context = getAudioContext()
    if (!context) return

    if (!isReady) {
      await unlock()
      return
    }

    if (isEnabled) {
      stopAmbient()
      stopAllBgm(500)
      await context.suspend()
      setIsEnabled(false)
      isEnabledRef.current = false
      return
    }

    await context.resume()
    setIsEnabled(true)
    isEnabledRef.current = true
    startAmbient()
  }, [getAudioContext, isEnabled, isReady, startAmbient, stopAmbient, stopAllBgm, unlock])

  // ─── SFX ─────────────────────────────────────────────────────────────────

  const playSparkle = useCallback(() => {
    playTone({ frequency: 659.25, gain: 0.032, duration: 0.18, type: 'sine' })
    playTone({ frequency: 987.77, gain: 0.022, duration: 0.16, type: 'triangle', delay: 0.05 })
  }, [playTone])

  const playPulse = useCallback(() => {
    playTone({ frequency: 392, gain: 0.03, duration: 0.22, type: 'triangle' })
    playTone({ frequency: 523.25, gain: 0.018, duration: 0.22, type: 'sine', delay: 0.04 })
  }, [playTone])

  const playTransition = useCallback(() => {
    playTone({ frequency: 440, gain: 0.026, duration: 0.18, type: 'triangle' })
    playTone({ frequency: 587.33, gain: 0.024, duration: 0.18, type: 'sine', delay: 0.06 })
    playTone({ frequency: 783.99, gain: 0.02, duration: 0.24, type: 'sine', delay: 0.12 })
  }, [playTone])

  const playUnlock = useCallback(() => {
    playTone({ frequency: 523.25, gain: 0.028, duration: 0.22, type: 'sine' })
    playTone({ frequency: 659.25, gain: 0.026, duration: 0.22, type: 'sine', delay: 0.1 })
    playTone({ frequency: 783.99, gain: 0.024, duration: 0.28, type: 'sine', delay: 0.2 })
    playTone({ frequency: 1046.5, gain: 0.032, duration: 0.55, type: 'sine', delay: 0.32 })
    playTone({ frequency: 1318.5, gain: 0.018, duration: 0.6, type: 'triangle', delay: 0.46 })
  }, [playTone])

  const playHeartPop = useCallback(() => {
    playTone({ frequency: 880, gain: 0.022, duration: 0.1, type: 'sine' })
    playTone({ frequency: 1108, gain: 0.014, duration: 0.08, type: 'sine', delay: 0.03 })
  }, [playTone])

  const playHighScore = useCallback(() => {
    playTone({ frequency: 523.25, gain: 0.026, duration: 0.15, type: 'sine' })
    playTone({ frequency: 659.25, gain: 0.024, duration: 0.15, type: 'sine', delay: 0.08 })
    playTone({ frequency: 783.99, gain: 0.022, duration: 0.18, type: 'sine', delay: 0.16 })
    playTone({ frequency: 1046.5, gain: 0.028, duration: 0.28, type: 'sine', delay: 0.24 })
    playTone({ frequency: 1318.5, gain: 0.02, duration: 0.35, type: 'triangle', delay: 0.35 })
  }, [playTone])

  const playWish = useCallback(() => {
    playTone({ frequency: 523.25, gain: 0.03, duration: 0.2, type: 'triangle' })
    playTone({ frequency: 659.25, gain: 0.024, duration: 0.24, type: 'sine', delay: 0.08 })
    playTone({ frequency: 1046.5, gain: 0.028, duration: 0.34, type: 'sine', delay: 0.18 })
  }, [playTone])

  const playFinale = useCallback(() => {
    playTone({ frequency: 392, gain: 0.026, duration: 0.18, type: 'triangle' })
    playTone({ frequency: 523.25, gain: 0.028, duration: 0.22, type: 'triangle', delay: 0.06 })
    playTone({ frequency: 659.25, gain: 0.024, duration: 0.28, type: 'sine', delay: 0.12 })
    playTone({ frequency: 783.99, gain: 0.018, duration: 0.4, type: 'sine', delay: 0.22 })
  }, [playTone])

  useEffect(() => {
    return () => {
      cancelFades()
      stopAmbient()
      wishesRef.current?.pause()
      mainRef.current?.pause()
      finaleRef.current?.pause()
      specialRef.current?.pause()
      if (contextRef.current) void contextRef.current.close()
    }
  }, [cancelFades, stopAmbient])

  return {
    isEnabled,
    isReady,
    unlock,
    toggle,
    playWishesBgm,
    stopWishesBgm,
    playMainBgm,
    playFinaleBgm,
    playSpecialBgm,
    playSparkle,
    playPulse,
    playTransition,
    playUnlock,
    playHeartPop,
    playHighScore,
    playWish,
    playFinale,
  }
}
