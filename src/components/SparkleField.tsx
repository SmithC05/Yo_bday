import { m } from 'framer-motion'

type SparkleFieldProps = {
  count?: number
}

export function SparkleField({ count = 14 }: SparkleFieldProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, index) => {
        const left = 8 + ((index * 17) % 82)
        const top = 10 + ((index * 13) % 74)
        const size = 4 + (index % 3) * 2
        const duration = 2.8 + (index % 5) * 0.45

        return (
          <m.span
            key={index}
            className="absolute rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.85)]"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
            }}
            animate={{
              opacity: [0.25, 0.9, 0.25],
              scale: [0.85, 1.25, 0.9],
              y: [0, -8, 0],
            }}
            transition={{
              duration,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut',
              delay: index * 0.15,
            }}
          />
        )
      })}
    </div>
  )
}
