import { createWriteStream, existsSync, mkdirSync, readFileSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import https from 'node:https'
import http from 'node:http'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dataPath = join(root, 'src', 'data', 'dbdKillerAddonsData.json')
const outDir = join(root, 'public', 'dbd', 'addons')
const data = JSON.parse(readFileSync(dataPath, 'utf8'))

mkdirSync(outDir, { recursive: true })

const wikiFileUrl = (fileName) => `https://deadbydaylight.wiki.gg/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}`
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function download(url, target, redirects = 0) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http
    const request = client.get(url, { headers: { 'User-Agent': 'TigerByte asset downloader' } }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode ?? 0) && response.headers.location) {
        response.resume()
        if (redirects > 8) {
          reject(new Error(`Too many redirects for ${url}`))
          return
        }
        const nextUrl = new URL(response.headers.location, url).toString()
        download(nextUrl, target, redirects + 1).then(resolve, reject)
        return
      }

      if ((response.statusCode ?? 500) >= 400) {
        response.resume()
        reject(new Error(`HTTP ${response.statusCode} for ${url}`))
        return
      }

      const file = createWriteStream(target)
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
      file.on('error', reject)
    })

    request.on('error', reject)
    request.setTimeout(20000, () => {
      request.destroy(new Error(`Timeout for ${url}`))
    })
  })
}

async function downloadWithRetry(url, target) {
  let lastError
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await download(url, target)
      return
    } catch (error) {
      lastError = error
      if (existsSync(target)) unlinkSync(target)
      await wait(600 + attempt * 1200)
    }
  }

  throw lastError
}

const addons = Object.values(data).flat()
const unique = new Map()

for (const addon of addons) {
  if (!addon?.image) continue
  unique.set(addon.image, addon)
}

let downloaded = 0
let skipped = 0
let failed = 0

for (const [image, addon] of unique) {
  const target = join(outDir, `${image}.png`)
  if (existsSync(target)) {
    skipped += 1
    continue
  }

  const candidates = [
    `IconAddon ${image}.png`,
    `FulliconAddon ${image}.png`,
  ]

  let ok = false
  for (const fileName of candidates) {
    try {
      await wait(250)
      await downloadWithRetry(wikiFileUrl(fileName), target)
      downloaded += 1
      ok = true
      break
    } catch {
      if (existsSync(target)) unlinkSync(target)
    }
  }

  if (!ok) {
    failed += 1
    console.warn(`Missing addon icon: ${addon.name} (${image})`)
  }
}

console.log(`DBD addon icons: ${downloaded} downloaded, ${skipped} skipped, ${failed} missing`)
