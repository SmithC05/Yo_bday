import { AnimatePresence, m, useAnimation } from 'framer-motion'
import { Heart, Lock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { SceneShell } from '../components/SceneShell'

// ─── Types ────────────────────────────────────────────────────────────────────

type PuzzleSceneProps = {
  direction: number
  glow: string
  glowSecondary: string
  border: string
  secretAnswer: string
  onNext: () => void
  onUnlock: () => void
}

// ─── Hint thresholds ──────────────────────────────────────────────────────────

const HINTS: Record<number, string> = {
  2: 'You already know this... think a little 💭',
  3: "It's what I call you when I'm being soft...",
}

// ─── Ambient glowing particles ────────────────────────────────────────────────

function AmbientParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => {
    const isPurple = i % 4 === 0
    const isBlue = i % 4 === 1
    const isTeal = i % 4 === 2
    const color = isPurple
      ? `rgba(170,90,255,${0.25 + (i % 3) * 0.15})`
      : isBlue
        ? `rgba(80,130,255,${0.2 + (i % 3) * 0.12})`
        : isTeal
          ? `rgba(60,220,200,${0.18 + (i % 3) * 0.1})`
          : `rgba(255,90,160,${0.15 + (i % 3) * 0.1})`
    return {
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 2.5 + Math.random() * 3.5,
      delay: Math.random() * 4,
      color,
      floatY: -10 + Math.random() * 20,
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
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
            boxShadow: `0 0 ${p.size * 4}px ${p.color}`,
          }}
          animate={{
            opacity: [0.15, 1, 0.15],
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

// ─── Success particle burst ───────────────────────────────────────────────────

function SuccessBurst() {
  const bursts = Array.from({ length: 18 }, (_, i) => {
    const angle = (i / 18) * 360
    const dist = 80 + Math.random() * 80
    const rad = (angle * Math.PI) / 180
    return {
      id: i,
      tx: Math.cos(rad) * dist,
      ty: Math.sin(rad) * dist,
      size: 4 + Math.random() * 6,
      color:
        i % 3 === 0
          ? 'rgba(120,255,180,0.9)'
          : i % 3 === 1
            ? 'rgba(180,255,120,0.85)'
            : 'rgba(80,220,255,0.8)',
    }
  })

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {bursts.map((b) => (
        <m.div
          key={b.id}
          className="absolute rounded-full"
          style={{ width: b.size, height: b.size, background: b.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: b.tx,
            y: b.ty,
            opacity: [1, 0.8, 0],
            scale: [0, 1.4, 0.6],
          }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: Math.random() * 0.12 }}
        />
      ))}
    </div>
  )
}

// ─── Success overlay ──────────────────────────────────────────────────────────

function SuccessOverlay() {
  return (
    <m.div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Dark wash */}
      <div className="absolute inset-0 bg-[#04050d]/80 backdrop-blur-md" />

      {/* Central glow bloom */}
      <m.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 260,
          height: 260,
          background:
            'radial-gradient(circle, rgba(80,255,160,0.28) 0%, rgba(60,200,120,0.1) 50%, transparent 75%)',
        }}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: [0.4, 1.4, 1.1], opacity: [0, 1, 0.75] }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Particle burst */}
      <SuccessBurst />

      {/* Text */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <m.div
          initial={{ opacity: 0, scale: 0.8, filter: 'blur(12px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-4xl text-white sm:text-5xl"
          style={{
            textShadow: '0 0 40px rgba(100,255,180,0.6), 0 0 80px rgba(60,200,120,0.25)',
          }}
        >
          Of course you knew...
        </m.div>

        <m.div
          initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.7, delay: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-3xl text-white/85 sm:text-4xl"
          style={{
            textShadow: '0 0 30px rgba(100,255,180,0.4)',
          }}
        >
          Because it&apos;s you <Heart className="inline w-6 h-6 ml-1 text-red-400" fill="currentColor" />
        </m.div>

        {/* Typing dots */}
        <m.div
          className="mt-4 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {[0, 1, 2].map((i) => (
            <m.span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: 'rgba(100,255,180,0.7)' }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
            />
          ))}
        </m.div>
      </div>
    </m.div>
  )
}

// ─── PuzzleScene ──────────────────────────────────────────────────────────────

export function PuzzleScene({
  direction,
  glow,
  glowSecondary,
  border,
  secretAnswer,
  onNext,
  onUnlock,
}: PuzzleSceneProps) {
  const [value, setValue] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [status, setStatus] = useState<'idle' | 'wrong' | 'success'>('idle')
  const [showSuccess, setShowSuccess] = useState(false)
  const inputControls = useAnimation()
  const timerRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const hint = HINTS[Math.min(attempts, 3) as 2 | 3] ?? null

  const handleSubmit = () => {
    const trimmed = value.trim().toLowerCase()
    const answer = secretAnswer.trim().toLowerCase()

    if (trimmed === answer) {
      setStatus('success')
      setShowSuccess(true)
      onUnlock()
      timerRef.current = window.setTimeout(() => {
        onNext()
      }, 2800)
    } else {
      setAttempts((a) => a + 1)
      setStatus('wrong')

      // Shake the input
      void inputControls.start({
        x: [0, -10, 10, -8, 8, -4, 4, 0],
        transition: { duration: 0.45, ease: 'easeInOut' },
      })

      // Reset back to idle after shake
      setTimeout(() => setStatus('idle'), 600)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  // Border / glow colors by state
  const inputGlow =
    status === 'success'
      ? '0 0 0 2px rgba(80,255,160,0.5), 0 0 28px rgba(80,255,160,0.35), 0 0 60px rgba(60,200,120,0.15)'
      : status === 'wrong'
        ? '0 0 0 2px rgba(255,80,100,0.5), 0 0 28px rgba(255,80,100,0.3)'
        : '0 0 0 1.5px rgba(170,100,255,0.35), 0 0 22px rgba(160,90,255,0.18), 0 0 50px rgba(140,80,255,0.08)'

  const inputBorderColor =
    status === 'success'
      ? 'rgba(80,255,160,0.55)'
      : status === 'wrong'
        ? 'rgba(255,80,100,0.55)'
        : 'rgba(160,100,255,0.32)'

  return (
    <SceneShell
      sceneKey="puzzle"
      direction={direction}
      glow={glow}
      glowSecondary={glowSecondary}
      border={border}
    >
      {/* Ambient particles */}
      <AmbientParticles />

      {/* Darker vignette overlay for mystery */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,transparent_35%,rgba(4,2,14,0.6)_100%)]" />

      {/* Main content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-between px-5 py-7">
        {/* Scene label */}
        <m.div
          className="text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="text-[10px] uppercase tracking-[0.36em] text-white/44">scene three</div>
        </m.div>

        {/* Center content */}
        <div className="flex w-full flex-1 flex-col items-center justify-center gap-8">
          {/* Heading */}
          <m.div
            className="text-center"
            initial={{ opacity: 0, y: 20, filter: 'blur(14px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.4, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2
              className="font-display text-4xl leading-snug text-white sm:text-5xl"
              style={{
                textShadow:
                  '0 0 40px rgba(170,90,255,0.5), 0 0 80px rgba(130,70,220,0.2)',
              }}
            >
              You didn’t think it’ll
              <br />
              <span className="text-white/65">be that easy right?</span>
            </h2>
            <p className="mt-4 text-[13px] uppercase tracking-[0.2em] text-white/55">
              Let’s see if you really know this…
            </p>
          </m.div>

          {/* Input card */}
          <m.div
            className="w-full max-w-sm space-y-4"
            initial={{ opacity: 0, y: 24, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Clue text */}
            <m.div
              className="text-center"
              key={attempts}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-[13px] leading-relaxed text-white/55">
                <span className="uppercase tracking-[0.3em]">Clue:</span><br />
                It’s what I call you when I’m being slightly nice
              </div>
            </m.div>

            {/* Progressive hint */}
            <AnimatePresence>
              {hint && (
                <m.div
                  key={hint}
                  className="rounded-xl border border-white/10 bg-white/6 px-4 py-3 text-center text-[12px] leading-relaxed text-white/60 backdrop-blur-xl"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  {hint}
                </m.div>
              )}
            </AnimatePresence>

            {/* Neon input */}
            <m.div animate={inputControls} className="relative">
              <m.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow:
                    status === 'idle'
                      ? [
                          '0 0 16px rgba(160,90,255,0.12)',
                          '0 0 30px rgba(160,90,255,0.22)',
                          '0 0 16px rgba(160,90,255,0.12)',
                        ]
                      : 'none',
                }}
                transition={{
                  duration: 2.4,
                  repeat: status === 'idle' ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              />
              <input
                ref={inputRef}
                id="puzzle-input"
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value)
                  if (status === 'wrong') setStatus('idle')
                }}
                onKeyDown={handleKeyDown}
                placeholder="type your answer..."
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={showSuccess}
                className="relative w-full rounded-2xl border bg-white/[0.07] px-5 py-4 text-center text-[15px] font-medium tracking-wide text-white placeholder-white/28 backdrop-blur-2xl outline-none transition-all duration-300 disabled:opacity-60"
                style={{
                  borderColor: inputBorderColor,
                  boxShadow: inputGlow,
                  caretColor: 'rgba(200,150,255,0.9)',
                }}
              />
            </m.div>

            {/* Wrong message */}
            <AnimatePresence>
              {status === 'wrong' && (
                <m.p
                  key="wrong-msg"
                  className="text-center text-[12px] tracking-wide text-red-300/80"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Hmm... try again akka
                </m.p>
              )}
            </AnimatePresence>

            {/* Unlock button */}
            <m.button
              id="unlock-button"
              type="button"
              onClick={handleSubmit}
              disabled={showSuccess || value.trim().length === 0}
              className="relative w-full overflow-hidden rounded-2xl border border-white/16 bg-white/[0.09] py-4 text-[13px] font-semibold uppercase tracking-[0.28em] text-white/90 backdrop-blur-2xl transition-colors duration-300 disabled:opacity-40 hover:bg-white/[0.14]"
              style={{
                boxShadow:
                  '0 0 24px rgba(160,90,255,0.18), 0 0 50px rgba(140,70,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
              }}
              whileHover={showSuccess ? {} : { scale: 1.02, boxShadow: '0 0 36px rgba(160,90,255,0.32)' }}
              whileTap={showSuccess ? {} : { scale: 0.97 }}
            >
              {/* Sweep shimmer */}
              <m.span
                className="pointer-events-none absolute inset-0 rounded-2xl"
                animate={{
                  background: [
                    'linear-gradient(90deg,transparent 0%,rgba(200,150,255,0.08) 50%,transparent 100%)',
                    'linear-gradient(90deg,transparent 0%,rgba(200,150,255,0) 50%,transparent 100%)',
                  ],
                }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <span className="relative z-10 flex items-center justify-center gap-2">
                Unlock <Lock className="w-4 h-4 opacity-80" />
              </span>
            </m.button>

            {/* Attempt tracker — visual only, never blocks */}
            {attempts > 0 && !showSuccess && (
              <m.div
                className="flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {Array.from({ length: Math.min(attempts, 4) }).map((_, i) => (
                  <m.div
                    key={i}
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: 'rgba(255,100,120,0.55)' }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                  />
                ))}
                <span className="text-[10px] uppercase tracking-[0.28em] text-white/35">
                  {attempts} {attempts === 1 ? 'try' : 'tries'}
                </span>
              </m.div>
            )}
          </m.div>
        </div>

        {/* Bottom label */}
        <m.div
          className="text-center text-[11px] uppercase tracking-[0.28em] text-white/32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.6 }}
        >
          {showSuccess ? 'unlocking...' : 'a secret waits inside'}
        </m.div>
      </div>

      {/* Success overlay */}
      <AnimatePresence>{showSuccess && <SuccessOverlay key="success" />}</AnimatePresence>
    </SceneShell>
  )
}
