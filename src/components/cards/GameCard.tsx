import { ArrowLeft, ArrowRight, Bomb, BookOpen, Crosshair, Hammer, LifeBuoy, Map, Skull, Swords, Users, Wrench } from 'lucide-preact'
import { useState } from 'preact/hooks'
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

function actionIcon(label: string) {
  const normalized = label.toLowerCase()
  if (normalized.includes('mapas')) return Map
  if (normalized.includes('raideo')) return Bomb
  if (normalized.includes('guia')) return BookOpen
  if (normalized.includes('troubleshooting')) return LifeBuoy
  if (normalized.includes('tierlist')) return Swords
  if (normalized.includes('equipo')) return Users
  return Wrench
}

export function GameCard({ game }: { game: GameCardData }) {
  const [isFlipped, setIsFlipped] = useState(false)
  const BadgeIcon = badgeIcons[game.tone]
  const actions = game.actions ?? (game.href ? [{ label: 'Ver herramientas', href: game.href }] : [])

  return (
    <div class="game-flip-card min-h-[41rem]">
      <article
        class={`group card-electric game-flip-card-inner relative block h-full min-h-[41rem] overflow-hidden rounded-panel border bg-slate-950/65 ${toneStyles[game.tone]} ${
          isFlipped ? 'game-card-flipped' : ''
        }`}
      >
        <div
          class="game-flip-face game-flip-front"
          style={{
            pointerEvents: isFlipped ? 'none' : 'auto',
            opacity: isFlipped ? 0 : 1,
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsFlipped((prev) => !prev)}
            class="absolute inset-0 z-[3]"
            aria-label={`Ver opciones de ${game.game}`}
          />

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
                  <div key={stat.label} class="flex items-center justify-between border-b border-white/10 py-1.5 last:border-b-0">
                    <span class="text-muted">{stat.label}</span>
                    <strong class={valueToneStyles[game.tone]}>{stat.value}</strong>
                  </div>
                ))}
              </div>
            <div class={`flex w-full items-center justify-between text-sm font-semibold transition ${ctaToneStyles[game.tone]}`}>
              <span>Pulsa para ver opciones</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </div>

        <div
          class="game-flip-face game-flip-back"
          style={{
            pointerEvents: isFlipped ? 'auto' : 'none',
            opacity: isFlipped ? 1 : 0,
            transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(-180deg)',
          }}
        >
          <button
            type="button"
            onClick={() => setIsFlipped(false)}
            class="absolute inset-0 z-[0]"
            aria-label={`Cerrar opciones de ${game.game}`}
          />
          <img
            src={game.imageBack ?? game.image}
            alt=""
            aria-hidden="true"
            class="absolute inset-0 h-full w-full object-cover opacity-70"
            style={{ objectPosition: game.imagePosition ?? '50% 0%' }}
          />
          <div class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(2,8,22,0.72)_0%,rgba(2,8,22,0.86)_38%,rgba(2,8,22,0.98)_100%)]" />
          <div class="relative z-[1] flex h-full flex-col p-6">
            <div>
              <div class={`mb-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-[0.12em] ${badgeToneStyles[game.tone]}`} style={{ backgroundColor: 'rgba(2,8,14,0.72)' }}>
                {game.alias}
              </div>
              <h3 class="mb-2 text-[2rem] font-semibold leading-none text-slate-100">{game.game}</h3>
            </div>
            <div class="mt-auto">
              <div class="space-y-3">
                {actions.map((action) => {
                  const ActionIcon = actionIcon(action.label)
                  return (
                  <a
                    key={action.label}
                    href={action.href}
                    onClick={(event) => event.stopPropagation()}
                    class={`group/action flex items-center justify-between rounded-xl border border-white/12 bg-[linear-gradient(135deg,rgba(18,30,54,0.76)_0%,rgba(8,16,36,0.68)_100%)] px-4 py-3 text-sm font-semibold backdrop-blur-sm transition hover:border-white/30 hover:bg-[linear-gradient(135deg,rgba(24,38,68,0.88)_0%,rgba(10,20,44,0.82)_100%)] ${ctaToneStyles[game.tone]}`}
                  >
                    <span class="inline-flex items-center gap-3">
                      <span class="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/30">
                        <ActionIcon size={15} />
                      </span>
                      {action.label}
                    </span>
                    <ArrowRight size={15} class="transition-transform group-hover/action:translate-x-0.5" />
                  </a>
                  )
                })}
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  setIsFlipped(false)
                }}
                class="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/25 bg-slate-950/65 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-900/85"
                aria-label={`Volver al frente de ${game.game}`}
              >
                <ArrowLeft size={14} />
                Volver
              </button>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
