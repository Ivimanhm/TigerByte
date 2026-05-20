import { ArrowRight } from 'lucide-preact'
import type { GameCardData } from '../../types/game'

const toneStyles = {
  violet: 'border-violet-400/80 shadow-[0_0_26px_rgba(139,92,246,0.35)] card-border-violet',
  orange:
    'border-orange-400/45 shadow-[0_0_22px_rgba(251,146,60,0.22)] card-border-orange',
  green:
    'border-emerald-400/45 shadow-[0_0_22px_rgba(74,222,128,0.2)] card-border-green',
  rust: 'border-rust/45 shadow-[0_0_22px_rgba(222,127,76,0.22)] card-border-rust',
}

const badgeToneStyles = {
  violet: 'border-violet/45 bg-violet/15 text-violet',
  orange: 'border-orange-400/45 bg-orange-400/15 text-orange-300',
  green: 'border-emerald-400/45 bg-emerald-400/15 text-emerald-300',
  rust: 'border-rust/45 bg-rust/15 text-rust',
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

const badgeEmotes = {
  violet: '⚔',
  orange: '☠',
  green: '✦',
  rust: '⚙',
}

export function GameCard({ game }: { game: GameCardData }) {
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

      <div class="relative z-[1] mt-[clamp(19rem,31vw,23rem)] flex grow flex-col bg-slate-950/92 px-4 pb-4 pt-3">
        <div class={`mb-2 mt-auto inline-flex w-fit items-center gap-1.5 self-start rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold tracking-[0.1em] ${badgeToneStyles[game.tone]}`}>
          <span class="text-[0.7rem]">{badgeEmotes[game.tone]}</span>
          <span>{game.alias}</span>
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
