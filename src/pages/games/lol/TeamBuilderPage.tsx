import {
  ChevronRight,
  CircleHelp,
  Dices,
  Eye,
  History,
  ListChecks,
  Lock,
  MinusCircle,
  PlusCircle,
  RefreshCw,
  Settings2,
  Shield,
  Sparkles,
  Swords,
  Trash2,
  Trees,
  Trophy,
  Save,
  UserCircle2,
  UserRoundPlus,
  Wand2,
  X,
} from 'lucide-preact'
import type { ComponentChildren } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import championsData from '../../../data/lolChampionsData.json'
import lolHeroImage from '../../../assets/games/LOL 2.png'
import { Footer } from '../../../components/layout/Footer'
import { HUDBackground } from '../../../components/effects/HUDBackground'
import { Navbar } from '../../../components/layout/Navbar'

type Role = 'Top' | 'Jungla' | 'Mid' | 'ADC' | 'Support'

type Champion = {
  id: string
  name: string
  imageUrl: string
  roles: Role[]
  types?: string[]
}

type Team = Record<Role, Champion | null>

type RecentTeam = {
  id: string
  createdAt: number
  team: Team
}

const ROLES: Role[] = ['Top', 'Jungla', 'Mid', 'ADC', 'Support']
const RECENT_TEAMS_KEY = 'tb_lol_recent_teams'
const SAVED_TEAMS_KEY = 'tb_lol_saved_teams'
const RECENT_TEAMS_LIMIT = 10
const RECENT_TEAMS_PREVIEW_LIMIT = 5
const SAVED_TEAMS_LIMIT = 30

const EMPTY_TEAM: Team = {
  Top: null,
  Jungla: null,
  Mid: null,
  ADC: null,
  Support: null,
}

const roleStyles: Record<Role, { ring: string; text: string; icon: typeof Swords }> = {
  Top: { ring: 'ring-violet/70', text: 'text-violet-300', icon: Swords },
  Jungla: { ring: 'ring-emerald-400/70', text: 'text-emerald-300', icon: Trees },
  Mid: { ring: 'ring-sky-400/70', text: 'text-sky-300', icon: Wand2 },
  ADC: { ring: 'ring-amber-400/70', text: 'text-amber-300', icon: Swords },
  Support: { ring: 'ring-orange-300/70', text: 'text-orange-200', icon: Shield },
}

const championPool = (championsData.champions as Champion[]) ?? []

function pickRandomChampionByRole(role: Role, excludedIds: Set<string>) {
  const available = championPool.filter((champion) => champion.roles.includes(role) && !excludedIds.has(champion.id))
  if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)]
}

function pickRandomChampion(excludedIds: Set<string>) {
  const available = championPool.filter((champion) => !excludedIds.has(champion.id))
  if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)]
}

function pickRandomChampionFromPool(pool: Champion[], excludedIds: Set<string>) {
  const available = pool.filter((champion) => !excludedIds.has(champion.id))
  if (available.length === 0) return null
  return available[Math.floor(Math.random() * available.length)]
}

function formatRelativeTime(timestamp: number) {
  const diffMinutes = Math.max(1, Math.round((Date.now() - timestamp) / 60000))
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`
  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`
  return 'Ayer'
}

function loadRecentTeams() {
  try {
    const raw = localStorage.getItem(RECENT_TEAMS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RecentTeam[]
  } catch {
    return []
  }
}

function saveRecentTeams(teams: RecentTeam[]) {
  localStorage.setItem(RECENT_TEAMS_KEY, JSON.stringify(teams.slice(0, RECENT_TEAMS_LIMIT)))
}

function loadSavedTeams() {
  try {
    const raw = localStorage.getItem(SAVED_TEAMS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as RecentTeam[]
  } catch {
    return []
  }
}

function saveSavedTeams(teams: RecentTeam[]) {
  localStorage.setItem(SAVED_TEAMS_KEY, JSON.stringify(teams.slice(0, SAVED_TEAMS_LIMIT)))
}

export function TeamBuilderPage() {
  const [noRepeats, setNoRepeats] = useState(true)
  const [randomRoles, setRandomRoles] = useState(false)
  const [excludedChampionIds, setExcludedChampionIds] = useState<Set<string>>(() => new Set())
  const [showExcludeChampions, setShowExcludeChampions] = useState(false)
  const [rolesEnabled, setRolesEnabled] = useState<Record<Role, boolean>>({
    Top: true,
    Jungla: true,
    Mid: true,
    ADC: true,
    Support: true,
  })
  const [generatedTeam, setGeneratedTeam] = useState<Team>(EMPTY_TEAM)
  const [recentTeams, setRecentTeams] = useState<RecentTeam[]>([])
  const [savedTeams, setSavedTeams] = useState<RecentTeam[]>([])
  const [showAllRecentTeams, setShowAllRecentTeams] = useState(false)
  const [showSavedTeams, setShowSavedTeams] = useState(false)
  const [manualSelectionEnabled, setManualSelectionEnabled] = useState(false)
  const [activeManualRole, setActiveManualRole] = useState<Role | null>(null)
  const [showProDetails, setShowProDetails] = useState(false)
  const [showTeamGuide, setShowTeamGuide] = useState(false)
  const [manualTypeFilters, setManualTypeFilters] = useState<Record<Role, string>>({
    Top: 'Todos',
    Jungla: 'Todos',
    Mid: 'Todos',
    ADC: 'Todos',
    Support: 'Todos',
  })

  useEffect(() => {
    setRecentTeams(loadRecentTeams().slice(0, RECENT_TEAMS_LIMIT))
    setSavedTeams(loadSavedTeams().slice(0, SAVED_TEAMS_LIMIT))
  }, [])

  useEffect(() => {
    if (!showProDetails) return

    function onEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setShowProDetails(false)
    }

    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [showProDetails])

  function pushRecentTeam(team: Team) {
    const hasChampion = ROLES.some((role) => team[role])
    if (!hasChampion) return

    const next = [
      {
        id: `${Date.now()}`,
        createdAt: Date.now(),
        team,
      },
      ...recentTeams,
    ].slice(0, RECENT_TEAMS_LIMIT)

    setRecentTeams(next)
    saveRecentTeams(next)
  }

  function generateTeam() {
    const used = new Set<string>(excludedChampionIds)
    const next: Team = { ...EMPTY_TEAM }

    for (const role of ROLES) {
      if (!rolesEnabled[role]) continue
      const unavailableIds = noRepeats ? used : new Set(excludedChampionIds)
      const chosen = randomRoles ? pickRandomChampion(unavailableIds) : pickRandomChampionByRole(role, unavailableIds)
      next[role] = chosen
      if (chosen && noRepeats) used.add(chosen.id)
    }

    setGeneratedTeam(next)
    pushRecentTeam(next)
  }

  function rerollRole(role: Role) {
    if (!rolesEnabled[role]) return
    const used = new Set<string>(excludedChampionIds)

    if (noRepeats) {
      for (const r of ROLES) {
        if (r === role) continue
        const current = generatedTeam[r]
        if (current) used.add(current.id)
      }
    }

    const sourceRole = manualSelectionEnabled ? activeManualRole ?? role : role
    const activeType = manualSelectionEnabled ? manualTypeFilters[sourceRole] : 'Todos'
    const manualTypedPool =
      activeType === 'Todos'
        ? championPool.filter((champion) => champion.roles.includes(sourceRole))
        : championPool.filter((champion) => champion.roles.includes(sourceRole) && champion.types?.includes(activeType))
    const chosen =
      manualSelectionEnabled && !randomRoles
        ? pickRandomChampionFromPool(manualTypedPool, used)
        : randomRoles
          ? pickRandomChampion(used)
          : pickRandomChampionByRole(role, used)
    setGeneratedTeam((prev) => ({ ...prev, [role]: chosen }))
  }

  function loadTeamFromHistory(team: Team) {
    setGeneratedTeam(team)
    setRolesEnabled((prev) => {
      const next = { ...prev }
      for (const role of ROLES) {
        next[role] = Boolean(team[role])
      }
      return next
    })
  }

  function saveCurrentTeam() {
    const hasChampion = ROLES.some((role) => generatedTeam[role])
    if (!hasChampion) return

    const next = [
      {
        id: `${Date.now()}`,
        createdAt: Date.now(),
        team: generatedTeam,
      },
      ...savedTeams,
    ].slice(0, SAVED_TEAMS_LIMIT)

    setSavedTeams(next)
    saveSavedTeams(next)
    setShowSavedTeams(true)
  }

  function deleteSavedTeam(teamId: string) {
    const next = savedTeams.filter((team) => team.id !== teamId)
    setSavedTeams(next)
    saveSavedTeams(next)
  }

  function assignManualChampion(role: Role, champion: Champion) {
    setGeneratedTeam((prev) => ({ ...prev, [role]: champion }))
    setRolesEnabled((prev) => ({ ...prev, [role]: true }))
    setActiveManualRole(null)
  }

  function resetOptions() {
    setGeneratedTeam({ ...EMPTY_TEAM })
    setRolesEnabled({ Top: true, Jungla: true, Mid: true, ADC: true, Support: true })
    setNoRepeats(true)
    setRandomRoles(false)
    setExcludedChampionIds(new Set())
    setShowExcludeChampions(false)
    setActiveManualRole(null)
  }

  function getFirstEnabledRole() {
    return ROLES.find((role) => rolesEnabled[role]) ?? 'Top'
  }

  const visibleRecentTeams = showAllRecentTeams ? recentTeams.slice(0, RECENT_TEAMS_LIMIT) : recentTeams.slice(0, RECENT_TEAMS_PREVIEW_LIMIT)
  const hasGeneratedTeam = ROLES.some((role) => generatedTeam[role])

  return (
    <div class="relative pb-10">
      <HUDBackground />
      <Navbar />

      <main class="mx-auto w-[min(98%,1800px)] space-y-5 pt-5">
        <section class="grid items-start gap-5 min-[900px]:grid-cols-[274px_minmax(0,1fr)] 2xl:grid-cols-[260px_minmax(0,1fr)_320px] 2xl:items-stretch">
          <aside class="lol-builder-side-lock flex self-start flex-col rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_50px_rgba(1,5,16,0.42)] min-[900px]:sticky min-[900px]:top-24 min-[900px]:p-4 2xl:self-stretch 2xl:p-5">
            <h2 class="mb-4 text-sm font-semibold uppercase text-violet">Configuracion</h2>

            <div class="mb-5 space-y-3">
              <ConfigInfo label="Modo" value="Aleatorio" icon={<Dices size={16} />} />
              <ConfigInfo label="Tamano del equipo" value="5 jugadores" icon={<UserRoundPlus size={16} />} />
            </div>

            <h3 class="mb-3 text-sm font-semibold uppercase text-violet">Roles</h3>
            <div class="mb-5 overflow-hidden rounded-xl bg-[#09152c]/74">
              {ROLES.map((role) => (
                <label key={role} class="flex items-center justify-between px-3 py-2.5 text-sm shadow-[inset_0_-1px_0_rgba(148,163,184,0.06)] last:shadow-none">
                  <span>{role}</span>
                  <input
                    type="checkbox"
                    checked={rolesEnabled[role]}
                    onChange={(event) =>
                      setRolesEnabled((prev) => ({
                        ...prev,
                        [role]: event.currentTarget.checked,
                      }))
                    }
                    class="check-control"
                  />
                </label>
              ))}
            </div>

            <h3 class="mb-3 text-sm font-semibold uppercase text-violet">Opciones</h3>
            <div class="mb-5 space-y-3">
              <OptionToggle label="Sin campeones repetidos" enabled={noRepeats} onClick={() => setNoRepeats((v) => !v)} />
              <OptionToggle label="Roles aleatorios" enabled={randomRoles} onClick={() => setRandomRoles((v) => !v)} />
            </div>

            <button
              type="button"
              onClick={resetOptions}
              class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b172f] px-3 py-2.5 text-sm text-cyan shadow-[inset_0_0_0_1px_rgba(57,216,255,0.10)] transition hover:bg-[#0d1d3b]"
            >
              <RefreshCw size={14} />
              Limpiar opciones
            </button>

            <section class="mt-5 flex h-[260px] min-h-0 flex-col overflow-hidden">
              <div class="mb-4 flex items-center gap-3">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet/16 text-violet shadow-[inset_0_0_0_1px_rgba(142,107,255,0.16)]">
                  <CircleHelp size={18} />
                </span>
                <h2 class="text-sm font-semibold uppercase text-violet">Como funciona?</h2>
              </div>

              <ul class="min-h-0 flex-1 space-y-4 overflow-hidden text-sm leading-5 text-muted">
                <li class="flex gap-3">
                  <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet shadow-[0_0_14px_rgba(142,107,255,0.85)]" />
                  <span>Activa los roles que quieres usar para crear un equipo completo.</span>
                </li>
                <li class="flex gap-3">
                  <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet shadow-[0_0_14px_rgba(142,107,255,0.85)]" />
                  <span>Con roles aleatorios, cualquier campeon puede aparecer en cualquier posicion.</span>
                </li>
                <li class="flex gap-3">
                  <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet shadow-[0_0_14px_rgba(142,107,255,0.85)]" />
                  <span>Excluye campeones y guarda las combinaciones que quieras recuperar despues.</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={() => setShowTeamGuide(true)}
                class="mt-4 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#0b172f] px-3 py-2.5 text-sm font-semibold text-violet shadow-[inset_0_0_0_1px_rgba(142,107,255,0.22)] transition hover:bg-[#0d1d3b] hover:text-violet-light"
              >
                Ver guia completa
                <ChevronRight size={15} />
              </button>
            </section>
          </aside>

          <section class="min-w-0 space-y-4 2xl:flex 2xl:flex-col">
            <article class="relative overflow-hidden rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_60px_rgba(1,5,16,0.38)] sm:p-6 2xl:p-8">
              <img
                src={lolHeroImage}
                alt=""
                class="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[44%] object-cover object-center opacity-42 mix-blend-screen min-[900px]:block"
              />
              <div class="pointer-events-none absolute inset-y-0 right-0 hidden w-[52%] bg-gradient-to-r from-[#050d20] via-[#050d20]/36 to-transparent min-[900px]:block" />
              <div class="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
                <div class="min-w-0">
                  <h1 class="mb-3 inline-flex items-center gap-3 text-3xl leading-tight text-violet min-[900px]:text-[2.05rem] 2xl:text-[2.55rem]">
                    <UserRoundPlus size={30} class="shrink-0" />
                    <span>Generador de equipos</span>
                  </h1>
                  <p class="max-w-2xl text-base leading-7 text-muted 2xl:text-lg 2xl:leading-8">
                    Crea equipos aleatorios y balanceados en segundos para probar nuevas combinaciones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={generateTeam}
                  class="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#20124a]/90 px-5 py-3 text-sm font-semibold text-violet shadow-[inset_0_0_0_1px_rgba(142,107,255,0.32),0_12px_26px_rgba(70,32,180,0.22)] transition hover:brightness-110 sm:w-auto"
                >
                  <Sparkles size={15} />
                  Nuevo equipo
                </button>
              </div>
            </article>

            <article class="rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_50px_rgba(1,5,16,0.38)]">
              <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div class="inline-flex items-center gap-2 text-sm font-semibold uppercase text-violet">
                  <span class="h-1.5 w-1.5 rounded-full bg-violet" />
                  Tu equipo generado
                </div>
                <button
                  type="button"
                  onClick={saveCurrentTeam}
                  disabled={!hasGeneratedTeam}
                  class="inline-flex items-center gap-2 rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-cyan shadow-[inset_0_0_0_1px_rgba(57,216,255,0.10)] transition hover:bg-[#0d1d3b] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Save size={14} />
                  Guardar equipo
                </button>
              </div>

              <div class="grid gap-3 sm:grid-cols-2 min-[900px]:grid-cols-3 2xl:grid-cols-5">
                {ROLES.map((role) => {
                  const champion = generatedTeam[role]
                  const style = roleStyles[role]
                  const RoleIcon = style.icon
                  const canManualPick = manualSelectionEnabled && rolesEnabled[role]
                  return (
                    <div
                      key={role}
                      class={`rounded-xl bg-[#08142c]/86 p-3 min-[900px]:p-2.5 2xl:p-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.07)] ${
                        canManualPick ? 'cursor-pointer transition hover:bg-[#0a1935]' : ''
                      } ${rolesEnabled[role] ? '' : 'opacity-45'}`}
                      onClick={() => {
                        if (canManualPick) setActiveManualRole(role)
                      }}
                      role={canManualPick ? 'button' : undefined}
                      tabIndex={canManualPick ? 0 : undefined}
                      onKeyDown={(event) => {
                        if (canManualPick && (event.key === 'Enter' || event.key === ' ')) setActiveManualRole(role)
                      }}
                    >
                      <p class={`mb-2.5 inline-flex items-center gap-2 text-xs font-semibold uppercase 2xl:text-sm ${style.text}`}>
                        <RoleIcon size={14} />
                        {role}
                      </p>
                      <div class={`mx-auto mb-2.5 grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-[#0b1224] ring-2 min-[900px]:h-14 min-[900px]:w-14 2xl:h-20 2xl:w-20 ${style.ring}`}>
                        {champion && rolesEnabled[role] ? (
                          <img src={champion.imageUrl} alt={champion.name} class="h-full w-full object-cover" />
                        ) : (
                          <UserCircle2 size={36} class="text-cyan/36" />
                        )}
                      </div>
                      <p class="mb-0.5 truncate text-center text-sm 2xl:text-base">{rolesEnabled[role] ? champion?.name ?? 'Sin seleccionar' : 'Rol desactivado'}</p>
                      <p class="mb-2.5 min-h-4 text-center text-[9px] uppercase text-muted 2xl:text-[10px]">
                        {champion && rolesEnabled[role] ? champion.roles.join(' • ') : ''}
                      </p>
                      <div class="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            rerollRole(role)
                          }}
                          disabled={!rolesEnabled[role]}
                          class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#0b172f] text-cyan shadow-[inset_0_0_0_1px_rgba(57,216,255,0.10)] transition hover:bg-[#0d1d3b] disabled:opacity-40 2xl:h-8 2xl:w-8"
                          aria-label={`Regenerar ${role}`}
                        >
                          <RefreshCw size={14} />
                        </button>
                        {manualSelectionEnabled ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation()
                              setActiveManualRole(role)
                            }}
                            disabled={!rolesEnabled[role]}
                            class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#0b172f] text-violet shadow-[inset_0_0_0_1px_rgba(142,107,255,0.16)] transition hover:bg-[#0d1d3b] disabled:opacity-40 2xl:h-8 2xl:w-8"
                            aria-label={`Seleccionar campeon para ${role}`}
                          >
                            <UserRoundPlus size={14} />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>

              {manualSelectionEnabled ? (
                <div class="mt-4 rounded-xl bg-[#091630]/82 p-4 shadow-[inset_0_0_0_1px_rgba(142,107,255,0.12)]">
                  <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <p class="text-sm text-muted">
                      <strong class="block text-text">Seleccion manual activa</strong>
                      Clica una posicion para elegir un campeon que pueda jugar ese rol.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setManualSelectionEnabled(false)
                        setActiveManualRole(null)
                      }}
                      class="rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b]"
                    >
                      Cerrar seleccion
                    </button>
                  </div>
                  <div class="flex flex-wrap gap-2">
                    {ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setActiveManualRole(role)}
                        disabled={!rolesEnabled[role]}
                        class={`rounded-lg px-3 py-2 text-sm transition disabled:opacity-40 ${
                          activeManualRole === role ? 'bg-violet text-white' : 'bg-[#0b172f] text-text hover:bg-[#0d1d3b]'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {!manualSelectionEnabled ? (
                <div class="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl bg-[#091630]/82 p-4 shadow-[inset_0_0_0_1px_rgba(142,107,255,0.12)] sm:flex-row sm:items-center">
                  <p class="inline-flex items-center gap-3 text-sm text-muted">
                    <Sparkles size={16} class="text-violet" />
                    <span>
                      <strong class="block text-text">Equipo aleatorio y balanceado</strong>
                      Todos los roles incluidos - Sin campeones repetidos
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={generateTeam}
                    class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b172f] px-4 py-2 text-sm text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b] sm:w-auto"
                  >
                    <RefreshCw size={14} />
                    Generar de nuevo
                  </button>
                </div>
              ) : null}
            </article>

            {activeManualRole ? (
              <ManualChampionPicker
                role={activeManualRole}
                selectedChampion={generatedTeam[activeManualRole]}
                selectedIds={new Set(ROLES.map((role) => generatedTeam[role]?.id).filter(Boolean) as string[])}
                avoidDuplicates={noRepeats}
                selectedType={manualTypeFilters[activeManualRole]}
                onSelectedTypeChange={(type) => setManualTypeFilters((prev) => ({ ...prev, [activeManualRole]: type }))}
                onSelect={(champion) => assignManualChampion(activeManualRole, champion)}
                onClose={() => setActiveManualRole(null)}
              />
            ) : null}

            {showSavedTeams ? (
              <TeamListPanel
                title="Mis equipos guardados"
                emptyText="Guarda un equipo para verlo aqui."
                teams={savedTeams}
                onSelect={(team) => loadTeamFromHistory(team)}
                onDelete={deleteSavedTeam}
                onClose={() => setShowSavedTeams(false)}
              />
            ) : null}

            {showExcludeChampions ? (
              <ExcludeChampionsPanel
                excludedChampionIds={excludedChampionIds}
                onToggleChampion={(championId) => {
                  setExcludedChampionIds((prev) => {
                    const next = new Set(prev)
                    if (next.has(championId)) next.delete(championId)
                    else next.add(championId)
                    return next
                  })
                }}
                onClear={() => setExcludedChampionIds(new Set())}
                onClose={() => setShowExcludeChampions(false)}
              />
            ) : null}

            <article class="rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_50px_rgba(1,5,16,0.34)] 2xl:flex-1">
              <h2 class="mb-4 text-sm font-semibold uppercase text-violet">Opciones de generacion</h2>
              <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <OptionCard
                  icon={<PlusCircle size={15} />}
                  title="Incluir todos los roles"
                  detail="Asegura que el equipo tenga Top, Jungla, Mid, ADC y Support."
                  active={Object.values(rolesEnabled).every(Boolean)}
                  actionLabel={Object.values(rolesEnabled).every(Boolean) ? 'Desactivar' : 'Activar'}
                  onClick={() => {
                    const allEnabled = Object.values(rolesEnabled).every(Boolean)
                    setRolesEnabled(
                      allEnabled
                        ? { Top: false, Jungla: false, Mid: false, ADC: false, Support: false }
                        : { Top: true, Jungla: true, Mid: true, ADC: true, Support: true },
                    )
                  }}
                />
                <OptionCard
                  icon={<Lock size={15} />}
                  title="Sin campeones repetidos"
                  detail="Evita repetir campeones dentro del mismo equipo."
                  active={noRepeats}
                  actionLabel={noRepeats ? 'Activado' : 'Activar'}
                  onClick={() => setNoRepeats((value) => !value)}
                />
                <OptionCard
                  icon={<MinusCircle size={15} />}
                  title="Excluir campeones"
                  detail={`${excludedChampionIds.size} campeones excluidos del generador.`}
                  active={excludedChampionIds.size > 0}
                  actionLabel="Configurar"
                  onClick={() => setShowExcludeChampions((value) => !value)}
                />
                <OptionCard
                  icon={<Settings2 size={15} />}
                  title="Roles aleatorios"
                  detail="Permite que cualquier campeon salga en cualquier posicion."
                  active={randomRoles}
                  actionLabel={randomRoles ? 'Activado' : 'Activar'}
                  onClick={() => setRandomRoles((value) => !value)}
                />
              </div>
              <div class="mt-4 rounded-xl bg-[#091630]/62 px-4 py-3 text-center text-xs text-muted shadow-[inset_0_0_0_1px_rgba(142,107,255,0.08)]">
                Puedes regenerar el equipo todas las veces que quieras hasta encontrar la combinacion perfecta.
              </div>
            </article>
          </section>

          <aside class="lol-builder-side-lock flex self-start flex-col gap-4 min-[900px]:col-start-2 min-[900px]:grid min-[900px]:grid-cols-2 2xl:col-start-auto 2xl:flex 2xl:self-stretch">
            <SidePanel title="Equipos recientes" icon={<History size={14} />}>
              <div class="tiger-scrollbar h-[244px] space-y-1.5 overflow-y-auto pr-2">
                {visibleRecentTeams.length > 0 ? (
                  visibleRecentTeams.map((entry) => <RecentTeamRow key={entry.id} entry={entry} onClick={() => loadTeamFromHistory(entry.team)} />)
                ) : (
                  <p class="rounded-lg bg-[#09152c]/74 px-3 py-3 text-sm text-muted">Genera un equipo para crear historial.</p>
                )}
              </div>
              {recentTeams.length > RECENT_TEAMS_PREVIEW_LIMIT ? (
                <button
                  type="button"
                  onClick={() => setShowAllRecentTeams((value) => !value)}
                  class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b]"
                >
                  <Eye size={14} />
                  {showAllRecentTeams ? 'Ver ultimos 5 equipos' : 'Ver los 10 ultimos'}
                </button>
              ) : null}
            </SidePanel>

            <SidePanel title="Accesos rapidos" icon={<ListChecks size={14} />}>
              <QuickLink
                title="Seleccion de campeones y roles manual"
                subtitle="Elige los campeones y roles"
                active={manualSelectionEnabled}
                onClick={() => {
                  setManualSelectionEnabled((value) => {
                    const next = !value
                    setActiveManualRole(next ? getFirstEnabledRole() : null)
                    return next
                  })
                }}
              />
              <QuickLink
                title="Mis equipos"
                subtitle={`${savedTeams.length} equipos guardados`}
                active={showSavedTeams}
                onClick={() => setShowSavedTeams((value) => !value)}
              />
              <QuickLink title="Plantillas guardadas" subtitle="Usa tus propias plantillas" />
              <QuickLink title="Consejos" subtitle="Tips para mejores equipos" />
            </SidePanel>

            <article class="rounded-2xl bg-[linear-gradient(145deg,rgba(73,31,150,0.38),rgba(5,13,32,0.94)_62%)] p-4 shadow-[inset_0_0_0_1px_rgba(142,107,255,0.16),0_18px_42px_rgba(1,5,16,0.30)] min-[900px]:hidden 2xl:mt-auto 2xl:block">
              <p class="mb-2 inline-flex items-center gap-2 text-base font-semibold text-violet">
                <Trophy size={18} />
                TigerByte Pro
              </p>
              <p class="mb-3 text-xs leading-5 text-muted">
                Funciones avanzadas para guardar, comparar y compartir mejores equipos.
              </p>
              <button
                type="button"
                onClick={() => setShowProDetails(true)}
                class="inline-flex w-full items-center justify-center rounded-lg bg-violet px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Descubrir Pro
              </button>
            </article>
          </aside>
        </section>
      </main>

      {showTeamGuide ? <TeamBuilderGuideModal onClose={() => setShowTeamGuide(false)} /> : null}

      {showProDetails ? (
        <div class="fixed inset-0 z-50 grid place-items-center bg-[#01040d]/90 px-4 backdrop-blur-md" onClick={() => setShowProDetails(false)}>
          <section
            class="w-[min(94vw,520px)] rounded-2xl bg-[#030916]/98 p-5 text-left shadow-[inset_0_0_0_1px_rgba(142,107,255,0.24),0_24px_80px_rgba(0,0,0,0.78)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pro-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="mb-4 flex items-start justify-between gap-4">
              <div>
                <p class="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase text-violet">
                  <Trophy size={17} />
                  TigerByte Pro
                </p>
                <h2 id="pro-title" class="text-2xl text-text">Ya se hara en otro momento</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowProDetails(false)}
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b172f] text-muted transition hover:bg-[#0d1d3b] hover:text-text"
                aria-label="Cerrar TigerByte Pro"
              >
                <X size={17} />
              </button>
            </div>

            <p class="rounded-xl bg-[#09152c]/74 px-4 py-4 text-sm leading-6 text-muted">
              Esta funcion queda apuntada, pero la dejaremos para mas adelante.
            </p>

            <div class="mt-5 flex">
              <button
                type="button"
                onClick={() => setShowProDetails(false)}
                class="inline-flex w-full items-center justify-center rounded-lg bg-violet px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
              >
                Entendido
              </button>
            </div>
          </section>
        </div>
      ) : null}
      <Footer />
    </div>
  )
}

function TeamBuilderGuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div class="fixed inset-0 z-50 grid place-items-center bg-[#01040d]/90 px-4 backdrop-blur-md" onClick={onClose}>
      <section
        class="tiger-scrollbar max-h-[86vh] w-[min(94vw,860px)] overflow-y-auto rounded-2xl bg-[#030916]/98 p-5 text-left shadow-[inset_0_0_0_1px_rgba(142,107,255,0.24),0_24px_80px_rgba(0,0,0,0.78)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-builder-guide-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p class="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase text-violet">
              <CircleHelp size={17} />
              Guia completa
            </p>
            <h2 id="team-builder-guide-title" class="text-2xl text-text">Generador de equipos</h2>
            <p class="mt-2 text-sm leading-6 text-muted">
              Usa estas opciones para crear composiciones rapidas, probar combinaciones raras o guardar equipos que quieras repetir.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b172f] text-muted transition hover:bg-[#0d1d3b] hover:text-text"
            aria-label="Cerrar guia"
          >
            <X size={17} />
          </button>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <GuideCard
            title="1. Configura los roles"
            items={[
              'Deja activos los cinco roles para generar un equipo completo.',
              'Desactiva una posicion si solo quieres probar una parte del equipo.',
              'Usa roles aleatorios para composiciones mas caoticas o retos.',
            ]}
          />
          <GuideCard
            title="2. Controla los campeones"
            items={[
              'Sin campeones repetidos evita duplicados dentro del mismo equipo.',
              'Excluir campeones sirve para quitar picks que no quieres usar.',
              'La seleccion manual permite fijar una posicion con un campeon concreto.',
            ]}
          />
          <GuideCard
            title="3. Genera y ajusta"
            items={[
              'Nuevo equipo reinventa toda la composicion.',
              'El boton de cada rol regenera solo esa posicion.',
              'Puedes mezclar seleccion manual con rerolls para afinar el resultado.',
            ]}
          />
          <GuideCard
            title="4. Guarda resultados"
            items={[
              'Los equipos recientes se guardan automaticamente al generar.',
              'Guardar equipo lo manda a Mis equipos para recuperarlo despues.',
              'Si una combinacion funciona, guardala antes de seguir probando.',
            ]}
          />
        </div>

        <button
          type="button"
          onClick={onClose}
          class="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-violet px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Entendido
        </button>
      </section>
    </div>
  )
}

function GuideCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article class="rounded-xl bg-[#09152c]/74 p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
      <h3 class="mb-3 text-sm font-semibold text-text">{title}</h3>
      <ul class="space-y-2 text-sm leading-6 text-muted">
        {items.map((item) => (
          <li key={item} class="flex gap-2">
            <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

function ConfigInfo({ label, value, icon }: { label: string; value: string; icon: ComponentChildren }) {
  return (
    <div class="rounded-lg bg-[#09152c]/74 px-3 py-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
      <p class="mb-1 text-xs text-muted">{label}</p>
      <p class="inline-flex w-full items-center justify-between text-base">
        {value}
        <span class="text-violet">{icon}</span>
      </p>
    </div>
  )
}

function OptionToggle({ label, enabled, onClick }: { label: string; enabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      class="flex w-full items-center justify-between rounded-lg px-1 py-1 text-sm text-muted transition hover:text-text"
    >
      <span>{label}</span>
      <span class={`relative h-5 w-9 rounded-full transition ${enabled ? 'bg-violet' : 'bg-[#1b2a45]'}`}>
        <span class={`absolute top-1 h-3 w-3 rounded-full bg-white transition ${enabled ? 'left-5' : 'left-1'}`} />
      </span>
    </button>
  )
}

function OptionCard({
  icon,
  title,
  detail,
  active = false,
  actionLabel,
  onClick,
}: {
  icon: ComponentChildren
  title: string
  detail: string
  active?: boolean
  actionLabel: string
  onClick: () => void
}) {
  return (
    <div class="flex min-h-[142px] flex-col rounded-xl bg-[#09152c]/74 p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
      <div class="min-h-[92px]">
        <p class="mb-2 inline-flex items-center gap-2 text-sm font-semibold">
          <span class="text-violet">{icon}</span>
          {title}
        </p>
        <p class="text-xs leading-5 text-muted">{detail}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        class={`mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm transition ${
          active
            ? 'bg-violet text-white shadow-[0_8px_18px_rgba(112,64,255,0.22)]'
            : 'bg-[#0b172f] text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] hover:bg-[#0d1d3b]'
        }`}
      >
        {actionLabel}
        {active ? <span class="h-3 w-3 rounded-full bg-white/90" /> : null}
      </button>
    </div>
  )
}

function SidePanel({ title, icon, children }: { title: string; icon: ComponentChildren; children: ComponentChildren }) {
  return (
    <article class="rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_18px_42px_rgba(1,5,16,0.34)]">
      <h2 class="mb-4 inline-flex items-center gap-2 text-sm font-semibold uppercase text-violet">
        {icon}
        {title}
      </h2>
      {children}
    </article>
  )
}

function RecentTeamRow({ entry, onClick }: { entry: RecentTeam; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      class="flex w-full items-center justify-between rounded-lg bg-[#09152c]/74 px-2.5 py-1.5 text-left shadow-[inset_0_0_0_1px_rgba(148,163,184,0.04)] transition hover:bg-[#0d1d3b]"
    >
      <div class="flex -space-x-2">
        {ROLES.map((role) => {
          const champion = entry.team[role]
          return champion ? (
            <img key={role} src={champion.imageUrl} alt={champion.name} class="h-7 w-7 rounded-full object-cover ring-2 ring-[#09152c]" />
          ) : (
            <span key={role} class="grid h-7 w-7 place-items-center rounded-full bg-[#0b172f] ring-2 ring-[#09152c]">
              <UserCircle2 size={16} class="text-cyan/40" />
            </span>
          )
        })}
      </div>
      <span class="text-xs text-muted">{formatRelativeTime(entry.createdAt)}</span>
      <ChevronRight size={15} class="text-muted" />
    </button>
  )
}

function TeamListPanel({
  title,
  emptyText,
  teams,
  onSelect,
  onDelete,
  onClose,
}: {
  title: string
  emptyText: string
  teams: RecentTeam[]
  onSelect: (team: Team) => void
  onDelete: (teamId: string) => void
  onClose: () => void
}) {
  return (
    <article class="rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_50px_rgba(1,5,16,0.34)]">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold uppercase text-violet">{title}</h2>
          <p class="mt-1 text-sm text-muted">{teams.length} equipos disponibles</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          class="rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b]"
        >
          Cerrar
        </button>
      </div>

      {teams.length > 0 ? (
        <div class="tiger-scrollbar grid max-h-[360px] gap-2 overflow-y-auto pr-2 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry.team)}
              class="group relative rounded-lg bg-[#09152c]/74 p-2.5 text-left shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)] transition hover:bg-[#0d1d3b]"
            >
              <div class="flex items-center gap-2 pr-8">
                <div class="flex -space-x-2">
                  {ROLES.map((role) => {
                    const champion = entry.team[role]
                    return champion ? (
                      <img key={role} src={champion.imageUrl} alt={champion.name} class="h-8 w-8 rounded-full object-cover ring-2 ring-[#09152c]" />
                    ) : (
                      <span key={role} class="grid h-8 w-8 place-items-center rounded-full bg-[#0b172f] ring-2 ring-[#09152c]">
                        <UserCircle2 size={16} class="text-cyan/40" />
                      </span>
                    )
                  })}
                </div>
              </div>
              <div class="sr-only">
                {ROLES.map((role) => (
                  <span key={role}>{entry.team[role]?.name ?? 'Sin seleccionar'}</span>
                ))}
              </div>
              <span class="mt-2 block text-[11px] text-muted">{formatRelativeTime(entry.createdAt)}</span>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onDelete(entry.id)
                }}
                class="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#0b172f] text-muted opacity-80 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-red-500/18 hover:text-red-200 group-hover:opacity-100"
                aria-label="Borrar equipo guardado"
              >
                <Trash2 size={13} />
              </button>
            </button>
          ))}
        </div>
      ) : (
        <p class="rounded-lg bg-[#09152c]/74 px-3 py-3 text-sm text-muted">{emptyText}</p>
      )}
    </article>
  )
}

function ExcludeChampionsPanel({
  excludedChampionIds,
  onToggleChampion,
  onClear,
  onClose,
}: {
  excludedChampionIds: Set<string>
  onToggleChampion: (championId: string) => void
  onClear: () => void
  onClose: () => void
}) {
  const [selectedRole, setSelectedRole] = useState<Role | 'Todos'>('Todos')
  const visibleChampions =
    selectedRole === 'Todos' ? championPool : championPool.filter((champion) => champion.roles.includes(selectedRole))

  return (
    <article class="rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_50px_rgba(1,5,16,0.34)]">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold uppercase text-violet">Excluir campeones</h2>
          <p class="mt-1 text-sm text-muted">{excludedChampionIds.size} seleccionados no saldran al generar.</p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            disabled={excludedChampionIds.size === 0}
            class="rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-cyan shadow-[inset_0_0_0_1px_rgba(57,216,255,0.10)] transition hover:bg-[#0d1d3b] disabled:opacity-40"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onClose}
            class="rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b]"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        {(['Todos', ...ROLES] as Array<Role | 'Todos'>).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setSelectedRole(role)}
            class={`rounded-full px-3 py-1.5 text-xs transition ${
              selectedRole === role ? 'bg-violet text-white' : 'bg-[#0b172f] text-muted hover:bg-[#0d1d3b] hover:text-text'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      <div class="tiger-scrollbar grid max-h-[520px] gap-3 overflow-y-auto px-1 py-1 pr-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {visibleChampions.map((champion) => {
          const excluded = excludedChampionIds.has(champion.id)
          return (
            <button
              key={champion.id}
              type="button"
              onClick={() => onToggleChampion(champion.id)}
              class={`flex min-h-[72px] items-center gap-3 rounded-xl p-3 text-left shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)] transition hover:bg-[#0d1d3b] ${
                excluded ? 'bg-red-500/18 ring-2 ring-red-400/45' : 'bg-[#09152c]/74'
              }`}
            >
              <img src={champion.imageUrl} alt={champion.name} class="h-12 w-12 shrink-0 rounded-lg object-cover" />
              <span class="min-w-0">
                <span class="block truncate text-sm font-semibold text-text">{champion.name}</span>
                <span class={`block truncate text-xs ${excluded ? 'text-red-200' : 'text-muted'}`}>
                  {excluded ? 'Excluido' : champion.roles.join(' - ')}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </article>
  )
}

function QuickLink({ title, subtitle, active = false, onClick }: { title: string; subtitle: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      class={`mb-2 block w-full rounded-lg px-4 py-3 text-left shadow-[inset_0_0_0_1px_rgba(148,163,184,0.05)] transition last:mb-0 ${
        active
          ? 'bg-violet text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16),0_0_24px_rgba(142,107,255,0.30)]'
          : 'bg-[#09152c]/74 hover:bg-[#0d1d3b]'
      }`}
    >
      <span class={`block text-sm ${active ? 'text-white' : 'text-text'}`}>{title}</span>
      <span class={`text-xs ${active ? 'text-white/78' : 'text-muted'}`}>{subtitle}</span>
    </button>
  )
}

function ManualChampionPicker({
  role,
  selectedChampion,
  selectedIds,
  avoidDuplicates,
  selectedType,
  onSelectedTypeChange,
  onSelect,
  onClose,
}: {
  role: Role
  selectedChampion: Champion | null
  selectedIds: Set<string>
  avoidDuplicates: boolean
  selectedType: string
  onSelectedTypeChange: (type: string) => void
  onSelect: (champion: Champion) => void
  onClose: () => void
}) {
  const championsForRole = championPool.filter((champion) => champion.roles.includes(role))
  const availableTypes = ['Todos', ...Array.from(new Set(championsForRole.flatMap((champion) => champion.types ?? []))).sort()]
  const activeSelectedType = availableTypes.includes(selectedType) ? selectedType : 'Todos'
  const visibleChampions = activeSelectedType === 'Todos'
    ? championsForRole
    : championsForRole.filter((champion) => champion.types?.includes(activeSelectedType))

  return (
    <article class="rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_50px_rgba(1,5,16,0.34)]">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-sm font-semibold uppercase text-violet">Campeones para {role}</h2>
          <p class="mt-1 text-sm text-muted">{visibleChampions.length} opciones disponibles</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          class="rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b]"
        >
          Cerrar
        </button>
      </div>

      <div class="mb-4 flex flex-wrap gap-2">
        {availableTypes.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onSelectedTypeChange(type)}
            class={`rounded-full px-3 py-1.5 text-xs transition ${
              activeSelectedType === type ? 'bg-violet text-white' : 'bg-[#0b172f] text-muted hover:bg-[#0d1d3b] hover:text-text'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div class="tiger-scrollbar grid max-h-[520px] gap-3 overflow-y-auto px-1 py-1 pr-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {visibleChampions.map((champion) => {
          const isCurrent = selectedChampion?.id === champion.id
          const alreadySelected = avoidDuplicates && selectedIds.has(champion.id) && !isCurrent
          return (
            <button
              key={champion.id}
              type="button"
              onClick={() => onSelect(champion)}
              disabled={alreadySelected}
              class={`flex min-h-[72px] items-center gap-3 rounded-xl bg-[#09152c]/74 p-3 text-left shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)] transition hover:bg-[#0d1d3b] disabled:cursor-not-allowed disabled:opacity-45 ${
                isCurrent ? 'ring-2 ring-violet/70' : ''
              }`}
            >
              <img src={champion.imageUrl} alt={champion.name} class="h-12 w-12 shrink-0 rounded-lg object-cover" />
              <span class="min-w-0">
                <span class="block truncate text-sm font-semibold text-text">{champion.name}</span>
                <span class="block truncate text-xs text-muted">{alreadySelected ? 'Ya esta en el equipo' : champion.roles.join(' - ')}</span>
              </span>
            </button>
          )
        })}
      </div>
    </article>
  )
}
