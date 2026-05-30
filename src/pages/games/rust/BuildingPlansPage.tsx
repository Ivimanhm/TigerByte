import { useState } from 'preact/hooks'
import { ArrowRight, CircleHelp, Clock3, Eye, House, Layers3, MapPin, Shield, X } from 'lucide-preact'
import { Footer } from '../../../components/layout/Footer'
import { Navbar } from '../../../components/layout/Navbar'
import { GlassPanel } from '../../../components/ui/GlassPanel'

import imgFootprint from '../../../assets/games/rust/Footprint.png'
import imgStarter1 from '../../../assets/games/rust/Starter 1.png'
import imgStarter2 from '../../../assets/games/rust/Starter 2.png'
import imgStarter3 from '../../../assets/games/rust/Starter 3.png'
import imgStarter4 from '../../../assets/games/rust/Starter 4.png'
import imgCompound1 from '../../../assets/games/rust/Compound 1.png'
import imgCompound2 from '../../../assets/games/rust/Compound 2.png'
import imgCompound3 from '../../../assets/games/rust/Compound 3.png'
import imgCompound4 from '../../../assets/games/rust/Compound 4.png'
import imgCompound5 from '../../../assets/games/rust/Compound 5.png'
import imgDentro1 from '../../../assets/games/rust/Dentro 1.png'
import imgDentro2 from '../../../assets/games/rust/Dentro 2.png'
import heroImage from '../../../assets/games/RUST 2.png'

type GuideImage = {
  src: string
  label: string
  metal?: string
  time?: string
}

type GuideSection = {
  id: string
  title: string
  short: string
  description: string
  difficulty: string
  detailsCta: string
  details: string[]
  keyInfo?: Array<{ icon: preact.ComponentChildren; label: string; value: string }>
  images: GuideImage[]
}

const sections: GuideSection[] = [
  {
    id: 'footprint',
    title: 'Footprint',
    short: 'Vista general del footprint de la base.',
    description: 'Referencia de espacio ocupado y distribucion de habitaciones.',
    difficulty: 'Basica',
    detailsCta: 'Ver detalles',
    details: [
      'El footprint circular reparte entradas y habitaciones alrededor del nucleo para que ninguna zona quede demasiado expuesta.',
      'Funciona mejor si el TC y el loot principal quedan centrados, con accesos separados para cortar raids lineales.',
      'Para 3-6 jugadores, conviene reservar una zona de respawn y otra de almacenamiento antes de cerrar el compound.',
    ],
    keyInfo: [
      { icon: <Layers3 size={15} />, label: 'Diseno', value: 'Circulo' },
      { icon: <Shield size={15} />, label: 'Entradas', value: '3' },
      { icon: <House size={15} />, label: 'Jugadores', value: '3-6 personas' },
      { icon: <MapPin size={15} />, label: 'Expansion', value: 'Media - Alta' },
    ],
    images: [{ src: imgFootprint, label: 'Footprint base' }],
  },
  {
    id: 'starter',
    title: 'Base Starter',
    short: 'Diseno antes del compound.',
    description: 'Eficientes en materiales y faciles de defender en early game.',
    difficulty: 'Facil',
    detailsCta: 'Ver detalles',
    details: [
      'Prioriza coste bajo, cierre rapido y rutas simples para moverte sin perder tiempo durante el early wipe.',
      'La primera mejora deberia ser asegurar puertas, airlocks y un loot room separado del acceso principal.',
      'Usala como modulo inicial si quieres escalar despues hacia interior completo o compound.',
    ],
    images: [
      { src: imgStarter1, label: '2x2 Starter', metal: '4.5k metal', time: '~30 min' },
      { src: imgStarter2, label: 'Compacta', metal: '6k metal', time: '~40 min' },
      { src: imgStarter3, label: 'Economica', metal: '5k metal', time: '~35 min' },
      { src: imgStarter4, label: 'Con expansion', metal: '7k metal', time: '~45 min' },
    ],
  },
  {
    id: 'interior',
    title: 'Interior',
    short: 'Subidas y zonas de pikeo.',
    description: 'Almacenamiento y puntos de defensa.',
    difficulty: 'Media',
    detailsCta: 'Ver detalles',
    details: [
      'El interior debe separar loot, respawns y zonas de defensa para que una sola brecha no entregue toda la base.',
      'Deja pasos claros entre camas, cajas y hornos; si el recorrido molesta en calma, en raid sera peor.',
      'Los puntos de defensa funcionan mejor cuando cubren entradas y escaleras sin bloquear la circulacion del equipo.',
    ],
    images: [
      { src: imgDentro1, label: 'Interior compacto' },
      { src: imgDentro2, label: 'Interior extendido' },
    ],
  },
  {
    id: 'compound',
    title: 'Base Compound',
    short: 'Disenos de compound para mid/late game.',
    description: 'Mayor proteccion, bunker integrado y capacidad de almacenamiento.',
    difficulty: 'Media',
    detailsCta: 'Ver detalles',
    details: [
      'El compound protege furnaces, refinerias y movilidad exterior, pero necesita puertas bien repartidas para no encerrarte.',
      'Coloca entradas con angulos distintos: reduce campings y hace mas dificil controlar todo desde una unica posicion.',
      'Antes de ampliar, confirma que el upkeep y las rutas internas siguen siendo sostenibles para tu grupo.',
    ],
    images: [
      { src: imgCompound1, label: 'Triple muro' },
      { src: imgCompound2, label: 'Hex defensivo' },
      { src: imgCompound3, label: 'Bunker central' },
      { src: imgCompound4, label: 'Zona mixta' },
      { src: imgCompound5, label: 'Macro compound' },
    ],
  },
]

const NOTES_STORAGE_KEY = 'tb_rust_building_plans_notes'

function loadNotes() {
  return localStorage.getItem(NOTES_STORAGE_KEY) || ''
}

function saveNotes(notes: string) {
  localStorage.setItem(NOTES_STORAGE_KEY, notes)
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function BuildingPlansPage() {
  const [lightbox, setLightbox] = useState<{ src: string; label: string } | null>(null)
  const [activeId, setActiveId] = useState(sections[0].id)
  const [notes, setNotes] = useState(() => loadNotes())
  const [guideOpen, setGuideOpen] = useState(false)
  const [detailsSection, setDetailsSection] = useState<GuideSection | null>(null)
  const [designsSection, setDesignsSection] = useState<GuideSection | null>(null)

  function handleNav(id: string) {
    setActiveId(id)
    scrollToSection(id)
  }

  return (
    <div class="relative min-h-screen pb-10">
      <Navbar />

      {lightbox ? (
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            class="absolute right-5 top-5 rounded-full border border-white/20 bg-white/10 p-2 text-white transition hover:bg-white/20"
            onClick={() => setLightbox(null)}
          >
            <X size={20} />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.label}
            class="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <p class="absolute bottom-5 text-sm text-white/60">{lightbox.label}</p>
        </div>
      ) : null}

      {guideOpen ? <GuideModal onClose={() => setGuideOpen(false)} /> : null}
      {detailsSection ? <DetailsModal section={detailsSection} onClose={() => setDetailsSection(null)} /> : null}
      {designsSection ? (
        <DesignsModal
          section={designsSection}
          onOpenImage={(image) => setLightbox(image)}
          onClose={() => setDesignsSection(null)}
        />
      ) : null}

      <main class="mx-auto w-[min(98%,1800px)] pt-7">
        <div class="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside class="hidden xl:block">
            <div class="sticky top-20 space-y-5">
              <GlassPanel class="rounded-2xl p-4">
                <div class="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-rust">
                  <MapPin size={13} />
                  Indice
                </div>
                <nav class="space-y-1">
                  {sections.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleNav(s.id)}
                      class={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-3 text-left text-sm transition ${
                        activeId === s.id
                          ? 'border-rust/40 bg-rust/20 text-text'
                          : 'border-transparent text-muted hover:border-rust/20 hover:bg-rust/8 hover:text-text'
                      }`}
                    >
                      <span class={`text-xs font-medium ${activeId === s.id ? 'text-rust' : 'text-muted'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {s.title}
                      <ArrowRight size={14} class={`ml-auto ${activeId === s.id ? 'text-rust' : 'text-muted/60'}`} />
                    </button>
                  ))}
                </nav>
              </GlassPanel>

              <GlassPanel class="rounded-2xl p-5">
                <div class="mb-3 flex items-center gap-2 text-xl font-semibold text-rust">
                  <CircleHelp size={18} />
                  <span>Necesitas ayuda?</span>
                </div>
                <p class="mb-4 text-muted">Aprende los conceptos basicos de construccion en Rust.</p>
                <button
                  type="button"
                  onClick={() => setGuideOpen(true)}
                  class="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rust/35 bg-rust/12 px-4 py-3 text-sm font-semibold text-rust transition hover:bg-rust/18"
                >
                  Ver guia completa
                  <ArrowRight size={14} />
                </button>
              </GlassPanel>

              <GlassPanel class="rounded-2xl p-5">
                <h2 class="mb-3 text-xs font-semibold uppercase tracking-widest text-rust">Notas</h2>
                <textarea
                  value={notes}
                  onInput={(event) => {
                    const nextNotes = event.currentTarget.value
                    setNotes(nextNotes)
                    saveNotes(nextNotes)
                  }}
                  placeholder="Apunta materiales, cambios para tu squad o mejoras pendientes..."
                  maxLength={700}
                  class="field-control min-h-[260px] w-full resize-none rounded-xl px-3 py-3 text-sm text-text"
                />
                <p class="mt-2 text-right text-xs text-muted">{notes.length}/700</p>
              </GlassPanel>
            </div>
          </aside>

          <div class="min-w-0 flex-1 space-y-6 pb-10">
            <GlassPanel class="relative overflow-hidden rounded-2xl p-6 md:p-8">
              <div class="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-cover bg-[64%_48%] opacity-45 md:block" style={{ backgroundImage: `url("${heroImage}")` }} />
              <div class="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#030916]/6 via-[#030916]/18 to-[#030916]/72 md:block" />
              <div class="relative">
                <div class="mb-2 text-sm text-muted">Rust &gt; Planos de construccion &gt; Interior</div>
                <h1 class="mb-1 mt-3 text-3xl font-bold md:text-6xl">Planos de construccion</h1>
                <p class="text-muted">Guia visual de disenos de bases: starter, compound e interiores.</p>
              </div>
            </GlassPanel>

            {sections.map((section, idx) => (
              <GlassPanel key={section.id} id={section.id} class="scroll-mt-24 rounded-2xl p-6">
                <div class="mb-5 flex flex-wrap items-start justify-between gap-4">
                  <div class="flex min-w-0 items-start gap-3">
                    <div class="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-rust/45 text-lg font-semibold text-rust">
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h2 class="text-3xl font-semibold text-rust">{section.title}</h2>
                      
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="text-sm text-muted">Dificultad</div>
                    <span class="rounded-lg border border-emerald-500/30 bg-emerald-500/12 px-2.5 py-1 text-sm font-semibold text-emerald-300">
                      {section.difficulty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDetailsSection(section)}
                      class="inline-flex items-center gap-2 rounded-xl border border-rust/35 bg-rust/12 px-4 py-2.5 text-sm font-semibold text-text transition hover:bg-rust/20"
                    >
                      <Eye size={15} class="text-rust" />
                      {section.detailsCta}
                    </button>
                  </div>
                </div>

                {section.id === 'footprint' ? (
                  <div class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_34%]">
                    <button
                      type="button"
                      class="relative overflow-hidden rounded-xl border border-rust/20 bg-bg/50 transition hover:border-rust/50"
                      onClick={() => setLightbox(section.images[0])}
                    >
                      <div class="relative w-full" style="aspect-ratio: 16/9">
                        <img
                          src={section.images[0].src}
                          alt={section.images[0].label}
                          class="absolute inset-0 h-full w-full object-contain"
                        />
                      </div>
                    </button>

                    <div class="rounded-xl border border-rust/20 bg-[#070f23]/80 p-4">
                      <h3 class="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-rust">Informacion clave</h3>
                      <div class="space-y-3">
                        {section.keyInfo?.map((item) => (
                          <div key={item.label} class="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                            <div class="grid h-8 w-8 place-items-center rounded-lg border border-rust/25 bg-rust/10 text-rust">
                              {item.icon}
                            </div>
                            <div>
                              <p class="text-sm text-muted">{item.label}</p>
                              <p class="text-sm font-semibold text-text">{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div class={`grid gap-4 ${section.id === 'compound' ? 'sm:grid-cols-2 xl:grid-cols-5' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
                      {section.images.map((img) => (
                        <button
                          key={img.label}
                          type="button"
                          class="group overflow-hidden rounded-xl border border-rust/20 bg-bg/50 text-left transition hover:border-rust/50"
                          onClick={() => setLightbox(img)}
                        >
                          <div class="relative">
                            <img src={img.src} alt={img.label} class="h-[150px] w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                          </div>
                          <div class="flex items-center justify-between border-t border-white/5 px-3 py-2 text-xs">
                            <span class="inline-flex items-center gap-1.5 text-muted">
                              <House size={12} />
                              {img.metal ?? 'Build Rust'}
                            </span>
                            <span class="inline-flex items-center gap-1.5 text-muted">
                              <Clock3 size={12} />
                              {img.time ?? '~40 min'}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                    <div class="mt-4 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setDesignsSection(section)}
                        class="inline-flex min-w-[320px] items-center justify-center gap-2 rounded-xl border border-rust/35 bg-rust/12 px-6 py-3 text-sm font-semibold text-text transition hover:bg-rust/20"
                      >
                        Ver mas disenos de {section.title}
                        <ArrowRight size={14} class="text-rust" />
                      </button>
                    </div>
                  </>
                )}
              </GlassPanel>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function GuideModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalShell title="Guia completa" subtitle="Flujo recomendado para convertir estos planos en una base jugable." onClose={onClose}>
      <div class="grid gap-3 md:grid-cols-2">
        <GuideStep
          title="1. Empieza por el footprint"
          text="Define el diseno, las entradas y el tamano del grupo antes de colocar loot o decoracion. Si el footprint no respira bien, el resto se sentira apretado."
        />
        <GuideStep
          title="2. Cierra una starter funcional"
          text="Prioriza TC, airlock, respawn y cajas basicas. La starter debe sobrevivir al primer tramo del wipe sin gastar mas recursos de los necesarios."
        />
        <GuideStep
          title="3. Ordena el interior"
          text="Separa loot principal, kits, hornos y camas. Mantener rutas limpias hace que defender, reparar y rearmarse sea mucho mas rapido."
        />
        <GuideStep
          title="4. Escala al compound"
          text="Cuando el nucleo ya funciona, anade compound para controlar furnaces, movilidad exterior y entradas alternativas sin disparar demasiado el upkeep."
        />
      </div>
    </ModalShell>
  )
}

function DetailsModal({ section, onClose }: { section: GuideSection; onClose: () => void }) {
  return (
    <ModalShell title={section.title} subtitle={`${section.difficulty} - ${section.short}`} onClose={onClose}>
      <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div class="space-y-3">
          {section.details.map((detail) => (
            <div key={detail} class="rounded-xl border border-white/5 bg-white/[0.03] p-4 text-sm leading-6 text-muted">
              {detail}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            onClose()
            window.setTimeout(() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
          }}
          class="self-start rounded-xl border border-rust/35 bg-rust/12 px-4 py-3 text-left text-sm font-semibold text-text transition hover:bg-rust/20"
        >
          <span class="block text-rust">Ir a la seccion</span>
          <span class="mt-1 block text-xs font-normal text-muted">Revisa las imagenes y datos principales de {section.title}.</span>
        </button>
      </div>
    </ModalShell>
  )
}

function DesignsModal({
  section,
  onOpenImage,
  onClose,
}: {
  section: GuideSection
  onOpenImage: (image: GuideImage) => void
  onClose: () => void
}) {
  return (
    <ModalShell title={`Disenos de ${section.title}`} subtitle={`${section.images.length} planos disponibles`} onClose={onClose}>
      <div class={`grid gap-3 ${section.images.length > 2 ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {section.images.map((image) => (
          <button
            key={image.label}
            type="button"
            onClick={() => {
              onClose()
              onOpenImage(image)
            }}
            class="group overflow-hidden rounded-xl border border-rust/20 bg-[#070f23]/90 text-left transition hover:border-rust/55"
          >
            <img src={image.src} alt={image.label} class="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
            <div class="flex items-center justify-between gap-3 border-t border-white/5 px-3 py-2 text-xs text-muted">
              <span class="truncate">{image.label}</span>
              <span>{image.time ?? 'Vista previa'}</span>
            </div>
          </button>
        ))}
      </div>
    </ModalShell>
  )
}

function GuideStep({ title, text }: { title: string; text: string }) {
  return (
    <section class="rounded-xl border border-white/5 bg-white/[0.03] p-4">
      <h3 class="mb-2 text-sm font-semibold text-text">{title}</h3>
      <p class="text-sm leading-6 text-muted">{text}</p>
    </section>
  )
}

function ModalShell({
  title,
  subtitle,
  children,
  onClose,
}: {
  title: string
  subtitle: string
  children: preact.ComponentChildren
  onClose: () => void
}) {
  return (
    <div class="fixed inset-0 z-50 grid place-items-center bg-[#01040d]/90 px-4 backdrop-blur-md" onClick={onClose}>
      <div
        class="tiger-scrollbar max-h-[88vh] w-[min(94vw,980px)] overflow-y-auto rounded-2xl bg-[#030916]/98 p-5 text-left shadow-[inset_0_0_0_1px_rgba(142,107,255,0.24),0_24px_80px_rgba(0,0,0,0.78)]"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold uppercase text-rust">{title}</h2>
            <p class="mt-1 text-sm text-muted">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b172f] text-muted transition hover:bg-[#0d1d3b] hover:text-text"
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
