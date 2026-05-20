import { Gamepad2 } from 'lucide-preact'
import { GlowButton } from '../ui/GlowButton'

const navItems = ['Inicio', 'Herramientas', 'Estado', 'Actualizaciones']

export function Navbar() {
  return (
    <header class="sticky top-0 z-20 border-b border-cyan/20 bg-bg/60 backdrop-blur-md">
      <nav class="mx-auto flex w-[min(96%,1600px)] items-center justify-between py-4">
        <div class="flex items-center gap-3">
          <span class="rounded-lg border border-violet/50 bg-violet/20 p-2">
            <Gamepad2 size={18} class="text-violet" />
          </span>
          <strong class="logo-font text-lg">Gamekit</strong>
        </div>
        <ul class="hidden items-center gap-7 text-sm text-muted lg:flex">
          {navItems.map((item) => (
            <li class="cursor-pointer border-b-2 border-transparent pb-1 transition hover:border-violet hover:text-text">
              {item}
            </li>
          ))}
        </ul>
        <GlowButton>Abrir App</GlowButton>
      </nav>
    </header>
  )
}
