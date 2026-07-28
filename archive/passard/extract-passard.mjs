/**
 * Génère src/lib/passard.js : les 105 recettes vidéo d'Alain Passard.
 * Sources : passard-excel.json (extrait de Recettes_Alain_Passard.xlsx —
 * titre/fichier/URL faisant autorité), index.html (titres du portail) et
 * cuisinees.json (recettes déjà cuisinées) du projet « Alain Passard ».
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SRC = 'D:/OneDrive/Claude/Projects/Alain Passard/'
const excel = JSON.parse(readFileSync(fileURLToPath(new URL('./passard-excel.json', import.meta.url)), 'utf8'))
const html = readFileSync(SRC + 'index.html', 'utf8')
const cuisinees = JSON.parse(readFileSync(SRC + 'cuisinees.json', 'utf8')).cuisinees

const indexArr = new Function('return ' + html.match(/recipes\s*=\s*(\[.*?\]);/s)[1])()

// les slugs de cuisinees.json viennent des titres du portail ; on les relie
// aux fichiers vidéo, communs à l'Excel et au portail
const slug = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
const doneSlugs = cuisinees.map(s => s.replace(/_+/g, '_'))
const doneVideos = new Set(indexArr
  .filter(([, title]) => doneSlugs.includes(slug(title)))
  .map(([, , mp4]) => mp4))

const recipes = excel.map(r => ({
  title: r.title,
  video: r.video,
  url: r.url ?? '',
  done: doneVideos.has(r.video)
}))

const out = `/** 105 recettes vidéo d'Alain Passard (série Le Point « Le bonheur est dans
 * le jardin »), extraites du projet local le 06/07/2026 par scripts/extract-passard.mjs.
 * Les vidéos sont des fichiers locaux du PC (dossier Alain Passard/videos). */
export const PASSARD_SOURCE = {
  kind: 'video',
  title: 'Alain Passard — Le bonheur est dans le jardin (Le Point)',
  author: 'Alain Passard',
  country: 'France',
  categories: 'légumes, saison'
}

export const PASSARD_RECIPES = ${JSON.stringify(recipes, null, 2)}
`
writeFileSync(fileURLToPath(new URL('../src/lib/passard.js', import.meta.url)), out)
console.log(recipes.length + ' recettes, ' + recipes.filter(r => r.url).length + ' avec URL, '
  + recipes.filter(r => r.done).length + ' cuisinées')
