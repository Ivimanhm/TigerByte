import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const OUTPUT = resolve('src/data/updates.generated.ts')
const GITHUB_REPO = 'Ivimanhm/TigerByte'
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}`

function parseSemver(version) {
  const normalized = String(version || '')
    .trim()
    .replace(/^v/i, '')
    .split('-')[0]

  const parts = normalized.split('.').map((x) => Number.parseInt(x, 10))
  if (parts.length < 3 || parts.some((x) => Number.isNaN(x))) return null
  return { major: parts[0], minor: parts[1], patch: parts[2] }
}

function classifyBySemver(currentVersion, previousVersion) {
  const current = parseSemver(currentVersion)
  const previous = parseSemver(previousVersion)
  if (!current || !previous) return 'ACTUALIZACION'

  if (current.major > previous.major) return 'CAMBIO MAYOR'
  if (current.minor > previous.minor) return 'NUEVA FUNCION'
  if (current.patch > previous.patch) return 'CAMBIO MENOR'
  return 'ACTUALIZACION'
}

function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${d} ${monthNames[m - 1]}, ${y}`
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'TigerByte2-updates-script',
    },
  })

  if (!res.ok) {
    throw new Error(`GitHub API error ${res.status} for ${url}`)
  }

  return res.json()
}

async function getRemoteUpdates() {
  const perPage = 100
  const releases = await fetchJson(`${GITHUB_API}/releases?per_page=${perPage}&page=1`)
  if (!Array.isArray(releases) || releases.length === 0) return []

  return releases.map((release, index) => {
    const currentTag = String(release?.tag_name || '').trim()
    const nextTag = String(releases[index + 1]?.tag_name || '').trim()
    const note =
      String(release?.name || '').trim() ||
      String(release?.body || '').split('\n').find((line) => line.trim())?.trim() ||
      'Sin descripcion'
    const dateRaw = String(release?.published_at || release?.created_at || '').slice(0, 10)
    return {
      version: currentTag || 'Sin version',
      tag: nextTag ? classifyBySemver(currentTag, nextTag) : 'ACTUALIZACION',
      date: dateRaw ? formatDate(dateRaw) : 'Fecha desconocida',
      note,
    }
  })
}

function getExistingUpdatesFromFile() {
  if (!existsSync(OUTPUT)) return []
  try {
    const raw = readFileSync(OUTPUT, 'utf8')
    const match = raw.match(/export const updates: UpdateItem\[] = (\[[\s\S]*\])\s*$/)
    if (!match) return []
    const parsed = JSON.parse(match[1])
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x) => x && x.version !== 'Sin datos')
  } catch {
    return []
  }
}

let updates = []
try {
  updates = await getRemoteUpdates()
} catch {
  updates = []
}

if (updates.length === 0) {
  const existing = getExistingUpdatesFromFile()
  updates = existing.length > 0
    ? existing
    : [
        {
          version: 'Sin datos',
          tag: 'INFO',
          date: 'Pendiente',
          note: `No fue posible obtener releases de ${GITHUB_REPO}.`,
        },
      ]
}

const source = `export interface UpdateItem {\n  version: string\n  tag: string\n  date: string\n  note: string\n}\n\nexport const updates: UpdateItem[] = ${JSON.stringify(updates, null, 2)}\n`

mkdirSync(resolve('src/data'), { recursive: true })
writeFileSync(OUTPUT, source)
console.log(`Generated ${updates.length} updates in ${OUTPUT}`)
