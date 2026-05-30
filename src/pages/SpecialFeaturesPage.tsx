import { ArrowLeft, Sparkles } from 'lucide-preact'
import { Footer } from '../components/layout/Footer'
import { HUDBackground } from '../components/effects/HUDBackground'
import { Navbar } from '../components/layout/Navbar'
import { GlassPanel } from '../components/ui/GlassPanel'

export function SpecialFeaturesPage() {
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
            <Sparkles size={14} />
            Proximamente
          </div>
          <h1 class="mb-3 text-3xl">Funciones especiales</h1>
          <p class="text-muted">
            Esta seccion ya esta creada y preparada. En el siguiente paso iremos metiendo las funcionalidades avanzadas.
          </p>
        </GlassPanel>
      </main>
      <Footer />
    </div>
  )
}
