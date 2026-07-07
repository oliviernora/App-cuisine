/**
 * Tests du pont semaine → courses (cas N10, étape « je vérifie ma liste de
 * courses ») : ingrédients structurés, rapprochement avec le stock par nom,
 * ajout des manquants.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, addEvent, attachRecipe, importPassard,
  parseIngredientLine, saveRecipeDetails, ingredientsOf, weekNeeds, addWeekMissing
} from '../../src/lib/store.svelte.js'

const TODAY = new Date().toISOString().slice(0, 10)

beforeEach(async () => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []; store.shop = []
  store.sources = []; store.recipes = []; store.realisations = []
  store.events = []; store.eventRecipes = []; store.ingredients = []
  store.schemaWarning = false
  await importPassard()
})

describe('Analyse des lignes d\'ingrédients', () => {
  test('quantité, unité et nom sont séparés', () => {
    expect(parseIngredientLine('500 g d\'asperges vertes')).toEqual({ qty: 500, unit: 'g', name: 'asperges vertes' })
    expect(parseIngredientLine('2 gousses d\'ail')).toEqual({ qty: 2, unit: 'gousses', name: 'ail' })
    expect(parseIngredientLine('1,5 l de bouillon')).toEqual({ qty: 1.5, unit: 'l', name: 'bouillon' })
    expect(parseIngredientLine('sel')).toEqual({ qty: null, unit: '', name: 'sel' })
    expect(parseIngredientLine('  ')).toBeNull()
  })
})

describe('N8 — ingrédients et texte de la recette', () => {
  test('enregistrer puis relire les ingrédients et les étapes', async () => {
    const recipe = store.recipes[0]

    await saveRecipeDetails(recipe, '500 g asperges vertes\n2 gousses d\'ail\nsel', 'Éplucher. Cuire. Servir.')

    const ings = ingredientsOf(recipe.id)
    expect(ings).toHaveLength(3)
    expect(ings[0].name).toBe('asperges vertes')
    expect(recipe.steps).toBe('Éplucher. Cuire. Servir.')
    expect(tables.recipe_ingredients).toHaveLength(3)

    await saveRecipeDetails(recipe, '1 botte de radis', '')
    expect(ingredientsOf(recipe.id)).toHaveLength(1)
    expect(tables.recipe_ingredients).toHaveLength(1)
  })
})

describe('N10 — je vérifie ma liste de courses', () => {
  async function setupWeek() {
    const recipe = store.recipes[0]
    await saveRecipeDetails(recipe, '500 g asperges vertes\n2 gousses d\'ail\nparmesan', 'x')
    await addEvent({ day: TODAY, title: 'Dîner maison', guests: 4, contraintes: '' })
    await attachRecipe(store.events[0], recipe)
    return recipe
  }

  test('rapprochement : en stock, déjà en liste, ou à acheter', async () => {
    await setupWeek()
    await addItem({ name: 'Ail', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    await addItem({ name: 'Parmesan', qty: 0, min: 0, loc: 'Frigo', store: '' }) // épuisé → déjà en liste auto

    const needs = weekNeeds()
    expect(needs).toHaveLength(3)
    expect(needs.find(n => n.name === 'ail').match.loc).toBe('Cuisine')
    expect(needs.find(n => n.name === 'parmesan').match).toBeNull()
    expect(needs.find(n => n.name === 'parmesan').inShopping).toBe(true)
    expect(needs.find(n => n.name === 'asperges vertes').match).toBeNull()
  })

  test('ajouter les manquants : seuls les vrais manquants partent en courses', async () => {
    await setupWeek()
    await addItem({ name: 'Ail', qty: 1, min: 0, loc: 'Cuisine', store: '' })

    const added = await addWeekMissing()

    expect(added).toBe(2) // asperges vertes + parmesan
    expect(store.shop.map(s => s.name).sort()).toEqual(['asperges vertes', 'parmesan'])
    const again = await addWeekMissing()
    expect(again).toBe(0) // pas de doublon au second appel
  })

  test('les événements passés ne comptent pas dans les besoins', async () => {
    const recipe = store.recipes[1]
    await saveRecipeDetails(recipe, 'truffe noire', '')
    await addEvent({ day: '2020-01-01', title: 'Vieux dîner', guests: 2, contraintes: '' })
    await attachRecipe(store.events[0], recipe)

    expect(weekNeeds()).toHaveLength(0)
  })
})
