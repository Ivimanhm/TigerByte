import { GameCard } from '../../components/cards/GameCard'
import type { GameCardData } from '../../types/game'
import lolImage from '../../assets/games/lol.png'
import dbdImage from '../../assets/games/dbd.png'
import tarkovImage from '../../assets/games/tarkov.png'
import rustImage from '../../assets/games/rust.png'

const games: GameCardData[] = [
  {
    id: 'lol',
    game: 'League of Legends',
    alias: 'LOL',
    tone: 'violet',
    image: lolImage,
    imagePosition: '50% 44%',
    description: 'Analisis de builds, runas y rendimiento en tiempo real.',
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
    tone: 'orange',
    image: dbdImage,
    imagePosition: '50% 42%',
    description: 'Perks, supervivencia y seguimiento tactico de partidas.',
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
    tone: 'green',
    image: tarkovImage,
    imagePosition: '50% 42%',
    description: 'Mapas, loot tracking y economia al alcance.',
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
    tone: 'rust',
    image: rustImage,
    imagePosition: '50% 42%',
    description: 'Planificacion de clanes y apoyo tactico para raids.',
    stats: [
      { label: 'Horas jugadas', value: '1,124' },
      { label: 'Conexiones', value: '312' },
      { label: 'K/D Ratio', value: '1.47' },
    ],
  },
]

export function GamesSection() {
  return (
    <section class="reveal-group py-4">
      <div class="mb-7 text-center">
        <h2 class="reveal text-[clamp(1.8rem,2.8vw,2.4rem)]">Herramientas por juego</h2>
        <p class="reveal text-muted">Funcionalidades especializadas para cada mundo</p>
      </div>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </section>
  )
}
