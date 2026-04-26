import { AnimatePresence, m } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type AdvancedLockSceneProps = {
  onNext: () => void
}

const TARGET_DATE = new Date('2026-04-29T00:00:00').getTime()

export function AdvancedLockScene({ onNext }: AdvancedLockSceneProps) {
  const [showCountdown, setShowCountdown] = useState(false)
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null)
  const [unlocked, setUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [showDevInput, setShowDevInput] = useState(false)
  const [devPassword, setDevPassword] = useState('')
  const [devError, setDevError] = useState(false)
  
  const tapTimes = useRef<number[]>([])

  const handleContainerTap = () => {
    if (unlocked || showDevInput) return
    const now = Date.now()
    tapTimes.current = [...tapTimes.current, now].filter(t => now - t < 2000)
    if (tapTimes.current.length >= 5) {
      setShowDevInput(true)
      tapTimes.current = []
    }
  }

  // Sequential text reveal
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCountdown(true)
    }, 6000) // Give enough time for the premium text intro
    return () => clearTimeout(timer)
  }, [])

  // Countdown logic
  useEffect(() => {
    if (unlocked || !showCountdown) return

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const difference = TARGET_DATE - now

      if (difference <= 0) {
        setUnlocked(true)
        return null
      }

      return {
        d: Math.floor(difference / (1000 * 60 * 60 * 24)),
        h: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((difference % (1000 * 60)) / 1000),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      const tl = calculateTimeLeft()
      setTimeLeft(tl)
      if (!tl) {
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [unlocked, showCountdown])

  // Hidden password logic
  useEffect(() => {
    if (password.includes('2006')) {
      setUnlocked(true)
    }
  }, [password])

  // Global keydown for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setPassword((prev) => (prev + e.key).slice(-10))
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Transition out after unlock
  useEffect(() => {
    if (unlocked) {
      // Shorter wait for auto-unlock vs manual password
      const isManual = password.includes('2006') || devPassword === '2006'
      const delay = isManual ? 2000 : 1500
      const timeout = setTimeout(() => {
        onNext()
      }, delay)
      return () => clearTimeout(timeout)
    }
  }, [unlocked, onNext, password, devPassword])

  const handleDevSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (devPassword === '2006') {
      setShowDevInput(false)
      setUnlocked(true)
    } else {
      setDevError(true)
      setTimeout(() => setDevError(false), 2000)
    }
  }

  const pad = (num: number) => num.toString().padStart(2, '0')

  // Glow intensity
  const glowOpacity = showCountdown ? 0.4 : 0.3

  return (
    <div 
      className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden bg-[#04020a] text-white"
      onClick={handleContainerTap}
    >
      {/* ─── Ambient Floating Particles ─── */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-30">
        {Array.from({ length: 20 }).map((_, i) => (
          <m.div
            key={i}
            className="absolute rounded-full bg-purple-400"
            style={{
              width: Math.random() * 2 + 1,
              height: Math.random() * 2 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* ─── Pulsing Background Glow ─── */}
      <m.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
        animate={
          unlocked
            ? { opacity: [0.4, 0.8, 0], scale: [1, 1.5, 2], background: 'rgba(180, 100, 255, 0.6)' }
            : { 
                opacity: [glowOpacity * 0.8, glowOpacity, glowOpacity * 0.8], 
                scale: [0.9, 1.1, 0.9], 
                background: 'rgba(160, 80, 255, 0.3)' 
              }
        }
        transition={
          unlocked
            ? { duration: 1.5, ease: 'easeOut' }
            : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      <AnimatePresence>
        {showDevInput && !unlocked && (
          <m.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              // Close if clicked outside
              if (e.target === e.currentTarget) {
                setShowDevInput(false)
                setDevPassword('')
              }
            }}
          >
            <form onSubmit={handleDevSubmit} className="flex flex-col items-center">
              <input
                type="password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                autoFocus
                className="w-32 rounded bg-white/10 px-4 py-2 text-center text-lg tracking-widest text-white outline-none transition-colors focus:bg-white/20"
                placeholder="••••"
              />
              <div className="mt-4 h-4">
                {devError && (
                  <m.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs tracking-widest text-red-400/80"
                  >
                    ACCESS DENIED
                  </m.span>
                )}
              </div>
            </form>
          </m.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex flex-col items-center px-6 text-center pointer-events-none">
        <AnimatePresence mode="wait">
          {unlocked ? (
            <m.div
              key="unlocked-msg"
              className="flex flex-col items-center justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <h2 
                className="text-4xl tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center gap-3"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                It’s time <m.span animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}><Heart fill="currentColor" className="w-8 h-8 text-purple-400" /></m.span>
              </h2>
            </m.div>
          ) : !showCountdown ? (
            <m.div
              key="cinematic-reveal"
              className="relative flex flex-col items-center justify-center w-full"
              exit={{ opacity: 0, filter: 'blur(20px)', scale: 0.95, transition: { duration: 1.2 } }}
            >
              {/* "Hey…" above the line */}
              <m.p
                className="mb-8 text-2xl font-light text-white/60 font-display"
                style={{ letterSpacing: '0.25em' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1.4, ease: 'easeOut' }}
              >
                Hello…
              </m.p>

              {/* ─── Central Glowing Line ─── */}
              <div className="relative flex items-center justify-center w-full max-w-xs mb-8">
                <m.div
                  className="absolute h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                  style={{ boxShadow: '0 0 12px 2px rgba(180, 100, 255, 0.6)' }}
                  initial={{ width: '0%', opacity: 0 }}
                  animate={{ width: '100%', opacity: 1 }}
                  transition={{ delay: 1.4, duration: 1, ease: 'easeInOut' }}
                />
              </div>

              {/* "Akka" with heartbeat glow */}
              <m.div
                initial={{ opacity: 0, scale: 0.92, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                transition={{ delay: 2.2, duration: 1.2, ease: 'easeOut' }}
                className="mb-8 relative"
              >
                <m.h1
                  className="text-6xl sm:text-8xl font-semibold text-white font-display"
                  style={{
                    letterSpacing: '0.08em',
                    textShadow: '0 0 30px rgba(200, 120, 255, 0.6), 0 0 60px rgba(160, 80, 255, 0.3)',
                  }}
                  animate={{
                    textShadow: [
                      '0 0 30px rgba(200,120,255,0.5), 0 0 60px rgba(160,80,255,0.2)',
                      '0 0 50px rgba(220,140,255,0.9), 0 0 100px rgba(180,100,255,0.5)',
                      '0 0 30px rgba(200,120,255,0.5), 0 0 60px rgba(160,80,255,0.2)',
                    ],
                  }}
                  transition={{ delay: 3.5, duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Akka
                </m.h1>
                {/* Bloom glow layer */}
                <m.div
                  className="pointer-events-none absolute inset-0 rounded-full blur-3xl -z-10"
                  style={{ background: 'rgba(180, 100, 255, 0.15)' }}
                  animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
                  transition={{ delay: 3.5, duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </m.div>

              {/* "Advance Happy Birthday" below */}
              <m.p
                className="text-sm font-light uppercase tracking-[0.35em] text-purple-200/60 font-display"
                initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 3.4, duration: 1.4, ease: 'easeOut' }}
              >
                Advance Happy Birthday
              </m.p>
            </m.div>
          ) : (
            <m.div
              key="countdown-area"
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <m.div
                className="mb-8 flex flex-col items-center"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span 
                  className="text-xs uppercase tracking-[0.4em] text-purple-300/60 mb-2"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Unlocks in…
                </span>
                <div className="h-px w-12 bg-purple-500/30" />
              </m.div>

              <div 
                className="flex items-center justify-center gap-4 text-3xl font-light tracking-widest sm:text-5xl"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-white drop-shadow-[0_0_15px_rgba(180,100,255,0.5)]">
                    {timeLeft ? pad(timeLeft.d) : '00'}
                  </span>
                  <span className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white/40">Days</span>
                </div>
                <span className="mb-6 text-white/30">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-white drop-shadow-[0_0_15px_rgba(180,100,255,0.5)]">
                    {timeLeft ? pad(timeLeft.h) : '00'}
                  </span>
                  <span className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white/40">Hrs</span>
                </div>
                <span className="mb-6 text-white/30">:</span>
                <div className="flex flex-col items-center">
                  <span className="text-white drop-shadow-[0_0_15px_rgba(180,100,255,0.5)]">
                    {timeLeft ? pad(timeLeft.m) : '00'}
                  </span>
                  <span className="mt-2 text-[9px] uppercase tracking-[0.3em] text-white/40">Min</span>
                </div>
                <span className="mb-6 text-white/30">:</span>
                <div className="flex flex-col items-center">
                  <m.span 
                    key={timeLeft?.s ?? '00'}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-purple-300 drop-shadow-[0_0_20px_rgba(200,120,255,0.8)]"
                  >
                    {timeLeft ? pad(timeLeft.s) : '00'}
                  </m.span>
                  <span className="mt-2 text-[9px] uppercase tracking-[0.3em] text-purple-300/60">Sec</span>
                </div>
              </div>
              
              <m.div
                className="mt-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
              >
                <Sparkles className="w-5 h-5 text-purple-400/40 animate-pulse" />
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
