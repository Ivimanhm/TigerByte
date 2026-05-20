export function FloatingParticles() {
  const points = Array.from({ length: 18 }, (_, i) => i)

  return (
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {points.map((point) => (
        <span
          key={point}
          class="absolute h-1 w-1 rounded-full bg-cyan/50 animate-pulse"
          style={{
            left: `${(point * 13) % 100}%`,
            top: `${(point * 17) % 100}%`,
            animationDelay: `${point * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}
