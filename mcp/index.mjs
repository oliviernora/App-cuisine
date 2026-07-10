/**
 * Serveur MCP « garde-manger » — incrément B1 : LECTURE SEULE.
 *
 * Claude lit la vraie base via des actions métier, jamais de SQL libre.
 * Intégrité : connexion par le compte Supabase dédié (mcp/.env), simple
 * membre du foyer — la RLS s'applique à toutes les requêtes.
 * Documentation : docs/technique/mcp.md.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'

const TABLES = ['items', 'shopping', 'households', 'household_members', 'locations',
  'item_lots', 'sources', 'recipes', 'realisations', 'events', 'event_recipes',
  'recipe_ingredients', 'ingredient_refs', 'ingredient_categories', 'recipe_photos']

let supabase = null
let householdId = null

/** Connexion paresseuse : le serveur démarre même sans .env, l'erreur
 * (claire) ne sort qu'à l'appel d'un outil. */
async function connect() {
  if (householdId) return
  const dir = dirname(fileURLToPath(import.meta.url))
  let raw
  try {
    raw = readFileSync(join(dir, '.env'), 'utf8')
  } catch {
    throw new Error('mcp/.env introuvable — copier mcp/.env.exemple en mcp/.env et le remplir (voir docs/technique/mcp.md)')
  }
  const env = {}
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  for (const k of ['SUPABASE_URL', 'SUPABASE_KEY', 'CLAUDE_EMAIL', 'CLAUDE_PASSWORD']) {
    if (!env[k]) throw new Error(`mcp/.env : ${k} manquant`)
  }
  supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)
  const { error } = await supabase.auth.signInWithPassword({
    email: env.CLAUDE_EMAIL, password: env.CLAUDE_PASSWORD
  })
  if (error) throw new Error('connexion Supabase refusée : ' + error.message)
  const { data, error: e2 } = await supabase.from('household_members')
    .select('household_id').limit(1).single()
  if (e2 || !data) throw new Error('le compte dédié n\'est membre d\'aucun foyer — le faire rejoindre avec le code d\'invitation')
  householdId = data.household_id
}

/** SELECT filtré par foyer, erreur remontée en clair. */
async function rows(table, columns = '*') {
  const { data, error } = await supabase.from(table).select(columns).eq('household_id', householdId)
  if (error) throw new Error(`${table} : ${error.message}`)
  return data
}

function fold(s) {
  return (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function ingredientLine(i) {
  return [i.qty_raw || i.qty, i.unit, i.name].filter(v => v !== null && v !== undefined && v !== '').join(' ')
    + (i.note ? ', ' + i.note : '') + (i.optional ? ' (facultatif)' : '') + (i.hard ? ' [à commander à l\'avance]' : '')
}

function texte(s) {
  return { content: [{ type: 'text', text: s }] }
}

/** Enrobe un outil : connexion, exécution, erreurs en texte lisible. */
function outil(fn) {
  return async (args) => {
    try {
      await connect()
      return texte(await fn(args ?? {}))
    } catch (e) {
      return { content: [{ type: 'text', text: 'ERREUR : ' + e.message }], isError: true }
    }
  }
}

const server = new McpServer({ name: 'garde-manger', version: '0.1.0' })

server.tool(
  'recherche_recettes',
  'Recherche des recettes du foyer (titre, ingrédient, pays, catégorie, source, mot du texte ; accents ignorés). Renvoie une ligne par recette.',
  { recherche: z.string().describe('Mots à chercher, ex. « poulet citronnelle »') },
  outil(async ({ recherche }) => {
    const [recipes, sources, ingredients] = await Promise.all([
      rows('recipes'), rows('sources'), rows('recipe_ingredients')])
    const words = fold(recherche).split(/\s+/).filter(Boolean)
    const list = recipes.filter(r => {
      const src = sources.find(s => s.id === r.source_id)
      const hay = fold([r.title, r.country, r.category, src?.title, r.steps,
        ...ingredients.filter(i => i.recipe_id === r.id).map(i => i.name)].join('\n'))
      return words.every(w => hay.includes(w))
    })
    if (!list.length) return 'Aucune recette trouvée.'
    return list.map(r => {
      const src = sources.find(s => s.id === r.source_id)
      return `- ${r.title}${src ? ' (' + src.title + ')' : ''}${r.country ? ' · ' + r.country : ''}${r.wishlist ? ' · ★ wish list' : ''}`
    }).join('\n')
  })
)

server.tool(
  'fiche_recette',
  'La fiche complète d\'une recette (par titre exact ou approchant) : source, personnes, ingrédients, texte, réalisations.',
  { titre: z.string() },
  outil(async ({ titre }) => {
    const recipes = await rows('recipes')
    const t = fold(titre)
    const recipe = recipes.find(r => fold(r.title) === t) ?? recipes.find(r => fold(r.title).includes(t))
    if (!recipe) return `Aucune recette « ${titre} ».`
    const [sources, ingredients, reals] = await Promise.all([
      rows('sources'), rows('recipe_ingredients'), rows('realisations')])
    const src = sources.find(s => s.id === recipe.source_id)
    const ings = ingredients.filter(i => i.recipe_id === recipe.id).toSorted((a, b) => a.position - b.position)
    const res = reals.filter(x => x.recipe_id === recipe.id)
    return [
      `# ${recipe.title}`,
      [src ? 'Source : ' + src.title : null, recipe.country ? 'Pays : ' + recipe.country : null,
        recipe.category ? 'Catégorie : ' + recipe.category : null,
        recipe.servings ? 'Pour ' + recipe.servings + ' personnes' : null,
        recipe.wishlist ? '★ wish list' : null].filter(Boolean).join(' · '),
      recipe.url ? recipe.url : null,
      ings.length ? '\nIngrédients :\n' + ings.map(i => '- ' + ingredientLine(i)).join('\n') : null,
      recipe.steps ? '\nRecette :\n' + recipe.steps : null,
      res.length ? '\nRéalisations :\n' + res.map(x => '- ' + (x.made_on ?? 'date non notée') + (x.comment ? ' — ' + x.comment : '')).join('\n') : '\nJamais cuisinée (ou non consignée).'
    ].filter(Boolean).join('\n')
  })
)

server.tool(
  'stock',
  'Le stock du foyer : produits, emplacements, quantités, seuils. Filtre facultatif sur le nom (accents ignorés).',
  { recherche: z.string().optional() },
  outil(async ({ recherche }) => {
    const items = await rows('items')
    const q = fold(recherche ?? '')
    const list = items.filter(i => !q || fold(i.name).includes(q))
      .toSorted((a, b) => (a.loc ?? '').localeCompare(b.loc ?? '', 'fr') || a.name.localeCompare(b.name, 'fr'))
    if (!list.length) return 'Rien au stock pour cette recherche.'
    return list.map(i => `- ${i.name} : ${i.qty ?? '?'}${i.min ? ' (mini ' + i.min + ')' : ''} · ${i.loc || 'sans emplacement'}${i.store ? ' · magasin : ' + i.store : ''}${i.qty === 0 ? ' · ÉPUISÉ' : ''}`).join('\n')
  })
)

server.tool(
  'liste_courses',
  'La liste de courses du foyer, groupée par magasin, avec quantités et origine (réappro, semaine, libre).',
  {},
  outil(async () => {
    const shop = (await rows('shopping')).filter(s => !s.done)
    if (!shop.length) return 'La liste de courses est vide.'
    const byStore = Map.groupBy(shop, s => s.store || 'Sans magasin')
    return [...byStore.entries()].map(([store, lines]) =>
      `## ${store}\n` + lines.map(l => `- ${l.name}${l.qty ? ' (' + l.qty + (l.unit ? ' ' + l.unit : '') + ')' : ''}${l.origin === 'semaine' ? ' · semaine' : ''}${l.available ? ' · « je l\'ai déjà »' : ''}`).join('\n')
    ).join('\n\n')
  })
)

server.tool(
  'master_list',
  'Le référentiel des ingrédients (master list) : noms canoniques, genre, sourcing. Filtre facultatif par genre.',
  { genre: z.string().optional() },
  outil(async ({ genre }) => {
    const refs = await rows('ingredient_refs')
    const g = fold(genre ?? '')
    const list = refs.filter(r => !g || fold(r.category).includes(g))
      .toSorted((a, b) => (a.category ?? '').localeCompare(b.category ?? '', 'fr') || a.name.localeCompare(b.name, 'fr'))
    if (!list.length) return 'Rien dans la master list pour ce filtre.'
    const byCat = Map.groupBy(list, r => r.category || 'Non classés')
    return [...byCat.entries()].map(([cat, refs2]) =>
      `## ${cat} (${refs2.length})\n` + refs2.map(r => `- ${r.name}${r.sourcing ? ' · ' + r.sourcing : ''}`).join('\n')
    ).join('\n\n')
  })
)

server.tool(
  'controle_schema',
  'Vérifie que les 15 tables attendues répondent (équivalent du check:schema) et compte les lignes visibles du foyer.',
  {},
  outil(async () => {
    const out = []
    for (const table of TABLES) {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true })
      out.push(error ? `- ${table} : ERREUR ${error.message}` : `- ${table} : OK (${count} lignes visibles)`)
    }
    return out.join('\n')
  })
)

await server.connect(new StdioServerTransport())
