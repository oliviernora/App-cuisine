/**
 * Tests de l'import d'une recette depuis un texte collé (A4, cas N8 —
 * capture iPhone/iPad via l'OCR Apple, ou copier-coller sur PC).
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import { store, createImportedRecipe, ingredientsOf } from '../../src/lib/store.svelte.js'
import { proposalFromText } from '../../src/lib/texte-recette.js'

/** Texte tel que sorti de « Texte en direct » sur la page du magazine. */
const TEXTE_MAGAZINE = `Chaudrée du potager
Recette proposée par le chef de cuisine de l'hôtel-restaurant Le Normandie.
Pour 4 personnes
• 8 Saint-Jacques avec corail
• 12 langoustines décortiquées
• 1 botte d'asperges vertes
• 20 g de beurre
Découpez en petit dés les carottes et courgettes, plongez-les dans le poiré fermier préalablement mis à chauffer.
Faites cuire les asperges cuisson vapeur ou dans de l'eau bouillante salée.`

const TEXTE_NUMEROTE = `Pâte à crêpes
Pour 6 personnes
250 g de farine
3 œufs
1. Mélangez la farine et les œufs.
2. Ajoutez le lait petit à petit puis laissez reposer 1 heure au frais.`

beforeEach(() => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.sources = []
  store.recipes = []
  store.ingredients = []
  store.recipesLoaded = false
  store.schemaWarning = false
})

describe('Découpage du texte collé', () => {
  test('titre, « Pour 4 personnes », puces d\'ingrédients, étapes', () => {
    const p = proposalFromText(TEXTE_MAGAZINE)
    expect(p.title).toBe('Chaudrée du potager')
    expect(p.servings).toBe(4)
    expect(p.ingredientsText.split('\n')).toEqual([
      '8 Saint-Jacques avec corail',
      '12 langoustines décortiquées',
      "1 botte d'asperges vertes",
      '20 g de beurre'
    ])
    expect(p.steps.split('\n\n')).toHaveLength(3) // phrase du chef + 2 étapes
  })

  test('les étapes numérotées « 1. … » restent des étapes, sans leur numéro', () => {
    const p = proposalFromText(TEXTE_NUMEROTE)
    expect(p.servings).toBe(6)
    expect(p.ingredientsText.split('\n')).toEqual(['250 g de farine', '3 œufs'])
    expect(p.steps.split('\n\n')).toEqual([
      'Mélangez la farine et les œufs.',
      'Ajoutez le lait petit à petit puis laissez reposer 1 heure au frais.'
    ])
  })

  test('texte vide : pas de titre', () => {
    expect(proposalFromText('  \n\n ').title).toBe('')
  })
})

describe('N8 — j\'importe une recette depuis un texte collé', () => {
  test('préparation → enregistrement : fiche complète, ingrédients structurés', async () => {
    const p = proposalFromText(TEXTE_MAGAZINE)
    const res = await createImportedRecipe({
      url: '', sourceTitle: 'Orne magazine', sourceKind: 'livre', country: 'France',
      category: '', title: p.title, ingredientsText: p.ingredientsText,
      steps: p.steps, servings: p.servings
    })
    expect(res.recipe).toBeDefined()
    expect(tables.recipes[0]).toMatchObject({ title: 'Chaudrée du potager', servings: 4, url: '' })
    const ings = ingredientsOf(res.recipe.id)
    expect(ings).toHaveLength(4)
    expect(ings[2]).toMatchObject({ qty: 1, unit: 'botte', name: 'asperges vertes' })
  })
})
