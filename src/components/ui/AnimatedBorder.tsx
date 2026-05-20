interface AnimatedBorderProps {
  tone?: 'cyan' | 'violet' | 'orange' | 'green'
}

export function AnimatedBorder({ tone = 'cyan' }: AnimatedBorderProps) {
  const toneClass = {
    cyan: 'from-cyan/30',
    violet: 'from-violet/35',
    orange: 'from-rust/35',
    green: 'from-emerald-400/35',
  }[tone]

  return (
    <div class="pointer-events-none absolute inset-0 rounded-panel overflow-hidden">
      <div class={`absolute inset-0 bg-gradient-to-r ${toneClass} via-transparent to-transparent opacity-80`} />
    </div>
  )
}
