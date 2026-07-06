/**
 * Tests du cas N6 — je réorganise mes rangements et j'y déplace mes produits.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, moveItem, moveItems, renameLocation
} from '../../src/lib/store.svelte.js'

beforeEach(() => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []
  store.shop = []
  store.locations = []
})

async function seed(name, qty, loc = 'Cuisine', extra = {}) {
  await addItem({ name, qty, min: 0, loc, store: '', ...extra })
  return store.items.find(i => i.name === name && i.loc === loc)
}

describe('N6 — déplacer un produit', () => {
  test('vers un emplacement où il n\'existe pas : tout est conservé, seule la localisation change', async () => {
    const safran = await seed('Safran', 2, 'Cuisine', { store: 'Boutique spécialisée' })

    await moveItem(safran, 'Réserve entrée')

    expect(safran.loc).toBe('Réserve entrée')
    expect(safran.qty).toBe(2)
    expect(safran.store).toBe('Boutique spécialisée')
    expect(tables.items.find(r => r.id === safran.id).loc).toBe('Réserve entrée')
  })

  test('un produit épuisé déplacé garde son état « à racheter » (l\'entrée de courses suit)', async () => {
    const cumin = await seed('Cumin', 0)
    const entry = store.shop.find(s => s.item_id === cumin.id)
    expect(entry).toBeDefined()

    await moveItem(cumin, 'Réserve entrée')

    expect(cumin.loc).toBe('Réserve entrée')
    expect(store.shop.find(s => s.item_id === cumin.id)).toBeDefined()
    expect(tables.shopping).toHaveLength(1)
  })

  test('vers un emplacement où il existe déjà : les pots se regroupent en une seule ligne', async () => {
    const source = await seed('Safran', 2, 'Cuisine')
    const target = await seed('Safran', 1, 'Réserve entrée')

    await moveItem(source, 'Réserve entrée')

    expect(target.qty).toBe(3)
    const lignes = store.items.filter(i => i.name === 'Safran')
    expect(lignes).toHaveLength(1)
    expect(tables.items.filter(r => r.name === 'Safran')).toHaveLength(1)
  })

  test('le regroupement sur un produit épuisé retire son entrée automatique de courses', async () => {
    const target = await seed('Cumin', 0, 'Réserve entrée')
    expect(store.shop.find(s => s.item_id === target.id)).toBeDefined()
    const source = await seed('Cumin', 2, 'Cuisine')

    await moveItem(source, 'Réserve entrée')

    expect(target.qty).toBe(2)
    expect(store.shop).toHaveLength(0)
    expect(tables.shopping).toHaveLength(0)
  })

  test('en lot : plusieurs produits cochés partent ensemble', async () => {
    const a = await seed('Basilic', 1)
    const b = await seed('Thym', 1)
    await seed('Romarin', 1)

    await moveItems([a, b], 'Placard')

    expect(a.loc).toBe('Placard')
    expect(b.loc).toBe('Placard')
    expect(store.items.find(i => i.name === 'Romarin').loc).toBe('Cuisine')
  })
})

describe('N6 — renommer et fusionner des emplacements', () => {
  test('renommer : tous les produits suivent, la date d\'inventaire aussi', async () => {
    await seed('Basilic', 1, 'Boîte A')
    await seed('Thym', 1, 'Boîte A')
    const locRow = { id: 'loc-1', household_id: 'h-test', name: 'Boîte A', last_inventory_at: 'T1' }
    tables.locations.push(locRow)
    store.locations = [locRow]

    await renameLocation('Boîte A', 'Grande boîte')

    expect(store.items.every(i => i.loc === 'Grande boîte')).toBe(true)
    expect(store.locations[0].name).toBe('Grande boîte')
    expect(tables.locations[0].name).toBe('Grande boîte')
    expect(tables.locations[0].last_inventory_at).toBe('T1')
  })

  test('fusionner (renommer vers un nom existant) : produits réunis, doublons regroupés, une seule ligne d\'emplacement', async () => {
    await seed('Basilic', 1, 'Boîte A')
    await seed('Cumin', 2, 'Boîte A')
    const cuminB = await seed('Cumin', 1, 'Boîte B')
    const rowA = { id: 'loc-a', household_id: 'h-test', name: 'Boîte A', last_inventory_at: 'T1' }
    const rowB = { id: 'loc-b', household_id: 'h-test', name: 'Boîte B', last_inventory_at: 'T2' }
    tables.locations.push(rowA, rowB)
    store.locations = [rowA, rowB]

    await renameLocation('Boîte A', 'Boîte B')

    expect(store.items.every(i => i.loc === 'Boîte B')).toBe(true)
    expect(cuminB.qty).toBe(3)
    expect(store.items.filter(i => i.name === 'Cumin')).toHaveLength(1)
    expect(tables.locations).toHaveLength(1)
    expect(tables.locations[0].name).toBe('Boîte B')
  })
})
