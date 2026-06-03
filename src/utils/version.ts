export function normalizeVersion(version: string): string {
  return String(version || '').trim().replace(/^v/i, '')
}

export function isRemoteNewer(currentVersion: string, remoteVersion: string): boolean {
  const a = normalizeVersion(currentVersion).split('.').map((x) => Number.parseInt(x, 10) || 0)
  const b = normalizeVersion(remoteVersion).split('.').map((x) => Number.parseInt(x, 10) || 0)
  const max = Math.max(a.length, b.length)
  for (let i = 0; i < max; i += 1) {
    const av = a[i] ?? 0
    const bv = b[i] ?? 0
    if (bv > av) return true
    if (bv < av) return false
  }
  return false
}
