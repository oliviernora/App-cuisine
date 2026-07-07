import { supabase } from './supabase.js'
import { seedRows } from './seed.js'

export const store = $state({
  ready: false,
  session: null,
  household: null,
  items: [],
  shop: [],
  locations: [],
  sources: [],
  recipes: [],
  realisations: [],
  events: [],
  eventRecipes: [],
  ingredients: [],
  refs: [],
  inv: null,
  schemaWarning: false,
  online: typeof navigator === 'undefined' ? true : navigator.onLine
})

let channel = null
let refreshTimer = null

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
  clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => refresh().then(syncShop), 300)
}

async function refresh() {
  const hid = store.household.id
  const [i, s, l] = await Promise.all([
    supabase.from('items').select().eq('household_id', hid).order('created_at'),
    supabase.from('shopping').select().eq('household_id', hid).order('created_at'),
    supabase.from('locations').select().eq('household_id', hid)
  ])
  if (i.data) store.items = i.data
  if (s.data) store.shop = s.data
  if (l.data) store.locations = l.data
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

/**
 * Garde la liste de courses alignée sur le stock : 0 pot restant = entrée
 * automatique — sauf si l'utilisateur l'a retirée du panier (`dismissed`,
 * décision NP1) ; le réarmement se fait quand le stock remonte.
 */
export async function syncShop() {
  const inserts = []
  for (const it of store.items) {
    const entry = store.shop.find(s => s.item_id === it.id)
    if (it.qty <= it.min && !entry && !it.dismissed) {
      inserts.push({ household_id: store.household.id, item_id: it.id, name: it.name, store: it.store || '', manual: false })
    } else if (it.qty > it.min && entry && !entry.done && !entry.manual) {
      store.shop = store.shop.filter(s => s !== entry)
      await supabase.from('shopping').delete().eq('id', entry.id)
    }
  }
  if (inserts.length) {
    const { data } = await supabase.from('shopping').insert(inserts).select()
    if (data) store.shop.push(...data)
  }
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
  const changes = { qty: item.qty }
  if (item.qty > item.min && item.dismissed) {
    item.dismissed = false
    changes.dismissed = false
  }
  await supabase.from('items').update(changes).eq('id', item.id)
  await syncShop()
}

export async function removeItem(item) {
  store.items = store.items.filter(i => i.id !== item.id)
  store.shop = store.shop.filter(s => s.item_id !== item.id)
  await supabase.from('items').delete().eq('id', item.id)
}

/** Le panier bascule la présence en liste : ajout (réserve ou manquant) ou retrait. */
export async function toggleOrder(item) {
  const entry = store.shop.find(s => s.item_id === item.id)
  if (!entry) {
    if (item.dismissed) {
      item.dismissed = false
      await supabase.from('items').update({ dismissed: false }).eq('id', item.id)
    }
    const { data, error } = await supabase
      .from('shopping')
      .insert({ household_id: store.household.id, item_id: item.id, name: item.name, store: item.store || '', manual: item.qty > item.min })
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
    if (item && item.qty <= item.min && !item.dismissed) {
      item.dismissed = true
      await supabase.from('items').update({ dismissed: true }).eq('id', item.id)
    }
  }
}

/** Chaque ligne cochée ajoute un pot au stock lié, puis sort de la liste. */
export async function clearDone() {
  const done = store.shop.filter(s => s.done)
  for (const entry of done) {
    const item = store.items.find(i => i.id === entry.item_id)
    if (item) {
      item.qty += 1
      await supabase.from('items').update({ qty: item.qty }).eq('id', item.id)
    }
  }
  store.shop = store.shop.filter(s => !s.done)
  if (done.length) await supabase.from('shopping').delete().in('id', done.map(d => d.id))
  await syncShop()
}

export async function signOut() {
  await supabase.auth.signOut()
}

/* ----- Recettes (cas N8, N9 — incrément 1) -----
 * Pas de synchronisation temps réel pour l'instant : chargées au démarrage
 * et tenues à jour localement après chaque action. */

async function loadRecipes() {
  const hid = store.household.id
  const [s, r, re, ev, er, ing, rf] = await Promise.all([
    supabase.from('sources').select().eq('household_id', hid),
    supabase.from('recipes').select().eq('household_id', hid),
    supabase.from('realisations').select().eq('household_id', hid),
    supabase.from('events').select().eq('household_id', hid),
    supabase.from('event_recipes').select().eq('household_id', hid),
    supabase.from('recipe_ingredients').select().eq('household_id', hid),
    supabase.from('ingredient_refs').select().eq('household_id', hid)
  ])
  if (s.error || r.error || re.error || ev.error || er.error || ing.error || rf.error) { store.schemaWarning = true; return }
  store.sources = s.data
  store.recipes = r.data
  store.realisations = re.data
  store.events = ev.data
  store.eventRecipes = er.data
  store.ingredients = ing.data
  store.refs = rf.data
}

const UNITS = ['cuillères à soupe', 'cuillère à soupe', 'cuillères à café', 'cuillère à café',
  'c. à s.', 'c. à c.', 'pincées', 'pincée', 'gousses', 'gousse', 'bottes', 'botte',
  'tranches', 'tranche', 'pièces', 'pièce', 'brins', 'brin', 'feuilles', 'feuille',
  'kg', 'mg', 'g', 'cl', 'ml', 'l', 'cs', 'cc']

/** « 500 g d'asperges vertes » → { qty: 500, unit: 'g', name: 'asperges vertes' }. */
export function parseIngredientLine(line) {
  let rest = line.trim().replace(/\s+/g, ' ')
  if (!rest) return null
  let qty = null
  const m = rest.match(/^(\d+(?:[.,]\d+)?)\s*/)
  if (m) { qty = Number(m[1].replace(',', '.')); rest = rest.slice(m[0].length) }
  let unit = ''
  const lower = rest.toLowerCase()
  for (const u of UNITS) {
    if (lower === u || lower.startsWith(u + ' ')) { unit = u; rest = rest.slice(u.length).trim(); break }
  }
  rest = rest.replace(/^d(?:e |')\s*/i, '').trim()
  if (!rest) return null
  return { qty, unit, name: rest }
}

/** Remplace les ingrédients (un par ligne), le texte de la recette et « pour N personnes ». */
export async function saveRecipeDetails(recipe, ingredientsText, steps, servings = recipe.servings ?? null) {
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
  await supabase.from('recipes').update({ steps, servings }).eq('id', recipe.id)
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
  ref[field] = [...ref[field], other]
  const { error } = await supabase.from('ingredient_refs')
    .update({ [field]: ref[field] }).eq('id', ref.id)
  if (error) store.schemaWarning = true
}

export const confirmMerge = (a, b) => answerMerge(a, b, 'aliases')
export const rejectMerge = (a, b) => answerMerge(a, b, 'rejected')

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

/**
 * Besoins de la semaine (événements d'aujourd'hui et à venir) : chaque
 * ingrédient est rapproché du stock et de la liste de courses via le
 * référentiel (nom replié ou alias confirmé). Une même recette servie à deux
 * événements compte deux fois. `parts` : quantités agrégées par unité de
 * base ; `count` : nombre d'occurrences (utile quand aucune quantité).
 */
export function weekNeeds(scalePct = 100) {
  const today = new Date().toISOString().slice(0, 10)
  const upcoming = store.events.filter(e => e.day >= today)
  const needs = []
  for (const event of upcoming) {
    for (const er of store.eventRecipes.filter(er => er.event_id === event.id)) {
      const recipe = store.recipes.find(r => r.id === er.recipe_id)
      const scale = (recipe?.servings > 0 && event.guests > 0 ? event.guests / recipe.servings : 1) * scalePct / 100
      for (const ing of store.ingredients.filter(i => i.recipe_id === er.recipe_id)) {
        const key = fold(canonicalName(ing.name))
        let need = needs.find(n => n.key === key)
        if (!need) {
          const match = store.items.find(i => sameIngredient(i.name, ing.name) && i.qty > 0)
          const inShopping = store.shop.some(s => sameIngredient(s.name, ing.name))
          need = { key, name: ing.name, parts: [], count: 0, match: match ?? null, inShopping }
          needs.push(need)
        }
        need.count += 1
        if (ing.qty != null) {
          const base = toBase(ing.qty * scale, ing.unit)
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
 * Ajoute aux courses les besoins ni en stock ni déjà en liste, avec leur
 * quantité (celle corrigée à la main si fournie, sinon la quantité calculée
 * quand elle tient en une seule unité).
 */
export async function addWeekMissing(scalePct = 100, overrides = {}) {
  const missing = weekNeeds(scalePct).filter(n => !n.match && !n.inShopping)
  for (const need of missing) {
    const over = overrides[need.key]
    const part = !over && need.parts.length === 1 ? need.parts[0] : over
    await addShopEntry(need.name, '', part?.qty ?? null, part?.unit ?? '')
  }
  return missing.length
}

/* ----- Semaine (cas N10 — incrément 1 : événements et recettes associées) ----- */

export async function addEvent(fields) {
  const { data, error } = await supabase.from('events')
    .insert({ ...fields, household_id: store.household.id })
    .select().single()
  if (error) { store.schemaWarning = true; return }
  store.events.push(data)
}

export async function removeEvent(event) {
  store.events = store.events.filter(e => e.id !== event.id)
  store.eventRecipes = store.eventRecipes.filter(er => er.event_id !== event.id)
  await supabase.from('events').delete().eq('id', event.id)
}

export async function attachRecipe(event, recipe) {
  if (store.eventRecipes.some(er => er.event_id === event.id && er.recipe_id === recipe.id)) return
  const { error } = await supabase.from('event_recipes')
    .insert({ household_id: store.household.id, event_id: event.id, recipe_id: recipe.id })
  if (error) { store.schemaWarning = true; return }
  store.eventRecipes.push({ household_id: store.household.id, event_id: event.id, recipe_id: recipe.id })
}

export async function detachRecipe(event, recipe) {
  store.eventRecipes = store.eventRecipes.filter(er => !(er.event_id === event.id && er.recipe_id === recipe.id))
  await supabase.from('event_recipes').delete().eq('event_id', event.id).eq('recipe_id', recipe.id)
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
    if (target.qty > target.min && target.dismissed) target.dismissed = false
    await supabase.from('items')
      .update({ qty: target.qty, dismissed: target.dismissed }).eq('id', target.id)
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

/** Applique l'inventaire d'un bloc : vus, créés, non-trouvés à zéro, date d'inventaire. */
export async function finishInventory() {
  const inv = store.inv
  const hid = store.household.id
  for (const item of store.items.filter(i => i.loc === inv.loc)) {
    const count = inv.seen[item.id]
    if (count !== undefined) {
      if (item.qty !== count || item.dismissed) {
        item.qty = count
        item.dismissed = false
        await supabase.from('items').update({ qty: count, dismissed: false }).eq('id', item.id)
      }
    } else if (item.qty !== 0) {
      item.qty = 0
      await supabase.from('items').update({ qty: 0 }).eq('id', item.id)
    }
  }
  for (const c of inv.created) {
    await addItem({ name: c.name, qty: c.qty, min: 0, loc: inv.loc, store: '' })
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
