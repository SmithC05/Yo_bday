import { AnimatePresence, m } from 'framer-motion'
import { useMemo, useState } from 'react'
import { GlowButton } from '../components/GlowButton'
import { SceneShell } from '../components/SceneShell'

type AffirmationSceneProps = {
  direction: number
  glow: string
  glowSecondary: string
  border: string
  qualities: string[]
  onPulse: () => void
  onNext: () => void
}

export function AffirmationScene({
  direction,
  glow,
  glowSecondary,
  border,
  qualities,
  onPulse,
  onNext,
}: AffirmationSceneProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  const shownQualities = useMemo(() => qualities.slice(0, activeIndex + 1), [activeIndex, qualities])

  const handleReveal = () => {
    onPulse()

    if (activeIndex === qualities.length - 1) {
      onNext()
      return
    }

    setActiveIndex((current) => current + 1)
  }

  return (
    <SceneShell
      sceneKey="affirmation"
      direction={direction}
      glow={glow}
      glowSecondary={glowSecondary}
      border={border}
    >
      <div className="flex h-full flex-col px-6 py-7">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.36em] text-white/52">scene three</div>
          <h2 className="mt-4 font-display text-5xl text-white">tap the heart</h2>
          <p className="mt-3 text-sm text-white/62">it remembers who she is</p>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center">
          <div className="absolute inset-x-0 top-[18%] flex justify-center">
            <AnimatePresence mode="wait">
              <m.div
                key={qualities[activeIndex]}
                initial={{ opacity: 0, y: 16, scale: 0.92, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -10, scale: 1.04, filter: 'blur(8px)' }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
                className="font-display text-6xl text-white drop-shadow-[0_0_24px_rgba(255,209,230,0.42)]"
              >
                {qualities[activeIndex]}
              </m.div>
            </AnimatePresence>
          </div>

          <m.button
            type="button"
            onClick={handleReveal}
            whileTap={{ scale: 0.97 }}
            className="relative flex h-52 w-52 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-2xl"
          >
            <m.div
              className="absolute inset-5 rounded-full border border-white/12"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.45, 0.95, 0.45],
              }}
              transition={{
                duration: 3.6,
                repeat: Number.POSITIVE_INFINITY,
                ease: 'easeInOut',
              }}
            />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,190,226,0.24)_0%,rgba(255,255,255,0)_72%)]" />
            <div className="font-display text-7xl text-white">+</div>
          </m.button>

          <div className="mt-10 flex max-w-[18rem] flex-wrap items-center justify-center gap-2">
            {shownQualities.map((quality, index) => (
              <m.div
                key={quality}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.04 }}
                className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-[11px] uppercase tracking-[0.28em] text-white/76 backdrop-blur-xl"
              >
                {quality}
              </m.div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <GlowButton onClick={handleReveal} subtle>
            {activeIndex === qualities.length - 1 ? 'let it bloom' : 'one more'}
          </GlowButton>
        </div>
      </div>
    </SceneShell>
  )
}
