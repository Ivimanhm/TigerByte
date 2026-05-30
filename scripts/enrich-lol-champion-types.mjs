import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const ddragonPath = path.join(root, 'data', 'ddragon-champion-16.10.1.json')
const targetPaths = [
  path.join(root, 'src', 'data', 'lolChampionsData.json'),
  path.join(root, 'public', 'lol', 'lolChampionsData.json'),
]

const typeLabels = {
  Assassin: 'Asesino',
  Fighter: 'Luchador',
  Mage: 'Mago',
  Marksman: 'Tirador',
  Support: 'Support',
  Tank: 'Tanque',
}

const engageChampionIds = new Set([
  'Alistar',
  'Amumu',
  'Blitzcrank',
  'Braum',
  'Camille',
  'Diana',
  'Galio',
  'Gragas',
  'Hecarim',
  'JarvanIV',
  'Kled',
  'Leona',
  'Malphite',
  'Maokai',
  'Nautilus',
  'Neeko',
  'Nocturne',
  'Ornn',
  'Pantheon',
  'Poppy',
  'Pyke',
  'Rakan',
  'Rammus',
  'Rell',
  'Renata',
  'Sejuani',
  'Sett',
  'Shen',
  'Sion',
  'Skarner',
  'TahmKench',
  'Thresh',
  'Vi',
  'Volibear',
  'MonkeyKing',
  'XinZhao',
  'Zac',
])

const ddragon = JSON.parse(fs.readFileSync(ddragonPath, 'utf8'))

for (const targetPath of targetPaths) {
  const data = JSON.parse(fs.readFileSync(targetPath, 'utf8'))
  data.champions = data.champions.map((champion) => {
    const riotChampion = ddragon.data[champion.id]
    const officialTypes = (riotChampion?.tags ?? []).map((tag) => typeLabels[tag] ?? tag)
    const playstyleTypes = engageChampionIds.has(champion.id) ? ['Engage'] : []

    return {
      ...champion,
      types: Array.from(new Set([...officialTypes, ...playstyleTypes])),
    }
  })

  fs.writeFileSync(targetPath, `${JSON.stringify(data, null, 2)}\n`)
}
