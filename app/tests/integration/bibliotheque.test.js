/**
 * Bibliothèque dédiée des livres et des sites (cas N16, 04/08/2026) :
 * sources « site » avec adresse, visite du site avec repli sur l'origine
 * d'une recette pour les sources d'avant la migration.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import { store, addSource, setSourceUrl, siteUrlOf } from '../../src/lib/store.svelte.js'

beforeEach(() => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.sources = []
  store.recipes = []
})

describe('N16 — bibliothèque des livres et des sites', () => {
  test('une source « site » porte son adresse, normalisée (https:// ajouté)', async () => {
    await addSource('Marmiton', 'site')
    const src = store.sources[0]
    expect(src.kind).toBe('site')

    const ok = await setSourceUrl(src, 'marmiton.org')

    expect(ok).toBe(true)
    expect(src.url).toBe('https://marmiton.org')
    expect(tables.sources[0].url).toBe('https://marmiton.org')
    expect(siteUrlOf(src)).toBe('https://marmiton.org')
  })

  test('sans adresse, le site se visite par l\'origine d\'une de ses recettes', async () => {
    await addSource('Marie Claire — Cuisine', 'site')
    const src = store.sources[0]
    store.recipes = [{ id: 'r1', source_id: src.id, url: 'https://www.marieclaire.fr/cuisine/poulet,1234.asp' }]

    expect(siteUrlOf(src)).toBe('https://www.marieclaire.fr')
  })

  test('ni adresse ni recette en ligne : pas de visite proposée (null, jamais d\'erreur)', async () => {
    await addSource('Carnet perso', 'site')
    const src = store.sources[0]
    store.recipes = [{ id: 'r1', source_id: src.id, url: '' }]

    expect(siteUrlOf(src)).toBeNull()
  })
})
