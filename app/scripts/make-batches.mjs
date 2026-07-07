/** Découpe lepoint-passard.json en lots de textes à extraire (cuisinées d'abord). */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { PASSARD_RECIPES } from '../src/lib/passard.js'

const SRC = 'D:/OneDrive/Claude/Projects/Alain Passard/lepoint-passard.json'
const OUT = 'D:/OneDrive/Claude/Projects/Alain Passard/batches/'
mkdirSync(OUT, { recursive: true })

const doneUrls = new Set(PASSARD_RECIPES.filter(r => r.done && r.url).map(r => r.url))
const all = JSON.parse(readFileSync(SRC, 'utf8')).filter(e => e.text.length > 500)
all.sort((a, b) => (doneUrls.has(b.url) ? 1 : 0) - (doneUrls.has(a.url) ? 1 : 0))

const SIZE = 10
let n = 0
for (let i = 0; i < all.length; i += SIZE) {
  n++
  const chunk = all.slice(i, i + SIZE)
    .map(e => '### ' + e.url + '\n# ' + e.title + '\n' + e.text)
    .join('\n\n')
  writeFileSync(OUT + 'batch-' + n + '.txt', chunk)
}
console.log(all.length + ' textes répartis en ' + n + ' lots dans ' + OUT)
