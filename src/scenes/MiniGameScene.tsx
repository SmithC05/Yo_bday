import { AnimatePresence, m } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { SceneShell } from '../components/SceneShell'

// ─── Types ────────────────────────────────────────────────────────────────────

type HeartEntity = {
  id: number
  x: number           // % from left
  size: number        // px
  isSpecial: boolean  // +3 pts, brighter glow
  duration: number    // float duration s
  color: string
  delay: number
}

type BurstParticle = {
  id: string
  x: number
  y: number
  tx: number
  ty: number
  color: string
  size: number
}

type MiniGameSceneProps = {
  direction: number
  glow: string
  glowSecondary: string
  border: string
  gameDuration?: number
  highScoreThreshold?: number
  mediumScoreThreshold?: number
  onNext: () => void
  onHeartPop: () => void
  onHighScore: () => void
}

// ─── Constants ────────────────────────────────────────────────────────────────

const HEART_COLORS = [
  'rgba(255,130,180,0.95)',
  'rgba(255,160,210,0.9)',
  'rgba(220,120,255,0.88)',
  'rgba(255,180,200,0.92)',
  'rgba(180,140,255,0.9)',
]
const SPECIAL_COLOR = 'rgba(190,100,255,0.97)'

const SPAWN_INTERVAL_MS = 900  // how often a new heart spawns

let heartCounter = 0

function makeHeart(forceSpecial = false): HeartEntity {
  const isSpecial = forceSpecial || Math.random() < 0.12
  const sizeClass = Math.random()
  const size = sizeClass < 0.33 ? 28 : sizeClass < 0.66 ? 40 : 54
  return {
    id: ++heartCounter,
    x: 4 + Math.random() * 88,
    size,
    isSpecial,
    duration: 4 + Math.random() * 3.5,
    color: isSpecial ? SPECIAL_COLOR : HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)],
    delay: 0,
  }
}

// ─── SVG heart ────────────────────────────────────────────────────────────────

function HeartSVG({ color, size, isSpecial }: { color: string; size: number; isSpecial: boolean }) {
  const glow = isSpecial
    ? `drop-shadow(0 0 ${size * 0.45}px rgba(200,80,255,0.9)) drop-shadow(0 0 ${size * 0.9}px rgba(160,60,255,0.55)) drop-shadow(0 0 ${size * 1.4}px rgba(120,40,220,0.3))`
    : `drop-shadow(0 0 ${size * 0.22}px ${color}) drop-shadow(0 0 ${size * 0.5}px ${color.replace(/[\d.]+\)$/, '0.35:')})`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ filter: glow, display: 'block' }}
    >
      {isSpecial && (
        <path
          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
          fill="rgba(220,160,255,0.25)"
          stroke="rgba(200,100,255,0.8)"
          strokeWidth="0.6"
        />
      )}
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={color}
      />
    </svg>
  )
}

// ─── Floating heart ───────────────────────────────────────────────────────────

function FloatingHeart({
  heart,
  onTap,
}: {
  heart: HeartEntity
  onTap: (h: HeartEntity, x: number, y: number) => void
}) {
  const drift = -30 + Math.random() * 60

  return (
    <m.button
      type="button"
      aria-label={heart.isSpecial ? 'Special heart (+3)' : 'Heart (+1)'}
      className="absolute touch-none select-none outline-none"
      style={{
        left: `${heart.x}%`,
        bottom: '-10%',
        // Enlarge touch target beyond visual size
        padding: Math.max(0, (54 - heart.size) / 2),
      }}
      initial={{ y: 0, x: 0, opacity: 0, scale: 0.5 }}
      animate={{
        y: [0, -(typeof window !== 'undefined' ? window.innerHeight * 1.25 : 900)],
        x: [0, drift],
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 1, 0.7],
        rotate: [0, drift > 0 ? 12 : -12],
      }}
      transition={{
        duration: heart.duration,
        ease: 'linear',
        times: [0, 0.06, 0.82, 1],
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        const rect = e.currentTarget.getBoundingClientRect()
        onTap(heart, rect.left + rect.width / 2, rect.top + rect.height / 2)
      }}
      whileTap={{ scale: 1.5, transition: { duration: 0.08 } }}
    >
      {/* Special — pulsing violet aura rings */}
      {heart.isSpecial && (
        <>
          {/* Outer slow ring */}
          <m.div
            className="pointer-events-none absolute rounded-full"
            style={{
              inset: -10,
              border: '1.5px solid rgba(200,80,255,0.45)',
              boxShadow: '0 0 12px rgba(180,60,255,0.4)',
            }}
            animate={{ scale: [1, 1.22, 1], opacity: [0.45, 0.9, 0.45] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Inner fast ring */}
          <m.div
            className="pointer-events-none absolute rounded-full"
            style={{
              inset: -4,
              border: '1px solid rgba(220,120,255,0.6)',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />
          {/* Sparkle dots orbiting */}
          {[0, 72, 144, 216, 288].map((deg, si) => (
            <m.div
              key={si}
              className="pointer-events-none absolute left-1/2 top-1/2 rounded-full"
              style={{ width: 3, height: 3, background: 'rgba(220,140,255,0.9)', marginLeft: -1.5, marginTop: -1.5 }}
              animate={{
                x: [Math.cos(((deg) * Math.PI) / 180) * (heart.size * 0.72), Math.cos(((deg + 360) * Math.PI) / 180) * (heart.size * 0.72)],
                y: [Math.sin(((deg) * Math.PI) / 180) * (heart.size * 0.72), Math.sin(((deg + 360) * Math.PI) / 180) * (heart.size * 0.72)],
                opacity: [0.4, 1, 0.4],
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'linear', delay: si * 0.12 }}
            />
          ))}
        </>
      )}
      <HeartSVG color={heart.color} size={heart.size} isSpecial={heart.isSpecial} />
      {heart.isSpecial && (
        <div
          className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold"
          style={{ color: 'rgba(220,140,255,1)', textShadow: '0 0 10px rgba(180,60,255,0.9), 0 0 20px rgba(160,40,255,0.5)', whiteSpace: 'nowrap' }}
        >
          +3 <Heart fill="currentColor" className="inline w-3 h-3 ml-0.5" />
        </div>
      )}
    </m.button>
  )
}

// ─── Burst particles ──────────────────────────────────────────────────────────

function BurstEffect({ burst }: { burst: BurstParticle }) {
  return (
    <m.div
      className="pointer-events-none fixed rounded-full"
      style={{
        left: burst.x,
        top: burst.y,
        width: burst.size,
        height: burst.size,
        background: burst.color,
        boxShadow: `0 0 ${burst.size * 2}px ${burst.color}`,
        translateX: '-50%',
        translateY: '-50%',
        zIndex: 50,
      }}
      initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
      animate={{ x: burst.tx, y: burst.ty, opacity: 0, scale: [0, 1.2, 0] }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    />
  )
}

// ─── Score milestone burst ────────────────────────────────────────────────────

function ScoreBurst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <m.div
          key="score-burst"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div
            className="h-48 w-48 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(200,100,255,0.38) 0%, rgba(160,60,255,0.12) 55%, transparent 75%)',
              boxShadow: '0 0 80px rgba(180,60,255,0.45), 0 0 140px rgba(140,40,220,0.2)',
            }}
          />
        </m.div>
      )}
    </AnimatePresence>
  )
}

// ─── End screen ───────────────────────────────────────────────────────────────

function EndScreen({
  score,
  highThreshold,
  mediumThreshold,
  onContinue,
}: {
  score: number
  highThreshold: number
  mediumThreshold: number
  onContinue: () => void
}) {
  const isHigh = score >= highThreshold
  const isMedium = score >= mediumThreshold && score < highThreshold

  const message = isHigh
    ? "Okay okay calm down 😭💜\nToo good."
    : isMedium
      ? "Not bad… but I know you can do better"
      : "Even one heart is special"

  return (
    <m.div
      className="absolute inset-0 z-40 flex flex-col items-center justify-center px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#06050f]/85 backdrop-blur-md" />

      {/* Glow bloom */}
      <m.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 280,
          height: 280,
          background: 'radial-gradient(circle, rgba(255,140,200,0.25) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <m.div
          initial={{ scale: 0.7, opacity: 0, filter: 'blur(12px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl"
        >
          <Heart fill="currentColor" className="w-16 h-16 text-pink-400" />
        </m.div>

        <m.div
          className="space-y-2"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="font-display text-4xl text-white sm:text-5xl"
            style={{ textShadow: '0 0 40px rgba(255,160,210,0.55), 0 0 80px rgba(255,100,180,0.2)' }}
          >
            You caught {score} heart{score !== 1 ? 's' : ''} <Heart fill="currentColor" className="inline w-8 h-8 ml-2 text-pink-400" />
          </div>
          <div className="mt-2 text-[15px] text-white/68">
            That&apos;s how much love you deserve.
          </div>
        </m.div>

        <m.div
          className="mt-1 max-w-[17rem] whitespace-pre-line rounded-2xl border border-white/12 bg-white/8 px-5 py-3 text-[13px] leading-relaxed text-white/72 backdrop-blur-xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.75 }}
        >
          {message}
        </m.div>

        <m.button
          id="minigame-continue"
          type="button"
          onClick={onContinue}
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/12 px-7 py-4 text-[13px] font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-2xl transition-colors duration-300 hover:bg-white/20"
          style={{
            boxShadow: '0 0 28px rgba(255,140,200,0.2), 0 0 56px rgba(255,100,180,0.08), inset 0 1px 0 rgba(255,255,255,0.12)',
          }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.05 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Continue <span className="text-base">→</span>
        </m.button>
      </div>
    </m.div>
  )
}

// ─── MiniGameScene ────────────────────────────────────────────────────────────

export function MiniGameScene({
  direction,
  glow,
  glowSecondary,
  border,
  gameDuration = 15,
  highScoreThreshold = 12,
  mediumScoreThreshold = 6,
  onNext,
  onHeartPop,
  onHighScore,
}: MiniGameSceneProps) {
  const [hearts, setHearts] = useState<HeartEntity[]>([])
  const [tappedIds, setTappedIds] = useState<Set<number>>(new Set())
  const [bursts, setBursts] = useState<BurstParticle[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(gameDuration)
  const [phase, setPhase] = useState<'playing' | 'ended'>('playing')
  const [showScoreBurst, setShowScoreBurst] = useState(false)
  const [toasts, setToasts] = useState<{ id: number; x: number; y: number }[]>([])
  const [showFavNudge, setShowFavNudge] = useState(false)
  const [showPurpleFlash, setShowPurpleFlash] = useState(false)

  const spawnRef = useRef<number | null>(null)
  const tickRef = useRef<number | null>(null)
  const highScoreFiredRef = useRef(false)
  const scoreRef = useRef(0)
  const toastCounterRef = useRef(0)

  // ── Spawn hearts ────────────────────────────────────────────────────────────
  const spawnHeart = useCallback(() => {
    const heart = makeHeart()
    setHearts((prev) => [...prev, heart])

    // Auto-remove after float duration + buffer
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== heart.id))
    }, (heart.duration + 0.3) * 1000)
  }, [])

  // ── Tap handler ─────────────────────────────────────────────────────────────
  const handleTap = useCallback(
    (heart: HeartEntity, cx: number, cy: number) => {
      if (tappedIds.has(heart.id) || phase !== 'playing') return

      setTappedIds((prev) => new Set(prev).add(heart.id))
      setHearts((prev) => prev.filter((h) => h.id !== heart.id))

      const pts = heart.isSpecial ? 3 : 1
      setScore((s) => {
        const next = s + pts
        scoreRef.current = next

        // High score milestone burst at 10+
        if (next >= 10 && !highScoreFiredRef.current) {
          highScoreFiredRef.current = true
          onHighScore()
          setShowScoreBurst(true)
          setTimeout(() => setShowScoreBurst(false), 800)
        }
        return next
      })
      // Sound: special gets the magical high-score chime, regular gets the pop
      if (heart.isSpecial) {
        onHighScore()
        // Purple screen flash
        setShowPurpleFlash(true)
        setTimeout(() => setShowPurpleFlash(false), 400)
        // "Your favorite 💜" HUD nudge
        setShowFavNudge(true)
        setTimeout(() => setShowFavNudge(false), 2000)
        // Floating "+3 💜" toast
        const tid = ++toastCounterRef.current
        setToasts((prev) => [...prev, { id: tid, x: cx, y: cy }])
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== tid)), 1000)
      } else {
        onHeartPop()
      }

      // Burst particles
      const count = heart.isSpecial ? 14 : 6
      const newBursts: BurstParticle[] = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 360
        const dist = (heart.isSpecial ? 30 : 18) + Math.random() * 45
        const rad = (angle * Math.PI) / 180
        const purpleShades = [
          `rgba(200,80,255,${0.8 + Math.random() * 0.2})`,
          `rgba(160,60,255,${0.75 + Math.random() * 0.2})`,
          `rgba(220,140,255,${0.85 + Math.random() * 0.15})`,
          `rgba(140,40,220,${0.7 + Math.random() * 0.25})`,
        ]
        return {
          id: `${heart.id}-${i}-${Date.now()}`,
          x: cx,
          y: cy,
          tx: Math.cos(rad) * dist,
          ty: Math.sin(rad) * dist,
          color: heart.isSpecial
            ? purpleShades[i % purpleShades.length]
            : heart.color,
          size: heart.isSpecial ? 4 + Math.random() * 7 : 3 + Math.random() * 5,
        }
      })
      setBursts((prev) => [...prev, ...newBursts])
      setTimeout(() => {
        setBursts((prev) => prev.filter((b) => !newBursts.some((nb) => nb.id === b.id)))
      }, 700)
    },
    [tappedIds, phase, onHeartPop, onHighScore],
  )

  // ── Game loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    // Spawn first heart immediately
    spawnHeart()

    spawnRef.current = window.setInterval(spawnHeart, SPAWN_INTERVAL_MS)

    tickRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('ended')
          if (spawnRef.current) window.clearInterval(spawnRef.current)
          if (tickRef.current) window.clearInterval(tickRef.current)
          return 0
        }
        return t - 1
      })
    }, 1000)

    return () => {
      if (spawnRef.current) window.clearInterval(spawnRef.current)
      if (tickRef.current) window.clearInterval(tickRef.current)
    }
  }, [spawnHeart])

  const timerColor =
    timeLeft <= 3
      ? 'rgba(255,100,120,0.9)'
      : timeLeft <= 7
        ? 'rgba(255,200,100,0.85)'
        : 'rgba(200,180,255,0.8)'

  return (
    <SceneShell
      sceneKey="minigame"
      direction={direction}
      glow={glow}
      glowSecondary={glowSecondary}
      border={border}
    >
      {/* Soft gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(255,120,180,0.08),transparent_55%),radial-gradient(ellipse_at_20%_30%,rgba(180,100,255,0.07),transparent_45%)]" />

      {/* Score burst milestone */}
      <ScoreBurst show={showScoreBurst} />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 pt-[3.5rem]">
        {/* Score */}
        <m.div
          className="flex flex-col items-center gap-0.5"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          key={score}
        >
          <div
            className="font-display text-3xl text-white leading-none"
            style={{ textShadow: '0 0 20px rgba(255,150,200,0.6)' }}
          >
            {score}
          </div>
          <AnimatePresence mode="wait">
            {showFavNudge ? (
              <m.div
                key="fav"
                className="text-[9px] font-semibold tracking-wide"
                style={{ color: 'rgba(210,130,255,0.9)', textShadow: '0 0 8px rgba(180,60,255,0.6)' }}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                Your favorite <Heart fill="currentColor" className="inline w-2 h-2 ml-0.5" />
              </m.div>
            ) : (
              <m.div key="sc" className="text-[9px] uppercase tracking-[0.3em] text-white/44">score</m.div>
            )}
          </AnimatePresence>
        </m.div>

        {/* Scene label */}
        <div className="text-[9px] uppercase tracking-[0.36em] text-white/38">catch the hearts</div>

        {/* Timer */}
        <m.div
          className="flex flex-col items-center gap-0.5"
          key={timeLeft}
          animate={timeLeft <= 3 ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <div
            className="font-display text-3xl leading-none"
            style={{ color: timerColor, textShadow: `0 0 16px ${timerColor}` }}
          >
            {timeLeft}
          </div>
          <div className="text-[9px] uppercase tracking-[0.3em] text-white/44">sec</div>
        </m.div>
      </div>

      {/* Timer bar */}
      <div className="pointer-events-none absolute inset-x-4 top-[6.6rem] z-20 h-0.5 overflow-hidden rounded-full bg-white/10">
        <m.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, rgba(255,100,120,0.9), ${timerColor})`,
          }}
          animate={{ width: `${(timeLeft / gameDuration) * 100}%` }}
          transition={{ duration: 0.9, ease: 'linear' }}
        />
      </div>

      {/* Floating hearts arena */}
      <div className="absolute inset-0 overflow-hidden">
        <AnimatePresence>
          {hearts
            .filter((h) => !tappedIds.has(h.id))
            .map((heart) => (
              <FloatingHeart key={heart.id} heart={heart} onTap={handleTap} />
            ))}
        </AnimatePresence>
      </div>

      {/* Purple screen flash on special tap */}
      <AnimatePresence>
        {showPurpleFlash && (
          <m.div
            key="pflash"
            className="pointer-events-none absolute inset-0 z-30"
            style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(180,60,255,0.22) 0%, rgba(140,40,220,0.08) 50%, transparent 75%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.38, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Floating +3 💜 toasts */}
      {toasts.map((t) => (
        <m.div
          key={t.id}
          className="pointer-events-none fixed z-50 text-[15px] font-bold"
          style={{
            left: t.x,
            top: t.y,
            transform: 'translate(-50%, -50%)',
            color: 'rgba(220,140,255,1)',
            textShadow: '0 0 12px rgba(180,60,255,0.9), 0 0 24px rgba(160,40,255,0.5)',
          }}
          initial={{ opacity: 1, y: 0, scale: 0.7 }}
          animate={{ opacity: 0, y: -52, scale: 1.2 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          +3 <Heart fill="currentColor" className="inline w-4 h-4 ml-0.5" />
        </m.div>
      ))}

      {/* Burst particles */}
      {bursts.map((b) => (
        <BurstEffect key={b.id} burst={b} />
      ))}

      {/* Bottom hint */}
      {phase === 'playing' && (
        <m.div
          className="pointer-events-none absolute inset-x-0 bottom-7 z-10 text-center text-[10px] uppercase tracking-[0.3em] text-white/32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          tap every heart
        </m.div>
      )}

      {/* End screen */}
      <AnimatePresence>
        {phase === 'ended' && (
          <EndScreen
            key="end"
            score={score}
            highThreshold={highScoreThreshold}
            mediumThreshold={mediumScoreThreshold}
            onContinue={onNext}
          />
        )}
      </AnimatePresence>
    </SceneShell>
  )
}
