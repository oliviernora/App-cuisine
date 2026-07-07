/**
 * Tests du référentiel d'ingrédients (master list, décision Olivier
 * 07/07/2026) : orthographes différentes rapprochées par confirmation,
 * refus mémorisé, effet sur les besoins de la semaine (cas N10).
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, addEvent, attachRecipe, importPassard, saveRecipeDetails,
  weekNeeds, sameIngredient, canonicalName, pendingMerges, confirmMerge,
  rejectMerge, knownNames, masterList, setIngredientCategory
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

async function setupWeek(lines) {
  const recipe = store.recipes[0]
  await saveRecipeDetails(recipe, lines, 'x')
  await addEvent({ day: TODAY, title: 'Dîner maison', guests: 4, contraintes: '' })
  await attachRecipe(store.events[0], recipe)
  return recipe
}

describe('Master list — doublons proposés puis confirmés', () => {
  test('« Citrons » en stock et « citron » en recette sont proposés au rapprochement', async () => {
    await setupWeek('2 citron')
    await addItem({ name: 'Citrons', qty: 3, min: 0, loc: 'Cuisine', store: '' })

    expect(sameIngredient('Citrons', 'citron')).toBe(false)
    const merges = pendingMerges()
    expect(merges).toHaveLength(1)
    expect([merges[0].a, merges[0].b].sort()).toEqual(['Citrons', 'citron'])
  })

  test('confirmer : alias mémorisé, le stock est reconnu, la proposition disparaît', async () => {
    await setupWeek('2 citron')
    await addItem({ name: 'Citrons', qty: 3, min: 0, loc: 'Cuisine', store: '' })
    expect(weekNeeds()[0].match).toBeNull()

    const m = pendingMerges()[0]
    await confirmMerge(m.a, m.b)

    expect(sameIngredient('Citrons', 'citron')).toBe(true)
    expect(canonicalName('citron')).toBe(canonicalName('Citrons'))
    expect(weekNeeds()[0].match.loc).toBe('Cuisine')
    expect(pendingMerges()).toHaveLength(0)
    expect(tables.ingredient_refs).toHaveLength(1)
  })

  test('refuser : la question ne revient jamais, les noms restent distincts', async () => {
    await setupWeek('1 oignon rouge\n1 oignon rouges')
    const m = pendingMerges()[0]

    await rejectMerge(m.a, m.b)

    expect(pendingMerges()).toHaveLength(0)
    expect(sameIngredient('oignon rouge', 'oignon rouges')).toBe(false)
  })

  test('deux graphies confirmées comptent pour un seul besoin de la semaine', async () => {
    const recipe2 = store.recipes[1]
    await setupWeek('2 citron')
    await saveRecipeDetails(recipe2, '1 citrons', 'y')
    await attachRecipe(store.events[0], recipe2)

    expect(weekNeeds()).toHaveLength(2)
    const m = pendingMerges()[0]
    await confirmMerge(m.a, m.b)

    const needs = weekNeeds()
    expect(needs).toHaveLength(1)
    expect(needs[0].count).toBe(2)
  })

  test('catégories : ranger un ingrédient, les non classés restent visibles', async () => {
    await addItem({ name: 'Citron', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    await addItem({ name: 'Cumin', qty: 1, min: 0, loc: 'Cuisine', store: '' })

    await setIngredientCategory('Cumin', 'Épices')

    const liste = masterList()
    expect(liste.find(i => i.name === 'Cumin').category).toBe('Épices')
    expect(liste.find(i => i.name === 'Citron').category).toBe('') // non classé, toujours listé
    // la catégorie vit sur l'entrée canonique : un alias la partage
    await confirmMerge('Cumin', 'cumins')
    expect(masterList().find(i => i.name === 'Cumin').category).toBe('Épices')
  })

  test('la liste des noms connus sert l\'autocomplétion sans doublon de graphie', async () => {
    await addItem({ name: 'Citron', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    await setupWeek('1 citron\n1 basilic')

    const names = knownNames()
    expect(names.filter(n => n.toLowerCase() === 'citron')).toHaveLength(1)
    expect(names).toContain('basilic')
  })
})
