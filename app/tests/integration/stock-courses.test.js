/**
 * Tests d'intégration stock <-> courses, dérivés de docs/cas-utilisation.md.
 * Chaque test porte le numéro du cas d'utilisation qu'il rejoue.
 */
import { vi, describe, test, expect, beforeEach } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, changeQty, toggleOrder, setDone, clearDone, removeShopEntry, syncShop,
  isDismissed, setIngredientMin, totalOf, stockGroups, removeIngredient,
  receivedEntries, stashReceived, setEntryStore, setLocationDated
} from '../../src/lib/store.svelte.js'

beforeEach(() => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []
  store.shop = []
  store.refs = []
  store.categories = []
  store.locations = []
  store.lots = []
})

async function seed(name, qty, extra = {}) {
  await addItem({ name, qty, loc: 'Cuisine', store: '', ...extra })
  return store.items.findLast(i => i.name === name)
}

function entryFor(item) {
  return store.shop.find(s => s.name === item.name || s.item_id === item.id)
}

describe('N1 — je cuisine, j\'épuise un ingrédient, il revient tout seul', () => {
  test('finir le dernier pot met le produit en courses (auto)', async () => {
    const cumin = await seed('Cumin', 1)
    expect(store.shop).toHaveLength(0)

    await changeQty(cumin, -1)

    expect(cumin.qty).toBe(0)
    const entry = entryFor(cumin)
    expect(entry).toBeDefined()
    expect(entry.manual).toBe(false)
    expect(tables.shopping).toHaveLength(1)
  })

  test('acheter, ranger, puis mettre en stock via l\'inventaire (Q2, 16/07/2026)', async () => {
    const cumin = await seed('Cumin', 0)
    const entry = entryFor(cumin)
    expect(entry).toBeDefined()

    await setDone(entry, true)
    await clearDone()

    // le stock n'a pas bougé : la ligne attend « à mettre en stock »
    expect(cumin.qty).toBe(0)
    expect(receivedEntries()).toHaveLength(1)
    expect(tables.shopping[0].received).toBe(true)

    await stashReceived(entry, 1, 'Cuisine')

    expect(cumin.qty).toBe(1)
    expect(store.shop).toHaveLength(0)
    expect(tables.shopping).toHaveLength(0)
    expect(tables.items.find(r => r.id === cumin.id).qty).toBe(1)
  })

  test('une ligne « reçue » couvre le besoin : la synchro n\'en recrée pas', async () => {
    const cumin = await seed('Cumin', 0)
    await setDone(entryFor(cumin), true)
    await clearDone()

    await syncShop()

    expect(tables.shopping).toHaveLength(1) // la reçue seulement, pas de doublon
    expect(tables.shopping[0].received).toBe(true)
  })

  test('ranger dans un emplacement inconnu du produit crée sa ligne là-bas', async () => {
    const safran = await seed('Safran', 0)
    await setDone(entryFor(safran), true)
    await clearDone()

    await stashReceived(receivedEntries()[0], 2, 'Réserve entrée')

    const reserve = store.items.find(i => i.name === 'Safran' && i.loc === 'Réserve entrée')
    expect(reserve.qty).toBe(2)
    expect(safran.qty).toBe(0) // la ligne Cuisine n'a pas bougé
    expect(store.shop).toHaveLength(0) // somme 2 >= minimum : rien à racheter
  })

  test('ranger dans un emplacement « à dates » crée un lot daté', async () => {
    await setLocationDated('Congélateur 1', true)
    const saumon = await seed('Saumon', 0, { loc: 'Congélateur 1' })
    await setDone(entryFor(saumon), true)
    await clearDone()

    await stashReceived(receivedEntries()[0], 2, 'Congélateur 1')

    expect(saumon.qty).toBe(2)
    expect(store.lots).toHaveLength(1)
    expect(store.lots[0].qty).toBe(2)
  })

  test('remonter le stock à la main retire l\'entrée automatique', async () => {
    const beurre = await seed('Beurre', 0)
    expect(entryFor(beurre)).toBeDefined()

    await changeQty(beurre, 1)

    expect(entryFor(beurre)).toBeUndefined()
    expect(tables.shopping).toHaveLength(0)
  })
})

describe('N3 — je constitue une réserve d\'un produit précieux', () => {
  test('commander un produit non épuisé le met en courses (réserve)', async () => {
    const safran = await seed('Safran', 1)

    await toggleOrder(safran)

    const entry = entryFor(safran)
    expect(entry).toBeDefined()
    expect(entry.manual).toBe(true)
    expect(safran.qty).toBe(1)
  })

  test('acheter la réserve puis la ranger porte le stock à deux pots', async () => {
    const safran = await seed('Safran', 1)
    await toggleOrder(safran)

    await setDone(entryFor(safran), true)
    await clearDone()
    await stashReceived(receivedEntries()[0], 1, 'Cuisine')

    expect(safran.qty).toBe(2)
    expect(store.shop).toHaveLength(0)
  })

  test('un second appui annule une commande de réserve non cochée', async () => {
    const safran = await seed('Safran', 1)
    await toggleOrder(safran)
    expect(entryFor(safran)).toBeDefined()

    await toggleOrder(safran)

    expect(entryFor(safran)).toBeUndefined()
    expect(tables.shopping).toHaveLength(0)
  })
})

describe('NP2 — le produit est introuvable (rupture en magasin)', () => {
  test('une ligne non cochée survit au rangement des achats', async () => {
    const poivre = await seed('Poivre de Malabar', 0)
    const cumin = await seed('Cumin', 0)

    await setDone(entryFor(cumin), true)
    await clearDone()

    // le cumin acheté attend « à mettre en stock », le poivre reste à acheter
    expect(receivedEntries().map(e => e.name)).toEqual(['Cumin'])
    const restant = entryFor(poivre)
    expect(restant.done).toBe(false)
    expect(restant.received).toBe(false)
    expect(poivre.qty).toBe(0)
  })
})

describe('NP3 — j\'ai coché par erreur', () => {
  test('décocher ne change rien d\'autre, ni en liste ni au stock', async () => {
    const item = await seed('Curcuma', 0)
    const entry = entryFor(item)

    await setDone(entry, true)
    await setDone(entry, false)

    expect(item.qty).toBe(0)
    expect(entry.done).toBe(false)
    expect(tables.shopping).toHaveLength(1)
    expect(store.shop).toHaveLength(1)
  })
})

describe('NP1 — retirer du panier un produit épuisé (décision Olivier du 06/07/2026)', () => {
  test('la suppression tient : le produit devient « manquant », pas de retour auto', async () => {
    const cumin = await seed('Cumin', 0)
    const entry = entryFor(cumin)
    expect(entry).toBeDefined()

    await removeShopEntry(entry)
    await syncShop()

    expect(entryFor(cumin)).toBeUndefined()
    expect(tables.shopping).toHaveLength(0)
    expect(isDismissed('Cumin')).toBe(true)
    expect(tables.ingredient_refs.find(r => r.name === 'Cumin').dismissed).toBe(true)
  })

  test('le panier remet un produit « manquant » en liste', async () => {
    const cumin = await seed('Cumin', 0)
    await removeShopEntry(entryFor(cumin))

    await toggleOrder(cumin)

    const entry = entryFor(cumin)
    expect(entry).toBeDefined()
    expect(entry.manual).toBe(false)
    expect(isDismissed('Cumin')).toBe(false)
  })

  test('le retour automatique se réarme quand le stock remonte puis s\'épuise', async () => {
    const cumin = await seed('Cumin', 0)
    await removeShopEntry(entryFor(cumin))

    await changeQty(cumin, 1)
    expect(isDismissed('Cumin')).toBe(false)

    await changeQty(cumin, -1)
    expect(entryFor(cumin)).toBeDefined()
  })

  test('le panier retire aussi une entrée automatique non cochée', async () => {
    const cumin = await seed('Cumin', 0)
    expect(entryFor(cumin)).toBeDefined()

    await toggleOrder(cumin)

    expect(entryFor(cumin)).toBeUndefined()
    expect(isDismissed('Cumin')).toBe(true)
  })
})

describe('Stock par ingrédient (commentaires Olivier du 16/07/2026)', () => {
  test('le rachat auto se déclenche sur la somme des emplacements, pas par emplacement', async () => {
    await seed('Cumin moulu', 1)
    const reserve = await seed('Cumin moulu', 1, { loc: 'Réserve entrée' })
    expect(store.shop).toHaveLength(0)

    await changeQty(reserve, -1)
    // Il en reste 1 en Cuisine : rien à racheter.
    expect(totalOf('Cumin moulu')).toBe(1)
    expect(store.shop).toHaveLength(0)

    const cuisine = store.items.find(i => i.loc === 'Cuisine')
    await changeQty(cuisine, -1)
    // Plus nulle part : une seule ligne de courses pour l'ingrédient.
    expect(store.shop).toHaveLength(1)
    expect(tables.shopping).toHaveLength(1)
  })

  test('le minimum de réserve vit au niveau ingrédient et compare la somme', async () => {
    await seed('Safran', 2)
    await seed('Safran', 1, { loc: 'Réserve entrée' })
    await setIngredientMin('Safran', 3)
    // Somme 3, minimum 3 : rien à racheter.
    expect(store.shop).toHaveLength(0)

    await changeQty(store.items[0], -1)
    // Somme 2 < 3 : rachat automatique.
    expect(store.shop).toHaveLength(1)
    expect(store.shop[0].manual).toBe(false)

    await changeQty(store.items[0], 1)
    // La somme remonte au minimum : la ligne repart.
    expect(store.shop).toHaveLength(0)
  })

  test('la vue groupée additionne les emplacements et cache ceux à zéro', async () => {
    await seed('Coriandre moulue', 2)
    await seed('Coriandre moulue', 1, { loc: 'Réserve entrée' })
    await seed('Coriandre moulue', 0, { loc: 'Sous chauffage' })

    const g = stockGroups().find(x => x.name === 'Coriandre moulue')
    expect(g.total).toBe(3)
    expect(g.rows).toHaveLength(3)
    expect(g.stocked.map(r => r.loc).sort()).toEqual(['Cuisine', 'Réserve entrée'])
  })

  test('deux synchros concurrentes ne créent qu\'une ligne de courses (verrou)', async () => {
    await seed('Cumin', 1)
    const cumin = store.items[0]
    cumin.qty = 0
    await Promise.all([syncShop(), syncShop()])
    // le second passage attend le premier (verrou + re-queue) : pas de doublon
    expect(tables.shopping).toHaveLength(1)
    expect(store.shop).toHaveLength(1)
  })

  test('supprimer un ingrédient retire toutes ses lignes et sa ligne de courses', async () => {
    await seed('Anis vert', 0)
    await seed('Anis vert', 0, { loc: 'Réserve entrée' })
    expect(store.shop).toHaveLength(1)

    await removeIngredient('Anis vert')
    await syncShop()

    expect(store.items).toHaveLength(0)
    expect(store.shop).toHaveLength(0)
    expect(tables.items).toHaveLength(0)
    expect(tables.shopping).toHaveLength(0)
  })
})

describe('NP4 — j\'ai acheté plusieurs pots d\'un coup (décision Q2 du 16/07/2026)', () => {
  test('la quantité réelle se saisit au rangement : trois pots entrent au stock', async () => {
    const cumin = await seed('Cumin', 0)
    await setDone(entryFor(cumin), true)
    await clearDone()

    await stashReceived(receivedEntries()[0], 3, 'Cuisine')

    expect(cumin.qty).toBe(3)
    expect(tables.shopping).toHaveLength(0)
  })
})

describe('Lieu d\'achat par ligne (commentaire Olivier 16/07/2026)', () => {
  test('définir le lieu d\'une ligne le mémorise sur l\'ingrédient', async () => {
    const cumin = await seed('Cumin', 0)
    const entry = entryFor(cumin)
    expect(entry.store).toBe('')

    await setEntryStore(entry, 'Grand Frais')

    expect(entry.store).toBe('Grand Frais')
    expect(cumin.store).toBe('Grand Frais')
    expect(tables.items.find(r => r.id === cumin.id).store).toBe('Grand Frais')
    // la prochaine entrée automatique arrive au bon endroit
    await removeShopEntry(entry)
    await toggleOrder(cumin)
    expect(entryFor(cumin).store).toBe('Grand Frais')
  })
})
