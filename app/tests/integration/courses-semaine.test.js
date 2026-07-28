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
  store, addItem, addEvent, updateEvent, attachRecipe, detachRecipe,
  parseIngredientLine, ingredientLine, saveRecipeDetails, ingredientsOf, weekNeeds
} from '../../src/lib/store.svelte.js'
import { importPassard } from '../helpers/passard.js'

const TODAY = new Date().toISOString().slice(0, 10)

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
})

describe('Analyse des lignes d\'ingrédients', () => {
  const base = { qty_raw: '', note: '', optional: false, hard: false }
  test('quantité, unité et nom sont séparés', () => {
    expect(parseIngredientLine('500 g d\'asperges vertes')).toEqual({ ...base, qty: 500, qty_raw: '500', unit: 'g', name: 'asperges vertes' })
    expect(parseIngredientLine('2 gousses d\'ail')).toEqual({ ...base, qty: 2, qty_raw: '2', unit: 'gousses', name: 'ail' })
    expect(parseIngredientLine('1,5 l de bouillon')).toEqual({ ...base, qty: 1.5, qty_raw: '1,5', unit: 'l', name: 'bouillon' })
    expect(parseIngredientLine('sel')).toEqual({ ...base, qty: null, unit: '', name: 'sel' })
    expect(parseIngredientLine('  ')).toBeNull()
  })
  test('fractions : qty décimal pour les calculs, saisie conservée pour l\'affichage', () => {
    expect(parseIngredientLine('½ canard')).toEqual({ ...base, qty: 0.5, qty_raw: '½', unit: '', name: 'canard' })
    expect(parseIngredientLine('1/2 poulet')).toEqual({ ...base, qty: 0.5, qty_raw: '1/2', unit: '', name: 'poulet' })
    expect(parseIngredientLine('1 ½ l de lait')).toEqual({ ...base, qty: 1.5, qty_raw: '1 ½', unit: 'l', name: 'lait' })
    expect(parseIngredientLine('3/4 c. à c. de sel')).toEqual({ ...base, qty: 0.75, qty_raw: '3/4', unit: 'c. à c.', name: 'sel' })
  })
  test('descriptif après une virgule et « (facultatif) » en fin de ligne', () => {
    expect(parseIngredientLine('20 g de beurre, fondu')).toEqual({ ...base, qty: 20, qty_raw: '20', unit: 'g', name: 'beurre', note: 'fondu' })
    expect(parseIngredientLine('coriandre (facultatif)')).toEqual({ ...base, qty: null, unit: '', name: 'coriandre', optional: true })
    expect(parseIngredientLine('20 g de beurre, pommade (facultatif)')).toEqual({ ...base, qty: 20, qty_raw: '20', unit: 'g', name: 'beurre', note: 'pommade', optional: true })
  })
  test('la ligne d\'édition se reconstruit comme saisie', () => {
    for (const line of ['½ canard', '1/2 poulet', '20 g beurre, fondu (facultatif)', '! 20 g morilles séchées'])
      expect(ingredientLine(parseIngredientLine(line))).toBe(line)
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

describe('N10 — courses des repas synchronisées automatiquement', () => {
  async function setupWeek() {
    const recipe = store.recipes[0]
    await saveRecipeDetails(recipe, '500 g asperges vertes\n2 gousses d\'ail\nparmesan', 'x')
    await addEvent({ day: TODAY, title: 'Dîner maison', guests: 4, contraintes: '' })
    await attachRecipe(store.events[0], recipe)
    return recipe
  }

  test('rapprochement : en stock, déjà en liste (réappro), ou ligne semaine', async () => {
    await setupWeek()
    await addItem({ name: 'Ail', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    await addItem({ name: 'Parmesan', qty: 0, min: 0, loc: 'Frigo', store: '' }) // épuisé → réappro auto

    const needs = weekNeeds()
    expect(needs).toHaveLength(3)
    expect(needs.find(n => n.name === 'ail').match.loc).toBe('Cuisine')
    expect(needs.find(n => n.name === 'parmesan').match).toBeNull()
    expect(needs.find(n => n.name === 'parmesan').entry.origin).toBe('reappro')
    expect(needs.find(n => n.name === 'asperges vertes').entry.origin).toBe('semaine')
  })

  test('ajouter une recette met la liste de courses à jour immédiatement, sans doublon', async () => {
    await addItem({ name: 'Ail', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    await setupWeek()

    const semaine = store.shop.filter(s => s.origin === 'semaine')
    expect(semaine.map(s => s.name).sort()).toEqual(['asperges vertes', 'parmesan'])
    // l'ail est en stock : pas de ligne ; pas de doublon si on resynchronise
    await attachRecipe(store.events[0], store.recipes[0])
    expect(store.shop.filter(s => s.origin === 'semaine')).toHaveLength(2)
  })

  test('retirer la recette retire ses lignes semaine (mais pas le réappro ni le manuel)', async () => {
    await setupWeek()
    expect(store.shop.filter(s => s.origin === 'semaine').length).toBeGreaterThan(0)

    await detachRecipe(store.events[0], store.recipes[0])

    expect(store.shop.filter(s => s.origin === 'semaine')).toHaveLength(0)
  })

  test('modifier la date d\'un événement recalcule les courses (futur → passé : lignes retirées)', async () => {
    await setupWeek()
    expect(store.shop.filter(s => s.origin === 'semaine').length).toBeGreaterThan(0)

    await updateEvent(store.events[0], { day: '2020-01-01' })

    expect(store.events[0].day).toBe('2020-01-01')
    expect(store.shop.filter(s => s.origin === 'semaine')).toHaveLength(0)
    expect(tables.events[0].day).toBe('2020-01-01')
  })

  test('les événements passés ne comptent pas dans les besoins', async () => {
    const recipe = store.recipes[1]
    await saveRecipeDetails(recipe, 'truffe noire', '')
    await addEvent({ day: '2020-01-01', title: 'Vieux dîner', guests: 2, contraintes: '' })
    await attachRecipe(store.events[0], recipe)

    expect(weekNeeds()).toHaveLength(0)
    expect(store.shop.filter(s => s.origin === 'semaine')).toHaveLength(0)
  })
})
