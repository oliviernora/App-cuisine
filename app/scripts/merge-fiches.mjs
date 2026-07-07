/**
 * Fusionne les fiches extraites (Alain Passard/fiches/fiches-batch-*.json)
 * en fiches-data.json (base réutilisable du projet Passard) et génère le
 * module applicatif src/lib/passard-fiches.js.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const DIR = 'D:/OneDrive/Claude/Projects/Alain Passard/fiches/'
const files = readdirSync(DIR).filter(f => /^fiches-batch-\d+\.json$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))

const all = []
const seen = new Set()
for (const f of files) {
  for (const entry of JSON.parse(readFileSync(DIR + f, 'utf8'))) {
    if (seen.has(entry.url)) continue
    seen.add(entry.url)
    all.push(entry)
  }
}

writeFileSync(DIR + '../fiches-data.json', JSON.stringify(all, null, 1))

const mod = `/** Fiches Passard (ingrédients + recette condensée), extraites des articles
 * Le Point par lots — générées par scripts/merge-fiches.mjs. Clé : url. */
export const PASSARD_FICHES = ${JSON.stringify(all, null, 1)}
`
writeFileSync(fileURLToPath(new URL('../src/lib/passard-fiches.js', import.meta.url)), mod)
console.log(all.length + ' fiches fusionnées (' + files.length + ' lots)')
