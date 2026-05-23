import { ArrowLeft, Wrench } from 'lucide-preact'
import { Footer } from '../components/layout/Footer'
import { HUDBackground } from '../components/effects/HUDBackground'
import { Navbar } from '../components/layout/Navbar'
import { GlassPanel } from '../components/ui/GlassPanel'

interface GameToolsPageProps {
  gameName: string
  subtitle: string
  features: string[]
}

export function GameToolsPage({ gameName, subtitle, features }: GameToolsPageProps) {
  return (
    <div class="relative pb-10">
      <HUDBackground />
      <Navbar />
      <main class="mx-auto w-[min(96%,1000px)] space-y-6 pt-7">
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
            Herramientas en desarrollo
          </div>
          <h1 class="mb-2 text-3xl">{gameName}</h1>
          <p class="mb-6 text-muted">{subtitle}</p>

          <div class="rounded-panel border border-cyan/20 bg-bg/45 p-4">
            <h2 class="mb-3 text-lg">Funciones previstas</h2>
            <ul class="space-y-2 text-sm text-muted">
              {features.map((feature) => (
                <li class="rounded-md border border-cyan/15 bg-bg/35 px-3 py-2">{feature}</li>
              ))}
            </ul>
          </div>
        </GlassPanel>
      </main>
      <Footer />
    </div>
  )
}
