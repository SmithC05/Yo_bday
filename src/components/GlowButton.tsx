import type { ButtonHTMLAttributes, ReactNode } from 'react'

type GlowButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  subtle?: boolean
}

export function GlowButton({ children, className = '', subtle = false, ...props }: GlowButtonProps) {
  return (
    <button
      {...props}
      className={[
        'inline-flex items-center justify-center rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.3em] transition duration-300 active:scale-[0.98]',
        subtle
          ? 'border border-white/14 bg-white/10 text-white/82 backdrop-blur-xl hover:bg-white/16'
          : 'border border-white/20 bg-white/18 text-white shadow-[0_12px_40px_rgba(255,160,214,0.24)] backdrop-blur-2xl hover:bg-white/24',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  )
}
