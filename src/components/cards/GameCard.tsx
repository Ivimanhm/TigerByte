import { ArrowRight, Crosshair, Hammer, Skull, Swords } from 'lucide-preact'
import type { GameCardData } from '../../types/game'

const toneStyles = {
  violet: 'border-violet shadow-[0_0_26px_rgba(139,92,246,0.42)] card-border-violet',
  orange:
    'border-orange-400/80 shadow-[0_0_22px_rgba(251,146,60,0.22)] card-border-orange',
  green:
    'border-emerald-400/80 shadow-[0_0_22px_rgba(74,222,128,0.2)] card-border-green',
  rust: 'border-rust/80 shadow-[0_0_22px_rgba(222,127,76,0.22)] card-border-rust',
}

const badgeToneStyles = {
  violet: 'text-indigo-300',
  orange: 'text-orange-400',
  green: 'text-emerald-300',
  rust: 'text-orange-500',
}

const ctaToneStyles = {
  violet: 'text-violet',
  orange: 'text-orange-300',
  green: 'text-emerald-300',
  rust: 'text-rust',
}

const valueToneStyles = {
  violet: 'text-cyan',
  orange: 'text-orange-300',
  green: 'text-emerald-300',
  rust: 'text-rust',
}

const badgeIcons = {
  violet: Swords,
  orange: Skull,
  green: Crosshair,
  rust: Hammer,
} as const

export function GameCard({ game }: { game: GameCardData }) {
  const BadgeIcon = badgeIcons[game.tone]

  return (
    <a
      href={game.href ?? '#'}
      class={`group card-electric relative flex min-h-[41rem] flex-col overflow-hidden rounded-panel border bg-slate-950/65 ${toneStyles[game.tone]}`}
    >
      <img
        src={game.image}
        alt={game.game}
        class="absolute inset-0 h-full w-full object-cover object-top opacity-95"
        style={{ objectPosition: game.imagePosition ?? '50% 0%' }}
      />

      <div class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent from-[44%] via-slate-950/82 via-[62%] to-slate-950/100 to-[74%]" />
      <div class="pointer-events-none absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-b from-slate-950/84 to-slate-950" />

      <div class="relative z-[1] mt-[clamp(19rem,31vw,23rem)] flex grow flex-col bg-slate-950/92 px-6 pb-5 pt-4">
        <div
          class={`mb-2 mt-auto inline-flex w-fit items-center justify-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[0.78rem] font-semibold leading-none tracking-[0.1em] ${badgeToneStyles[game.tone]}`}
          style={{ backgroundColor: '#02080E' }}
        >
          <BadgeIcon size={14} class="shrink-0 align-middle" />
          <span class="uppercase leading-none">{game.alias}</span>
        </div>
        <p class="mb-2 text-sm text-slate-200/90">{game.description}</p>
        <div class="mb-3 border-y border-white/10 py-1 text-sm">
          {game.stats.map((stat) => (
            <div class="flex items-center justify-between border-b border-white/10 py-1.5 last:border-b-0">
              <span class="text-muted">{stat.label}</span>
              <strong class={valueToneStyles[game.tone]}>{stat.value}</strong>
            </div>
          ))}
        </div>
        <div class={`flex w-full items-center justify-between text-sm font-semibold transition ${ctaToneStyles[game.tone]}`}>
          <span>Ver herramientas</span>
          <ArrowRight size={16} />
        </div>
      </div>
    </a>
  )
}

