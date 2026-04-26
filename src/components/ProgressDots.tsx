type ProgressDotsProps = {
  activeIndex: number
  total: number
}

export function ProgressDots({ activeIndex, total }: ProgressDotsProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={[
            'h-2 rounded-full transition-all duration-500',
            index === activeIndex ? 'w-6 bg-white/90' : 'w-2 bg-white/28',
          ].join(' ')}
        />
      ))}
    </div>
  )
}
