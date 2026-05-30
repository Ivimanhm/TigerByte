import { ArrowLeft, AlertTriangle } from 'lucide-preact'
import { Footer } from '../components/layout/Footer'
import { HUDBackground } from '../components/effects/HUDBackground'
import { Navbar } from '../components/layout/Navbar'
import { GlassPanel } from '../components/ui/GlassPanel'
import memeSysadmin from '../assets/troubleshooting/meme_sysadmin.png'

export function TroubleshootingPage() {
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
          <div class="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-300/35 bg-orange-300/10 px-3 py-1 text-xs text-orange-300">
            <AlertTriangle size={14} />
            Soporte tecnico nivel dios
          </div>
          <div class="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <h1 class="mb-3 text-3xl">Solucion de problemas</h1>
              <p class="text-lg text-muted">
                Si algo falla, tranquilo: soy el administrador... y ni yo se que acaba de pasar.
              </p>
              <p class="mt-3 text-sm text-muted">
                Plan oficial: reiniciar, mirar logs con cara seria, y esperar que funcione a la segunda.
              </p>
            </div>
            <img
              src={memeSysadmin}
              alt="Meme del admin cuando algo falla"
              class="w-full max-w-[360px] justify-self-start rounded-panel border border-cyan/20 object-contain lg:justify-self-end"
            />
          </div>
        </GlassPanel>
      </main>
      <Footer />
    </div>
  )
}

