/**
 * Import d'une recette depuis un texte collé (A4) : sur iPhone/iPad, le
 * texte vient de l'OCR Apple « Texte en direct » sur la photo de la page
 * (100 % local) ; sur PC, d'un copier-coller quelconque. Le découpage est
 * heuristique — l'écran de relecture reste obligatoire.
 */

/** Une ligne d'ingrédient commence par une quantité (chiffre ou fraction),
 * une fois la puce éventuelle retirée. */
const INGREDIENT = /^[\d½⅓⅔¼¾]/

const PUCE = /^[•·\-–—*]\s*/

/**
 * Texte brut → { title, servings, ingredientsText, steps } pour l'écran
 * de relecture (même forme que les imports URL et photos).
 */
export function proposalFromText(text) {
  const lines = text.split(/\r?\n/).map(l => l.replace(PUCE, '').trim())
  let title = ''
  let servings = ''
  const ingredients = []
  const stepLines = []
  for (let line of lines) {
    if (!line) continue
    const pour = line.match(/^pour\s+(\d+)\s+(personnes?|parts?|pers\.?)\s*:?$/i)
    if (pour) { servings = Number(pour[1]); continue }
    if (!title) { title = line; continue }
    const numbered = line.match(/^\d+\s*[.)]\s+(.*)/) // « 1. Préchauffez… » = étape
    if (numbered) { stepLines.push(numbered[1]); continue }
    if (INGREDIENT.test(line) && line.length <= 80) { ingredients.push(line); continue }
    stepLines.push(line)
  }
  return {
    title,
    servings,
    ingredientsText: ingredients.join('\n'),
    steps: stepLines.join('\n\n')
  }
}
