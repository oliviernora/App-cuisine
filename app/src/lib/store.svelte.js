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

export async function addShopEntry(name, storeName) {
  const { data, error } = await supabase
    .from('shopping')
    .insert({ household_id: store.household.id, name, store: storeName })
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
  const [s, r, re] = await Promise.all([
    supabase.from('sources').select().eq('household_id', hid),
    supabase.from('recipes').select().eq('household_id', hid),
    supabase.from('realisations').select().eq('household_id', hid)
  ])
  if (s.error || r.error || re.error) { store.schemaWarning = true; return }
  store.sources = s.data
  store.recipes = r.data
  store.realisations = re.data
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
