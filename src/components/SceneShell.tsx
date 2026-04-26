import type { ReactNode } from 'react'
import { m } from 'framer-motion'

type SceneShellProps = {
  sceneKey: string
  direction: number
  glow: string
  glowSecondary: string
  border: string
  children: ReactNode
}

const sceneVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    scale: 0.96,
    x: direction >= 0 ? 28 : -28,
    filter: 'blur(20px)',
  }),
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    scale: 1.03,
    x: direction >= 0 ? -24 : 24,
    filter: 'blur(18px)',
    transition: {
      duration: 0.45,
      ease: [0.4, 0, 1, 1] as const,
    },
  }),
}

export function SceneShell({
  sceneKey,
  direction,
  glow,
  glowSecondary,
  border,
  children,
}: SceneShellProps) {
  return (
    <m.section
      key={sceneKey}
      custom={direction}
      variants={sceneVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="absolute inset-0 flex min-h-dvh items-stretch justify-center overflow-hidden px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]"
    >
      <div
        className="relative mx-auto flex h-full w-full max-w-md overflow-hidden rounded-[2rem] border bg-white/[0.06] shadow-[0_24px_120px_rgba(3,6,24,0.55)] backdrop-blur-2xl"
        style={{ borderColor: border }}
      >
        <div
          className="pointer-events-none absolute -left-16 top-10 h-48 w-48 rounded-full blur-3xl"
          style={{ background: glow }}
        />
        <div
          className="pointer-events-none absolute -right-20 bottom-8 h-56 w-56 rounded-full blur-3xl"
          style={{ background: glowSecondary }}
        />
        <div className="pointer-events-none absolute inset-x-8 top-4 h-px bg-white/18" />
        <div className="relative z-10 flex h-full w-full flex-col">{children}</div>
      </div>
    </m.section>
  )
}
