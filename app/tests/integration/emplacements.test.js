/**
 * Tests des emplacements (commentaires Olivier du 25/07/2026) :
 * ajout d'un emplacement vide dans l'Inventaire, suppression possible
 * seulement vide, et emplacements portés par la résidence courante.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, addResidence, addLocation, removeLocation
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
  store.locations = []
  store.residences = []
  store.residence = null
})

describe('Emplacements — ajout et suppression (Inventaire)', () => {
  test('ajouter un emplacement crée un emplacement vide dans la résidence courante', async () => {
    await addResidence('Montalivet')
    store.residence = store.residences[0]

    await addLocation('Placard mer')

    expect(store.locations.map(l => l.name)).toEqual(['Placard mer'])
    expect(tables.locations[0].residence_id).toBe(store.residence.id)
  })

  test('un nom déjà pris (emplacement ou produit) n\'est pas recréé', async () => {
    await addLocation('Placard')
    await addLocation('Placard')
    await addItem({ name: 'Cumin', qty: 1, loc: 'Cuisine', store: '' })
    await addLocation('Cuisine')

    expect(store.locations.map(l => l.name)).toEqual(['Placard'])
  })

  test('supprimer un emplacement vide le retire ; un emplacement garni reste', async () => {
    await addLocation('Placard')
    await addItem({ name: 'Cumin', qty: 1, loc: 'Cuisine', store: '' })

    await removeLocation('Placard')
    expect(store.locations).toHaveLength(0)
    expect(tables.locations).toHaveLength(0)

    // « Cuisine » est garni : la suppression ne fait rien
    await removeLocation('Cuisine')
    expect(store.items.some(i => i.loc === 'Cuisine')).toBe(true)
  })
})
