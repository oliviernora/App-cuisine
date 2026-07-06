/**
 * Tests d'intégration stock <-> courses, dérivés de docs/cas-utilisation.md.
 * Chaque test porte le numéro du cas d'utilisation qu'il rejoue.
 */
import { vi, describe, test, expect, beforeEach } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, changeQty, toggleOrder, setDone, clearDone, removeShopEntry, syncShop
} from '../../src/lib/store.svelte.js'

beforeEach(() => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []
  store.shop = []
})

async function seed(name, qty, extra = {}) {
  await addItem({ name, qty, min: 0, loc: 'Cuisine', store: '', ...extra })
  return store.items.find(i => i.name === name)
}

function entryFor(item) {
  return store.shop.find(s => s.item_id === item.id)
}

describe('N1 — je cuisine, j\'épuise un ingrédient, il revient tout seul', () => {
  test('finir le dernier pot met le produit en courses (auto)', async () => {
    const cumin = await seed('Cumin', 1)
    expect(store.shop).toHaveLength(0)

    await changeQty(cumin, -1)

    expect(cumin.qty).toBe(0)
    const entry = entryFor(cumin)
    expect(entry).toBeDefined()
    expect(entry.manual).toBe(false)
    expect(tables.shopping).toHaveLength(1)
  })

  test('acheter puis ranger remet le stock et vide la liste', async () => {
    const cumin = await seed('Cumin', 0)
    const entry = entryFor(cumin)
    expect(entry).toBeDefined()

    await setDone(entry, true)
    await clearDone()

    expect(cumin.qty).toBe(1)
    expect(store.shop).toHaveLength(0)
    expect(tables.shopping).toHaveLength(0)
    expect(tables.items.find(r => r.id === cumin.id).qty).toBe(1)
  })

  test('remonter le stock à la main retire l\'entrée automatique', async () => {
    const beurre = await seed('Beurre', 0)
    expect(entryFor(beurre)).toBeDefined()

    await changeQty(beurre, 1)

    expect(entryFor(beurre)).toBeUndefined()
    expect(tables.shopping).toHaveLength(0)
  })
})

describe('N3 — je constitue une réserve d\'un produit précieux', () => {
  test('commander un produit non épuisé le met en courses (réserve)', async () => {
    const safran = await seed('Safran', 1)

    await toggleOrder(safran)

    const entry = entryFor(safran)
    expect(entry).toBeDefined()
    expect(entry.manual).toBe(true)
    expect(safran.qty).toBe(1)
  })

  test('acheter la réserve porte le stock à deux pots', async () => {
    const safran = await seed('Safran', 1)
    await toggleOrder(safran)

    await setDone(entryFor(safran), true)
    await clearDone()

    expect(safran.qty).toBe(2)
    expect(store.shop).toHaveLength(0)
  })

  test('un second appui annule une commande de réserve non cochée', async () => {
    const safran = await seed('Safran', 1)
    await toggleOrder(safran)
    expect(entryFor(safran)).toBeDefined()

    await toggleOrder(safran)

    expect(entryFor(safran)).toBeUndefined()
    expect(tables.shopping).toHaveLength(0)
  })
})

describe('NP2 — le produit est introuvable (rupture en magasin)', () => {
  test('une ligne non cochée survit au rangement des achats', async () => {
    const poivre = await seed('Poivre de Malabar', 0)
    const cumin = await seed('Cumin', 0)

    await setDone(entryFor(cumin), true)
    await clearDone()

    expect(cumin.qty).toBe(1)
    expect(store.shop).toHaveLength(1)
    const restant = entryFor(poivre)
    expect(restant.done).toBe(false)
    expect(poivre.qty).toBe(0)
  })
})

describe('NP3 — j\'ai coché par erreur', () => {
  test('décocher ne change rien d\'autre, ni en liste ni au stock', async () => {
    const item = await seed('Curcuma', 0)
    const entry = entryFor(item)

    await setDone(entry, true)
    await setDone(entry, false)

    expect(item.qty).toBe(0)
    expect(entry.done).toBe(false)
    expect(tables.shopping).toHaveLength(1)
    expect(store.shop).toHaveLength(1)
  })
})

describe('NP1 — retirer du panier un produit épuisé (décision Olivier du 06/07/2026)', () => {
  test('la suppression tient : le produit devient « manquant », pas de retour auto', async () => {
    const cumin = await seed('Cumin', 0)
    const entry = entryFor(cumin)
    expect(entry).toBeDefined()

    await removeShopEntry(entry)
    await syncShop()

    expect(entryFor(cumin)).toBeUndefined()
    expect(tables.shopping).toHaveLength(0)
    expect(cumin.dismissed).toBe(true)
    expect(tables.items.find(r => r.id === cumin.id).dismissed).toBe(true)
  })

  test('le panier remet un produit « manquant » en liste', async () => {
    const cumin = await seed('Cumin', 0)
    await removeShopEntry(entryFor(cumin))

    await toggleOrder(cumin)

    const entry = entryFor(cumin)
    expect(entry).toBeDefined()
    expect(entry.manual).toBe(false)
    expect(cumin.dismissed).toBe(false)
  })

  test('le retour automatique se réarme quand le stock remonte puis s\'épuise', async () => {
    const cumin = await seed('Cumin', 0)
    await removeShopEntry(entryFor(cumin))

    await changeQty(cumin, 1)
    expect(cumin.dismissed).toBe(false)

    await changeQty(cumin, -1)
    expect(entryFor(cumin)).toBeDefined()
  })

  test('le panier retire aussi une entrée automatique non cochée', async () => {
    const cumin = await seed('Cumin', 0)
    expect(entryFor(cumin)).toBeDefined()

    await toggleOrder(cumin)

    expect(entryFor(cumin)).toBeUndefined()
    expect(cumin.dismissed).toBe(true)
  })
})

test.todo('NP4 — j\'ai acheté plusieurs pots d\'un coup (amélioration décidée : à spécifier)')
