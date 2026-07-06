/**
 * Tests du miroir local pour la consultation hors ligne (cas NP5, partiel :
 * consultation seule — cocher hors ligne viendra avec la synchro différée).
 */
import { vi, test, expect, beforeEach } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { resetFake } from '../helpers/fake-supabase.js'
import { store, addItem, saveCache, loadCache } from '../../src/lib/store.svelte.js'

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
})

test('NP5 — les données sont mises en cache et relisibles hors ligne', async () => {
  await addItem({ name: 'Cumin', qty: 0, min: 0, loc: 'Cuisine', store: '' })
  saveCache()

  const cached = loadCache()
  expect(cached.household.id).toBe('h-test')
  expect(cached.items).toHaveLength(1)
  expect(cached.items[0].name).toBe('Cumin')
  expect(cached.shop).toHaveLength(1)
})

test('NP5 — sans cache, rien à servir (pas de fausse donnée)', () => {
  expect(loadCache()).toBeNull()
})
