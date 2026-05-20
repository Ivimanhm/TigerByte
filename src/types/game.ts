export type GameTone = 'violet' | 'orange' | 'green' | 'rust'

export interface GameStat {
  label: string
  value: string
}

export interface GameCardData {
  id: string
  game: string
  alias: string
  href?: string
  description: string
  tone: GameTone
  image: string
  imageName?: string
  imagePosition?: string
  stats: GameStat[]
}
