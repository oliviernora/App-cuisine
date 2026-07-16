/**
 * Réparation des fiches « en bloc » (commentaire Olivier 16/07/2026) :
 * réimporte les ÉTAPES depuis la page d'origine (JSON-LD) pour les recettes
 * de sites de cuisine dont le texte est un paragraphe unique. Les fiches
 * Passard (lepoint.fr, textes rédigés) ne sont pas touchées.
 *
 * node tmp-repare-etapes.mjs           → À BLANC (aucune écriture, rapport)
 * node tmp-repare-etapes.mjs executer  → applique (updates recipes.steps)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { parseRecipeFromHtml } from '../app/src/lib/jsonld-recipe.js'

const EXECUTER = process.argv[2] === 'executer'
const DIR = 'D:/OneDrive/Claude/Projects/App cuisine/mcp'
const raw = readFileSync(DIR + '/.env', 'utf8')
const env = {}
for (const line of raw.split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}
const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_KEY)
const { error: authErr } = await supabase.auth.signInWithPassword({
  email: env.CLAUDE_EMAIL, password: env.CLAUDE_PASSWORD
})
if (authErr) { console.error('connexion refusée : ' + authErr.message); process.exit(1) }

const { data: recipes } = await supabase.from('recipes').select('id,title,url,steps')
const candidates = recipes.filter(r => r.steps && !r.steps.includes('\n')
  && r.steps.length > 300 && r.url?.startsWith('http')
  && !r.url.includes('lepoint.fr'))
console.log((EXECUTER ? 'EXÉCUTION' : 'À BLANC') + ' — candidates : ' + candidates.length)

const plan = []
for (const r of candidates) {
  const { data, error } = await supabase.functions.invoke('rapatrier-page', { body: { url: r.url } })
  if (error || !data?.html) { console.log('ÉCHEC page  · ' + r.title); continue }
  const p = parseRecipeFromHtml(data.html, r.url)
  if (!p?.steps || !p.steps.includes('\n')) { console.log('SANS étapes · ' + r.title); continue }
  const n = p.steps.split('\n\n').length
  console.log('OK ' + String(n).padStart(2) + ' étapes · ' + r.title)
  plan.push({ id: r.id, title: r.title, steps: p.steps })
}
console.log('---')
console.log('Réparables : ' + plan.length + ' / ' + candidates.length)

if (!EXECUTER) {
  writeFileSync(DIR + '/tmp-plan-etapes.json', JSON.stringify(plan))
  console.log('Plan écrit (tmp-plan-etapes.json). Relancer avec « executer » après GO.')
  process.exit(0)
}

let done = 0
for (const p of JSON.parse(readFileSync(DIR + '/tmp-plan-etapes.json', 'utf8'))) {
  const { error } = await supabase.from('recipes').update({ steps: p.steps }).eq('id', p.id)
  if (error) { console.error('ÉCHEC update · ' + p.title + ' : ' + error.message); continue }
  done++
}
console.log('Mises à jour : ' + done)

// Reprise Q3 : les 2 commentaires de réalisation utiles rejoignent les notes.
const { data: reals } = await supabase.from('realisations').select('recipe_id,made_on,comment')
const utiles = reals.filter(x => x.comment && !x.comment.startsWith('Déjà cuisinée ('))
for (const x of utiles) {
  const { data: [rec] } = await supabase.from('recipes').select('id,notes').eq('id', x.recipe_id)
  const ligne = (x.made_on ? x.made_on.split('-').reverse().join('/') + ' : ' : '') + x.comment
  if (rec.notes?.includes(x.comment)) continue
  const notes = [rec.notes, ligne].filter(Boolean).join('\n')
  await supabase.from('recipes').update({ notes }).eq('id', rec.id)
  console.log('note reprise · ' + ligne)
}
