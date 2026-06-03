import { Database, Download, RefreshCw, Server } from 'lucide-preact'
import { useState } from 'preact/hooks'
import { GlassPanel } from '../../components/ui/GlassPanel'
import { appMeta } from '../../data/app-meta.generated'
import { systemStatus } from '../../data/system-status.generated'
import { normalizeVersion } from '../../utils/version'

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

function daysBetween(isoDate: string) {
  const start = new Date(`${isoDate}T00:00:00Z`)
  const now = new Date()
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const utcStart = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  return Math.max(0, Math.floor((utcNow - utcStart) / 86400000))
}

type ReleaseInfo = {
  tagName: string
  publishedDate: string
  url: string
  note: string
}

async function fetchLatestRelease(repo: string): Promise<ReleaseInfo | null> {
  const base = `https://api.github.com/repos/${repo}`
  const headers = {
    Accept: 'application/vnd.github+json',
  }

  const mapRelease = (release: any): ReleaseInfo | null => {
    const tagName = String(release?.tag_name || '')
    if (!tagName) return null
    const publishedDate = String(release?.published_at || release?.created_at || '').slice(0, 10)
    const url = String(
      release?.assets?.[0]?.browser_download_url || release?.html_url || `https://github.com/${repo}/releases`
    )
    const note =
      String(release?.name || '').trim() ||
      String(release?.body || '')
        .split('\n')
        .find((line: string) => line.trim())
        ?.trim() ||
      'TigerByte'
    return { tagName, publishedDate, url, note }
  }

  try {
    const res = await fetch(`${base}/releases/latest`, { headers })
    if (res.ok) return mapRelease(await res.json())
  } catch {
    // fallback below
  }

  try {
    const res = await fetch(`${base}/releases?per_page=1&page=1`, { headers })
    if (!res.ok) return null
    const releases = await res.json()
    if (!Array.isArray(releases) || releases.length === 0) return null
    return mapRelease(releases[0])
  } catch {
    return null
  }
}

export function StatusSection() {
  const [statusRows, setStatusRows] = useState(systemStatus)
  const [checkingUpdates, setCheckingUpdates] = useState(false)

  const updatesRow = statusRows.find((item) => item.id === 'updates')
  const updatesUpToDate = updatesRow?.level === 'ok'
  const updatesWithoutData = updatesRow?.value === 'Sin datos'

  const refreshUpdatesStatus = async () => {
    if (checkingUpdates) return
    setCheckingUpdates(true)

    const release = await fetchLatestRelease(appMeta.repo)

    setStatusRows((prev) =>
      prev.map((row) => {
        if (row.id === 'updates') {
          if (!release) {
            return { ...row, value: 'Sin datos', level: 'warn', detail: 'No se pudo comprobar GitHub ahora' }
          }

          const isSameVersion = normalizeVersion(appMeta.currentVersion) === normalizeVersion(release.tagName)
          if (isSameVersion) {
            return {
              ...row,
              value: 'Actualizado',
              level: 'ok',
              detail: `Version actual: ${appMeta.currentVersion}`,
            }
          }

          window.dispatchEvent(
            new CustomEvent('tigerbyte:updates-refresh', {
              detail: {
                version: release.tagName,
                dateIso: release.publishedDate,
                note: release.note,
              },
            })
          )

          const days = release.publishedDate ? daysBetween(release.publishedDate) : 0
          return {
            ...row,
            value: days === 0 ? 'Version disponible' : `${days} dia${days === 1 ? '' : 's'} sin actualizar`,
            level: 'warn',
            detail: `Ultima release: ${release.tagName}`,
          }
        }

        if (row.id === 'action') {
          return release ? { ...row, actionUrl: release.url } : row
        }

        return row
      })
    )

    setCheckingUpdates(false)
  }

  return (
    <GlassPanel class="reveal p-6">
      <h3 class="mb-5 text-2xl">Estado del sistema</h3>
      <div class="space-y-3 text-sm">
        {statusRows.map((row) => {
          const Icon = iconById[row.id]
          const isRepo = row.id === 'repo'
          const isUpdates = row.id === 'updates'
          const isAction = row.id === 'action'
          const actionDisabled = isAction && (updatesUpToDate || updatesWithoutData)

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
                <strong>{updatesUpToDate ? 'Al dia' : row.value}</strong>
              </a>
            )
          }

          if (isRepo && row.actionUrl) {
            return (
              <a
                href={row.actionUrl}
                target="_blank"
                rel="noreferrer"
                class="block w-full rounded-lg border border-cyan/20 bg-bg/50 px-3 py-2 transition hover:border-cyan/40 hover:bg-bg/65"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="inline-flex items-center gap-2 text-muted">
                    <Icon size={15} class="text-cyan" />
                    {row.label}
                  </span>
                  <strong class={valueToneByLevel[row.level]}>{row.value}</strong>
                </div>
              </a>
            )
          }

          if (isUpdates) {
            return (
              <button
                type="button"
                onClick={refreshUpdatesStatus}
                disabled={checkingUpdates}
                class="w-full rounded-lg border border-cyan/20 bg-bg/50 px-3 py-2 text-left transition hover:border-cyan/40 hover:bg-bg/65 disabled:cursor-wait disabled:opacity-80"
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="inline-flex items-center gap-2 text-muted">
                    <Icon size={15} class={`text-cyan ${checkingUpdates ? 'animate-spin' : ''}`} />
                    {row.label}
                  </span>
                  <strong class={valueToneByLevel[row.level]}>{checkingUpdates ? 'Comprobando...' : row.value}</strong>
                </div>
              </button>
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
