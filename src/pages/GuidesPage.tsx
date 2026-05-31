import { ArrowLeft, BookOpen, Crosshair, ShieldCheck, Wrench } from 'lucide-preact'
import { Footer } from '../components/layout/Footer'
import { HUDBackground } from '../components/effects/HUDBackground'
import { Navbar } from '../components/layout/Navbar'
import { GlassPanel } from '../components/ui/GlassPanel'

const guides = [
  {
    title: 'Setup inicial en 5 minutos',
    icon: Wrench,
    steps: [
      'Abre la app y verifica que el repositorio y la base de datos estén operativos.',
      'Revisa la sección de actualizaciones para confirmar que usas la versión actual.',
      'Configura tus accesos rápidos según el juego que uses más.',
    ],
  },
  {
    title: 'Checklist antes de jugar',
    icon: ShieldCheck,
    steps: [
      'Comprueba que el estado del sistema esté en verde.',
      'Carga tus presets o herramientas del juego correspondiente.',
      'Haz una prueba rápida para validar que todo responde.',
    ],
  },
  {
    title: 'Optimización de rendimiento',
    icon: Crosshair,
    steps: [
      'Cierra procesos en segundo plano que no uses.',
      'Mantén solo las herramientas necesarias abiertas durante partida.',
      'Si notas lag, reinicia la app y vuelve a cargar el preset.',
    ],
  },
]

export function GuidesPage() {
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
            <BookOpen size={14} />
            Guias de uso
          </div>
          <h1 class="mb-2 text-3xl text-violet">Guías rápidas</h1>
          <p class="mb-6 text-muted">Una colección de pasos simples para que todo funcione fino en menos tiempo.</p>

          <div class="grid gap-4 md:grid-cols-3">
            {guides.map((guide) => {
              const Icon = guide.icon
              return (
                <section class="tb-subpanel p-4">
                  <h2 class="mb-3 inline-flex items-center gap-2 text-lg text-violet">
                    <Icon size={16} class="text-violet" />
                    {guide.title}
                  </h2>
                  <ol class="space-y-2 text-sm text-muted">
                    {guide.steps.map((step, idx) => (
                      <li>
                        <span class="mr-2 text-violet">{idx + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </section>
              )
            })}
          </div>
        </GlassPanel>
      </main>
      <Footer />
    </div>
  )
}
