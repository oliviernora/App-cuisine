/**
 * Tests des genres d'ingrédients et du sourcing (commentaires Olivier,
 * 08/07/2026) : master list des genres, renommage libre d'un ingrédient,
 * sourcing par genre affiné par ingrédient, préremplissage des courses.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, changeQty, importPassard, saveRecipeDetails, sameIngredient,
  setIngredientCategory, addCategory, renameCategory, removeCategory,
  setCategorySourcing, setIngredientSourcing, sourcingOf,
  renameIngredient, recipesUsing, masterList
} from '../../src/lib/store.svelte.js'

beforeEach(async () => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []; store.shop = []
  store.sources = []; store.recipes = []; store.realisations = []
  store.events = []; store.eventRecipes = []; store.ingredients = []
  store.refs = []; store.categories = []
  store.schemaWarning = false
  await importPassard()
})

describe('Genres d\'ingrédients (master list des genres)', () => {
  test('ranger un ingrédient crée le genre ; pas de doublon de genre', async () => {
    await addItem({ name: 'Cumin', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    await setIngredientCategory('Cumin', 'Épices')
    await addCategory('épices') // même genre, casse différente
    expect(store.categories).toHaveLength(1)
    expect(tables.ingredient_categories).toHaveLength(1)
  })

  test('renommer un genre reclasse tous ses ingrédients ; un nom existant fusionne', async () => {
    await addItem({ name: 'Cumin', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    await addItem({ name: 'Curcuma', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    await setIngredientCategory('Cumin', 'Epices')
    await setIngredientCategory('Curcuma', 'Épices moulues')

    await renameCategory('Epices', 'Épices')
    expect(masterList().find(i => i.name === 'Cumin').category).toBe('Épices')

    await renameCategory('Épices moulues', 'Épices') // fusion
    expect(store.categories).toHaveLength(1)
    expect(masterList().find(i => i.name === 'Curcuma').category).toBe('Épices')
  })

  test('supprimer un genre rend ses ingrédients non classés', async () => {
    await addItem({ name: 'Cumin', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    await setIngredientCategory('Cumin', 'Épices')
    await removeCategory('Épices')
    expect(store.categories).toHaveLength(0)
    expect(masterList().find(i => i.name === 'Cumin').category).toBe('')
  })
})

describe('Renommage libre d\'un ingrédient (fenêtre d\'édition)', () => {
  test('beurre demi-sel → beurre salé : stock renommé, recettes toujours reconnues', async () => {
    await addItem({ name: 'beurre demi-sel', qty: 0, min: 0, loc: 'Frigo', store: '' })
    const recipe = store.recipes[0]
    await saveRecipeDetails(recipe, '20 g de beurre demi-sel', 'x')

    await renameIngredient('beurre demi-sel', 'beurre salé')

    expect(store.items[0].name).toBe('beurre salé')
    expect(store.shop.find(s => s.item_id === store.items[0].id).name).toBe('beurre salé')
    expect(sameIngredient('beurre demi-sel', 'beurre salé')).toBe(true)
    expect(recipesUsing('beurre salé').map(r => r.id)).toContain(recipe.id)
    expect(masterList().some(i => i.name === 'beurre salé')).toBe(true)
    expect(masterList().some(i => i.name === 'beurre demi-sel')).toBe(false)
  })

  test('renommer vers un nom déjà connu fusionne les deux fiches', async () => {
    await setIngredientCategory('beurre salé', 'Crèmerie')
    await setIngredientCategory('beurre demi-sel', '')

    await renameIngredient('beurre demi-sel', 'beurre salé')

    expect(store.refs).toHaveLength(1)
    expect(tables.ingredient_refs).toHaveLength(1)
    expect(sameIngredient('beurre demi-sel', 'beurre salé')).toBe(true)
    expect(store.refs[0].category).toBe('Crèmerie')
  })
})

describe('Sourcing : défaut du genre, affiné par ingrédient, courses préremplies', () => {
  test('l\'ingrédient hérite du genre, sa fiche prime', async () => {
    await addItem({ name: 'Cumin', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    await setIngredientCategory('Cumin', 'Épices')
    await setCategorySourcing('Épices', 'internet', 'epices-du-monde.fr')
    expect(sourcingOf('Cumin')).toEqual({ sourcing: 'internet', note: 'epices-du-monde.fr' })

    await setIngredientSourcing('Cumin', 'boutique', 'Grand Frais')
    expect(sourcingOf('Cumin')).toEqual({ sourcing: 'boutique', note: 'Grand Frais' })
  })

  test('un produit épuisé part en courses avec le magasin du sourcing', async () => {
    await addItem({ name: 'Cumin', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    await setIngredientCategory('Cumin', 'Épices')
    await setCategorySourcing('Épices', 'marché', 'Marché de Revel')

    await changeQty(store.items.find(i => i.name === 'Cumin'), -1) // 0 pot → courses
    const row = store.shop.find(s => s.name === 'Cumin')
    expect(row.store).toBe('Marché de Revel')
  })

  test('un magasin déjà choisi sur le produit n\'est pas écrasé', async () => {
    await addItem({ name: 'Cumin', qty: 1, min: 0, loc: 'Cuisine', store: 'Leclerc' })
    await setIngredientCategory('Cumin', 'Épices')
    await setCategorySourcing('Épices', 'marché', 'Marché de Revel')

    await changeQty(store.items.find(i => i.name === 'Cumin'), -1)
    expect(store.shop.find(s => s.name === 'Cumin').store).toBe('Leclerc')
  })
})
