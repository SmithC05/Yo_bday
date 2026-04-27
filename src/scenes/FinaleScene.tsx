import { AnimatePresence, m } from 'framer-motion'
import { ArrowLeft, Heart, RotateCcw, Sparkles, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

type FinaleSceneProps = {
  direction: number
  glow: string
  glowSecondary: string
  border: string
  sisterName: string
  finaleLine: string
  signature: string
  qualities: string[]
  wishText: string
  introLines: string[]
  messageParagraphs: string[]
  galleryImages: string[]
  onReplay: () => void
  onFinale: () => void
  onTriggerFinaleBgm?: () => void
  onTriggerSpecialBgm?: () => void
}

// 'wish'              → atmospheric make-a-wish tap/auto
// 'affirmation'       → quality words appear one by one
// 'lines'             → intro lines appear one by one
// 'message'           → heartfelt paragraphs fade in
// 'hbd'               → "Happy Birthday ❤️" + glow burst
// 'galleryTransition' → cinematic transition to gallery
// 'gallery'           → floating memories space
type Phase = 'wish' | 'affirmation' | 'lines' | 'message' | 'hbd' | 'galleryTransition' | 'gallery'

// ─── Wish phase ───────────────────────────────────────────────────────────────

function WishPhase({
  wishText,
  onDone,
}: {
  wishText: string
  onDone: () => void
}) {
  const [wished, setWished] = useState(false)
  const timerRef = useRef<number | null>(null)

  // Auto-advance after 5 s if user doesn't tap
  useEffect(() => {
    timerRef.current = window.setTimeout(() => {
      setWished(true)
      window.setTimeout(onDone, 900)
    }, 5000)
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleWish = () => {
    if (wished) return
    if (timerRef.current) window.clearTimeout(timerRef.current)
    setWished(true)
    window.setTimeout(onDone, 900)
  }

  return (
    <m.div
      key="wish"
      className="relative z-10 flex flex-col items-center gap-8 px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(14px)', transition: { duration: 0.9 } }}
      transition={{ duration: 0.9 }}
    >
      {/* Pulsing orb */}
      <m.button
        type="button"
        onClick={handleWish}
        aria-label="Make a wish"
        className="relative flex h-48 w-48 items-center justify-center rounded-full border border-white/14 bg-white/[0.05] backdrop-blur-2xl outline-none"
        style={{
          boxShadow: wished
            ? '0 0 60px rgba(255,160,210,0.5), 0 0 120px rgba(200,100,255,0.25)'
            : '0 0 30px rgba(255,160,210,0.22), 0 0 60px rgba(200,100,255,0.1)',
        }}
        animate={wished ? { scale: [1, 1.1, 0.95], opacity: [1, 1, 0] } : {}}
        transition={wished ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] } : {}}
        whileTap={{ scale: 0.96 }}
      >
        {/* Inner breathing ring */}
        <m.div
          className="absolute inset-[-12px] rounded-full border border-white/10"
          animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <m.div
          className="absolute inset-[-28px] rounded-full border border-white/[0.06]"
          animate={{ scale: [1, 1.04, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        />

        <div className="text-center flex flex-col items-center">
          <div className="flex items-center justify-center text-4xl">{wished ? <Sparkles className="w-10 h-10 text-yellow-200" /> : <Star className="w-10 h-10 text-white/80" />}</div>
          <div className="mt-3 text-[10px] uppercase tracking-[0.32em] text-white/50">
            {wished ? 'sent' : 'tap to wish'}
          </div>
        </div>
      </m.button>

      <m.p
        className="font-display text-2xl text-white/80"
        style={{ textShadow: '0 0 30px rgba(255,160,210,0.35)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.9 }}
      >
        {wishText}
      </m.p>
    </m.div>
  )
}

// ─── Affirmation phase ────────────────────────────────────────────────────────

function AffirmationPhase({
  qualities,
  onDone,
}: {
  qualities: string[]
  onDone: () => void
}) {
  const [index, setIndex] = useState(0)
  const timersRef = useRef<number[]>([])
  const PER = 950

  useEffect(() => {
    qualities.forEach((_, i) => {
      if (i === 0) return
      const id = window.setTimeout(() => setIndex(i), i * PER)
      timersRef.current.push(id)
    })
    const doneId = window.setTimeout(onDone, qualities.length * PER + 400)
    timersRef.current.push(doneId)
    return () => timersRef.current.forEach(window.clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <m.div
      key="affirmation"
      className="relative z-10 flex flex-col items-center gap-4 px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(12px)', transition: { duration: 0.8 } }}
      transition={{ duration: 0.7 }}
    >
      <m.p
        className="text-[11px] uppercase tracking-[0.4em] text-white/42"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        you are…
      </m.p>

      <AnimatePresence mode="wait">
        <m.div
          key={index}
          className="font-display text-5xl leading-none text-white sm:text-6xl"
          style={{
            textShadow:
              '0 0 40px rgba(255,160,210,0.6), 0 0 80px rgba(200,100,255,0.25)',
          }}
          initial={{ opacity: 0, y: 22, scale: 0.88, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -14, scale: 1.06, filter: 'blur(8px)' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {qualities[index]}
        </m.div>
      </AnimatePresence>

      {/* Dot progress */}
      <m.div
        className="mt-4 flex gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {qualities.map((_, i) => (
          <m.div
            key={i}
            className="rounded-full"
            animate={{
              width: i === index ? 16 : 6,
              height: 6,
              background:
                i <= index ? 'rgba(255,160,210,0.85)' : 'rgba(255,255,255,0.15)',
            }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </m.div>
    </m.div>
  )
}

// ms between each intro line appearing
const LINE_DELAY_MS = 1600
// ms each individual line takes to fade in
const LINE_DURATION_S = 1.0
// ms pause after all lines before switching to message phase
const POST_LINES_PAUSE_MS = 1200

// ─── Heartbeat glow ───────────────────────────────────────────────────────────

function HeartbeatGlow({ color }: { color: string }) {
  return (
    <m.div
      className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        width: 320,
        height: 320,
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
      }}
      animate={{
        scale: [1, 1.08, 0.97, 1.05, 1],
        opacity: [0.45, 0.75, 0.5, 0.72, 0.45],
      }}
      transition={{
        duration: 2.6,
        repeat: Infinity,
        ease: [0.4, 0, 0.6, 1],
        times: [0, 0.2, 0.4, 0.6, 1],
      }}
    />
  )
}

// ─── Ambient floating particles ───────────────────────────────────────────────

function AmbientParticles({ phase }: { phase: Phase }) {
  const count = phase === 'hbd' ? 32 : phase === 'wish' || phase === 'affirmation' ? 12 : 16
  const items = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 5,
      floatY: -10 + Math.random() * 20,
      color:
        i % 4 === 0
          ? `rgba(255,160,210,${0.3 + Math.random() * 0.5})`
          : i % 4 === 1
            ? `rgba(200,140,255,${0.25 + Math.random() * 0.4})`
            : i % 4 === 2
              ? `rgba(255,210,130,${0.2 + Math.random() * 0.35})`
              : `rgba(140,200,255,${0.2 + Math.random() * 0.3})`,
    })),
  ).current

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.slice(0, count).map((p) => (
        <m.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
          animate={{
            opacity: [0.1, 0.9, 0.1],
            scale: [0.7, 1.5, 0.7],
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

// ─── Confetti burst (HBD moment) ──────────────────────────────────────────────

function ConfettiBurst() {
  const pieces = Array.from({ length: 28 }, (_, i) => {
    const angle = (i / 28) * 360
    const dist = 100 + Math.random() * 120
    const rad = (angle * Math.PI) / 180
    const colors = [
      'rgba(255,160,210,0.95)',
      'rgba(255,220,100,0.9)',
      'rgba(180,140,255,0.9)',
      'rgba(100,210,255,0.88)',
      'rgba(255,180,140,0.85)',
    ]
    return {
      id: i,
      tx: Math.cos(rad) * dist,
      ty: Math.sin(rad) * dist,
      size: 4 + Math.random() * 8,
      color: colors[i % colors.length],
      rotate: Math.random() * 360,
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      {pieces.map((p) => (
        <m.div
          key={p.id}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
          animate={{
            x: p.tx,
            y: p.ty,
            opacity: [1, 0.8, 0],
            scale: [0, 1.3, 0.5],
            rotate: p.rotate,
          }}
          transition={{
            duration: 1.4,
            ease: [0.22, 1, 0.36, 1],
            delay: Math.random() * 0.15,
          }}
        />
      ))}
    </div>
  )
}

// ─── HBD glow bloom ───────────────────────────────────────────────────────────

function HBDBloom() {
  return (
    <m.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <m.div
        className="rounded-full"
        style={{
          width: 300,
          height: 300,
          background:
            'radial-gradient(circle, rgba(255,160,210,0.32) 0%, rgba(200,100,255,0.12) 50%, transparent 75%)',
        }}
        animate={{ scale: [0.6, 1.3, 1.05], opacity: [0, 1, 0.7] }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
      />
    </m.div>
  )
}



// ─── FinaleScene ──────────────────────────────────────────────────────────────

// ─── Floating Memory Space ──────────────────────────────────────────────────

function FloatingMemorySpace({ images }: { images: string[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  // 13 Fixed Slots - Rebalanced to use full width and avoid clustering
  const SLOTS = [
    { x: 50, y: 10, scale: 1.3 }, // Slot 0: Top Center (c1)
    
    { x: 15, y: 28, scale: 1.0 }, // Slot 1: Upper-mid Left
    { x: 50, y: 30, scale: 1.15 }, // Slot 2: Upper-mid Center
    { x: 85, y: 28, scale: 1.0 }, // Slot 3: Upper-mid Right

    { x: 10, y: 45, scale: 1.0 }, // Slot 4: Mid Left
    { x: 40, y: 48, scale: 1.15 }, // Slot 5: Mid Center-ish
    { x: 75, y: 45, scale: 1.0 }, // Slot 6: Mid Right

    { x: 20, y: 62, scale: 0.95 }, // Slot 7: Lower-mid Left
    { x: 55, y: 65, scale: 1.05 }, // Slot 8: Lower-mid Center
    { x: 85, y: 62, scale: 0.95 }, // Slot 9: Lower-mid Right

    { x: 15, y: 80, scale: 0.9 }, // Slot 10: Bottom Left
    { x: 50, y: 82, scale: 1.0 }, // Slot 11: Bottom Center
    { x: 80, y: 80, scale: 0.9 }, // Slot 12: Bottom Right
  ]

  // Map images to slots based on their filename/type
  const getSlotIndex = (src: string) => {
    const filename = src.split('/').pop()?.split('.')[0] || ''
    if (filename === 'c2') return 0
    
    // Group images g1-g6 -> slots 1-6
    if (filename.startsWith('g')) {
      const num = parseInt(filename.replace('g', ''))
      if (num >= 1 && num <= 6) return num
    }
    
    // Solo images s1-s6 -> slots 7-12
    if (filename.startsWith('s')) {
      const num = parseInt(filename.replace('s', ''))
      if (num >= 1 && num <= 6) return 6 + num
    }
    
    return -1
  }

  const floatingItems = useRef(
    images
      .map((src) => ({ src, slotIdx: getSlotIndex(src) }))
      .filter((item) => item.slotIdx !== -1)
      .map((item, i) => {
        const slot = SLOTS[item.slotIdx]
        return {
          id: i,
          src: item.src,
          ...slot,
          // Unique offsets for oscillation to prevent synchronized movement
          phaseX: Math.random() * Math.PI * 2,
          phaseY: Math.random() * Math.PI * 2,
          // Slow down speed: 12-18 seconds for a calm feel
          duration: 12 + Math.random() * 6,
          // Staggered entry delay: c1 first, then staggered random
          entryDelay: item.slotIdx === 0 ? 0.5 : 0.8 + Math.random() * 2.2,
          rotate: Math.random() * 2 - 1, // subtle initial tilt
        }
      })
  ).current

  return (
    <div className="relative h-full w-full overflow-hidden bg-black/20">
      <AnimatePresence>
        {floatingItems.map((item) => {
          const isSelected = selectedImage === item.src
          const anySelected = selectedImage !== null
          
          return (
            <m.div
              key={item.id}
              className="absolute cursor-pointer"
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: 135 * item.scale,
                height: 135 * item.scale,
                zIndex: isSelected ? 1000 : 10,
                transform: 'translate(-50%, -50%)',
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isSelected ? {
                left: '50%',
                top: '45%',
                scale: 1.85,
                rotate: 0,
                opacity: 1,
                zIndex: 2000,
              } : {
                opacity: anySelected ? 0.35 : 1,
                scale: 1,
                x: [0, 8, -8, 0],
                y: [0, -10, 10, 0],
                rotate: [item.rotate - 1, item.rotate + 1, item.rotate - 1],
              }}
              transition={isSelected ? {
                type: 'spring',
                stiffness: 260,
                damping: 25
              } : {
                opacity: { duration: 0.8, delay: item.entryDelay },
                scale: { duration: 0.8, delay: item.entryDelay },
                x: { duration: item.duration, repeat: Infinity, ease: 'easeInOut' },
                y: { duration: item.duration * 1.1, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: item.duration * 1.4, repeat: Infinity, ease: 'easeInOut' },
              }}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedImage(isSelected ? null : item.src)
              }}
            >
              <m.div
                className="h-full w-full overflow-hidden rounded-2xl border border-white/20 shadow-2xl"
                whileHover={!anySelected ? { scale: 1.06, rotate: 0 } : {}}
              >
                <img
                  src={item.src}
                  alt="Memory"
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </m.div>
            </m.div>
          )
        })}
      </AnimatePresence>

      {/* Dim overlay when an image is selected */}
      <AnimatePresence>
        {selectedImage && (
          <m.div
            className="fixed inset-0 z-[1500] bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function GalleryTransition({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 3500)
    return () => window.clearTimeout(timer)
  }, [onDone])

  return (
    <m.div
      key="gallery-transition"
      className="relative z-10 flex flex-col items-center gap-6 px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(15px)', transition: { duration: 1 } }}
    >
      <m.p
        className="font-display text-4xl text-white"
        style={{ textShadow: '0 0 30px rgba(255,160,210,0.5)' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        These are yours... 💜
      </m.p>
      <m.p
        className="text-[12px] uppercase tracking-[0.4em] text-white/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        floating forever in this space
      </m.p>
    </m.div>
  )
}

// ─── FinaleScene ──────────────────────────────────────────────────────────────

export function FinaleScene({
  sisterName,
  finaleLine,
  signature,
  qualities,
  wishText,
  introLines,
  messageParagraphs,
  galleryImages,
  onReplay,
  onFinale,
  onTriggerFinaleBgm,
  onTriggerSpecialBgm,
}: FinaleSceneProps) {
  // Start at 'wish' — user makes a wish first, then affirmation flows into cinematic lines
  const [phase, setPhase] = useState<Phase>('wish')
  const [visibleLineCount, setVisibleLineCount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const hasPlayedRef = useRef(false)
  const timersRef = useRef<number[]>([])

  const addTimer = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay)
    timersRef.current.push(id)
    return id
  }

  // Called when wish phase completes (user tapped OR 5s auto)
  const handleWishDone = () => {
    setPhase('affirmation')
    onTriggerFinaleBgm?.()
  }

  // Called when affirmation phase finishes cycling through qualities
  const handleAffirmationDone = () => {
    if (hasPlayedRef.current) return
    hasPlayedRef.current = true
    onFinale()
    setPhase('lines')

    // Schedule each intro line
    introLines.forEach((_, i) => {
      addTimer(() => setVisibleLineCount(i + 1), i * LINE_DELAY_MS + 400)
    })

    // After all lines, switch to message phase
    const postLines = introLines.length * LINE_DELAY_MS + POST_LINES_PAUSE_MS + 400
    addTimer(() => setPhase('message'), postLines)

    // After message paragraphs (staggered 1.4s each), show HBD
    const hbdStart = postLines + messageParagraphs.length * 1400 + 1000
    addTimer(() => {
      setPhase('hbd')
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 1600)
    }, hbdStart)
  }

  useEffect(() => {
    return () => {
      timersRef.current.forEach(window.clearTimeout)
    }
  }, [])

  // Heartbeat glow color per phase
  const glowColor =
    phase === 'hbd' || phase === 'gallery'
      ? 'rgba(255,140,200,0.22)'
      : 'rgba(180,100,255,0.16)'

  return (
    // Full-viewport dark canvas — no SceneShell card, intentionally immersive
    <m.div
      key="finale"
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-[#03020a]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    >
      {/* Heartbeat glow */}
      {phase !== 'gallery' && <HeartbeatGlow color={glowColor} />}

      {/* Ambient particles — increase on HBD */}
      {phase !== 'gallery' && <AmbientParticles phase={phase} />}

      {/* Confetti on HBD moment */}
      <AnimatePresence>{showConfetti && <ConfettiBurst key="confetti" />}</AnimatePresence>

      {/* HBD bloom behind text */}
      <AnimatePresence>{phase === 'hbd' && <HBDBloom key="bloom" />}</AnimatePresence>

      <AnimatePresence mode="wait">
        {/* ── Phase: WISH ───────────────────────────────────────────────────── */}
        {phase === 'wish' && (
          <WishPhase key="wish" wishText={wishText} onDone={handleWishDone} />
        )}

        {/* ── Phase: AFFIRMATION ────────────────────────────────────────────── */}
        {phase === 'affirmation' && (
          <AffirmationPhase key="affirmation" qualities={qualities} onDone={handleAffirmationDone} />
        )}

        {/* ── Phase: LINES ────────────────────────────────────────────────────── */}
        {phase === 'lines' && (
          <m.div
            key="lines"
            className="relative z-10 flex flex-col items-center gap-6 px-8 text-center"
            exit={{ opacity: 0, filter: 'blur(12px)', transition: { duration: 0.8 } }}
          >
            {introLines.map((line, i) => (
              <AnimatePresence key={i}>
                {visibleLineCount > i && (
                  <m.p
                    key={`line-${i}`}
                    className={[
                      'font-display leading-snug text-white',
                      i === 0
                        ? 'text-3xl text-white/70'
                        : i === introLines.length - 1
                          ? 'text-2xl text-white/90'
                          : 'text-[22px] text-white/75',
                    ].join(' ')}
                    style={{
                      textShadow:
                        i === introLines.length - 1
                          ? '0 0 40px rgba(255,160,210,0.5), 0 0 80px rgba(200,100,255,0.2)'
                          : '0 0 20px rgba(255,160,210,0.2)',
                    }}
                    initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{
                      duration: LINE_DURATION_S,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {line}
                  </m.p>
                )}
              </AnimatePresence>
            ))}
          </m.div>
        )}

        {/* ── Phase: MESSAGE ────────────────────────────────────────────────── */}
        {phase === 'message' && (
          <m.div
            key="message"
            className="relative z-10 flex max-w-[22rem] flex-col items-center gap-7 px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)', transition: { duration: 0.7 } }}
            transition={{ duration: 0.8 }}
          >
            {messageParagraphs.map((para, i) => (
              <m.p
                key={i}
                className="text-[15px] leading-relaxed text-white/80"
                style={{ textShadow: '0 0 24px rgba(255,160,210,0.18)' }}
                initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{
                  duration: 1.1,
                  delay: i * 1.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                {para}
              </m.p>
            ))}
          </m.div>
        )}

        {/* ── Phase: HBD ────────────────────────────────────────────────────── */}
        {phase === 'hbd' && (
          <m.div
            key="hbd"
            className="relative z-10 flex flex-col items-center gap-8 px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.6 } }}
            transition={{ duration: 0.7 }}
          >
            {/* Main HBD text */}
            <m.div
              initial={{ scale: 0.82, opacity: 0, filter: 'blur(16px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-[11px] uppercase tracking-[0.4em] text-white/50">
                happy birthday
              </div>
              <div
                className="mt-3 font-display text-[4.5rem] leading-none text-white sm:text-8xl"
                style={{
                  textShadow:
                    '0 0 50px rgba(255,160,210,0.65), 0 0 100px rgba(200,100,255,0.3), 0 0 160px rgba(255,100,180,0.15)',
                }}
              >
                {sisterName}
              </div>
              <div className="mt-5 flex justify-center text-3xl"><Heart fill="currentColor" className="w-10 h-10 text-red-400" /></div>
            </m.div>

            {/* Final line + signature */}
            <m.div
              className="flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.6 }}
            >
              <p className="max-w-[17rem] text-[14px] leading-relaxed text-white/68">
                {finaleLine}
              </p>
              <div className="text-[10px] uppercase tracking-[0.36em] text-white/42">
                {signature}
              </div>
            </m.div>

            {/* Action buttons */}
            <m.div
              className="mt-2 flex flex-col items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.5 }}
            >
              <button
                id="one-last-thing"
                type="button"
                onClick={() => {
                  setPhase('galleryTransition')
                  onTriggerSpecialBgm?.()
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-7 py-4 text-[13px] font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-2xl transition-colors duration-300 hover:bg-white/20"
                style={{
                  boxShadow:
                    '0 0 28px rgba(255,140,200,0.22), 0 0 56px rgba(200,100,255,0.1), inset 0 1px 0 rgba(255,255,255,0.12)',
                }}
              >
                One last thing... <Sparkles className="inline w-4 h-4 ml-1" />
              </button>
            </m.div>
          </m.div>
        )}

        {/* ── Phase: GALLERY TRANSITION ────────────────────────────────────── */}
        {phase === 'galleryTransition' && (
          <GalleryTransition onDone={() => setPhase('gallery')} />
        )}

        {/* ── Phase: GALLERY ────────────────────────────────────────────────── */}
        {phase === 'gallery' && (
          <m.div
            key="gallery"
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
          >
            <FloatingMemorySpace images={galleryImages} />
            
            {/* Gallery controls */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-[1000]">
               <m.button
                type="button"
                onClick={() => setPhase('hbd')}
                className="text-[11px] uppercase tracking-[0.28em] text-white/38 transition-colors hover:text-white/65 flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                <ArrowLeft className="w-3 h-3" /> back
              </m.button>
              
              <m.button
                id="replay-btn-gallery"
                type="button"
                onClick={onReplay}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-6 py-3 text-[11px] uppercase tracking-[0.28em] text-white/52 backdrop-blur-xl transition-colors duration-300 hover:bg-white/12 hover:text-white/75"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2 }}
              >
                <RotateCcw className="w-3 h-3" /> play again
              </m.button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  )
}

