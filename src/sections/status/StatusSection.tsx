import { Database, Download, RefreshCw, Server } from 'lucide-preact'
import { GlassPanel } from '../../components/ui/GlassPanel'
import { systemStatus } from '../../data/system-status.generated'

const iconById = {
  repo: Server,
  db: Database,
  updates: RefreshCw,
  action: Download,
} as const

const valueToneByLevel = {
  ok: 'text-emerald-300',
  warn: 'text-orange-300',
  error: 'text-rose-300',
  action: 'text-cyan',
} as const

export function StatusSection() {
  const updatesUpToDate = systemStatus.some((item) => item.id === 'updates' && item.level === 'ok')

  return (
    <GlassPanel class="reveal p-6">
      <h3 class="mb-5 text-2xl">Estado del sistema</h3>
      <div class="space-y-3 text-sm">
        {systemStatus.map((row) => {
          const Icon = iconById[row.id]
          const isAction = row.id === 'action'
          const actionDisabled = isAction && updatesUpToDate

          if (isAction) {
            return (
              <a
                href={actionDisabled ? undefined : row.actionUrl}
                target={actionDisabled ? undefined : '_blank'}
                rel={actionDisabled ? undefined : 'noreferrer'}
                aria-disabled={actionDisabled}
                class={`flex w-full items-center justify-between rounded-lg border px-3 py-2 transition ${
                  actionDisabled
                    ? 'cursor-not-allowed border-cyan/15 bg-bg/35 text-muted opacity-70'
                    : 'modern-btn text-cyan hover:text-text'
                }`}
              >
                <span class="inline-flex items-center gap-2">
                  <Icon size={15} class={actionDisabled ? 'text-muted' : 'text-cyan'} />
                  {row.label}
                </span>
                <strong>{actionDisabled ? 'Al dia' : row.value}</strong>
              </a>
            )
          }

          return (
            <div class="rounded-lg border border-cyan/20 bg-bg/50 px-3 py-2">
              <div class="flex items-center justify-between gap-3">
                <span class="inline-flex items-center gap-2 text-muted">
                  <Icon size={15} class="text-cyan" />
                  {row.label}
                </span>
                <strong class={valueToneByLevel[row.level]}>{row.value}</strong>
              </div>
            </div>
          )
        })}
      </div>
    </GlassPanel>
  )
}
