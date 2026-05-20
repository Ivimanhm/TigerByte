import { ChevronRight } from 'lucide-preact'
import { GlassPanel } from '../../components/ui/GlassPanel'

const shortcuts = [
  { label: 'Funciones principales', href: '#special-features' },
  { label: 'Configuracion', href: '#config' },
  { label: 'Guias', href: '#guides' },
  { label: 'Solucion de problemas', href: '#troubleshooting' },
]

export function ShortcutsSection() {
  return (
    <GlassPanel class="reveal p-6">
      <h3 class="mb-5 text-2xl">Accesos rapidos</h3>
      <ul class="space-y-2 text-sm">
        {shortcuts.map((item) => (
          <li>
            <a
              href={item.href}
              class="modern-btn flex min-h-[42px] w-full items-center justify-between rounded-lg px-3 py-2 text-left text-muted transition hover:translate-x-1 hover:text-text"
            >
              {item.label}
              <ChevronRight size={15} class="text-cyan" />
            </a>
          </li>
        ))}
      </ul>
    </GlassPanel>
  )
}



