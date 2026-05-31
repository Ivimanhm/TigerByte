import { ArrowLeft, Wrench } from 'lucide-preact'
import { Footer } from '../../../components/layout/Footer'
import { HUDBackground } from '../../../components/effects/HUDBackground'
import { Navbar } from '../../../components/layout/Navbar'
import { GlassPanel } from '../../../components/ui/GlassPanel'

interface GameOptionPlaceholderProps {
  gameName: string
  optionName: string
}

export function GameOptionPlaceholder({ gameName, optionName }: GameOptionPlaceholderProps) {
  return (
    <div class="relative pb-10">
      <HUDBackground />
      <Navbar />
      <main class="mx-auto w-[min(98%,1800px)] space-y-6 pt-7">
        <a
          href="#"
          class="modern-btn inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-violet transition hover:text-text"
        >
          <ArrowLeft size={15} />
          Volver al inicio
        </a>

        <GlassPanel class="p-6">
          <div class="mb-4 inline-flex items-center gap-2 rounded-lg bg-violet/16 px-3 py-1.5 text-xs font-semibold uppercase text-violet shadow-[inset_0_0_0_1px_rgba(142,107,255,0.16)]">
            <Wrench size={14} />
            En desarrollo
          </div>
          <h1 class="mb-2 text-3xl text-violet">{optionName}</h1>
          <p class="mb-4 text-muted">{gameName}</p>

          <div class="tb-subpanel p-4 text-sm text-muted">
            Esta herramienta se hara proximamente.
          </div>
        </GlassPanel>
      </main>
      <Footer />
    </div>
  )
}
