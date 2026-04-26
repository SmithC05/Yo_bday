import { m } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useMemo } from 'react'

type FloatingHeartsProps = {
  count?: number
}

type HeartParticle = {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  opacity: number
  drift: number
  type: 'heart' | 'glow'
}

const HEART_SVG = (size: number, opacity: number) => (
  <Heart
    size={size}
    fill="currentColor"
    style={{ opacity }}
    strokeWidth={1.5}
  />
)

export function FloatingHearts({ count = 20 }: FloatingHeartsProps) {
  const particles = useMemo<HeartParticle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      const isGlow = i % 5 === 0
      return {
        id: i,
        left: Math.random() * 100,
        size: isGlow ? 3 + Math.random() * 4 : 10 + Math.random() * 14,
        duration: 6 + Math.random() * 8,
        delay: Math.random() * 6,
        opacity: isGlow ? 0.3 + Math.random() * 0.4 : 0.08 + Math.random() * 0.18,
        drift: -30 + Math.random() * 60,
        type: isGlow ? 'glow' : 'heart',
      }
    })
  }, [count])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <m.div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            bottom: '-8%',
            color:
              p.type === 'glow'
                ? 'rgba(255, 255, 255, 0.8)'
                : p.id % 3 === 0
                  ? 'rgba(255, 140, 200, 0.6)'
                  : p.id % 3 === 1
                    ? 'rgba(200, 140, 255, 0.5)'
                    : 'rgba(160, 180, 255, 0.4)',
          }}
          animate={{
            y: [0, -(typeof window !== 'undefined' ? window.innerHeight + 100 : 900)],
            x: [0, p.drift],
            rotate: [0, p.drift > 0 ? 20 : -20],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: p.delay,
            times: [0, 0.1, 0.8, 1],
          }}
        >
          {p.type === 'glow' ? (
            <span
              className="block rounded-full"
              style={{
                width: p.size,
                height: p.size,
                background: 'currentColor',
                boxShadow: '0 0 12px currentColor',
              }}
            />
          ) : (
            HEART_SVG(p.size, 1)
          )}
        </m.div>
      ))}
    </div>
  )
}
