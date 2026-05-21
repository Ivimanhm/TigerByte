import { DatabaseSync } from 'node:sqlite'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const GITHUB_REPO = 'Ivimanhm/TigerByte'
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}`
const MAIN_BRANCH = 'main'
const DB_DIR = resolve('data')
const DB_PATH = resolve(DB_DIR, 'tigerbyte.sqlite')
const OUTPUT = resolve('src/data/system-status.generated.ts')

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${d} ${monthNames[m - 1]}, ${y}`
}

function daysBetween(isoDate) {
  const start = new Date(`${isoDate}T00:00:00Z`)
  const now = new Date()
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const utcStart = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate())
  return Math.max(0, Math.floor((utcNow - utcStart) / 86400000))
}

function normalizeVersion(version) {
  return String(version || '').trim().replace(/^v/i, '')
}

async function fetchJson(url) {
  const baseHeaders = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'TigerByte2-system-status-script',
  }
  const token = process.env.GITHUB_TOKEN

  const withTokenHeaders = token
    ? {
        ...baseHeaders,
        Authorization: `Bearer ${token}`,
      }
    : baseHeaders

  let res = await fetch(url, { headers: withTokenHeaders })
  if (!res.ok && token && (res.status === 401 || res.status === 403)) {
    // Retry unauthenticated in case local token is invalid/expired.
    res = await fetch(url, { headers: baseHeaders })
  }

  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${url}`)
  return res.json()
}

async function isUrlReachable(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'TigerByte2-system-status-script' },
    })
    return res.ok
  } catch {
    return false
  }
}

function ensureSQLite() {
  mkdirSync(DB_DIR, { recursive: true })
  const db = new DatabaseSync(DB_PATH)
  db.exec(`
    CREATE TABLE IF NOT EXISTS app_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `)
  db.exec(`
    INSERT OR IGNORE INTO app_meta (key, value) VALUES
      ('created_at', datetime('now')),
      ('schema_version', '1');
  `)
  db.close()
  return { ok: true, path: DB_PATH }
}

function getExistingSystemStatus() {
  if (!existsSync(OUTPUT)) return null
  try {
    const raw = readFileSync(OUTPUT, 'utf8')
    const match = raw.match(/export const systemStatus: SystemStatusItem\[] = (\[[\s\S]*\])\s*$/)
    if (!match) return null
    const parsed = JSON.parse(match[1])
    return Array.isArray(parsed) ? parsed : null
  } catch {
    return null
  }
}

async function buildStatus() {
  let repoReachable = false
  let commitsReachable = false
  let releasesReachable = false
  let latestCommitDate = ''
  let latestReleaseTag = ''
  let latestReleaseDate = ''
  let updateUrl = `https://github.com/${GITHUB_REPO}/releases`

  try {
    const commits = await fetchJson(`${GITHUB_API}/commits?sha=${MAIN_BRANCH}&per_page=1&page=1`)
    if (Array.isArray(commits) && commits.length > 0) {
      commitsReachable = true
      latestCommitDate = commits[0]?.commit?.author?.date?.slice(0, 10) || ''
    }
  } catch {
    commitsReachable = false
  }

  try {
    const release = await fetchJson(`${GITHUB_API}/releases/latest`)
    releasesReachable = true
    latestReleaseTag = release?.tag_name || ''
    latestReleaseDate = release?.published_at?.slice(0, 10) || release?.created_at?.slice(0, 10) || ''
    updateUrl = release?.assets?.[0]?.browser_download_url || release?.html_url || updateUrl
  } catch {
    try {
      // Fallback: include pre-releases when /latest is unavailable or no stable release exists.
      const releases = await fetchJson(`${GITHUB_API}/releases?per_page=1&page=1`)
      const release = Array.isArray(releases) ? releases[0] : null
      if (release) {
        releasesReachable = true
        latestReleaseTag = release?.tag_name || ''
        latestReleaseDate = release?.published_at?.slice(0, 10) || release?.created_at?.slice(0, 10) || ''
        updateUrl = release?.assets?.[0]?.browser_download_url || release?.html_url || updateUrl
      } else {
        releasesReachable = false
      }
    } catch {
      releasesReachable = false
      // repo may not have releases yet; keep fallback URL
    }
  }
  repoReachable = commitsReachable || releasesReachable

  const sqlite = ensureSQLite()
  const currentVersion = process.env.npm_package_version || '0.0.0'

  let updatesValue = 'Sin datos'
  let updatesLevel = 'warn'
  let updatesDetail = latestCommitDate ? `Ultimo commit: ${formatDate(latestCommitDate)}` : 'Sin fecha remota'

  if (repoReachable) {
    const hasReleaseData = Boolean(latestReleaseTag)
    const isSameVersion =
      hasReleaseData && normalizeVersion(currentVersion) === normalizeVersion(latestReleaseTag)

    if (isSameVersion) {
      updatesValue = 'Actualizado'
      updatesLevel = 'ok'
      updatesDetail = `Version actual: ${currentVersion}`
    } else if (hasReleaseData) {
      const days = latestReleaseDate ? daysBetween(latestReleaseDate) : 0
      updatesValue = days === 0 ? 'Nueva version disponible' : `${days} dia${days === 1 ? '' : 's'} sin actualizar`
      updatesLevel = 'warn'
      updatesDetail = latestReleaseDate
        ? `Ultima release: ${latestReleaseTag} (${formatDate(latestReleaseDate)})`
        : `Ultima release: ${latestReleaseTag}`
    } else {
      updatesValue = 'Revision pendiente'
      updatesLevel = 'warn'
    }
  }

  const items = [
    {
      id: 'repo',
      label: 'Repositorio GitHub',
      value: repoReachable ? 'Operativo' : 'Sin conexion',
      level: repoReachable ? 'ok' : 'error',
      detail: repoReachable
        ? commitsReachable
          ? `GitHub online (${MAIN_BRANCH}) accesible`
          : 'GitHub online (releases) accesible'
        : 'No se pudo contactar GitHub online',
      actionUrl: `https://github.com/${GITHUB_REPO}`,
    },
    {
      id: 'db',
      label: 'Base de datos',
      value: sqlite.ok ? 'SQLite conectada' : 'Sin conexion',
      level: sqlite.ok ? 'ok' : 'error',
      detail: sqlite.ok ? DB_PATH : 'Error al inicializar SQLite',
    },
    {
      id: 'updates',
      label: 'Actualizaciones',
      value: updatesValue,
      level: updatesLevel,
      detail: updatesDetail,
    },
    {
      id: 'action',
      label: 'Actualizar app',
      value: 'Descargar',
      level: 'action',
      detail: updateUrl,
      actionUrl: updateUrl,
    },
  ]

  if (!repoReachable) {
    const webReachable = await isUrlReachable(`https://github.com/${GITHUB_REPO}`)
    if (webReachable) {
      repoReachable = true
    }
  }

  if (!repoReachable) {
    const existing = getExistingSystemStatus()
    const existingRepo = existing?.find((x) => x?.id === 'repo')
    // Reuse only if previous snapshot had a healthy repo status.
    if (existing && existing.length > 0 && existingRepo?.value === 'Operativo') {
      return existing
    }
  }

  return items
}

const items = await buildStatus()
const source = `export interface SystemStatusItem {\n  id: 'repo' | 'db' | 'updates' | 'action'\n  label: string\n  value: string\n  level: 'ok' | 'warn' | 'error' | 'action'\n  detail?: string\n  actionUrl?: string\n}\n\nexport const systemStatus: SystemStatusItem[] = ${JSON.stringify(items, null, 2)}\n`

mkdirSync(resolve('src/data'), { recursive: true })
writeFileSync(OUTPUT, source)
console.log(`Generated system status in ${OUTPUT}`)
