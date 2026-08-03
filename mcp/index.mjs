/**
 * Serveur MCP « garde-manger » — B1 (lecture) + B2 (écritures métier).
 *
 * Claude travaille sur la vraie base via des actions métier, jamais de SQL
 * libre. Intégrité : connexion par le compte Supabase dédié (mcp/.env),
 * simple membre du foyer — la RLS s'applique à toutes les requêtes ;
 * écritures en masse en deux temps (mode « à blanc » → jeton → exécution)
 * avec sauvegarde JSON automatique avant l'exécution, et journal de toutes
 * les écritures (mcp/journal.jsonl). Documentation : docs/technique/mcp.md.
 */
import { readFileSync, appendFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { parseIngredientLine } from '../app/src/lib/ligne-ingredient.js'

const DIR = dirname(fileURLToPath(import.meta.url))
const ROOT = join(DIR, '..')

const TABLES = ['items', 'shopping', 'households', 'household_members', 'locations',
  'item_lots', 'sources', 'pending_books', 'recipes', 'realisations', 'events',
  'event_recipes', 'recipe_ingredients', 'ingredient_refs', 'ingredient_categories',
  'recipe_photos']

let supabase = null
let householdId = null

/** Connexion paresseuse : le serveur démarre même sans .env, l'erreur
 * (claire) ne sort qu'à l'appel d'un outil. */
async function connect() {
  if (householdId) return
  let raw
  try {
    raw = readFileSync(join(DIR, '.env'), 'utf8')
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

/* ----- Intégrité des écritures (B2) ----- */

/** Toute écriture (ou tentative) est consignée dans mcp/journal.jsonl. */
function journal(action, resultat) {
  appendFileSync(join(DIR, 'journal.jsonl'),
    JSON.stringify({ quand: new Date().toISOString(), action, resultat }) + '\n')
}

/** Sauvegarde JSON de toutes les tables du foyer AVANT une écriture en masse. */
async function sauvegarde(nom) {
  const dump = {}
  for (const table of TABLES) {
    const query = table === 'households'
      ? supabase.from(table).select().eq('id', householdId)
      : supabase.from(table).select().eq('household_id', householdId)
    const { data, error } = await query
    if (error) throw new Error(`sauvegarde impossible (${table} : ${error.message}) — écriture ANNULÉE`)
    dump[table] = data
  }
  mkdirSync(join(DIR, 'sauvegardes'), { recursive: true })
  const horodatage = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const fichier = join(DIR, 'sauvegardes', `${horodatage}-avant-${nom}.json`)
  writeFileSync(fichier, JSON.stringify(dump))
  return fichier
}

function fiabiliseTitre(s) {
  return (s ?? '').trim()
}

/** Plan d'import des fiches Evernote : quoi créer, quoi ignorer (doublons). */
async function planImportEvernote() {
  const fiches = JSON.parse(readFileSync(join(ROOT, 'Evernote', 'recettes-data.json'), 'utf8'))
  const [recipes, sources] = await Promise.all([rows('recipes'), rows('sources')])
  const creer = []
  const doublons = []
  const sourcesACreer = new Set()
  const titresConnus = new Set(sources.map(s => s.title))
  const vus = new Set()
  for (const f of fiches) {
    const src = sources.find(s => s.title === f.source)
    // Deux clés : l'URL ET titre+source — deux captures de la même page ne
    // diffèrent parfois que par un paramètre de tracking (?xtor…)
    const cleTitre = `${f.title}|${f.source}`
    const enBase = (f.url && recipes.some(r => r.url === f.url))
      || recipes.some(r => r.title === f.title && (!src || r.source_id === src.id))
    if (enBase || (f.url && vus.has(f.url)) || vus.has(cleTitre)) { doublons.push(f.title); continue }
    if (f.url) vus.add(f.url)
    vus.add(cleTitre)
    creer.push(f)
    if (!titresConnus.has(f.source)) sourcesACreer.add(f.source)
  }
  return { creer, doublons, sourcesACreer: [...sourcesACreer] }
}

/** Le jeton lie l'exécution au rapport « à blanc » que l'utilisateur a validé. */
function jetonDe(plan) {
  return createHash('sha256')
    .update(JSON.stringify(plan.creer.map(f => f.id + '|' + f.title)))
    .digest('hex').slice(0, 12)
}

/** Insère une recette et ses ingrédients structurés. Renvoie l'id créé. */
async function insereRecette(fiche, sourceId) {
  const { data, error } = await supabase.from('recipes').insert({
    household_id: householdId,
    source_id: sourceId ?? null,
    title: fiabiliseTitre(fiche.title),
    url: fiche.url ?? '',
    servings: fiche.servings ?? null,
    category: fiche.category ?? '',
    country: fiche.country ?? '',
    steps: fiche.steps ?? ''
  }).select().single()
  if (error) throw new Error(`recette « ${fiche.title} » : ${error.message}`)
  const lignes = (fiche.ingredients ?? []).map((i, position) => ({
    household_id: householdId,
    recipe_id: data.id,
    position,
    qty: i.qty ?? null,
    qty_raw: i.qty_raw ?? '',
    unit: i.unit ?? '',
    name: i.name,
    note: i.note ?? '',
    optional: i.optional ?? false,
    hard: i.hard ?? false
  }))
  if (lignes.length) {
    const { error: e2 } = await supabase.from('recipe_ingredients').insert(lignes)
    if (e2) throw new Error(`ingrédients de « ${fiche.title} » : ${e2.message}`)
  }
  return data.id
}

/** Trouve la source par titre exact ; la crée si absente (kind « site »,
 * comme le pipeline enex-merge). */
async function sourcePourTitre(title, cache) {
  if (cache.has(title)) return cache.get(title)
  const { data, error } = await supabase.from('sources')
    .insert({ household_id: householdId, title, kind: 'site' }).select().single()
  if (error) throw new Error(`source « ${title} » : ${error.message}`)
  cache.set(title, data.id)
  return data.id
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
  'Vérifie que les tables attendues répondent (équivalent du check:schema) et compte les lignes visibles du foyer.',
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

/* ----- Écritures métier (B2) ----- */

server.tool(
  'importer_recettes_evernote',
  'Importe les fiches de Evernote/recettes-data.json dans la base du foyer. TOUJOURS en deux temps : mode "a_blanc" (rapport de ce qui serait créé/ignoré + jeton), puis — après le GO explicite d\'Olivier — mode "executer" avec le jeton. Une sauvegarde JSON complète est écrite avant toute exécution. Dédoublonnage par URL, sinon titre + source. Aucune réalisation créée (décision du 07/07).',
  {
    mode: z.enum(['a_blanc', 'executer']),
    jeton: z.string().optional().describe('Obligatoire en mode executer : le jeton renvoyé par le dernier a_blanc')
  },
  outil(async ({ mode, jeton }) => {
    const plan = await planImportEvernote()
    const attendu = jetonDe(plan)
    if (mode === 'a_blanc') {
      journal('importer_recettes_evernote (à blanc)', `${plan.creer.length} à créer, ${plan.doublons.length} doublons`)
      return [
        `À CRÉER : ${plan.creer.length} recette(s)`,
        ...plan.creer.map(f => `- ${f.title} (${f.source})`),
        plan.sourcesACreer.length ? `\nSOURCES À CRÉER : ${plan.sourcesACreer.join(', ')}` : null,
        `\nDOUBLONS IGNORÉS : ${plan.doublons.length}`,
        `\nJeton d'exécution (après GO d'Olivier) : ${attendu}`
      ].filter(Boolean).join('\n')
    }
    if (jeton !== attendu) {
      journal('importer_recettes_evernote REFUSÉ', 'jeton absent ou périmé')
      return 'REFUSÉ : le jeton ne correspond pas au rapport « à blanc » actuel. Relancer a_blanc, faire valider le rapport par Olivier, puis exécuter avec le nouveau jeton.'
    }
    if (!plan.creer.length) return 'Rien à créer — la base est déjà à jour.'
    const fichierSauvegarde = await sauvegarde('import-evernote')
    const sources = await rows('sources')
    const cache = new Map(sources.map(s => [s.title, s.id]))
    const creees = []
    for (const fiche of plan.creer) {
      const sourceId = await sourcePourTitre(fiche.source, cache)
      await insereRecette(fiche, sourceId)
      creees.push(fiche.title)
    }
    journal('importer_recettes_evernote EXÉCUTÉ', `${creees.length} recettes créées ; sauvegarde : ${fichierSauvegarde}`)
    return `FAIT : ${creees.length} recette(s) créée(s), ${plan.doublons.length} doublon(s) ignoré(s).\nSauvegarde préalable : ${fichierSauvegarde}`
  })
)

server.tool(
  'creer_recette',
  'Crée UNE recette dans la base du foyer (dédoublonnage par URL sinon titre + source ; la source est créée si nouvelle). Les ingrédients se donnent en lignes de texte (« 200 g de farine »), parsées comme dans l\'application.',
  {
    titre: z.string(),
    source: z.string().describe('Nom de la source (livre, site, « Recettes perso »…)'),
    ingredients: z.string().describe('Un ingrédient par ligne, ex. « 500 g asperges vertes »'),
    recette: z.string().describe('Le texte des étapes'),
    url: z.string().optional(),
    personnes: z.number().int().positive().optional(),
    pays: z.string().optional(),
    categorie: z.string().optional()
  },
  outil(async ({ titre, source, ingredients, recette, url, personnes, pays, categorie }) => {
    const [recipes, sources] = await Promise.all([rows('recipes'), rows('sources')])
    const src = sources.find(s => s.title === source.trim())
    const doublon = recipes.find(r => (url && r.url === url)
      || (r.title === titre.trim() && src && r.source_id === src.id))
    if (doublon) {
      journal('creer_recette REFUSÉ (doublon)', titre)
      return `REFUSÉ : « ${doublon.title} » existe déjà (même ${url && doublon.url === url ? 'URL' : 'titre et source'}).`
    }
    const cache = new Map(sources.map(s => [s.title, s.id]))
    const sourceId = await sourcePourTitre(source.trim(), cache)
    const lignes = ingredients.split('\n').map(parseIngredientLine).filter(Boolean)
    await insereRecette({
      title: titre, url: url ?? '', servings: personnes ?? null,
      category: categorie ?? '', country: pays ?? '', steps: recette,
      ingredients: lignes
    }, sourceId)
    journal('creer_recette', `${titre} (${source}) — ${lignes.length} ingrédients`)
    return `FAIT : « ${titre.trim()} » créée (${lignes.length} ingrédient(s), source ${source.trim()}).`
  })
)

server.tool(
  'ajouter_realisation',
  'Consigne « j\'ai fait cette recette » : date (AAAA-MM-JJ, ou absente = date non notée) et commentaire facultatif.',
  {
    titre: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    commentaire: z.string().optional()
  },
  outil(async ({ titre, date, commentaire }) => {
    const recipes = await rows('recipes')
    const t = fold(titre)
    const recipe = recipes.find(r => fold(r.title) === t) ?? recipes.find(r => fold(r.title).includes(t))
    if (!recipe) return `Aucune recette « ${titre} ».`
    const { error } = await supabase.from('realisations').insert({
      household_id: householdId, recipe_id: recipe.id,
      made_on: date ?? null, comment: commentaire ?? ''
    })
    if (error) throw new Error(error.message)
    journal('ajouter_realisation', `${recipe.title} — ${date ?? 'date non notée'}`)
    return `FAIT : réalisation consignée pour « ${recipe.title} » (${date ?? 'date non notée'}).`
  })
)

/* ----- Bibliothèque : livres mis de côté au scan (NP15 révisé, 03/08/2026) -----
 * Un ISBN introuvable par l'application (Google Books, Open Library, BnF)
 * est mis de côté ; Claude le retrouve par recherche web (libraires,
 * éditeurs) et complète la fiche ici, couverture comprise. */

server.tool(
  'livres_a_completer',
  'Les livres mis de côté au scan (ISBN introuvable sur le web par l\'application). Pour chacun, chercher l\'ISBN sur le web (libraires, éditeurs), puis appeler completer_source.',
  {},
  outil(async () => {
    const books = await rows('pending_books')
    if (!books.length) return 'Aucun livre à compléter — la file est vide.'
    return books.map(b => `- ISBN ${b.isbn} (mis de côté le ${b.created_at.slice(0, 10)}${b.photo_path ? ', photo de couverture jointe : ' + b.photo_path : ''})`).join('\n')
  })
)

server.tool(
  'completer_source',
  'Documente un livre de la bibliothèque à partir de sa fiche trouvée sur le web : crée la source (ou complète les champs vides d\'un livre du même titre, jamais d\'écrasement), rapatrie la couverture depuis son URL dans le stockage privé du foyer, et retire l\'ISBN de la file « livres à compléter ».',
  {
    isbn: z.string().regex(/^97[89]\d{10}$/),
    titre: z.string(),
    auteur: z.string().optional(),
    editeur: z.string().optional(),
    annee: z.string().regex(/^\d{4}$/).optional(),
    pays: z.string().optional(),
    categories: z.string().optional(),
    couverture_url: z.string().url().optional().describe('URL directe de l\'image de couverture (page libraire ou éditeur)')
  },
  outil(async ({ isbn, titre, auteur, editeur, annee, pays, categories, couverture_url }) => {
    const sources = await rows('sources')
    if (sources.some(s => s.isbn === isbn)) {
      journal('completer_source REFUSÉ (doublon)', isbn)
      return `REFUSÉ : l'ISBN ${isbn} est déjà dans la bibliothèque.`
    }
    const t = titre.trim()
    const champs = { author: auteur ?? '', isbn, publisher: editeur ?? '', year: annee ?? '', country: pays ?? '', categories: categories ?? '' }
    let source = sources.find(s => s.title.localeCompare(t, 'fr', { sensitivity: 'base' }) === 0)
    let completed = false
    if (source) {
      // Même règle que l'application : seuls les champs vides sont remplis.
      const patch = Object.fromEntries(Object.entries(champs).filter(([col, val]) => val && !source[col]))
      const { error } = await supabase.from('sources').update(patch).eq('id', source.id)
      if (error) throw new Error(error.message)
      Object.assign(source, patch)
      completed = true
    } else {
      const { data, error } = await supabase.from('sources')
        .insert({ household_id: householdId, kind: 'livre', title: t, ...champs }).select().single()
      if (error) throw new Error(error.message)
      source = data
    }
    let couverture = 'sans couverture'
    if (couverture_url && !source.cover_path) {
      couverture = await rapatrieCouverture(source, couverture_url)
    }
    const pending = (await rows('pending_books')).find(b => b.isbn === isbn)
    if (pending) {
      if (pending.photo_path) await supabase.storage.from('photos').remove([pending.photo_path])
      await supabase.from('pending_books').delete().eq('id', pending.id)
    }
    journal('completer_source', `${t} (ISBN ${isbn}) — ${completed ? 'fiche complétée' : 'créé'}, ${couverture}`)
    return `FAIT : « ${t} » ${completed ? 'complété' : 'ajouté à la bibliothèque'} (${couverture})`
      + (pending ? ', retiré de la file « livres à compléter ».' : '.')
  })
)

/** Télécharge la couverture et la range dans le bucket privé du foyer
 * (même chemin que l'application : <foyer>/couvertures/<source>.jpg). */
async function rapatrieCouverture(source, url) {
  const res = await fetch(url)
  const type = res.headers.get('content-type') ?? ''
  if (!res.ok || !type.startsWith('image/')) return `couverture NON rapatriée (${res.status}, ${type || 'type inconnu'})`
  const bytes = new Uint8Array(await res.arrayBuffer())
  if (bytes.length > 8 * 1024 * 1024) return 'couverture NON rapatriée (image de plus de 8 Mo)'
  const path = `${householdId}/couvertures/${source.id}.jpg`
  const up = await supabase.storage.from('photos').upload(path, bytes, { contentType: type, upsert: true })
  if (up.error) return 'couverture NON rapatriée (' + up.error.message + ')'
  const { error } = await supabase.from('sources').update({ cover_path: path }).eq('id', source.id)
  if (error) return 'couverture NON rapatriée (' + error.message + ')'
  source.cover_path = path
  return 'couverture rapatriée'
}

server.tool(
  'journal_actions',
  'Les dernières écritures faites (ou refusées) par ce serveur, les plus récentes en premier.',
  {},
  outil(async () => {
    let raw
    try { raw = readFileSync(join(DIR, 'journal.jsonl'), 'utf8') } catch { return 'Journal vide : aucune écriture pour l\'instant.' }
    return raw.trim().split('\n').toReversed().slice(0, 50)
      .map(l => { const e = JSON.parse(l); return `- ${e.quand} · ${e.action} · ${e.resultat}` })
      .join('\n')
  })
)

await server.connect(new StdioServerTransport())
