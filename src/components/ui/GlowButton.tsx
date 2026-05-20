import type { ComponentChildren } from 'preact'
import { cn } from '../../utils/cn'

interface GlowButtonProps {
  children: ComponentChildren
  variant?: 'primary' | 'ghost'
}

export function GlowButton({ children, variant = 'primary' }: GlowButtonProps) {
  return (
    <button
      type="button"
      class={cn(
        'rounded-panel border px-6 py-3 text-sm font-semibold transition duration-300',
        variant === 'primary'
          ? 'border-cyan/50 bg-gradient-to-r from-electric to-violet text-white shadow-violet hover:scale-[1.02]'
          : 'border-cyan/40 bg-transparent text-text hover:border-cyan/70 hover:bg-cyan/5 hover:shadow-glow',
      )}
    >
      {children}
    </button>
  )
}
