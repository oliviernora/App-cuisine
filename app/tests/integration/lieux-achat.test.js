/**
 * Tests des lieux d'achat (N3 point 4, commentaires 3 d'Olivier, 27/07/2026) :
 * CRUD, renommage qui suit partout, reprise des lieux en texte libre,
 * ingrédients achetables par lieu.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, addShopEntry, addLieu, updateLieu, renameLieu, removeLieu,
  lieuxNonRepris, reprendreLieux, lieuIngredients, setEntryStore,
  setIngredientCategory, setCategorySourcing, addCategory
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
  store.refs = []
  store.categories = []
  store.lieux = []
  store.ingredients = []
})

describe('N3.4 — je gère mes lieux d\'achat', () => {
  test('créer un lieu (physique ou Internet), le compléter', async () => {
    await addLieu('Marché de Revel')
    await addLieu('Épices du monde', 'internet')
    expect(store.lieux).toHaveLength(2)
    expect(tables.stores).toHaveLength(2)

    const site = store.lieux.find(l => l.name === 'Épices du monde')
    await updateLieu(site, { url: 'https://epicesdumonde.fr', comment: 'livraison 48 h' })
    expect(tables.stores.find(r => r.id === site.id).url).toBe('https://epicesdumonde.fr')
  })

  test('un nom déjà pris (casse et accents ignorés) n\'est pas recréé', async () => {
    await addLieu('Marché de Revel')
    await addLieu('marche de revel')
    expect(store.lieux).toHaveLength(1)
  })

  test('renommer un lieu suit partout : courses, stock, sourcing', async () => {
    await addLieu('Leclerc')
    const lieu = store.lieux[0]
    await addItem({ name: 'Cumin', qty: 0, loc: 'Cuisine', store: '' })
    await setEntryStore(store.shop[0], 'Leclerc')
    await addCategory('Épices')
    await setCategorySourcing('Épices', 'boutique', 'Leclerc')

    await renameLieu(lieu, 'Leclerc Revel')

    expect(lieu.name).toBe('Leclerc Revel')
    expect(store.shop[0].store).toBe('Leclerc Revel')
    expect(store.items[0].store).toBe('Leclerc Revel')
    expect(store.categories[0].sourcing_note).toBe('Leclerc Revel')
    expect(tables.shopping[0].store).toBe('Leclerc Revel')
  })

  test('supprimer un lieu : les lignes repartent dans « Autre »', async () => {
    await addLieu('Grand Frais')
    await addItem({ name: 'Beurre', qty: 0, loc: 'Frigo', store: '' })
    await setEntryStore(store.shop[0], 'Grand Frais')

    await removeLieu(store.lieux[0])

    expect(store.lieux).toHaveLength(0)
    expect(tables.stores).toHaveLength(0)
    expect(store.shop[0].store).toBe('')
    expect(store.items[0].store).toBe('')
  })

  test('reprise des lieux déjà utilisés en texte libre', async () => {
    await addItem({ name: 'Cumin', qty: 0, loc: 'Cuisine', store: '' })
    await setEntryStore(store.shop[0], 'Marché de Revel')
    await addShopEntry('Saumon entier', 'Grand Frais')
    await addLieu('Grand Frais') // celui-là est déjà géré

    expect(lieuxNonRepris()).toEqual(['Marché de Revel'])
    await reprendreLieux()
    expect(store.lieux.map(l => l.name).toSorted()).toEqual(['Grand Frais', 'Marché de Revel'])
    expect(lieuxNonRepris()).toEqual([])
  })

  test('ingrédients achetables sur un lieu : magasin mémorisé et sourcing', async () => {
    await addLieu('Marché de Revel')
    await addItem({ name: 'Carottes', qty: 2, loc: 'Cuisine', store: 'Marché de Revel' })
    await addItem({ name: 'Beurre', qty: 1, loc: 'Frigo', store: 'Grand Frais' })
    // sourcing par le genre : les épices s'achètent au marché de Revel
    await addItem({ name: 'Cumin', qty: 1, loc: 'Cuisine', store: '' })
    await addCategory('Épices')
    await setCategorySourcing('Épices', 'marché', 'Marché de Revel')
    await setIngredientCategory('Cumin', 'Épices')

    const achetables = lieuIngredients('Marché de Revel')
    expect(achetables).toContain('Carottes')
    expect(achetables).toContain('Cumin')
    expect(achetables).not.toContain('Beurre')
  })
})
