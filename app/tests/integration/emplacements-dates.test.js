/**
 * Tests du cas N7 — emplacements datés : réglage « à dates » sur un
 * emplacement, entrée par lots datés, sortie du plus ancien d'abord, total
 * simple au quotidien, reste « sans date » pour l'existant.
 */
import { vi, test, expect, beforeEach } from 'vitest'

vi.mock('../../src/lib/supabase.js', async () => {
  const { fakeSupabase } = await import('../helpers/fake-supabase.js')
  return { supabase: fakeSupabase }
})

import { tables, resetFake } from '../helpers/fake-supabase.js'
import {
  store, addItem, isDatedLoc, setLocationDated, lotsOf, undatedCount, enterLot, takeLot,
  setLocationStaleMonths, staleLots, startInventory, declare, lotAdjustments, finishInventory
} from '../../src/lib/store.svelte.js'

beforeEach(async () => {
  resetFake()
  store.household = { id: 'h-test', name: 'Foyer test' }
  store.items = []; store.shop = []; store.locations = []; store.lots = []
  store.recipesLoaded = false
  store.schemaWarning = false
})

test('marquer un emplacement « à dates » crée sa ligne et se voit partout', async () => {
  expect(isDatedLoc('Congélateur 1')).toBe(false)

  await setLocationDated('Congélateur 1', true)
  expect(isDatedLoc('Congélateur 1')).toBe(true)
  expect(tables.locations.find(l => l.name === 'Congélateur 1').dated).toBe(true)

  await setLocationDated('Congélateur 1', false)
  expect(isDatedLoc('Congélateur 1')).toBe(false)
  expect(tables.locations).toHaveLength(1) // pas de doublon
})

test('entrées en lots datés : le total suit, le détail garde les dates', async () => {
  await setLocationDated('Congélateur 1', true)
  await addItem({ name: 'Côte de bœuf', qty: 0, min: 0, loc: 'Congélateur 1', store: '' })
  const item = store.items[0]

  await enterLot(item, 1, '2026-05-01')
  await enterLot(item, 2, '2026-07-07')

  expect(item.qty).toBe(3) // « 3 côtes de bœuf » au quotidien
  expect(lotsOf(item.id).map(l => [l.qty, l.entered_on]))
    .toEqual([[1, '2026-05-01'], [2, '2026-07-07']]) // du plus ancien au plus récent
  expect(undatedCount(item)).toBe(0)
})

test('sortie : le plus ancien est proposé, le lot vidé disparaît', async () => {
  await setLocationDated('Congélateur 1', true)
  await addItem({ name: 'Côte de bœuf', qty: 0, min: 0, loc: 'Congélateur 1', store: '' })
  const item = store.items[0]
  await enterLot(item, 1, '2026-05-01')
  await enterLot(item, 2, '2026-07-07')

  const proposed = lotsOf(item.id)[0]
  expect(proposed.entered_on).toBe('2026-05-01')

  await takeLot(item, proposed)
  expect(item.qty).toBe(2)
  expect(lotsOf(item.id)).toHaveLength(1) // le lot de mai, vidé, a disparu
  expect(tables.item_lots).toHaveLength(1)

  // on peut désigner un autre lot que le proposé
  await takeLot(item, lotsOf(item.id)[0])
  expect(item.qty).toBe(1)
  expect(lotsOf(item.id)[0].qty).toBe(1)
})

test('stock existant avant le suivi : la différence s\'affiche « sans date »', async () => {
  await addItem({ name: 'Magret', qty: 4, min: 0, loc: 'Congélateur 2', store: '' })
  await setLocationDated('Congélateur 2', true)
  const item = store.items[0]

  expect(undatedCount(item)).toBe(4)
  await enterLot(item, 1, '2026-07-07')
  expect(item.qty).toBe(5)
  expect(undatedCount(item)).toBe(4) // seuls les 4 anciens restent sans date
})

test('rappel « à utiliser » (N10) : lots plus vieux que le seuil de l\'emplacement', async () => {
  await setLocationDated('Congélateur 1', true)
  await addItem({ name: 'Bouillon de volaille', qty: 0, min: 0, loc: 'Congélateur 1', store: '' })
  const item = store.items[0]
  await enterLot(item, 2, '2025-11-15') // ~8 mois
  await enterLot(item, 1, '2026-06-01') // ~1 mois

  const today = new Date('2026-07-08T12:00')
  expect(staleLots(today).map(v => v.lot.entered_on)).toEqual(['2025-11-15'])

  await setLocationStaleMonths('Congélateur 1', 12)
  expect(staleLots(today)).toHaveLength(0)
  expect(tables.locations.find(l => l.name === 'Congélateur 1').stale_months).toBe(12)
})

test('inventaire d\'un emplacement « à dates » : comptage plus bas = sortie du plus ancien, plus haut = « sans date »', async () => {
  await setLocationDated('Congélateur 1', true)
  await addItem({ name: 'Côte de bœuf', qty: 0, min: 0, loc: 'Congélateur 1', store: '' })
  await addItem({ name: 'Magret', qty: 0, min: 0, loc: 'Congélateur 1', store: '' })
  const [cote, magret] = store.items
  await enterLot(cote, 1, '2026-05-01')
  await enterLot(cote, 2, '2026-07-07')
  await enterLot(magret, 1, '2026-06-01')

  startInventory('Congélateur 1')
  declare(cote, 2)  // un de moins que les lots (3)
  declare(magret, 3) // deux de plus que le lot (1)

  // le bilan annonce les ajustements avant application
  expect(lotAdjustments()).toEqual([
    { name: 'Côte de bœuf', sortis: 1 },
    { name: 'Magret', sansDate: 2 }
  ])

  await finishInventory()
  expect(cote.qty).toBe(2)
  expect(lotsOf(cote.id).map(l => [l.qty, l.entered_on])).toEqual([[2, '2026-07-07']]) // sorti du plus ancien
  expect(magret.qty).toBe(3)
  expect(lotsOf(magret.id).map(l => [l.qty, l.entered_on])).toEqual([[1, '2026-06-01']])
  expect(undatedCount(magret)).toBe(2) // l'excédent est « sans date », à dater dans le détail
})

test('inventaire « à dates » : un produit non trouvé perd aussi ses lots', async () => {
  await setLocationDated('Congélateur 1', true)
  await addItem({ name: 'Côte de bœuf', qty: 0, min: 0, loc: 'Congélateur 1', store: '' })
  const item = store.items[0]
  await enterLot(item, 2, '2026-05-01')

  startInventory('Congélateur 1')
  await finishInventory()

  expect(item.qty).toBe(0)
  expect(lotsOf(item.id)).toHaveLength(0)
  expect(tables.item_lots).toHaveLength(0)
})
