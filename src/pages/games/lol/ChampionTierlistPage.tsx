import {
  ArrowRight,
  Download,
  Filter,
  GitBranch,
  Images,
  Plus,
  Save,
  Search,
  Share2,
  Pencil,
  Trash2,
  X,
} from 'lucide-preact'
import type { ComponentChildren } from 'preact'
import { useMemo, useState } from 'preact/hooks'
import championsData from '../../../data/lolChampionsData.json'
import lolHeroImage from '../../../assets/games/LOL 2.png'
import { Footer } from '../../../components/layout/Footer'
import { HUDBackground } from '../../../components/effects/HUDBackground'
import { Navbar } from '../../../components/layout/Navbar'

type Role = 'Top' | 'Jungla' | 'Mid' | 'ADC' | 'Support'
type Tier = 'S+' | 'S' | 'A' | 'B' | 'C'

type Champion = {
  id: string
  name: string
  imageUrl: string
  roles: Role[]
  types?: string[]
}

type StoredTierlist = {
  id: string
  title: string
  placements: Record<Tier, string[]>
  tierLabels?: Record<Tier, string>
  updatedAt: number
}

const ROLES: Array<Role | 'Todos'> = ['Todos', 'Top', 'Jungla', 'Mid', 'ADC', 'Support']
const TIERS: Tier[] = ['S+', 'S', 'A', 'B', 'C']
const STORAGE_KEY = 'tb_lol_champion_tierlist'
const TITLE_STORAGE_KEY = 'tb_lol_champion_tierlist_title'
const TIER_LABELS_STORAGE_KEY = 'tb_lol_champion_tier_labels'
const NOTES_STORAGE_KEY = 'tb_lol_champion_tierlist_notes'
const SAVED_TIERLISTS_KEY = 'tb_lol_saved_tierlists'
const TEMPLATES_KEY = 'tb_lol_tierlist_templates'
const EXPORT_FILE_NAME = 'tigerbyte-tierlist-lol.png'

const tierStyles: Record<Tier, { bg: string; text: string; glow: string }> = {
  'S+': { bg: 'bg-red-500/18', text: 'text-red-300', glow: 'shadow-[inset_0_0_0_1px_rgba(248,113,113,0.24)]' },
  S: { bg: 'bg-orange-400/16', text: 'text-orange-200', glow: 'shadow-[inset_0_0_0_1px_rgba(251,146,60,0.22)]' },
  A: { bg: 'bg-yellow-300/14', text: 'text-yellow-200', glow: 'shadow-[inset_0_0_0_1px_rgba(250,204,21,0.22)]' },
  B: { bg: 'bg-emerald-400/14', text: 'text-emerald-300', glow: 'shadow-[inset_0_0_0_1px_rgba(52,211,153,0.22)]' },
  C: { bg: 'bg-sky-400/14', text: 'text-sky-300', glow: 'shadow-[inset_0_0_0_1px_rgba(56,189,248,0.22)]' },
}

const championPool = ((championsData.champions as Champion[]) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name))
const CHAMPION_TYPES = Array.from(new Set(championPool.flatMap((champion) => champion.types ?? []))).sort()

const defaultTierLabels = (): Record<Tier, string> => ({
  'S+': 'S+',
  S: 'S',
  A: 'A',
  B: 'B',
  C: 'C',
})

const emptyPlacements = (): Record<Tier, string[]> => ({
  'S+': [],
  S: [],
  A: [],
  B: [],
  C: [],
})

function loadPlacements() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyPlacements()
    const parsed = JSON.parse(raw) as Record<Tier, string[]>
    const validIds = new Set(championPool.map((champion) => champion.id))
    return TIERS.reduce((next, tier) => {
      next[tier] = (parsed[tier] ?? []).filter((id) => validIds.has(id))
      return next
    }, emptyPlacements())
  } catch {
    return emptyPlacements()
  }
}

function savePlacements(placements: Record<Tier, string[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(placements))
}

function loadTierlistTitle() {
  return localStorage.getItem(TITLE_STORAGE_KEY) || 'Sin titulo'
}

function saveTierlistTitle(title: string) {
  localStorage.setItem(TITLE_STORAGE_KEY, title)
}

function loadTierLabels() {
  try {
    const raw = localStorage.getItem(TIER_LABELS_STORAGE_KEY)
    if (!raw) return defaultTierLabels()
    const parsed = JSON.parse(raw) as Partial<Record<Tier, string>>
    return TIERS.reduce((next, tier) => {
      next[tier] = parsed[tier]?.trim() || tier
      return next
    }, defaultTierLabels())
  } catch {
    return defaultTierLabels()
  }
}

function saveTierLabels(labels: Record<Tier, string>) {
  localStorage.setItem(TIER_LABELS_STORAGE_KEY, JSON.stringify(labels))
}

function loadTierlistNotes() {
  return localStorage.getItem(NOTES_STORAGE_KEY) || ''
}

function saveTierlistNotes(notes: string) {
  localStorage.setItem(NOTES_STORAGE_KEY, notes)
}

function sanitizePlacements(placements: Record<Tier, string[]>) {
  const validIds = new Set(championPool.map((champion) => champion.id))
  return TIERS.reduce((next, tier) => {
    next[tier] = (placements[tier] ?? []).filter((id) => validIds.has(id))
    return next
  }, emptyPlacements())
}

function loadStoredItems(key: string) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as StoredTierlist[]
    return parsed
      .filter((item) => item?.id && item?.placements)
      .map((item) => ({
        ...item,
        title: item.title?.trim() || 'Sin titulo',
        placements: sanitizePlacements(item.placements),
        tierLabels: item.tierLabels ? sanitizeTierLabels(item.tierLabels) : defaultTierLabels(),
        updatedAt: item.updatedAt || Date.now(),
      }))
  } catch {
    return []
  }
}

function sanitizeTierLabels(labels: Partial<Record<Tier, string>>) {
  return TIERS.reduce((next, tier) => {
    next[tier] = labels[tier]?.trim() || tier
    return next
  }, defaultTierLabels())
}

function saveStoredItems(key: string, items: StoredTierlist[]) {
  localStorage.setItem(key, JSON.stringify(items))
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('No se pudo crear la imagen'))
    }, 'image/png')
  })
}

async function createTierlistImage(
  placements: Record<Tier, string[]>,
  championsById: Map<string, Champion>,
  tierLabels: Record<Tier, string>,
) {
  const width = 1280
  const headerHeight = 118
  const tierLabelWidth = 112
  const padding = 32
  const gap = 10
  const iconSize = 64
  const rowMinHeight = 92
  const contentWidth = width - padding * 2 - tierLabelWidth
  const columns = Math.max(1, Math.floor((contentWidth - gap * 2) / (iconSize + gap)))
  const rowHeights = TIERS.map((tier) => {
    const rows = Math.max(1, Math.ceil(placements[tier].length / columns))
    return Math.max(rowMinHeight, rows * iconSize + (rows - 1) * gap + 24)
  })
  const height = headerHeight + rowHeights.reduce((sum, value) => sum + value, 0) + padding
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo preparar el canvas')

  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#050816')
  gradient.addColorStop(0.55, '#071226')
  gradient.addColorStop(1, '#020611')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(142, 107, 255, 0.12)'
  ctx.fillRect(0, 0, width, 4)
  ctx.fillStyle = '#8e6bff'
  ctx.font = '700 42px Orbitron, Arial, sans-serif'
  ctx.fillText('Tierlist de campeones', padding, 58)
  ctx.fillStyle = '#91a9c8'
  ctx.font = '500 20px Manrope, Arial, sans-serif'
  ctx.fillText(`TigerByte - League of Legends - Parche ${championsData.version}`, padding, 92)

  let y = headerHeight
  for (let i = 0; i < TIERS.length; i += 1) {
    const tier = TIERS[i]
    const rowHeight = rowHeights[i]
    const champions = placements[tier].map((id) => championsById.get(id)).filter(Boolean) as Champion[]

    ctx.fillStyle = '#08142c'
    ctx.fillRect(padding + tierLabelWidth, y, contentWidth, rowHeight)
    ctx.fillStyle =
      tier === 'S+'
        ? 'rgba(248, 113, 113, 0.25)'
        : tier === 'S'
          ? 'rgba(251, 146, 60, 0.22)'
          : tier === 'A'
            ? 'rgba(250, 204, 21, 0.20)'
            : tier === 'B'
              ? 'rgba(52, 211, 153, 0.20)'
              : tier === 'C'
                ? 'rgba(56, 189, 248, 0.20)'
                : 'rgba(142, 107, 255, 0.22)'
    ctx.fillRect(padding, y, tierLabelWidth, rowHeight)
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)'
    ctx.strokeRect(padding, y, width - padding * 2, rowHeight)

    ctx.fillStyle = '#d8e7ff'
    ctx.font = '700 34px Manrope, Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(tierLabels[tier] || tier, padding + tierLabelWidth / 2, y + rowHeight / 2)
    ctx.textAlign = 'start'
    ctx.textBaseline = 'alphabetic'

    await Promise.all(
      champions.map(async (champion, index) => {
        const image = await loadImage(champion.imageUrl)
        const col = index % columns
        const row = Math.floor(index / columns)
        const x = padding + tierLabelWidth + 14 + col * (iconSize + gap)
        const imageY = y + 12 + row * (iconSize + gap)
        ctx.drawImage(image, x, imageY, iconSize, iconSize)
        ctx.strokeStyle = 'rgba(57, 216, 255, 0.26)'
        ctx.strokeRect(x, imageY, iconSize, iconSize)
      }),
    )

    y += rowHeight
  }

  ctx.fillStyle = '#91a9c8'
  ctx.font = '500 16px Manrope, Arial, sans-serif'
  ctx.fillText('Generado con TigerByte', padding, height - 12)

  return canvasToBlob(canvas)
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

function getTierlistExportFileName(title: string) {
  const cleanedTitle = title
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (!cleanedTitle || cleanedTitle.toLowerCase() === 'sin-titulo') return EXPORT_FILE_NAME
  return `TigerByte-${cleanedTitle}.png`
}

function getPreviewChampion(placements: Record<Tier, string[]>) {
  const championId = TIERS.flatMap((tier) => placements[tier])[0]
  return championId ? championPool.find((champion) => champion.id === championId) : undefined
}

function formatRelativeSavedDate(timestamp: number) {
  const diffMs = Math.max(0, Date.now() - timestamp)
  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days >= 7) {
    const weeks = Math.floor(days / 7)
    return `Creada hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`
  }
  if (days >= 1) return `Creada hace ${days} ${days === 1 ? 'dia' : 'dias'}`
  if (hours >= 1) return `Creada hace ${hours} h`
  if (minutes >= 1) return `Creada hace ${minutes} min`
  return 'Creada ahora'
}

function getTierlistSidebarItems(
  savedTierlists: StoredTierlist[],
  tierlistTitle: string,
  placements: Record<Tier, string[]>,
  limit: number | 'all' = 3,
) {
  const currentItem: {
    id: string
    title: string
    subtitle: string
    previewChampion?: Champion
    stored?: StoredTierlist
  } = {
    id: 'current',
    title: tierlistTitle.trim() || 'Sin titulo',
    subtitle: 'Tierlist actual',
    previewChampion: getPreviewChampion(placements),
  }

  if (savedTierlists.length === 0) return [currentItem]

  const visibleItems = limit === 'all' ? savedTierlists : savedTierlists.slice(0, limit)

  return visibleItems.map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: formatRelativeSavedDate(item.updatedAt),
    previewChampion: getPreviewChampion(item.placements),
    stored: item,
  }))
}

export function ChampionTierlistPage() {
  const [placements, setPlacements] = useState<Record<Tier, string[]>>(() => loadPlacements())
  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState<Role | 'Todos'>('Todos')
  const [selectedType, setSelectedType] = useState('Todos')
  const [toast, setToast] = useState('')
  const [isCreatingImage, setIsCreatingImage] = useState(false)
  const [tierlistTitle, setTierlistTitle] = useState(() => loadTierlistTitle())
  const [tierLabels, setTierLabels] = useState<Record<Tier, string>>(() => loadTierLabels())
  const [tierlistNotes, setTierlistNotes] = useState(() => loadTierlistNotes())
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [currentTierlistId, setCurrentTierlistId] = useState<string | null>(null)
  const [savedTierlists, setSavedTierlists] = useState<StoredTierlist[]>(() => loadStoredItems(SAVED_TIERLISTS_KEY))
  const [templates, setTemplates] = useState<StoredTierlist[]>(() => loadStoredItems(TEMPLATES_KEY))
  const [libraryMode, setLibraryMode] = useState<'tierlists' | 'templates' | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const championsById = useMemo(() => new Map(championPool.map((champion) => [champion.id, champion])), [])
  const assignedIds = useMemo(() => new Set(TIERS.flatMap((tier) => placements[tier])), [placements])
  const availableChampions = useMemo(() => {
    const query = search.trim().toLowerCase()
    return championPool.filter((champion) => {
      const matchesSearch = query.length === 0 || champion.name.toLowerCase().includes(query)
      const matchesRole = selectedRole === 'Todos' || champion.roles.includes(selectedRole)
      const matchesType = selectedType === 'Todos' || champion.types?.includes(selectedType)
      return !assignedIds.has(champion.id) && matchesSearch && matchesRole && matchesType
    })
  }, [assignedIds, search, selectedRole, selectedType])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  function moveChampion(championId: string, targetTier: Tier | 'available') {
    setPlacements((prev) => {
      const next = TIERS.reduce((state, tier) => {
        state[tier] = prev[tier].filter((id) => id !== championId)
        return state
      }, emptyPlacements())

      if (targetTier !== 'available') {
        next[targetTier] = [...next[targetTier], championId]
      }

      savePlacements(next)
      return next
    })
  }

  function createNewTierlist() {
    const next = emptyPlacements()
    setPlacements(next)
    setTierlistTitle('Sin titulo')
    setTierLabels(defaultTierLabels())
    setTierlistNotes('')
    setCurrentTierlistId(null)
    savePlacements(next)
    saveTierlistTitle('Sin titulo')
    saveTierLabels(defaultTierLabels())
    saveTierlistNotes('')
    setLibraryMode(null)
    showToast('Nueva tierlist creada')
  }

  function saveCurrentTierlist() {
    const title = tierlistTitle.trim() || 'Sin titulo'
    const id = currentTierlistId ?? `${Date.now()}`
    const item: StoredTierlist = {
      id,
      title,
      placements,
      tierLabels,
      updatedAt: Date.now(),
    }
    const next = [item, ...savedTierlists.filter((entry) => entry.id !== id)]
    setSavedTierlists(next)
    setCurrentTierlistId(id)
    saveStoredItems(SAVED_TIERLISTS_KEY, next)
    savePlacements(placements)
    saveTierlistTitle(title)
    saveTierLabels(tierLabels)
    showToast('Tierlist guardada en la app')
  }

  function saveCurrentAsTemplate() {
    const title = `${tierlistTitle.trim() || 'Sin titulo'} - plantilla`
    const item: StoredTierlist = {
      id: `${Date.now()}`,
      title,
      placements,
      tierLabels,
      updatedAt: Date.now(),
    }
    const next = [item, ...templates]
    setTemplates(next)
    saveStoredItems(TEMPLATES_KEY, next)
    showToast('Plantilla guardada')
  }

  function loadStoredTierlist(item: StoredTierlist, mode: 'tierlists' | 'templates') {
    const nextPlacements = sanitizePlacements(item.placements)
    const nextLabels = sanitizeTierLabels(item.tierLabels ?? defaultTierLabels())
    setPlacements(nextPlacements)
    setTierLabels(nextLabels)
    setTierlistTitle(item.title)
    setCurrentTierlistId(mode === 'tierlists' ? item.id : null)
    savePlacements(nextPlacements)
    saveTierLabels(nextLabels)
    saveTierlistTitle(item.title)
    showToast(mode === 'tierlists' ? 'Tierlist cargada' : 'Plantilla cargada')
  }

  function deleteStoredTierlist(itemId: string, mode: 'tierlists' | 'templates') {
    if (mode === 'tierlists') {
      const next = savedTierlists.filter((item) => item.id !== itemId)
      setSavedTierlists(next)
      saveStoredItems(SAVED_TIERLISTS_KEY, next)
      if (currentTierlistId === itemId) setCurrentTierlistId(null)
    } else {
      const next = templates.filter((item) => item.id !== itemId)
      setTemplates(next)
      saveStoredItems(TEMPLATES_KEY, next)
    }
    showToast('Elemento eliminado')
  }

  function reorderSavedTierlists(activeId: string, targetId: string) {
    if (activeId === targetId) return

    const activeIndex = savedTierlists.findIndex((item) => item.id === activeId)
    const targetIndex = savedTierlists.findIndex((item) => item.id === targetId)
    if (activeIndex < 0 || targetIndex < 0) return

    const next = [...savedTierlists]
    const [activeItem] = next.splice(activeIndex, 1)
    next.splice(targetIndex, 0, activeItem)
    setSavedTierlists(next)
    saveStoredItems(SAVED_TIERLISTS_KEY, next)
    showToast('Orden actualizado')
  }

  function commitTitle(value = tierlistTitle) {
    const next = value.trim() || 'Sin titulo'
    setTierlistTitle(next)
    saveTierlistTitle(next)
    setIsEditingTitle(false)
  }

  function updateTierLabel(tier: Tier, label: string) {
    const next = {
      ...tierLabels,
      [tier]: label.trim() || tier,
    }
    setTierLabels(next)
    saveTierLabels(next)
  }

  async function exportTierlistImage() {
    try {
      setIsCreatingImage(true)
      const blob = await createTierlistImage(placements, championsById, tierLabels)
      downloadBlob(blob, getTierlistExportFileName(tierlistTitle))
      showToast('Imagen exportada')
    } catch {
      showToast('No se pudo crear la imagen')
    } finally {
      setIsCreatingImage(false)
    }
  }

  async function shareTierlist() {
    try {
      setIsCreatingImage(true)
      const blob = await createTierlistImage(placements, championsById, tierLabels)
      const fileName = getTierlistExportFileName(tierlistTitle)
      const file = new File([blob], fileName, { type: 'image/png' })
      const shareData = {
        title: 'Tierlist de campeones',
        text: 'Mi tierlist de campeones de League of Legends hecha con TigerByte.',
        files: [file],
      }

      if (navigator.canShare?.(shareData) && navigator.share) {
        await navigator.share(shareData)
        showToast('Tierlist compartida')
      } else {
        downloadBlob(blob, fileName)
        await navigator.clipboard?.writeText('Mi tierlist de campeones de League of Legends hecha con TigerByte.')
        showToast('Imagen descargada para compartir')
      }
    } catch {
      showToast('No se pudo compartir')
    } finally {
      setIsCreatingImage(false)
    }
  }

  const placedCount = assignedIds.size

  return (
    <div class="relative flex min-h-screen flex-col overflow-x-hidden [@media(min-width:1536px)_and_(min-height:1081px)]:h-screen [@media(min-width:1536px)_and_(min-height:1081px)]:overflow-hidden">
      <HUDBackground />
      <Navbar />

      <main class="mx-auto min-h-0 flex-1 w-[min(98%,1800px)] pb-3 pt-3 [@media(min-width:1536px)_and_(min-height:1081px)]:overflow-hidden">
        <section class="grid min-h-0 items-stretch gap-5 md:grid-cols-2 2xl:h-[calc(100vh-8rem)] 2xl:min-h-[760px] 2xl:grid-cols-[240px_minmax(0,1fr)_280px] [@media(min-width:1536px)_and_(min-height:1081px)]:h-full">
          <aside class="contents 2xl:order-1 2xl:flex 2xl:min-h-0 2xl:flex-col 2xl:gap-4 2xl:overflow-hidden">
            <article class="order-4 hidden rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_50px_rgba(1,5,16,0.38)] 2xl:order-none 2xl:block">
              <h2 class="mb-4 text-sm font-semibold uppercase text-violet">Configuracion</h2>
              <div class="space-y-3">
                <ConfigRow label="Parche actual" value={championsData.version} />
                <ConfigRow label="Region" value="Global" />
                <ConfigRow
                  label="Roles incluidos"
                  value={selectedRole === 'Todos' ? 'Todos los roles' : selectedRole}
                />
              </div>
            </article>

            <article class="order-3 flex min-h-0 flex-col overflow-hidden rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_50px_rgba(1,5,16,0.38)] md:h-[260px] 2xl:order-none 2xl:h-auto 2xl:flex-1">
              <h2 class="mb-4 text-sm font-semibold uppercase text-violet">Mis tierlists</h2>

              <div class="flex min-h-0 flex-1 flex-col space-y-3">
                <div class="tiger-scrollbar -mx-1 min-h-0 flex-1 space-y-2 overflow-y-auto px-1 py-1">
                {getTierlistSidebarItems(savedTierlists, tierlistTitle, placements, 'all').map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    draggable={Boolean(item.stored)}
                    onDragStart={(event) => {
                      if (item.stored) event.dataTransfer?.setData('application/tigerbyte-tierlist', item.stored.id)
                    }}
                    onDragOver={(event) => {
                      if (item.stored) event.preventDefault()
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      if (!item.stored) return
                      const activeId = event.dataTransfer?.getData('application/tigerbyte-tierlist')
                      if (activeId) reorderSavedTierlists(activeId, item.stored.id)
                    }}
                    onClick={() => {
                      if (item.stored) loadStoredTierlist(item.stored, 'tierlists')
                    }}
                    class="flex w-full cursor-grab items-center gap-3 rounded-lg px-1 py-1 text-left transition hover:bg-[#0b172f]/70 active:cursor-grabbing"
                    title={item.stored ? `${item.title} - arrastra para cambiar las visibles` : item.title}
                  >
                    <span class="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-[#0b172f] ring-1 ring-violet/20">
                      {item.previewChampion ? (
                        <img src={item.previewChampion.imageUrl} alt="" class="h-full w-full object-cover" />
                      ) : (
                        <Images size={16} class="text-violet" />
                      )}
                    </span>
                    <span class="min-w-0">
                      <span class="block truncate text-sm font-semibold text-text">{item.title}</span>
                      <span class="block truncate text-xs text-muted">{item.subtitle}</span>
                    </span>
                  </button>
                ))}
                </div>

                <button
                  type="button"
                  onClick={() => setLibraryMode('tierlists')}
                  class="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-[#0b172f] px-3 py-2.5 text-sm text-muted shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b] hover:text-text 2xl:mt-auto"
                >
                  Ver todas mis tierlists
                </button>
              </div>
            </article>

            <article class="order-3 flex min-h-0 flex-col rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_50px_rgba(1,5,16,0.38)] md:h-[260px] 2xl:order-none 2xl:mt-auto 2xl:h-auto">
              <div class="mb-4 flex items-center gap-3">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet/16 text-violet shadow-[inset_0_0_0_1px_rgba(142,107,255,0.16)]">
                  <GitBranch size={18} />
                </span>
                <h2 class="text-sm font-semibold uppercase text-violet">Como funciona?</h2>
              </div>

              <ul class="space-y-4 text-sm leading-5 text-muted [@media(max-height:1080px)]:hidden">
                <li class="flex gap-3">
                  <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet shadow-[0_0_14px_rgba(142,107,255,0.85)]" />
                  <span>Arrastra campeones entre los tiers para ordenarlos.</span>
                </li>
                <li class="flex gap-3">
                  <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet shadow-[0_0_14px_rgba(142,107,255,0.85)]" />
                  <span>Haz clic en un campeon para ver detalles y estadisticas.</span>
                </li>
                <li class="flex gap-3">
                  <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet shadow-[0_0_14px_rgba(142,107,255,0.85)]" />
                  <span>Guarda tu tierlist y compartela con tu equipo.</span>
                </li>
              </ul>

              <button
                type="button"
                onClick={() => setShowGuide(true)}
                class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b172f] px-3 py-2.5 text-sm font-semibold text-violet shadow-[inset_0_0_0_1px_rgba(142,107,255,0.22)] transition hover:bg-[#0d1d3b] hover:text-violet-light"
              >
                Ver guia completa
                <ArrowRight size={15} />
              </button>
            </article>
          </aside>

          <section class="order-1 min-w-0 space-y-4 md:col-span-2 2xl:order-2 2xl:col-span-1 2xl:flex 2xl:min-h-0 2xl:flex-col 2xl:overflow-hidden">
            <article class="relative overflow-hidden rounded-2xl bg-[#050d20]/90 p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_60px_rgba(1,5,16,0.38)] 2xl:p-6">
              <img
                src={lolHeroImage}
                alt=""
                class="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[45%] object-cover object-center opacity-45 mix-blend-screen md:block"
              />
              <div class="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] bg-gradient-to-r from-[#050d20] via-[#050d20]/50 to-transparent md:block" />
              <div class="relative">
                <h1 class="mb-2 text-3xl leading-tight text-violet lg:text-[2.15rem] 2xl:text-[2.45rem]">Tierlist de campeones</h1>
                <p class="max-w-2xl text-sm leading-6 text-muted">
                  Crea, ordena y guarda una tierlist con todos los campeones locales de League of Legends.
                </p>
              </div>
            </article>

            <article class="rounded-2xl bg-[#050d20]/90 p-4 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_50px_rgba(1,5,16,0.34)]">
              <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 class="text-sm font-semibold uppercase text-violet">Crear / editar tierlist</h2>
                <div class="flex flex-1 flex-wrap justify-end gap-2">
                  <label class="relative w-full max-w-xs">
                    <Search size={14} class="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      value={search}
                      onInput={(event) => setSearch(event.currentTarget.value)}
                      placeholder="Buscar campeon..."
                      class="field-control w-full rounded-lg py-2 pl-3 pr-9 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowFilters(true)}
                    class="inline-flex items-center gap-2 rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-muted shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:text-text"
                  >
                    <Filter size={14} />
                    Filtros
                  </button>
                </div>
              </div>

              <div class="overflow-hidden rounded-xl shadow-[inset_0_0_0_1px_rgba(148,163,184,0.07)]">
                {TIERS.map((tier) => (
                  <TierRow
                    key={tier}
                    tier={tier}
                    label={tierLabels[tier]}
                    championIds={placements[tier]}
                    championsById={championsById}
                    onLabelChange={(label) => updateTierLabel(tier, label)}
                    onDropChampion={(championId) => moveChampion(championId, tier)}
                    onRemoveChampion={(championId) => moveChampion(championId, 'available')}
                  />
                ))}
              </div>
            </article>

            <article
              class="rounded-2xl bg-[#050d20]/90 p-4 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_20px_50px_rgba(1,5,16,0.34)] 2xl:flex 2xl:min-h-0 2xl:flex-1 2xl:flex-col"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                const championId = event.dataTransfer?.getData('text/plain')
                if (championId) moveChampion(championId, 'available')
              }}
            >
              <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 class="text-sm font-semibold uppercase text-violet">Campeones disponibles</h2>
                <span class="rounded-full bg-[#0b172f] px-3 py-1 text-xs text-muted">
                  {availableChampions.length} visibles
                </span>
              </div>
              <div class="tiger-scrollbar grid max-h-[300px] auto-rows-max content-start items-start grid-cols-[repeat(auto-fill,minmax(56px,1fr))] gap-2 overflow-y-auto pr-2 2xl:max-h-none 2xl:min-h-0 2xl:flex-1">
                {availableChampions.map((champion) => (
                  <ChampionTile
                    key={champion.id}
                    champion={champion}
                    compact
                  />
                ))}
              </div>
            </article>

          </section>

          <aside class="contents 2xl:order-3 2xl:flex 2xl:min-h-0 2xl:flex-col 2xl:gap-4 2xl:overflow-hidden">
            <SidePanel title="Tierlist actual" className="order-2 2xl:order-none">
              <div class="flex items-center justify-between gap-3">
                {isEditingTitle ? (
                  <input
                    value={tierlistTitle}
                    autoFocus
                    onInput={(event) => setTierlistTitle(event.currentTarget.value)}
                    onBlur={() => commitTitle()}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') commitTitle()
                      if (event.key === 'Escape') {
                        setTierlistTitle(loadTierlistTitle())
                        setIsEditingTitle(false)
                      }
                    }}
                    class="field-control min-w-0 flex-1 rounded-lg px-3 py-2 text-sm font-semibold"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingTitle(true)}
                    class="min-w-0 truncate text-left text-lg font-semibold text-text transition hover:text-cyan"
                    title="Editar titulo"
                  >
                    {tierlistTitle}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
                  class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-[#0b172f] hover:text-cyan"
                  aria-label="Editar titulo"
                >
                  <Pencil size={14} />
                </button>
              </div>
              <p class="mt-1 text-xs text-muted">Guardado local automatico</p>
              <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
                <Stat label="Colocados" value={`${placedCount}`} />
                <Stat label="Restantes" value={`${championPool.length - placedCount}`} />
              </div>
            </SidePanel>

            <SidePanel title="Estadisticas del meta" className="order-4 hidden 2xl:order-none 2xl:block">
              <div class="space-y-3 text-sm text-muted">
                <InfoLine label="Parche" value={championsData.version} />
                <InfoLine label="Campeones" value={`${championPool.length}`} />
                <InfoLine label="Fuente" value="Datos locales" />
              </div>
            </SidePanel>

            <SidePanel title="Acciones" className="order-2 2xl:order-none">
              <div class="space-y-2">
                <button
                  type="button"
                  onClick={createNewTierlist}
                  class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b]"
                >
                  <Plus size={14} />
                  Nueva tierlist
                </button>
                <button
                  type="button"
                  onClick={saveCurrentTierlist}
                  class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b]"
                >
                  <Save size={14} />
                  Guardar tierlist
                </button>
                <button
                  type="button"
                  onClick={shareTierlist}
                  disabled={isCreatingImage}
                  class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#0d1d3b]"
                >
                  <Share2 size={14} />
                  {isCreatingImage ? 'Preparando...' : 'Compartir tierlist'}
                </button>
                <button
                  type="button"
                  onClick={exportTierlistImage}
                  disabled={isCreatingImage}
                  class="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  <Download size={14} />
                  {isCreatingImage ? 'Creando imagen...' : 'Exportar imagen'}
                </button>
              </div>
            </SidePanel>

            <SidePanel title="Notas" className="order-4 md:col-span-2 2xl:order-none 2xl:col-span-auto 2xl:flex 2xl:min-h-0 2xl:flex-1 2xl:flex-col">
              <textarea
                value={tierlistNotes}
                onInput={(event) => {
                  const nextNotes = event.currentTarget.value
                  setTierlistNotes(nextNotes)
                  saveTierlistNotes(nextNotes)
                }}
                placeholder="Anota picks clave, bans recomendados y matchups importantes..."
                class="field-control min-h-[260px] w-full resize-none rounded-lg px-3 py-3 text-sm text-text 2xl:min-h-0 2xl:flex-1"
                maxLength={600}
              />
              <p class="mt-2 text-right text-xs text-muted">{tierlistNotes.length}/600</p>
            </SidePanel>
          </aside>
        </section>
      </main>

      {toast ? (
        <div class="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#071427]/95 px-4 py-3 text-sm text-cyan shadow-[inset_0_0_0_1px_rgba(57,216,255,0.20),0_16px_40px_rgba(0,0,0,0.45)]">
          {toast}
        </div>
      ) : null}
      {showGuide ? <GuideModal onClose={() => setShowGuide(false)} /> : null}
      {showFilters ? (
        <FiltersModal
          selectedRole={selectedRole}
          selectedType={selectedType}
          onRoleChange={setSelectedRole}
          onTypeChange={setSelectedType}
          onReset={() => {
            setSelectedRole('Todos')
            setSelectedType('Todos')
          }}
          onClose={() => setShowFilters(false)}
        />
      ) : null}
      {libraryMode ? (
        <LibraryModal
          mode={libraryMode}
          items={libraryMode === 'tierlists' ? savedTierlists : templates}
          onLoad={(item) => {
            loadStoredTierlist(item, libraryMode)
            setLibraryMode(null)
          }}
          onDelete={(itemId) => deleteStoredTierlist(itemId, libraryMode)}
          onReorder={libraryMode === 'tierlists' ? reorderSavedTierlists : undefined}
          onSaveTemplate={saveCurrentAsTemplate}
          onClose={() => setLibraryMode(null)}
        />
      ) : null}
      <Footer className="mt-3 shrink-0" />
    </div>
  )
}

function TierRow({
  tier,
  label,
  championIds,
  championsById,
  onLabelChange,
  onDropChampion,
  onRemoveChampion,
}: {
  tier: Tier
  label: string
  championIds: string[]
  championsById: Map<string, Champion>
  onLabelChange: (label: string) => void
  onDropChampion: (championId: string) => void
  onRemoveChampion: (championId: string) => void
}) {
  const style = tierStyles[tier]
  const [isEditing, setIsEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState(label)

  function commitLabel() {
    onLabelChange(draftLabel)
    setDraftLabel(draftLabel.trim() || tier)
    setIsEditing(false)
  }

  return (
    <div
      class="grid min-h-[74px] grid-cols-[72px_minmax(0,1fr)] border-b border-white/5 last:border-b-0"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const championId = event.dataTransfer?.getData('text/plain')
        if (championId) onDropChampion(championId)
      }}
    >
      <div class={`grid place-items-center p-2 ${style.bg} ${style.text} ${style.glow}`}>
        {isEditing ? (
          <input
            value={draftLabel}
            autoFocus
            onInput={(event) => setDraftLabel(event.currentTarget.value)}
            onBlur={commitLabel}
            onKeyDown={(event) => {
              if (event.key === 'Enter') commitLabel()
              if (event.key === 'Escape') {
                setDraftLabel(label)
                setIsEditing(false)
              }
            }}
            class="field-control w-full rounded-md px-1 py-1 text-center text-sm font-bold"
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraftLabel(label)
              setIsEditing(true)
            }}
            class="w-full truncate text-lg font-bold"
            title="Editar fila"
          >
            {label}
          </button>
        )}
      </div>
      <div class="flex min-w-0 flex-wrap content-start gap-2 bg-[#08142c]/64 p-3">
        {championIds.length > 0 ? (
          championIds.map((id) => {
            const champion = championsById.get(id)
            return champion ? <PlacedChampion key={id} champion={champion} onRemove={() => onRemoveChampion(id)} /> : null
          })
        ) : (
          <p class="self-center text-xs text-muted">Arrastra campeones aqui</p>
        )}
      </div>
    </div>
  )
}

function PlacedChampion({ champion, onRemove }: { champion: Champion; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      draggable
      onDragStart={(event) => event.dataTransfer?.setData('text/plain', champion.id)}
      title={`${champion.name} - clic para quitar`}
      class="relative h-12 w-12 overflow-hidden rounded-lg bg-[#0b172f] ring-1 ring-cyan/24"
    >
      <img src={champion.imageUrl} alt={champion.name} class="h-full w-full object-cover" />
    </button>
  )
}

function ChampionTile({ champion, compact }: { champion: Champion; compact?: boolean }) {
  return (
    <div class="rounded-lg bg-[#09152c]/74 p-1.5 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
      <button
        type="button"
        draggable
        onDragStart={(event) => event.dataTransfer?.setData('text/plain', champion.id)}
        title={champion.name}
        class={`${compact ? 'h-12' : 'h-16'} w-full overflow-hidden rounded-md bg-[#0b172f] ring-1 ring-cyan/18`}
      >
        <img src={champion.imageUrl} alt={champion.name} class="h-full w-full object-cover" />
      </button>
      <p class="mt-1 truncate text-center text-[10px] text-muted">{champion.name}</p>
    </div>
  )
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div class="rounded-xl bg-[#09152c]/74 px-3 py-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
      <p class="mb-1 text-xs text-muted">{label}</p>
      <p class="text-sm font-semibold text-text">{value}</p>
    </div>
  )
}

function GuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div class="fixed inset-0 z-50 grid place-items-center bg-[#01040d]/90 px-4 backdrop-blur-md" onClick={onClose}>
      <div
        class="tiger-scrollbar max-h-[86vh] w-[min(94vw,900px)] overflow-y-auto rounded-2xl bg-[#030916]/98 p-5 text-left shadow-[inset_0_0_0_1px_rgba(142,107,255,0.24),0_24px_80px_rgba(0,0,0,0.78)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tierlist-guide-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="tierlist-guide-title" class="text-sm font-semibold uppercase text-violet">Guia completa</h2>
            <p class="mt-1 text-sm text-muted">Metodo recomendado para crear una tierlist clara, editable y facil de compartir.</p>
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

        <div class="mb-4 inline-flex rounded-full bg-[#0b172f] px-3 py-1 text-xs text-cyan shadow-[inset_0_0_0_1px_rgba(57,216,255,0.12)]">
          Solo Ranked - Global
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <GuideBlock
            title="1. Define el criterio"
            items={[
              'S+ reserva los campeones que dominan partidas y drafts.',
              'S y A son picks fuertes, consistentes o faciles de encajar.',
              'B, C y D sirven para picks situacionales, debiles o fuera de meta.',
            ]}
          />
          <GuideBlock
            title="2. Ordena por contexto"
            items={[
              'Filtra por rol si quieres construir una tierlist especifica.',
              'Arrastra campeones entre filas hasta que el reparto tenga sentido.',
              'Si dudas entre dos tiers, prioriza consistencia antes que potencial.',
            ]}
          />
          <GuideBlock
            title="3. Guarda versiones"
            items={[
              'Usa Guardar tierlist para conservar una version dentro de la app.',
              'Guarda plantillas si quieres reutilizar una estructura de tiers.',
              'Crea una nueva tierlist cuando quieras empezar sin perder las guardadas.',
            ]}
          />
          <GuideBlock
            title="4. Comparte el resultado"
            items={[
              'Exportar imagen crea un PNG listo para enviar.',
              'Compartir tierlist usa el menu nativo si el sistema lo permite.',
              'Revisa el titulo antes de exportar para que la imagen quede identificada.',
            ]}
          />
        </div>
      </div>
    </div>
  )
}

function GuideBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section class="rounded-xl bg-[#09152c]/74 p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
      <h3 class="mb-3 text-sm font-semibold text-text">{title}</h3>
      <ul class="space-y-2 text-sm leading-6 text-muted">
        {items.map((item) => (
          <li key={item} class="flex gap-2">
            <span class="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function FiltersModal({
  selectedRole,
  selectedType,
  onRoleChange,
  onTypeChange,
  onReset,
  onClose,
}: {
  selectedRole: Role | 'Todos'
  selectedType: string
  onRoleChange: (role: Role | 'Todos') => void
  onTypeChange: (type: string) => void
  onReset: () => void
  onClose: () => void
}) {
  return (
    <div class="fixed inset-0 z-50 grid place-items-center bg-[#01040d]/90 px-4 backdrop-blur-md" onClick={onClose}>
      <div
        class="w-[min(94vw,520px)] rounded-2xl bg-[#030916]/98 p-5 text-left shadow-[inset_0_0_0_1px_rgba(142,107,255,0.24),0_24px_80px_rgba(0,0,0,0.78)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tierlist-filters-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="tierlist-filters-title" class="text-sm font-semibold uppercase text-violet">Filtros</h2>
            <p class="mt-1 text-sm text-muted">Filtra los campeones disponibles por linea y tipo.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b172f] text-muted transition hover:bg-[#0d1d3b] hover:text-text"
            aria-label="Cerrar filtros"
          >
            <X size={17} />
          </button>
        </div>

        <div class="space-y-3">
          <label class="block rounded-xl bg-[#09152c]/74 px-3 py-3 text-sm shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
            <span class="mb-2 block text-xs text-muted">Linea</span>
            <select
              value={selectedRole}
              onChange={(event) => onRoleChange(event.currentTarget.value as Role | 'Todos')}
              class="field-control w-full rounded-lg px-3 py-2 text-sm"
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role === 'Todos' ? 'Todas las lineas' : role}
                </option>
              ))}
            </select>
          </label>

          <label class="block rounded-xl bg-[#09152c]/74 px-3 py-3 text-sm shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
            <span class="mb-2 block text-xs text-muted">Tipo de campeon</span>
            <select
              value={selectedType}
              onChange={(event) => onTypeChange(event.currentTarget.value)}
              class="field-control w-full rounded-lg px-3 py-2 text-sm"
            >
              <option value="Todos">Todos los tipos</option>
              {CHAMPION_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div class="mt-5 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onReset}
            class="inline-flex flex-1 items-center justify-center rounded-lg bg-[#0b172f] px-4 py-2.5 text-sm text-cyan shadow-[inset_0_0_0_1px_rgba(57,216,255,0.12)] transition hover:bg-[#0d1d3b]"
          >
            Limpiar filtros
          </button>
          <button
            type="button"
            onClick={onClose}
            class="inline-flex flex-1 items-center justify-center rounded-lg bg-violet px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

function formatSavedDate(timestamp: number) {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(timestamp))
}

function countPlacedChampions(placements: Record<Tier, string[]>) {
  return TIERS.reduce((count, tier) => count + placements[tier].length, 0)
}

function LibraryModal({
  mode,
  items,
  onLoad,
  onDelete,
  onReorder,
  onSaveTemplate,
  onClose,
}: {
  mode: 'tierlists' | 'templates'
  items: StoredTierlist[]
  onLoad: (item: StoredTierlist) => void
  onDelete: (itemId: string) => void
  onReorder?: (activeId: string, targetId: string) => void
  onSaveTemplate: () => void
  onClose: () => void
}) {
  const isTemplates = mode === 'templates'

  return (
    <div class="fixed inset-0 z-50 grid place-items-center bg-[#01040d]/90 px-4 backdrop-blur-md" onClick={onClose}>
      <div
        class="tiger-scrollbar max-h-[86vh] w-[min(94vw,820px)] overflow-y-auto rounded-2xl bg-[#030916]/98 p-5 text-left shadow-[inset_0_0_0_1px_rgba(142,107,255,0.24),0_24px_80px_rgba(0,0,0,0.78)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tierlist-library-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div class="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="tierlist-library-title" class="text-sm font-semibold uppercase text-violet">
              {isTemplates ? 'Plantillas' : 'Mis tierlists'}
            </h2>
            <p class="mt-1 text-sm text-muted">
              {items.length} {items.length === 1 ? 'elemento guardado' : 'elementos guardados'}
            </p>
          </div>
          <div class="flex items-center gap-2">
            {isTemplates ? (
              <button
                type="button"
                onClick={onSaveTemplate}
                class="inline-flex items-center justify-center gap-2 rounded-lg bg-violet px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                <Save size={14} />
                Guardar actual como plantilla
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b172f] text-muted transition hover:bg-[#0d1d3b] hover:text-text"
              aria-label="Cerrar biblioteca"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {items.length > 0 ? (
          <div class="grid gap-2 md:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.id}
                draggable={Boolean(onReorder)}
                onDragStart={(event) => {
                  if (onReorder) event.dataTransfer?.setData('application/tigerbyte-tierlist', item.id)
                }}
                onDragOver={(event) => {
                  if (onReorder) event.preventDefault()
                }}
                onDrop={(event) => {
                  event.preventDefault()
                  if (!onReorder) return
                  const activeId = event.dataTransfer?.getData('application/tigerbyte-tierlist')
                  if (activeId) onReorder(activeId, item.id)
                }}
                class={`rounded-xl bg-[#09152c]/74 p-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)] ${onReorder ? 'cursor-grab active:cursor-grabbing' : ''}`}
                title={onReorder ? 'Arrastra para cambiar el orden visible' : undefined}
              >
                <div class="mb-3 flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate font-semibold text-text">{item.title}</p>
                    <p class="mt-1 text-xs text-muted">
                      {countPlacedChampions(item.placements)} campeones - {formatSavedDate(item.updatedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0b172f] text-muted transition hover:bg-red-500/18 hover:text-red-200"
                    aria-label="Borrar"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onLoad(item)}
                  class="inline-flex w-full items-center justify-center rounded-lg bg-[#0b172f] px-3 py-2 text-sm text-cyan shadow-[inset_0_0_0_1px_rgba(57,216,255,0.12)] transition hover:bg-[#0d1d3b]"
                >
                  Cargar
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p class="rounded-xl bg-[#09152c]/74 px-4 py-4 text-sm text-muted">
            {isTemplates
              ? 'Todavia no tienes plantillas. Guarda la tierlist actual como plantilla para reutilizarla.'
              : 'Todavia no has guardado ninguna tierlist en la app.'}
          </p>
        )}
      </div>
    </div>
  )
}

function SidePanel({
  title,
  children,
  className = '',
}: {
  title: string
  children: ComponentChildren
  className?: string
}) {
  return (
    <article class={`rounded-2xl bg-[#050d20]/90 p-4 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.10),0_18px_42px_rgba(1,5,16,0.34)] ${className}`}>
      <h2 class="mb-3 text-sm font-semibold uppercase text-violet">{title}</h2>
      {children}
    </article>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div class="rounded-lg bg-[#09152c]/74 px-3 py-2">
      <p class="text-xs text-muted">{label}</p>
      <p class="mt-1 font-semibold text-text">{value}</p>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div class="flex items-center justify-between gap-3">
      <span>{label}</span>
      <strong class="text-right text-text">{value}</strong>
    </div>
  )
}
