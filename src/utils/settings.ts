export interface AppSettings {
  operatorName: string
  showAdvancedStatus: boolean
  glowIntensity: 'Suave' | 'Media' | 'Fuerte'
  reducedAnimations: boolean
  checkUpdatesOnStart: boolean
  autoDownloadRelease: boolean
  verifyIntegrity: boolean
}

export const SETTINGS_STORAGE_KEY = 'tb_settings'

export const defaultSettings: AppSettings = {
  operatorName: 'TigerByte',
  showAdvancedStatus: true,
  glowIntensity: 'Media',
  reducedAnimations: true,
  checkUpdatesOnStart: true,
  autoDownloadRelease: false,
  verifyIntegrity: true,
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return defaultSettings
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      ...defaultSettings,
      ...parsed,
    }
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
}

export function applyVisualSettings(settings: AppSettings) {
  const root = document.documentElement
  root.setAttribute('data-glow-intensity', settings.glowIntensity.toLowerCase())

  if (settings.reducedAnimations) {
    root.classList.add('reduced-motion')
  } else {
    root.classList.remove('reduced-motion')
  }
}
