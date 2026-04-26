import { AnimatePresence, m } from 'framer-motion'
import { Cake, Gift, Heart, Music, PartyPopper, Sparkles, Star } from 'lucide-react'
import { useMemo } from 'react'

export type ChoiceType = 'fun' | 'memories' | 'secret' | null

// ─── Fun: floating icons ───────────────────────────────────────────

const FUN_ICONS = [PartyPopper, Sparkles, Star, Gift, Cake, Music, Heart]

function FunBackground() {
  const items = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        Icon: FUN_ICONS[i % FUN_ICONS.length],
        color: ['#fca5a5', '#fcd34d', '#86efac', '#93c5fd', '#c4b5fd'][i % 5],
        left: Math.random() * 100,
        size: 20 + Math.random() * 24,
        duration: 4 + Math.random() * 5,
        delay: Math.random() * 4,
        drift: -40 + Math.random() * 80,
        rotation: -30 + Math.random() * 60,
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((p) => (
        <m.div
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.left}%`,
            bottom: '-10%',
            fontSize: p.size,
            lineHeight: 1,
          }}
          animate={{
            y: [0, -(window.innerHeight + 120)],
            x: [0, p.drift],
            rotate: [0, p.rotation],
            opacity: [0, 0.85, 0.85, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: p.delay,
            times: [0, 0.1, 0.85, 1],
          }}
        >
          <p.Icon size={p.size} color={p.color} />
        </m.div>
      ))}
    </div>
  )
}

// ─── Memories: drifting polaroid / photo frame outlines ──────────────────────

const FRAME_COLORS = [
  'rgba(255,210,240,0.22)',
  'rgba(210,200,255,0.18)',
  'rgba(200,230,255,0.16)',
  'rgba(255,230,210,0.14)',
]

function MemoriesBackground() {
  const frames = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: 5 + Math.random() * 88,
        w: 52 + Math.random() * 32,
        h: 64 + Math.random() * 28,
        duration: 9 + Math.random() * 8,
        delay: Math.random() * 6,
        drift: -20 + Math.random() * 40,
        rotation: -18 + Math.random() * 36,
        color: FRAME_COLORS[i % FRAME_COLORS.length],
      })),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {frames.map((f) => (
        <m.div
          key={f.id}
          className="absolute rounded-[4px]"
          style={{
            left: `${f.left}%`,
            bottom: '-14%',
            width: f.w,
            height: f.h,
            border: `1.5px solid ${f.color}`,
            background: `linear-gradient(135deg, ${f.color.replace('0.', '0.06')}, transparent)`,
            backdropFilter: 'blur(2px)',
          }}
          animate={{
            y: [0, -(window.innerHeight + 160)],
            x: [0, f.drift],
            rotate: [f.rotation * 0.3, f.rotation],
            opacity: [0, 0.7, 0.7, 0],
          }}
          transition={{
            duration: f.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: f.delay,
            times: [0, 0.08, 0.88, 1],
          }}
        >
          {/* Caption line at bottom like a polaroid */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[14px]"
            style={{ background: f.color.replace(/[\d.]+\)$/, '0.06)') }}
          />
        </m.div>
      ))}
    </div>
  )
}

// ─── Secret: glowing dark particles ──────────────────────────────────────────

function SecretBackground() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => {
        const isPurple = i % 3 === 0
        const isPink = i % 3 === 1
        const color = isPurple
          ? `rgba(160, 100, 255, ${0.3 + Math.random() * 0.5})`
          : isPink
            ? `rgba(255, 100, 180, ${0.25 + Math.random() * 0.4})`
            : `rgba(100, 140, 255, ${0.2 + Math.random() * 0.35})`

        return {
          id: i,
          left: Math.random() * 100,
          top: Math.random() * 100,
          size: 2 + Math.random() * 5,
          duration: 3 + Math.random() * 4,
          delay: Math.random() * 5,
          color,
          floatY: -12 + Math.random() * 24,
        }
      }),
    [],
  )

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Dark vignette overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_30%,rgba(4,2,12,0.55)_100%)]" />

      {particles.map((p) => (
        <m.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}, 0 0 ${p.size * 7}px ${p.color.replace(/[\d.]+\)$/, '0.15)')}`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [0.8, 1.4, 0.8],
            y: [0, p.floatY, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

// ─── Exported wrapper ─────────────────────────────────────────────────────────

export function ChoiceBackground({ choice }: { choice: ChoiceType }) {
  return (
    <AnimatePresence>
      {choice === 'fun' && (
        <m.div
          key="fun-bg"
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          <FunBackground />
        </m.div>
      )}

      {choice === 'memories' && (
        <m.div
          key="memories-bg"
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          <MemoriesBackground />
        </m.div>
      )}

      {choice === 'secret' && (
        <m.div
          key="secret-bg"
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          <SecretBackground />
        </m.div>
      )}
    </AnimatePresence>
  )
}
