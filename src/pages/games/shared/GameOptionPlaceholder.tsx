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
          class="modern-btn inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-cyan transition hover:text-text"
        >
          <ArrowLeft size={15} />
          Volver al inicio
        </a>

        <GlassPanel class="p-6">
          <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs text-cyan">
            <Wrench size={14} />
            En desarrollo
          </div>
          <h1 class="mb-2 text-3xl">{optionName}</h1>
          <p class="mb-4 text-muted">{gameName}</p>

          <div class="rounded-panel border border-cyan/20 bg-bg/45 p-4 text-sm text-muted">
            Esta herramienta se hara proximamente.
          </div>
        </GlassPanel>
      </main>
      <Footer />
    </div>
  )
}
