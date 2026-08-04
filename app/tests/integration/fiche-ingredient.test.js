/**
 * Fiche ingrédient unique (N14 amendé, décisions Olivier 04/08/2026) :
 * réserve minimum PAR RÉSIDENCE, lieux d'achat MULTIPLES (sites communs au
 * foyer, boutiques physiques par résidence), alias retirables.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, minOf, setResidenceMin, setIngredientMin, totalOf,
  addLieu, storesOf, addIngredientStore, removeIngredientStore, preferredStore,
  confirmMerge, removeAlias, sameIngredient, syncShop
} from '../../src/lib/store.svelte.js'

const ARGENTEUIL = { id: 'res-arg', name: 'Argenteuil' }
const MONTALIVET = { id: 'res-mon', name: 'Montalivet' }

beforeEach(() => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.residences = [ARGENTEUIL, MONTALIVET]
  store.residence = ARGENTEUIL
  store.items = []
  store.shop = []
  store.refs = []
  store.categories = []
  store.lieux = []
  store.minimums = []
  store.ingredientStores = []
})

describe('N1/N14 — réserve minimum par résidence (04/08/2026)', () => {
  test('le minimum se règle résidence par résidence, repli sur l\'ancien minimum global puis 1', async () => {
    expect(minOf('Cumin')).toBe(1) // rien de réglé nulle part

    await setIngredientMin('Cumin', 3) // l'ancien minimum « global » (fiche du référentiel)
    expect(minOf('Cumin', ARGENTEUIL.id)).toBe(3) // repli : vaut pour toutes les résidences
    expect(minOf('Cumin', MONTALIVET.id)).toBe(3)

    await setResidenceMin('Cumin', MONTALIVET.id, 1) // Montalivet se règle à part
    expect(minOf('Cumin', ARGENTEUIL.id)).toBe(3) // Argenteuil garde le repli
    expect(minOf('Cumin', MONTALIVET.id)).toBe(1)
    expect(tables.ingredient_minimums).toHaveLength(1)

    await setResidenceMin('Cumin', MONTALIVET.id, 2) // re-réglage = mise à jour, pas un doublon
    expect(minOf('Cumin', MONTALIVET.id)).toBe(2)
    expect(tables.ingredient_minimums).toHaveLength(1)
  })

  test('le rachat automatique suit le minimum de la résidence courante', async () => {
    await addItem({ name: 'Cumin', qty: 2, loc: 'Cuisine', store: '' })
    expect(store.shop).toHaveLength(0) // 2 ≥ défaut 1 : rien

    await setResidenceMin('Cumin', ARGENTEUIL.id, 3) // ici on veut 3 pots d'avance
    expect(store.shop.some(s => sameIngredient(s.name, 'Cumin'))).toBe(true) // 2 < 3 → en courses

    await setResidenceMin('Cumin', ARGENTEUIL.id, 1)
    expect(store.shop.some(s => sameIngredient(s.name, 'Cumin'))).toBe(false) // 2 ≥ 1 → retiré
  })
})

describe('N14/N3 — lieux d\'achat multiples (04/08/2026)', () => {
  async function troisLieux() {
    await addLieu('Marché de Revel', 'physique')
    await addLieu('Grand Frais', 'physique')
    await addLieu('Épices du monde', 'internet')
    const [revel, gf, epices] = store.lieux
    revel.residence_id = MONTALIVET.id // Revel n'existe qu'à Montalivet
    gf.residence_id = ARGENTEUIL.id
    return [revel, gf, epices]
  }

  test('un ingrédient porte plusieurs lieux ; ajout idempotent, retrait propre', async () => {
    const [revel, , epices] = await troisLieux()
    await addIngredientStore('Safran', revel.id)
    await addIngredientStore('Safran', epices.id)
    await addIngredientStore('Safran', revel.id) // doublon ignoré

    expect(storesOf('Safran').map(s => s.name).toSorted((a, b) => a.localeCompare(b, 'fr')))
      .toEqual(['Épices du monde', 'Marché de Revel'])
    await removeIngredientStore('Safran', revel.id)
    expect(storesOf('Safran').map(s => s.name)).toEqual(['Épices du monde'])
  })

  test('classement des courses (Q1) : la boutique physique de MA résidence, sinon le premier site', async () => {
    const [revel, gf, epices] = await troisLieux()
    await addIngredientStore('Safran', revel.id)
    await addIngredientStore('Safran', gf.id)
    await addIngredientStore('Safran', epices.id)

    expect(preferredStore('Safran')).toBe('Grand Frais') // à Argenteuil : sa boutique
    store.residence = MONTALIVET
    expect(preferredStore('Safran')).toBe('Marché de Revel')
    store.residence = ARGENTEUIL

    await removeIngredientStore('Safran', gf.id) // plus de boutique à Argenteuil
    expect(preferredStore('Safran')).toBe('Épices du monde') // les sites valent partout
  })

  test('une ligne de courses naît sous le bon magasin', async () => {
    const [, gf] = await troisLieux()
    await addIngredientStore('Safran', gf.id)
    await addItem({ name: 'Safran', qty: 0, loc: 'Cuisine', store: '' })
    await syncShop()

    expect(store.shop.find(s => s.name === 'Safran')?.store).toBe('Grand Frais')
  })
})

describe('N14 — alias sur la fiche (Q4, 04/08/2026)', () => {
  test('un alias confirmé se voit et se retire', async () => {
    await confirmMerge('Nuoc mam', 'nuoc mame')
    expect(sameIngredient('Nuoc mam', 'nuoc mame')).toBe(true)

    await removeAlias('Nuoc mam', 'nuoc mame')
    expect(sameIngredient('Nuoc mam', 'nuoc mame')).toBe(false)
    expect(tables.ingredient_refs[0].aliases).toEqual([])
  })
})
