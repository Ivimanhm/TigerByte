import { Gamepad2 } from 'lucide-preact'

export function Footer({ className = 'mt-8' }: { className?: string }) {
  return (
    <footer class={`mx-auto flex w-[min(98%,1800px)] items-center justify-between border-t border-cyan/15 py-4 text-sm text-muted ${className}`}>
      <div class="flex items-center gap-2">
        <Gamepad2 size={16} class="text-violet" />
        <span>TigerByte</span>
      </div>
      <p>Herramienta privada para el squad.</p>
    </footer>
  )
}
