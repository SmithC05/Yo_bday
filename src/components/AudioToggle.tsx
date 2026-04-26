type AudioToggleProps = {
  isEnabled: boolean
  onToggle: () => void
}

export function AudioToggle({ isEnabled, onToggle }: AudioToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/85 backdrop-blur-xl transition duration-300 hover:bg-white/14 active:scale-[0.98]"
    >
      sound {isEnabled ? 'on' : 'off'}
    </button>
  )
}
