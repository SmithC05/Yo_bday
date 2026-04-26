import { AnimatePresence, m } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { useState } from 'react'

type IntroSceneProps = {
  onStart: () => void
}

export function IntroScene({ onStart }: IntroSceneProps) {
  const [isPressed, setIsPressed] = useState(false)

  const handleTap = () => {
    if (isPressed) return
    setIsPressed(true)
    setTimeout(() => {
      onStart()
    }, 800)
  }

  // Generate particles
  const particles = Array.from({ length: 40 }).map((_, i) => {
    const angle = (i / 40) * Math.PI * 2
    const dist = 50 + Math.random() * 150
    return {
      id: i,
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }
  })

  return (
    <m.div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#03020a] text-white"
      initial={{ scale: 1 }}
      animate={isPressed ? { scale: 1.1 } : { scale: 1 }}
      transition={{ duration: 1.5, ease: 'easeInOut' }}
      onClick={handleTap}
    >
      {/* ─── Glow Spread ─── */}
      <m.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px]"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={
          isPressed
            ? { opacity: 0, scale: 2 }
            : { opacity: 0.4, scale: 1 }
        }
        transition={{ duration: 1.5, ease: 'easeOut' }}
        style={{ background: 'rgba(180, 80, 255, 0.5)' }}
      />

      <m.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[40px]"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={
          isPressed
            ? { opacity: 0, scale: 2 }
            : { opacity: 0.6, scale: 1.2 }
        }
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
        style={{ background: 'rgba(220, 140, 255, 0.7)' }}
      />

      {/* ─── Center Text ─── */}
      <AnimatePresence>
        {!isPressed && (
          <m.div
            className="relative z-10 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1
              className="font-display text-4xl tracking-wide text-white sm:text-5xl"
              style={{
                textShadow: '0 0 30px rgba(180,100,255,0.6), 0 0 60px rgba(140,80,255,0.3)',
              }}
            >
              Let’s begin <Sparkles className="inline w-8 h-8 ml-1 text-yellow-200 opacity-90" />
            </h1>
            <m.div
              className="mt-6 text-[10px] uppercase tracking-[0.4em] text-white/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              tap anywhere
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* ─── Floating Expanding Particles ─── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {particles.map((p) => (
          <m.div
            key={p.id}
            className="absolute rounded-full bg-purple-300"
            style={{ width: p.size, height: p.size, filter: 'blur(1px)' }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={
              isPressed
                ? {
                    opacity: 0,
                    x: p.tx * 2,
                    y: p.ty * 2,
                    scale: 0,
                  }
                : {
                    opacity: [0, 0.8, 0],
                    x: [0, p.tx],
                    y: [0, p.ty],
                    scale: [0, 1, 0.5],
                  }
            }
            transition={
              isPressed
                ? { duration: 0.8, ease: 'easeOut' }
                : {
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: 'easeOut',
                  }
            }
          />
        ))}
      </div>
    </m.div>
  )
}
