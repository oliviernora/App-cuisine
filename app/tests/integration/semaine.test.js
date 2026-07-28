/**
 * Tests du cas N10 — je planifie ma semaine (incrément 1 : événements,
 * recettes associées, consignation à la date de l'événement).
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addEvent, removeEvent, attachRecipe, detachRecipe,
  addRealisation, lastMade
} from '../../src/lib/store.svelte.js'
import { importPassard } from '../helpers/passard.js'

beforeEach(async () => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.sources = []; store.recipes = []; store.realisations = []
  store.events = []; store.eventRecipes = []
  store.schemaWarning = false
  await importPassard()
})

describe('N10 — je planifie ma semaine', () => {
  test('poser un événement : jour, type, convives, contraintes', async () => {
    await addEvent({ day: '2026-07-11', title: 'Repas association', guests: 20, contraintes: 'halal, pas épicé' })

    expect(store.events).toHaveLength(1)
    const ev = tables.events[0]
    expect(ev.guests).toBe(20)
    expect(ev.contraintes).toBe('halal, pas épicé')
  })

  test('associer des recettes, sans doublon', async () => {
    await addEvent({ day: '2026-07-11', title: 'Dîner maison', guests: 4, contraintes: '' })
    const event = store.events[0]
    const recipe = store.recipes[0]

    await attachRecipe(event, recipe)
    await attachRecipe(event, recipe)
    await attachRecipe(event, store.recipes[1])

    expect(store.eventRecipes).toHaveLength(2)
    expect(tables.event_recipes).toHaveLength(2)
  })

  test('retirer une recette de l\'événement ne touche pas les autres', async () => {
    await addEvent({ day: '2026-07-11', title: 'Dîner maison', guests: 4, contraintes: '' })
    const event = store.events[0]
    await attachRecipe(event, store.recipes[0])
    await attachRecipe(event, store.recipes[1])

    await detachRecipe(event, store.recipes[0])

    expect(store.eventRecipes).toHaveLength(1)
    expect(tables.event_recipes).toHaveLength(1)
    expect(tables.event_recipes[0].recipe_id).toBe(store.recipes[1].id)
  })

  test('consigner depuis l\'événement : la réalisation porte la date de l\'événement', async () => {
    await addEvent({ day: '2026-07-11', title: 'Repas association', guests: 20, contraintes: '' })
    const event = store.events[0]
    const recipe = store.recipes[0]
    await attachRecipe(event, recipe)

    await addRealisation(recipe, event.day, event.title + ' (' + event.guests + ' pers.)')

    expect(lastMade(recipe.id)).toBe('2026-07-11')
    expect(tables.realisations.at(-1).comment).toContain('20 pers.')
  })

  test('supprimer un événement retire aussi ses associations', async () => {
    await addEvent({ day: '2026-07-11', title: 'Pique-nique', guests: 6, contraintes: '' })
    const event = store.events[0]
    await attachRecipe(event, store.recipes[0])

    await removeEvent(event)

    expect(store.events).toHaveLength(0)
    expect(store.eventRecipes).toHaveLength(0)
    expect(tables.events).toHaveLength(0)
  })
})
