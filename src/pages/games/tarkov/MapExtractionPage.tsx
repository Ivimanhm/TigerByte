import { useEffect, useMemo, useState } from 'preact/hooks'
import { ChevronDown, Clock3, Compass, ExternalLink, Layers3, MapPinned, Search, Users, X } from 'lucide-preact'
import { HUDBackground } from '../../../components/effects/HUDBackground'
import { Footer } from '../../../components/layout/Footer'
import { Navbar } from '../../../components/layout/Navbar'
import { GlassPanel } from '../../../components/ui/GlassPanel'

type TarkovMapImage = {
  label: string
  src: string
  kind: '2D' | '3D'
}

type TarkovMap = {
  id: string
  name: string
  description: string
  players: string
  raidDuration: number
  wiki: string
  images: TarkovMapImage[]
}

const img = (file: string) => `/tarkov/maps/${file}`

const maps: TarkovMap[] = [
  {
    id: 'customs',
    name: 'Customs',
    description: 'Zona industrial con terminal, dorms, gasolineras y rutas largas entre ambos lados del mapa.',
    players: '10-12',
    raidDuration: 35,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/Customs',
    images: [
      { label: 'Customs 2D', src: img('customs-2d.jpg'), kind: '2D' },
      { label: 'Customs 3D', src: img('customs-3d.jpg'), kind: '3D' },
      { label: 'Dorms 3D', src: img('customs-3d-dorms.jpg'), kind: '3D' },
    ],
  },
  {
    id: 'woods',
    name: 'Woods',
    description: 'Reserva abierta con mucha distancia visual, bosques densos y rutas de extraccion en bordes opuestos.',
    players: '10-14',
    raidDuration: 35,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/Woods',
    images: [
      { label: 'Woods 2D', src: img('woods-2d.jpg'), kind: '2D' },
      { label: 'Woods 3D', src: img('woods-3d.jpg'), kind: '3D' },
    ],
  },
  {
    id: 'lighthouse',
    name: 'Lighthouse',
    description: 'Costa vertical con chalets, carretera principal, planta de tratamiento y rutas peligrosas por Rogue territory.',
    players: '10-12',
    raidDuration: 40,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/Lighthouse',
    images: [
      { label: 'Lighthouse 2D', src: img('lighthouse-2d.jpg'), kind: '2D' },
      { label: 'Lighthouse 2D landscape', src: img('lighthouse-2d-landscape.jpg'), kind: '2D' },
      { label: 'Lighthouse 3D', src: img('lighthouse-3d.jpg'), kind: '3D' },
    ],
  },
  {
    id: 'shoreline',
    name: 'Shoreline',
    description: 'Mapa grande de costa con resort central, pueblo, gasolinera, pier y varias rutas de largo recorrido.',
    players: '10-14',
    raidDuration: 45,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/Shoreline',
    images: [
      { label: 'Shoreline 2D', src: img('shoreline-2d.jpg'), kind: '2D' },
      { label: 'Shoreline 3D', src: img('shoreline-3d.jpg'), kind: '3D' },
      { label: 'Resort 3D', src: img('shoreline-3d-resort.jpg'), kind: '3D' },
    ],
  },
  {
    id: 'reserve',
    name: 'Reserve',
    description: 'Base militar con bunkers, tren y zonas subterraneas de alto riesgo.',
    players: '9-11',
    raidDuration: 40,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/Reserve',
    images: [
      { label: 'Reserve 2D', src: img('reserve-2d.jpg'), kind: '2D' },
      { label: 'Reserve 3D', src: img('reserve-3d.jpg'), kind: '3D' },
      { label: 'Tunnels 3D', src: img('reserve-3d-tunnels.jpg'), kind: '3D' },
    ],
  },
  {
    id: 'interchange',
    name: 'Interchange',
    description: 'Centro comercial ULTRA con rutas circulares y parking subterraneo.',
    players: '11-15',
    raidDuration: 40,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/Interchange',
    images: [
      { label: 'Interchange 2D', src: img('interchange-2d.jpg'), kind: '2D' },
      { label: 'Interchange 3D', src: img('interchange-3d.jpg'), kind: '3D' },
    ],
  },
  {
    id: 'streets',
    name: 'Streets of Tarkov',
    description: 'Centro urbano muy denso con calles largas, interiores conectados y patios.',
    players: '12-16',
    raidDuration: 40,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/Streets_of_Tarkov',
    images: [
      { label: 'Streets 2D', src: img('streets-2d.jpg'), kind: '2D' },
      { label: 'Streets 3D', src: img('streets-3d.jpg'), kind: '3D' },
      { label: 'Caches 3D', src: img('streets-3d-caches.jpg'), kind: '3D' },
      { label: 'Lexos 3D', src: img('streets-3d-lexos.jpg'), kind: '3D' },
    ],
  },
  {
    id: 'factory',
    name: 'Factory',
    description: 'Complejo cerrado, rapido y vertical con combate de corta distancia.',
    players: '7-8',
    raidDuration: 20,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/Factory',
    images: [{ label: 'Factory 2D', src: img('factory-2d.jpg'), kind: '2D' }],
  },
  {
    id: 'ground-zero',
    name: 'Ground Zero',
    description: 'Distrito inicial de TerraGroup con rutas compactas y calles abiertas.',
    players: '9-12',
    raidDuration: 30,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/Ground_Zero',
    images: [
      { label: 'Ground Zero 2D', src: img('ground-zero-2d.jpg'), kind: '2D' },
      { label: 'Ground Zero 3D', src: img('ground-zero-3d.jpg'), kind: '3D' },
    ],
  },
  {
    id: 'the-lab',
    name: 'The Lab',
    description: 'Instalacion subterranea de TerraGroup con ascensores y puertas activables.',
    players: '8-10',
    raidDuration: 30,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/The_Lab',
    images: [{ label: 'Labs 2D', src: img('labs-2d.jpg'), kind: '2D' }],
  },
  {
    id: 'labyrinth',
    name: 'The Labyrinth',
    description: 'Bunker compacto de Knossos LLC con pocos jugadores.',
    players: '5',
    raidDuration: 30,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/The_Labyrinth',
    images: [{ label: 'Labyrinth 2D', src: img('labyrinth-2d.jpg'), kind: '2D' }],
  },
  {
    id: 'terminal',
    name: 'Terminal',
    description: 'Puerto fortificado en desarrollo dentro de la ruta de evacuacion de Tarkov.',
    players: '1-5',
    raidDuration: 50,
    wiki: 'https://escapefromtarkov.fandom.com/wiki/Terminal',
    images: [{ label: 'Terminal 2D', src: img('terminal-2d.jpg'), kind: '2D' }],
  },
]

export function MapExtractionPage() {
  const [query, setQuery] = useState('')
  const [selectedImage, setSelectedImage] = useState<TarkovMapImage | null>(null)
  const [activeMapId, setActiveMapId] = useState<string>(maps[0]?.id ?? '')
  const [expandedMapIds, setExpandedMapIds] = useState<string[]>([])

  const filteredMaps = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return maps
    return maps.filter((map) => map.name.toLowerCase().includes(normalized))
  }, [query])

  const totalImages = maps.reduce((total, map) => total + map.images.length, 0)

  useEffect(() => {
    if (!query.trim()) return
    setExpandedMapIds(filteredMaps.map((map) => map.id))
  }, [query, filteredMaps])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setActiveMapId(visible.target.id)
      },
      { rootMargin: '-25% 0px -55% 0px', threshold: [0.2, 0.4, 0.7] },
    )

    for (const map of maps) {
      const element = document.getElementById(map.id)
      if (element) observer.observe(element)
    }
    return () => observer.disconnect()
  }, [])

  const toggleMap = (mapId: string) => {
    setExpandedMapIds((current) => (current.includes(mapId) ? current.filter((id) => id !== mapId) : [...current, mapId]))
  }

  const focusMap = (mapId: string) => {
    setActiveMapId(mapId)
    setExpandedMapIds((current) => (current.includes(mapId) ? current : [...current, mapId]))
    document.getElementById(mapId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div class="relative min-h-screen pb-10">
      <HUDBackground />
      <Navbar />

      <main class="mx-auto flex w-[min(98%,1800px)] flex-col gap-4 py-4">
        <section class="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside class="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <GlassPanel class="rounded-2xl p-4">
              <div class="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-violet">
                <Compass size={16} />
                Mapas
              </div>
              <div class="space-y-2">
                {maps.map((map, index) => {
                  const isActive = map.id === activeMapId
                  return (
                    <button
                      key={map.id}
                      type="button"
                      onClick={() => focusMap(map.id)}
                      class={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition ${
                        isActive
                          ? 'border-violet/45 bg-violet/20 text-text'
                          : 'border-transparent bg-[#09152c]/74 text-muted hover:bg-[#0d1d3b] hover:text-text'
                      }`}
                    >
                      <span class="flex items-center gap-3">
                        <span class={`text-xs font-medium ${isActive ? 'text-violet' : 'text-muted'}`}>{String(index + 1).padStart(2, '0')}</span>
                        <span class="font-semibold">{map.name}</span>
                      </span>
                      <span class="text-xs text-muted">{map.images.length}</span>
                    </button>
                  )
                })}
              </div>
            </GlassPanel>

            <GlassPanel class="rounded-2xl p-4">
              <h2 class="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-violet">Resumen</h2>
              <div class="grid gap-3 text-sm">
                <div class="tb-subpanel p-3">
                  <p class="text-muted">Mapas</p>
                  <p class="mt-1 text-2xl font-black text-text">{maps.length}</p>
                </div>
                <div class="tb-subpanel p-3">
                  <p class="text-muted">Imagenes 2D/3D</p>
                  <p class="mt-1 text-2xl font-black text-text">{totalImages}</p>
                </div>
              </div>
            </GlassPanel>
          </aside>

          <section class="space-y-4">
            <GlassPanel class="relative overflow-hidden rounded-2xl p-6 md:p-8">
              <div class="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-cover bg-[50%_42%] opacity-35 md:block" style={{ backgroundImage: 'url("/tarkov/maps/streets-3d.jpg")' }} />
              <div class="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-[#030916]/10 via-[#030916]/42 to-[#030916]/86 md:block" />
              <div class="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div class="mb-2 text-sm text-muted">Escape from Tarkov &gt; Mapas</div>
                  <h1 class="mt-3 text-4xl font-bold text-violet md:text-6xl">Mapas</h1>
                  <p class="mt-2 max-w-3xl text-muted">Mapas estaticos 2D y 3D organizados por zona.</p>
                </div>
                <label class="field-control flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 text-muted lg:w-[360px]">
                  <Search size={18} class="text-violet" />
                  <input
                    value={query}
                    onInput={(event) => setQuery(event.currentTarget.value)}
                    placeholder="Buscar mapa..."
                    class="w-full bg-transparent text-sm text-text outline-none placeholder:text-muted/70"
                  />
                </label>
              </div>
            </GlassPanel>

            <div class="space-y-4">
              {filteredMaps.map((map) => {
                const isExpanded = expandedMapIds.includes(map.id)
                return (
                  <GlassPanel key={map.id} id={map.id} class="scroll-mt-24 rounded-2xl p-4 md:p-6">
                    <header class="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <button type="button" onClick={() => toggleMap(map.id)} class="group flex w-full items-center gap-3 text-left">
                          <span class="flex h-11 w-11 items-center justify-center rounded-xl border border-violet/45 bg-violet/15 text-violet">
                            <MapPinned size={20} />
                          </span>
                          <div>
                            <h2 class="text-2xl font-bold text-violet md:text-3xl">{map.name}</h2>
                            <p class="mt-1 max-w-3xl text-sm text-muted">{map.description}</p>
                          </div>
                          <span class={`ml-auto rounded-xl bg-[#09152c]/80 p-2 text-muted shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition group-hover:text-text ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={16} />
                          </span>
                        </button>
                      </div>
                      <div class="flex flex-wrap gap-2 text-xs font-semibold text-muted">
                        <span class="inline-flex items-center gap-2 rounded-xl bg-[#081226]/80 px-3 py-2">
                          <Users size={14} class="text-violet" />
                          {map.players} jugadores
                        </span>
                        <span class="inline-flex items-center gap-2 rounded-xl bg-[#081226]/80 px-3 py-2">
                          <Clock3 size={14} class="text-violet" />
                          {map.raidDuration} min
                        </span>
                        <a
                          href={map.wiki}
                          target="_blank"
                          rel="noreferrer"
                          class="inline-flex items-center gap-2 rounded-xl bg-[#09152c]/80 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b] hover:text-text"
                        >
                          Wiki
                          <ExternalLink size={13} />
                        </a>
                      </div>
                    </header>

                    {isExpanded ? (
                      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {map.images.map((image) => (
                          <button
                            key={image.src}
                            type="button"
                            onClick={() => setSelectedImage(image)}
                            class="group overflow-hidden rounded-xl bg-[#09152c]/74 text-left shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)] transition hover:bg-[#0d1d3b]"
                          >
                            <div class="relative aspect-[16/10] bg-[#081226]">
                              <img
                                src={image.src}
                                alt={image.label}
                                loading="lazy"
                                decoding="async"
                                class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                              />
                              <span class="absolute left-3 top-3 rounded-lg border border-white/10 bg-[#030916]/85 px-2 py-1 text-xs font-bold text-text">
                                {image.kind}
                              </span>
                            </div>
                            <div class="flex items-center justify-between px-4 py-3">
                              <span class="font-semibold text-text">{image.label}</span>
                              <span class="text-xs text-violet">Abrir</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </GlassPanel>
                )
              })}
            </div>
          </section>
        </section>
      </main>

      {selectedImage ? (
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#01040d]/90 p-4 backdrop-blur-md" onClick={() => setSelectedImage(null)}>
          <div
            class="relative max-h-[92vh] w-[min(96vw,1500px)] overflow-hidden rounded-2xl bg-[#030916]/98 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.25),0_24px_80px_rgba(0,0,0,0.78)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="flex items-center justify-between border-b border-violet/10 px-4 py-3">
              <div class="flex items-center gap-3">
                <Layers3 size={18} class="text-violet" />
                <h2 class="font-bold text-violet">{selectedImage.label}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                class="rounded-xl bg-[#0b172f] p-2 text-muted shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b] hover:text-text"
                aria-label="Cerrar mapa"
              >
                <X size={18} />
              </button>
            </div>
            <div class="max-h-[82vh] overflow-auto bg-[#01040d]">
              <img src={selectedImage.src} alt={selectedImage.label} class="mx-auto h-auto max-w-none md:max-w-full" />
            </div>
          </div>
        </div>
      ) : null}

      <Footer />
    </div>
  )
}
