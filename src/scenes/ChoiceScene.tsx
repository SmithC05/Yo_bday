import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Camera, Check, ChevronRight, PartyPopper } from 'lucide-react'
import { ChoiceBackground, type ChoiceType } from '../components/ChoiceBackground'
import { PathMicroExperience, type PathContent } from '../components/PathMicroExperience'
import { SceneShell } from '../components/SceneShell'

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type Choice = {
  id: ChoiceType & string
  label: string
  icon: React.ReactNode
  confirmMessage: string
  glowColor: string
  borderColor: string
  gradientFrom: string
  gradientTo: string
}

type ChoiceSceneProps = {
  direction: number
  glow: string
  glowSecondary: string
  border: string
  pathContent: PathContent
  onNext: () => void
}

// Internal flow phases
type Phase = 'picking' | 'confirming' | 'path' | 'completed'



const CHOICES: Choice[] = [
  {
    id: 'memories',
    label: 'Memories',
    icon: <Camera />,
    confirmMessage: "Good choice...\nLet's go back to where it all began \nsome things are worth revisiting.",
    glowColor: 'rgba(180, 220, 255, 0.55)',
    borderColor: 'rgba(160, 200, 255, 0.28)',
    gradientFrom: 'rgba(140, 180, 255, 0.12)',
    gradientTo: 'rgba(100, 140, 255, 0.06)',
  },
  {
    id: 'fun',
    label: 'One more thing',
    icon: <PartyPopper />,
    confirmMessage: "Oh, this one is personal...\nJust a few things\nI wanted you to see.",
    glowColor: 'rgba(255, 200, 80, 0.55)',
    borderColor: 'rgba(255, 200, 80, 0.28)',
    gradientFrom: 'rgba(255, 200, 80, 0.12)',
    gradientTo: 'rgba(255, 140, 60, 0.06)',
  },
]



const listVariants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.6, staggerChildren: 0.18 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.92, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
  },
}


function ChoiceCard({
  choice,
  isPicked,
  isCompleted,
  isDisabled,
  onSelect,
}: {
  choice: Choice
  isPicked: boolean
  isCompleted: boolean
  isDisabled: boolean
  onSelect: (c: Choice) => void
}) {
  return (
    <m.div variants={cardVariants}>
      <m.button
        id={`choice-${choice.id}`}
        type="button"
        disabled={isDisabled}
        onClick={() => onSelect(choice)}
        className={`relative w-full overflow-hidden rounded-2xl border text-left backdrop-blur-2xl transition-all duration-500 focus-visible:outline-none ${
          isCompleted ? 'opacity-40 grayscale saturate-50' : 'opacity-100'
        }`}
        style={{
          background: `linear-gradient(135deg, ${choice.gradientFrom}, ${choice.gradientTo})`,
          borderColor: isPicked || isCompleted
            ? choice.borderColor.replace('0.28', '0.65')
            : choice.borderColor,
          boxShadow: isPicked
            ? `0 0 32px ${choice.glowColor}, 0 0 64px ${choice.glowColor.replace('0.55', '0.2')}, inset 0 1px 0 rgba(255,255,255,0.12)`
            : `0 0 0px transparent, inset 0 1px 0 rgba(255,255,255,0.07)`,
        }}
        whileHover={
          isDisabled
            ? {}
            : {
                scale: 1.025,
                boxShadow: `0 0 28px ${choice.glowColor.replace('0.55', '0.35')}, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }
        }
        whileTap={isDisabled ? {} : { scale: 0.97 }}
        animate={
          isPicked
            ? { scale: [1, 1.03, 1.015], transition: { duration: 0.4, ease: 'easeOut' } }
            : {}
        }
        transition={{ duration: 0.22 }}
      >
        {/* Selection shimmer */}
        {isPicked && (
          <m.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.35, 0] }}
            transition={{ duration: 0.55 }}
            style={{
              background: `radial-gradient(circle at 50% 50%, ${choice.glowColor.replace('0.55', '0.5')}, transparent 70%)`,
            }}
          />
        )}

        <div className="flex items-center gap-4 px-5 py-[18px]">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{
              background: `linear-gradient(135deg, ${choice.gradientFrom.replace('0.12', '0.22')}, ${choice.gradientTo.replace('0.06', '0.14')})`,
              border: `1px solid ${choice.borderColor}`,
              boxShadow: `0 0 14px ${choice.glowColor.replace('0.55', '0.18')}`,
            }}
          >
            {choice.icon}
          </div>

          <div>
            <div className="text-[15px] font-semibold tracking-wide text-white/90">
              {choice.label}
            </div>
            <div className="mt-0.5 text-[11px] uppercase tracking-[0.28em] text-white/44">
              {isCompleted ? 'experienced' : 'tap to choose'}
            </div>
          </div>

          <div className="ml-auto">
            {isPicked || isCompleted ? (
              <m.div
                initial={isPicked ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                className="text-lg"
              >
                <Check className="w-5 h-5 text-green-300" />
              </m.div>
            ) : (
              <div className="text-white/28"><ChevronRight className="w-5 h-5" /></div>
            )}
          </div>
        </div>
      </m.button>
    </m.div>
  )
}

// â”€â”€â”€ Brief confirm overlay (bridge between pick and path) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ConfirmOverlay({ choice }: { choice: Choice }) {
  return (
    <m.div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }}
      transition={{ duration: 0.5 }}
    >
      {/* Semi-dark wash */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(10,8,28,0.65) 0%, rgba(6,5,18,0.85) 100%)',
        }}
      />

      {/* Glow orb */}
      <m.div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          background: `radial-gradient(circle, ${choice.glowColor.replace('0.55', '0.25')} 0%, transparent 70%)`,
        }}
        animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Message */}
      <div className="relative z-10">
        <m.p
          className="whitespace-pre-line font-display text-3xl leading-snug text-white sm:text-4xl"
          style={{
            textShadow: `0 0 40px ${choice.glowColor.replace('0.55', '0.65')}, 0 0 80px ${choice.glowColor.replace('0.55', '0.22')}`,
          }}
          initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {choice.confirmMessage}
        </m.p>

        {/* Typing dots */}
        <m.div
          className="mt-6 flex justify-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
        >
          {[0, 1, 2].map((i) => (
            <m.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-white/50"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.22 }}
            />
          ))}
        </m.div>
      </div>
    </m.div>
  )
}

// â”€â”€â”€ ChoiceScene â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function ChoiceScene({
  direction,
  glow,
  glowSecondary,
  border,
  pathContent,
  onNext,
}: ChoiceSceneProps) {
  const [selected, setSelected] = useState<Choice | null>(null)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [phase, setPhase] = useState<Phase>('picking')
  const timerRef = useRef<number | null>(null)

  const handleSelect = (choice: Choice) => {
    if (phase !== 'picking') return
    setSelected(choice)
    setPhase('confirming')

    // Show confirm overlay for 1.4 s, then launch the micro-experience
    timerRef.current = window.setTimeout(() => {
      setPhase('path')
    }, 1400)
  }

  // Called by PathMicroExperience when it naturally finishes
  const handlePathDone = () => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (selected) next.add(selected.id)
      return next
    })
    setSelected(null)
    setPhase('picking')
  }

  // When all choices are completed, trigger the final overlay and next scene
  useEffect(() => {
    if (phase === 'picking' && completed.size === CHOICES.length) {
      const id = window.setTimeout(() => {
        setPhase('completed')
        window.setTimeout(() => {
          onNext()
        }, 2800)
      }, 600)
      return () => window.clearTimeout(id)
    }
  }, [phase, completed.size, onNext])

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <SceneShell
      sceneKey="choice"
      direction={direction}
      glow={glow}
      glowSecondary={glowSecondary}
      border={border}
    >
      {/* Reactive ambient background â€” stays during both phases */}
      <ChoiceBackground choice={selected ? (selected.id as ChoiceType) : null} />

      {/* â”€â”€ Phase: PICKING â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {phase === 'picking' && (
          <m.div
            key="picking"
            className="relative z-10 flex h-full flex-col justify-between px-5 py-7"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(8px)', transition: { duration: 0.45 } }}
          >
            {/* Scene label */}
            <m.div
              className="text-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-[10px] uppercase tracking-[0.36em] text-white/48">
                scene two
              </div>
            </m.div>

            {/* Heading + cards */}
            <div className="flex flex-1 flex-col items-center justify-center">
              <m.div
                className="mb-8 text-center"
                initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <h2
                  className="font-display text-4xl leading-tight text-white sm:text-5xl"
                  style={{
                    textShadow:
                      '0 0 40px rgba(200,160,255,0.45), 0 0 80px rgba(255,140,200,0.18)',
                  }}
                >
                  Wait wait
                  <br />
                  <span className="text-white/70">Before I show you this,</span>
                </h2>
                <p className="mt-3 text-[12px] uppercase tracking-[0.3em] text-white/42">
                  
                </p>
              </m.div>

              <m.div
                className="w-full max-w-sm space-y-3"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {CHOICES.map((choice) => (
                  <ChoiceCard
                    key={choice.id}
                    choice={choice}
                    isPicked={selected?.id === choice.id}
                    isCompleted={completed.has(choice.id)}
                    isDisabled={selected !== null}
                    onSelect={handleSelect}
                  />
                ))}
              </m.div>
            </div>

            {/* Bottom hint */}
            <m.div
              className="text-center text-[11px] uppercase tracking-[0.28em] text-white/38"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              {completed.size > 0 ? 'one more to go' : 'choose your vibe'}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* â”€â”€ Phase: CONFIRMING â€” brief bridge overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {phase === 'confirming' && selected && (
          <ConfirmOverlay key="confirm" choice={selected} />
        )}
      </AnimatePresence>

      {/* â”€â”€ Phase: PATH â€” fills the SceneShell card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {phase === 'path' && selected && (
          <m.div
            key="path"
            className="absolute inset-0 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <PathMicroExperience
              choice={selected.id as 'fun' | 'memories' | 'secret'}
              content={pathContent}
              onDone={handlePathDone}
            />
          </m.div>
        )}
      </AnimatePresence>

      {/* â”€â”€ Phase: COMPLETED â€” final message before transition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {phase === 'completed' && (
          <m.div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center px-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="absolute inset-0 backdrop-blur-md"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 50%, rgba(10,8,28,0.7) 0%, rgba(6,5,18,0.9) 100%)',
              }}
            />
            <div className="relative z-10">
              <m.p
                className="whitespace-pre-line font-display text-3xl leading-snug text-white sm:text-4xl"
                style={{ textShadow: `0 0 40px rgba(200,160,255,0.6), 0 0 80px rgba(200,160,255,0.2)` }}
                initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                Now you've seen everything{'\n'}let's continue <ArrowRight className="inline w-8 h-8 ml-2 opacity-80" />
              </m.p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </SceneShell>
  )
}

