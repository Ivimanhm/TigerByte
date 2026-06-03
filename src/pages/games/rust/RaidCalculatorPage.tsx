import { useMemo, useState } from 'preact/hooks'
import { Calculator, RotateCcw } from 'lucide-preact'
import { HUDBackground } from '../../../components/effects/HUDBackground'
import { Footer } from '../../../components/layout/Footer'
import { Navbar } from '../../../components/layout/Navbar'
import { GlassPanel } from '../../../components/ui/GlassPanel'
import compoundBg from '../../../assets/games/rust/Compound 1.png'

type ResourceType = 'sulfur' | 'metal' | 'charcoal' | 'hqm' | 'scrap' | 'rope' | 'cloth' | 'tech' | 'explosives' | 'gunpowder' | 'lowgrade' | 'pipes'

type ResourceCost = {
  type: ResourceType
  amount: number
}

type ConstructionGroup = 'wall' | 'door'
type WallMaterial = 'stone' | 'sheet' | 'hq'
type DoorMaterial = 'garage' | 'sheet' | 'hq'
type Material = WallMaterial | DoorMaterial

type ExplosiveId = keyof typeof explosiveDefs

const rustIcon = (shortname: string) => `/rust/items/${shortname}.webp`
const rustHiIcon = (shortname: string) => `/rust/items-hi/${shortname}.png`

const resourceMeta: Record<ResourceType, { label: string; icon: string }> = {
  sulfur: { label: 'Sulfur', icon: rustIcon('sulfur') },
  metal: { label: 'Metal Fragments', icon: rustIcon('metal.fragments') },
  charcoal: { label: 'Charcoal', icon: rustIcon('charcoal') },
  hqm: { label: 'HQM', icon: rustIcon('metal.refined') },
  scrap: { label: 'Scrap', icon: rustIcon('scrap') },
  rope: { label: 'Rope', icon: rustIcon('rope') },
  cloth: { label: 'Cloth', icon: rustIcon('cloth') },
  tech: { label: 'Tech Trash', icon: rustIcon('techparts') },
  explosives: { label: 'Explosives', icon: rustHiIcon('explosives') },
  gunpowder: { label: 'Gun Powder', icon: rustHiIcon('gunpowder') },
  lowgrade: { label: 'Low Grade Fuel', icon: rustHiIcon('lowgradefuel') },
  pipes: { label: 'Metal Pipe', icon: rustHiIcon('metalpipe') },
}

const explosiveDefs = {
  exp556: {
    name: 'Explosive 5.56 Rifle Ammo',
    icon: rustHiIcon('ammo.rifle.explosive'),
    timerSeconds: 2,
    noise: 'Alto',
    perUnit: [
      { type: 'gunpowder', amount: 10 },
      { type: 'sulfur', amount: 10 },
      { type: 'metal', amount: 5 },
    ] as ResourceCost[],
  },
  rocket: {
    name: 'Rocket',
    icon: rustHiIcon('ammo.rocket.basic'),
    timerSeconds: 6,
    noise: 'Muy alto',
    perUnit: [
      { type: 'explosives', amount: 10 },
      { type: 'gunpowder', amount: 150 },
      { type: 'pipes', amount: 2 },
    ] as ResourceCost[],
  },
  satchel: {
    name: 'Satchel Charge',
    icon: rustHiIcon('explosive.satchel'),
    timerSeconds: 4,
    noise: 'Bajo',
    perUnit: [
      { type: 'gunpowder', amount: 240 },
      { type: 'metal', amount: 80 },
      { type: 'cloth', amount: 10 },
      { type: 'rope', amount: 1 },
    ] as ResourceCost[],
  },
  c4: {
    name: 'Timed Explosive Charge',
    icon: rustHiIcon('explosive.timed'),
    timerSeconds: 10,
    noise: 'Muy alto',
    perUnit: [
      { type: 'explosives', amount: 20 },
      { type: 'cloth', amount: 5 },
      { type: 'tech', amount: 2 },
    ] as ResourceCost[],
  },
  beancan: {
    name: 'Beancan Grenade',
    icon: rustHiIcon('grenade.beancan'),
    timerSeconds: 4,
    noise: 'Medio',
    perUnit: [
      { type: 'gunpowder', amount: 60 },
      { type: 'metal', amount: 20 },
    ] as ResourceCost[],
  },
}

const explosiveOrder: ExplosiveId[] = ['c4', 'rocket', 'exp556', 'satchel', 'beancan']

const explosiveCraft = {
  gunpowderPerExplosive: 50,
  sulfurPerExplosive: 10,
  metalPerExplosive: 10,
  lowgradePerExplosive: 3,
  sulfurPerGunpowder: 2,
  charcoalPerGunpowder: 3,
}

const craftResourceOrder: ResourceType[] = ['explosives', 'gunpowder', 'sulfur', 'metal', 'charcoal', 'lowgrade', 'hqm', 'scrap', 'cloth', 'rope', 'tech', 'pipes']

function buildFullCraftResources(resources: ResourceCost[]) {
  const totals = new Map<ResourceType, number>()
  for (const resource of resources) {
    totals.set(resource.type, (totals.get(resource.type) ?? 0) + resource.amount)
    if (resource.type === 'explosives') {
      const gunpowder = resource.amount * explosiveCraft.gunpowderPerExplosive
      totals.set('gunpowder', (totals.get('gunpowder') ?? 0) + gunpowder)
      totals.set('sulfur', (totals.get('sulfur') ?? 0) + resource.amount * explosiveCraft.sulfurPerExplosive + gunpowder * explosiveCraft.sulfurPerGunpowder)
      totals.set('charcoal', (totals.get('charcoal') ?? 0) + gunpowder * explosiveCraft.charcoalPerGunpowder)
      totals.set('metal', (totals.get('metal') ?? 0) + resource.amount * explosiveCraft.metalPerExplosive)
      totals.set('lowgrade', (totals.get('lowgrade') ?? 0) + resource.amount * explosiveCraft.lowgradePerExplosive)
    }
    if (resource.type === 'gunpowder') {
      totals.set('sulfur', (totals.get('sulfur') ?? 0) + resource.amount * explosiveCraft.sulfurPerGunpowder)
      totals.set('charcoal', (totals.get('charcoal') ?? 0) + resource.amount * explosiveCraft.charcoalPerGunpowder)
    }
  }

  return Array.from(totals.entries())
    .map(([type, amount]) => ({ type, amount }))
    .sort((a, b) => craftResourceOrder.indexOf(a.type) - craftResourceOrder.indexOf(b.type))
}

const raidProfiles: Record<ConstructionGroup, Record<string, { label: string; values: Partial<Record<ExplosiveId, number>> }>> = {
  wall: {
    stone: { label: 'Pared de piedra', values: { exp556: 182, rocket: 4, satchel: 10, c4: 2, beancan: 46 } },
    sheet: { label: 'Pared de chapa', values: { exp556: 400, rocket: 8, satchel: 23, c4: 4, beancan: 100 } },
    hq: { label: 'Pared HQM', values: { exp556: 800, rocket: 15, satchel: 46, c4: 8, beancan: 200 } },
  },
  door: {
    garage: { label: 'Puerta de garaje', values: { exp556: 150, rocket: 3, satchel: 9, c4: 2, beancan: 42 } },
    sheet: { label: 'Puerta de chapa', values: { exp556: 63, rocket: 2, satchel: 4, c4: 1, beancan: 18 } },
    hq: { label: 'Puerta HQM', values: { exp556: 200, rocket: 4, satchel: 12, c4: 2, beancan: 50 } },
  },
}

const groupOptions: Array<{ id: ConstructionGroup; label: string }> = [
  { id: 'wall', label: 'Paredes' },
  { id: 'door', label: 'Puertas' },
]

type OptionCard = {
  id: ExplosiveId
  explosive: string
  icon: string
  units: number
  totalSulfur: number
  totalResources: number
  fullCraftResources: ResourceCost[]
  timerSeconds: number
  noise: string
  resources: ResourceCost[]
}

const formatNumber = (value: number) => value.toLocaleString('es-ES')

export function RaidCalculatorPage() {
  const [constructionGroup, setConstructionGroup] = useState<ConstructionGroup>('wall')
  const [material, setMaterial] = useState<Material>('stone')
  const [wallCount, setWallCount] = useState(1)
  const [selectedExplosiveId, setSelectedExplosiveId] = useState<ExplosiveId>('c4')
  const [availableSulfur, setAvailableSulfur] = useState(0)

  const materialOptions = useMemo(() => {
    if (constructionGroup === 'wall') {
      return [
        { id: 'stone', label: 'Stone' },
        { id: 'sheet', label: 'Chapa' },
        { id: 'hq', label: 'HQ' },
      ] as Array<{ id: Material; label: string }>
    }
    return [
      { id: 'garage', label: 'Garage' },
      { id: 'sheet', label: 'Chapa' },
      { id: 'hq', label: 'HQ' },
    ] as Array<{ id: Material; label: string }>
  }, [constructionGroup])

  const quantity = constructionGroup === 'wall' ? wallCount : 1
  const profile = raidProfiles[constructionGroup][material]

  const options = useMemo(() => {
    if (!profile) return []
    return (Object.keys(profile.values) as ExplosiveId[])
      .map((id) => {
        const units = profile.values[id] ?? 0
        const def = explosiveDefs[id]
        const scaledResources = def.perUnit.map((resource) => ({ ...resource, amount: resource.amount * units * quantity }))
        const fullCraftResources = buildFullCraftResources(scaledResources)
        const sulfur = scaledResources.find((resource) => resource.type === 'sulfur')?.amount ?? 0
        const totalResources = fullCraftResources.reduce((acc, resource) => acc + resource.amount, 0)
        return {
          id,
          explosive: def.name,
          icon: def.icon,
          units: units * quantity,
          totalSulfur: sulfur,
          totalResources,
          fullCraftResources,
          timerSeconds: def.timerSeconds * units * quantity,
          noise: def.noise,
          resources: scaledResources,
        } satisfies OptionCard
      })
      .sort((a, b) => explosiveOrder.indexOf(a.id) - explosiveOrder.indexOf(b.id))
  }, [profile, quantity])

  const bestOption = options[0]
  const selectedOption = options.find((option) => option.id === selectedExplosiveId) ?? bestOption
  const sulfurCostForSingleItem = (id: ExplosiveId) => {
    const sulfur = buildFullCraftResources(explosiveDefs[id].perUnit).find((resource) => resource.type === 'sulfur')?.amount ?? 0
    return sulfur
  }
  const c4SulfurCost = sulfurCostForSingleItem('c4')
  const rocketSulfurCost = sulfurCostForSingleItem('rocket')
  const craftableC4 = c4SulfurCost > 0 ? Math.floor(availableSulfur / c4SulfurCost) : 0
  const craftableRockets = rocketSulfurCost > 0 ? Math.floor(availableSulfur / rocketSulfurCost) : 0

  return (
    <div class="relative min-h-screen pb-10">
      <HUDBackground />
      <Navbar />

      <main class="mx-auto w-[min(98%,1800px)] px-2 pt-4 md:px-4">
        <section class="grid gap-4">
          <GlassPanel class="overflow-hidden rounded-2xl border-[#26314a]/60 shadow-[inset_0_0_18px_rgba(127,77,255,0.08),0_18px_44px_rgba(0,0,0,0.22)]">
            <div class="relative p-5 md:p-7">
              <div class="absolute inset-0 bg-cover bg-center opacity-75" style={{ backgroundImage: `linear-gradient(115deg,rgba(5,14,36,0.92),rgba(5,14,36,0.65)),url('${compoundBg}')` }} />
              <div class="relative">
                <div class="text-sm text-muted">Mapas &gt; Calculadora de raideos</div>
                <h1 class="mt-1 text-4xl font-bold text-violet md:text-6xl">Calculadora de raideos</h1>
                <p class="mt-2 max-w-3xl text-muted">Calcula el coste en explosivos y recursos para destruir cualquier estructura.</p>
              </div>
            </div>
          </GlassPanel>

          <section class="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div class="grid content-start gap-4">
              <GlassPanel class="rounded-2xl border-[#26314a]/55 p-4 shadow-[inset_0_0_18px_rgba(127,77,255,0.06)]">
                <div class="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                  <CardField title="Tipo de estructura">
                    {groupOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          const nextGroup = option.id
                          const nextMaterial = nextGroup === 'wall' ? 'stone' : 'garage'
                          setConstructionGroup(nextGroup)
                          setMaterial(nextMaterial)
                          if (nextGroup !== 'wall') setWallCount(1)
                        }}
                        class={buttonClass(constructionGroup === option.id)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </CardField>

                  <CardField title="Material">
                    {materialOptions.map((option) => (
                      <button key={option.id} type="button" onClick={() => setMaterial(option.id)} class={buttonClass(material === option.id)}>
                        {option.label}
                      </button>
                    ))}
                  </CardField>

                  <CardField title="Cantidad de paredes" muted={constructionGroup !== 'wall'}>
                    <button
                      type="button"
                      disabled={constructionGroup !== 'wall'}
                      onClick={() => setWallCount((prev) => Math.max(1, prev - 1))}
                      class="h-9 w-9 rounded-lg border border-[#283451] bg-[#09152c]/80 text-lg text-text transition hover:border-violet/50 hover:text-violet-light disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={wallCount}
                      disabled={constructionGroup !== 'wall'}
                      onInput={(event) => {
                        const parsed = Number(event.currentTarget.value)
                        setWallCount(Number.isFinite(parsed) ? Math.min(500, Math.max(1, parsed)) : 1)
                      }}
                      class="w-20 rounded-lg border border-[#283451] bg-[#09152c]/80 px-3 py-2 text-center text-sm text-text focus:border-violet/70 focus:outline-none disabled:opacity-45"
                    />
                    <button
                      type="button"
                      disabled={constructionGroup !== 'wall'}
                      onClick={() => setWallCount((prev) => Math.min(500, prev + 1))}
                      class="h-9 w-9 rounded-lg border border-[#283451] bg-[#09152c]/80 text-lg text-text transition hover:border-violet/50 hover:text-violet-light disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      +
                    </button>
                  </CardField>
                </div>
              </GlassPanel>

              <GlassPanel class="rounded-2xl border-[#26314a]/55 p-4 shadow-[inset_0_0_18px_rgba(127,77,255,0.06)]">
                <div class="mb-3 flex items-center justify-between">
                  <h2 class="text-sm font-semibold uppercase tracking-[0.08em] text-violet">Mejores opciones</h2>
                  <button
                    type="button"
                    onClick={() => setSelectedExplosiveId('c4')}
                    class="inline-flex items-center gap-2 rounded-lg border border-violet/45 bg-violet/15 px-3 py-1.5 text-xs font-semibold text-violet-light transition hover:bg-violet/25"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>
                </div>

                <div class="grid items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                  {options.map((option, index) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedExplosiveId(option.id)}
                      class={`flex h-full min-h-[430px] flex-col rounded-xl border bg-[#071328]/85 p-3 text-left transition ${
                        selectedExplosiveId === option.id
                          ? 'border-violet/70 bg-violet/[0.12] shadow-[inset_0_0_0_1px_rgba(168,85,247,0.34),0_0_30px_rgba(127,77,255,0.18)]'
                          : 'border-[#23304d]/70 hover:border-violet/35 hover:bg-[#0a1730]'
                      }`}
                    >
                      <div class="mb-2 flex items-center justify-between text-xs text-muted">
                        <span class={`rounded-md border px-2 py-1 ${selectedExplosiveId === option.id ? 'border-violet/50 bg-violet/20 text-violet-light' : 'border-[#2b3855]'}`}>{index + 1}</span>
                        <span class="rounded-md bg-[#09152c]/80 px-2 py-1 text-[10px] font-bold uppercase text-muted">Orden fijo</span>
                      </div>
                      <div class="grid h-32 place-items-center">
                        <img src={option.icon} alt={option.explosive} class="h-28 w-28 object-contain" />
                      </div>
                      <div class="min-h-[48px] font-semibold leading-6 text-text">{option.explosive}</div>
                      <div class="mt-2 rounded-lg bg-[#09152c]/80 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
                        <div class="text-[11px] uppercase tracking-[0.08em] text-muted">Explosivos necesarios</div>
                        <div class="mt-0.5 text-2xl font-bold text-violet-light">{formatNumber(option.units)}</div>
                      </div>
                      <div class="mt-2 flex min-h-[132px] flex-wrap content-start gap-2">
                        {option.fullCraftResources.map((resource) => (
                          <div key={`${option.id}-${resource.type}`} class="flex items-center gap-1 rounded-md border border-[#25314d]/70 bg-[#09152c]/80 px-2 py-1 text-xs text-text">
                            <img src={resourceMeta[resource.type].icon} alt={resourceMeta[resource.type].label} class="h-4 w-4 object-contain" />
                            {formatNumber(resource.amount)}
                          </div>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              </GlassPanel>

            </div>

            <aside class="grid content-start gap-4">
              <GlassPanel class="rounded-2xl border-[#26314a]/55 p-4 shadow-[inset_0_0_18px_rgba(127,77,255,0.06)]">
                <h2 class="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-violet">Detalle del explosivo</h2>
                {selectedOption ? (
                  <>
                    <div class="mb-3 flex items-center gap-3">
                      <div class="grid h-20 w-20 place-items-center rounded-xl border border-violet/35 bg-violet/[0.10]">
                        <img src={selectedOption.icon} alt={selectedOption.explosive} class="h-16 w-16 object-contain" />
                      </div>
                      <div>
                        <div class="font-semibold text-text">{selectedOption.explosive}</div>
                        <div class="text-sm text-muted">Ideal para {profile?.label.toLowerCase() ?? 'estructuras'}.</div>
                      </div>
                    </div>
                    <div class="mt-3 grid grid-cols-2 gap-2">
                      {selectedOption.fullCraftResources.map((resource) => (
                        <div key={`${selectedOption.id}-info-${resource.type}`} class="flex items-center gap-2 rounded-lg border border-[#25314d]/70 bg-[#08152f] px-2 py-2 text-sm text-text">
                          <img src={resourceMeta[resource.type].icon} alt={resourceMeta[resource.type].label} class="h-4 w-4 object-contain" />
                          <span>{formatNumber(resource.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div class="text-sm text-muted">Selecciona una opcion para ver detalles.</div>
                )}
              </GlassPanel>

              <GlassPanel class="rounded-2xl border-[#26314a]/55 p-4 shadow-[inset_0_0_18px_rgba(127,77,255,0.06)]">
                <h2 class="mb-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-violet">
                  <Calculator size={15} />
                  Plan solo con azufre
                </h2>
                <div class="grid gap-2">
                  <label class="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                    Azufre disponible
                    <input
                      type="number"
                      min={0}
                      value={availableSulfur}
                      onInput={(event) => setAvailableSulfur(Math.max(0, Number(event.currentTarget.value) || 0))}
                      class="mt-1 w-full rounded-lg border border-[#283451] bg-[#09152c]/80 px-3 py-2 text-sm text-text focus:border-violet/70 focus:outline-none"
                    />
                  </label>
                </div>

                <div class="mt-3 grid gap-2 text-sm">
                  <PlanRow label="C4 fabricables" value={formatNumber(craftableC4)} strong />
                  <PlanRow label="Cohetes fabricables" value={formatNumber(craftableRockets)} strong />
                </div>
              </GlassPanel>
            </aside>
          </section>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function CardField({ title, children, muted = false }: { title: string; children: preact.ComponentChildren; muted?: boolean }) {
  return (
    <div class={`rounded-xl border border-[#25314d]/70 bg-[#081226]/70 p-3 ${muted ? 'opacity-50' : ''}`}>
      <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-violet">{title}</span>
      <div class="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  )
}

function PlanRow({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div class="flex items-center justify-between gap-3 rounded-lg bg-[#09152c]/70 px-3 py-2 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
      <span class="text-muted">{label}</span>
      <span class={strong ? 'font-bold text-violet-light' : 'font-semibold text-text'}>{value}</span>
    </div>
  )
}

function buttonClass(active: boolean) {
  return `rounded-lg border px-3 py-2 text-sm font-semibold transition ${
    active
      ? 'border-violet/70 bg-violet/25 text-violet-light shadow-[inset_0_0_0_1px_rgba(168,85,247,0.28),0_0_20px_rgba(127,77,255,0.16)]'
      : 'border-[#283451] bg-[#09152c]/80 text-text hover:border-violet/45 hover:text-violet-light'
  }`
}
