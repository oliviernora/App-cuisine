/**
 * Tests des résidences (lot 5, décision Q6 d'Olivier du 16/07/2026) :
 * chaque résidence a ses stocks, courses, emplacements et sa semaine ;
 * la bascule recharge les données de la maison choisie.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, addEvent, addResidence, switchResidence,
  startInventory, abandonInventory, invIsHere
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
  store.locations = []
  store.lots = []
  store.events = []
  store.eventRecipes = []
  store.sources = []
  store.recipes = []
  store.ingredients = []
  store.realisations = []
  store.photos = []
  store.recipesLoaded = false
  store.residences = []
  store.residence = null
  store.inv = null
})

async function deuxResidences() {
  await addResidence('Argenteuil')
  await addResidence('Montalivet')
  store.residence = store.residences[0]
  return store.residences
}

describe('Résidences (Q6) — chaque maison a ses stocks, courses et sa semaine', () => {
  test('les écritures portent la résidence courante', async () => {
    const [argenteuil] = await deuxResidences()

    await addItem({ name: 'Cumin', qty: 0, loc: 'Cuisine', store: '' })

    expect(tables.items[0].residence_id).toBe(argenteuil.id)
    // la ligne de courses automatique aussi
    expect(tables.shopping[0].residence_id).toBe(argenteuil.id)
  })

  test('changer de résidence isole le stock et les courses', async () => {
    const [argenteuil, montalivet] = await deuxResidences()
    await addItem({ name: 'Cumin', qty: 0, loc: 'Cuisine', store: '' })
    expect(store.items).toHaveLength(1)
    expect(store.shop).toHaveLength(1)

    await switchResidence(montalivet.id)

    expect(store.residence.id).toBe(montalivet.id)
    expect(store.items).toHaveLength(0)
    expect(store.shop).toHaveLength(0)
    // rien n'a été perdu : les données d'Argenteuil reviennent avec elle
    await switchResidence(argenteuil.id)
    expect(store.items).toHaveLength(1)
    expect(store.shop).toHaveLength(1)
  })

  test('la semaine (événements) est par résidence', async () => {
    const [, montalivet] = await deuxResidences()
    store.recipesLoaded = true
    await addEvent({ day: '2027-01-01', title: 'Dîner maison', guests: 4, contraintes: '' })
    expect(store.events).toHaveLength(1)

    await switchResidence(montalivet.id)
    expect(store.events).toHaveLength(0)
  })

  test('un inventaire en pause reste dans sa résidence', async () => {
    const [argenteuil, montalivet] = await deuxResidences()
    startInventory('Cuisine')
    expect(invIsHere()).toBe(true)

    await switchResidence(montalivet.id)
    expect(store.inv).not.toBeNull() // toujours en pause…
    expect(invIsHere()).toBe(false) // …mais pas ici

    await switchResidence(argenteuil.id)
    expect(invIsHere()).toBe(true)
    abandonInventory()
  })
})
