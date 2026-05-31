import { Bell, BookOpen, Boxes, Headset, Home, Info, Moon, Search, Settings, Sun, UserCircle2 } from 'lucide-preact'
import { useEffect, useRef, useState } from 'preact/hooks'
import { updates } from '../../data/updates.generated'

const THEME_STORAGE_KEY = 'tb_theme'

const navItems = [
  { label: 'Inicio', href: '#', icon: Home },
  { label: 'Funciones', href: '#special-features', icon: Boxes },
  { label: 'Guias', href: '#guides', icon: BookOpen },
  { label: 'Config', href: '#config', icon: Settings },
  { label: 'Soporte', href: '#troubleshooting', icon: Headset },
]

export function Navbar() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [currentHash, setCurrentHash] = useState(typeof window !== 'undefined' ? window.location.hash : '')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useState(
    updates.slice(0, 3).map((u) => ({
      id: `${u.version}-${u.date}`,
      title: `Nueva actualizacion ${u.version}`,
      message: u.note,
      date: u.date,
    }))
  )
  const notificationsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    const next = saved === 'light' ? 'light' : 'dark'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }, [])

  useEffect(() => {
    const onHashChange = () => setCurrentHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!notificationsRef.current) return
      if (!notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }

    function onEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsNotificationsOpen(false)
    }

    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem(THEME_STORAGE_KEY, next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <header class="sticky top-0 z-30 px-2 py-3">
      <nav class="mx-auto flex w-[min(98%,1800px)] items-center justify-between rounded-xl bg-[#050d20]/90 px-5 py-3 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_18px_42px_rgba(1,5,16,0.38)] backdrop-blur-md">
        <div class="flex items-center gap-3">
          <a href="#" class="inline-flex items-center gap-3 transition hover:opacity-90" aria-label="Ir al menu principal">
            <span class="grid h-[34px] w-[34px] place-items-center overflow-hidden rounded-lg border border-violet/60 bg-violet/15 p-1 shadow-[0_0_12px_rgba(139,92,246,0.42)]">
              <img src="/favicon-32.png" alt="" class="h-full w-full object-contain" />
            </span>
            <strong class="logo-font text-xl">TigerByte</strong>
          </a>
          <span class="ml-4 hidden h-7 w-px bg-violet/15 xl:block" />
        </div>

        <ul class="hidden items-center gap-2 text-sm text-muted lg:flex">
          {navItems.map((item) => {
            const isActive = item.href === '#' ? currentHash === '' || currentHash === '#' : currentHash === item.href
            const Icon = item.icon

            return (
              <li key={item.href}>
                <a
                  href={item.href}
                  class={`group relative inline-flex items-center gap-1.5 rounded-md px-3 py-2 transition ${
                    isActive ? 'text-text' : 'text-muted hover:text-text'
                  }`}
                >
                  <Icon size={13} class="text-violet/85 transition group-hover:text-violet" />
                  <span>{item.label}</span>
                  {isActive ? (
                    <span class="absolute inset-x-2 -bottom-1 h-[2px] rounded-full bg-violet shadow-[0_0_12px_rgba(139,92,246,0.95)]" />
                  ) : null}
                </a>
              </li>
            )
          })}
        </ul>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="nav-icon-btn inline-flex h-8 w-8 items-center justify-center text-violet transition hover:text-text"
            aria-label="Buscar"
            title="Buscar"
          >
            <Search size={15} />
          </button>
          <span class="nav-divider h-6 w-px" />

          <div class="relative" ref={notificationsRef}>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen((v) => !v)}
              class="nav-icon-btn relative inline-flex h-8 w-8 items-center justify-center text-violet transition hover:text-text"
              aria-label="Notificaciones"
              title="Notificaciones"
              aria-expanded={isNotificationsOpen}
            >
              <Bell size={15} />
              {notifications.length > 0 ? (
                <span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-violet shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              ) : null}
            </button>

            {isNotificationsOpen ? (
              <div class="absolute right-0 top-[3.2rem] z-40 w-[min(92vw,380px)] rounded-xl bg-[#050d20]/95 p-3 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_18px_42px_rgba(0,0,0,0.55)] backdrop-blur-md">
                <div class="mb-2 flex items-center justify-between">
                  <strong class="text-sm text-text">Notificaciones</strong>
                  {notifications.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setNotifications([])}
                      class="text-xs text-violet transition hover:text-text"
                    >
                      Marcar todo leido
                    </button>
                  ) : null}
                </div>

                {notifications.length === 0 ? (
                  <p class="rounded-lg bg-[#09152c]/74 px-3 py-3 text-sm text-muted shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
                    No hay notificaciones por ahora.
                  </p>
                ) : (
                  <ul class="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {notifications.map((n) => (
                      <li key={n.id} class="rounded-lg bg-[#09152c]/74 p-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
                        <p class="inline-flex items-center gap-2 text-sm text-text">
                          <Info size={14} class="text-violet" />
                          {n.title}
                        </p>
                        <p class="mt-1 text-xs text-muted">{n.message}</p>
                        <p class="mt-1 text-[11px] text-muted">{n.date}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            class="nav-icon-btn inline-flex h-8 w-8 items-center justify-center text-violet transition hover:text-text"
            aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            type="button"
            class="nav-icon-btn inline-flex h-8 w-8 items-center justify-center rounded-full text-violet transition hover:text-text"
            aria-label="Perfil"
            title="Perfil"
          >
            <UserCircle2 size={16} />
          </button>
        </div>
      </nav>
    </header>
  )
}
