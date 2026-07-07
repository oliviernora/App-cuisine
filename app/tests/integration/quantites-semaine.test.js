/**
 * Tests des quantités de la semaine (cas N10, décisions Olivier 07/07/2026) :
 * mise à l'échelle convives ÷ « pour N personnes », agrégation par unité
 * compatible, ajustement en % et à la main, quantités en liste de courses.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { resetFake } from '../helpers/fake-supabase.js'
import {
  store, addEvent, attachRecipe, importPassard, saveRecipeDetails,
  weekNeeds, addWeekMissing, formatQty
} from '../../src/lib/store.svelte.js'

const TODAY = new Date().toISOString().slice(0, 10)

beforeEach(async () => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []; store.shop = []
  store.sources = []; store.recipes = []; store.realisations = []
  store.events = []; store.eventRecipes = []; store.ingredients = []
  store.refs = []
  store.schemaWarning = false
  await importPassard()
})

describe('N10 — quantités mises à l\'échelle', () => {
  test('8 convives pour une recette « pour 4 » : quantités doublées', async () => {
    const recipe = store.recipes[0]
    await saveRecipeDetails(recipe, '500 g asperges vertes', 'x', 4)
    await addEvent({ day: TODAY, title: 'Invitation', guests: 8, contraintes: '' })
    await attachRecipe(store.events[0], recipe)

    expect(recipe.servings).toBe(4)
    expect(weekNeeds()[0].parts).toEqual([{ qty: 1000, unit: 'g' }])
  })

  test('sans « pour N personnes », la quantité reste celle de la recette', async () => {
    const recipe = store.recipes[0]
    await saveRecipeDetails(recipe, '500 g asperges vertes', 'x')
    await addEvent({ day: TODAY, title: 'Invitation', guests: 8, contraintes: '' })
    await attachRecipe(store.events[0], recipe)

    expect(weekNeeds()[0].parts).toEqual([{ qty: 500, unit: 'g' }])
  })

  test('une même recette servie à deux événements compte deux fois', async () => {
    const recipe = store.recipes[0]
    await saveRecipeDetails(recipe, '500 g asperges vertes', 'x', 4)
    await addEvent({ day: TODAY, title: 'Dîner maison', guests: 4, contraintes: '' })
    await addEvent({ day: TODAY, title: 'Repas association', guests: 20, contraintes: '' })
    await attachRecipe(store.events[0], recipe)
    await attachRecipe(store.events[1], recipe)

    // 500 g (4 pers.) + 2500 g (20 pers.)
    expect(weekNeeds()[0].parts).toEqual([{ qty: 3000, unit: 'g' }])
  })

  test('agrégation : g et kg s\'additionnent, jamais g et pièces', async () => {
    const [r1, r2] = store.recipes
    await saveRecipeDetails(r1, '500 g de citron', 'x')
    await saveRecipeDetails(r2, '1 kg citron\n2 citron', 'y')
    await addEvent({ day: TODAY, title: 'Dîner maison', guests: 4, contraintes: '' })
    await attachRecipe(store.events[0], r1)
    await attachRecipe(store.events[0], r2)

    const needs = weekNeeds()
    expect(needs).toHaveLength(1)
    expect(needs[0].parts).toEqual([{ qty: 1500, unit: 'g' }, { qty: 2, unit: '' }])
  })

  test('ajustement global en % (convives gourmands)', async () => {
    const recipe = store.recipes[0]
    await saveRecipeDetails(recipe, '500 g asperges vertes', 'x', 4)
    await addEvent({ day: TODAY, title: 'Dîner maison', guests: 4, contraintes: '' })
    await attachRecipe(store.events[0], recipe)

    expect(weekNeeds(120)[0].parts).toEqual([{ qty: 600, unit: 'g' }])
  })

  test('les manquants partent en courses avec quantité et unité', async () => {
    const recipe = store.recipes[0]
    await saveRecipeDetails(recipe, '1500 g asperges vertes\nsel', 'x', 4)
    await addEvent({ day: TODAY, title: 'Dîner maison', guests: 4, contraintes: '' })
    await attachRecipe(store.events[0], recipe)

    await addWeekMissing()

    const asperges = store.shop.find(s => s.name === 'asperges vertes')
    expect(asperges.qty).toBe(1500)
    expect(asperges.unit).toBe('g')
    expect(store.shop.find(s => s.name === 'sel').qty).toBeNull()
  })

  test('correction à la main : la quantité corrigée prime sur le calcul', async () => {
    const recipe = store.recipes[0]
    await saveRecipeDetails(recipe, '500 g asperges vertes', 'x', 4)
    await addEvent({ day: TODAY, title: 'Dîner maison', guests: 4, contraintes: '' })
    await attachRecipe(store.events[0], recipe)

    const key = weekNeeds()[0].key
    await addWeekMissing(100, { [key]: { qty: 2, unit: 'kg' } })

    const entry = store.shop.find(s => s.name === 'asperges vertes')
    expect(entry.qty).toBe(2)
    expect(entry.unit).toBe('kg')
  })

  test('affichage lisible : 1500 g → « 1,5 kg »', () => {
    expect(formatQty(1500, 'g')).toBe('1,5 kg')
    expect(formatQty(500, 'g')).toBe('500 g')
    expect(formatQty(2, 'gousses')).toBe('2 gousses')
    expect(formatQty(2000, 'ml')).toBe('2 l')
  })
})
