/** Tests du remplissage des fiches Passard (ingrédients + recette, cas N8). */
import { vi, test, expect, beforeEach } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, importPassard, fillPassardDetails, ingredientsOf, saveRecipeDetails
} from '../../src/lib/store.svelte.js'
import { PASSARD_FICHES } from '../../src/lib/passard-fiches.js'

beforeEach(async () => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []; store.shop = []
  store.sources = []; store.recipes = []; store.realisations = []
  store.events = []; store.eventRecipes = []; store.ingredients = []
  store.schemaWarning = false
  await importPassard()
})

test('le remplissage complète toutes les recettes couvertes par les fiches', async () => {
  const filled = await fillPassardDetails()

  expect(filled).toBe(PASSARD_FICHES.length)
  const rhubarbe = store.recipes.find(r => r.url.includes('rhubarbe-a-un-sourire'))
  expect(rhubarbe.steps.length).toBeGreaterThan(100)
  const ings = ingredientsOf(rhubarbe.id)
  expect(ings.length).toBeGreaterThan(3)
  expect(ings.some(i => i.name.includes('rhubarbe'))).toBe(true)
  expect(tables.recipe_ingredients.length).toBeGreaterThan(200)
})

test('idempotent : un second passage ne refait rien, une fiche déjà remplie est respectée', async () => {
  const recipe = store.recipes.find(r => r.url.includes('rhubarbe-a-un-sourire'))
  await saveRecipeDetails(recipe, 'mes propres ingrédients', 'ma version à moi')

  const filled = await fillPassardDetails()
  expect(filled).toBe(PASSARD_FICHES.length - 1)
  expect(recipe.steps).toBe('ma version à moi')

  const again = await fillPassardDetails()
  expect(again).toBe(0)
})
