import { GameCard } from '../../components/cards/GameCard'
import type { GameCardData } from '../../types/game'
import { ChevronLeft, ChevronRight } from 'lucide-preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import lolImage from '../../assets/games/lol.png'
import lolImageBack from '../../assets/games/LOL 2.png'
import dbdImage from '../../assets/games/dbd.png'
import dbdImageBack from '../../assets/games/DBD 2.png'
import tarkovImage from '../../assets/games/tarkov.png'
import tarkovImageBack from '../../assets/games/TARKOV 2.png'
import rustImage from '../../assets/games/rust.png'
import rustImageBack from '../../assets/games/RUST 2.png'

const games: GameCardData[] = [
  {
    id: 'lol',
    game: 'League of Legends',
    alias: 'LOL',
    href: '#lol-team-builder',
    tone: 'violet',
    image: lolImage,
    imageBack: lolImageBack,
    imagePosition: '50% 44%',
    description: 'Creador de equipos y tierlist de campeones.',
    stats: [
      { label: 'Win Rate', value: '54.2%' },
      { label: 'Partidas', value: '1,248' },
      { label: 'KDA Promedio', value: '3.21' },
    ],
    actions: [
      { label: 'Creador de equipos', href: '#lol-team-builder' },
      { label: 'Tierlist de campeones', href: '#lol-champion-tierlist' },
    ],
  },
  {
    id: 'dbd',
    game: 'Dead by Daylight',
    alias: 'DBD',
    href: '#dbd-build-creator',
    tone: 'orange',
    image: dbdImage,
    imageBack: dbdImageBack,
    imagePosition: '50% 42%',
    description: 'Creador de builds.',
    stats: [
      { label: 'Escape Rate', value: '32.6%' },
      { label: 'Partidas', value: '856' },
      { label: 'Killer Rank', value: 'Iridiscente I' },
    ],
    actions: [
      { label: 'Creador de builds', href: '#dbd-build-creator' },
    ],
  },
  {
    id: 'tarkov',
    game: 'Escape from Tarkov',
    alias: 'TARKOV',
    href: '#tarkov-weapon-builds',
    tone: 'green',
    image: tarkovImage,
    imageBack: tarkovImageBack,
    imagePosition: '50% 42%',
    description: 'Mapas, builds de armas.',
    stats: [
      { label: 'Supervivencia', value: '47.8%' },
      { label: 'PMC Kills', value: '1,362' },
      { label: 'Rublos', value: '24.6M' },
    ],
    actions: [
      { label: 'Builds de armas', href: '#tarkov-weapon-builds' },
      { label: 'Extraccion de mapas', href: '#tarkov-map-extraction' },
    ],
  },
  {
    id: 'rust',
    game: 'Rust',
    alias: 'RUST',
    href: '#rust-building-plans',
    tone: 'rust',
    image: rustImage,
    imageBack: rustImageBack,
    imagePosition: '50% 42%',
    description: 'Guia de casas, planos y calculadora de raids.',
    stats: [
      { label: 'Horas jugadas', value: '1,124' },
      { label: 'Conexiones', value: '312' },
      { label: 'K/D Ratio', value: '1.47' },
    ],
    actions: [
      { label: 'Planos de construccion', href: '#rust-building-plans' },
      { label: 'Calculadora de raideos', href: '#rust-raid-calculator' },
    ],
  },
]

export function GamesSection() {
  const [cardsPerView, setCardsPerView] = useState(4)
  const [currentIndex, setCurrentIndex] = useState(0)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const gapPx = 20

  useEffect(() => {
    function syncCardsPerView() {
      const w = window.innerWidth
      if (w < 760) setCardsPerView(1)
      else if (w < 1100) setCardsPerView(2)
      else if (w < 1450) setCardsPerView(3)
      else setCardsPerView(4)
    }

    syncCardsPerView()
    window.addEventListener('resize', syncCardsPerView)
    return () => window.removeEventListener('resize', syncCardsPerView)
  }, [])

  useEffect(() => {
    function syncViewportWidth() {
      if (viewportRef.current) {
        setViewportWidth(viewportRef.current.clientWidth)
      }
    }

    syncViewportWidth()
    window.addEventListener('resize', syncViewportWidth)
    return () => window.removeEventListener('resize', syncViewportWidth)
  }, [])

  useEffect(() => {
    const maxStart = Math.max(0, games.length - cardsPerView)
    if (currentIndex > maxStart) {
      setCurrentIndex(maxStart)
    }
  }, [cardsPerView, currentIndex])

  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < Math.max(0, games.length - cardsPerView)
  const showSideNav = cardsPerView === 4
  const itemWidth = viewportWidth > 0
    ? (viewportWidth - gapPx * (cardsPerView - 1)) / cardsPerView
    : 0
  const stepPx = itemWidth + gapPx

  return (
    <section class="reveal-group games-carousel relative py-4">
      <div class="mb-7 text-center">
        <h2 class="reveal text-[clamp(1.8rem,2.8vw,2.4rem)]">Herramientas por juego</h2>
        <p class="reveal text-muted">Funcionalidades unicas para cada juego</p>
      </div>

      <div class="relative">
        {showSideNav && (
          <button
            type="button"
            onClick={() => canGoPrev && setCurrentIndex((p) => p - 1)}
            class={`carousel-nav-btn absolute -left-16 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 lg:flex ${
              canGoPrev
                ? 'border-cyan/55 bg-slate-950/90 text-cyan'
                : 'border-cyan/10 bg-bg/40 text-muted/45 opacity-45'
            }`}
            aria-label="Anterior"
            title="Anterior"
            aria-disabled={!canGoPrev}
          >
            <ChevronLeft size={18} />
            {canGoPrev && (
              <span class="pointer-events-none absolute -bottom-6 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-cyan/80">
                Navegar
              </span>
            )}
          </button>
        )}

        <div ref={viewportRef} class="overflow-hidden">
          <div
            class="flex gap-5 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * stepPx}px)` }}
          >
            {games.map((game) => (
              <div key={game.id} class="shrink-0" style={{ width: `${itemWidth}px` }}>
                <GameCard game={game} />
              </div>
            ))}
          </div>
        </div>

        {showSideNav && (
          <button
            type="button"
            onClick={() => canGoNext && setCurrentIndex((p) => p + 1)}
            class={`carousel-nav-btn absolute -right-16 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-2 lg:flex ${
              canGoNext
                ? 'border-cyan/55 bg-slate-950/90 text-cyan'
                : 'border-cyan/10 bg-bg/40 text-muted/45 opacity-45'
            }`}
            aria-label="Siguiente"
            title="Siguiente"
            aria-disabled={!canGoNext}
          >
            <ChevronRight size={18} />
            {canGoNext && (
              <span class="pointer-events-none absolute -bottom-6 text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-cyan/80">
                Navegar
              </span>
            )}
          </button>
        )}
      </div>

      {!showSideNav && (
        <div class="mt-11 flex h-9 items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => canGoPrev && setCurrentIndex((p) => p - 1)}
            class={`carousel-nav-btn relative top-[18px] flex h-9 w-9 items-center justify-center rounded-full border-2 ${
              canGoPrev
                ? 'border-cyan/55 bg-slate-950/90 text-cyan'
                : 'border-cyan/10 bg-bg/40 text-muted/45 opacity-45'
            }`}
            aria-label="Anterior"
            title="Anterior"
            aria-disabled={!canGoPrev}
          >
            <ChevronLeft size={16} />
          </button>

          <div class="flex h-9 items-center justify-center gap-4">
            {games.map((_, idx) => {
              const start = currentIndex
              const end = start + cardsPerView
              const isVisible = idx >= start && idx < end
              const maxStart = Math.max(0, games.length - cardsPerView)
              const targetIndex = Math.min(idx, maxStart)
              return (
                <button
                  key={`dot-mobile-${idx}`}
                  type="button"
                  onClick={() => setCurrentIndex(targetIndex)}
                  class={`indicator-dot h-2.5 w-2.5 rounded-full transition ${
                    isVisible ? 'bg-violet shadow-[0_0_10px_rgba(139,92,246,0.8)]' : 'bg-slate-500/60 hover:bg-slate-400/75'
                  }`}
                  aria-label={`Ir al contenedor ${idx + 1}`}
                />
              )
            })}
          </div>

          <button
            type="button"
            onClick={() => canGoNext && setCurrentIndex((p) => p + 1)}
            class={`carousel-nav-btn relative top-[18px] flex h-9 w-9 items-center justify-center rounded-full border-2 ${
              canGoNext
                ? 'border-cyan/55 bg-slate-950/90 text-cyan'
                : 'border-cyan/10 bg-bg/40 text-muted/45 opacity-45'
            }`}
            aria-label="Siguiente"
            title="Siguiente"
            aria-disabled={!canGoNext}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {showSideNav && (
        <div class="mt-11 hidden items-center justify-center gap-4 lg:flex">
          {games.map((_, idx) => {
            const start = currentIndex
            const end = start + cardsPerView
            const isVisible = idx >= start && idx < end
            const maxStart = Math.max(0, games.length - cardsPerView)
            const targetIndex = Math.min(idx, maxStart)
            return (
              <button
                key={`dot-${idx}`}
                type="button"
                onClick={() => setCurrentIndex(targetIndex)}
                class={`indicator-dot h-2.5 w-2.5 rounded-full transition ${
                  isVisible ? 'bg-violet shadow-[0_0_10px_rgba(139,92,246,0.8)]' : 'bg-slate-500/60 hover:bg-slate-400/75'
                }`}
                aria-label={`Ir al contenedor ${idx + 1}`}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
