import { ChevronRight } from 'lucide-preact'
import { GlassPanel } from '../../components/ui/GlassPanel'

const shortcuts = ['Funciones principales', 'Configuracion', 'Guias', 'Solucion de problemas']

export function ShortcutsSection() {
  return (
    <GlassPanel class="reveal p-6">
      <h3 class="mb-5 text-2xl">Accesos rapidos</h3>
      <ul class="space-y-2 text-sm">
        {shortcuts.map((item) => (
          <li>
            <button type="button" class="flex w-full items-center justify-between rounded-lg border border-cyan/15 px-3 py-2 text-left text-muted transition hover:translate-x-1 hover:border-cyan/45 hover:text-text">
              {item}
              <ChevronRight size={15} class="text-cyan" />
            </button>
          </li>
        ))}
      </ul>
    </GlassPanel>
  )
}
