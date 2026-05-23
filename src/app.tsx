import { LandingPage } from './pages/LandingPage'
import { TroubleshootingPage } from './pages/TroubleshootingPage'
import { GuidesPage } from './pages/GuidesPage'
import { ConfigPage } from './pages/ConfigPage'
import { SpecialFeaturesPage } from './pages/SpecialFeaturesPage'
import { GameToolsPage } from './pages/GameToolsPage'
import { useEffect, useState } from 'preact/hooks'
import { appMeta } from './data/app-meta.generated'
import { applyVisualSettings, loadSettings } from './utils/settings'

const UPDATE_NOTICE_STORAGE_KEY = 'tb_update_notice_dismissed_tag'

function normalizeVersion(version: string) {
  return version.trim().replace(/^v/i, '')
}

function isRemoteNewer(currentVersion: string, remoteVersion: string) {
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

export function App() {
  const [hash, setHash] = useState(typeof window !== 'undefined' ? window.location.hash : '')
  const [updateNotice, setUpdateNotice] = useState<{ version: string; url: string } | null>(null)

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    const settings = loadSettings()
    applyVisualSettings(settings)

    if (!settings.checkUpdatesOnStart) return

    const controller = new AbortController()
    const url = `https://api.github.com/repos/${appMeta.repo}/releases/latest`

    fetch(url, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) return null
        return res.json()
      })
      .then((release) => {
        const latestTag = release?.tag_name as string | undefined
        const releaseUrl = (release?.html_url as string | undefined) || `https://github.com/${appMeta.repo}/releases`
        if (!latestTag) return
        const dismissedRaw = localStorage.getItem(UPDATE_NOTICE_STORAGE_KEY)
        let dismissed: { version?: string } | null = null
        if (dismissedRaw) {
          try {
            dismissed = JSON.parse(dismissedRaw) as { version?: string }
          } catch {
            dismissed = null
          }
        }
        const alreadyDismissedForThisRelease =
          normalizeVersion(dismissed?.version || '') === normalizeVersion(latestTag)

        if (alreadyDismissedForThisRelease) return
        if (isRemoteNewer(appMeta.currentVersion, latestTag)) {
          setUpdateNotice({ version: latestTag, url: releaseUrl })
        }
      })
      .catch(() => {
        // Silent fail for offline/local environments.
      })

    return () => controller.abort()
  }, [])

  const page =
    hash === '#troubleshooting'
      ? <TroubleshootingPage />
      : hash === '#guides'
        ? <GuidesPage />
      : hash === '#config'
        ? <ConfigPage />
        : hash === '#special-features'
          ? <SpecialFeaturesPage />
          : hash === '#tools-lol'
            ? (
              <GameToolsPage
                gameName="League of Legends"
                subtitle="Creador de equipos y tierlist de campeones."
                features={['Generador de composiciones', 'Tierlist por parche', 'Sinergias y counters']}
              />
            )
            : hash === '#tools-dbd'
              ? (
                <GameToolsPage
                  gameName="Dead by Daylight"
                  subtitle="Creador de builds."
                  features={['Builds por asesino/superviviente', 'Perks recomendadas', 'Preset por estilo de juego']}
                />
              )
              : hash === '#tools-tarkov'
                ? (
                  <GameToolsPage
                    gameName="Escape from Tarkov"
                    subtitle="Mapas, builds de armas."
                    features={['Mapas interactivos', 'Builds por presupuesto', 'Comparador de municion']}
                  />
                )
                : hash === '#tools-rust'
                  ? (
                    <GameToolsPage
                      gameName="Rust"
                      subtitle="Planos de casas y calculadora de raids."
                      features={['Editor de planos', 'Calculadora de c4/cohetes', 'Checklist de defensa de base']}
                    />
                  )
            : <LandingPage />

  return (
    <>
      {updateNotice ? (
        <div class="fixed left-1/2 top-4 z-50 w-[min(94%,760px)] -translate-x-1/2 rounded-xl border border-cyan/40 bg-bg/90 px-4 py-3 shadow-[0_16px_40px_rgba(3,10,23,0.7)] backdrop-blur-md">
          <div class="flex items-center justify-between gap-3 text-sm">
            <p class="text-text">
              Nueva version disponible: <strong class="text-cyan">{updateNotice.version}</strong>
            </p>
            <div class="flex items-center gap-2">
              <a
                href={updateNotice.url}
                target="_blank"
                rel="noreferrer"
                class="modern-btn rounded-lg px-3 py-1.5 text-cyan transition hover:text-text"
              >
                Ver update
              </a>
              <button
                type="button"
                onClick={() => {
                  if (updateNotice?.version) {
                    localStorage.setItem(
                      UPDATE_NOTICE_STORAGE_KEY,
                      JSON.stringify({ version: updateNotice.version })
                    )
                  }
                  setUpdateNotice(null)
                }}
                class="rounded-lg border border-cyan/25 px-3 py-1.5 text-muted transition hover:border-cyan/45 hover:text-text"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {page}
    </>
  )
}

