import { m } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type FireflySceneProps = {
  direction: number   // kept for API compatibility but unused — scene has no slide transition
  glow: string
  glowSecondary: string
  border: string
  onNext: () => void
}

// ─── Firefly data ─────────────────────────────────────────────────────────────

type Fly = {
  id: number
  // starting position (% of viewport)
  startX: number
  startY: number
  // random drift during ambient phase
  driftX: number
  driftY: number
  size: number
  delay: number
  color: string
  speed: number
}

const COLORS = [
  'rgba(255,240,160,0.95)',
  'rgba(200,255,180,0.88)',
  'rgba(160,220,255,0.9)',
  'rgba(255,200,140,0.85)',
  'rgba(220,200,255,0.9)',
]

const FIREFLY_COUNT = 26

// Pre-seeded so SSR-safe; randomised once per mount via useMemo-like ref
function makeFlies(): Fly[] {
  return Array.from({ length: FIREFLY_COUNT }, (_, i) => {
    // Distribute around the edges / mid area avoiding dead center
    const angle = (i / FIREFLY_COUNT) * 360 + Math.random() * (360 / FIREFLY_COUNT)
    const radius = 30 + Math.random() * 38 // % distance from centre
    const rad = (angle * Math.PI) / 180
    return {
      id: i,
      startX: 50 + Math.cos(rad) * radius,
      startY: 50 + Math.sin(rad) * radius * 0.75,
      driftX: -20 + Math.random() * 40,
      driftY: -15 + Math.random() * 30,
      size: 6 + Math.random() * 8,
      delay: Math.random() * 1.5,
      color: COLORS[i % COLORS.length],
      speed: 2.5 + Math.random() * 2,
    }
  })
}

// ─── Cinematic phases ─────────────────────────────────────────────────────────
// 'ambient'  (0 – 3 s)  fireflies drift randomly, glow softly
// 'converge' (3 – 7 s)  all move toward viewport centre
// 'burst'    (7 – 8 s)  blinding white bloom → calls onNext

type CinematicPhase = 'ambient' | 'converge' | 'burst'

// ─── Individual firefly ───────────────────────────────────────────────────────

function Firefly({ fly, phase }: { fly: Fly; phase: CinematicPhase }) {
  const isConverge = phase === 'converge'
  const isBurst = phase === 'burst'
  const glowSize = fly.size * (isBurst ? 6 : isConverge ? 3.5 : 2.2)

  const targetX = isConverge || isBurst ? 50 : fly.startX + fly.driftX * 0.6
  const targetY = isConverge || isBurst ? 50 : fly.startY + fly.driftY * 0.6

  return (
    <m.div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        left: `${fly.startX}%`,
        top: `${fly.startY}%`,
        width: fly.size,
        height: fly.size,
        background: fly.color,
      }}
      animate={{
        left: `${targetX}%`,
        top: `${targetY}%`,
        opacity: isBurst ? [1, 0] : phase === 'ambient' ? [0.25, 0.9, 0.35] : [0.7, 1, 0.8],
        scale: isBurst ? [1.4, 0] : isConverge ? [1.1, 1.4, 1.1] : [0.7, 1.3, 0.7],
        boxShadow: isConverge || isBurst
          ? `0 0 ${glowSize * 1.5}px ${fly.color}, 0 0 ${glowSize * 3}px ${fly.color.replace(/[\d.]+\)$/, '0.35)')}`
          : `0 0 ${glowSize}px ${fly.color}`,
      }}
      transition={
        isBurst
          ? { duration: 0.6, ease: 'easeIn', delay: fly.delay * 0.15 }
          : isConverge
          ? {
              left: { duration: 3.8, ease: [0.22, 1, 0.36, 1], delay: fly.delay * 0.2 },
              top: { duration: 3.8, ease: [0.22, 1, 0.36, 1], delay: fly.delay * 0.2 },
              opacity: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: 1.4, repeat: Infinity, ease: 'easeInOut', delay: fly.delay * 0.1 },
              boxShadow: { duration: 0.8, ease: 'easeOut' },
            }
          : {
              // ambient: slow random float
              left: { duration: fly.speed, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' },
              top: { duration: fly.speed * 1.2, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' },
              opacity: { duration: fly.speed * 0.8, repeat: Infinity, ease: 'easeInOut' },
              scale: { duration: fly.speed, repeat: Infinity, ease: 'easeInOut' },
            }
      }
    />
  )
}

// ─── FireflyScene ─────────────────────────────────────────────────────────────

export function FireflyScene({ onNext }: FireflySceneProps) {
  const [phase, setPhase] = useState<CinematicPhase>('ambient')
  const [showBurstBloom, setShowBurstBloom] = useState(false)
  const flies = useRef(makeFlies()).current
  const timersRef = useRef<number[]>([])

  const addT = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timersRef.current.push(id)
  }

  useEffect(() => {
    // Phase 1 → converge after 3 s
    addT(() => setPhase('converge'), 3000)
    // Phase 2 → burst after 7 s
    addT(() => {
      setPhase('burst')
      setShowBurstBloom(true)
    }, 7200)
    // Advance to Finale after bloom peaks
    addT(() => onNext(), 8200)

    return () => timersRef.current.forEach(window.clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Text copy per phase
  const label =
    phase === 'ambient'
      ? 'something is gathering…'
      : phase === 'converge'
      ? 'drawing closer…'
      : 'here it comes…'

  return (
    <m.div
      key="firefly-cinematic"
      className="absolute inset-0 overflow-hidden bg-[#02010a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
    >
      {/* Deep space gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(30,10,60,0.6),rgba(2,1,12,0.95)_70%)]" />

      {/* Converge glow pool — grows at centre */}
      <m.div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        animate={{
          width: phase === 'burst' ? 600 : phase === 'converge' ? 180 : 80,
          height: phase === 'burst' ? 600 : phase === 'converge' ? 180 : 80,
          opacity: phase === 'burst' ? [0.9, 0] : phase === 'converge' ? [0.35, 0.7, 0.4] : 0.18,
        }}
        transition={
          phase === 'burst'
            ? { duration: 0.8, ease: 'easeOut' }
            : { duration: 2.2, ease: 'easeInOut', repeat: phase === 'converge' ? Infinity : 0 }
        }
        style={{
          background:
            'radial-gradient(circle, rgba(255,240,160,0.55) 0%, rgba(200,255,180,0.25) 40%, transparent 70%)',
          boxShadow:
            phase !== 'ambient'
              ? '0 0 120px rgba(255,240,160,0.3), 0 0 240px rgba(200,255,180,0.15)'
              : 'none',
        }}
      />

      {/* Full-screen white burst bloom */}
      {showBurstBloom && (
        <m.div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'white' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.85, 0] }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], times: [0, 0.25, 1] }}
        />
      )}

      {/* Fireflies */}
      {flies.map((fly: Fly) => (
        <Firefly key={fly.id} fly={fly} phase={phase} />
      ))}

      {/* Phase label */}
      <m.div
        className="pointer-events-none absolute inset-x-0 bottom-12 text-center text-[10px] uppercase tracking-[0.38em] text-white/40"
        key={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {label}
      </m.div>
    </m.div>
  )
}
