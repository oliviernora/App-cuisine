/**
 * Tests de la dictée vocale (remarques Olivier 27/07/2026) :
 * - « 4 épices » ne devient jamais 4 × « épices » quand l'ingrédient existe ;
 * - les noms écorchés par la transcription (nuoc mam, ras el hanout) sont
 *   rapprochés de la master list ;
 * - une correction confirmée devient un alias, reconnu directement ensuite.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, parseDictation, dictationMatches, sameDictation,
  confirmMerge, sameIngredient
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
  store.ingredients = []
})

describe('parseDictation — nombre en tête', () => {
  test('« trois cumin moulu » : quantité 3, nom « cumin moulu »', () => {
    expect(parseDictation('trois cumin moulu')).toEqual({ qty: 3, name: 'cumin moulu' })
  })

  test('« 2 safran » et le préfixe « ajoute »', () => {
    expect(parseDictation('ajoute 2 safran')).toEqual({ qty: 2, name: 'safran' })
  })

  test('« 4 épices » reste l\'ingrédient quatre-épices quand il est connu', async () => {
    await addItem({ name: 'Quatre-épices', qty: 1, loc: 'Épices', store: '' })
    expect(parseDictation('4 épices')).toEqual({ qty: 1, name: '4 épices' })
    expect(parseDictation('quatre épices')).toEqual({ qty: 1, name: 'quatre épices' })
    // avec une vraie quantité devant, le nombre est consommé normalement
    expect(parseDictation('2 cumin')).toEqual({ qty: 2, name: 'cumin' })
  })

  test('« 4 épices » sans ingrédient connu : comportement numérique inchangé', () => {
    expect(parseDictation('4 épices')).toEqual({ qty: 4, name: 'épices' })
  })

  test('l\'ingrédient connu peut venir du référentiel (master list), pas seulement du stock', async () => {
    store.refs = [{ id: 'r1', name: 'Quatre-épices', aliases: [], rejected: [] }]
    expect(parseDictation('quatre épices')).toEqual({ qty: 1, name: 'quatre épices' })
  })
})

describe('sameDictation — chiffres et traits d\'union confondus', () => {
  test('« 4 épices » ≡ « Quatre-épices »', () => {
    expect(sameDictation('4 épices', 'Quatre-épices')).toBe(true)
    expect(sameDictation('4 epices', 'quatre épices')).toBe(true)
    expect(sameDictation('4 épices', 'cinq épices')).toBe(false)
  })
})

describe('dictationMatches — rapprochement des dictées écorchées', () => {
  test('« nuoc mame » retrouve « Nuoc mam » du stock', async () => {
    await addItem({ name: 'Nuoc mam', qty: 1, loc: 'Placard', store: '' })
    expect(dictationMatches('nuoc mame')).toEqual(['Nuoc mam'])
  })

  test('« ras el anout » retrouve « Ras el hanout » de la master list', () => {
    store.refs = [{ id: 'r1', name: 'Ras el hanout', aliases: [], rejected: [] }]
    expect(dictationMatches('ras el anout')).toEqual(['Ras el hanout'])
  })

  test('un nom court ne se rapproche pas au hasard (« sel » ≠ « sel fou »)', async () => {
    await addItem({ name: 'Sel', qty: 1, loc: 'Placard', store: '' })
    expect(dictationMatches('sol')).toEqual([])
    expect(dictationMatches('sel')).toEqual(['Sel'])
  })

  test('les alias du référentiel ramènent au nom canonique, sans doublon', () => {
    store.refs = [{ id: 'r1', name: 'Nuoc mam', aliases: ['nuoc mame'], rejected: [] }]
    expect(dictationMatches('nuoc mame')).toEqual(['Nuoc mam'])
  })
})

describe('alias mémorisé après correction (jamais de fusion silencieuse)', () => {
  test('confirmMerge mémorise la transcription : reconnue directement ensuite', async () => {
    await addItem({ name: 'Nuoc mam', qty: 1, loc: 'Placard', store: '' })
    expect(sameIngredient('Nuoc mam', 'nouk mame')).toBe(false)
    await confirmMerge('Nuoc mam', 'nouk mame')
    expect(sameIngredient('Nuoc mam', 'nouk mame')).toBe(true)
  })
})
