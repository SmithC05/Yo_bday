import { AnimatePresence, m } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

type CountdownIntroSceneProps = {
  onUnlockAudio: () => void
  onComplete: () => void
}

type Step = 
  | 'init' 
  | '3' 
  | '2' 
  | '1' 
  | 'date' 
  | 'prompt' 
  | 'transition' 
  | 'reveal_1' 
  | 'reveal_2' 
  | 'reveal_3' 
  | 'reveal_4'

export function CountdownIntroScene({ onUnlockAudio, onComplete }: CountdownIntroSceneProps) {
  const [step, setStep] = useState<Step>('init')
  const [isPressed, setIsPressed] = useState(false)

  // ─── Sequence Timing ────────────────────────────────────────────────────────
  useEffect(() => {
    // Delays for the cinematic sequence
    const timers = [
      setTimeout(() => setStep('3'), 800),
      setTimeout(() => setStep('2'), 2000),
      setTimeout(() => setStep('1'), 3200),
      setTimeout(() => setStep('date'), 4400),
      setTimeout(() => setStep('prompt'), 7000),
    ]

    return () => timers.forEach(clearTimeout)
  }, [])

  const handleTap = () => {
    if (step !== 'prompt' || isPressed) return
    setIsPressed(true)
    
    // Scale-down feedback before triggering the transition
    setTimeout(() => {
      onUnlockAudio() // start BGM
      setStep('transition')
      
      setTimeout(() => setStep('reveal_1'), 1500)
      setTimeout(() => setStep('reveal_2'), 4000)
      setTimeout(() => setStep('reveal_3'), 6500)
      setTimeout(() => setStep('reveal_4'), 9500)
      setTimeout(() => onComplete(), 14500) // Finish the intro flow
    }, 400)
  }

  return (
    <div
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#04020a] text-white"
      onClick={handleTap}
    >
      {/* ─── Ambient Glow (Appears on date reveal, explodes on transition) ── */}
      <m.div
        className="pointer-events-none absolute inset-0 z-0"
        initial={{ opacity: 0, scale: 1 }}
        animate={
          step === 'transition' 
            ? { opacity: [1, 1, 0], scale: [1, 3, 3], filter: ['blur(40px)', 'blur(80px)', 'blur(100px)'] }
            : step === 'date' || step === 'prompt' 
              ? { opacity: 1, scale: 1, filter: 'blur(0px)' } 
              : { opacity: 0 }
        }
        transition={
          step === 'transition' 
            ? { duration: 1.5, ease: 'easeOut' }
            : { duration: 2.5, ease: 'easeInOut' }
        }
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, rgba(120,60,200,0.18) 0%, transparent 65%)',
        }}
      />

      {/* ─── Soft Particles (Hide during transition/reveal until final) ───── */}
      <AnimatePresence>
        {(step === 'date' || step === 'prompt') && (
          <m.div
            className="pointer-events-none absolute inset-0 z-0 opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            {Array.from({ length: 25 }).map((_, i) => (
              <m.div
                key={i}
                className="absolute rounded-full bg-purple-300"
                style={{
                  width: Math.random() * 3 + 1,
                  height: Math.random() * 3 + 1,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  filter: 'blur(1px)',
                }}
                animate={{
                  y: [0, -60, 0],
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 5,
                  repeat: Infinity,
                  delay: Math.random() * 3,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </m.div>
        )}
      </AnimatePresence>

      {/* ─── Center Content (3-2-1, Date Reveal) ────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {/* 3, 2, 1 Countdown */}
          {['3', '2', '1'].includes(step) && (
            <m.div
              key={step}
              className="absolute font-display text-8xl font-light text-white/90 drop-shadow-2xl sm:text-9xl"
              initial={{ opacity: 0, scale: 0.85, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.15, filter: 'blur(6px)' }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              {step}
            </m.div>
          )}

          {/* Date Reveal */}
          {(step === 'date' || step === 'prompt') && (
            <m.div
              key="reveal"
              className="absolute flex flex-col items-center text-center"
              initial={{ opacity: 0, scale: 1.05, filter: 'blur(12px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
            >
              <h1
                className="font-display text-5xl tracking-wide text-white sm:text-6xl"
                style={{
                  textShadow: '0 0 40px rgba(180,100,255,0.5), 0 0 80px rgba(140,80,255,0.25)',
                }}
              >
                29 April <Sparkles className="inline w-10 h-10 ml-1 text-yellow-200 opacity-90" />
              </h1>

              <m.p
                className="mt-5 font-serif text-lg italic text-purple-200/70 flex items-center justify-center gap-2"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.6, delay: 1.2 }}
              >
                Your day <Heart fill="currentColor" className="w-4 h-4 text-purple-400" />
              </m.p>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Entry Prompt (Interactive) ─────────────────────────────────────── */}
      <AnimatePresence>
        {step === 'prompt' && (
          <m.div
            className="absolute bottom-[18%] flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <m.button
              className="font-display text-2xl tracking-widest text-white/90 focus-visible:outline-none"
              style={{ textShadow: '0 0 20px rgba(255,255,255,0.4)' }}
              animate={
                isPressed
                  ? { scale: 0.94, opacity: 0.4 }
                  : { opacity: [0.7, 1, 0.7], scale: [1, 1.03, 1] }
              }
              transition={
                isPressed
                  ? { duration: 0.15 }
                  : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              It’s time
            </m.button>

            <m.div
              className="mt-4 text-[10px] uppercase tracking-[0.4em] text-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 1.2 }}
            >
              tap anywhere
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ─── Birthday Reveal Sequence ──────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          {step === 'reveal_1' && (
            <RevealText key="1" text={<>Hey akka… <Heart fill="currentColor" className="inline w-8 h-8 ml-1 text-purple-400" /></>} glowOpacity={0.2} />
          )}
          {step === 'reveal_2' && (
            <RevealText key="2" text="Today is not just any day…" glowOpacity={0.35} />
          )}
          {step === 'reveal_3' && (
            <RevealText key="3" text="It’s your day." glowOpacity={0.5} />
          )}
          {step === 'reveal_4' && (
            <FinalReveal key="4" text={<>Happy Birthday </>} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function RevealText({ text, glowOpacity }: { text: React.ReactNode; glowOpacity: number }) {
  return (
    <m.div
      className="absolute flex flex-col items-center justify-center"
      initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
    >
      <div 
        className="absolute h-32 w-32 rounded-full blur-3xl"
        style={{ background: `rgba(160,80,255,${glowOpacity})` }} 
      />
      <h2 className="relative z-10 font-display text-3xl leading-snug text-white/90 sm:text-4xl">
        {text}
      </h2>
    </m.div>
  )
}

function FinalReveal({ text }: { text: React.ReactNode }) {
  return (
    <m.div
      className="absolute flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.9, filter: 'blur(12px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Intense glow burst */}
      <m.div
        className="absolute h-64 w-64 rounded-full blur-[80px]"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.8, 0.5], scale: [0.5, 1.5, 1.2] }}
        transition={{ duration: 3, ease: 'easeOut' }}
        style={{ background: 'rgba(200,100,255,0.6)' }}
      />
      
      {/* Particles burst */}
      <div className="absolute inset-0">
        {Array.from({ length: 40 }).map((_, i) => (
          <m.div
            key={i}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-white/80"
            initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
            animate={{ 
              opacity: 0, 
              scale: Math.random() * 2 + 1,
              x: (Math.random() - 0.5) * 500,
              y: (Math.random() - 0.5) * 500
            }}
            transition={{ duration: 2 + Math.random() * 2, ease: 'easeOut' }}
            style={{ filter: 'blur(1px)' }}
          />
        ))}
      </div>

      <h1 
        className="relative z-10 font-display text-5xl text-white sm:text-6xl"
        style={{ textShadow: '0 0 40px rgba(255,255,255,0.6), 0 0 80px rgba(180,100,255,0.8)' }}
      >
        {text}
      </h1>
    </m.div>
  )
}
