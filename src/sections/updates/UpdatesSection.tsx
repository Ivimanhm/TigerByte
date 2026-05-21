import { GlassPanel } from '../../components/ui/GlassPanel'
import { updates } from '../../data/updates.generated'

const MAX_VISIBLE_UPDATES = 4
const COMMITS_HISTORY_URL = 'https://github.com/Ivimanhm/TigerByte/commits/main'

export function UpdatesSection() {
  const visibleUpdates = updates.slice(0, MAX_VISIBLE_UPDATES)
  const hasMore = updates.length > MAX_VISIBLE_UPDATES
  const getTagColors = (tag: string) => {
    if (tag === 'IMPORTANTE' || tag === 'CAMBIO MAYOR') {
      return { backgroundColor: '#4A1F0F', color: '#FDBA74' }
    }
    if (tag === 'NUEVO' || tag === 'CAMBIO MENOR') {
      return { backgroundColor: '#113223', color: '#86EFAC' }
    }
    if (tag === 'MEJORA' || tag === 'NUEVA FUNCION') {
      return { backgroundColor: '#2A1D4D', color: '#C4B5FD' }
    }
    if (tag === 'INFO') {
      return { backgroundColor: '#273244', color: '#E2E8F0' }
    }
    return { backgroundColor: '#12354A', color: '#A5F3FC' }
  }

  return (
    <GlassPanel class="reveal p-6">
      <h3 class="mb-5 text-2xl">Ultimas actualizaciones</h3>
      <ol class="space-y-4 text-sm">
        {visibleUpdates.map((update) => {
          const isImportant = update.tag === 'IMPORTANTE' || update.tag === 'CAMBIO MAYOR'
          const dotStyle = isImportant
            ? {
                backgroundColor: '#FFFFFF',
                border: '2.5px solid #FB923C',
                boxShadow:
                  '0 0 14px rgba(251,146,60,1), 0 0 22px rgba(249,115,22,0.95), 0 0 2px rgba(255,255,255,1)',
              }
            : {
                backgroundColor: '#FFFFFF',
                border: '2.5px solid #A78BFA',
                boxShadow:
                  '0 0 14px rgba(167,139,250,1), 0 0 22px rgba(124,58,237,0.95), 0 0 2px rgba(255,255,255,1)',
              }
          const lineStyle = isImportant
            ? {
                background:
                  'linear-gradient(to bottom, rgba(249,115,22,1) 0%, rgba(249,115,22,0.9) 34%, rgba(249,115,22,0.46) 68%, rgba(249,115,22,0.1) 100%)',
              }
            : {
                background:
                  'linear-gradient(to bottom, rgba(124,58,237,1) 0%, rgba(124,58,237,0.9) 34%, rgba(124,58,237,0.46) 68%, rgba(124,58,237,0.1) 100%)',
              }
          return (
          <li class="relative flex items-start gap-3">
            <span
              class="pointer-events-none absolute left-2 top-[0.62rem] bottom-1 w-[1.5px] -translate-x-1/2 rounded-full"
              style={lineStyle}
            />
            <span class="relative z-10 mt-[0.1rem] block w-4 shrink-0">
              <span
                class="pointer-events-none absolute left-2 top-[0.62rem] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={dotStyle}
              />
            </span>
            <div class="min-w-0 flex-1">
              <div class="mb-1 flex items-center gap-2">
              <strong class="text-cyan">{update.version}</strong>
              <span
                class="rounded px-1.5 py-[1px] text-[10px] font-semibold uppercase tracking-wide"
                style={getTagColors(update.tag)}
              >
                {update.tag}
              </span>
              <span class="ml-auto text-xs text-slate-300/85">{update.date}</span>
              </div>
              <p class="max-w-[95%] leading-relaxed text-slate-300/80">{update.note}</p>
            </div>
          </li>
        )})}
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
