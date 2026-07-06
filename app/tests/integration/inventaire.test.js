/**
 * Tests du mode inventaire (cas N2, dicté par Olivier, et NP6).
 * Règle clé : rien n'est écrit au stock avant la confirmation finale.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, declare, adjustSeen, startInventory, finishInventory,
  abandonInventory, resumeInventory
} from '../../src/lib/store.svelte.js'

const mem = new Map()
globalThis.localStorage = {
  getItem: k => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: k => mem.delete(k)
}

beforeEach(() => {
  mem.clear()
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []
  store.shop = []
  store.inv = null
})

async function seed(name, qty, loc = 'Cuisine') {
  await addItem({ name, qty, min: 0, loc, store: '' })
  return store.items.find(i => i.name === name && i.loc === loc)
}

describe('N2 — mode inventaire', () => {
  test('déroulé complet : vus, cumul, création, non-trouvés à zéro, date, courses', async () => {
    const cumin = await seed('Cumin', 1)
    const safran = await seed('Safran', 1)
    const curcuma = await seed('Curcuma', 2)
    const ailleurs = await seed('Poivre', 1, 'Cave')

    startInventory('Cuisine')
    declare(cumin, 1)
    declare(cumin, 1)            // déjà vu -> cumul
    declare(safran, 3)           // avec le nombre
    declare('Sumac', 2)          // inconnu -> création
    // curcuma jamais déclaré -> non trouvé

    // avant la confirmation, rien n'a bougé au stock
    expect(tables.items.find(r => r.id === curcuma.id).qty).toBe(2)

    await finishInventory()

    expect(cumin.qty).toBe(2)
    expect(safran.qty).toBe(3)
    expect(curcuma.qty).toBe(0)
    expect(ailleurs.qty).toBe(1) // l'inventaire ne touche que son emplacement
    const sumac = store.items.find(i => i.name === 'Sumac')
    expect(sumac.qty).toBe(2)
    expect(sumac.loc).toBe('Cuisine')
    // le non-trouvé part en courses automatiques
    expect(store.shop.some(s => s.item_id === curcuma.id)).toBe(true)
    // la date de dernier inventaire est posée
    const locRow = tables.locations.find(l => l.name === 'Cuisine')
    expect(locRow.last_inventory_at).toBeTruthy()
    expect(store.locations.find(l => l.name === 'Cuisine')?.last_inventory_at).toBeTruthy()
    expect(store.schemaWarning).toBe(false)
    expect(store.inv).toBeNull()
  })

  test('correction d\'erreur : redescendre un vu à zéro le remet à vérifier', async () => {
    const cumin = await seed('Cumin', 1)
    startInventory('Cuisine')
    declare(cumin, 2)
    adjustSeen(cumin.id, -1)
    expect(store.inv.seen[cumin.id]).toBe(1)
    adjustSeen(cumin.id, -1)
    expect(store.inv.seen[cumin.id]).toBeUndefined()
  })

  test('un produit vu épuisé retrouve son retour automatique (dismissed remis à zéro)', async () => {
    const cumin = await seed('Cumin', 0)
    const entry = store.shop.find(s => s.item_id === cumin.id)
    cumin.dismissed = true // retiré du panier avant l'inventaire
    store.shop = []
    tables.shopping.length = 0

    startInventory('Cuisine')
    declare(cumin, 2)
    await finishInventory()

    expect(cumin.qty).toBe(2)
    expect(cumin.dismissed).toBe(false)
  })
})

describe('NP6 — interruption et abandon', () => {
  test('l\'inventaire interrompu se retrouve au retour (localStorage)', async () => {
    const cumin = await seed('Cumin', 1)
    startInventory('Cuisine')
    declare(cumin, 2)

    store.inv = null // « je pose le téléphone » (perte de l'état mémoire)
    resumeInventory()

    expect(store.inv.loc).toBe('Cuisine')
    expect(store.inv.seen[cumin.id]).toBe(2)
  })

  test('abandonner ne laisse aucune écriture : le stock est intact', async () => {
    const cumin = await seed('Cumin', 5)
    startInventory('Cuisine')
    declare(cumin, 1)
    declare('Sumac', 3)

    abandonInventory()

    expect(store.inv).toBeNull()
    expect(tables.items.find(r => r.id === cumin.id).qty).toBe(5)
    expect(store.items.some(i => i.name === 'Sumac')).toBe(false)
    expect(tables.locations).toHaveLength(0)
    resumeInventory()
    expect(store.inv).toBeNull()
  })
})
