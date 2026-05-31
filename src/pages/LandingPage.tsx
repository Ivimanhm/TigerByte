import { useEffect } from 'preact/hooks'
import { Footer } from '../components/layout/Footer'
import { HUDBackground } from '../components/effects/HUDBackground'
import { Navbar } from '../components/layout/Navbar'
import { GamesSection } from '../sections/games/GamesSection'
import { ShortcutsSection } from '../sections/shortcuts/ShortcutsSection'
import { StatusSection } from '../sections/status/StatusSection'
import { UpdatesSection } from '../sections/updates/UpdatesSection'
import { initRevealAnimations } from '../hooks/useRevealAnimations'

export function LandingPage() {
  useEffect(() => {
    initRevealAnimations()
  }, [])

  return (
    <div class="landing-legacy relative pb-10">
      <HUDBackground />
      <Navbar />
      <main class="mx-auto w-[min(98%,1800px)] space-y-8 pt-7">
        <GamesSection />
        <section class="reveal-group grid gap-5 lg:grid-cols-3">
          <StatusSection />
          <UpdatesSection />
          <ShortcutsSection />
        </section>
      </main>
      <Footer />
    </div>
  )
}
