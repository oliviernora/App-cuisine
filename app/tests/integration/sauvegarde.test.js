/**
 * Tests de la sauvegarde/restauration (exigence NFR, décisions Olivier
 * 08-09/07/2026) : l'export produit un fichier complet, la restauration
 * remplace intégralement les données du foyer (et seulement les siennes),
 * un fichier invalide est refusé sans rien toucher.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, addEvent, attachRecipe, importPassard,
  exportPayload, checkBackup, restoreBackup
} from '../../src/lib/store.svelte.js'

const TODAY = new Date().toISOString().slice(0, 10)

beforeEach(async () => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []; store.shop = []; store.locations = []; store.lots = []
  store.sources = []; store.recipes = []; store.realisations = []
  store.events = []; store.eventRecipes = []; store.ingredients = []
  store.refs = []; store.categories = []; store.photos = []
  store.schemaWarning = false
  await importPassard()
  await addItem({ name: 'Riz', qty: 4, min: 1, loc: 'Cuisine', store: '' })
  await addItem({ name: 'Huile', qty: 2, min: 1, loc: 'Cave', store: '' })
  await addEvent({ day: TODAY, title: 'Dîner maison', guests: 4, contraintes: '' })
  await attachRecipe(store.events[0], store.recipes[0])
})

describe('Restauration — remplacement complet du foyer', () => {
  test('les données modifiées après la sauvegarde reviennent à l’état sauvegardé', async () => {
    const backup = JSON.parse(JSON.stringify(exportPayload()))

    // La vie continue après la sauvegarde : ajout, modification, suppression.
    await addItem({ name: 'Farine', qty: 1, min: 0, loc: 'Cuisine', store: '' })
    store.items.find(i => i.name === 'Riz').qty = 99
    tables.items.find(i => i.name === 'Riz').qty = 99
    tables.recipes.length = 0
    store.recipes = []

    await restoreBackup(backup)

    expect(store.items.map(i => i.name).sort()).toEqual(['Huile', 'Riz'])
    expect(store.items.find(i => i.name === 'Riz').qty).toBe(4)
    expect(store.recipes.map(r => r.title)).toEqual(backup.recipes.map(r => r.title))
    expect(store.events).toHaveLength(1)
    expect(store.eventRecipes).toHaveLength(1)
    expect(tables.items.filter(r => r.household_id === 'h-test')).toHaveLength(2)
  })

  test('les identifiants du fichier sont conservés, les liens entre tables restent valides', async () => {
    const backup = JSON.parse(JSON.stringify(exportPayload()))
    await restoreBackup(backup)

    const ev = store.events[0]
    const link = store.eventRecipes[0]
    expect(link.event_id).toBe(ev.id)
    expect(store.recipes.some(r => r.id === link.recipe_id)).toBe(true)
  })

  test('household_id est réécrit vers le foyer courant (sauvegarde d’un autre foyer)', async () => {
    const backup = JSON.parse(JSON.stringify(exportPayload()))
    for (const table of Object.keys(backup)) {
      if (Array.isArray(backup[table])) backup[table].forEach(r => { r.household_id = 'h-autre' })
    }

    await restoreBackup(backup)

    expect(tables.items.every(r => r.household_id === 'h-test')).toBe(true)
    expect(tables.recipes.every(r => r.household_id === 'h-test')).toBe(true)
  })

  test('les données d’un autre foyer ne sont pas touchées', async () => {
    tables.items.push({ id: 'x1', household_id: 'h-voisin', name: 'Sel', qty: 1, min: 0 })
    const backup = JSON.parse(JSON.stringify(exportPayload()))

    await restoreBackup(backup)

    expect(tables.items.find(r => r.household_id === 'h-voisin')).toBeTruthy()
  })
})

describe('Restauration — fichiers refusés, rien n’est touché', () => {
  test('un fichier étranger ou d’une autre version est refusé', () => {
    expect(() => checkBackup({ app: 'autre-app', version: 1 })).toThrow(/pas une sauvegarde/)
    expect(() => checkBackup({ app: 'garde-manger', version: 2 })).toThrow(/pas une sauvegarde/)
    expect(() => checkBackup(null)).toThrow(/pas une sauvegarde/)
  })

  test('une sauvegarde tronquée (table manquante) est refusée avant toute suppression', async () => {
    const backup = JSON.parse(JSON.stringify(exportPayload()))
    delete backup.recipes
    const avant = tables.items.length

    await expect(restoreBackup(backup)).rejects.toThrow(/incomplète/)
    expect(tables.items).toHaveLength(avant)
  })
})
