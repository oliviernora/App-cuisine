/**
 * Tests de la recherche multicritère de recettes (cas N9, décision Olivier
 * 07/07/2026) : par ingrédient, par pays, par source, par mot du texte —
 * chaque mot de la requête doit se trouver quelque part.
 */
import { vi, test, expect, beforeEach } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { resetFake } from '../helpers/fake-supabase.js'
import { store, importPassard, saveRecipeDetails, searchRecipes, renameSource, addSource } from '../../src/lib/store.svelte.js'

beforeEach(async () => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []; store.shop = []
  store.sources = []; store.recipes = []; store.realisations = []
  store.events = []; store.eventRecipes = []; store.ingredients = []
  store.refs = []
  store.recipesLoaded = true
  store.schemaWarning = false
  await importPassard()
  await saveRecipeDetails(store.recipes[0], '500 g asperges vertes\n2 gousses d\'ail', 'Cuire au four à 180 °C.', 4, 'Inde')
})

test('recherche par ingrédient, pays, mot du texte et source', () => {
  const recipe = store.recipes[0]

  expect(searchRecipes('asperges vertes')).toContain(recipe)
  expect(searchRecipes('Inde')).toContain(recipe)
  expect(searchRecipes('four')).toContain(recipe)          // mot du texte de la recette
  expect(searchRecipes('passard')).toContain(recipe)       // source
  expect(searchRecipes('inde asperges')).toContain(recipe) // tous les mots doivent matcher
  expect(searchRecipes('inde chocolat')).toHaveLength(0)
  expect(searchRecipes('')).toHaveLength(store.recipes.length)
})

test('sources gérées : renommer, fusionner, créer', async () => {
  const src = store.sources[0]
  await renameSource(src, 'Passard (Le Point)')
  expect(store.sources[0].title).toBe('Passard (Le Point)')

  await addSource('Marie Claire — Cuisine', 'site')
  expect(store.sources).toHaveLength(2)
  await addSource('Marie Claire — Cuisine', 'site') // doublon ignoré
  expect(store.sources).toHaveLength(2)

  // fusion : renommer vers un titre existant réaffecte les recettes
  const mc = store.sources.find(s => s.title === 'Marie Claire — Cuisine')
  await renameSource(store.sources[0], 'Marie Claire — Cuisine')
  expect(store.sources).toHaveLength(1)
  expect(store.recipes.every(r => r.source_id === mc.id)).toBe(true)
})
