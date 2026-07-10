/**
 * Tests de l'import d'une recette depuis des photos par IA locale (A3,
 * cas N8 — volet capture). Ollama est simulé au niveau de fetch : on teste
 * la détection de disponibilité, la mise en forme de la proposition et le
 * parcours jusqu'à la fiche enregistrée (ingrédients re-parsés par l'app).
 */
import { vi, test, expect, beforeEach, afterEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import { store, createImportedRecipe, ingredientsOf, parseIngredientLine } from '../../src/lib/store.svelte.js'
import { ollamaReady, extractRecipeFromImages, proposalFromExtraction, OLLAMA_MODEL } from '../../src/lib/ollama-recipe.js'

/** Extraction type renvoyée par qwen3-vl:4b-instruct sur le POC du 10/07. */
const EXTRACTION = {
  titre: 'Poulet aux noix de cajou',
  personnes: 0,
  ingredients: [
    { quantite: '½', unite: 'cuil. à café', nom: 'de sel' },
    { quantite: '1½', unite: 'cuil. à café', nom: 'de fécule de maïs' },
    { quantite: '100', unite: 'g', nom: 'de noix de cajou' },
    { quantite: '6', unite: '', nom: 'échalotes coupées en 4' }
  ],
  etapes: [
    '* Dans un grand saladier, mélanger le poulet, l\'ail et le sel.',
    '* Faire frire les noix de cajou 2 à 3 minutes.'
  ],
  remarques: 'Servir avec du riz vapeur.'
}

beforeEach(() => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.sources = []
  store.recipes = []
  store.ingredients = []
  store.recipesLoaded = false
  store.schemaWarning = false
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Disponibilité de l\'IA locale', () => {
  test('Ollama absent (connexion refusée) : indisponible, sans erreur', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')))
    expect(await ollamaReady()).toBe(false)
  })

  test('Ollama présent mais sans le modèle : indisponible', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ models: [{ name: 'llama3.2:latest' }] }))))
    expect(await ollamaReady()).toBe(false)
  })

  test('Ollama présent avec le modèle : disponible', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ models: [{ name: OLLAMA_MODEL }] }))))
    expect(await ollamaReady()).toBe(true)
  })
})

describe('N8 — j\'importe une recette depuis des photos', () => {
  test('la proposition reconstruit lignes d\'ingrédients, étapes et remarque', () => {
    const p = proposalFromExtraction(EXTRACTION)
    expect(p.title).toBe('Poulet aux noix de cajou')
    expect(p.servings).toBe('') // 0 = non indiqué sur la page
    expect(p.ingredientsText.split('\n')).toEqual([
      '½ cuil. à café de sel',
      '1½ cuil. à café de fécule de maïs',
      '100 g de noix de cajou',
      '6 échalotes coupées en 4'
    ])
    expect(p.steps.split('\n\n')).toEqual([
      'Dans un grand saladier, mélanger le poulet, l\'ail et le sel.',
      'Faire frire les noix de cajou 2 à 3 minutes.',
      'Servir avec du riz vapeur.'
    ])
  })

  test('les lignes proposées se re-parsent en ingrédients structurés (unités « cuil. », fractions)', () => {
    expect(parseIngredientLine('½ cuil. à café de sel'))
      .toMatchObject({ qty: 0.5, qty_raw: '½', unit: 'cuil. à café', name: 'sel' })
    expect(parseIngredientLine('1½ cuil. à café de fécule de maïs'))
      .toMatchObject({ qty: 1.5, unit: 'cuil. à café', name: 'fécule de maïs' })
  })

  test('extraction simulée → enregistrement : fiche sans URL, dédoublonnée par titre + source', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message: { content: JSON.stringify(EXTRACTION) }
    }))))
    const proposal = proposalFromExtraction(await extractRecipeFromImages(['base64-page-1']))

    const res = await createImportedRecipe({
      url: '', sourceTitle: 'Chine — le livre de cuisine', country: 'Chine', category: '',
      title: proposal.title, ingredientsText: proposal.ingredientsText,
      steps: proposal.steps, servings: null, sourceKind: 'livre'
    })
    expect(res.recipe).toBeDefined()
    expect(store.sources[0]).toMatchObject({ title: 'Chine — le livre de cuisine', kind: 'livre' })
    expect(tables.recipes).toHaveLength(1)
    expect(ingredientsOf(res.recipe.id)).toHaveLength(4)
    expect(ingredientsOf(res.recipe.id)[0]).toMatchObject({ qty: 0.5, unit: 'cuil. à café', name: 'sel' })

    const again = await createImportedRecipe({
      url: '', sourceTitle: 'Chine — le livre de cuisine', country: '', category: '',
      title: 'Poulet aux noix de cajou', ingredientsText: '', steps: '', servings: null
    })
    expect(again.duplicate.id).toBe(res.recipe.id)
    expect(tables.recipes).toHaveLength(1)
  })

  test('Ollama en erreur pendant l\'extraction : l\'erreur remonte, rien n\'est écrit', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 500 })))
    await expect(extractRecipeFromImages(['x'])).rejects.toThrow('500')
    expect(tables.recipes).toHaveLength(0)
  })
})
