/**
 * Fusionne les fiches extraites (Evernote/fiches/lot-NN.json) avec
 * l'inventaire pour produire :
 *   - Evernote/recettes-data.json : LA BASE RÉUTILISABLE (indépendante de
 *     l'application — format documenté dans Evernote/README.md)
 *   - Evernote/import.sql : import idempotent dans la base de l'app
 *     (sources par site, dédoublonnage des recettes par URL, ingrédients ;
 *     pas de réalisation — décision Olivier du 07/07/2026)
 * Rejouable : régénère les deux sorties à partir de tous les lots présents.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const OUT = join(ROOT, 'Evernote')

const SOURCES = {
  'marieclaire.fr': 'Marie Claire — Cuisine',
  'lemonde.fr': 'Le Monde — Cuisine',
  'lepoint.fr': 'Le Point — Cuisine',
  'papillesetpupilles.fr': 'Papilles et Pupilles',
  'atelierdeschefs.fr': 'L\'Atelier des Chefs',
  'marmiton.org': 'Marmiton',
  '': 'Recettes perso'
}

const notes = Object.fromEntries(
  JSON.parse(readFileSync(join(OUT, 'inventaire.json'), 'utf8')).map(n => [n.id, n]))

const domaine = u => { try { return new URL(u).hostname.replace('www.', '') } catch { return '' } }
const fiches = []
for (const f of readdirSync(join(OUT, 'fiches')).filter(f => f.endsWith('.json')).sort()) {
  for (const fiche of JSON.parse(readFileSync(join(OUT, 'fiches', f), 'utf8'))) {
    const n = notes[fiche.id]
    if (!n) { console.warn('fiche sans note : ' + fiche.id); continue }
    const dom = domaine(n.url)
    fiches.push({
      id: fiche.id,
      title: fiche.title,
      url: n.url,
      source: SOURCES[dom] ?? dom,
      capturedOn: `${n.created.slice(0, 4)}-${n.created.slice(4, 6)}-${n.created.slice(6, 8)}`,
      servings: fiche.servings ?? null,
      ingredients: fiche.ingredients,
      steps: fiche.steps,
      photos: existsSync(join(OUT, 'photos', fiche.id))
        ? readdirSync(join(OUT, 'photos', fiche.id)).map(p => `photos/${fiche.id}/${p}`) : []
    })
  }
}

writeFileSync(join(OUT, 'recettes-data.json'), JSON.stringify(fiches, null, 1))

/* ----- SQL idempotent ----- */
const q = s => "'" + String(s).replace(/'/g, "''") + "'"
const lignes = [
  '-- Import Evernote (généré par enex-merge.mjs — rejouable, aucun doublon).',
  'with h as (select id from households limit 1)',
  'insert into sources (household_id, kind, title)',
  'select h.id, ' + q('site') + ', v.title from h cross join (values',
  [...new Set(fiches.map(f => f.source))].map(t => `  (${q(t)})`).join(',\n'),
  ') as v(title)',
  'where not exists (select 1 from sources s where s.title = v.title);',
  ''
]
for (const f of fiches) {
  const clefUrl = f.url ? `url = ${q(f.url)}` : `title = ${q(f.title)} and source_id = (select id from sources where title = ${q(f.source)})`
  lignes.push(
    `-- ${f.title}`,
    'with h as (select id from households limit 1),',
    `r as (insert into recipes (household_id, source_id, title, url, servings, steps)`,
    `  select h.id, (select id from sources where title = ${q(f.source)}), ${q(f.title)}, ${q(f.url)}, ${f.servings ?? 'null'}, ${q(f.steps)}`,
    `  from h where not exists (select 1 from recipes where ${clefUrl})`,
    '  returning id, household_id)',
    'insert into recipe_ingredients (household_id, recipe_id, position, qty, unit, name)',
    'select r.household_id, r.id, v.pos, v.qty, v.unit, v.name from r join (values',
    f.ingredients.map((ing, i) =>
      `  (${i}, ${ing.qty ?? 'null'}${i === 0 ? '::numeric' : ''}, ${q(ing.unit ?? '')}, ${q(ing.name)})`).join(',\n'),
    ') as v(pos, qty, unit, name) on true;',
    ''
  )
}
lignes.push(`select count(*) as recettes_evernote from recipes where url like '%marieclaire%' or url like '%.fr%' or url like '%.com%' or url like '%.org%';`)
writeFileSync(join(OUT, 'import.sql'), lignes.join('\n'))

console.log(`${fiches.length} fiches fusionnées → recettes-data.json + import.sql`)
