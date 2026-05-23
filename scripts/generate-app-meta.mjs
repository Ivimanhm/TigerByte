import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const OUTPUT = resolve('src/data/app-meta.generated.ts')
const currentVersion = process.env.npm_package_version || '0.0.0'
const source = `export const appMeta = {\n  currentVersion: ${JSON.stringify(currentVersion)},\n  repo: 'Ivimanhm/TigerByte',\n}\n`

mkdirSync(resolve('src/data'), { recursive: true })
writeFileSync(OUTPUT, source)
console.log(`Generated app meta in ${OUTPUT}`)
