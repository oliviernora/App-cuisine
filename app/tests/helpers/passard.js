/** Fixture des tests : amorce la bibliothèque avec les 105 recettes vidéo
 * d'Alain Passard. La fonction équivalente de l'application (importPassard)
 * a été retirée le 27/07/2026 (mission accomplie : recettes en base depuis
 * le 06/07/2026, fiches remplies le 07/07) — les tests d'intégration s'en
 * servent toujours comme jeu de données réaliste. */
import { supabase } from '../../src/lib/supabase.js'
import { store } from '../../src/lib/store.svelte.js'
import { PASSARD_SOURCE, PASSARD_RECIPES } from './passard-data.js'

export async function importPassard() {
  const hid = store.household.id
  // Garde-fou historique : jamais de réimport si la source existe déjà.
  const { data: dejaLa } = await supabase.from('sources')
    .select('id').eq('household_id', hid).eq('title', PASSARD_SOURCE.title).limit(1)
  if (dejaLa?.length) return
  const { data: src, error } = await supabase.from('sources')
    .insert({ ...PASSARD_SOURCE, household_id: hid }).select().single()
  if (error || !src) { store.schemaWarning = true; return }
  const rows = PASSARD_RECIPES.map(r => ({
    household_id: hid, source_id: src.id, title: r.title, url: r.url, video: r.video
  }))
  const { data: created } = await supabase.from('recipes').insert(rows).select()
  if (!created) { store.schemaWarning = true; return }
  store.sources.push(src)
  store.recipes.push(...created)
  const done = PASSARD_RECIPES.filter(r => r.done)
    .map(r => created.find(c => c.video === r.video)).filter(Boolean)
  if (done.length) {
    const { data: reals } = await supabase.from('realisations')
      .insert(done.map(d => ({
        household_id: hid, recipe_id: d.id, made_on: null,
        comment: 'Déjà cuisinée (import Alain Passard, date non notée)'
      }))).select()
    if (reals) store.realisations.push(...reals)
  }
}
