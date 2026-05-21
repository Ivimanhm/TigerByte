import { Gamepad2 } from 'lucide-preact'

export function Footer() {
  return (
    <footer class="mx-auto mt-8 flex w-[min(96%,1600px)] items-center justify-between border-t border-cyan/15 py-4 text-sm text-muted">
      <div class="flex items-center gap-2">
        <Gamepad2 size={16} class="text-violet" />
        <span>TigerByte</span>
      </div>
      <p>Herramienta privada para el squad.</p>
    </footer>
  )
}
