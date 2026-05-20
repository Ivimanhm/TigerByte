import { GameCard } from '../../components/cards/GameCard'
import type { GameCardData } from '../../types/game'
import { ChevronLeft, ChevronRight } from 'lucide-preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import lolImage from '../../assets/games/lol.png'
import dbdImage from '../../assets/games/dbd.png'
import tarkovImage from '../../assets/games/tarkov.png'
import rustImage from '../../assets/games/rust.png'

const games: GameCardData[] = [
  {
    id: 'lol',
    game: 'League of Legends',
    alias: 'LOL',
    href: '#tools-lol',
    tone: 'violet',
    image: lolImage,
    imagePosition: '50% 44%',
    description: 'Creador de equipos y tierlist de campeones.',
    stats: [
      { label: 'Win Rate', value: '54.2%' },
      { label: 'Partidas', value: '1,248' },
      { label: 'KDA Promedio', value: '3.21' },
    ],
  },
  {
    id: 'dbd',
    game: 'Dead by Daylight',
    alias: 'DBD',
    href: '#tools-dbd',
    tone: 'orange',
    image: dbdImage,
    imagePosition: '50% 42%',
    description: 'Creador de builds.',
    stats: [
      { label: 'Escape Rate', value: '32.6%' },
      { label: 'Partidas', value: '856' },
      { label: 'Killer Rank', value: 'Iridiscente I' },
    ],
  },
  {
    id: 'tarkov',
    game: 'Escape from Tarkov',
    alias: 'TARKOV',
    href: '#tools-tarkov',
    tone: 'green',
    image: tarkovImage,
    imagePosition: '50% 42%',
    description: 'Mapas, builds de armas.',
    stats: [
      { label: 'Supervivencia', value: '47.8%' },
      { label: 'PMC Kills', value: '1,362' },
      { label: 'Rublos', value: '24.6M' },
    ],
  },
  {
    id: 'rust',
    game: 'Rust',
    alias: 'RUST',
    href: '#tools-rust',
    tone: 'rust',
    image: rustImage,
    imagePosition: '50% 42%',
    description: 'Planos de casas y calculadora de raids.',
    stats: [
      { label: 'Horas jugadas', value: '1,124' },
      { label: 'Conexiones', value: '312' },
      { label: 'K/D Ratio', value: '1.47' },
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
  const itemWidth = viewportWidth > 0 ? (viewportWidth - gapPx * (cardsPerView - 1)) / cardsPerView : 0
  const stepPx = itemWidth + gapPx

  return (
    <section class="reveal-group games-carousel relative py-4">
      <div class="mb-7 text-center">
        <h2 class="reveal text-[clamp(1.8rem,2.8vw,2.4rem)]">Herramientas por juego</h2>
        <p class="reveal text-muted">Funcionalidades especializadas para cada mundo</p>
      </div>

      <div class="relative">
        <button
          type="button"
          onClick={() => canGoPrev && setCurrentIndex((p) => p - 1)}
          class={`absolute -left-12 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border lg:flex ${
            canGoPrev
              ? 'modern-btn border-cyan/35 text-cyan hover:text-text'
              : 'border-cyan/10 bg-bg/40 text-muted/45 opacity-45'
          }`}
          aria-label="Anterior"
          aria-disabled={!canGoPrev}
        >
          <ChevronLeft size={18} />
        </button>

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

        <button
          type="button"
          onClick={() => canGoNext && setCurrentIndex((p) => p + 1)}
          class={`absolute -right-12 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border lg:flex ${
            canGoNext
              ? 'modern-btn border-cyan/35 text-cyan hover:text-text'
              : 'border-cyan/10 bg-bg/40 text-muted/45 opacity-45'
          }`}
          aria-label="Siguiente"
          aria-disabled={!canGoNext}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div class="mt-4 flex items-center justify-center gap-2">
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
            class={`h-2.5 w-2.5 rounded-full transition ${
              isVisible ? 'bg-violet shadow-[0_0_10px_rgba(139,92,246,0.8)]' : 'bg-slate-500/60 hover:bg-slate-400/75'
            }`}
            aria-label={`Ir al contenedor ${idx + 1}`}
          />
        )})}
      </div>
    </section>
  )
}
