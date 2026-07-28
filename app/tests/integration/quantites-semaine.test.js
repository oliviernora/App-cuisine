/**
 * Tests des quantités de la semaine (cas N10, décisions Olivier 07/07/2026) :
 * mise à l'échelle convives ÷ « pour N personnes », ajustement % et
 * corrections à la main PAR RECETTE ET PAR ÉVÉNEMENT, agrégation par unité
 * compatible, quantités portées sur les lignes de courses synchronisées,
 * bascule « je l'ai » et rangement des achats.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { resetFake } from '../helpers/fake-supabase.js'
import {
  store, addEvent, attachRecipe, saveRecipeDetails, weekNeeds,
  formatQty, eventIngredients, setEventRecipeScale, setEventQtyOverride,
  toggleAvailable, setDone, clearDone
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

async function setupWeek(lines, servings = 4, guests = 4) {
  const recipe = store.recipes[0]
  await saveRecipeDetails(recipe, lines, 'x', servings)
  await addEvent({ day: TODAY, title: 'Dîner maison', guests, contraintes: '' })
  await attachRecipe(store.events[0], recipe)
  return store.eventRecipes[0]
}

describe('N10 — quantités mises à l\'échelle par recette et par événement', () => {
  test('8 convives pour une recette « pour 4 » : quantités doublées', async () => {
    await setupWeek('500 g asperges vertes', 4, 8)
    expect(weekNeeds()[0].parts).toEqual([{ qty: 1000, unit: 'g' }])
  })

  test('sans « pour N personnes », la quantité reste celle de la recette', async () => {
    await setupWeek('500 g asperges vertes', null, 8)
    expect(weekNeeds()[0].parts).toEqual([{ qty: 500, unit: 'g' }])
  })

  test('une même recette servie à deux événements compte deux fois', async () => {
    await setupWeek('500 g asperges vertes', 4, 4)
    await addEvent({ day: TODAY, title: 'Repas association', guests: 20, contraintes: '' })
    await attachRecipe(store.events[1], store.recipes[0])

    // 500 g (4 pers.) + 2500 g (20 pers.)
    expect(weekNeeds()[0].parts).toEqual([{ qty: 3000, unit: 'g' }])
  })

  test('agrégation : g et kg s\'additionnent, jamais g et pièces', async () => {
    const er = await setupWeek('500 g de citron', 4, 4)
    const r2 = store.recipes[1]
    await saveRecipeDetails(r2, '1 kg citron\n2 citron', 'y')
    await attachRecipe(store.events[0], r2)

    const needs = weekNeeds()
    expect(needs).toHaveLength(1)
    expect(needs[0].parts).toEqual([{ qty: 1500, unit: 'g' }, { qty: 2, unit: '' }])
    expect(er).toBeDefined()
  })

  test('ajustement % par recette, pour cet événement seulement', async () => {
    const er = await setupWeek('500 g asperges vertes', 4, 4)
    await addEvent({ day: TODAY, title: 'Invitation', guests: 4, contraintes: '' })
    await attachRecipe(store.events[1], store.recipes[0])

    await setEventRecipeScale(er, 120)

    // 600 g (événement ajusté) + 500 g (l'autre événement inchangé)
    expect(weekNeeds()[0].parts).toEqual([{ qty: 1100, unit: 'g' }])
    expect(store.eventRecipes[1].scale_pct).toBe(100)
  })

  test('correction à la main d\'un ingrédient : ne vaut que pour cet événement, prime sur le %', async () => {
    const er = await setupWeek('500 g asperges vertes\nsel', 4, 8)

    await setEventQtyOverride(er, 'asperges vertes', 750)

    const ings = eventIngredients(store.events[0], er)
    expect(ings.find(i => i.name === 'asperges vertes').qty).toBe(750)
    expect(ings.find(i => i.name === 'asperges vertes').overridden).toBe(true)
    expect(weekNeeds()[0].parts).toEqual([{ qty: 750, unit: 'g' }])

    await setEventQtyOverride(er, 'asperges vertes', 0) // retour au calcul
    expect(weekNeeds()[0].parts).toEqual([{ qty: 1000, unit: 'g' }])
  })

  test('les lignes semaine portent la quantité, requantifiées à chaque changement', async () => {
    const er = await setupWeek('1500 g asperges vertes\nsel', 4, 4)

    let ligne = store.shop.find(s => s.name === 'asperges vertes')
    expect(ligne.qty).toBe(1500)
    expect(ligne.unit).toBe('g')
    expect(store.shop.find(s => s.name === 'sel').qty).toBeNull()

    await setEventRecipeScale(er, 200)
    ligne = store.shop.find(s => s.name === 'asperges vertes')
    expect(ligne.qty).toBe(3000)
  })

  test('« je l\'ai » se mémorise ; « Ranger les achats » couvre le besoin sans le supprimer', async () => {
    await setupWeek('500 g asperges vertes\n2 citrons', 4, 4)
    const asperges = store.shop.find(s => s.name === 'asperges vertes')
    const citrons = store.shop.find(s => s.name === 'citrons')

    await toggleAvailable(asperges)
    expect(asperges.available).toBe(true)
    expect(weekNeeds().find(n => n.name === 'asperges vertes').entry.available).toBe(true)

    await setDone(citrons, true)
    await clearDone()
    const apres = store.shop.find(s => s.name === 'citrons')
    expect(apres.available).toBe(true) // acheté = je l'ai, la synchro ne le recrée pas
    expect(apres.done).toBe(false)
  })

  test('quantité renvoyée en texte par la base (« 1.5 ») : pas de réécriture en boucle', async () => {
    const { syncWeekShopping } = await import('../../src/lib/store.svelte.js')
    await setupWeek('1,5 kg asperges vertes', 4, 4)
    const ligne = store.shop.find(s => s.name === 'asperges vertes')

    ligne.qty = String(ligne.qty) // comme le fait PostgREST pour numeric

    await syncWeekShopping()
    expect(ligne.qty).toBe('1500') // inchangée : la synchro n'a pas cru à une différence
  })

  test('affichage lisible : 1500 g → « 1,5 kg »', () => {
    expect(formatQty(1500, 'g')).toBe('1,5 kg')
    expect(formatQty(500, 'g')).toBe('500 g')
    expect(formatQty(2, 'gousses')).toBe('2 gousses')
    expect(formatQty(2000, 'ml')).toBe('2 l')
  })
})
