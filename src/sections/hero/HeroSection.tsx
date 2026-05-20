import { Cpu, Radar, ShieldCheck } from 'lucide-preact'
import { GlowButton } from '../../components/ui/GlowButton'
import { FloatingParticles } from '../../components/effects/FloatingParticles'

export function HeroSection() {
  return (
    <section class="reveal-group relative overflow-hidden rounded-panel border border-cyan/20 p-[clamp(1.2rem,3vw,3rem)]">
      <FloatingParticles />
      <div class="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div class="space-y-6">
          <p class="reveal inline-flex rounded-full border border-cyan/35 bg-cyan/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan">
            Todo lo que necesitas en un solo lugar
          </p>
          <h1 class="reveal text-balance text-[clamp(2.2rem,6vw,5rem)] leading-[0.96]">
            Mejora tu juego. <span class="text-violet">Domina cada partida.</span>
          </h1>
          <p class="reveal max-w-xl text-[clamp(1rem,1.7vw,1.2rem)] text-muted">
            Herramientas avanzadas, estadisticas en tiempo real y sistemas disenados para maximizar rendimiento y control.
          </p>
          <div class="reveal flex flex-wrap gap-3">
            <GlowButton>Abrir App</GlowButton>
            <GlowButton variant="ghost">Ver novedades</GlowButton>
          </div>
          <div class="reveal flex flex-wrap gap-5 text-sm text-muted">
            <span>Ligero</span>
            <span>Seguro</span>
            <span>Siempre actualizado</span>
          </div>
        </div>
        <div class="reveal relative mx-auto aspect-square w-full max-w-[520px]">
          <div class="absolute inset-0 rounded-full border border-cyan/25" />
          <div class="absolute inset-[8%] rounded-full border border-violet/30 animate-spin [animation-duration:26s]" />
          <div class="absolute inset-[18%] rounded-full border border-cyan/25 animate-spin [animation-direction:reverse] [animation-duration:20s]" />
          <div class="absolute inset-[30%] rounded-full border border-electric/35 bg-[radial-gradient(circle,rgba(56,189,248,0.24),rgba(79,70,229,0.1),transparent)] shadow-glow" />
          <div class="absolute left-[58%] top-[18%] rounded-lg border border-cyan/30 bg-bg/80 px-3 py-2 text-sm"><Radar size={14} class="mb-1 text-cyan" />Rendimiento optimizado</div>
          <div class="absolute left-[6%] top-[58%] rounded-lg border border-violet/30 bg-bg/80 px-3 py-2 text-sm"><Cpu size={14} class="mb-1 text-violet" />Sistema operativo</div>
          <div class="absolute left-[62%] top-[72%] rounded-lg border border-cyan/30 bg-bg/80 px-3 py-2 text-sm"><ShieldCheck size={14} class="mb-1 text-cyan" />Todo en orden</div>
        </div>
      </div>
    </section>
  )
}
