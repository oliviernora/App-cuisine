/**
 * Parseur des lignes d'ingrédients — module PUR (sans Svelte ni Supabase),
 * partagé entre l'application et le serveur MCP.
 */

const UNITS = ['cuillères à soupe', 'cuillère à soupe', 'cuillères à café', 'cuillère à café',
  'cuil. à soupe', 'cuil. à café',
  'c. à s.', 'c. à c.', 'pincées', 'pincée', 'gousses', 'gousse', 'bottes', 'botte',
  'tranches', 'tranche', 'pièces', 'pièce', 'brins', 'brin', 'feuilles', 'feuille',
  'kg', 'mg', 'g', 'cl', 'ml', 'l', 'cs', 'cc']

const FRACTIONS = { '½': 1 / 2, '⅓': 1 / 3, '⅔': 2 / 3, '¼': 1 / 4, '¾': 3 / 4 }

/** « 500 g d'asperges vertes » → { qty: 500, qty_raw: '500', unit: 'g', name: 'asperges vertes' }.
 * Un « ! » en tête marque l'ingrédient difficile à sourcer (N11) : « ! 20 g morilles ».
 * Fractions acceptées (« ½ canard », « 1/2 poulet », « 1 ½ l », « 1½ ») : qty décimal,
 * qty_raw garde la saisie pour l'affichage. Après une virgule, le descriptif
 * (« beurre, fondu ») ; « (facultatif) » en fin de ligne marque l'ingrédient facultatif. */
export function parseIngredientLine(line) {
  let rest = line.trim().replace(/\s+/g, ' ')
  if (!rest) return null
  let hard = false
  if (rest.startsWith('!')) { hard = true; rest = rest.slice(1).trim() }
  let qty = null, qty_raw = ''
  let m
  if ((m = rest.match(/^(?:(\d+) ?)?([½⅓⅔¼¾])\s*/))) {
    qty = Number(m[1] ?? 0) + FRACTIONS[m[2]]
  } else if ((m = rest.match(/^(?:(\d+) )?(\d+)\s*\/\s*([1-9]\d*)\s*/))) {
    qty = Number(m[1] ?? 0) + Number(m[2]) / Number(m[3])
  } else if ((m = rest.match(/^(\d+(?:[.,]\d+)?)\s*/))) {
    qty = Number(m[1].replace(',', '.'))
  }
  if (m) { qty_raw = m[0].trim(); rest = rest.slice(m[0].length) }
  // « 2/3 de c. à c. de cinq-parfums » : le « de » entre quantité et unité
  // empêchait de reconnaître l'unité (constaté au M39, import URL)
  if (qty !== null) rest = rest.replace(/^d(?:e |')\s*/i, '')
  let unit = ''
  const lower = rest.toLowerCase()
  for (const u of UNITS) {
    if (lower === u || lower.startsWith(u + ' ')) { unit = u; rest = rest.slice(u.length).trim(); break }
  }
  rest = rest.replace(/^d(?:e |')\s*/i, '').trim()
  let optional = false
  rest = rest.replace(/[, ]*\(?\bfacultatif\b\)?\s*$/i, () => { optional = true; return '' }).trim()
  let note = ''
  const ci = rest.indexOf(',')
  if (ci !== -1) { note = rest.slice(ci + 1).trim(); rest = rest.slice(0, ci).trim() }
  if (!rest) return null
  return { qty, qty_raw, unit, name: rest, note, optional, hard }
}

/** Reconstruit la ligne d'édition d'un ingrédient (réciproque du parseur). */
export function ingredientLine(i) {
  return (i.hard ? '! ' : '') + [i.qty_raw || i.qty, i.unit, i.name].filter(v => v !== null && v !== undefined && v !== '').join(' ')
    + (i.note ? ', ' + i.note : '') + (i.optional ? ' (facultatif)' : '')
}
