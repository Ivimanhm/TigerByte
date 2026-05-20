import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const OUTPUT = resolve('src/data/updates.generated.ts')
const GITHUB_REPO = 'Ivimanhm/TigerByte'
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}`
const MAIN_BRANCH = 'main'

function classify(message) {
  const lower = message.toLowerCase()
  if (lower.includes('fix') || lower.includes('bug') || lower.includes('hotfix')) return 'FIX'
  if (lower.includes('refactor') || lower.includes('cleanup')) return 'MEJORA'
  if (lower.includes('feat') || lower.includes('add') || lower.includes('new')) return 'NUEVO'
  return 'UPDATE'
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
  let page = 1
  const allCommits = []

  while (true) {
    const commits = await fetchJson(
      `${GITHUB_API}/commits?sha=${MAIN_BRANCH}&per_page=${perPage}&page=${page}`
    )
    if (!Array.isArray(commits) || commits.length === 0) break
    allCommits.push(...commits)
    if (commits.length < perPage) break
    page += 1
  }

  return allCommits.map((commit) => {
    const subject = commit?.commit?.message?.split('\n')[0] || 'Sin descripcion'
    const dateRaw = commit?.commit?.author?.date?.slice(0, 10) || ''
    return {
      version: (commit.sha || 'commit').slice(0, 7),
      tag: 'COMMIT',
      date: dateRaw ? formatDate(dateRaw) : 'Fecha desconocida',
      note: subject,
    }
  })
}

let updates = []
try {
  updates = await getRemoteUpdates()
} catch {
  updates = []
}

if (updates.length === 0) {
  updates = [
    {
      version: 'Sin datos',
      tag: 'INFO',
      date: 'Pendiente',
      note: `No fue posible obtener versiones del repo ${GITHUB_REPO}.`,
    },
  ]
}

const source = `export interface UpdateItem {\n  version: string\n  tag: string\n  date: string\n  note: string\n}\n\nexport const updates: UpdateItem[] = ${JSON.stringify(updates, null, 2)}\n`

mkdirSync(resolve('src/data'), { recursive: true })
writeFileSync(OUTPUT, source)
console.log(`Generated ${updates.length} updates in ${OUTPUT}`)
