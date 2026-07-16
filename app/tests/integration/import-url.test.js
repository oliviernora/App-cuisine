/**
 * Tests de l'import d'une recette depuis une URL (A1, cas N8 — volet capture).
 * Parcours : récupérer la page (Edge Function simulée) → fiche proposée à la
 * relecture → enregistrement avec dédoublonnage (URL, sinon titre + source).
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake, edgeFunctions, storageFiles } from '../helpers/fake-supabase.js'
import {
  store, fetchRecipeFromUrl, createImportedRecipe, findDuplicateRecipe, ingredientsOf,
  parseIngredientLine, attachImportedPhoto, fetchPagePhotoFor, saveRecipeNotes
} from '../../src/lib/store.svelte.js'
import { parseRecipeFromHtml } from '../../src/lib/jsonld-recipe.js'
import {
  MARIE_CLAIRE_URL, MARIE_CLAIRE_HTML, GRAPH_URL, GRAPH_HTML, SANS_RECETTE_HTML
} from '../fixtures/pages-recettes.js'

beforeEach(() => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.sources = []
  store.recipes = []
  store.ingredients = []
  store.realisations = []
  store.photos = []
  store.recipesLoaded = false
  store.schemaWarning = false
})

describe('Parsing du JSON-LD schema.org/Recipe', () => {
  test('page réelle Marie Claire : titre, source, 9 ingrédients, 4 étapes, pour 4', () => {
    const p = parseRecipeFromHtml(MARIE_CLAIRE_HTML, MARIE_CLAIRE_URL)
    expect(p.title).toBe('Salade de poulet aux herbes')
    expect(p.sourceName).toBe('Marie Claire')
    expect(p.servings).toBe(4)
    expect(p.category).toBe('Entrée')
    expect(p.ingredientLines).toHaveLength(9)
    expect(p.ingredientLines[0]).toBe('1 poulet déjà cuit')
    expect(p.ingredientLines[1]).toBe("1/2 botte d'oignons nouveaux")
    expect(p.steps).toContain('Préchauffez votre four à 180 °C')
    expect(p.steps.split('\n\n')).toHaveLength(4)
    expect(p.imageUrl).toBe('https://cache.marieclaire.fr/data/photo/w1200_h630_c17/6h/salade-poulet.jpg')
  })

  test('variante @graph : type multiple, HowToSection, yield « 6 personnes », tableau d\'ingrédients', () => {
    const p = parseRecipeFromHtml(GRAPH_HTML, GRAPH_URL)
    expect(p.title).toBe('Tarte aux tomates')
    expect(p.servings).toBe(6)
    expect(p.sourceName).toBe('exemple-cuisine.fr')
    expect(p.ingredientLines).toEqual(['1 pâte feuilletée', '6 tomates', '2 c. à s. de moutarde'])
    expect(p.steps.split('\n\n')).toHaveLength(2)
    expect(p.imageUrl).toBe('https://exemple-cuisine.fr/img/tarte-tomates.jpg')
  })

  test('lisibilité (16/07/2026) : les étapes sont numérotées comme en ligne', () => {
    const p = parseRecipeFromHtml(MARIE_CLAIRE_HTML, MARIE_CLAIRE_URL)
    const etapes = p.steps.split('\n\n')
    expect(etapes[0].startsWith('1. ')).toBe(true)
    expect(etapes[3].startsWith('4. ')).toBe(true)
  })

  test('lisibilité (16/07/2026) : une chaîne unique avec retours à la ligne est découpée en étapes', () => {
    const html = '<script type="application/ld+json">' + JSON.stringify({
      '@type': 'Recipe', name: 'Soupe test',
      recipeIngredient: ['1 oignon'],
      recipeInstructions: 'Émincer l\'oignon.\nLe faire revenir.\nMouiller et laisser mijoter.'
    }) + '</scr' + 'ipt>'
    const p = parseRecipeFromHtml(html, 'https://exemple.fr/soupe')
    expect(p.steps.split('\n\n')).toEqual([
      '1. Émincer l\'oignon.', '2. Le faire revenir.', '3. Mouiller et laisser mijoter.'])
  })

  test('photo depuis la page pour une fiche déjà importée (16/07/2026)', async () => {
    edgeFunctions['rapatrier-page'] = async body => body.image
      ? { image: Buffer.from('JPG').toString('base64'), contentType: 'image/jpeg' }
      : { html: MARIE_CLAIRE_HTML }
    const { recipe } = await createImportedRecipe({
      url: MARIE_CLAIRE_URL, title: 'Salade de poulet aux herbes', sourceTitle: 'Marie Claire',
      ingredientsText: '', steps: '', servings: 4, country: '', category: ''
    })
    expect(store.photos).toHaveLength(0)

    const ok = await fetchPagePhotoFor(recipe)

    expect(ok).toBe(true)
    expect(store.photos).toHaveLength(1)
    expect(store.photos[0].kind).toBe('plat')
    expect(storageFiles.size).toBe(1)
  })

  test('commentaires communs (Q3, 16/07/2026) : la zone s\'enregistre sur la recette', async () => {
    const { recipe } = await createImportedRecipe({
      url: 'https://exemple.fr/r', title: 'Recette à notes', sourceTitle: 'Exemple',
      ingredientsText: '', steps: '', servings: null, country: '', category: ''
    })
    await saveRecipeNotes(recipe, ' Très bon — doubler les épices. ')
    expect(recipe.notes).toBe('Très bon — doubler les épices.')
    expect(tables.recipes.find(r => r.id === recipe.id).notes).toBe('Très bon — doubler les épices.')
  })

  test('page sans champ image : imageUrl vide, l\'import reste possible', () => {
    const html = MARIE_CLAIRE_HTML.replace(/"image":\s*{[^}]*"url":[^}]*},/, '')
    const p = parseRecipeFromHtml(html, MARIE_CLAIRE_URL)
    expect(p.title).toBe('Salade de poulet aux herbes')
    expect(p.imageUrl).toBe('')
  })

  test('page sans recette structurée : null', () => {
    expect(parseRecipeFromHtml(SANS_RECETTE_HTML, 'https://exemple.fr')).toBe(null)
  })

  test('« 2/3 de c. à c. de cinq-parfums » : le « de » avant l\'unité ne la masque plus (M39)', () => {
    expect(parseIngredientLine('2/3 de c. à c. de cinq-parfums'))
      .toMatchObject({ qty_raw: '2/3', unit: 'c. à c.', name: 'cinq-parfums' })
    expect(parseIngredientLine('1 botte de persil plat'))
      .toMatchObject({ qty: 1, unit: 'botte', name: 'persil plat' })
  })
})

describe('N8 — j\'importe une recette depuis une URL', () => {
  test('récupération → proposition → enregistrement : source créée, ingrédients structurés', async () => {
    edgeFunctions['rapatrier-page'] = ({ url }) => ({ html: url === MARIE_CLAIRE_URL ? MARIE_CLAIRE_HTML : '' })

    const { proposal, error } = await fetchRecipeFromUrl(MARIE_CLAIRE_URL)
    expect(error).toBeUndefined()

    const res = await createImportedRecipe({
      url: MARIE_CLAIRE_URL,
      title: proposal.title,
      sourceTitle: proposal.sourceName,
      ingredientsText: proposal.ingredientLines.join('\n'),
      steps: proposal.steps,
      servings: proposal.servings,
      country: 'Antilles',
      category: proposal.category
    })

    expect(res.recipe).toBeDefined()
    expect(store.sources).toHaveLength(1)
    expect(store.sources[0]).toMatchObject({ title: 'Marie Claire', kind: 'site' })
    expect(tables.recipes).toHaveLength(1)
    expect(tables.recipes[0]).toMatchObject({
      title: 'Salade de poulet aux herbes', url: MARIE_CLAIRE_URL,
      servings: 4, country: 'Antilles', category: 'Entrée'
    })
    const ings = ingredientsOf(res.recipe.id)
    expect(ings).toHaveLength(9)
    expect(ings[1]).toMatchObject({ qty: 0.5, qty_raw: '1/2', unit: 'botte', name: 'oignons nouveaux' })
    expect(store.schemaWarning).toBe(false)
  })

  test('la même URL ne rentre pas deux fois : doublon signalé avant récupération', async () => {
    tables.recipes.push({ id: 'r-1', household_id: 'h-test', title: 'Salade de poulet aux herbes', url: MARIE_CLAIRE_URL })
    store.recipes = [...tables.recipes]

    const dup = findDuplicateRecipe(MARIE_CLAIRE_URL)
    expect(dup.id).toBe('r-1')

    const res = await createImportedRecipe({
      url: MARIE_CLAIRE_URL, title: 'Salade de poulet aux herbes', sourceTitle: 'Marie Claire',
      ingredientsText: '', steps: '', servings: null, country: '', category: ''
    })
    expect(res.duplicate.id).toBe('r-1')
    expect(tables.recipes).toHaveLength(1)
  })

  test('sans URL en double, même titre + même source = doublon aussi', async () => {
    edgeFunctions['rapatrier-page'] = () => ({ html: GRAPH_HTML })
    const first = await createImportedRecipe({
      url: GRAPH_URL, title: 'Tarte aux tomates', sourceTitle: 'Exemple Cuisine',
      ingredientsText: '6 tomates', steps: '', servings: 6, country: '', category: ''
    })
    expect(first.recipe).toBeDefined()

    const res = await createImportedRecipe({
      url: 'https://exemple-cuisine.fr/tarte-tomates-v2', title: 'Tarte aux tomates',
      sourceTitle: 'Exemple Cuisine', ingredientsText: '', steps: '', servings: null, country: '', category: ''
    })
    expect(res.duplicate.id).toBe(first.recipe.id)
    expect(tables.recipes).toHaveLength(1)
  })

  test('page sans recette structurée : message clair, rien n\'est écrit', async () => {
    edgeFunctions['rapatrier-page'] = () => ({ html: SANS_RECETTE_HTML })
    const { proposal, error } = await fetchRecipeFromUrl('https://exemple.fr/article')
    expect(proposal).toBeUndefined()
    expect(error).toContain('Aucune recette structurée')
    expect(tables.recipes).toHaveLength(0)
  })

  test('page injoignable (fonction en erreur) : message clair, rien n\'est écrit', async () => {
    const { proposal, error } = await fetchRecipeFromUrl('https://exemple.fr/coupee')
    expect(proposal).toBeUndefined()
    expect(error).toContain('n\'a pas pu être récupérée')
    expect(tables.recipes).toHaveLength(0)
  })
})

describe('Photo du plat à l\'import par URL (décisions Olivier 14/07/2026)', () => {
  async function importAvecPhoto() {
    const { proposal } = await fetchRecipeFromUrl(MARIE_CLAIRE_URL)
    const res = await createImportedRecipe({
      url: MARIE_CLAIRE_URL, title: proposal.title, sourceTitle: proposal.sourceName,
      ingredientsText: '', steps: '', servings: 4, country: '', category: ''
    })
    return { recipe: res.recipe, imageUrl: proposal.imageUrl }
  }

  test('la photo annoncée par la page est rattachée à la fiche en « plat »', async () => {
    edgeFunctions['rapatrier-page'] = ({ image }) => image
      ? { image: btoa('faux-jpeg'), contentType: 'image/jpeg' }
      : { html: MARIE_CLAIRE_HTML }

    const { recipe, imageUrl } = await importAvecPhoto()
    expect(await attachImportedPhoto(recipe, imageUrl)).toBe(true)
    expect(tables.recipe_photos).toHaveLength(1)
    expect(tables.recipe_photos[0]).toMatchObject({ recipe_id: recipe.id, kind: 'plat' })
    expect(storageFiles.size).toBe(1)
  })

  test('photo introuvable : la recette reste enregistrée, aucune photo fantôme', async () => {
    edgeFunctions['rapatrier-page'] = ({ image }) => {
      if (image) throw new Error('image injoignable')
      return { html: MARIE_CLAIRE_HTML }
    }

    const { recipe, imageUrl } = await importAvecPhoto()
    expect(await attachImportedPhoto(recipe, imageUrl)).toBe(false)
    expect(tables.recipes).toHaveLength(1)
    expect(tables.recipe_photos).toHaveLength(0)
    expect(storageFiles.size).toBe(0)
  })
})
