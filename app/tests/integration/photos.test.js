/**
 * Tests du cas N8 — photos de recettes (étape 4, incrément 2) : photo du plat
 * (consignée avec une réalisation ou seule) et page du livre, stockées dans le
 * bucket privé du foyer, affichées par URL signée, supprimables.
 */
import { vi, test, expect, beforeEach } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, storageFiles, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addRealisation, addRecipePhoto, photosOf, photoUrl, deletePhoto
} from '../../src/lib/store.svelte.js'
import { importPassard } from '../helpers/passard.js'

const fakeFile = () => new Blob(['fausse image'], { type: 'image/jpeg' })

beforeEach(async () => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.sources = []; store.recipes = []; store.realisations = []
  store.ingredients = []; store.photos = []
  store.schemaWarning = false
  await importPassard()
})

test('photo de la page du livre : envoyée dans le dossier du foyer, listée sur la fiche', async () => {
  const recipe = store.recipes[0]
  const photo = await addRecipePhoto(recipe, fakeFile(), 'page')

  expect(photo.path.startsWith('h-test/' + recipe.id + '/')).toBe(true)
  expect(storageFiles.has(photo.path)).toBe(true)
  expect(tables.recipe_photos).toHaveLength(1)
  expect(photosOf(recipe.id)).toEqual([photo])
  expect(photosOf(store.recipes[1].id)).toHaveLength(0)
  expect(store.schemaWarning).toBe(false)
})

test('photo du plat consignée avec la réalisation : liée à la réalisation', async () => {
  const recipe = store.recipes[0]
  const real = await addRealisation(recipe, '2026-07-07', 'Très bon')
  const photo = await addRecipePhoto(recipe, fakeFile(), 'plat', real.id)

  expect(photo.kind).toBe('plat')
  expect(photo.realisation_id).toBe(real.id)
  expect(photosOf(recipe.id)).toHaveLength(1)
})

test('affichage par URL signée (bucket privé, jamais public)', async () => {
  const recipe = store.recipes[0]
  const photo = await addRecipePhoto(recipe, fakeFile(), 'plat')

  const url = await photoUrl(photo)
  expect(url).toBe('signed://' + photo.path)
})

test('suppression : la ligne ET le fichier disparaissent', async () => {
  const recipe = store.recipes[0]
  const photo = await addRecipePhoto(recipe, fakeFile(), 'plat')

  await deletePhoto(photo)

  expect(tables.recipe_photos).toHaveLength(0)
  expect(storageFiles.has(photo.path)).toBe(false)
  expect(photosOf(recipe.id)).toHaveLength(0)
})
