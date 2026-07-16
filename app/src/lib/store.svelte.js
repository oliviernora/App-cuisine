import { supabase } from './supabase.js'
import { seedRows } from './seed.js'
import { parseRecipeFromHtml } from './jsonld-recipe.js'

/* En développement, une mise à jour à chaud de ce module laisserait tourner
 * l'ancienne instance (canal temps réel, synchros) à côté de la nouvelle —
 * elles se battraient sur la liste de courses (leçon du 07/07/2026).
 * On force donc un rechargement complet de la page. */
if (import.meta.hot) import.meta.hot.accept(() => location.reload()) // rechargement complet

export const store = $state({
  ready: false,
  session: null,
  household: null,
  items: [],
  shop: [],
  locations: [],
  lots: [], // lots datés des emplacements « à dates » (N7)
  sources: [],
  recipes: [],
  realisations: [],
  events: [],
  eventRecipes: [],
  ingredients: [],
  refs: [],
  categories: [], // genres d'ingrédients (master list des genres + sourcing par défaut)
  photos: [],
  inv: null,
  recipesLoaded: false, // avant le chargement, la synchro des courses de la semaine ne tourne pas
  schemaWarning: false,
  online: typeof navigator === 'undefined' ? true : navigator.onLine
})

let channel = null
let refreshTimer = null
let restoring = false

const CACHE_KEY = 'gm-cache-v1'

/** Miroir local des données pour la consultation hors ligne (cas NP5). */
export function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      household: store.household,
      items: store.items,
      shop: store.shop
    }))
  } catch { /* stockage indisponible : la consultation hors ligne sera vide */ }
}

export function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) } catch { return null }
}

export async function init() {
  window.addEventListener('online', () => {
    store.online = true
    if (store.household) refresh().then(syncShop)
  })
  window.addEventListener('offline', () => { store.online = false })

  const { data: { session } } = await supabase.auth.getSession()
  store.session = session
  supabase.auth.onAuthStateChange((_event, s) => {
    const had = !!store.session
    store.session = s
    if (s && !had) bootstrap()
    if (!s) reset()
  })
  if (session) await bootstrap()
  resumeInventory()
  store.ready = true
}

function reset() {
  store.household = null
  store.items = []
  store.shop = []
  store.recipesLoaded = false
  if (channel) { supabase.removeChannel(channel); channel = null }
}

async function bootstrap() {
  const { data, error } = await supabase
    .from('household_members')
    .select('household_id, households(id, name)')
    .limit(1)
  if (error) {
    // Réseau indisponible : on sert les dernières données connues.
    const cached = loadCache()
    if (cached?.household) {
      store.household = cached.household
      store.items = cached.items
      store.shop = cached.shop
      store.online = false
    }
    return
  }
  store.household = data?.[0]?.households ?? null
  if (store.household) await startData()
}

async function startData() {
  await refresh()
  await syncShop()
  await loadRecipes()
  channel = supabase
    .channel('changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, scheduleRefresh)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping' }, scheduleRefresh)
    .subscribe()
}

function scheduleRefresh() {
  if (restoring) return // pas de synchro pendant qu'une restauration réécrit les tables
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => refresh().then(syncShop), 300)
}

async function refresh() {
  const hid = store.household.id
  const [i, s, l, lt] = await Promise.all([
    supabase.from('items').select().eq('household_id', hid).order('created_at'),
    supabase.from('shopping').select().eq('household_id', hid).order('created_at'),
    supabase.from('locations').select().eq('household_id', hid),
    supabase.from('item_lots').select().eq('household_id', hid)
  ])
  if (i.data) store.items = i.data
  if (s.data) store.shop = s.data
  if (l.data) store.locations = l.data
  if (lt.data) store.lots = lt.data
  if (i.data && s.data) saveCache()
}

export async function createHousehold(name, withSeed) {
  const id = crypto.randomUUID()
  const { error } = await supabase.from('households').insert({ id, name })
  if (error) throw error
  const { error: e2 } = await supabase
    .from('household_members')
    .insert({ household_id: id, user_id: store.session.user.id })
  if (e2) throw e2
  store.household = { id, name }
  if (withSeed) await supabase.from('items').insert(seedRows(id))
  await startData()
}

export async function joinHousehold(id) {
  const { error } = await supabase
    .from('household_members')
    .insert({ household_id: id.trim(), user_id: store.session.user.id })
  if (error) throw error
  await bootstrap()
}

/* ----- Stock par ingrédient (commentaires Olivier du 16/07/2026) -----
 * L'écran Stock et le rachat automatique raisonnent par ingrédient : la somme
 * de tous les emplacements est comparée au minimum de réserve, porté par la
 * fiche du référentiel (ingredient_refs.min, défaut 1 = rachat quand il n'en
 * reste plus). L'état « retiré du panier » (NP1) vit au même niveau. */

/** Minimum de réserve d'un ingrédient (sa fiche du référentiel ; 1 par défaut). */
export function minOf(name) {
  return refOf(name)?.min ?? 1
}

/** « Retiré du panier » (NP1) au niveau ingrédient. */
export function isDismissed(name) {
  return refOf(name)?.dismissed ?? false
}

/** Somme d'un ingrédient dans tous les emplacements (alias compris). */
export function totalOf(name) {
  return store.items.filter(i => sameIngredient(i.name, name)).reduce((n, i) => n + i.qty, 0)
}

/** Le stock vu par ingrédient : lignes d'emplacement regroupées sous le nom
 * canonique, somme, minimum, lignes encore garnies (stocked). */
export function stockGroups() {
  const byKey = new Map()
  for (const item of store.items) {
    const name = canonicalName(item.name)
    const key = fold(name)
    let g = byKey.get(key)
    if (!g) { g = { key, name, total: 0, rows: [] }; byKey.set(key, g) }
    g.total += item.qty
    g.rows.push(item)
  }
  for (const g of byKey.values()) {
    g.min = minOf(g.name)
    g.dismissed = isDismissed(g.name)
    g.rows.sort((a, b) => a.loc.localeCompare(b.loc, 'fr'))
    g.stocked = g.rows.filter(r => r.qty > 0)
  }
  return [...byKey.values()].toSorted((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
}

/** La ligne de courses (réappro ou réserve) d'un ingrédient du stock. */
export function shopEntryOf(group) {
  return store.shop.find(s => group.rows.some(i => i.id === s.item_id))
}

/** Fiche du référentiel d'un ingrédient, créée au besoin, puis champs appliqués. */
async function upsertRef(name, fields) {
  const ref = refOf(name)
  if (!ref) {
    const { data, error } = await supabase.from('ingredient_refs')
      .insert({ household_id: store.household.id, name, ...fields }).select().single()
    if (error || !data) { store.schemaWarning = true; return }
    data.aliases ??= []; data.rejected ??= []
    store.refs.push(data)
    return
  }
  Object.assign(ref, fields)
  const { error } = await supabase.from('ingredient_refs').update(fields).eq('id', ref.id)
  if (error) store.schemaWarning = true
}

/** Règle le minimum de réserve d'un ingrédient (0 = jamais racheté tout seul). */
export async function setIngredientMin(name, min) {
  await upsertRef(name, { min: Math.max(0, Math.round(Number(min) || 0)) })
  await syncShop()
}

async function setDismissed(name, dismissed) {
  if (isDismissed(name) === dismissed) return
  await upsertRef(name, { dismissed })
}

/** Supprime un ingrédient du stock : toutes ses lignes d'emplacement, ses
 * lots et sa ligne de courses. Uniquement via le panneau Modifier (décision
 * Olivier 16/07/2026 : pas de suppression directe en liste principale). */
export async function removeIngredient(name) {
  const ids = store.items.filter(i => sameIngredient(i.name, name)).map(i => i.id)
  store.items = store.items.filter(i => !ids.includes(i.id))
  store.shop = store.shop.filter(s => !ids.includes(s.item_id))
  store.lots = store.lots.filter(l => !ids.includes(l.item_id))
  if (!ids.length) return
  await supabase.from('shopping').delete().in('item_id', ids)
  await supabase.from('item_lots').delete().in('item_id', ids)
  await supabase.from('items').delete().in('id', ids)
}

/**
 * Garde la liste de courses alignée sur le stock, par ingrédient : somme des
 * emplacements sous le minimum = entrée automatique — sauf si l'utilisateur
 * l'a retirée du panier (`dismissed`, décision NP1) ; le réarmement se fait
 * quand le stock remonte.
 */
/* Même verrou que syncWeekShopping (leçon du 07/07/2026, constatée à
 * nouveau le 16/07 sur les retraits en série) : chaque écriture déclenche
 * un écho temps réel qui relance refresh() → syncShop() — sans verrou, des
 * passages concurrents se marchent dessus. */
let shopSyncRunning = false
let shopSyncQueued = false

export async function syncShop() {
  if (shopSyncRunning) { shopSyncQueued = true; return }
  shopSyncRunning = true
  try {
    const inserts = []
    for (const g of stockGroups()) {
      const entry = shopEntryOf(g)
      if (g.total < g.min && !entry && !g.dismissed) {
        inserts.push({ household_id: store.household.id, item_id: g.rows[0].id, name: g.name,
          store: g.rows.find(r => r.store)?.store || sourcingStore(g.name), manual: false })
      } else if (g.total >= g.min && entry && !entry.done && !entry.manual) {
        store.shop = store.shop.filter(s => s.id !== entry.id)
        const { error } = await supabase.from('shopping').delete().eq('id', entry.id)
        if (error) store.schemaWarning = true
      }
    }
    if (inserts.length) {
      const { data, error } = await supabase.from('shopping').insert(inserts).select()
      // 23505 : un autre appareil a inséré la même ligne en même temps —
      // l'index unique a fait son travail, rien à signaler.
      if (error && error.code !== '23505') store.schemaWarning = true
      if (data) store.shop.push(...data)
    }
  } finally {
    shopSyncRunning = false
  }
  if (shopSyncQueued) {
    shopSyncQueued = false
    await syncShop()
    return
  }
  await syncWeekShopping()
}

export async function addItem(fields) {
  const { data, error } = await supabase
    .from('items')
    .insert({ ...fields, household_id: store.household.id })
    .select().single()
  if (error) throw error
  store.items.push(data)
  await syncShop()
}

export async function changeQty(item, delta) {
  item.qty = Math.max(0, item.qty + delta)
  await supabase.from('items').update({ qty: item.qty }).eq('id', item.id)
  if (totalOf(item.name) >= minOf(item.name)) await setDismissed(item.name, false)
  await syncShop()
}

/** Le panier bascule la présence en liste : ajout (réserve ou manquant) ou
 * retrait — au niveau ingrédient. Accepte une ligne d'emplacement ou un
 * groupe de stockGroups() (les deux portent name). */
export async function toggleOrder(target) {
  const rows = store.items.filter(i => sameIngredient(i.name, target.name))
  const entry = store.shop.find(s => rows.some(i => i.id === s.item_id))
  if (!entry) {
    await setDismissed(target.name, false)
    const { data, error } = await supabase
      .from('shopping')
      .insert({ household_id: store.household.id, item_id: rows[0].id, name: canonicalName(target.name),
        store: rows.find(r => r.store)?.store || '', manual: totalOf(target.name) >= minOf(target.name) })
      .select().single()
    if (!error) store.shop.push(data)
  } else if (!entry.done) {
    await removeShopEntry(entry)
  }
}

export async function addShopEntry(name, storeName, qty = null, unit = '') {
  const { data, error } = await supabase
    .from('shopping')
    .insert({ household_id: store.household.id, name, store: storeName, qty, unit })
    .select().single()
  if (!error) store.shop.push(data)
}

export async function setDone(entry, done) {
  entry.done = done
  await supabase.from('shopping').update({ done }).eq('id', entry.id)
}

/** Retirer du panier un produit épuisé le marque « manquant » au lieu de le voir revenir (NP1). */
export async function removeShopEntry(entry) {
  store.shop = store.shop.filter(s => s !== entry)
  await supabase.from('shopping').delete().eq('id', entry.id)
  if (entry.item_id) {
    const item = store.items.find(i => i.id === entry.item_id)
    if (item && totalOf(item.name) < minOf(item.name)) await setDismissed(item.name, true)
  }
}

/** Ranger les achats (décision Olivier 16/07/2026, Q2) : chaque ligne cochée
 * devient « reçue, à mettre en stock » — l'intégration au stock (quantité
 * réelle, emplacement) se fait depuis l'onglet Inventaire, ce qui règle
 * aussi NP4 (plusieurs pots d'un coup). Une ligne « semaine » achetée
 * devient « je l'ai » (le besoin est couvert). */
export async function clearDone() {
  const done = store.shop.filter(s => s.done && !s.received)
  const semaine = done.filter(s => s.origin === 'semaine')
  const autres = done.filter(s => s.origin !== 'semaine')
  for (const entry of autres) entry.received = true
  if (autres.length) {
    const { error } = await supabase.from('shopping').update({ received: true }).in('id', autres.map(d => d.id))
    if (error) store.schemaWarning = true
  }
  for (const entry of semaine) {
    entry.done = false
    entry.available = true
    await supabase.from('shopping').update({ done: false, available: true }).eq('id', entry.id)
  }
  await syncShop()
}

/* ----- Réception des achats (Q2, décision Olivier 16/07/2026) -----
 * Les lignes « reçues » (received) attendent leur rangement dans l'onglet
 * Inventaire : quantité réelle et emplacement se choisissent au moment de
 * ranger. Tant qu'une ligne est reçue, le besoin est couvert : la synchro
 * n'en recrée pas (elle est done, jamais retirée ni doublonnée). */

/** Les achats reçus, à mettre en stock. */
export function receivedEntries() {
  return store.shop.filter(s => s.received)
    .toSorted((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
}

/** Emplacement proposé pour ranger un achat : celui du produit lié, sinon
 * celui d'une ligne du même ingrédient. */
export function receivedLoc(entry) {
  const linked = store.items.find(i => i.id === entry.item_id)
    ?? store.items.find(i => sameIngredient(i.name, entry.name))
  return linked?.loc ?? ''
}

/** Range un achat reçu : +n au stock à l'emplacement choisi (lot daté si
 * l'emplacement l'est), la ligne quitte « à mettre en stock ». */
export async function stashReceived(entry, qty, loc) {
  const n = Math.max(1, Math.round(Number(qty) || 1))
  const dest = loc.trim()
  store.shop = store.shop.filter(s => s.id !== entry.id)
  await supabase.from('shopping').delete().eq('id', entry.id)
  const today = new Date().toISOString().slice(0, 10)
  let item = store.items.find(i => i.loc === dest && sameIngredient(i.name, entry.name))
  if (!item) {
    await addItem({ name: entry.name, qty: isDatedLoc(dest) ? 0 : n, loc: dest, store: entry.store || '' })
    if (!isDatedLoc(dest)) return
    item = store.items[store.items.length - 1]
  }
  if (isDatedLoc(dest)) await enterLot(item, n, today)
  else await changeQty(item, n)
}

/** Définit ou change le lieu d'achat d'une ligne de courses ; mémorisé sur
 * toutes les lignes de stock de l'ingrédient pour les prochaines fois
 * (commentaire Olivier 16/07/2026). */
export async function setEntryStore(entry, storeName) {
  const s = storeName.trim()
  entry.store = s
  await supabase.from('shopping').update({ store: s }).eq('id', entry.id)
  const rows = store.items.filter(i => sameIngredient(i.name, entry.name))
  for (const it of rows) it.store = s
  if (rows.length) await supabase.from('items').update({ store: s }).in('id', rows.map(i => i.id))
}

export async function signOut() {
  await supabase.auth.signOut()
}

/** Toutes les données du foyer, pour la sauvegarde en fichier JSON
 * (exigence NFR — les fichiers photos, volumineux, ne sont pas inclus). */
export function exportPayload() {
  return {
    app: 'garde-manger',
    version: 1,
    exportedAt: new Date().toISOString(),
    household: store.household,
    items: store.items,
    shopping: store.shop,
    locations: store.locations,
    item_lots: store.lots,
    sources: store.sources,
    recipes: store.recipes,
    recipe_ingredients: store.ingredients,
    realisations: store.realisations,
    events: store.events,
    event_recipes: store.eventRecipes,
    ingredient_refs: store.refs,
    ingredient_categories: store.categories,
    recipe_photos: store.photos
  }
}

/* Restauration d'une sauvegarde (décision Olivier 09/07/2026) : remplacement
 * complet des données du foyer par le contenu du fichier. Les identifiants du
 * fichier sont conservés (les liens entre tables restent valides) ; seul
 * household_id est réécrit vers le foyer courant. Le foyer lui-même (nom,
 * membres) et les fichiers photos du bucket ne sont pas touchés. */

// Ordre d'insertion : parents avant enfants (suppression en ordre inverse).
const RESTORE_TABLES = ['locations', 'items', 'shopping', 'item_lots',
  'sources', 'recipes', 'recipe_ingredients', 'realisations', 'events',
  'event_recipes', 'ingredient_refs', 'ingredient_categories', 'recipe_photos']

/** Vérifie qu'un fichier est bien une sauvegarde exploitable (sinon lève). */
export function checkBackup(data) {
  if (!data || data.app !== 'garde-manger' || data.version !== 1) {
    throw new Error('ce fichier n’est pas une sauvegarde garde-manger (version 1 attendue).')
  }
  for (const table of RESTORE_TABLES) {
    if (!Array.isArray(data[table])) throw new Error(`sauvegarde incomplète (« ${table} » absent).`)
  }
}

/** Remplace toutes les données du foyer par celles de la sauvegarde.
 * Rejouable : en cas d'échec en cours de route, relancer avec le même
 * fichier repart d'un état propre (les suppressions viennent en premier). */
export async function restoreBackup(data) {
  checkBackup(data)
  const hid = store.household.id
  restoring = true
  try {
    for (const table of [...RESTORE_TABLES].reverse()) {
      const { error } = await supabase.from(table).delete().eq('household_id', hid)
      if (error) throw new Error(`restauration interrompue (${table}) : ${error.message}`)
    }
    for (const table of RESTORE_TABLES) {
      const rows = data[table].map(r => ({ ...r, household_id: hid }))
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase.from(table).insert(rows.slice(i, i + 500))
        if (error) throw new Error(`restauration interrompue (${table}) : ${error.message}`)
      }
    }
  } finally {
    restoring = false
  }
  await refresh()
  await loadRecipes()
  await syncShop()
}

/* ----- Recettes (cas N8, N9 — incrément 1) -----
 * Pas de synchronisation temps réel pour l'instant : chargées au démarrage
 * et tenues à jour localement après chaque action. */

async function loadRecipes() {
  const hid = store.household.id
  const [s, r, re, ev, er, ing, rf, ic, ph] = await Promise.all([
    supabase.from('sources').select().eq('household_id', hid),
    supabase.from('recipes').select().eq('household_id', hid),
    supabase.from('realisations').select().eq('household_id', hid),
    supabase.from('events').select().eq('household_id', hid),
    supabase.from('event_recipes').select().eq('household_id', hid),
    supabase.from('recipe_ingredients').select().eq('household_id', hid),
    supabase.from('ingredient_refs').select().eq('household_id', hid),
    supabase.from('ingredient_categories').select().eq('household_id', hid),
    supabase.from('recipe_photos').select().eq('household_id', hid)
  ])
  if (s.error || r.error || re.error || ev.error || er.error || ing.error || rf.error || ic.error || ph.error) { store.schemaWarning = true; return }
  store.sources = s.data
  store.recipes = r.data
  store.realisations = re.data
  store.events = ev.data
  store.eventRecipes = er.data
  store.ingredients = ing.data
  store.refs = rf.data
  store.categories = ic.data
  store.photos = ph.data
  store.recipesLoaded = true
  await syncWeekShopping()
}

/* Le parseur des lignes d'ingrédients vit dans ligne-ingredient.js (module
 * pur, partagé avec le serveur MCP) ; ré-exporté ici pour les composants. */
export { parseIngredientLine, ingredientLine } from './ligne-ingredient.js'
import { parseIngredientLine, ingredientLine } from './ligne-ingredient.js'

/** Wish list (N11) : recette « à faire un jour ». */
export async function setWishlist(recipe, flag) {
  recipe.wishlist = flag
  await supabase.from('recipes').update({ wishlist: flag }).eq('id', recipe.id)
}

/** Remplace les ingrédients (un par ligne), le texte, « pour N personnes », le pays et la catégorie. */
export async function saveRecipeDetails(recipe, ingredientsText, steps, servings = recipe.servings ?? null, country = recipe.country ?? '', category = recipe.category ?? '') {
  const hid = store.household.id
  const rows = ingredientsText.split('\n').map(parseIngredientLine).filter(Boolean)
    .map((r, i) => ({ ...r, position: i, household_id: hid, recipe_id: recipe.id }))
  await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipe.id)
  let created = []
  if (rows.length) {
    const { data, error } = await supabase.from('recipe_ingredients').insert(rows).select()
    if (error) { store.schemaWarning = true; return }
    created = data
  }
  store.ingredients = [...store.ingredients.filter(i => i.recipe_id !== recipe.id), ...created]
  recipe.steps = steps
  recipe.servings = servings
  recipe.country = country.trim()
  recipe.category = category.trim()
  await supabase.from('recipes').update({ steps, servings, country: recipe.country, category: recipe.category }).eq('id', recipe.id)
  await syncWeekShopping()
}

/**
 * Recherche plein texte d'une recette (décision Olivier 07/07/2026) : chaque
 * mot doit se trouver dans le titre, le pays, la source, un ingrédient ou le
 * texte de la recette (accents et casse ignorés).
 */
export function searchRecipes(query) {
  const words = fold(query.trim()).split(/\s+/).filter(Boolean)
  if (!words.length) return store.recipes
  return store.recipes.filter(r => {
    const source = store.sources.find(s => s.id === r.source_id)
    const hay = fold([r.title, r.country ?? '', r.category ?? '', source?.title ?? '', r.steps ?? '',
      ...store.ingredients.filter(i => i.recipe_id === r.id).map(i => i.name)].join('\n'))
    return words.every(w => hay.includes(w))
  })
}

/* ----- Sources : liste courte et gérée (décision Olivier 07/07/2026) ----- */

/** Renomme une source ; un titre déjà existant fusionne les deux (recettes réaffectées). */
export async function renameSource(source, newTitle) {
  const title = newTitle.trim()
  if (!title || title === source.title) return
  const target = store.sources.find(s => s.id !== source.id && s.title === title)
  if (target) {
    for (const r of store.recipes.filter(r => r.source_id === source.id)) r.source_id = target.id
    await supabase.from('recipes').update({ source_id: target.id }).eq('source_id', source.id)
    store.sources = store.sources.filter(s => s.id !== source.id)
    await supabase.from('sources').delete().eq('id', source.id)
  } else {
    source.title = title
    await supabase.from('sources').update({ title }).eq('id', source.id)
  }
}

export async function addSource(title, kind = 'livre') {
  const t = title.trim()
  if (!t || store.sources.some(s => s.title === t)) return
  const { data, error } = await supabase.from('sources')
    .insert({ household_id: store.household.id, title: t, kind }).select().single()
  if (!error) store.sources.push(data)
}

export async function setRecipeSource(recipe, sourceId) {
  recipe.source_id = sourceId
  await supabase.from('recipes').update({ source_id: sourceId }).eq('id', recipe.id)
}

/* ----- Import d'une recette depuis une URL (A1, décision Olivier 10/07/2026) ----- */

/** Recette déjà importée : même URL, sinon même titre + même source (clé de l'import Evernote). */
export function findDuplicateRecipe(url, title = '', sourceId = null) {
  return store.recipes.find(r => (url && r.url === url)
    || (title && sourceId && r.title === title && r.source_id === sourceId))
}

/** Rapatrie la page (Edge Function « rapatrier-page », contournement CORS) et
 * propose une fiche à relire. N'écrit rien en base.
 * Renvoie { proposal } ou { error } (message affichable). */
export async function fetchRecipeFromUrl(url) {
  const { data, error } = await supabase.functions.invoke('rapatrier-page', { body: { url } })
  if (error || !data?.html) {
    return { error: 'La page n\'a pas pu être récupérée. Vérifier l\'adresse et la connexion, puis réessayer.' }
  }
  const proposal = parseRecipeFromHtml(data.html, url)
  if (!proposal) {
    return { error: 'Aucune recette structurée trouvée sur cette page. Copier le texte de la recette et créer la fiche à la main.' }
  }
  return { proposal }
}

/** Rapatrie la photo du plat annoncée par la page (même Edge Function,
 * body { url, image: true }) et la rattache à la fiche en « plat ».
 * Renvoie true, ou false si la photo n'a pas pu être récupérée — la
 * recette, elle, est déjà enregistrée. */
export async function attachImportedPhoto(recipe, imageUrl) {
  const { data, error } = await supabase.functions.invoke('rapatrier-page', { body: { url: imageUrl, image: true } })
  if (error || !data?.image) return false
  const bytes = Uint8Array.from(atob(data.image), c => c.charCodeAt(0))
  const blob = new Blob([bytes], { type: data.contentType || 'image/jpeg' })
  return Boolean(await addRecipePhoto(recipe, blob, 'plat'))
}

/** Enregistre la fiche relue : crée la source (site) si besoin, refuse les
 * doublons (URL, sinon titre + source), puis insère recette et ingrédients.
 * Renvoie { recipe }, { duplicate } ou { error }. */
export async function createImportedRecipe({ url, title, sourceTitle, ingredientsText, steps, servings, country, category, sourceKind = 'site' }) {
  const t = title.trim()
  if (!t) return { error: 'Le titre est obligatoire.' }
  let source = store.sources.find(s => s.title === sourceTitle.trim())
  if (!source && sourceTitle.trim()) {
    await addSource(sourceTitle, sourceKind)
    source = store.sources.find(s => s.title === sourceTitle.trim())
  }
  const duplicate = findDuplicateRecipe(url, t, source?.id)
  if (duplicate) return { duplicate }
  const { data, error } = await supabase.from('recipes')
    .insert({ household_id: store.household.id, source_id: source?.id ?? null, title: t, url: url ?? '' })
    .select().single()
  if (error) { store.schemaWarning = true; return { error: 'Enregistrement impossible. Réessayer une fois la connexion revenue.' } }
  store.recipes.push(data)
  const recipe = store.recipes[store.recipes.length - 1]
  await saveRecipeDetails(recipe, ingredientsText, steps, servings, country, category)
  return { recipe }
}

export function ingredientsOf(recipeId) {
  return store.ingredients.filter(i => i.recipe_id === recipeId)
    .toSorted((a, b) => a.position - b.position)
}

function fold(s) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/* ----- Référentiel d'ingrédients (master list, décision Olivier 07/07/2026) -----
 * Deux noms désignent le même ingrédient s'ils sont identiques une fois
 * repliés (casse et accents ignorés), ou s'ils sont réunis dans une même
 * entrée du référentiel (nom + alias confirmés à la main). Les rapprochements
 * refusés sont mémorisés (rejected) pour ne jamais être reproposés. */

function refKeys(ref) {
  return [fold(ref.name), ...ref.aliases.map(fold)]
}

function refOf(name) {
  const f = fold(name)
  return store.refs.find(r => refKeys(r).includes(f)) ?? null
}

export function sameIngredient(a, b) {
  const fa = fold(a), fb = fold(b)
  if (fa === fb) return true
  const ref = refOf(a)
  return ref ? refKeys(ref).includes(fb) : false
}

/** Nom canonique : celui du référentiel si le nom y figure, sinon le nom tel quel. */
export function canonicalName(name) {
  return refOf(name)?.name ?? name
}

/** Forme naïve au singulier, pour détecter les doublons probables (citrons/citron). */
function depluralize(name) {
  return fold(name).split(' ').map(w => w.length > 3 ? w.replace(/[sx]$/, '') : w).join(' ')
}

/** Deux noms se ressemblent : l'un contient l'autre (au singulier près) ou
 * alias confirmé — pour retrouver « clous de girofle » en tapant « clou de
 * girofle » à l'inventaire (commentaire Olivier 16/07/2026). */
export function looseMatch(a, b) {
  const fa = fold(a), fb = fold(b)
  if (fa.includes(fb) || fb.includes(fa)) return true
  const da = depluralize(a), db = depluralize(b)
  if (da.includes(db) || db.includes(da)) return true
  return sameIngredient(a, b)
}

/** Tous les noms d'ingrédients connus (stock + recettes), une graphie par nom replié. */
export function knownNames() {
  const byFold = new Map()
  for (const n of [...store.items.map(i => i.name), ...store.ingredients.map(i => i.name)]) {
    const t = n.trim()
    if (t && !byFold.has(fold(t))) byFold.set(fold(t), t)
  }
  return [...byFold.values()]
}

/** Paires de noms probablement identiques, à confirmer une par une (jamais de fusion silencieuse). */
export function pendingMerges() {
  const groups = Map.groupBy(knownNames(), depluralize)
  const pairs = []
  for (const [, names] of groups) {
    for (let i = 1; i < names.length; i++) {
      const [a, b] = [names[0], names[i]]
      if (sameIngredient(a, b)) continue
      const ref = refOf(a) ?? refOf(b)
      if (ref?.rejected.map(fold).includes(fold(refOf(a) ? b : a))) continue
      pairs.push({ a, b })
    }
  }
  return pairs.toSorted((p, q) => p.a.localeCompare(q.a, 'fr'))
}

/** Mémorise la réponse à « a et b, même ingrédient ? » dans le référentiel. */
async function answerMerge(a, b, field) {
  let ref = refOf(a) ?? refOf(b)
  if (!ref) {
    const { data, error } = await supabase.from('ingredient_refs')
      .insert({ household_id: store.household.id, name: a }).select().single()
    if (error || !data) { store.schemaWarning = true; return }
    data.aliases ??= []; data.rejected ??= []
    store.refs.push(data)
    ref = store.refs[store.refs.length - 1]
  }
  const other = refKeys(ref).includes(fold(a)) ? b : a
  const otherRef = refOf(other)
  if (field === 'aliases' && otherRef && otherRef !== ref) {
    // L'autre nom a déjà sa fiche : on l'absorbe (alias, refus, catégorie si
    // la nôtre est vide) au lieu de laisser une fiche orpheline en doublon.
    ref.aliases = [...ref.aliases, otherRef.name, ...otherRef.aliases]
    ref.rejected = [...new Set([...ref.rejected, ...otherRef.rejected])]
    if (!ref.category && otherRef.category) ref.category = otherRef.category
    store.refs = store.refs.filter(r => r !== otherRef)
    await supabase.from('ingredient_refs').delete().eq('id', otherRef.id)
    const { error } = await supabase.from('ingredient_refs')
      .update({ aliases: ref.aliases, rejected: ref.rejected, category: ref.category }).eq('id', ref.id)
    if (error) store.schemaWarning = true
    return
  }
  ref[field] = [...ref[field], other]
  const { error } = await supabase.from('ingredient_refs')
    .update({ [field]: ref[field] }).eq('id', ref.id)
  if (error) store.schemaWarning = true
}

export const confirmMerge = (a, b) => answerMerge(a, b, 'aliases')
export const rejectMerge = (a, b) => answerMerge(a, b, 'rejected')

/** Master list : tous les ingrédients canoniques connus, avec leur catégorie. */
export function masterList() {
  const byKey = new Map()
  for (const name of knownNames()) {
    const canonical = canonicalName(name)
    const key = fold(canonical)
    if (!byKey.has(key)) {
      byKey.set(key, { name: canonical, category: refOf(canonical)?.category ?? '' })
    }
  }
  return [...byKey.values()].toSorted((a, b) => a.name.localeCompare(b.name, 'fr'))
}

/** Range un ingrédient dans un genre (crée l'entrée du référentiel et le genre au besoin). */
export async function setIngredientCategory(name, category) {
  const cat = category.trim()
  if (cat) await addCategory(cat)
  const ref = refOf(name)
  if (!ref) {
    const { data, error } = await supabase.from('ingredient_refs')
      .insert({ household_id: store.household.id, name, category: cat }).select().single()
    if (error || !data) { store.schemaWarning = true; return }
    data.aliases ??= []; data.rejected ??= []; data.category ??= cat
    store.refs.push(data)
  } else {
    ref.category = cat
    await supabase.from('ingredient_refs').update({ category: cat }).eq('id', ref.id)
  }
}

/* ----- Genres d'ingrédients et sourcing (commentaires Olivier, 08/07/2026) -----
 * Les genres vivent dans ingredient_categories (master list des genres) et
 * portent le sourcing par défaut (marché | internet | boutique + commentaire),
 * affiné ingrédient par ingrédient sur ingredient_refs. Le sourcing alimente
 * la liste de courses : il préremplit le magasin des lignes créées
 * automatiquement (décision Olivier 08/07/2026). */

export const SOURCING_TYPES = ['marché', 'internet', 'boutique']

/** Crée un genre s'il n'existe pas déjà (casse et accents ignorés). */
export async function addCategory(name) {
  const n = name.trim()
  if (!n || store.categories.some(c => fold(c.name) === fold(n))) return
  const { data, error } = await supabase.from('ingredient_categories')
    .insert({ household_id: store.household.id, name: n }).select().single()
  if (error || !data) { store.schemaWarning = true; return }
  store.categories.push(data)
}

/** Renomme un genre partout (ingrédients compris) ; un nom déjà existant fusionne. */
export async function renameCategory(oldName, newName) {
  const n = newName.trim()
  const cat = store.categories.find(c => c.name === oldName)
  if (!cat || !n || n === oldName) return
  const target = store.categories.find(c => c !== cat && fold(c.name) === fold(n))
  if (target) {
    store.categories = store.categories.filter(c => c !== cat)
    await supabase.from('ingredient_categories').delete().eq('id', cat.id)
  } else {
    cat.name = n
    await supabase.from('ingredient_categories').update({ name: n }).eq('id', cat.id)
  }
  const dest = target?.name ?? n
  for (const ref of store.refs.filter(r => r.category === oldName)) ref.category = dest
  const { error } = await supabase.from('ingredient_refs').update({ category: dest })
    .eq('household_id', store.household.id).eq('category', oldName)
  if (error) store.schemaWarning = true
}

/** Supprime un genre : ses ingrédients redeviennent « non classés ». */
export async function removeCategory(name) {
  const cat = store.categories.find(c => c.name === name)
  if (!cat) return
  store.categories = store.categories.filter(c => c !== cat)
  await supabase.from('ingredient_categories').delete().eq('id', cat.id)
  for (const ref of store.refs.filter(r => r.category === name)) ref.category = ''
  await supabase.from('ingredient_refs').update({ category: '' })
    .eq('household_id', store.household.id).eq('category', name)
}

/** Sourcing par défaut d'un genre. */
export async function setCategorySourcing(name, sourcing, note) {
  const cat = store.categories.find(c => c.name === name)
  if (!cat) return
  cat.sourcing = sourcing; cat.sourcing_note = note.trim()
  const { error } = await supabase.from('ingredient_categories')
    .update({ sourcing: cat.sourcing, sourcing_note: cat.sourcing_note }).eq('id', cat.id)
  if (error) store.schemaWarning = true
}

/** Sourcing affiné d'un ingrédient (vide = hérite du genre). */
export async function setIngredientSourcing(name, sourcing, note) {
  const ref = refOf(name)
  if (!ref) {
    const { data, error } = await supabase.from('ingredient_refs')
      .insert({ household_id: store.household.id, name, sourcing, sourcing_note: note.trim() }).select().single()
    if (error || !data) { store.schemaWarning = true; return }
    data.aliases ??= []; data.rejected ??= []
    store.refs.push(data)
    return
  }
  ref.sourcing = sourcing; ref.sourcing_note = note.trim()
  const { error } = await supabase.from('ingredient_refs')
    .update({ sourcing: ref.sourcing, sourcing_note: ref.sourcing_note }).eq('id', ref.id)
  if (error) store.schemaWarning = true
}

/** Genre d'un ingrédient (via sa fiche du référentiel, alias compris). */
export function categoryOf(name) {
  return refOf(name)?.category ?? ''
}

/** Sourcing effectif d'un ingrédient : sa fiche, sinon le défaut de son genre. */
export function sourcingOf(name) {
  const ref = refOf(name)
  if (ref?.sourcing || ref?.sourcing_note) return { sourcing: ref.sourcing, note: ref.sourcing_note ?? '' }
  const cat = store.categories.find(c => c.name === (ref?.category || ''))
  return { sourcing: cat?.sourcing ?? '', note: cat?.sourcing_note ?? '' }
}

/** Magasin prérempli d'une ligne de courses : commentaire du sourcing (nom du marché, site…), sinon le type. */
function sourcingStore(name) {
  const s = sourcingOf(name)
  return s.note || s.sourcing
}

/** Renomme un ingrédient de la master list : l'ancien nom devient un alias
 * (les recettes le retrouvent), le stock et les courses sont renommés ;
 * un nom déjà connu fusionne les deux fiches. */
export async function renameIngredient(oldName, newName) {
  const n = newName.trim()
  if (!n || fold(n) === fold(oldName)) return
  const affected = store.items.filter(i => sameIngredient(i.name, oldName))
  let ref = refOf(oldName)
  const target = store.refs.find(r => r !== ref && refKeys(r).includes(fold(n)))
  if (!ref && !target) {
    const { data, error } = await supabase.from('ingredient_refs')
      .insert({ household_id: store.household.id, name: n, aliases: [oldName] }).select().single()
    if (error || !data) { store.schemaWarning = true; return }
    data.aliases ??= []; data.rejected ??= []
    store.refs.push(data)
  } else if (target) {
    // Le nouveau nom a déjà sa fiche : elle absorbe l'ancienne.
    if (ref) {
      target.aliases = [...new Set([...target.aliases, ref.name, ...ref.aliases])]
      target.rejected = [...new Set([...target.rejected, ...ref.rejected])]
      if (!target.category && ref.category) target.category = ref.category
      store.refs = store.refs.filter(r => r !== ref)
      await supabase.from('ingredient_refs').delete().eq('id', ref.id)
    } else if (!target.aliases.map(fold).includes(fold(oldName))) {
      target.aliases = [...target.aliases, oldName]
    }
    const { error } = await supabase.from('ingredient_refs')
      .update({ aliases: target.aliases, rejected: target.rejected, category: target.category }).eq('id', target.id)
    if (error) { store.schemaWarning = true; return }
  } else {
    const aliases = [...new Set([...ref.aliases, ref.name])].filter(a => fold(a) !== fold(n))
    ref.name = n; ref.aliases = aliases
    const { error } = await supabase.from('ingredient_refs')
      .update({ name: n, aliases }).eq('id', ref.id)
    if (error) { store.schemaWarning = true; return }
  }
  if (affected.length) {
    for (const it of affected) it.name = n
    await supabase.from('items').update({ name: n }).in('id', affected.map(i => i.id))
    const shopRows = store.shop.filter(s => affected.some(i => i.id === s.item_id))
    for (const s of shopRows) s.name = n
    if (shopRows.length) await supabase.from('shopping').update({ name: n }).in('id', shopRows.map(s => s.id))
  }
}

/** Recettes utilisant un ingrédient (alias compris), pour la fenêtre d'édition. */
export function recipesUsing(name) {
  const ids = new Set(store.ingredients.filter(i => sameIngredient(i.name, name)).map(i => i.recipe_id))
  return store.recipes.filter(r => ids.has(r.id)).toSorted((a, b) => a.title.localeCompare(b.title, 'fr'))
}

/* ----- Quantités de la semaine (cas N10, décisions Olivier 07/07/2026) -----
 * Besoin = quantité × convives ÷ « pour N personnes » (facteur 1 si l'un des
 * deux est inconnu), ajustable globalement en % et à la main ligne par ligne.
 * L'agrégation n'additionne que les unités convertibles entre elles (masse,
 * volume) ou identiques — jamais de conversion hasardeuse. */

const UNIT_BASE = { mg: ['g', 0.001], g: ['g', 1], kg: ['g', 1000], ml: ['ml', 1], cl: ['ml', 10], l: ['ml', 1000] }

function toBase(qty, unit) {
  const conv = UNIT_BASE[unit]
  return conv ? { qty: qty * conv[1], unit: conv[0] } : { qty, unit }
}

/** Quantité affichable : { qty, unit } en unité lisible (1500 g → 1,5 kg). */
export function displayPart(part) {
  let { qty, unit } = part
  if (unit === 'g' && qty >= 1000) { qty /= 1000; unit = 'kg' }
  if (unit === 'ml' && qty >= 1000) { qty /= 1000; unit = 'l' }
  return { qty: Math.round(qty * 100) / 100, unit }
}

export function formatQty(qty, unit) {
  const d = displayPart({ qty, unit })
  return String(d.qty).replace('.', ',') + (d.unit ? ' ' + d.unit : '')
}

/** Facteur d'échelle d'une recette pour un événement : convives ÷ « pour N » × ajustement %. */
export function eventScale(event, er) {
  const recipe = store.recipes.find(r => r.id === er.recipe_id)
  const base = recipe?.servings > 0 && event.guests > 0 ? event.guests / recipe.servings : 1
  return base * (er.scale_pct ?? 100) / 100
}

/** Ingrédients d'une recette pour un événement : à l'échelle, corrections à la main comprises. */
export function eventIngredients(event, er) {
  const scale = eventScale(event, er)
  return ingredientsOf(er.recipe_id).map(ing => {
    const override = er.qty_overrides?.[ing.name]
    return {
      ...ing,
      qty: override ?? (ing.qty != null ? Math.round(ing.qty * scale * 100) / 100 : null),
      overridden: override != null
    }
  })
}

/** Ajustement % d'une recette pour un événement donné uniquement. */
export async function setEventRecipeScale(er, pct) {
  er.scale_pct = Math.max(1, Math.round(Number(pct)) || 100)
  await supabase.from('event_recipes').update({ scale_pct: er.scale_pct })
    .eq('event_id', er.event_id).eq('recipe_id', er.recipe_id)
  await syncWeekShopping()
}

/** Quantité corrigée à la main pour un ingrédient d'une recette d'un événement (0 ou vide = retour au calcul). */
export async function setEventQtyOverride(er, name, qty) {
  const overrides = { ...(er.qty_overrides ?? {}) }
  if (Number(qty) > 0) overrides[name] = Number(qty)
  else delete overrides[name]
  er.qty_overrides = overrides
  await supabase.from('event_recipes').update({ qty_overrides: overrides })
    .eq('event_id', er.event_id).eq('recipe_id', er.recipe_id)
  await syncWeekShopping()
}

/**
 * Besoins de la semaine (événements d'aujourd'hui et à venir) : chaque
 * ingrédient est rapproché du stock et de la liste de courses via le
 * référentiel (nom replié ou alias confirmé). Une même recette servie à deux
 * événements compte deux fois ; l'échelle et les corrections se règlent
 * recette par recette dans l'événement. `parts` : quantités agrégées par
 * unité de base ; `entry` : la ligne de courses correspondante s'il y en a une.
 */
export function weekNeeds() {
  const today = new Date().toISOString().slice(0, 10)
  const needs = []
  for (const event of store.events.filter(e => e.day >= today)) {
    for (const er of store.eventRecipes.filter(x => x.event_id === event.id)) {
      for (const ing of eventIngredients(event, er)) {
        const key = fold(canonicalName(ing.name))
        let need = needs.find(n => n.key === key)
        if (!need) {
          const match = store.items.find(i => sameIngredient(i.name, ing.name) && i.qty > 0)
          const entry = store.shop.find(s => sameIngredient(s.name, ing.name))
          need = { key, name: ing.name, parts: [], count: 0, match: match ?? null, entry: entry ?? null }
          needs.push(need)
        }
        need.count += 1
        if (ing.qty != null) {
          const base = toBase(ing.qty, ing.unit)
          const part = need.parts.find(p => p.unit === base.unit)
          if (part) part.qty += base.qty
          else need.parts.push(base)
        }
      }
    }
  }
  return needs.toSorted((a, b) => a.name.localeCompare(b.name, 'fr'))
}

/**
 * Synchronise la liste de courses avec les repas à venir (décision Olivier
 * 07/07/2026) : chaque ingrédient manquant a sa ligne « semaine », créée,
 * requantifiée et retirée automatiquement à chaque changement de la semaine,
 * du stock ou d'une recette. Un besoin déjà couvert par une ligne de
 * réapprovisionnement n'est pas doublonné. Les lignes « je l'ai »
 * (available) restent mémorisées tant que le besoin existe.
 */
/* Postgres renvoie les colonnes numeric en texte (« 1.5 ») : toute
 * comparaison de quantités doit être numérique, sinon la synchro réécrit
 * les mêmes lignes en boucle (leçon du 07/07/2026 : liste qui clignote). */
function sameQty(a, b) {
  return (a == null && b == null) || Number(a) === Number(b)
}

/* Une seule synchronisation à la fois : les échos temps réel de nos propres
 * écritures relancent refresh() → syncShop() → ici ; sans verrou, deux
 * passages concurrents s'insèrent mutuellement des doublons. */
let weekSyncRunning = false
let weekSyncQueued = false

export async function syncWeekShopping() {
  if (!store.household || !store.recipesLoaded) return
  if (weekSyncRunning) { weekSyncQueued = true; return }
  weekSyncRunning = true
  try {
    const needs = weekNeeds().filter(n => !n.match)
    const covered = need => store.shop.some(s => s.origin !== 'semaine' && sameIngredient(s.name, need.name))
    for (const need of needs) {
      if (covered(need)) continue
      const part = need.parts.length === 1 ? need.parts[0] : null
      // toujours chercher dans l'état vivant : store.shop peut avoir été
      // remplacé par un refresh pendant les await précédents
      const row = store.shop.find(s => s.origin === 'semaine' && sameIngredient(s.name, need.name))
      if (!row) {
        const { data, error } = await supabase.from('shopping')
          .insert({ household_id: store.household.id, name: need.name, store: sourcingStore(need.name),
            origin: 'semaine', qty: part?.qty ?? null, unit: part?.unit ?? '' })
          .select().single()
        if (error) { store.schemaWarning = true; return }
        store.shop.push(data)
      } else if (!sameQty(row.qty, part?.qty ?? null) || row.unit !== (part?.unit ?? '')) {
        row.qty = part?.qty ?? null
        row.unit = part?.unit ?? ''
        await supabase.from('shopping').update({ qty: row.qty, unit: row.unit }).eq('id', row.id)
      }
    }
    // Retirer : plus de besoin, couvert par le réappro, ou doublon (on garde la première ligne).
    const gardees = new Set()
    const stale = store.shop.filter(row => {
      if (row.origin !== 'semaine') return false
      const need = needs.find(n => sameIngredient(row.name, n.name))
      if (!need || covered(need) || gardees.has(need.key)) return true
      gardees.add(need.key)
      return false
    })
    if (stale.length) {
      store.shop = store.shop.filter(s => !stale.includes(s))
      await supabase.from('shopping').delete().in('id', stale.map(s => s.id))
    }
  } finally {
    weekSyncRunning = false
  }
  if (weekSyncQueued) {
    weekSyncQueued = false
    await syncWeekShopping()
  }
}

/** Bascule « je l'ai déjà » ↔ « à acheter » sur un ingrédient de repas. */
export async function toggleAvailable(entry) {
  entry.available = !entry.available
  if (entry.available) entry.done = false
  await supabase.from('shopping').update({ available: entry.available, done: entry.done }).eq('id', entry.id)
}

/* ----- Semaine (cas N10 — incrément 1 : événements et recettes associées) ----- */

export async function addEvent(fields) {
  const { data, error } = await supabase.from('events')
    .insert({ ...fields, household_id: store.household.id })
    .select().single()
  if (error) { store.schemaWarning = true; return }
  store.events.push(data)
}

/** Modifie un événement (date, type, convives, contraintes) — passé ou futur. */
export async function updateEvent(event, fields) {
  Object.assign(event, fields)
  store.events = [...store.events]
  await supabase.from('events').update(fields).eq('id', event.id)
  await syncWeekShopping()
}

export async function removeEvent(event) {
  store.events = store.events.filter(e => e.id !== event.id)
  store.eventRecipes = store.eventRecipes.filter(er => er.event_id !== event.id)
  await supabase.from('events').delete().eq('id', event.id)
  await syncWeekShopping()
}

export async function attachRecipe(event, recipe) {
  if (store.eventRecipes.some(er => er.event_id === event.id && er.recipe_id === recipe.id)) return
  const { error } = await supabase.from('event_recipes')
    .insert({ household_id: store.household.id, event_id: event.id, recipe_id: recipe.id })
  if (error) { store.schemaWarning = true; return }
  store.eventRecipes.push({ household_id: store.household.id, event_id: event.id, recipe_id: recipe.id,
    scale_pct: 100, qty_overrides: {} })
  await syncWeekShopping()
}

export async function detachRecipe(event, recipe) {
  store.eventRecipes = store.eventRecipes.filter(er => !(er.event_id === event.id && er.recipe_id === recipe.id))
  await supabase.from('event_recipes').delete().eq('event_id', event.id).eq('recipe_id', recipe.id)
  await syncWeekShopping()
}

/** Dernière réalisation d'une recette : null = jamais, 'inconnue' = date non notée. */
export function lastMade(recipeId) {
  const reals = store.realisations.filter(r => r.recipe_id === recipeId)
  if (!reals.length) return null
  const dated = reals.map(r => r.made_on).filter(Boolean).sort()
  return dated.length ? dated[dated.length - 1] : 'inconnue'
}

export async function addRealisation(recipe, madeOn, comment) {
  const { data, error } = await supabase.from('realisations')
    .insert({ household_id: store.household.id, recipe_id: recipe.id, made_on: madeOn || null, comment: comment.trim() })
    .select().single()
  if (error) { store.schemaWarning = true; return }
  store.realisations.push(data)
  return data
}

/* ----- Photos de recettes (N8, étape 4 incrément 2) -----
 * Bucket privé « photos », chemin <foyer>/<recette>/<uuid>.jpg : la photo du
 * plat (liée à une réalisation si consignée avec) ou la page du livre
 * (copie privée, réservée au foyer). */

/** Réduit l'image côté client (max 1600 px, JPEG) avant l'envoi — utilisée
 * pour le stockage des photos ET pour l'extraction par IA locale (A3).
 * Hors navigateur (tests), le fichier part tel quel. */
export async function compressImage(file) {
  if (typeof createImageBitmap === 'undefined' || typeof OffscreenCanvas === 'undefined') return file
  const bmp = await createImageBitmap(file)
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const canvas = new OffscreenCanvas(Math.round(bmp.width * scale), Math.round(bmp.height * scale))
  canvas.getContext('2d').drawImage(bmp, 0, 0, canvas.width, canvas.height)
  return canvas.convertToBlob({ type: 'image/jpeg', quality: 0.82 })
}

export function photosOf(recipeId) {
  return store.photos.filter(p => p.recipe_id === recipeId)
}

export async function addRecipePhoto(recipe, file, kind, realisationId = null) {
  const hid = store.household.id
  const path = `${hid}/${recipe.id}/${crypto.randomUUID()}.jpg`
  const blob = await compressImage(file)
  const up = await supabase.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg' })
  if (up.error) { store.schemaWarning = true; return }
  const { data, error } = await supabase.from('recipe_photos')
    .insert({ household_id: hid, recipe_id: recipe.id, realisation_id: realisationId, kind, path })
    .select().single()
  if (error) { store.schemaWarning = true; return }
  store.photos.push(data)
  return data
}

const signedUrls = new Map()

/** URL signée pour afficher une photo du bucket privé (mémorisée 50 min). */
export async function photoUrl(photo) {
  const hit = signedUrls.get(photo.path)
  if (hit && hit.until > Date.now()) return hit.url
  const { data } = await supabase.storage.from('photos').createSignedUrl(photo.path, 3600)
  const url = data?.signedUrl ?? ''
  signedUrls.set(photo.path, { url, until: Date.now() + 50 * 60 * 1000 })
  return url
}

export async function deletePhoto(photo) {
  await supabase.storage.from('photos').remove([photo.path])
  await supabase.from('recipe_photos').delete().eq('id', photo.id)
  store.photos = store.photos.filter(p => p.id !== photo.id)
}

/** Amorce la bibliothèque avec les 105 recettes vidéo d'Alain Passard. */
export async function importPassard() {
  const { PASSARD_SOURCE, PASSARD_RECIPES } = await import('./passard.js')
  const hid = store.household.id
  // Garde-fou : ne jamais réimporter si la source existe déjà dans la base
  // (un onglet resté sur l'état « aucune recette » a déjà causé un double import).
  const { data: dejaLa } = await supabase.from('sources')
    .select('id').eq('household_id', hid).eq('title', PASSARD_SOURCE.title).limit(1)
  if (dejaLa?.length) return
  const { data: src, error } = await supabase.from('sources')
    .insert({ ...PASSARD_SOURCE, household_id: hid }).select().single()
  if (error || !src) { store.schemaWarning = true; return }
  const rows = PASSARD_RECIPES.map(r => ({
    household_id: hid, source_id: src.id, title: r.title, url: r.url, video: r.video
  }))
  const { data: created } = await supabase.from('recipes').insert(rows).select()
  if (!created) { store.schemaWarning = true; return }
  store.sources.push(src)
  store.recipes.push(...created)
  const done = PASSARD_RECIPES.filter(r => r.done)
    .map(r => created.find(c => c.video === r.video)).filter(Boolean)
  if (done.length) {
    const { data: reals } = await supabase.from('realisations')
      .insert(done.map(d => ({
        household_id: hid, recipe_id: d.id, made_on: null,
        comment: 'Déjà cuisinée (import Alain Passard, date non notée)'
      }))).select()
    if (reals) store.realisations.push(...reals)
  }
}

/**
 * Complète les recettes Passard (ingrédients + texte) depuis les fiches
 * extraites des articles Le Point. Idempotent : ne touche que les recettes
 * dont l'URL correspond et qui n'ont encore ni ingrédients ni texte.
 */
export async function fillPassardDetails() {
  const { PASSARD_FICHES } = await import('./passard-fiches.js')
  const byUrl = new Map(PASSARD_FICHES.map(f => [f.url, f]))
  let filled = 0
  for (const recipe of store.recipes) {
    const fiche = recipe.url && byUrl.get(recipe.url)
    if (!fiche) continue
    if (recipe.steps || ingredientsOf(recipe.id).length) continue
    await saveRecipeDetails(recipe, fiche.ingredients.join('\n'), fiche.steps)
    if (store.schemaWarning) return filled
    filled++
  }
  return filled
}

/** Nombre de recettes complétables par les fiches Passard. */
export function passardFillableCount(ficheUrls) {
  return store.recipes.filter(r =>
    r.url && ficheUrls.has(r.url) && !r.steps && !ingredientsOf(r.id).length).length
}

/* ----- Rangements (cas N6) -----
 * Déplacer un produit conserve quantité, magasin et état « à racheter ».
 * S'il existe déjà à destination (même nom), les pots se regroupent. */

export async function moveItem(item, destLoc) {
  const dest = destLoc.trim()
  if (!dest || dest === item.loc) return
  const target = store.items.find(i =>
    i.id !== item.id && i.loc === dest &&
    i.name.toLowerCase() === item.name.toLowerCase())
  if (target) {
    target.qty += item.qty
    await supabase.from('items').update({ qty: target.qty }).eq('id', target.id)
    store.items = store.items.filter(i => i.id !== item.id)
    store.shop = store.shop.filter(s => s.item_id !== item.id)
    await supabase.from('items').delete().eq('id', item.id)
  } else {
    item.loc = dest
    await supabase.from('items').update({ loc: dest }).eq('id', item.id)
  }
  await syncShop()
}

export async function moveItems(items, destLoc) {
  for (const item of [...items]) await moveItem(item, destLoc)
}

/** Renommer vers un nom libre = renommage ; vers un nom existant = fusion des emplacements. */
export async function renameLocation(oldName, newName) {
  const dest = newName.trim()
  if (!dest || dest === oldName) return
  await moveItems(store.items.filter(i => i.loc === oldName), dest)
  const src = store.locations.find(l => l.name === oldName)
  const dst = store.locations.find(l => l.name === dest)
  if (src && !dst) {
    src.name = dest
    await supabase.from('locations').update({ name: dest }).eq('id', src.id)
  } else if (src && dst) {
    store.locations = store.locations.filter(l => l !== src)
    await supabase.from('locations').delete().eq('id', src.id)
  }
}

/* ----- Emplacements datés (cas N7) -----
 * Un emplacement « à dates » (congélateur, cave…) suit chaque entrée comme un
 * lot : n produits identiques entrés à la même date. item.qty reste le total
 * (les autres écrans ne changent pas) ; les lots sont le détail des dates. */

export function isDatedLoc(name) {
  return !!store.locations.find(l => l.name === name && l.dated)
}

/** Marque un emplacement « à dates » (crée sa ligne si besoin). */
export async function setLocationDated(name, flag) {
  const hid = store.household.id
  const row = store.locations.find(l => l.name === name)
  if (row) {
    row.dated = flag
    await supabase.from('locations').update({ dated: flag }).eq('id', row.id)
    return
  }
  const { data, error } = await supabase.from('locations')
    .insert({ household_id: hid, name, dated: flag }).select().single()
  if (error) { store.schemaWarning = true; return }
  store.locations.push(data)
}

/** Seuil d'ancienneté (mois) d'un emplacement « à dates », pour le rappel des lots (N10). */
export async function setLocationStaleMonths(name, months) {
  const m = Math.max(1, Math.round(Number(months) || 6))
  const row = store.locations.find(l => l.name === name)
  if (!row) return
  row.stale_months = m
  const { error } = await supabase.from('locations').update({ stale_months: m }).eq('id', row.id)
  if (error) store.schemaWarning = true
}

/** Lots anciens à utiliser (N10) : lots des emplacements « à dates » entrés
 * il y a plus que le seuil de l'emplacement (stale_months, 6 mois par défaut). */
export function staleLots(today = new Date()) {
  const out = []
  for (const lot of store.lots) {
    const item = store.items.find(i => i.id === lot.item_id)
    if (!item) continue
    const loc = store.locations.find(l => l.name === item.loc)
    if (!loc?.dated) continue
    const limit = new Date(today)
    limit.setMonth(limit.getMonth() - (loc.stale_months ?? 6))
    if (new Date(lot.entered_on + 'T00:00') <= limit) out.push({ lot, item, loc: loc.name })
  }
  return out.toSorted((a, b) => a.lot.entered_on.localeCompare(b.lot.entered_on))
}

/** Les lots d'un produit, du plus ancien au plus récent (le premier est proposé en sortie). */
export function lotsOf(itemId) {
  return store.lots.filter(l => l.item_id === itemId)
    .toSorted((a, b) => a.entered_on < b.entered_on ? -1 : 1)
}

/** Quantité entrée avant le suivi par dates (total du produit moins les lots). */
export function undatedCount(item) {
  return Math.max(0, item.qty - lotsOf(item.id).reduce((n, l) => n + l.qty, 0))
}

/** Entrée : un lot de n produits à une date (défaut aujourd'hui), le total suit. */
export async function enterLot(item, qty, enteredOn) {
  const n = Math.max(1, Math.round(Number(qty) || 1))
  const { data, error } = await supabase.from('item_lots')
    .insert({ household_id: store.household.id, item_id: item.id, qty: n, entered_on: enteredOn })
    .select().single()
  if (error) { store.schemaWarning = true; return }
  store.lots.push(data)
  await changeQty(item, n)
}

/** Sortie : un produit du lot désigné (le plus ancien par défaut), le total suit. */
export async function takeLot(item, lot) {
  if (lot.qty <= 1) {
    store.lots = store.lots.filter(l => l.id !== lot.id)
    await supabase.from('item_lots').delete().eq('id', lot.id)
  } else {
    lot.qty -= 1
    await supabase.from('item_lots').update({ qty: lot.qty }).eq('id', lot.id)
  }
  await changeQty(item, -1)
}

/* ----- Mode inventaire (cas N2, NP6) -----
 * Rien n'est écrit au stock avant la confirmation finale : l'inventaire en
 * cours vit en mémoire et dans localStorage (interruption sans risque). */

const INV_KEY = 'gm-inventaire-v1'

function saveInv() {
  try {
    if (store.inv) localStorage.setItem(INV_KEY, JSON.stringify(store.inv))
    else localStorage.removeItem(INV_KEY)
  } catch { /* stockage indisponible : l'inventaire ne survivra pas à un rechargement */ }
}

export function resumeInventory() {
  try {
    const saved = JSON.parse(localStorage.getItem(INV_KEY))
    if (saved?.loc) store.inv = saved
  } catch { /* cache illisible : on repart sans inventaire en cours */ }
}

export function startInventory(loc) {
  store.inv = { loc, startedAt: new Date().toISOString(), seen: {}, created: [] }
  saveInv()
}

/** Déclare un produit trouvé : item existant de l'emplacement, ou nom libre (création). */
export function declare(target, n = 1) {
  const inv = store.inv
  if (typeof target === 'object') {
    inv.seen[target.id] = (inv.seen[target.id] ?? 0) + n
  } else {
    const name = target.trim()
    const existing = inv.created.find(c => c.name.toLowerCase() === name.toLowerCase())
    if (existing) existing.qty += n
    else inv.created.push({ name, qty: n })
  }
  saveInv()
}

export function adjustSeen(itemId, delta) {
  const inv = store.inv
  const next = (inv.seen[itemId] ?? 0) + delta
  if (next <= 0) delete inv.seen[itemId]
  else inv.seen[itemId] = next
  saveInv()
}

export function adjustCreated(name, delta) {
  const inv = store.inv
  const entry = inv.created.find(c => c.name === name)
  if (!entry) return
  entry.qty += delta
  if (entry.qty <= 0) inv.created = inv.created.filter(c => c !== entry)
  saveInv()
}

export function abandonInventory() {
  store.inv = null
  saveInv()
}

/** Emplacement « à dates » : ramène les lots d'un produit au total constaté,
 * en sortant du plus ancien d'abord (inventaire N2 × N7, décision Olivier 08/07).
 * Un total supérieur aux lots laisse l'excédent « sans date », à dater dans le détail. */
async function trimLotsTo(item, total) {
  let excess = lotsOf(item.id).reduce((n, l) => n + l.qty, 0) - total
  for (const lot of lotsOf(item.id)) {
    if (excess <= 0) break
    const take = Math.min(excess, lot.qty)
    if (take >= lot.qty) {
      store.lots = store.lots.filter(l => l.id !== lot.id)
      await supabase.from('item_lots').delete().eq('id', lot.id)
    } else {
      lot.qty -= take
      await supabase.from('item_lots').update({ qty: lot.qty }).eq('id', lot.id)
    }
    excess -= take
  }
}

/** Ajustements de lots qu'appliquerait l'inventaire (pour le bilan avant confirmation). */
export function lotAdjustments() {
  const inv = store.inv
  if (!inv || !isDatedLoc(inv.loc)) return []
  const out = []
  for (const item of store.items.filter(i => i.loc === inv.loc)) {
    const dated = lotsOf(item.id).reduce((n, l) => n + l.qty, 0)
    const count = inv.seen[item.id] ?? 0
    if (count < dated) out.push({ name: item.name, sortis: dated - count })
    else if (count > item.qty && count > dated) out.push({ name: item.name, sansDate: count - dated })
  }
  return out
}

/** Applique l'inventaire d'un bloc : vus, créés, non-trouvés à zéro, date d'inventaire. */
export async function finishInventory() {
  const inv = store.inv
  const hid = store.household.id
  const dated = isDatedLoc(inv.loc)
  for (const item of store.items.filter(i => i.loc === inv.loc)) {
    const count = inv.seen[item.id]
    if (count !== undefined) {
      if (item.qty !== count) {
        item.qty = count
        await supabase.from('items').update({ qty: count }).eq('id', item.id)
      }
      if (dated) await trimLotsTo(item, count)
    } else if (item.qty !== 0) {
      item.qty = 0
      await supabase.from('items').update({ qty: 0 }).eq('id', item.id)
      if (dated) await trimLotsTo(item, 0)
    }
  }
  for (const c of inv.created) {
    await addItem({ name: c.name, qty: c.qty, loc: inv.loc, store: '' })
  }
  // Réarmement NP1 : un ingrédient recompté au-dessus de son minimum redevient rachetable.
  for (const item of store.items.filter(i => i.loc === inv.loc)) {
    if (totalOf(item.name) >= minOf(item.name)) await setDismissed(item.name, false)
  }
  const stamp = new Date().toISOString()
  const { data } = await supabase.from('locations').select().eq('household_id', hid).eq('name', inv.loc)
  let dateSaved = false
  if (data?.[0]) {
    await supabase.from('locations').update({ last_inventory_at: stamp }).eq('id', data[0].id)
    const local = store.locations.find(l => l.id === data[0].id)
    if (local) local.last_inventory_at = stamp
    dateSaved = true
  } else {
    const { data: created } = await supabase.from('locations')
      .insert({ household_id: hid, name: inv.loc, last_inventory_at: stamp })
      .select().single()
    if (created) { store.locations.push(created); dateSaved = true }
  }
  store.schemaWarning = !dateSaved
  store.inv = null
  saveInv()
  await syncShop()
}
