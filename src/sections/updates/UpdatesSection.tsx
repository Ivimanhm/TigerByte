import { GlassPanel } from '../../components/ui/GlassPanel'
import { updates } from '../../data/updates.generated'

const MAX_VISIBLE_UPDATES = 4
const COMMITS_HISTORY_URL = 'https://github.com/Ivimanhm/TigerByte/commits/main'

const tagStyles: Record<string, string> = {
  NUEVO: 'bg-emerald-400/20 text-emerald-300',
  MEJORA: 'bg-cyan/20 text-cyan',
  FIX: 'bg-orange-400/20 text-orange-300',
  UPDATE: 'bg-violet/20 text-violet',
  COMMIT: 'bg-violet/20 text-violet',
  INFO: 'bg-slate-400/20 text-slate-300',
}

export function UpdatesSection() {
  const visibleUpdates = updates.slice(0, MAX_VISIBLE_UPDATES)
  const hasMore = updates.length > MAX_VISIBLE_UPDATES

  return (
    <GlassPanel class="reveal p-6">
      <h3 class="mb-5 text-2xl">Ultimas actualizaciones</h3>
      <ol class="space-y-4 text-sm">
        {visibleUpdates.map((update) => (
          <li class="relative border-l border-violet/40 pl-4">
            <div class="mb-1 flex flex-wrap items-center gap-2">
              <strong>{update.version}</strong>
              <span class={`rounded px-2 py-0.5 text-xs ${tagStyles[update.tag] ?? tagStyles.UPDATE}`}>{update.tag}</span>
              <span class="text-xs text-muted">{update.date}</span>
            </div>
            <p class="text-muted">{update.note}</p>
          </li>
        ))}
      </ol>
      {hasMore ? (
        <a
          href={COMMITS_HISTORY_URL}
          target="_blank"
          rel="noreferrer"
          class="mt-4 inline-flex rounded-lg border border-cyan/30 px-3 py-2 text-sm text-cyan transition hover:border-cyan/55 hover:text-text"
        >
          Ver historial completo
        </a>
      ) : null}
    </GlassPanel>
  )
}
