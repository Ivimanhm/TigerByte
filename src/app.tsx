import { LandingPage } from './pages/LandingPage'
import { TroubleshootingPage } from './pages/TroubleshootingPage'
import { GuidesPage } from './pages/GuidesPage'
import { ConfigPage } from './pages/ConfigPage'
import { SpecialFeaturesPage } from './pages/SpecialFeaturesPage'
import { TeamBuilderPage } from './pages/games/lol/TeamBuilderPage'
import { ChampionTierlistPage } from './pages/games/lol/ChampionTierlistPage'
import { BuildCreatorPage } from './pages/games/dbd/BuildCreatorPage'
import { MapExtractionPage } from './pages/games/tarkov/MapExtractionPage'
import { BuildingPlansPage } from './pages/games/rust/BuildingPlansPage'
import { RaidCalculatorPage } from './pages/games/rust/RaidCalculatorPage'

import { useEffect, useState } from 'preact/hooks'
import { appMeta } from './data/app-meta.generated'
import { applyVisualSettings, loadSettings } from './utils/settings'
import { normalizeVersion, isRemoteNewer } from './utils/version'

const UPDATE_NOTICE_STORAGE_KEY = 'tb_update_notice_dismissed_tag'

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
    hash === '#troubleshooting' ? <TroubleshootingPage /> :
    hash === '#guides' ? <GuidesPage /> :
    hash === '#config' ? <ConfigPage /> :
    hash === '#special-features' ? <SpecialFeaturesPage /> :
    hash === '#lol-team-builder' ? <TeamBuilderPage /> :
    hash === '#lol-champion-tierlist' ? <ChampionTierlistPage /> :
    hash === '#dbd-build-creator' ? <BuildCreatorPage /> :
    hash === '#tarkov-map-extraction' ? <MapExtractionPage /> :
    hash === '#rust-building-plans' ? <BuildingPlansPage /> :
    hash === '#rust-raid-calculator' ? <RaidCalculatorPage /> :
    <LandingPage />

  return (
    <>
      {updateNotice ? (
        <div class="fixed left-1/2 top-4 z-50 w-[min(94%,760px)] -translate-x-1/2 rounded-xl bg-[#050d20]/95 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_16px_40px_rgba(3,10,23,0.7)] backdrop-blur-md">
          <div class="flex items-center justify-between gap-3 text-sm">
            <p class="text-text">
              Version disponible: <strong class="text-violet">{updateNotice.version}</strong>
            </p>
            <div class="flex items-center gap-2">
              <a
                href={updateNotice.url}
                target="_blank"
                rel="noreferrer"
                class="modern-btn rounded-lg px-3 py-1.5 text-violet transition hover:text-text"
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
                class="rounded-lg bg-[#0b172f] px-3 py-1.5 text-muted shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b] hover:text-text"
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

