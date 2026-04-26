import { AnimatePresence, m } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

import { Lock } from 'lucide-react'

// ─── Shared types ─────────────────────────────────────────────────────────────

export type CardData = {
  id: string
  imageUrl: string
  text: string
}

type FunPath = {
  cards: CardData[]
}

type MemoriesPath = {
  slides: { caption: string; icon: React.ReactNode; imageUrl: string }[]
}

type SecretPath = {
  teasers: string[]
}

export type PathContent = {
  fun: FunPath
  memories: MemoriesPath
  secret: SecretPath
}

type MicroExperienceProps = {
  choice: 'fun' | 'memories' | 'secret'
  content: PathContent
  onDone: () => void
}

// ─── Shared easing ────────────────────────────────────────────────────────────

const ease = [0.22, 1, 0.36, 1] as const

// ──────────────────────────────────────────────────────────────────────────────
// SOLO CARDS PATH — "One More Thing" floating cards
// ──────────────────────────────────────────────────────────────────────────────

function SoloCardsMicro({ cards, onDone }: { cards: CardData[]; onDone: () => void }) {
  const [openedCards, setOpenedCards] = useState<Set<string>>(new Set())
  const [activeCard, setActiveCard] = useState<CardData | null>(null)
  const [canContinue, setCanContinue] = useState(false)
  const isAllOpened = openedCards.size === cards.length

  useEffect(() => {
    const timer = window.setTimeout(() => setCanContinue(true), 5000)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <m.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.96, filter: 'blur(12px)' }}
      transition={{ duration: 0.6, ease }}
    >
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(140,80,250,0.15),rgba(10,5,20,0.9)_80%)]" />

      {/* Intro Text */}
      <m.div
        className="absolute top-[12%] z-10 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="font-display text-3xl text-white drop-shadow-md">
          One more thing...
        </h2>
        <p className="mt-2 text-sm uppercase tracking-[0.25em] text-white/50">
          This is just you 😌
        </p>
      </m.div>

      {/* Floating Cards Container */}
      <div className="relative h-full w-full max-w-sm mt-12">
        {cards.map((card, i) => {
          const isOpened = openedCards.has(card.id)
          
          // Pre-defined scattered layout for 5 cards
          const positions = [
            { top: '25%', left: '10%', rotate: -8 },
            { top: '35%', left: '60%', rotate: 12 },
            { top: '55%', left: '5%', rotate: -15 },
            { top: '65%', left: '55%', rotate: 8 },
            { top: '45%', left: '30%', rotate: 4 },
          ]
          const pos = positions[i % positions.length]

          return (
            <m.button
              key={card.id}
              onClick={() => setActiveCard(card)}
              className="absolute overflow-hidden rounded-xl border bg-white/5 backdrop-blur-md shadow-2xl"
              style={{
                top: pos.top,
                left: pos.left,
                width: 100,
                height: 130,
                borderColor: isOpened ? 'rgba(255,255,255,0.1)' : 'rgba(160,100,255,0.4)',
                filter: isOpened ? 'grayscale(100%) opacity(40%)' : 'none',
                boxShadow: isOpened ? 'none' : '0 10px 30px rgba(140,80,250,0.2)',
              }}
              initial={{ scale: 0, opacity: 0, rotate: pos.rotate - 20 }}
              animate={{
                scale: 1,
                opacity: 1,
                rotate: pos.rotate,
                y: [0, -10 + (i % 3) * 5, 0],
              }}
              transition={{
                scale: { duration: 0.6, delay: 0.3 + i * 0.15, type: 'spring' },
                y: { duration: 4 + i, repeat: Infinity, ease: 'easeInOut' },
              }}
              whileHover={isOpened ? {} : { scale: 1.1, zIndex: 20 }}
              whileTap={isOpened ? {} : { scale: 0.95 }}
            >
              <img src={card.imageUrl} className="h-full w-full object-cover opacity-90" alt="" draggable={false} />
            </m.button>
          )
        })}
      </div>

      {/* Expanded Card Modal */}
      <AnimatePresence>
        {activeCard && (
          <m.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => {
                setOpenedCards((prev) => new Set(prev).add(activeCard.id))
                setActiveCard(null)
              }}
            />
            <m.div
              className="relative z-10 flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/5 shadow-2xl backdrop-blur-3xl"
              initial={{ scale: 0.9, y: 30, filter: 'blur(10px)', rotateX: 10 }}
              animate={{ scale: 1, y: 0, filter: 'blur(0px)', rotateX: 0 }}
              exit={{ scale: 0.95, y: 10, filter: 'blur(8px)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-black/40">
                <m.img
                  src={activeCard.imageUrl}
                  className="h-full w-full object-cover"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 3, ease: 'easeOut' }}
                  draggable={false}
                />
              </div>
              <div className="p-6 text-center">
                <m.p
                  className="font-display text-xl text-white/95 leading-relaxed drop-shadow-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {activeCard.text}
                </m.p>
                <button
                  onClick={() => {
                    setOpenedCards((prev) => new Set(prev).add(activeCard.id))
                    setActiveCard(null)
                  }}
                  className="mt-6 text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-white/70"
                >
                  tap to close
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Completion Message & Continue */}
      <AnimatePresence>
        {(isAllOpened || canContinue) && !activeCard && (
          <m.div
            className="absolute bottom-12 flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="mb-6 text-center font-display text-xl leading-snug text-white/90 drop-shadow-md">
              That’s you…<br />
              and that’s why this is special 💜
            </p>
            <m.button
              onClick={onDone}
              className="rounded-full border border-purple-400/30 bg-purple-500/20 px-8 py-3.5 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-purple-500/40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ boxShadow: '0 0 20px rgba(160,80,255,0.3)' }}
            >
              Continue →
            </m.button>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// MEMORIES PATH — slow polaroid slides, warm nostalgic crossfade
// ──────────────────────────────────────────────────────────────────────────────

function MemorySlide({
  slide,
  index,
  onClick,
}: {
  slide: MemoriesPath['slides'][number]
  index: number
  onClick: () => void
}) {
  return (
    <m.div
      className="flex flex-col items-center gap-5"
      initial={{ opacity: 0, y: 20, scale: 0.93, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -14, scale: 1.03, filter: 'blur(8px)' }}
      transition={{ duration: 0.9, ease }}
    >
      {/* Polaroid card */}
      <m.div
        className="relative overflow-hidden rounded-2xl border border-white/14 bg-white/[0.07] backdrop-blur-xl cursor-pointer"
        onClick={onClick}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        style={{
          boxShadow:
            '0 8px 40px rgba(180,200,255,0.15), 0 0 60px rgba(200,180,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
          width: 220,
        }}
      >
        {slide.imageUrl ? (
          <img
            src={slide.imageUrl}
            alt={slide.caption}
            className="h-44 w-full object-cover"
            draggable={false}
          />
        ) : (
          /* Placeholder when no image is set */
          <div
            className="flex h-44 w-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg,
                rgba(${index % 3 === 0 ? '180,160,255' : index % 3 === 1 ? '255,180,200' : '160,210,255'},0.18),
                rgba(255,255,255,0.04))`,
            }}
          >
            <div className="flex items-center justify-center opacity-80">{slide.icon}</div>
          </div>
        )}
        {/* Caption strip */}
        <div className="px-4 py-3 text-center text-[12px] leading-relaxed text-white/68">
          {slide.caption}
        </div>
      </m.div>

      {/* Slide counter */}
      <div className="text-[10px] uppercase tracking-[0.35em] text-white/38">
        memory {index + 1}
      </div>
    </m.div>
  )
}

function MemoriesMicro({
  slides,
  onDone,
}: {
  slides: MemoriesPath['slides']
  onDone: () => void
}) {
  const [slideIndex, setSlideIndex] = useState(0)
  const [expandedSlide, setExpandedSlide] = useState<MemoriesPath['slides'][number] | null>(null)
  const [showContinue, setShowContinue] = useState(false)
  const timersRef = useRef<number[]>([])
  const PER_SLIDE = 4000 // Slowed down slide progression

  useEffect(() => {
    const id = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % slides.length)
    }, PER_SLIDE)
    timersRef.current.push(id)
    // Show continue button after 5 seconds
    const showId = window.setTimeout(() => setShowContinue(true), 5000)
    timersRef.current.push(showId)
    return () => timersRef.current.forEach((id) => { window.clearInterval(id); window.clearTimeout(id) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slides.length])

  return (
    <m.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(14px)' }}
      transition={{ duration: 0.7, ease }}
    >
      {/* Soft warm blue wash */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(180,200,255,0.12),transparent_60%),radial-gradient(ellipse_at_80%_80%,rgba(255,180,220,0.08),transparent_50%)]" />

      {/* Drifting photo-frame outlines / tiny cards behind slide */}
      <div className="pointer-events-auto absolute inset-0 overflow-hidden opacity-60">
        {Array.from({ length: 18 }, (_, i) => {
          const slide = slides[i % slides.length]
          return (
            <m.button
              key={i}
              className="absolute overflow-hidden rounded-sm border border-white/20 bg-white/5 backdrop-blur-sm shadow-xl"
              style={{
                left: `${(i * 23) % 85 + 5}%`,
                bottom: '-15%',
                width: 40 + (i % 4) * 15,
                height: 50 + (i % 4) * 20,
              }}
              animate={{
                y: [0, -800],
                rotate: [-15 + (i % 3) * 10, 15 - (i % 3) * 10],
                opacity: [0, 0.7, 0],
              }}
              transition={{
                duration: 12 + (i % 5) * 3,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 0.8,
              }}
              whileHover={{ scale: 1.1, opacity: 1, zIndex: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpandedSlide(slide)}
            >
              {slide?.imageUrl ? (
                <img src={slide.imageUrl} alt="" className="h-full w-full object-cover opacity-80" draggable={false} />
              ) : (
                <div className="flex h-full w-full items-center justify-center opacity-50 scale-50">
                  {slide?.icon}
                </div>
              )}
            </m.button>
          )
        })}
      </div>

      {/* Slide content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Intro label */}
        <m.p
          className="mb-7 text-[11px] uppercase tracking-[0.38em] text-white/42"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          going back in time...
        </m.p>

        <AnimatePresence mode="wait">
          <MemorySlide
            key={slideIndex}
            slide={slides[slideIndex]}
            index={slideIndex}
            onClick={() => setExpandedSlide(slides[slideIndex])}
          />
        </AnimatePresence>

        {/* Dot indicators */}
        <m.div
          className="mt-6 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {slides.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === slideIndex ? 16 : 6,
                background:
                  i <= slideIndex
                    ? 'rgba(180,210,255,0.8)'
                    : 'rgba(255,255,255,0.15)',
              }}
            />
          ))}
        </m.div>

        {/* Manual continue button — visible only after all slides played once */}
        <AnimatePresence>
          {showContinue && (
            <m.button
              key="continue-btn"
              className="mt-8 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-[11px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-md transition-colors hover:bg-white/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              onClick={() => {
                timersRef.current.forEach((id) => { window.clearInterval(id); window.clearTimeout(id) })
                onDone()
              }}
            >
              continue
            </m.button>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Image Modal */}
      <AnimatePresence>
        {expandedSlide && (
          <m.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setExpandedSlide(null)} />
            <m.div
              className="relative z-10 flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-3xl border border-white/20 bg-white/5 shadow-2xl backdrop-blur-3xl"
              initial={{ scale: 0.9, y: 20, filter: 'blur(10px)' }}
              animate={{ scale: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ scale: 0.95, y: 10, filter: 'blur(8px)' }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <div className="relative w-full aspect-[4/5] overflow-hidden bg-black/40">
                {expandedSlide.imageUrl ? (
                  <m.img
                    src={expandedSlide.imageUrl}
                    alt={expandedSlide.caption}
                    className="h-full w-full object-cover"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 4, ease: 'easeOut' }}
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-7xl opacity-80">
                    {expandedSlide.icon}
                  </div>
                )}
              </div>
              <div className="p-6 text-center">
                <p className="font-display text-xl text-white/90 leading-relaxed drop-shadow-md">
                  {expandedSlide.caption}
                </p>
                <button
                  onClick={() => setExpandedSlide(null)}
                  className="mt-6 text-[10px] uppercase tracking-[0.25em] text-white/40 hover:text-white/70"
                >
                  tap anywhere to close
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// SECRET PATH — dark, mysterious, teaser lines w/ cipher effect
// ──────────────────────────────────────────────────────────────────────────────

function SecretMicro({
  teasers,
  onDone,
}: {
  teasers: string[]
  onDone: () => void
}) {
  const [lineIndex, setLineIndex] = useState(0)
  const timersRef = useRef<number[]>([])
  const PER_LINE = 1500

  useEffect(() => {
    teasers.forEach((_, i) => {
      if (i === 0) return
      timersRef.current.push(
        window.setTimeout(() => setLineIndex(i), i * PER_LINE),
      )
    })
    timersRef.current.push(
      window.setTimeout(onDone, teasers.length * PER_LINE + 600),
    )
    return () => timersRef.current.forEach(window.clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <m.div
      className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(16px)' }}
      transition={{ duration: 0.8, ease }}
    >
      {/* Very dark purple vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(60,20,100,0.35),rgba(4,2,14,0.75)_75%)]" />

      {/* Eerie glowing orbs */}
      {[
        { x: '15%', y: '20%', c: 'rgba(140,60,255,0.28)', s: 80 },
        { x: '80%', y: '70%', c: 'rgba(80,40,200,0.22)', s: 60 },
        { x: '50%', y: '85%', c: 'rgba(100,40,180,0.2)', s: 100 },
      ].map((orb, i) => (
        <m.div
          key={i}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.s,
            height: orb.s,
            background: `radial-gradient(circle, ${orb.c} 0%, transparent 70%)`,
            translateX: '-50%',
            translateY: '-50%',
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 3 + i * 0.7,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.5,
          }}
        />
      ))}

      {/* Floating glyphs / code rain — subtle */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-25">
        {Array.from({ length: 8 }, (_, i) => (
          <m.div
            key={i}
            className="absolute font-mono text-[11px] text-purple-300/70"
            style={{ left: `${8 + i * 12}%`, top: '-5%' }}
            animate={{ y: [0, '110vh'], opacity: [0, 0.6, 0] }}
            transition={{
              duration: 5 + Math.random() * 4,
              repeat: Infinity,
              ease: 'linear',
              delay: i * 0.6,
            }}
          >
            {['✦', '◈', '⟡', '⬡', '◇', '⊕', '⊗', '⋮'][i]}
          </m.div>
        ))}
      </div>

      {/* Teaser text */}
      <div className="relative z-10 px-10 text-center">
        <AnimatePresence mode="wait">
          <m.div key={lineIndex} className="flex flex-col items-center gap-4">
            {/* Lock icon on first line */}
            {lineIndex === 0 && (
              <m.div
                className="flex justify-center text-purple-400"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 18 }}
              >
                <Lock className="w-8 h-8" />
              </m.div>
            )}

            <m.p
              className="font-display text-2xl leading-snug text-white/90 sm:text-3xl"
              style={{
                textShadow:
                  '0 0 30px rgba(180,100,255,0.55), 0 0 60px rgba(120,60,220,0.2)',
                letterSpacing: '0.02em',
              }}
              initial={{ opacity: 0, y: 16, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
              transition={{ duration: 0.65, ease }}
            >
              {teasers[lineIndex]}
            </m.p>

            {/* Last line — extra emphasis */}
            {lineIndex === teasers.length - 1 && (
              <m.div
                className="mt-2 text-[10px] uppercase tracking-[0.4em] text-purple-300/60"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                the mystery unfolds...
              </m.div>
            )}
          </m.div>
        </AnimatePresence>

        {/* Heartbeat-style line indicators */}
        <m.div
          className="mt-10 flex items-center justify-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {teasers.map((_, i) => (
            <m.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === lineIndex ? 6 : 4,
                height: i === lineIndex ? 6 : 4,
                background:
                  i <= lineIndex
                    ? 'rgba(180,100,255,0.8)'
                    : 'rgba(255,255,255,0.12)',
                boxShadow:
                  i === lineIndex ? '0 0 8px rgba(180,100,255,0.6)' : 'none',
              }}
              transition={{ duration: 0.3, ease }}
            />
          ))}
        </m.div>
      </div>
    </m.div>
  )
}

// ─── Exported router ──────────────────────────────────────────────────────────

export function PathMicroExperience({
  choice,
  content,
  onDone,
}: MicroExperienceProps) {
  return (
    <AnimatePresence mode="wait">
      {choice === 'fun' && (
        <SoloCardsMicro key="fun" cards={content.fun.cards} onDone={onDone} />
      )}
      {choice === 'memories' && (
        <MemoriesMicro key="memories" slides={content.memories.slides} onDone={onDone} />
      )}
      {choice === 'secret' && (
        <SecretMicro key="secret" teasers={content.secret.teasers} onDone={onDone} />
      )}
    </AnimatePresence>
  )
}
