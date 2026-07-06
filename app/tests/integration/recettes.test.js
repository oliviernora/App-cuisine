/**
 * Tests des cas N8 (consigner) et N9 (retrouver) — incrément 1, amorcé par
 * la collection Alain Passard (105 recettes vidéo).
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, importPassard, addRealisation, lastMade
} from '../../src/lib/store.svelte.js'

beforeEach(() => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.sources = []
  store.recipes = []
  store.realisations = []
  store.schemaWarning = false
})

describe('Import de la collection Alain Passard', () => {
  test('105 recettes, une source, 5 déjà cuisinées sans date', async () => {
    await importPassard()

    expect(store.sources).toHaveLength(1)
    expect(store.sources[0].title).toContain('Alain Passard')
    expect(store.recipes).toHaveLength(105)
    expect(tables.recipes).toHaveLength(105)
    expect(store.recipes.filter(r => r.url).length).toBe(91)
    expect(store.recipes.every(r => r.source_id === store.sources[0].id)).toBe(true)
    expect(store.realisations).toHaveLength(5)
    expect(store.realisations.every(r => r.made_on === null)).toBe(true)
    expect(store.schemaWarning).toBe(false)
  })
})

describe('N8 — je consigne une réalisation', () => {
  test('la réalisation porte date et commentaire, la dernière date suit', async () => {
    await importPassard()
    const recipe = store.recipes[0]
    expect(lastMade(recipe.id)).toBeNull()

    await addRealisation(recipe, '2026-07-06', 'Excellent, doubler la sauce')

    expect(lastMade(recipe.id)).toBe('2026-07-06')
    const real = tables.realisations.find(r => r.recipe_id === recipe.id)
    expect(real.comment).toBe('Excellent, doubler la sauce')
  })

  test('plusieurs réalisations : la plus récente fait foi', async () => {
    await importPassard()
    const recipe = store.recipes[1]
    await addRealisation(recipe, '2025-01-10', '')
    await addRealisation(recipe, '2026-03-02', '')

    expect(lastMade(recipe.id)).toBe('2026-03-02')
  })

  test('une recette cuisinée sans date affiche « inconnue », une date notée prend le dessus', async () => {
    await importPassard()
    const done = store.realisations[0]
    const recipe = store.recipes.find(r => r.id === done.recipe_id)
    expect(lastMade(recipe.id)).toBe('inconnue')

    await addRealisation(recipe, '2026-07-06', '')
    expect(lastMade(recipe.id)).toBe('2026-07-06')
  })
})
