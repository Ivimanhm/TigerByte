import { DatabaseSync } from 'node:sqlite'
import { mkdirSync, writeFileSync } from 'node:fs'
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

async function fetchJson(url) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'TigerByte2-system-status-script',
  }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${url}`)
  return res.json()
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

async function buildStatus() {
  let repoReachable = false
  let latestCommitDate = ''
  let latestReleaseTag = ''
  let updateUrl = `https://github.com/${GITHUB_REPO}/releases`

  try {
    const commits = await fetchJson(`${GITHUB_API}/commits?sha=${MAIN_BRANCH}&per_page=1&page=1`)
    if (Array.isArray(commits) && commits.length > 0) {
      repoReachable = true
      latestCommitDate = commits[0]?.commit?.author?.date?.slice(0, 10) || ''
    }
  } catch {
    repoReachable = false
  }

  try {
    const release = await fetchJson(`${GITHUB_API}/releases/latest`)
    latestReleaseTag = release?.tag_name || ''
    updateUrl = release?.assets?.[0]?.browser_download_url || release?.html_url || updateUrl
  } catch {
    // repo may not have releases yet; keep fallback URL
  }

  const sqlite = ensureSQLite()
  const currentVersion = process.env.npm_package_version || '0.0.0'

  let updatesValue = 'Sin datos'
  let updatesLevel = 'warn'

  if (repoReachable) {
    if (latestReleaseTag && currentVersion === latestReleaseTag) {
      updatesValue = currentVersion
      updatesLevel = 'ok'
    } else if (latestCommitDate) {
      const days = daysBetween(latestCommitDate)
      updatesValue = days === 0 ? currentVersion : `${days} dia${days === 1 ? '' : 's'} sin actualizar`
      updatesLevel = days === 0 ? 'ok' : 'warn'
    } else {
      updatesValue = 'Revision pendiente'
      updatesLevel = 'warn'
    }
  }

  const items = [
    {
      id: 'repo',
      label: 'Repositorio Git',
      value: repoReachable ? 'Operativo' : 'Sin conexion',
      level: repoReachable ? 'ok' : 'error',
      detail: repoReachable ? `Rama ${MAIN_BRANCH} accesible` : 'No se pudo contactar GitHub',
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
      detail: latestCommitDate ? `Ultimo commit: ${formatDate(latestCommitDate)}` : 'Sin fecha remota',
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

  return items
}

const items = await buildStatus()
const source = `export interface SystemStatusItem {\n  id: 'repo' | 'db' | 'updates' | 'action'\n  label: string\n  value: string\n  level: 'ok' | 'warn' | 'error' | 'action'\n  detail?: string\n  actionUrl?: string\n}\n\nexport const systemStatus: SystemStatusItem[] = ${JSON.stringify(items, null, 2)}\n`

mkdirSync(resolve('src/data'), { recursive: true })
writeFileSync(OUTPUT, source)
console.log(`Generated system status in ${OUTPUT}`)
