import { m } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { SceneShell } from '../components/SceneShell'

type WishSceneProps = {
  direction: number
  glow: string
  glowSecondary: string
  border: string
  onWish: () => void
  onNext: () => void
}

const HOLD_DURATION = 1500

export function WishScene({
  direction,
  glow,
  glowSecondary,
  border,
  onWish,
  onNext,
}: WishSceneProps) {
  const [progress, setProgress] = useState(0)
  const [isHolding, setIsHolding] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const frameRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isHolding || isComplete) {
      return
    }

    const updateProgress = (timestamp: number) => {
      if (!startedAtRef.current) {
        startedAtRef.current = timestamp
      }

      const elapsed = timestamp - startedAtRef.current
      const nextProgress = Math.min(elapsed / HOLD_DURATION, 1)
      setProgress(nextProgress)

      if (nextProgress >= 1) {
        setIsComplete(true)
        setIsHolding(false)
        onWish()
        window.setTimeout(onNext, 850)
        return
      }

      frameRef.current = window.requestAnimationFrame(updateProgress)
    }

    frameRef.current = window.requestAnimationFrame(updateProgress)

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [isComplete, isHolding, onNext, onWish])

  const stopHolding = () => {
    if (isComplete) {
      return
    }

    setIsHolding(false)
    startedAtRef.current = null
    setProgress(0)

    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }

  const startHolding = () => {
    if (isComplete) {
      return
    }

    setIsHolding(true)
    startedAtRef.current = null
  }

  return (
    <SceneShell
      sceneKey="wish"
      direction={direction}
      glow={glow}
      glowSecondary={glowSecondary}
      border={border}
    >
      <div className="flex h-full flex-col px-6 py-7">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.36em] text-white/52">scene four</div>
          <h2 className="mt-4 font-display text-5xl text-white">make a wish</h2>
          <p className="mt-3 text-sm text-white/62">press and hold until it lifts</p>
        </div>

        <div className="relative flex flex-1 items-center justify-center">
          <div
            className="relative flex h-72 w-72 items-center justify-center rounded-full p-3"
            style={{
              background: `conic-gradient(from 180deg, rgba(255, 208, 230, 0.96) ${progress * 360}deg, rgba(255, 255, 255, 0.08) 0deg)`,
            }}
          >
            <m.button
              type="button"
              onPointerDown={startHolding}
              onPointerUp={stopHolding}
              onPointerLeave={stopHolding}
              onPointerCancel={stopHolding}
              onKeyDown={(event) => {
                if (event.repeat || (event.key !== 'Enter' && event.key !== ' ')) {
                  return
                }

                event.preventDefault()
                startHolding()
              }}
              onKeyUp={(event) => {
                if (event.key !== 'Enter' && event.key !== ' ') {
                  return
                }

                event.preventDefault()
                stopHolding()
              }}
              onBlur={stopHolding}
              aria-label="Press and hold to make a birthday wish"
              animate={{
                y: isComplete ? -36 : isHolding ? -12 : 0,
                scale: isHolding ? 1.03 : 1,
              }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
              className="relative flex h-full w-full items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-2xl"
            >
              <div className="absolute inset-5 rounded-full border border-white/12" />
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,218,146,0.28)_0%,rgba(255,255,255,0)_72%)]" />
              <div className="absolute inset-x-12 bottom-10 h-24 rounded-full bg-[radial-gradient(circle,rgba(255,188,221,0.24)_0%,rgba(255,255,255,0)_80%)] blur-2xl" />
              <div className="text-center">
                <div className="font-display text-7xl text-white">star</div>
                <div className="mt-2 text-[11px] uppercase tracking-[0.3em] text-white/58">
                  {isComplete ? 'sent' : isHolding ? 'keep holding' : 'hold'}
                </div>
              </div>
            </m.button>
          </div>
        </div>

        <div className="text-center text-xs uppercase tracking-[0.28em] text-white/50">
          {isComplete ? 'soft skies, soft year' : 'let the moment glow a little longer'}
        </div>
      </div>
    </SceneShell>
  )
}
