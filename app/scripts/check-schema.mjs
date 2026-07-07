/** Vérifie que le schéma de la vraie base correspond à supabase/schema.sql (via l'API REST). */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const env = readFileSync(fileURLToPath(new URL('../.env', import.meta.url)), 'utf8')
const get = key => env.match(new RegExp(key + '=(.+)'))[1].trim()
const URL_BASE = get('VITE_SUPABASE_URL')
const KEY = get('VITE_SUPABASE_KEY')

const CHECKS = {
  households: 'id,name',
  household_members: 'household_id,user_id',
  items: 'id,qty,min,dismissed',
  shopping: 'id,done,manual,item_id',
  locations: 'id,name,last_inventory_at',
  sources: 'id,kind,title,isbn',
  recipes: 'id,source_id,title,url,video,notes,steps',
  recipe_ingredients: 'id,recipe_id,position,qty,unit,name',
  realisations: 'id,recipe_id,made_on,comment',
  events: 'id,day,title,guests,contraintes',
  event_recipes: 'event_id,recipe_id'
}

let failed = false
for (const [table, cols] of Object.entries(CHECKS)) {
  const res = await fetch(`${URL_BASE}/rest/v1/${table}?select=${cols}&limit=1`, { headers: { apikey: KEY } })
  console.log(table + ' (' + cols + ') : ' + (res.ok ? 'OK' : 'MANQUANT (' + res.status + ')'))
  if (!res.ok) failed = true
}
process.exit(failed ? 1 : 0)
