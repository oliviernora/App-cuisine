/**
 * Tests du mode inventaire (cas N2, dicté par Olivier, et NP6).
 * Règle clé : rien n'est écrit au stock avant la confirmation finale.
 */
import { vi, test, expect, beforeEach, describe } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, declare, adjustSeen, startInventory, finishInventory,
  abandonInventory, resumeInventory, removeShopEntry, isDismissed, looseMatch,
  pauseInventory, invIsHere, renameLocation, exactKnownName,
  renameCreatedEntry, resumePausedInventory, reopenInventory, pausedInvsHere
} from '../../src/lib/store.svelte.js'

const mem = new Map()
globalThis.localStorage = {
  getItem: k => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: k => mem.delete(k)
}

beforeEach(() => {
  mem.clear()
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []
  store.shop = []
  store.refs = []
  store.inv = null
  store.invs = []
})

async function seed(name, qty, loc = 'Cuisine') {
  await addItem({ name, qty, loc, store: '' })
  return store.items.find(i => i.name === name && i.loc === loc)
}

describe('N2 — mode inventaire', () => {
  test('déroulé complet : vus, cumul, création, non-trouvés à zéro, date, courses', async () => {
    const cumin = await seed('Cumin', 1)
    const safran = await seed('Safran', 1)
    const curcuma = await seed('Curcuma', 2)
    const ailleurs = await seed('Poivre', 1, 'Cave')

    startInventory('Cuisine')
    declare(cumin, 1)
    declare(cumin, 1)            // déjà vu -> cumul
    declare(safran, 3)           // avec le nombre
    declare('Sumac', 2)          // inconnu -> création
    // curcuma jamais déclaré -> non trouvé

    // avant la confirmation, rien n'a bougé au stock
    expect(tables.items.find(r => r.id === curcuma.id).qty).toBe(2)

    await finishInventory()

    expect(cumin.qty).toBe(2)
    expect(safran.qty).toBe(3)
    expect(curcuma.qty).toBe(0)
    expect(ailleurs.qty).toBe(1) // l'inventaire ne touche que son emplacement
    const sumac = store.items.find(i => i.name === 'Sumac')
    expect(sumac.qty).toBe(2)
    expect(sumac.loc).toBe('Cuisine')
    // le non-trouvé part en courses automatiques
    expect(store.shop.some(s => s.item_id === curcuma.id)).toBe(true)
    // la date de dernier inventaire est posée
    const locRow = tables.locations.find(l => l.name === 'Cuisine')
    expect(locRow.last_inventory_at).toBeTruthy()
    expect(store.locations.find(l => l.name === 'Cuisine')?.last_inventory_at).toBeTruthy()
    expect(store.schemaWarning).toBe(false)
    expect(store.inv).toBeNull()
  })

  test('orthographes proches : « clou de girofle » retrouve « Clous de girofle » (16/07/2026)', () => {
    expect(looseMatch('clou de girofle', 'Clous de girofle')).toBe(true)
    expect(looseMatch('Clous de girofle', 'clou de girofle')).toBe(true)
    expect(looseMatch('carvi', 'Carvi noir entier')).toBe(true) // sous-chaîne, comme avant
    expect(looseMatch('épinards', 'Épinard')).toBe(true)
    expect(looseMatch('poivre noir', 'Sel fin')).toBe(false)
  })

  test('correction d\'un vu : le comptage se transfère sur le bon produit', async () => {
    const clous = await seed('Clous de girofle', 1)
    const moulus = await seed('Clous de girofle moulus', 1)
    startInventory('Cuisine')
    declare(moulus, 3) // erreur : c'était les entiers
    // correction (écran) : retirer du mauvais, déclarer le bon
    adjustSeen(moulus.id, -3)
    declare(clous, 3)
    expect(store.inv.seen[moulus.id]).toBeUndefined()
    expect(store.inv.seen[clous.id]).toBe(3)

    await finishInventory()
    expect(clous.qty).toBe(3)
    expect(moulus.qty).toBe(0) // jamais recompté : à zéro
  })

  test('correction d\'erreur : redescendre un vu à zéro le remet à vérifier', async () => {
    const cumin = await seed('Cumin', 1)
    startInventory('Cuisine')
    declare(cumin, 2)
    adjustSeen(cumin.id, -1)
    expect(store.inv.seen[cumin.id]).toBe(1)
    adjustSeen(cumin.id, -1)
    expect(store.inv.seen[cumin.id]).toBeUndefined()
  })

  test('un produit vu épuisé retrouve son retour automatique (dismissed remis à zéro)', async () => {
    const cumin = await seed('Cumin', 0)
    await removeShopEntry(store.shop.find(s => s.item_id === cumin.id)) // retiré du panier avant l'inventaire
    expect(isDismissed('Cumin')).toBe(true)

    startInventory('Cuisine')
    declare(cumin, 2)
    await finishInventory()

    expect(cumin.qty).toBe(2)
    expect(isDismissed('Cumin')).toBe(false)
  })
})

describe('N6 × N2 — renommages pendant un inventaire (bug du 03/08)', () => {
  test('permuter les noms de deux boîtes : l\'inventaire suit SA boîte physique', async () => {
    const creme = await seed('Crème de soin', 2, 'soin 1')
    const savon = await seed('Savon', 3, 'soin 2')

    startInventory('soin 1')
    declare(creme, 2)

    // Permutation par nom provisoire (scénario réel d'Olivier, 03/08) :
    await renameLocation('soin 2', 'soin 3')
    await renameLocation('soin 1', 'soin 2')
    await renameLocation('soin 3', 'soin 1')

    // La boîte physique inventoriée s'appelle désormais « soin 2 ».
    expect(store.inv.loc).toBe('soin 2')
    expect(creme.loc).toBe('soin 2')

    await finishInventory()
    expect(creme.qty).toBe(2) // vue, comptée
    expect(savon.qty).toBe(3) // l'AUTRE boîte n'est jamais touchée
  })

  test('renommage pendant une pause : la reprise retrouve la boîte', async () => {
    const creme = await seed('Crème de soin', 1, 'soin 1')
    startInventory('soin 1')
    declare(creme, 1)
    pauseInventory()

    await renameLocation('soin 1', 'salle de bain')

    expect(pausedInvsHere().map(p => p.loc)).toEqual(['salle de bain'])
    // et l'inventaire sauvegardé (localStorage) suit aussi
    store.invs = []
    resumeInventory()
    expect(store.invs[0].loc).toBe('salle de bain')

    resumePausedInventory('salle de bain')
    expect(store.inv.loc).toBe('salle de bain')
    expect(store.inv.seen[creme.id]).toBe(1)
  })

  test('fusion de deux boîtes inventoriées : les comptages fusionnent aussi', async () => {
    const creme = await seed('Crème de soin', 1, 'soin 1')
    const savon = await seed('Savon', 2, 'soin 2')
    startInventory('soin 1')
    declare(creme, 1)
    pauseInventory()
    startInventory('soin 2')
    declare(savon, 2)

    await renameLocation('soin 1', 'soin 2') // fusion (confirmée à l'écran)

    // un seul inventaire subsiste, avec les deux comptages
    expect(store.inv.loc).toBe('soin 2')
    expect(pausedInvsHere()).toEqual([])
    expect(store.inv.seen[creme.id]).toBe(1)
    expect(store.inv.seen[savon.id]).toBe(2)
  })
})

describe('N2 × N12 — ingrédient connu du foyer, absent de la résidence (bug du 03/08)', () => {
  test('le nom exact d\'un ingrédient connu (recettes/master list) est reconnu', () => {
    // « Cumin moulu » existe à Argenteuil : ici (Montalivet) il n'est connu
    // que par les recettes du foyer et la master list.
    store.ingredients = [{ name: 'Cumin moulu' }]
    expect(exactKnownName('cumin moulu')).toBe('Cumin moulu')
    expect(exactKnownName('Cumin moulu')).toBe('Cumin moulu')
    expect(exactKnownName('Cum Moul')).toBeNull() // partiel : autre chemin (création)
    expect(exactKnownName('')).toBeNull()
    store.ingredients = []
  })

  test('via la master list (référentiel) et ses alias', () => {
    store.refs = [{ name: 'Nuoc mam', aliases: ['nuoc mame'], rejected: [] }]
    expect(exactKnownName('nuoc mam')).toBe('Nuoc mam')
    expect(exactKnownName('nuoc mame')).toBe('Nuoc mam')
    store.refs = []
  })
})

describe('N2 — rectifier le nom d\'un produit créé (décision Olivier 04/08)', () => {
  test('dictée écorchée : le nom est rectifié, la graphie du foyer reprise', async () => {
    store.ingredients = [{ name: 'Cumin moulu' }]
    startInventory('Cuisine')
    declare('Cumun moulu', 2)

    const final = renameCreatedEntry('Cumun moulu', 'cumin moulu')

    expect(final).toBe('Cumin moulu')
    expect(store.inv.created).toEqual([{ name: 'Cumin moulu', qty: 2 }])
    store.ingredients = []
  })

  test('le nouveau nom désigne un produit de l\'emplacement : le comptage le rejoint', async () => {
    const cumin = await seed('Cumin moulu', 1)
    startInventory('Cuisine')
    declare('Cumun moulu', 3)

    const final = renameCreatedEntry('Cumun moulu', 'Cumin moulu')

    expect(final).toBe('Cumin moulu')
    expect(store.inv.created).toEqual([])
    expect(store.inv.seen[cumin.id]).toBe(3)
  })

  test('jamais la fiche d\'un produit existant : rectifier ne renomme rien au stock', async () => {
    const cumin = await seed('Cumin', 1, 'Cave') // fiche existante, autre emplacement
    startInventory('Cuisine')
    declare('Cumin filet', 1)

    renameCreatedEntry('Cumin filet', 'Cumin en filaments')

    expect(cumin.name).toBe('Cumin') // la fiche existante n'a pas bougé
    expect(store.inv.created).toEqual([{ name: 'Cumin en filaments', qty: 1 }])
  })

  test('deux saisies rectifiées vers le même nom fusionnent', () => {
    startInventory('Cuisine')
    declare('Safran poudre', 1)
    declare('Safran en poudre', 2)

    renameCreatedEntry('Safran poudre', 'Safran en poudre')

    expect(store.inv.created).toEqual([{ name: 'Safran en poudre', qty: 3 }])
  })

  test('nom vide ou inchangé : rien ne bouge', () => {
    startInventory('Cuisine')
    declare('Sumac', 2)
    expect(renameCreatedEntry('Sumac', '  ')).toBe('Sumac')
    expect(renameCreatedEntry('Sumac', 'Sumac')).toBe('Sumac')
    expect(store.inv.created).toEqual([{ name: 'Sumac', qty: 2 }])
  })
})

describe('NP6 — interruption et abandon', () => {
  test('l\'inventaire interrompu se retrouve au retour (localStorage)', async () => {
    const cumin = await seed('Cumin', 1)
    startInventory('Cuisine')
    declare(cumin, 2)

    store.inv = null // « je pose le téléphone » (perte de l'état mémoire)
    resumeInventory()

    expect(store.inv.loc).toBe('Cuisine')
    expect(store.inv.seen[cumin.id]).toBe(2)
  })

  test('pause explicite : sauvegardée, elle survit à un rechargement, la reprise la lève (27/07/2026, élargie 04/08)', async () => {
    const cumin = await seed('Cumin', 1)
    startInventory('Cuisine')
    declare(cumin, 2)

    pauseInventory()
    expect(store.inv).toBeNull() // l'inventaire attend dans la liste des pauses
    expect(pausedInvsHere().map(p => p.loc)).toEqual(['Cuisine'])

    store.invs = [] // rechargement de l'app
    resumeInventory()
    expect(store.invs[0].seen[cumin.id]).toBe(2)

    resumePausedInventory('Cuisine')
    expect(store.inv.loc).toBe('Cuisine')
    expect(pausedInvsHere()).toEqual([])
    await finishInventory()
    expect(cumin.qty).toBe(2)
  })

  test('plusieurs inventaires en pause de front, repris indépendamment (04/08/2026)', async () => {
    const creme = await seed('Crème', 1, 'soin 1')
    const savon = await seed('Savon', 1, 'soin 2')

    startInventory('soin 1')
    declare(creme, 1)
    pauseInventory()
    startInventory('soin 2')
    declare(savon, 2)
    pauseInventory()
    expect(pausedInvsHere().map(p => p.loc)).toEqual(['soin 1', 'soin 2'])

    // les deux survivent à un rechargement
    store.invs = []
    resumeInventory()
    expect(store.invs).toHaveLength(2)

    resumePausedInventory('soin 1')
    expect(store.inv.loc).toBe('soin 1')
    await finishInventory()
    expect(creme.qty).toBe(1)
    // l'autre inventaire n'a pas bougé
    expect(pausedInvsHere().map(p => p.loc)).toEqual(['soin 2'])
    resumePausedInventory('soin 2')
    await finishInventory()
    expect(savon.qty).toBe(2)
  })

  test('un emplacement = un seul inventaire : redémarrer reprend la pause (04/08/2026)', async () => {
    const cumin = await seed('Cumin', 1)
    startInventory('Cuisine')
    declare(cumin, 2)
    pauseInventory()

    startInventory('Cuisine') // ne repart PAS de zéro : reprend la pause

    expect(store.inv.seen[cumin.id]).toBe(2)
    expect(pausedInvsHere()).toEqual([])
  })

  test('démarrer ailleurs pendant un inventaire ouvert : l\'ouvert passe en pause, rien n\'est perdu (04/08/2026)', async () => {
    const creme = await seed('Crème', 1, 'soin 1')
    await seed('Savon', 1, 'soin 2')
    startInventory('soin 1')
    declare(creme, 1)

    startInventory('soin 2')

    expect(store.inv.loc).toBe('soin 2')
    expect(pausedInvsHere().map(p => p.loc)).toEqual(['soin 1'])
    expect(pausedInvsHere()[0].seen[creme.id]).toBe(1)
  })

  test('rouvrir un inventaire terminé : les produits comptés restent vus, on ajoute (04/08/2026)', async () => {
    const cumin = await seed('Cumin', 1)
    const safran = await seed('Safran', 1)
    startInventory('Cuisine')
    declare(cumin, 2)
    await finishInventory() // safran non trouvé -> 0

    reopenInventory('Cuisine')
    // le stock actuel vaut comptage : cumin vu (2), safran (0) reste à vérifier
    expect(store.inv.seen[cumin.id]).toBe(2)
    expect(store.inv.seen[safran.id]).toBeUndefined()
    declare('Sumac', 1) // l'objet venu d'une autre boîte

    await finishInventory()
    expect(cumin.qty).toBe(2) // inchangé
    expect(safran.qty).toBe(0) // toujours épuisé
    expect(store.items.find(i => i.name === 'Sumac')?.qty).toBe(1)
  })

  test('ancien format localStorage (un seul inventaire) : repris sans perte', async () => {
    const cumin = await seed('Cumin', 1)
    mem.set('gm-inventaire-v1', JSON.stringify({
      loc: 'Cuisine', residenceId: null, seen: { [cumin.id]: 2 }, created: [], paused: true
    }))

    resumeInventory()

    expect(pausedInvsHere().map(p => p.loc)).toEqual(['Cuisine'])
    expect(store.invs[0].seen[cumin.id]).toBe(2)
  })

  test('abandonner ne laisse aucune écriture : le stock est intact', async () => {
    const cumin = await seed('Cumin', 5)
    startInventory('Cuisine')
    declare(cumin, 1)
    declare('Sumac', 3)

    abandonInventory()

    expect(store.inv).toBeNull()
    expect(tables.items.find(r => r.id === cumin.id).qty).toBe(5)
    expect(store.items.some(i => i.name === 'Sumac')).toBe(false)
    expect(tables.locations).toHaveLength(0)
    resumeInventory()
    expect(store.inv).toBeNull()
  })
})
