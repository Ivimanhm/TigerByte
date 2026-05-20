import { ArrowLeft, Palette, Shield, UserCog, Wrench } from 'lucide-preact'
import { useEffect, useState } from 'preact/hooks'
import { Footer } from '../components/layout/Footer'
import { HUDBackground } from '../components/effects/HUDBackground'
import { Navbar } from '../components/layout/Navbar'
import { GlassPanel } from '../components/ui/GlassPanel'
import {
  applyVisualSettings,
  defaultSettings,
  loadSettings,
  saveSettings,
  type AppSettings,
} from '../utils/settings'

export function ConfigPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  function saveConfig() {
    saveSettings(settings)
    applyVisualSettings(settings)
    setSavedMsg('Configuracion guardada')
    window.setTimeout(() => setSavedMsg(''), 1800)
  }

  return (
    <div class="relative pb-10">
      <HUDBackground />
      <Navbar />
      <main class="mx-auto w-[min(96%,1000px)] space-y-6 pt-7">
        <a
          href="#"
          class="modern-btn inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-cyan transition hover:text-text"
        >
          <ArrowLeft size={15} />
          Volver al inicio
        </a>

        <GlassPanel class="p-6">
          <h1 class="mb-2 text-3xl">Configuracion</h1>
          <p class="mb-6 text-muted">Ajustes generales para personalizar la app y preparar futuras funciones.</p>

          <div class="grid gap-4 md:grid-cols-2">
            <section class="rounded-panel border border-cyan/20 bg-bg/45 p-4">
              <h2 class="mb-3 inline-flex items-center gap-2 text-lg"><UserCog size={16} class="text-cyan" />Perfil</h2>
              <div class="space-y-3 text-sm text-muted">
                <label class="block">
                  Nombre del operador
                  <input
                    type="text"
                    value={settings.operatorName}
                    onInput={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        operatorName: (e.currentTarget as HTMLInputElement).value,
                      }))}
                    class="field-control mt-1 w-full rounded-lg px-3 py-2"
                  />
                </label>
                <label class="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.showAdvancedStatus}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        showAdvancedStatus: (e.currentTarget as HTMLInputElement).checked,
                      }))}
                    class="check-control"
                  />
                  Mostrar estado avanzado
                </label>
              </div>
            </section>

            <section class="rounded-panel border border-cyan/20 bg-bg/45 p-4">
              <h2 class="mb-3 inline-flex items-center gap-2 text-lg"><Palette size={16} class="text-cyan" />Interfaz</h2>
              <div class="space-y-3 text-sm text-muted">
                <label class="block">
                  Intensidad del glow
                  <select
                    value={settings.glowIntensity}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        glowIntensity: (e.currentTarget as HTMLSelectElement).value as AppSettings['glowIntensity'],
                      }))}
                    class="field-control mt-1 w-full rounded-lg px-3 py-2"
                  >
                    <option value="Suave">Suave</option>
                    <option value="Media">Media</option>
                    <option value="Fuerte">Fuerte</option>
                  </select>
                </label>
                <label class="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.reducedAnimations}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        reducedAnimations: (e.currentTarget as HTMLInputElement).checked,
                      }))}
                    class="check-control"
                  />
                  Animaciones reducidas
                </label>
              </div>
            </section>

            <section class="rounded-panel border border-cyan/20 bg-bg/45 p-4">
              <h2 class="mb-3 inline-flex items-center gap-2 text-lg"><Wrench size={16} class="text-cyan" />Actualizaciones</h2>
              <div class="space-y-3 text-sm text-muted">
                <label class="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.checkUpdatesOnStart}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        checkUpdatesOnStart: (e.currentTarget as HTMLInputElement).checked,
                      }))}
                    class="check-control"
                  />
                  Comprobar updates al iniciar
                </label>
                <label class="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoDownloadRelease}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        autoDownloadRelease: (e.currentTarget as HTMLInputElement).checked,
                      }))}
                    class="check-control"
                  />
                  Descargar release automaticamente
                </label>
              </div>
            </section>

            <section class="rounded-panel border border-cyan/20 bg-bg/45 p-4">
              <h2 class="mb-3 inline-flex items-center gap-2 text-lg"><Shield size={16} class="text-cyan" />Seguridad</h2>
              <div class="space-y-3 text-sm text-muted">
                <label class="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.verifyIntegrity}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        verifyIntegrity: (e.currentTarget as HTMLInputElement).checked,
                      }))}
                    class="check-control"
                  />
                  Verificar integridad de archivos
                </label>
                <div class="flex items-center gap-3">
                  <button type="button" onClick={saveConfig} class="modern-btn rounded-lg px-3 py-2 text-cyan transition hover:text-text">
                    Guardar configuracion
                  </button>
                  {savedMsg ? <span class="text-xs text-emerald-300">{savedMsg}</span> : null}
                </div>
              </div>
            </section>
          </div>
        </GlassPanel>
      </main>
      <Footer />
    </div>
  )
}
