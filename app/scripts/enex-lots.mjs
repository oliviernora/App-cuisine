/**
 * Prépare les lots d'extraction des fiches Evernote (étape 2 du pipeline).
 * Lit Evernote/inventaire.json + textes/, garde les notes retenues (ni
 * douteuses ni scans), réduit chaque texte à sa zone utile et écrit des
 * fichiers Evernote/lots/lot-NN.txt d'environ 13 recettes, prêts à être lus
 * pour produire les fiches (ingrédients structurés + recette condensée).
 * Rejouable : régénère tous les lots à l'identique.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUT = join(ROOT, 'Evernote')
const PAR_LOT = 13

const notes = JSON.parse(readFileSync(join(OUT, 'inventaire.json'), 'utf8'))
let exclues = new Set()
try {
  exclues = new Set(JSON.parse(readFileSync(join(OUT, 'exclusions.json'), 'utf8')).exclues.map(e => e.id))
} catch { /* pas encore d'exclusions manuelles */ }
const retenues = notes.filter(n => !n.douteux && n.type !== 'scan' && !exclues.has(n.id))

/** Zone utile : autour de la première mention d'ingrédients, bornée. */
function zoneUtile(text) {
  const m = text.search(/infos pratiques|ingr[ée]dients pour|les ingr[ée]dients|^ingr[ée]dients/im)
  const start = m === -1 ? 0 : Math.max(0, m - 400)
  return text.slice(start, start + 4500).trim()
}

mkdirSync(join(OUT, 'lots'), { recursive: true })
mkdirSync(join(OUT, 'fiches'), { recursive: true })

const dejaFaits = new Set(readdirSync(join(OUT, 'fiches')).map(f => f.replace('.json', '')))
let lotNum = 0
for (let i = 0; i < retenues.length; i += PAR_LOT) {
  lotNum++
  const nom = 'lot-' + String(lotNum).padStart(2, '0')
  const bloc = retenues.slice(i, i + PAR_LOT).map(n => {
    const text = readFileSync(join(OUT, 'textes', n.id + '.txt'), 'utf8')
    return [
      '='.repeat(70),
      `id: ${n.id}`, `titre: ${n.title}`, `url: ${n.url || '(perso)'}`,
      `date note: ${n.created}${n.incomplete ? ' — CAPTURE INCOMPLÈTE : recharger la page depuis l\'URL' : ''}`,
      '-'.repeat(70), zoneUtile(text)
    ].join('\n')
  })
  writeFileSync(join(OUT, 'lots', nom + '.txt'), bloc.join('\n\n'))
}

console.log(`${retenues.length} recettes retenues → ${lotNum} lots dans Evernote/lots/`)
console.log(`fiches déjà produites : ${[...dejaFaits].join(', ') || 'aucune'}`)
