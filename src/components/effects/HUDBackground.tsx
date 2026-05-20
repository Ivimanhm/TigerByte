export function HUDBackground() {
  return (
    <div class="pointer-events-none fixed inset-0 -z-10 hud-grid scanlines">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(56,189,248,0.18),transparent_30%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(139,92,246,0.18),transparent_30%)]" />
    </div>
  )
}
