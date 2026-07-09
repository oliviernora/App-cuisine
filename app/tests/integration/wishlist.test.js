/**
 * Tests du cas N11 — wish list et beau produit : recettes « à faire un jour »,
 * ingrédients difficiles à sourcer (« ! » en tête de ligne), recherche du beau
 * produit dans la wish list.
 */
import { vi, test, expect, beforeEach } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, importPassard, setWishlist, saveRecipeDetails, parseIngredientLine, ingredientsOf
} from '../../src/lib/store.svelte.js'

beforeEach(async () => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []; store.shop = []
  store.sources = []; store.recipes = []; store.realisations = []
  store.events = []; store.eventRecipes = []; store.ingredients = []
  store.refs = []; store.photos = []
  store.recipesLoaded = true
  store.schemaWarning = false
  await importPassard()
})

test('ajouter et retirer une recette de la wish list, persisté en base', async () => {
  const recipe = store.recipes[0]
  expect(recipe.wishlist ?? false).toBe(false)

  await setWishlist(recipe, true)
  expect(recipe.wishlist).toBe(true)
  expect(tables.recipes.find(r => r.id === recipe.id).wishlist).toBe(true)

  await setWishlist(recipe, false)
  expect(tables.recipes.find(r => r.id === recipe.id).wishlist).toBe(false)
})

test('« ! » en tête de ligne = ingrédient difficile à sourcer', () => {
  const base = { qty_raw: '', note: '', optional: false }
  expect(parseIngredientLine('! 20 g morilles séchées'))
    .toEqual({ ...base, qty: 20, qty_raw: '20', unit: 'g', name: 'morilles séchées', hard: true })
  expect(parseIngredientLine('!poutargue'))
    .toEqual({ ...base, qty: null, unit: '', name: 'poutargue', hard: true })
  expect(parseIngredientLine('500 g asperges vertes'))
    .toEqual({ ...base, qty: 500, qty_raw: '500', unit: 'g', name: 'asperges vertes', hard: false })
})

test('le marquage est enregistré avec la fiche et survit à la relecture', async () => {
  const recipe = store.recipes[0]
  await saveRecipeDetails(recipe, '1 turbot\n! 20 g morilles séchées', 'Cuire.')

  const rows = ingredientsOf(recipe.id)
  expect(rows.map(r => [r.name, r.hard])).toEqual([['turbot', false], ['morilles séchées', true]])

  // le beau produit du marché se retrouve : filtre par ingrédient sur une
  // recette de la wish list (logique de l'onglet Recettes : r.wishlist + nom)
  await setWishlist(recipe, true)
  const match = store.recipes.filter(r => r.wishlist &&
    store.ingredients.some(i => i.recipe_id === r.id && i.name.includes('turbot')))
  expect(match).toEqual([recipe])
})
