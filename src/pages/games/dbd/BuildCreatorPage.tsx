import {
  Calendar,
  ChevronRight,
  Copy,
  FileJson,
  Edit3,
  Filter,
  Globe2,
  Plus,
  Save,
  Search,
  Share2,
  Tag,
  Trash2,
  X,
} from 'lucide-preact'
import { useEffect, useMemo, useState } from 'preact/hooks'
import dbdPerksData from '../../../data/dbdPerksData.json'
import dbdKillerAddonsData from '../../../data/dbdKillerAddonsData.json'
import { Footer } from '../../../components/layout/Footer'
import { HUDBackground } from '../../../components/effects/HUDBackground'
import { Navbar } from '../../../components/layout/Navbar'

type PerkRole = 'killer' | 'survivor'
type AddonRarity = 'common' | 'uncommon' | 'rare' | 'veryRare' | 'ultraRare'

type DbdAddon = {
  apiKey?: string
  name: string
  apiName?: string
  label?: string
  description?: string
  rarity?: AddonRarity
  image?: string
  iconFile?: string
  apiImage?: string
  parents?: string[]
}

type Perk = {
  id: string
  apiKey?: string
  name: string
  description: string
  owner: string
  role: PerkRole
  localIcon: string
  characterName?: string
  categories?: string[]
  teachable?: number
  tunables?: Record<string, Array<number | string>>
  apiImage?: string
  searchAliases?: string[]
}

type Build = {
  id: string
  name: string
  subtitle: string
  role: PerkRole
  killerId?: string
  survivorId?: string
  addons?: string[]
  perkIds: string[]
  notes: string
  updatedAt: number
}

type DbdSurvivor = {
  id: string
  name: string
  code: string
  imageUrl: string
}

declare global {
  interface Window {
    tigerbyteDesktop?: {
      isDesktop: boolean
      copyText?: (text: string) => Promise<boolean>
      readText?: () => Promise<string>
    }
  }
}

const STORAGE_KEY = 'tb_dbd_build_workspace'
const SAVED_BUILDS_KEY = 'tb_dbd_saved_builds'
const MAX_PERKS = 4

const roleLabels: Record<PerkRole, string> = {
  killer: 'Asesino',
  survivor: 'Superviviente',
}

const roleTabs: PerkRole[] = ['survivor', 'killer']

const wikiImage = (fileName: string, host = 'deadbydaylight.fandom.com') => `https://${host}/wiki/Special:Redirect/file/${encodeURIComponent(fileName)}`
const localSurvivorImage = (fileName: string) => `/dbd/survivors/${fileName}`
const localAddonImage = (imageKey: string) => `/dbd/addons/${imageKey}.png`
const addonIconFiles: Record<string, string> = {
  'Doom Engravings': 'IconAddon doomEngravings.png',
  'LoPro Chains': 'IconAddon loProChains.png',
  'Spiked Boots': 'IconAddon spikedBoots.png',
  'Steel Toe Boots': 'IconAddon steelToeBoots.png',
  'Low Kickback Chains': 'IconAddon lowKickbackChains.png',
  'Apex Muffler': 'IconAddon apexMuffler.png',
  'Greased Throttle': 'IconAddon greasedThrottle.png',
  'Heavy Clutch': 'IconAddon heavyClutch.png',
  'High-Speed Idler Screw': 'IconAddon highSpeedIdlerScrew.png',
  'Homemade Muffler': 'IconAddon homemadeMuffler.png',
  'Iridescent Brick': 'IconAddon iridescentBrick.png',
  'Iridescent Engravings': 'IconAddon iridescentEngravings.png',
  'Junkyard Air Filter': 'IconAddon junkyardAirFilter.png',
  'Leafy Mash': 'IconAddon leafyMash.png',
  'Off-Brand Motor Oil': 'IconAddon off-brandMotorOil.png',
  'Primer Bulb': 'IconAddon primerBulb.png',
  'Punctured Muffler': 'IconAddon puncturedMuffler.png',
  'Ragged Engine': 'IconAddon raggedEngine.png',
  'Shop Lubricant': 'IconAddon shopLubricant.png',
  'Spark Plug': 'IconAddon sparkPlug.png',
  'Speed Limiter': 'IconAddon speedLimiter.png',
  'All Seeing - Blood': 'IconAddon allSeeingBlood.png',
  'All Seeing - Spirit': 'IconAddon allSeeingSpirit.png',
  'Blind Warrior - Blood': 'IconAddon blindWarriorBlood.png',
  'Blind Warrior - Mud': 'IconAddon blindWarriorMud.png',
  'Swift Hunt - Blood': 'IconAddon swiftHunt-Blood.png',
  'Swift Hunt - Mud': 'IconAddon swiftHunt-Mud.png',
  'Swift Hunt - White': 'IconAddon swiftHunt-White.png',
  'Windstorm - Blood': 'IconAddon windstormBlood.png',
  'Windstorm - Mud': 'IconAddon windstormMud.png',
  'Windstorm - White': 'IconAddon windstormWhite.png',
  'Amandas Secret': 'IconAddon amandasSecret.png',
  'Annotated Plan': 'IconAddon annotatedPlan.png',
  'Bag of Gears': 'IconAddon bagOfGears.png',
  'Combat Straps': 'IconAddon combatStraps.png',
  'Crate of Gears': 'IconAddon crateOfGears.png',
  'Face Mask': 'IconAddon faceMask.png',
  'Interlocking Razor': 'IconAddon interlockingRazor.png',
  'Johns Medical File': 'IconAddon johnsMedicalFile.png',
  'Last Will': 'IconAddon lastWill.png',
  'Razor Wires': 'IconAddon razorWires.png',
  'Rules Set No.2': 'IconAddon rulesSetNo.2.png',
  'Shattered Syringe': 'IconAddon shatteredSyringe.png',
  'Slow-Release Toxin': 'IconAddon slow-ReleaseToxin.png',
  'Utility Blades': 'IconAddon utilityBlades.png',
  'Video Tape': 'IconAddon videoTape.png',
  'Workshop Grease': 'IconAddon workshopGrease.png',
}
const addonImageCandidates = (addonName: string, imageKey?: string, apiImage?: string, iconFile?: string) => {
  const lowerFirst = toAddonFileName(addonName)
  const upperFirst = toAddonFileName(addonName, false)
  const apiImageKey = apiImage?.split('/').pop()
  return Array.from(new Set([
    iconFile ? wikiImage(iconFile, 'deadbydaylight.wiki.gg') : '',
    iconFile ? wikiImage(iconFile) : '',
    imageKey ? localAddonImage(imageKey) : '',
    imageKey ? wikiImage(`IconAddon ${imageKey}.png`, 'deadbydaylight.wiki.gg') : '',
    imageKey ? wikiImage(`IconAddon ${imageKey}.png`) : '',
    imageKey ? wikiImage(`FulliconAddon ${imageKey}.png`, 'deadbydaylight.wiki.gg') : '',
    imageKey ? wikiImage(`FulliconAddon ${imageKey}.png`) : '',
    apiImageKey ? wikiImage(`${apiImageKey}.png`, 'deadbydaylight.wiki.gg') : '',
    apiImageKey ? wikiImage(`${apiImageKey}.png`) : '',
    imageKey ? wikiImage(`iconAddon_${imageKey}.png`, 'deadbydaylight.wiki.gg') : '',
    imageKey ? wikiImage(`IconAddon_${imageKey}.png`, 'deadbydaylight.wiki.gg') : '',
    imageKey ? wikiImage(`FulliconAddon_${imageKey}.png`, 'deadbydaylight.wiki.gg') : '',
    imageKey ? wikiImage(`iconAddon_${imageKey}.png`) : '',
    imageKey ? wikiImage(`IconAddon_${imageKey}.png`) : '',
    imageKey ? wikiImage(`FulliconAddon_${imageKey}.png`) : '',
    wikiImage(`FulliconAddon ${lowerFirst}.png`, 'deadbydaylight.wiki.gg'),
    wikiImage(`FulliconAddon ${upperFirst}.png`, 'deadbydaylight.wiki.gg'),
    wikiImage(`FulliconAddon ${lowerFirst}.png`),
    wikiImage(`FulliconAddon ${upperFirst}.png`),
    addonIconFiles[addonName] ? wikiImage(addonIconFiles[addonName], 'deadbydaylight.wiki.gg') : '',
    wikiImage(`IconAddon ${lowerFirst}.png`, 'deadbydaylight.wiki.gg'),
    wikiImage(`IconAddon ${upperFirst}.png`, 'deadbydaylight.wiki.gg'),
    wikiImage(`IconAddon ${lowerFirst}.png`),
    wikiImage(`IconAddon ${upperFirst}.png`),
  ].filter(Boolean)))
}

const addonTranslations: Record<string, string> = {
  'Trapper Sack': 'Saco del Trampero',
  'Honing Stone': 'Piedra de afilar',
  'Bloody Coil': 'Bobina sangrienta',
  'Fastening Tools': 'Herramientas de fijacion',
  'All Seeing - Blood': 'Vista total - Sangre',
  'Coxcombed Clapper': 'Badajo aserrado',
  'Windstorm - Blood': 'Vendaval - Sangre',
  'Swift Hunt - Blood': 'Caza veloz - Sangre',
  'Doom Engravings': 'Grabados de perdicion',
  'LoPro Chains': 'Cadenas LoPro',
  'Spiked Boots': 'Botas con pinchos',
  'Steel Toe Boots': 'Botas con puntera de acero',
  'Low Kickback Chains': 'Cadenas de bajo retroceso',
  'Apex Muffler': 'Silenciador Apex',
  'Greased Throttle': 'Acelerador engrasado',
  'Heavy Clutch': 'Embrague pesado',
  'High-Speed Idler Screw': 'Tornillo tensor de alta velocidad',
  'Homemade Muffler': 'Silenciador casero',
  'Iridescent Brick': 'Ladrillo iridiscente',
  'Iridescent Engravings': 'Grabados iridiscentes',
  'Junkyard Air Filter': 'Filtro de aire de desguace',
  'Leafy Mash': 'Mezcla frondosa',
  'Off-Brand Motor Oil': 'Aceite de motor generico',
  'Primer Bulb': 'Pera de cebado',
  'Punctured Muffler': 'Silenciador perforado',
  'Ragged Engine': 'Motor deteriorado',
  'Shop Lubricant': 'Lubricante de taller',
  'Spark Plug': 'Bujia',
  'Speed Limiter': 'Limitador de velocidad',
  'All Seeing - Spirit': 'Vista total - Espiritu',
  'Blind Warrior - Blood': 'Guerrero ciego - Sangre',
  'Blind Warrior - Mud': 'Guerrero ciego - Barro',
  'Swift Hunt - Mud': 'Caza veloz - Barro',
  'Swift Hunt - White': 'Caza veloz - Blanco',
  'Windstorm - Mud': 'Vendaval - Barro',
  'Windstorm - White': 'Vendaval - Blanco',
  'Campbells Last Breath': 'Ultimo aliento de Campbell',
  'Fragile Wheeze': 'Sibilancia fragil',
  'Heavy Panting': 'Jadeo intenso',
  'Pocket Watch': 'Reloj de bolsillo',
  'Judiths Tombstone': 'Lapida de Judith',
  "Judith's Tombstone": 'Lapida de Judith',
  'Fragrant Tuft of Hair': 'Mechon de pelo fragante',
  'Scratched Mirror': 'Espejo rayado',
  'J. Myers Memorial': 'Memorial de J. Myers',
  'Tacky Earrings': 'Pendientes horteras',
  "Boyfriend's Memo": 'Nota del novio',
  'Blond Hair': 'Cabello rubio',
  'Reflective Fragment': 'Fragmento reflectante',
  'Memorial Flower': 'Flor conmemorativa',
  'Jewelry': 'Joyeria',
  'Hair Brush': 'Cepillo de pelo',
  'Glass Fragment': 'Fragmento de cristal',
  'Dead Rabbit': 'Conejo muerto',
  'Mirror Shard': 'Fragmento de espejo',
  "Judith's Journal": 'Diario de Judith',
  'Jewelry Box': 'Joyero',
  'Hair Bow': 'Lazo para el pelo',
  'Vanity Mirror': 'Espejo de tocador',
  'Tombstone Piece': 'Trozo de lapida',
  'Lock of Hair': 'Mechon de pelo',
  'Rusty Shackles': 'Grilletes oxidados',
  'Disfigured Ear': 'Oreja desfigurada',
  'Dried Cicada': 'Cigarra seca',
  'Swamp Orchid Necklet': 'Collar de orquidea del pantano',
  'Iridescent King': 'Rey iridiscente',
  'Discipline - Carters Notes': 'Disciplina - Notas de Carter',
  'Order - Carters Notes': 'Orden - Notas de Carter',
  'Calm - Carters Notes': 'Calma - Notas de Carter',
  'Iridescent Head': 'Cabeza iridiscente',
  'Infantry Belt': 'Cinturon de infanteria',
  'Glowing Concoction': 'Mezcla brillante',
  'Flower Babushka': 'Babushka floral',
  'Award-winning Chili': 'Chile premiado',
  'The Grease': 'La grasa',
  'Depth Gauge Rake': 'Rastrillo de profundidad',
  'Light Chassis': 'Chasis ligero',
  'Red Paint Brush': 'Brocha roja',
  'Black Box': 'Caja negra',
  'Jump Rope': 'Cuerda para saltar',
  'Green Dress': 'Vestido verde',
  'Amandas Letter': 'Carta de Amanda',
  'Tampered Timer': 'Temporizador manipulado',
  'Jigsaws Sketch': 'Boceto de Jigsaw',
  'Rusty Attachments': 'Accesorios oxidados',
  'Amandas Secret': 'Secreto de Amanda',
  'Annotated Plan': 'Plan anotado',
  'Bag of Gears': 'Bolsa de engranajes',
  'Combat Straps': 'Correas de combate',
  'Crate of Gears': 'Caja de engranajes',
  'Face Mask': 'Mascara facial',
  'Interlocking Razor': 'Cuchilla entrelazada',
  'Johns Medical File': 'Historial medico de John',
  'Last Will': 'Ultima voluntad',
  'Razor Wires': 'Alambres de cuchilla',
  'Rules Set No.2': 'Reglas n.º 2',
  'Shattered Syringe': 'Jeringuilla rota',
  'Slow-Release Toxin': 'Toxina de liberacion lenta',
  'Utility Blades': 'Cuchillas multiuso',
  'Video Tape': 'Cinta de video',
  'Workshop Grease': 'Grasa de taller',
  'Redheads Pinky Finger': 'Menique de pelirrojo',
  'Cheap Gin Bottle': 'Botella de ginebra barata',
  'Ether 15 Vol%': 'Eter 15 Vol%',
  'VHS Porn': 'VHS porno',
  'Mother-Daughter Ring': 'Anillo madre-hija',
  'Yakuyoke Amulet': 'Amuleto Yakuyoke',
  'Katsumori Talisman': 'Talisman Katsumori',
  'Kaiun Talisman': 'Talisman Kaiun',
  'Iridescent Button': 'Boton iridiscente',
  'Fuming Mix Tape': 'Cinta de mezcla furiosa',
  'Julies Mix Tape': 'Cinta de mezcla de Julie',
  'Mural Sketch': 'Boceto de mural',
  'Vile Emetic': 'Emetico vil',
  'Black Incense': 'Incienso negro',
  'Ashen Apple': 'Manzana cenicienta',
  'Blessed Apple': 'Manzana bendita',
  'Security Camera': 'Camara de seguridad',
  'Drivers License': 'Carnet de conducir',
  'Telephoto Lens': 'Teleobjetivo',
  'Olsens Wallet': 'Cartera de Olsen',
  'Leprose Lichen': 'Liquen leproso',
  'Lifeguard Whistle': 'Silbato de socorrista',
  'Rat Liver': 'Higado de rata',
  'Barbs Glasses': 'Gafas de Barb',
  'Renjiros Bloody Glove': 'Guante sangriento de Renjiro',
  'Akitos Crutch': 'Muleta de Akito',
  'Scalped Topknot': 'Moño arrancado',
  'Lion Fang': 'Colmillo de leon',
  'Iridescent Coin': 'Moneda iridiscente',
  'Hellshire Iron': 'Hierro de Hellshire',
  'Bayshores Gold Tooth': 'Diente de oro de Bayshore',
  'Warden’s Keys': 'Llaves del alcaide',
  'Wardenâ€™s Keys': 'Llaves del alcaide',
  'Crimson Ceremony Book': 'Libro de ceremonia carmesi',
  'Burning Man Painting': 'Cuadro del hombre ardiente',
  'Tablet of The Oppressor': 'Tablilla del opresor',
  'Scarlet Egg': 'Huevo escarlata',
  'Alchemist Ring': 'Anillo del alquimista',
  'Compound Thirty-Three': 'Compuesto treinta y tres',
  'Compound Twenty-One': 'Compuesto veintiuno',
  'Blighted Crow': 'Cuervo marchito',
  'Silencing Cloth': 'Tela silenciadora',
  'Victors Soldier': 'Soldado de Victor',
  'Toy Sword': 'Espada de juguete',
  'Tiny Fingernail': 'Una diminuta',
  'Iridescent Photocard': 'Fotocarnet iridiscente',
  'Death Throes Compilation': 'Compilacion de estertores',
  'Fizz-Spin Soda': 'Refresco Fizz-Spin',
  'Waiting For You Watch': 'Reloj Te estoy esperando',
  'Broken Recovery Coin': 'Moneda de recuperacion rota',
  'Marvins Blood': 'Sangre de Marvin',
  'Admin Wristband': 'Pulsera de administrador',
  'T-Virus Sample': 'Muestra del virus-T',
  'Engineers Fang': 'Colmillo del ingeniero',
  'Chatterers Tooth': 'Diente del Chatterer',
  'Liquified Gore': 'Sangre licuada',
  'Larrys Remains': 'Restos de Larry',
  'Iridescent Feather': 'Pluma iridiscente',
  'Severed Tongue': 'Lengua seccionada',
  'Thick Tar': 'Alquitran espeso',
  'Festering Carrion': 'Carrona supurante',
  'Videotape Copy': 'Copia de cinta de video',
  'Ring Drawing': 'Dibujo del anillo',
  'Reikos Watch': 'Reloj de Reiko',
  'Old Newspaper': 'Periodico viejo',
  'Field Recorder': 'Grabadora de campo',
  'Boat Key': 'Llave de barco',
  'Broken Doll': 'Muneca rota',
  'Malthinkers Skull': 'Calavera del pensador enfermo',
  'Leather Gloves': 'Guantes de cuero',
  'Unicorn Medallion': 'Medallon de unicornio',
  'Uroboros Virus': 'Virus uroboros',
  'Gold Chalice': 'Caliz dorado',
  'Map of The Realm': 'Mapa del reino',
  'Call To Arms': 'Llamada a las armas',
  'Dried Horsemeat': 'Carne de caballo seca',
  'Flint and Steel': 'Pedernal y acero',
  'Geographical Readout': 'Lectura geografica',
  'Loose Screw': 'Tornillo suelto',
  'Shotgun Speakers': 'Altavoces de escopeta',
  'Advanced Movement Prediction': 'Prediccion avanzada de movimiento',
  'Soma Family Photo': 'Foto de la familia Soma',
  'Crew Manifest': 'Manifiesto de tripulacion',
  'Nanomachine Gel': 'Gel de nanomaquinas',
  'Cryo Gel': 'Gel criogenico',
  'Emergency Helmet': 'Casco de emergencia',
  'Kanes Helmet': 'Casco de Kane',
  'Acidic Blood': 'Sangre acida',
  'Self-Destruct Bolt': 'Perno de autodestruccion',
  'Good Guy Box': 'Caja de Good Guy',
  'Yardstick': 'Regla',
  'Power Drill': 'Taladro',
  'Obscure Game Cartridge': 'Cartucho de juego oscuro',
  'Notebook of Theories': 'Cuaderno de teorias',
  'Vanishing Box': 'Caja evanescente',
  'Blurry Photo': 'Foto borrosa',
  'Book of Vile Darkness': 'Libro de oscuridad vil',
  'Iridescent Book of Vile Darkness': 'Libro iridiscente de oscuridad vil',
  'Pearl of Power': 'Perla de poder',
  'Bag of Holding': 'Bolsa de contencion',
  'Ring of Vlad': 'Anillo de Vlad',
  'Alucards Shield': 'Escudo de Alucard',
  'Sylph Feather': 'Pluma de silfide',
  'Moonstone Necklace': 'Collar de piedra lunar',
  'Spiked Collar': 'Collar con pinchos',
  'Training Whistle': 'Silbato de entrenamiento',
  'Knotted Rope': 'Cuerda anudada',
  'Dried Treats': 'Golosinas secas',
}

const addonRarities: Record<string, AddonRarity> = {
  'Trapper Sack': 'ultraRare',
  'Bloody Coil': 'ultraRare',
  'Honing Stone': 'veryRare',
  'Fastening Tools': 'rare',
  'All Seeing - Blood': 'veryRare',
  'Coxcombed Clapper': 'ultraRare',
  'Windstorm - Blood': 'veryRare',
  'Swift Hunt - Blood': 'rare',
  'Doom Engravings': 'veryRare',
  'LoPro Chains': 'ultraRare',
  'Campbells Last Breath': 'ultraRare',
  'Fragile Wheeze': 'rare',
  'Judiths Tombstone': 'ultraRare',
  'Fragrant Tuft of Hair': 'ultraRare',
  'Scratched Mirror': 'veryRare',
  'Rusty Shackles': 'veryRare',
  'Iridescent King': 'ultraRare',
  'Iridescent Head': 'ultraRare',
  'Black Incense': 'ultraRare',
  'Iridescent Button': 'ultraRare',
  'Security Camera': 'ultraRare',
  'Drivers License': 'veryRare',
  'Iridescent Coin': 'ultraRare',
  'Alchemist Ring': 'ultraRare',
  'Compound Thirty-Three': 'ultraRare',
  'Iridescent Feather': 'ultraRare',
  'Iridescent Photocard': 'ultraRare',
  'Iridescent Book of Vile Darkness': 'ultraRare',
}

const addonRarityStyles: Record<AddonRarity, { bg: string; ring: string; text: string }> = {
  common: { bg: 'bg-[#5c4a24]', ring: 'ring-[#a08338]/70', text: 'text-yellow-200' },
  uncommon: { bg: 'bg-[#625724]', ring: 'ring-[#d6c34b]/70', text: 'text-yellow-200' },
  rare: { bg: 'bg-[#174f36]', ring: 'ring-emerald-300/70', text: 'text-emerald-200' },
  veryRare: { bg: 'bg-[#503080]', ring: 'ring-violet/80', text: 'text-violet' },
  ultraRare: { bg: 'bg-[#7a2030]', ring: 'ring-rose-300/80', text: 'text-rose-200' },
}

function toAddonFileName(addonName: string, lowerFirst = true) {
  return addonName
    .replace(/[’']/g, '')
    .split(/\s+/)
    .map((part, index) => {
      const cleaned = part.replace(/[^a-zA-Z0-9-]/g, '')
      if (index === 0 && lowerFirst) return cleaned.charAt(0).toLowerCase() + cleaned.slice(1)
      return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    })
    .join('')
}

const dbdKillersData = [
  { id: 'trapper', name: 'El Trampero', code: 'K01', addons: [] },
  { id: 'wraith', name: 'El Espectro', code: 'K02', addons: [] },
  { id: 'hillbilly', name: 'El Pueblerino', code: 'K03', addons: [] },
  { id: 'nurse', name: 'La Enfermera', code: 'K04', addons: [] },
  { id: 'shape', name: 'La Forma', code: 'K05', addons: [] },
  { id: 'hag', name: 'La Bruja', code: 'K06', addons: [] },
  { id: 'doctor', name: 'El Doctor', code: 'K07', addons: [] },
  { id: 'huntress', name: 'La Cazadora', code: 'K08', addons: [] },
  { id: 'cannibal', name: 'El Can\u00edbal', code: 'K09', addons: [] },
  { id: 'nightmare', name: 'La Pesadilla', code: 'K10', addons: [] },
  { id: 'pig', name: 'La Cerda', code: 'K11', addons: [] },
  { id: 'clown', name: 'El Payaso', code: 'K12', addons: [] },
  { id: 'spirit', name: 'El Esp\u00edritu', code: 'K13', addons: [] },
  { id: 'legion', name: 'La Legi\u00f3n', code: 'K14', addons: [] },
  { id: 'plague', name: 'La Plaga', code: 'K15', addons: [] },
  { id: 'ghost-face', name: 'Ghost Face', code: 'K16', addons: [] },
  { id: 'demogorgon', name: 'El Demogorgon', code: 'K17', addons: [] },
  { id: 'oni', name: 'El Oni', code: 'K18', addons: [] },
  { id: 'deathslinger', name: 'El Arponero', code: 'K19', addons: [] },
  { id: 'executioner', name: 'El Verdugo', code: 'K20', addons: [] },
  { id: 'blight', name: 'El Deterioro', code: 'K21', addons: [] },
  { id: 'twins', name: 'Los Mellizos', code: 'K22', addons: [] },
  { id: 'trickster', name: 'El Traicionero', code: 'K23', addons: [] },
  { id: 'nemesis', name: 'N\u00e9mesis', code: 'K24', addons: [] },
  { id: 'cenobite', name: 'El Cenobita', code: 'K25', addons: [] },
  { id: 'artist', name: 'La Artista', code: 'K26', addons: [] },
  { id: 'onryo', name: 'La Onry\u014d', code: 'K27', addons: [] },
  { id: 'dredge', name: 'La Draga', code: 'K28', addons: [] },
  { id: 'mastermind', name: 'El Cerebro', code: 'K29', addons: [] },
  { id: 'knight', name: 'El Caballero', code: 'K30', addons: [] },
  { id: 'skull-merchant', name: 'La Comerciante de Calaveras', code: 'K31', addons: [] },
  { id: 'singularity', name: 'La Singularidad', code: 'K32', addons: [] },
  { id: 'xenomorph', name: 'El Xenomorfo', code: 'K33', addons: [] },
  { id: 'good-guy', name: 'Good Guy', code: 'K34', addons: [] },
  { id: 'unknown', name: 'Lo Desconocido', code: 'K35', addons: [] },
  { id: 'lich', name: 'El Liche', code: 'K36', addons: [] },
  { id: 'dark-lord', name: 'El Se\u00f1or Oscuro', code: 'K37', addons: [] },
  { id: 'houndmaster', name: 'La Adiestradora Canina', code: 'K38', addons: [] },
  { id: 'ghoul', name: 'El Ghoul', code: 'K39', addons: [] },
  { id: 'animatronic', name: 'El Animatr\u00f3nico', code: 'K40', addons: [] },
  { id: 'krasue', name: 'La Krasue', code: 'K41', addons: [] },
  { id: 'first', name: 'El Primero', code: 'K42', addons: [] },
].map((killer) => {
  const fullAddons = (dbdKillerAddonsData as Record<string, DbdAddon[]>)[killer.id]
  return {
    ...killer,
    addons: fullAddons ?? killer.addons.map((name) => ({ name, rarity: addonRarities[name], image: undefined })),
    imageUrl: wikiImage(`${killer.code}_charPreview_portrait.png`),
  }
})

const dbdSurvivorsData: DbdSurvivor[] = [
  { id: 'steve', name: 'Steve Harrington', code: 'S19', imageUrl: localSurvivorImage('steve-harrington.png') },
  { id: 'lara', name: 'Lara Croft', code: 'S43', imageUrl: localSurvivorImage('lara-croft.png') },
]

function getRandomSurvivor() {
  return dbdSurvivorsData[Math.floor(Math.random() * dbdSurvivorsData.length)] ?? dbdSurvivorsData[0]
}

const initialBuild: Build = {
  id: 'active',
  name: 'Trapper - Control Total',
  subtitle: 'Build de control de mapa y presion constante.',
  role: 'killer',
  killerId: 'trapper',
  perkIds: [
    'killer-intervencin-corrupta',
    'killer-que-sigan-esperando',
    'killer-callejn-sin-salida',
    'killer-gancho-torturador-dolor-resonante',
  ],
  notes: '',
  updatedAt: Date.now(),
}

const survivorPopularBuilds: Build[] = [
  {
    id: 'survivor-template-rescue',
    name: 'Rescate Seguro',
    subtitle: 'Superviviente - Anti tunel',
    role: 'survivor',
    perkIds: ['survivor-tiempo-prestado', 'survivor-sujtate', 'survivor-vamos-a-vivir-para-siempre', 'survivor-empata'],
    notes: '',
    updatedAt: Date.now() - 1000,
  },
  {
    id: 'survivor-template-generator',
    name: 'Generadores Rapidos',
    subtitle: 'Superviviente - Objetivos',
    role: 'survivor',
    perkIds: ['survivor-dj-vu', 'survivor-demasiado-entusiasta', 'survivor-pericia-tcnica', 'survivor-visionario'],
    notes: '',
    updatedAt: Date.now() - 2000,
  },
  {
    id: 'survivor-template-chase',
    name: 'Persecucion Segura',
    subtitle: 'Superviviente - Chase',
    role: 'survivor',
    perkIds: ['survivor-esprint', 'survivor-oportunidades', 'survivor-resiliencia', 'survivor-adrenalina'],
    notes: '',
    updatedAt: Date.now() - 3000,
  },
  {
    id: 'survivor-template-stealth',
    name: 'Sigilo Total',
    subtitle: 'Superviviente - Evitar persecucion',
    role: 'survivor',
    perkIds: ['survivor-distorsin', 'survivor-velocidad-silenciosa', 'survivor-premonicin', 'survivor-alerta'],
    notes: '',
    updatedAt: Date.now() - 4000,
  },
]

const killerBuildCores = [
  ['killer-intervencin-corrupta', 'killer-gancho-torturador-dolor-resonante', 'killer-callejn-sin-salida', 'killer-que-sigan-esperando'],
  ['killer-perseguidor-letal', 'killer-no-hay-dnde-esconderse', 'killer-soy-todo-odos', 'killer-oscuridad-revelada'],
  ['killer-maleficio-ruina', 'killer-maleficio-inmortal', 'killer-discordancia', 'killer-sobrecarga'],
  ['killer-abrazo-de-la-muerte', 'killer-interruptor-del-hombre-muerto', 'killer-gancho-torturador-dolor-resonante', 'killer-callejn-sin-salida'],
  ['killer-fuerza-brutal', 'killer-agitacin', 'killer-gancho-torturador-dolor-resonante', 'killer-lo-mejor-para-el-final'],
]

const killerPopularBuilds: Build[] = dbdKillersData.map((killer, index) => ({
  id: `killer-template-${killer.id}`,
  name: `${killer.name} - Build popular`,
  subtitle: `Asesino - ${killer.name}`,
  role: 'killer',
  killerId: killer.id,
  addons: killer.addons.slice(0, 2).map((addon) => addon.apiKey ?? addon.name),
  perkIds: killerBuildCores[index % killerBuildCores.length],
  notes: '',
  updatedAt: Date.now() - index * 1000,
}))

const allPerks = ((dbdPerksData.survivor as Perk[]) ?? [])
  .concat((dbdPerksData.killer as Perk[]) ?? [])
  .map((perk) => ({
    ...perk,
    localIcon: perk.localIcon.replace('./dbd/', '/dbd/'),
  }))

function normalizeBuild(build: Build, validIds: Set<string>): Build {
  const killerId = dbdKillersData.some((killer) => killer.id === build.killerId)
    ? build.killerId
    : dbdKillersData[0]?.id
  const survivorId = dbdSurvivorsData.some((survivor) => survivor.id === build.survivorId)
    ? build.survivorId
    : undefined

  return {
    ...build,
    perkIds: build.perkIds.filter((id) => validIds.has(id)).slice(0, MAX_PERKS),
    role: build.role === 'survivor' ? 'survivor' : 'killer',
    killerId,
    survivorId,
    addons: build.role === 'killer' ? normalizeAddonRefs(killerId, build.addons) : [],
    notes: build.notes ?? '',
    updatedAt: build.updatedAt || Date.now(),
  }
}

function loadWorkspace(validIds: Set<string>) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return normalizeBuild(initialBuild, validIds)
    return normalizeBuild(JSON.parse(raw) as Build, validIds)
  } catch {
    return normalizeBuild(initialBuild, validIds)
  }
}

function loadSavedBuilds(validIds: Set<string>) {
  try {
    const raw = localStorage.getItem(SAVED_BUILDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Build[]
    return parsed
      .filter((build) => build?.id && build?.name)
      .map((build) => normalizeBuild(build, validIds))
  } catch {
    return []
  }
}

function saveWorkspace(build: Build) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(build))
}

function saveBuilds(builds: Build[]) {
  localStorage.setItem(SAVED_BUILDS_KEY, JSON.stringify(builds))
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isProtectedBuild(build: Build) {
  return build.id.startsWith('preset-') || build.id.includes('-template-')
}

function getAddonLabel(addonName?: string) {
  if (!addonName) return 'Sin addon'
  const addon = findAddonByRef(addonName)
  if (addonTranslations[addonName]) return addonTranslations[addonName]
  if (addon?.label) return cleanAddonLabel(addon.label)
  if (addon?.name) return cleanAddonLabel(addon.name)
  return addonName
}

function cleanAddonLabel(label: string) {
  return label
    .replace(/^>\s*/, '')
    .split(/\s+(?:Un|Una|El|La|Los|Las|Esta|Este|Estos|Estas|Parte|Medio|Agua|Badajo|Uno|El símbolo|Una Carta)\b/)[0]
    .replace(/\s+/g, ' ')
    .trim()
}

function getAddonRarity(addonName?: string): AddonRarity | undefined {
  if (!addonName) return undefined
  const addon = findAddonByRef(addonName)
  if (addon?.rarity) return normalizeAddonRarity(addon.rarity)
  if (addonRarities[addonName]) return addonRarities[addonName]
  if (addonName.includes('Iridescent') || addonName.includes('Black')) return 'ultraRare'
  if (addonName.includes('Blood') || addonName.includes('Bloody') || addonName.includes('Red')) return 'veryRare'
  if (addonName.includes('Green')) return 'rare'
  return 'uncommon'
}

function normalizeAddonRarity(rarity?: string): AddonRarity | undefined {
  if (!rarity) return undefined
  const normalized = rarity.toLowerCase()
  if (normalized === 'veryrare') return 'veryRare'
  if (normalized === 'ultrarare' || normalized === 'visceral') return 'ultraRare'
  if (normalized === 'common' || normalized === 'uncommon' || normalized === 'rare') return normalized
  return undefined
}

function getAddonData(killer: (typeof dbdKillersData)[number], addonName?: string) {
  if (!addonName) return undefined
  return killer.addons.find((addon) => isAddonRef(addon, addonName))
}

function findAddonByRef(addonName?: string) {
  if (!addonName) return undefined
  return dbdKillersData.flatMap((killer) => killer.addons).find((addon) => isAddonRef(addon, addonName))
}

function isAddonRef(addon: DbdAddon, addonName: string) {
  return addon.apiKey === addonName || addon.name === addonName || addon.label === addonName || addon.apiName === addonName
}

function normalizeAddonRefs(killerId?: string, addons?: string[]) {
  const killer = dbdKillersData.find((item) => item.id === killerId)
  if (!killer) return []
  return (addons ?? [])
    .slice(0, 2)
    .map((addonName) => {
      const addon = killer.addons.find((item) => isAddonRef(item, addonName))
      return addon?.apiKey ?? addonName
    })
}

function getBuildNameForKiller(killerName: string, currentName: string) {
  const suffix = currentName.includes(' - ') && currentName !== 'Survi - Generico' ? currentName.slice(currentName.indexOf(' - ')) : ' - Build popular'
  return `${killerName}${suffix}`
}

function copyTextWithTextarea(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  if (!copied) throw new Error('Clipboard fallback failed')
}

async function copyShareText(text: string) {
  const desktop = window.tigerbyteDesktop

  if (desktop?.copyText) {
    const copied = await desktop.copyText(text)
    const readBack = desktop.readText ? await desktop.readText() : text
    if (copied && readBack === text) return
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    if (!navigator.clipboard.readText) return
    const readBack = await navigator.clipboard.readText()
    if (readBack === text) return
  }

  copyTextWithTextarea(text)
  const readBack = desktop?.readText ? await desktop.readText() : undefined
  if (readBack !== undefined && readBack !== text) throw new Error('Clipboard verification failed')
}

function getFormattedDescription(perk: Perk) {
  const text = resolvePerkTokens(cleanPerkText(perk.description), perk)
    .replace(/\s+/g, ' ')
    .replace(/\s*:\s*•/g, ': •')
    .trim()

  const [intro, ...bullets] = text.split(/\s*•\s*/).filter(Boolean)

  return {
    intro: intro.trim(),
    bullets: bullets.map((bullet) => bullet.replace(/\s+/g, ' ').trim()).filter(Boolean),
  }
}

function resolvePerkTokens(description: string, perk: Perk) {
  return description.replace(/\{([^}]+)\}/g, (_, token: string) => {
    if (token.startsWith('Tunable.')) return resolveTunableToken(token, perk)
    if (token.startsWith('Keyword.')) return resolveKeywordToken(token)
    if (token.startsWith('Input.')) return resolveInputToken(token)
    return token
  })
}

function resolveTunableToken(token: string, perk: Perk) {
  const key = token.split('.').pop()?.toLowerCase()
  const values = key ? perk.tunables?.[key] : undefined
  if (!values || values.length === 0) return token
  return String(values[values.length - 1]).replace('.', ',')
}

function resolveKeywordToken(token: string) {
  const key = token.split('.').pop() ?? token
  const labels: Record<string, string> = {
    Blindness: 'Ceguera',
    Broken: 'Roto',
    Elusive: 'Escurridizo',
    Endurance: 'Entereza',
    Exhausted: 'Agotamiento',
    Exposed: 'Expuesto',
    Haste: 'Celeridad',
    Hemorrhage: 'Hemorragia',
    Hindered: 'Obstaculización',
    Mangled: 'Mutilación',
    Oblivious: 'Inconsciencia',
    Undetectable: 'Indetectable',
    undetectable: 'Indetectable',
  }
  return labels[key] ?? key
}

function resolveInputToken(token: string) {
  const key = token.split('.').pop() ?? token
  const labels: Record<string, string> = {
    ActivatableButton1: 'el botón de habilidad activa 1',
    ActivatableButton2: 'el botón de habilidad activa 2',
  }
  return labels[key] ?? key
}

function cleanPerkText(value: string) {
  const replacements: Array<[string, string]> = [
    ['Ã¡', 'á'],
    ['Ã©', 'é'],
    ['Ã­', 'í'],
    ['Ã³', 'ó'],
    ['Ãº', 'ú'],
    ['ÃÁ', 'Á'],
    ['Ã‰', 'É'],
    ['Ãš', 'Ú'],
    ['Ã±', 'ñ'],
    ['Ã‘', 'Ñ'],
    ['Â¿', '¿'],
    ['Â¡', '¡'],
    ['Âº', 'º'],
    ['Âª', 'ª'],
    ['Â %', ' %'],
    ['Â ', ' '],
    ['â€¢', '•'],
    ['â€”', '-'],
    ['sigiuente', 'siguiente'],
  ]

  return replacements.reduce((text, [from, to]) => text.replaceAll(from, to), value)
}

function normalizeSearchValue(value: string) {
  return cleanPerkText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function BuildCreatorPage() {
  const perkById = useMemo(() => new Map(allPerks.map((perk) => [perk.id, perk])), [])
  const validIds = useMemo(() => new Set(allPerks.map((perk) => perk.id)), [])
  const [activeBuild, setActiveBuild] = useState<Build>(() => loadWorkspace(validIds))
  const [savedBuilds, setSavedBuilds] = useState<Build[]>(() => loadSavedBuilds(validIds))
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<PerkRole>(() => activeBuild.role)
  const [selectedPerkId, setSelectedPerkId] = useState(activeBuild.perkIds[1] ?? activeBuild.perkIds[0] ?? allPerks[0]?.id)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showAllBuilds, setShowAllBuilds] = useState(false)
  const [showBuildTransfer, setShowBuildTransfer] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Build | null>(null)
  const [bannerSurvivor, setBannerSurvivor] = useState<DbdSurvivor>(() => getRandomSurvivor())
  const [toast, setToast] = useState('')

  const selectedIds = new Set(activeBuild.perkIds)
  const selectedPerks = activeBuild.perkIds.map((id) => perkById.get(id)).filter(Boolean) as Perk[]
  const selectedPerk = perkById.get(selectedPerkId) ?? selectedPerks[0] ?? allPerks[0]
  const selectedKiller = dbdKillersData.find((killer) => killer.id === activeBuild.killerId) ?? dbdKillersData[0]
  const bannerImage = activeBuild.role === 'killer' ? selectedKiller.imageUrl : bannerSurvivor.imageUrl
  const buildsForMode = savedBuilds.filter((build) => build.role === roleFilter)
  const popularBuildsForMode = roleFilter === 'killer' ? killerPopularBuilds : survivorPopularBuilds
  const survivorNamesByOwner = useMemo(() => {
    const index = new Map<string, string[]>()
    dbdSurvivorsData.forEach((survivor) => {
      const ownerKey = normalizeSearchValue(survivor.name.split(' ')[0] ?? survivor.name)
      const values = index.get(ownerKey) ?? []
      values.push(survivor.name)
      index.set(ownerKey, values)
    })
    return index
  }, [])
  const killerNamesByOwner = useMemo(() => {
    const index = new Map<string, string[]>()
    dbdKillersData.forEach((killer) => {
      const ownerBase = killer.name.replace(/^(el|la|los|las|lo)\s+/i, '').trim()
      const ownerKey = normalizeSearchValue(ownerBase)
      const values = index.get(ownerKey) ?? []
      values.push(killer.name)
      index.set(ownerKey, values)
    })
    return index
  }, [])

  const visiblePerks = useMemo(() => {
    const query = normalizeSearchValue(search.trim())
    return allPerks.filter((perk) => {
      const matchesRole = perk.role === roleFilter
      const ownerKey = normalizeSearchValue(perk.owner)
      const characterNames = perk.role === 'killer'
        ? (killerNamesByOwner.get(ownerKey) ?? [])
        : (survivorNamesByOwner.get(ownerKey) ?? [])
      const searchableText = [
        perk.name,
        perk.owner,
        perk.description,
        ...(perk.searchAliases ?? []),
        ...characterNames,
      ].map(normalizeSearchValue).join(' ')
      const matchesSearch = query.length === 0 || searchableText.includes(query)
      return matchesRole && matchesSearch
    })
  }, [killerNamesByOwner, roleFilter, search, survivorNamesByOwner])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 1800)
  }

  function updateBuild(next: Build) {
    setActiveBuild(next)
    saveWorkspace(next)
  }

  function getEmptyBuild(role = roleFilter): Build {
    return {
      id: 'active',
      name: 'Nueva build',
      subtitle: 'Build personalizada sin guardar.',
      role,
      killerId: role === 'killer' ? selectedKiller.id : undefined,
      addons: role === 'killer' ? [] : [],
      perkIds: [],
      notes: '',
      updatedAt: Date.now(),
    }
  }

  function changeRoleMode(role: PerkRole) {
    setRoleFilter(role)
    if (role === 'survivor') setBannerSurvivor(getRandomSurvivor())
    const firstPerk = allPerks.find((perk) => perk.role === role)
    setSelectedPerkId(firstPerk?.id ?? allPerks[0]?.id)
    updateBuild({
      ...activeBuild,
      name: role === 'killer' ? getBuildNameForKiller(selectedKiller.name, activeBuild.name) : 'Survi - Generico',
      role,
      subtitle: role === 'killer' ? `Asesino - ${selectedKiller.name}` : 'Superviviente - Generico',
      perkIds: activeBuild.perkIds.filter((id) => perkById.get(id)?.role === role),
      addons: role === 'killer' ? [] : [],
      updatedAt: Date.now(),
    })
  }

  function changeKiller(killerId: string) {
    const killer = dbdKillersData.find((item) => item.id === killerId) ?? dbdKillersData[0]
    updateBuild({
      ...activeBuild,
      name: getBuildNameForKiller(killer.name, activeBuild.name),
      role: 'killer',
      killerId: killer.id,
      addons: activeBuild.killerId === killer.id ? activeBuild.addons : [],
      subtitle: `Asesino - ${killer.name}`,
      updatedAt: Date.now(),
    })
    setRoleFilter('killer')
  }

  function changeAddon(index: number, value: string) {
    const addons = [...(activeBuild.addons ?? [])]
    if (value && addons.some((addon, addonIndex) => addonIndex !== index && addon === value)) {
      showToast('Ese addon ya esta seleccionado')
      return
    }
    addons[index] = value
    updateBuild({
      ...activeBuild,
      role: 'killer',
      addons: Array.from(new Set(addons.filter(Boolean))).slice(0, 2),
      updatedAt: Date.now(),
    })
  }

  function addPerk(perk: Perk) {
    setSelectedPerkId(perk.id)
    if (selectedIds.has(perk.id)) return
    if (activeBuild.perkIds.length >= MAX_PERKS) {
      showToast('La build ya tiene 4 habilidades')
      return
    }
    updateBuild({
      ...activeBuild,
      role: perk.role,
      name: perk.role === 'killer' ? getBuildNameForKiller(selectedKiller.name, activeBuild.name) : 'Survi - Generico',
      subtitle: perk.role === 'killer' ? `Asesino - ${selectedKiller.name}` : activeBuild.subtitle,
      perkIds: [...activeBuild.perkIds, perk.id],
      updatedAt: Date.now(),
    })
    setRoleFilter(perk.role)
  }

  function removePerk(perkId: string) {
    const nextIds = activeBuild.perkIds.filter((id) => id !== perkId)
    updateBuild({ ...activeBuild, perkIds: nextIds, updatedAt: Date.now() })
    if (selectedPerkId === perkId) setSelectedPerkId(nextIds[0] ?? allPerks[0]?.id)
  }

  function placePerk(perkId: string, targetIndex: number) {
    const perk = perkById.get(perkId)
    if (!perk) return

    setSelectedPerkId(perkId)
    setActiveBuild((current) => {
      const currentIds = current.perkIds.slice(0, MAX_PERKS)
      const sourceIndex = currentIds.indexOf(perkId)
      const nextIds = [...currentIds]

      if (sourceIndex >= 0) {
        const targetPerkId = nextIds[targetIndex]
        nextIds[targetIndex] = perkId
        if (targetPerkId && sourceIndex !== targetIndex) nextIds[sourceIndex] = targetPerkId
        if (!targetPerkId && sourceIndex !== targetIndex) nextIds.splice(sourceIndex, 1)
      } else if (nextIds[targetIndex]) {
        nextIds[targetIndex] = perkId
      } else if (nextIds.length < MAX_PERKS) {
        nextIds[targetIndex] = perkId
      } else {
        showToast('La build ya tiene 4 habilidades')
        return current
      }

      const compactIds = Array.from({ length: MAX_PERKS })
        .map((_, index) => nextIds[index])
        .filter(Boolean) as string[]
      const next = {
        ...current,
        role: perk.role,
        name: perk.role === 'killer' ? getBuildNameForKiller(selectedKiller.name, current.name) : 'Survi - Generico',
        subtitle: perk.role === 'killer' ? `Asesino - ${selectedKiller.name}` : current.subtitle,
        perkIds: compactIds,
        updatedAt: Date.now(),
      }
      saveWorkspace(next)
      return next
    })
  }

  function clearBuild() {
    updateBuild(getEmptyBuild())
    showToast('Build limpia')
  }

  function saveCurrentBuild() {
    const nextBuild = {
      ...activeBuild,
      id: activeBuild.id === 'active' || isProtectedBuild(activeBuild) ? createId() : activeBuild.id,
      updatedAt: Date.now(),
    }
    const nextBuilds = [nextBuild, ...savedBuilds.filter((build) => build.id !== nextBuild.id)]
    setSavedBuilds(nextBuilds)
    saveBuilds(nextBuilds)
    updateBuild(nextBuild)
    showToast('Build guardada')
  }

  function duplicateCurrentBuild() {
    const nextBuild = {
      ...activeBuild,
      id: createId(),
      name: `${activeBuild.name} copia`,
      updatedAt: Date.now(),
    }
    const nextBuilds = [nextBuild, ...savedBuilds]
    setSavedBuilds(nextBuilds)
    saveBuilds(nextBuilds)
    updateBuild(nextBuild)
    showToast('Build duplicada')
  }

  function getShareText(build: Build) {
    const perks = build.perkIds
      .map((id, index) => {
        const perk = perkById.get(id)
        return perk ? `${index + 1}. ${perk.name} - ${perk.owner}` : ''
      })
      .filter(Boolean)
      .join('\n')
    const addons = build.role === 'killer'
      ? (build.addons ?? []).filter(Boolean).map(getAddonLabel)
      : []
    const notes = build.notes.trim()

    return [
      `TigerByte - ${build.name}`,
      `Tipo: ${roleLabels[build.role]}`,
      build.role === 'killer' ? `Asesino: ${selectedKiller.name}` : build.subtitle,
      build.role === 'killer' ? `Add-ons: ${addons.length > 0 ? addons.join(' + ') : 'Sin add-ons'}` : '',
      '',
      'Habilidades:',
      perks || 'Sin habilidades equipadas',
      notes ? '' : '',
      notes ? `Notas: ${notes}` : '',
    ].filter(Boolean).join('\n')
  }

  async function shareCurrentBuild() {
    const text = getShareText(activeBuild)
    try {
      if (navigator.share && !window.tigerbyteDesktop?.isDesktop) {
        await navigator.share({ title: activeBuild.name, text })
        showToast('Build compartida')
        return
      }

      await copyShareText(text)
      showToast('Build copiada al portapapeles')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      showToast('No se pudo compartir la build')
    }
  }

  function requestDeleteCurrentBuild() {
    const isSavedBuild = savedBuilds.some((build) => build.id === activeBuild.id)
    if (isProtectedBuild(activeBuild) && !isSavedBuild) {
      showToast('Las builds populares no se pueden borrar')
      return
    }
    setDeleteTarget(activeBuild)
  }

  function confirmDeleteBuild() {
    if (!deleteTarget) return
    const isSavedBuild = savedBuilds.some((build) => build.id === deleteTarget.id)
    if (isProtectedBuild(deleteTarget) && !isSavedBuild) {
      setDeleteTarget(null)
      showToast('Las builds populares no se pueden borrar')
      return
    }

    const nextBuilds = savedBuilds.filter((build) => build.id !== deleteTarget.id)
    setSavedBuilds(nextBuilds)
    saveBuilds(nextBuilds)
    updateBuild(getEmptyBuild(deleteTarget.role))
    setSelectedPerkId(allPerks.find((perk) => perk.role === deleteTarget.role)?.id ?? allPerks[0]?.id)
    setDeleteTarget(null)
    showToast(savedBuilds.some((build) => build.id === deleteTarget.id) ? 'Build borrada' : 'Build descartada')
  }

  function loadBuild(build: Build) {
    const next = normalizeBuild({ ...build, id: build.id }, validIds)
    updateBuild(next)
    setRoleFilter(next.role)
    setSelectedPerkId(next.perkIds[0] ?? allPerks[0]?.id)
    showToast('Build cargada')
  }

  function getBuildExportText() {
    const buildsById = new Map<string, Build>()
    savedBuilds.forEach((build) => buildsById.set(build.id, build))
    if (activeBuild.perkIds.length > 0 && !isProtectedBuild(activeBuild)) {
      buildsById.set(activeBuild.id, activeBuild)
    }

    return JSON.stringify({
      app: 'TigerByte',
      type: 'dbd-builds',
      version: 1,
      exportedAt: new Date().toISOString(),
      activeBuildId: activeBuild.id,
      builds: Array.from(buildsById.values()),
    }, null, 2)
  }

  function importBuildsFromJson(jsonText: string) {
    const parsed = JSON.parse(jsonText) as unknown
    const source = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { builds?: unknown })?.builds)
        ? (parsed as { builds: unknown[] }).builds
        : (parsed as { build?: unknown })?.build
          ? [(parsed as { build: unknown }).build]
          : [parsed]

    const importedBuilds = source
      .filter((build): build is Build => Boolean(build && typeof build === 'object' && (build as Build).name))
      .map((build) => normalizeBuild({
        ...build,
        id: build.id && !isProtectedBuild(build) ? build.id : createId(),
      }, validIds))
      .filter((build) => build.perkIds.length > 0)

    if (importedBuilds.length === 0) {
      showToast('No se encontraron builds validas')
      return 0
    }

    const importedIds = new Set(importedBuilds.map((build) => build.id))
    const nextBuilds = [...importedBuilds, ...savedBuilds.filter((build) => !importedIds.has(build.id))]
    setSavedBuilds(nextBuilds)
    saveBuilds(nextBuilds)
    loadBuild(importedBuilds[0])
    showToast(`${importedBuilds.length} build${importedBuilds.length === 1 ? '' : 's'} importada${importedBuilds.length === 1 ? '' : 's'}`)
    return importedBuilds.length
  }

  return (
    <div class="relative flex min-h-screen flex-col overflow-x-hidden [@media(min-width:1280px)_and_(min-height:900px)]:h-screen [@media(min-width:1280px)_and_(min-height:900px)]:overflow-hidden">
      <HUDBackground />
      <Navbar />

      <main class="mx-auto grid min-h-0 flex-1 w-[min(98%,1800px)] gap-4 pt-3 text-left md:grid-cols-[230px_minmax(0,1fr)] [@media(min-width:1280px)_and_(min-height:900px)]:overflow-hidden xl:grid-cols-[250px_minmax(0,1fr)] 2xl:grid-cols-[280px_minmax(0,1fr)_330px]">
        <aside class="flex min-h-0 flex-col gap-4 overflow-hidden">
          <Panel title="Mis builds" className="flex min-h-0 flex-1 flex-col" action={<IconButton label="Nueva build" onClick={clearBuild}><Plus size={16} /></IconButton>}>
            <div class="mb-3 flex gap-2">
              {roleTabs.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => changeRoleMode(role)}
                  class={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                    roleFilter === role ? 'bg-violet text-white' : 'bg-[#0b1328] text-muted hover:text-text'
                  }`}
                >
                  {roleLabels[role]}
                </button>
              ))}
            </div>

            <div class="tiger-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {buildsForMode.length > 0 ? buildsForMode.map((build) => (
                <BuildCard
                  key={build.id}
                  build={build}
                  perks={build.perkIds.map((id) => perkById.get(id)).filter(Boolean) as Perk[]}
                  active={activeBuild.id === build.id || activeBuild.name === build.name}
                  onLoad={() => loadBuild(build)}
                  onDelete={() => setDeleteTarget(build)}
                />
              )) : (
                <p class="rounded-lg bg-[#081226] px-3 py-4 text-xs leading-5 text-muted">
                  Todavia no tienes builds guardadas.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowAllBuilds(true)}
              class="mt-3 inline-flex w-full items-center justify-between rounded-lg bg-[#0b142a] px-4 py-3 text-xs font-semibold text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#101d38]"
            >
              Ver todas mis builds
              <ChevronRight size={15} />
            </button>
          </Panel>

          <PopularBuildsPanel
            builds={popularBuildsForMode.slice(0, 5)}
            onLoad={loadBuild}
            onExplore={() => setShowTemplates(true)}
            mode={roleFilter}
          />
        </aside>

        <section class="flex min-h-0 min-w-0 flex-col gap-4 [@media(min-width:1280px)_and_(min-height:900px)]:overflow-hidden">
          <article class="relative shrink-0 overflow-hidden rounded-xl bg-[#050d20] shadow-[inset_0_0_0_1px_rgba(91,130,190,0.14),0_24px_70px_rgba(0,0,0,0.38)]">
            <div
              class="absolute inset-0 bg-cover bg-[78%_20%]"
              style={{ backgroundImage: `linear-gradient(90deg, rgba(4,8,18,0.98) 0%, rgba(4,8,18,0.86) 48%, rgba(4,8,18,0.35) 100%), url("${bannerImage}")` }}
            />
            <div class="relative p-5 [@media(max-height:1080px)]:p-4">
              <p class="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-violet">Crear / editar build</p>
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="min-w-0">
                  {isEditingTitle ? (
                    <input
                      value={activeBuild.name}
                      autoFocus
                      onInput={(event) => updateBuild({ ...activeBuild, name: event.currentTarget.value, updatedAt: Date.now() })}
                      onBlur={() => setIsEditingTitle(false)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') setIsEditingTitle(false)
                      }}
                      class="field-control w-[min(80vw,560px)] rounded-lg px-3 py-2 text-2xl font-bold xl:text-3xl"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(true)}
                      class="inline-flex max-w-full items-center gap-2 text-left"
                    >
                      <h1 class="truncate text-2xl font-bold text-violet xl:text-3xl">{activeBuild.name}</h1>
                      <Edit3 size={17} class="shrink-0 text-muted" />
                    </button>
                  )}
                  <input
                    value={activeBuild.subtitle}
                    onInput={(event) => updateBuild({ ...activeBuild, subtitle: event.currentTarget.value, updatedAt: Date.now() })}
                    class="mt-1 w-full max-w-xl border-0 bg-transparent p-0 text-sm text-muted outline-none"
                  />
                  <div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted xl:mt-5">
                    <span class="inline-flex h-9 items-center rounded-lg bg-[#081226] px-3 text-sm">
                      {roleLabels[activeBuild.role]}
                    </span>
                    {activeBuild.role === 'killer' ? (
                      <select
                        value={selectedKiller.id}
                        onChange={(event) => changeKiller(event.currentTarget.value)}
                        class="h-9 min-w-[190px] rounded-lg border-0 bg-[#081226] px-3 text-sm text-text outline-none shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition focus:shadow-[inset_0_0_0_1px_rgba(56,189,248,0.58),0_0_0_2px_rgba(56,189,248,0.14)]"
                        aria-label="Seleccionar asesino"
                      >
                        {dbdKillersData.map((killer) => (
                          <option key={killer.id} value={killer.id}>
                            {killer.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span class="inline-flex h-9 items-center rounded-lg bg-[#081226] px-3 text-sm">
                        Build de superviviente
                      </span>
                    )}
                  </div>
                </div>

                <div class="mt-4 flex flex-wrap items-center gap-2 xl:mt-[74px]">
                  <IconButton label="Borrar build" onClick={requestDeleteCurrentBuild}><Trash2 size={15} /></IconButton>
                  <button
                    type="button"
                    onClick={() => showToast('Cambios cancelados')}
                    class="rounded-lg bg-[#0b142a] px-4 py-2 text-xs font-semibold text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.10)] transition hover:bg-[#111e39]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={saveCurrentBuild}
                    class="inline-flex items-center gap-2 rounded-lg bg-violet px-4 py-2 text-xs font-bold text-white transition hover:brightness-110"
                  >
                    <Save size={14} />
                    Guardar build
                  </button>
                </div>
              </div>
            </div>
          </article>

          <BuildLoadoutPanel
            selectedPerks={selectedPerks}
            selectedKiller={selectedKiller}
            activeBuild={activeBuild}
            onDropPerk={placePerk}
            onRemovePerk={removePerk}
            onOpenPerk={(perkId) => setSelectedPerkId(perkId)}
            onAddonChange={changeAddon}
            onEmptyClick={() => showToast('Elige una habilidad del grid')}
          />

          <div class="grid min-h-0 flex-1 gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <PerkCatalogPanel
              visiblePerks={visiblePerks}
              selectedIds={selectedIds}
              selectedPerkId={selectedPerk?.id}
              roleFilter={roleFilter}
              search={search}
              onSearch={setSearch}
              onOpen={(perkId) => setSelectedPerkId(perkId)}
              onAdd={addPerk}
            />
            <div class="hidden min-h-0 2xl:block">
              <PerkDetail perk={selectedPerk} selected={selectedIds.has(selectedPerk.id)} onAdd={() => addPerk(selectedPerk)} />
            </div>
          </div>

          <div class="grid shrink-0 gap-4 md:grid-cols-3 2xl:hidden">
            <BuildInfoPanel activeBuild={activeBuild} selectedKiller={selectedKiller} />
            <QuickActionsPanel
              onTransfer={() => setShowBuildTransfer(true)}
              onDuplicate={duplicateCurrentBuild}
              onShare={shareCurrentBuild}
              onDelete={requestDeleteCurrentBuild}
            />
            <NotesPanel
              value={activeBuild.notes}
              onChange={(notes) => updateBuild({ ...activeBuild, notes, updatedAt: Date.now() })}
            />
          </div>

        </section>

        <aside class="hidden min-h-0 flex-col gap-4 overflow-hidden 2xl:flex">
          <BuildInfoPanel activeBuild={activeBuild} selectedKiller={selectedKiller} />
          <QuickActionsPanel
            onTransfer={() => setShowBuildTransfer(true)}
            onDuplicate={duplicateCurrentBuild}
            onShare={shareCurrentBuild}
            onDelete={requestDeleteCurrentBuild}
          />
          <NotesPanel
            value={activeBuild.notes}
            onChange={(notes) => updateBuild({ ...activeBuild, notes, updatedAt: Date.now() })}
          />
        </aside>

      </main>

      {toast ? (
        <div class="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-[#050d20]/95 px-4 py-3 text-sm text-violet shadow-[inset_0_0_0_1px_rgba(142,107,255,0.20),0_16px_40px_rgba(0,0,0,0.45)]">
          {toast}
        </div>
      ) : null}
      {showGuide ? <GuideModal onClose={() => setShowGuide(false)} /> : null}
      {showTemplates ? (
        <TemplatesModal
          builds={popularBuildsForMode}
          onLoad={(build) => {
            loadBuild(build)
            setShowTemplates(false)
          }}
          onClose={() => setShowTemplates(false)}
        />
      ) : null}
      {showAllBuilds ? (
        <SavedBuildsModal
          builds={savedBuilds}
          onLoad={(build) => {
            loadBuild(build)
            setShowAllBuilds(false)
          }}
          onClose={() => setShowAllBuilds(false)}
        />
      ) : null}
      {showBuildTransfer ? (
        <BuildTransferModal
          exportText={getBuildExportText()}
          onImport={importBuildsFromJson}
          onClose={() => setShowBuildTransfer(false)}
        />
      ) : null}
      {deleteTarget ? (
        <DeleteBuildModal
          build={deleteTarget}
          saved={savedBuilds.some((build) => build.id === deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDeleteBuild}
        />
      ) : null}

      <Footer className="mt-3 shrink-0" />
    </div>
  )
}

function Panel({
  title,
  action,
  children,
  className = '',
}: {
  title: string
  action?: preact.ComponentChildren
  children: preact.ComponentChildren
  className?: string
}) {
  return (
    <article class={`rounded-xl bg-[#050d20] p-4 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.14),0_18px_50px_rgba(0,0,0,0.30)] ${className}`}>
      <div class="mb-4 flex min-h-9 items-center justify-between gap-3">
        <h2 class="text-xs font-bold uppercase tracking-[0.08em] text-violet">{title}</h2>
        {action}
      </div>
      {children}
    </article>
  )
}

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: preact.ComponentChildren }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b142a] text-muted shadow-[inset_0_0_0_1px_rgba(148,163,184,0.09)] transition hover:bg-[#111e39] hover:text-text"
    >
      {children}
    </button>
  )
}

function PerkDiamond({ perk, size = 'md' }: { perk?: Perk; size?: 'xs' | 'sm' | 'md' | 'lg' | 'responsive' }) {
  const sizes = {
    xs: 'h-7 w-7',
    sm: 'h-10 w-10',
    md: 'h-14 w-14',
    lg: 'h-20 w-20',
    responsive: 'h-7 w-7 2xl:h-14 2xl:w-14',
  }

  return (
    <span class={`mx-auto grid shrink-0 place-items-center ${sizes[size]}`}>
      <span class="grid h-[72%] w-[72%] rotate-45 place-items-center overflow-hidden bg-violet/20 ring-1 ring-violet/70 shadow-[0_0_18px_rgba(142,107,255,0.34)]">
        {perk ? (
          <img src={perk.localIcon} alt={perk.name} class="h-[142%] w-[142%] -rotate-45 object-contain" />
        ) : (
          <span class="-rotate-45 text-xs text-muted">+</span>
        )}
      </span>
    </span>
  )
}

function BuildCard({
  build,
  perks,
  active,
  onLoad,
  onDelete,
}: {
  build: Build
  perks: Perk[]
  active: boolean
  onLoad: () => void
  onDelete: () => void
}) {
  const survivor = build.survivorId ? dbdSurvivorsData.find((item) => item.id === build.survivorId) : undefined

  return (
    <div class={`rounded-lg p-2 transition ${active ? 'bg-violet/28 shadow-[inset_0_0_0_1px_rgba(142,107,255,0.38)]' : 'bg-[#081226] hover:bg-[#101b34]'}`}>
      <div class="grid w-full grid-cols-[46px_minmax(0,1fr)_32px] items-center gap-3">
      <button type="button" onClick={onLoad} class="contents text-left">
        {survivor ? <SurvivorPortrait survivor={survivor} className="h-10 w-10" /> : <PerkDiamond perk={perks[0]} size="sm" />}
        <span class="min-w-0">
          <span class="block truncate text-sm font-semibold text-text">{build.name}</span>
          <span class="block truncate text-xs text-muted">{build.subtitle}</span>
        </span>
      </button>
        <button
          type="button"
          onClick={onDelete}
          class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-red-500/18 hover:text-red-200"
          aria-label={`Borrar ${build.name}`}
          title="Borrar build"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function PerkTile({
  perk,
  selected,
  active,
  onOpen,
  onAdd,
  compact = false,
}: {
  perk: Perk
  selected: boolean
  active: boolean
  onOpen: () => void
  onAdd: () => void
  compact?: boolean
}) {
  return (
    <div
      class={`relative rounded-lg bg-[#081226] px-1.5 text-center transition ${compact ? 'pb-1 pt-1 2xl:pb-2 2xl:pt-1.5' : 'pb-2 pt-1.5'} ${
        active
          ? 'shadow-[inset_0_0_0_1px_rgba(142,107,255,0.85),0_0_18px_rgba(142,107,255,0.12)]'
          : 'shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)] hover:bg-[#0d1830]'
      }`}
    >
      <button
        type="button"
        draggable
        onClick={onOpen}
        onDblClick={onAdd}
        onDragStart={(event) => event.dataTransfer?.setData('text/plain', perk.id)}
        class="block w-full"
        title="Clic para ver datos, doble clic para anadir"
      >
        <PerkDiamond perk={perk} size={compact ? 'responsive' : 'md'} />
        <span class={`${compact ? 'mt-0.5 min-h-[20px] text-[9px] 2xl:mt-1 2xl:min-h-[28px] 2xl:text-[11px]' : 'mt-1 min-h-[28px] text-[11px]'} block overflow-hidden px-1 font-semibold leading-3 text-text [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]`}>
          {perk.name}
        </span>
        <span class={`mt-0.5 block overflow-hidden px-1 text-[9px] leading-3 2xl:text-[10px] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1] ${compact ? 'min-h-[12px] 2xl:min-h-[24px] 2xl:[-webkit-line-clamp:2]' : 'min-h-[24px]'} ${perk.role === 'killer' ? 'text-violet' : 'text-emerald-300'}`}>
          {perk.owner}
        </span>
      </button>
      {selected ? <span class="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.9)]" /> : null}
    </div>
  )
}

function KillerPortrait({ killer, className = '' }: { killer: (typeof dbdKillersData)[number]; className?: string }) {
  return (
    <div class={`overflow-hidden rounded-lg bg-[#081226] shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] ${className}`}>
      <img src={killer.imageUrl} alt={killer.name} class="h-full w-full object-cover object-center" />
    </div>
  )
}

function SurvivorPortrait({ survivor, className = '' }: { survivor: DbdSurvivor; className?: string }) {
  return (
    <div class={`overflow-hidden rounded-lg bg-[#081226] shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] ${className}`}>
      <img src={survivor.imageUrl} alt={survivor.name} class="h-full w-full object-cover object-center" />
    </div>
  )
}

function PopularBuildsPanel({
  builds,
  onLoad,
  onExplore,
  mode,
}: {
  builds: Build[]
  onLoad: (build: Build) => void
  onExplore: () => void
  mode: PerkRole
}) {
  return (
    <article class="flex min-h-0 flex-1 flex-col rounded-xl bg-[#050d20] p-4 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.14),0_18px_50px_rgba(0,0,0,0.30)]">
      <div class="mb-4">
        <h2 class="text-xs font-bold uppercase tracking-[0.08em] text-violet">Builds populares</h2>
        <p class="mt-1 text-xs text-muted">{mode === 'killer' ? 'Una plantilla por asesino.' : 'Plantillas de superviviente.'}</p>
      </div>
      <div class="tiger-scrollbar flex-1 space-y-2 overflow-y-auto pr-1">
        {builds.map((build) => {
          const killer = dbdKillersData.find((item) => item.id === build.killerId) ?? dbdKillersData[0]
          const survivor = build.survivorId ? dbdSurvivorsData.find((item) => item.id === build.survivorId) : undefined
          const previewPerk = allPerks.find((perk) => perk.id === build.perkIds[0])
          return (
            <button
              key={build.id}
              type="button"
              onClick={() => onLoad(build)}
              class="grid w-full grid-cols-[48px_minmax(0,1fr)] gap-3 rounded-lg bg-[#081226] p-2 text-left transition hover:bg-[#101b34]"
            >
              {build.role === 'killer' ? (
                <KillerPortrait killer={killer} className="h-12 w-12" />
              ) : survivor ? (
                <SurvivorPortrait survivor={survivor} className="h-12 w-12" />
              ) : (
                <div class="grid h-12 w-12 place-items-center rounded-lg bg-[#050d20]">
                  <PerkDiamond perk={previewPerk} size="sm" />
                </div>
              )}
              <span class="min-w-0 self-center">
                <span class="block truncate text-sm font-semibold text-text">{build.role === 'killer' ? killer.name : survivor?.name ?? build.name}</span>
                <span class="text-xs text-muted">{build.perkIds.length} perks{build.role === 'killer' ? ' - 2 addons' : ''}</span>
              </span>
            </button>
          )
        })}
      </div>
      <button
        type="button"
        onClick={onExplore}
        class="mt-3 inline-flex w-full items-center justify-between rounded-lg bg-[#0b142a] px-4 py-3 text-xs font-semibold text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:bg-[#101d38]"
      >
        Explorar plantillas
        <ChevronRight size={15} />
      </button>
    </article>
  )
}

function BuildLoadoutPanel({
  selectedPerks,
  selectedKiller,
  activeBuild,
  onDropPerk,
  onRemovePerk,
  onOpenPerk,
  onAddonChange,
  onEmptyClick,
}: {
  selectedPerks: Perk[]
  selectedKiller: (typeof dbdKillersData)[number]
  activeBuild: Build
  onDropPerk: (perkId: string, targetIndex: number) => void
  onRemovePerk: (perkId: string) => void
  onOpenPerk: (perkId: string) => void
  onAddonChange: (index: number, value: string) => void
  onEmptyClick: () => void
}) {
  return (
    <article class="grid shrink-0 gap-3 rounded-xl bg-[#050d20] p-3 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.14),0_18px_50px_rgba(0,0,0,0.30)] 2xl:grid-cols-[minmax(0,1fr)_390px]">
      <div>
        <h2 class="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-violet">Habilidades en este build ({selectedPerks.length}/4)</h2>
        <div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: MAX_PERKS }).map((_, index) => {
            const perk = selectedPerks[index]
            return perk ? (
              <SelectedPerkSlot
                key={perk.id}
                perk={perk}
                onRemove={() => onRemovePerk(perk.id)}
                onOpen={() => onOpenPerk(perk.id)}
                onDropPerk={(perkId) => onDropPerk(perkId, index)}
              />
            ) : (
              <button
                key={index}
                type="button"
                onClick={onEmptyClick}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  const perkId = event.dataTransfer?.getData('text/plain')
                  if (perkId) onDropPerk(perkId, index)
                }}
                class="grid min-h-[112px] place-items-center rounded-lg border border-dashed border-violet/25 bg-[#061126] text-muted transition hover:border-violet/45 hover:text-text"
              >
                <Plus size={28} />
              </button>
            )
          })}
        </div>
      </div>

      {activeBuild.role === 'killer' ? (
        <div class="min-h-0">
          <h2 class="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-violet">Add-ons de {selectedKiller.name}</h2>
          <AddonSelector
            killer={selectedKiller}
            addons={activeBuild.addons ?? []}
            onChange={onAddonChange}
            compact
          />
        </div>
      ) : null}
    </article>
  )
}

function PerkCatalogPanel({
  visiblePerks,
  selectedIds,
  selectedPerkId,
  roleFilter,
  search,
  onSearch,
  onOpen,
  onAdd,
}: {
  visiblePerks: Perk[]
  selectedIds: Set<string>
  selectedPerkId?: string
  roleFilter: PerkRole
  search: string
  onSearch: (value: string) => void
  onOpen: (perkId: string) => void
  onAdd: (perk: Perk) => void
}) {
  return (
    <article class="flex h-full min-h-0 flex-col rounded-xl bg-[#050d20] p-4 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.14),0_18px_50px_rgba(0,0,0,0.30)]">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xs font-bold uppercase tracking-[0.08em] text-violet">Todas las habilidades</h2>
        <div class="flex items-center gap-2">
          <div class="relative hidden sm:block">
            <Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onInput={(event) => onSearch(event.currentTarget.value)}
              placeholder="Buscar habilidad..."
              class="field-control h-9 w-56 rounded-lg pl-9 pr-3 text-xs"
            />
          </div>
          <button type="button" class="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0b142a] px-3 text-xs text-text">
            <Filter size={14} />
            {roleLabels[roleFilter]}
          </button>
        </div>
      </div>

      <div class="min-h-0 flex-1">
        <div class="relative mb-3 sm:hidden">
          <Search size={14} class="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onInput={(event) => onSearch(event.currentTarget.value)}
            placeholder="Buscar habilidad..."
            class="field-control h-9 w-full rounded-lg pl-9 pr-3 text-xs"
          />
        </div>
        <div class="tiger-scrollbar grid h-full auto-rows-[116px] content-start grid-cols-2 gap-2 overflow-y-auto p-1 pr-5 [scrollbar-gutter:stable] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {visiblePerks.map((perk) => (
            <PerkTile
              key={perk.id}
              perk={perk}
              selected={selectedIds.has(perk.id)}
              active={selectedPerkId === perk.id}
              onOpen={() => onOpen(perk.id)}
              onAdd={() => onAdd(perk)}
            />
          ))}
        </div>
      </div>
    </article>
  )
}

function BuildInfoPanel({ activeBuild, selectedKiller }: { activeBuild: Build; selectedKiller: (typeof dbdKillersData)[number] }) {
  return (
    <Panel title="Informacion del build">
      <div class="space-y-4 text-sm">
        <InfoLine icon={<Tag size={14} />} label="Creado por" value="TigerByte" />
        <InfoLine icon={<Calendar size={14} />} label="Fecha de creacion" value="23 May, 2026" />
        <InfoLine icon={<Calendar size={14} />} label="Ultima actualizacion" value="23 May, 2026" />
        <InfoLine icon={<Globe2 size={14} />} label="Visibilidad" value="Publico" />
        <div>
          <p class="mb-2 text-xs uppercase tracking-[0.08em] text-muted">Categoria</p>
          <div class="flex flex-wrap gap-2">
            <span class="rounded-lg bg-[#081226] px-3 py-2 text-xs text-muted">{activeBuild.role === 'killer' ? selectedKiller.name : 'Superviviente'}</span>
          </div>
        </div>
      </div>
    </Panel>
  )
}

function InfoLine({ icon, label, value }: { icon: preact.ComponentChildren; label: string; value: string }) {
  return (
    <div class="flex items-center justify-between gap-3">
      <span class="inline-flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-muted">{icon}{label}</span>
      <strong class="text-right text-sm text-text">{value}</strong>
    </div>
  )
}

function QuickActionsPanel({
  onTransfer,
  onDuplicate,
  onShare,
  onDelete,
}: {
  onTransfer: () => void
  onDuplicate: () => void
  onShare: () => void
  onDelete: () => void
}) {
  return (
    <Panel title="Accesos rapidos">
      <div class="space-y-2">
        <SideAction icon={<FileJson size={15} />} label="Importar / exportar builds" onClick={onTransfer} />
        <SideAction icon={<Copy size={15} />} label="Duplicar build" onClick={onDuplicate} />
        <SideAction icon={<Share2 size={15} />} label="Compartir build" onClick={onShare} />
        <SideAction icon={<Trash2 size={15} />} label="Eliminar build" onClick={onDelete} danger />
      </div>
    </Panel>
  )
}

function SideAction({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: preact.ComponentChildren
  label: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      class={`inline-flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm transition shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] ${
        danger
          ? 'bg-red-500/10 text-red-300 hover:bg-red-500/16'
          : 'bg-[#081226] text-text hover:bg-[#101b34]'
      }`}
    >
      <span class="inline-flex items-center gap-3">{icon}{label}</span>
      <ChevronRight size={14} class={danger ? 'text-red-300/70' : 'text-muted'} />
    </button>
  )
}

function NotesPanel({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Panel title="Notas del build" className="flex min-h-0 flex-1 flex-col">
      <textarea
        value={value}
        maxLength={500}
        onInput={(event) => onChange(event.currentTarget.value)}
        placeholder="Build centrada en el control del inicio de partida y la presion constante..."
        class="field-control min-h-0 flex-1 resize-none rounded-lg px-3 py-3 text-sm"
      />
      <p class="mt-2 text-right text-xs text-muted">{value.length}/500</p>
    </Panel>
  )
}

function AddonSelector({
  killer,
  addons,
  onChange,
  compact = false,
}: {
  killer: (typeof dbdKillersData)[number]
  addons: string[]
  onChange: (index: number, value: string) => void
  compact?: boolean
}) {
  return (
    <div class={`grid rounded-lg bg-[#081226] ${compact ? 'h-[112px] gap-2 p-0' : 'mb-4 gap-3 p-3 md:grid-cols-[74px_minmax(0,1fr)]'}`}>
      {compact ? null : <KillerPortrait killer={killer} className="h-[74px] w-[74px]" />}
      <div class="min-w-0">
        {compact ? null : <p class="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-violet">Addons de {killer.name}</p>}
        <div class={`grid ${compact ? 'h-[112px] gap-2' : 'gap-3 sm:grid-cols-2'}`}>
          {[0, 1].map((index) => (
            <div key={index} class={`grid items-center gap-2 ${compact ? 'h-[52px] grid-cols-[52px_minmax(0,1fr)]' : 'grid-cols-[52px_minmax(0,1fr)]'}`}>
              <AddonIcon addon={getAddonData(killer, addons[index])} addonName={addons[index]} />
              <select
                value={addons[index] ?? ''}
                onChange={(event) => onChange(index, event.currentTarget.value)}
                class={`field-control h-[52px] min-w-0 rounded-lg px-3 text-sm ${getAddonRarity(addons[index]) ? addonRarityStyles[getAddonRarity(addons[index]) as AddonRarity].text : ''}`}
              >
                <option value="">Sin addon</option>
                {killer.addons.map((addon) => {
                  const value = addon.apiKey ?? addon.name
                  const isAlreadySelected = addons.some((selectedAddon, selectedIndex) => selectedIndex !== index && selectedAddon === value)
                  return (
                    <option key={value} value={value} disabled={isAlreadySelected}>
                      {getAddonLabel(addon.name)}{isAlreadySelected ? ' - ya seleccionado' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function AddonIcon({ addon, addonName }: { addon?: DbdAddon; addonName?: string }) {
  const name = addon?.apiName ?? addon?.name ?? addonName
  const candidates = name ? addonImageCandidates(name, addon?.image, addon?.apiImage, addon?.iconFile) : []
  const [candidateIndex, setCandidateIndex] = useState(0)
  const src = candidates[candidateIndex]
  const rarity = addon?.rarity ?? getAddonRarity(name)
  const rarityStyle = rarity ? addonRarityStyles[rarity] : undefined

  useEffect(() => {
    setCandidateIndex(0)
  }, [name, addon?.image, addon?.apiImage, addon?.iconFile])

  return (
    <div class={`grid h-12 w-12 place-items-center overflow-hidden rounded-lg ring-1 ${rarityStyle ? `${rarityStyle.bg} ${rarityStyle.ring}` : 'bg-[#050d20] ring-white/10'}`}>
      {name && src ? (
        <img
          src={src}
          alt={name}
          class="h-full w-full object-contain p-1 drop-shadow-[0_2px_3px_rgba(0,0,0,0.55)]"
          onError={() => setCandidateIndex((index) => index + 1)}
        />
      ) : (
        <span class="text-xs text-muted">+</span>
      )}
    </div>
  )
}

function PerkDetail({ perk, selected, onAdd }: { perk: Perk; selected: boolean; onAdd: () => void }) {
  const description = getFormattedDescription(perk)

  return (
    <article class="flex h-full min-h-0 min-w-0 flex-col rounded-xl bg-[#050d20] p-5 shadow-[inset_0_0_0_1px_rgba(91,130,190,0.14),0_18px_50px_rgba(0,0,0,0.30)]">
      <div class="mb-4 grid grid-cols-[86px_minmax(0,1fr)] gap-4">
        <PerkDiamond perk={perk} size="lg" />
        <div class="min-w-0 self-center">
          <h2 class="text-lg font-bold leading-6 text-violet">{perk.name}</h2>
          <p class="text-sm text-violet">{perk.owner}</p>
          <p class="text-xs uppercase tracking-[0.08em] text-muted">{roleLabels[perk.role]}</p>
        </div>
      </div>

      <div class="tiger-scrollbar mb-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2 text-sm leading-6 text-muted">
        <p>{description.intro}</p>
        {description.bullets.length > 0 ? (
          <ul class="space-y-2">
            {description.bullets.map((bullet) => (
              <li key={bullet} class="grid grid-cols-[8px_minmax(0,1fr)] gap-3">
                <span class="mt-[0.65em] h-1.5 w-1.5 rounded-full bg-violet" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onAdd}
        class="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-violet px-4 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-default disabled:opacity-70"
        disabled={selected}
      >
        {selected ? 'Ya esta en la build' : 'Anadir al build'}
      </button>
    </article>
  )
}

function SelectedPerkSlot({
  perk,
  onRemove,
  onOpen,
  onDropPerk,
}: {
  perk: Perk
  onRemove: () => void
  onOpen: () => void
  onDropPerk: (perkId: string) => void
}) {
  return (
    <div
      draggable
      onDragStart={(event) => event.dataTransfer?.setData('text/plain', perk.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const perkId = event.dataTransfer?.getData('text/plain')
        if (perkId) onDropPerk(perkId)
      }}
      onClick={onOpen}
      class="relative min-h-[100px] rounded-lg bg-[#081226] p-2 text-center shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)] transition hover:bg-[#0d1830]"
      title="Clic para ver descripcion. Arrastra para cambiar orden o reemplazar"
    >
      <PerkDiamond perk={perk} size="md" />
      <p class="mt-1 overflow-hidden text-xs font-semibold leading-4 text-text [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">{perk.name}</p>
      <p class="text-[10px] text-violet">{perk.owner}</p>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation()
          onRemove()
        }}
        aria-label={`Quitar ${perk.name}`}
        title="Quitar"
        class="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#101b34] text-muted transition hover:bg-red-500/18 hover:text-red-200"
      >
        <X size={12} />
      </button>
    </div>
  )
}

function GuideModal({ onClose }: { onClose: () => void }) {
  return (
    <div class="fixed inset-0 z-50 grid place-items-center bg-[#01040d]/90 px-4 backdrop-blur-md" onClick={onClose}>
      <div
        class="tiger-scrollbar max-h-[86vh] w-[min(94vw,760px)] overflow-y-auto rounded-xl bg-[#050d20] p-5 text-left shadow-[inset_0_0_0_1px_rgba(91,130,190,0.18),0_24px_80px_rgba(0,0,0,0.78)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dbd-guide-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="dbd-guide-title" class="text-sm font-semibold uppercase text-violet">Guia completa</h2>
            <p class="mt-1 text-sm text-muted">Flujo recomendado para montar builds de Dead by Daylight.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b142a] text-muted transition hover:bg-[#111e39] hover:text-text"
            aria-label="Cerrar guia"
          >
            <X size={17} />
          </button>
        </div>

        <div class="grid gap-3 md:grid-cols-2">
          <GuideBlock title="1. Revisa datos" text="Haz clic una vez sobre una perk para verla en el panel tecnico sin cambiar tu build." />
          <GuideBlock title="2. Equipa rapido" text="Haz doble clic sobre una perk para anadirla automaticamente al primer hueco disponible." />
          <GuideBlock title="3. Ordena arrastrando" text="Arrastra perks desde el catalogo hasta los slots inferiores para anadir o reemplazar habilidades." />
          <GuideBlock title="4. Ajusta la build" text="Arrastra una perk equipada sobre otra para intercambiarlas y dejar la build ordenada." />
        </div>
      </div>
    </div>
  )
}

function DeleteBuildModal({
  build,
  saved,
  onCancel,
  onConfirm,
}: {
  build: Build
  saved: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div class="fixed inset-0 z-50 grid place-items-center bg-[#01040d]/90 px-4 backdrop-blur-md" onClick={onCancel}>
      <div
        class="w-[min(94vw,460px)] rounded-xl bg-[#050d20] p-5 text-left shadow-[inset_0_0_0_1px_rgba(248,113,113,0.20),0_24px_80px_rgba(0,0,0,0.78)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-build-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="delete-build-title" class="text-sm font-semibold uppercase text-red-300">Borrar build</h2>
            <p class="mt-2 text-sm leading-6 text-muted">
              {saved
                ? `Vas a borrar "${build.name}" de tus builds guardadas.`
                : `Vas a descartar "${build.name}" del editor.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b142a] text-muted transition hover:bg-[#111e39] hover:text-text"
            aria-label="Cancelar borrado"
          >
            <X size={17} />
          </button>
        </div>

        <div class="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            class="rounded-lg bg-[#0b142a] px-4 py-2 text-xs font-semibold text-text shadow-[inset_0_0_0_1px_rgba(148,163,184,0.10)] transition hover:bg-[#111e39]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            class="rounded-lg bg-red-500/18 px-4 py-2 text-xs font-bold text-red-200 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.24)] transition hover:bg-red-500/26"
          >
            Borrar build
          </button>
        </div>
      </div>
    </div>
  )
}

function TemplatesModal({
  builds,
  onLoad,
  onClose,
}: {
  builds: Build[]
  onLoad: (build: Build) => void
  onClose: () => void
}) {
  return (
    <div class="fixed inset-0 z-50 grid place-items-center bg-[#01040d]/90 px-4 backdrop-blur-md" onClick={onClose}>
      <div
        class="tiger-scrollbar max-h-[88vh] w-[min(94vw,1120px)] overflow-y-auto rounded-xl bg-[#050d20] p-5 text-left shadow-[inset_0_0_0_1px_rgba(91,130,190,0.18),0_24px_80px_rgba(0,0,0,0.78)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dbd-templates-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="dbd-templates-title" class="text-sm font-semibold uppercase text-violet">
              {builds[0]?.role === 'killer' ? 'Plantillas por asesino' : 'Plantillas de superviviente'}
            </h2>
            <p class="mt-1 text-sm text-muted">
              {builds[0]?.role === 'killer'
                ? 'Build popular con retrato, perks y addons recomendados para cada asesino.'
                : 'Build popular con retrato y perks recomendadas para cada superviviente.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b142a] text-muted transition hover:bg-[#111e39] hover:text-text"
            aria-label="Cerrar plantillas"
          >
            <X size={17} />
          </button>
        </div>

        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {builds.map((build) => {
            const killer = dbdKillersData.find((item) => item.id === build.killerId) ?? dbdKillersData[0]
            const survivor = build.survivorId ? dbdSurvivorsData.find((item) => item.id === build.survivorId) : undefined
            return (
              <article key={build.id} class="rounded-lg bg-[#081226] p-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
                <div class="mb-3 grid grid-cols-[72px_minmax(0,1fr)] gap-3">
                  {build.role === 'killer' ? (
                    <KillerPortrait killer={killer} className="h-[72px] w-[72px]" />
                  ) : survivor ? (
                    <SurvivorPortrait survivor={survivor} className="h-[72px] w-[72px]" />
                  ) : (
                    <div class="grid h-[72px] w-[72px] place-items-center rounded-lg bg-[#050d20]">
                      <PerkDiamond perk={allPerks.find((perk) => perk.id === build.perkIds[0])} size="md" />
                    </div>
                  )}
                  <div class="min-w-0 self-center">
                    <h3 class="truncate text-sm font-bold text-violet">{build.role === 'killer' ? killer.name : survivor?.name ?? build.name}</h3>
                    <p class="text-xs text-muted">Build popular</p>
                    {build.role === 'killer' ? <p class="mt-1 truncate text-xs text-violet">{build.addons?.map(getAddonLabel).join(' + ')}</p> : null}
                  </div>
                </div>
                {build.role === 'killer' ? <div class="mb-3 flex gap-2">
                  {(build.addons ?? []).map((addon) => (
                    <div key={`${build.id}-${addon}`} class="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#050d20] p-2">
                      <AddonIcon addon={getAddonData(killer, addon)} addonName={addon} />
                      <span class={`truncate text-xs ${addonRarityStyles[getAddonRarity(addon) ?? 'uncommon'].text}`}>{getAddonLabel(addon)}</span>
                    </div>
                  ))}
                </div> : null}
                <button
                  type="button"
                  onClick={() => onLoad(build)}
                  class="inline-flex w-full items-center justify-center rounded-lg bg-violet px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  Cargar plantilla
                </button>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function SavedBuildsModal({
  builds,
  onLoad,
  onClose,
}: {
  builds: Build[]
  onLoad: (build: Build) => void
  onClose: () => void
}) {
  const orderedBuilds = [...builds].sort((a, b) => b.updatedAt - a.updatedAt)
  const killerBuilds = orderedBuilds.filter((build) => build.role === 'killer')
  const survivorBuilds = orderedBuilds.filter((build) => build.role === 'survivor')
  const sections = [
    { id: 'killer', title: 'Builds de asesino', builds: killerBuilds },
    { id: 'survivor', title: 'Builds de superviviente', builds: survivorBuilds },
  ]

  return (
    <div class="fixed inset-0 z-50 grid place-items-center bg-[#01040d]/90 px-4 backdrop-blur-md" onClick={onClose}>
      <div
        class="tiger-scrollbar max-h-[88vh] w-[min(94vw,1120px)] overflow-y-auto rounded-xl bg-[#050d20] p-5 text-left shadow-[inset_0_0_0_1px_rgba(91,130,190,0.18),0_24px_80px_rgba(0,0,0,0.78)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dbd-saved-builds-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2 id="dbd-saved-builds-title" class="text-sm font-semibold uppercase text-violet">Todas mis builds</h2>
            <p class="mt-1 text-sm text-muted">Aqui puedes ver todas las builds guardadas de asesino y superviviente.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b142a] text-muted transition hover:bg-[#111e39] hover:text-text"
            aria-label="Cerrar builds guardadas"
          >
            <X size={17} />
          </button>
        </div>

        {orderedBuilds.length === 0 ? (
          <p class="rounded-lg bg-[#081226] px-3 py-4 text-sm text-muted">Todavia no tienes builds guardadas.</p>
        ) : (
          <div class="space-y-6">
            {sections.map((section) => (
              <section key={section.id} class="rounded-xl bg-[#071126]/70 p-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]">
                <div class="mb-3 flex items-center justify-between gap-3">
                  <h3 class="text-xs font-bold uppercase tracking-[0.08em] text-violet">{section.title}</h3>
                  <span class="rounded-full bg-violet/12 px-2 py-1 text-xs font-semibold text-violet-light">{section.builds.length}</span>
                </div>
                {section.builds.length === 0 ? (
                  <p class="rounded-lg bg-[#081226] px-3 py-4 text-sm text-muted">No tienes builds guardadas en esta categoria.</p>
                ) : (
                  <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {section.builds.map((build) => (
                      <SavedBuildCard key={build.id} build={build} onLoad={onLoad} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BuildTransferModal({
  exportText,
  onImport,
  onClose,
}: {
  exportText: string
  onImport: (jsonText: string) => number
  onClose: () => void
}) {
  const [importText, setImportText] = useState('')
  const [error, setError] = useState('')

  async function copyExport() {
    try {
      await copyShareText(exportText)
      setError('')
    } catch {
      setError('No se pudo copiar el JSON.')
    }
  }

  function downloadExport() {
    const blob = new Blob([exportText], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tigerbyte-dbd-builds.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function importFile(file?: File) {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImportText(String(reader.result ?? ''))
    reader.onerror = () => setError('No se pudo leer el archivo.')
    reader.readAsText(file)
  }

  function submitImport() {
    try {
      const count = onImport(importText)
      if (count > 0) onClose()
      else setError('El JSON no contiene builds validas.')
    } catch {
      setError('JSON invalido o incompatible.')
    }
  }

  return (
    <div class="fixed inset-0 z-50 grid place-items-center bg-[#01040d]/90 px-4 backdrop-blur-md" onClick={onClose}>
      <div
        class="grid max-h-[90vh] w-[min(94vw,980px)] gap-4 overflow-hidden rounded-xl bg-[#050d20] p-5 text-left shadow-[inset_0_0_0_1px_rgba(91,130,190,0.18),0_24px_80px_rgba(0,0,0,0.78)] lg:grid-cols-2"
        role="dialog"
        aria-modal="true"
        aria-labelledby="build-transfer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div class="lg:col-span-2 flex items-start justify-between gap-3">
          <div>
            <h2 id="build-transfer-title" class="text-sm font-semibold uppercase text-violet">Importar / exportar builds</h2>
            <p class="mt-1 text-sm text-muted">Pega un JSON de TigerByte o descarga tus builds guardadas.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-[#0b142a] text-muted transition hover:bg-[#111e39] hover:text-text"
            aria-label="Cerrar importador"
          >
            <X size={17} />
          </button>
        </div>

        <section class="min-h-0 rounded-lg bg-[#081226] p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
          <div class="mb-3 flex items-center justify-between gap-3">
            <h3 class="text-xs font-bold uppercase tracking-[0.08em] text-violet">Importar</h3>
            <label class="inline-flex cursor-pointer items-center rounded-lg bg-[#0b142a] px-3 py-2 text-xs font-semibold text-text transition hover:bg-[#101d38]">
              Cargar JSON
              <input
                type="file"
                accept="application/json,.json"
                class="hidden"
                onChange={(event) => importFile(event.currentTarget.files?.[0])}
              />
            </label>
          </div>
          <textarea
            value={importText}
            onInput={(event) => setImportText(event.currentTarget.value)}
            spellcheck={false}
            placeholder="{ &quot;type&quot;: &quot;dbd-builds&quot;, &quot;builds&quot;: [...] }"
            class="tiger-scrollbar h-[340px] w-full resize-none rounded-lg bg-[#050d20] p-3 font-mono text-xs leading-5 text-text outline-none shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition focus:shadow-[inset_0_0_0_1px_rgba(142,107,255,0.42)]"
          />
          {error ? <p class="mt-2 text-xs text-red-300">{error}</p> : null}
          <button
            type="button"
            onClick={submitImport}
            disabled={!importText.trim()}
            class="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-violet px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Importar builds
          </button>
        </section>

        <section class="min-h-0 rounded-lg bg-[#081226] p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
          <div class="mb-3 flex items-center justify-between gap-3">
            <h3 class="text-xs font-bold uppercase tracking-[0.08em] text-violet">Exportar</h3>
            <div class="flex gap-2">
              <button
                type="button"
                onClick={copyExport}
                class="rounded-lg bg-[#0b142a] px-3 py-2 text-xs font-semibold text-text transition hover:bg-[#101d38]"
              >
                Copiar
              </button>
              <button
                type="button"
                onClick={downloadExport}
                class="rounded-lg bg-violet px-3 py-2 text-xs font-bold text-white transition hover:brightness-110"
              >
                Descargar
              </button>
            </div>
          </div>
          <textarea
            value={exportText}
            readOnly
            spellcheck={false}
            class="tiger-scrollbar h-[390px] w-full resize-none rounded-lg bg-[#050d20] p-3 font-mono text-xs leading-5 text-muted outline-none shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)]"
          />
        </section>
      </div>
    </div>
  )
}

function SavedBuildCard({ build, onLoad }: { build: Build; onLoad: (build: Build) => void }) {
  const killer = dbdKillersData.find((item) => item.id === build.killerId) ?? dbdKillersData[0]
  const survivor = build.survivorId ? dbdSurvivorsData.find((item) => item.id === build.survivorId) : undefined
  const previewPerk = allPerks.find((perk) => perk.id === build.perkIds[0])

  return (
    <article class="rounded-lg bg-[#081226] p-3 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
      <div class="mb-3 grid grid-cols-[64px_minmax(0,1fr)] gap-3">
        {build.role === 'killer' ? (
          <KillerPortrait killer={killer} className="h-16 w-16" />
        ) : survivor ? (
          <SurvivorPortrait survivor={survivor} className="h-16 w-16" />
        ) : (
          <div class="grid h-16 w-16 place-items-center rounded-lg bg-[#050d20]">
            <PerkDiamond perk={previewPerk} size="sm" />
          </div>
        )}
        <div class="min-w-0 self-center">
          <h3 class="truncate text-sm font-bold text-violet">{build.name}</h3>
          <p class="text-xs text-muted">{roleLabels[build.role]} - {build.perkIds.length} perks</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onLoad(build)}
        class="inline-flex w-full items-center justify-center rounded-lg bg-violet px-3 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
      >
        Cargar build
      </button>
    </article>
  )
}

function GuideBlock({ title, text }: { title: string; text: string }) {
  return (
    <section class="rounded-lg bg-[#081226] p-4 shadow-[inset_0_0_0_1px_rgba(148,163,184,0.06)]">
      <h3 class="mb-2 text-sm font-semibold text-violet">{title}</h3>
      <p class="text-sm leading-6 text-muted">{text}</p>
    </section>
  )
}
