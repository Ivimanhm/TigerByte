export type GameTone = 'violet' | 'orange' | 'green' | 'rust'

export interface GameStat {
  label: string
  value: string
}

export interface GameAction {
  label: string
  href: string
}

export interface GameCardData {
  id: string
  game: string
  alias: string
  href?: string
  description: string
  tone: GameTone
  image: string
  imageBack?: string
  imageName?: string
  imagePosition?: string
  stats: GameStat[]
  actions?: GameAction[]
}
