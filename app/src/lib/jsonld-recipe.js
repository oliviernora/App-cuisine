/**
 * Extraction d'une recette depuis le HTML d'une page web (import par URL, A1).
 * La plupart des sites de cuisine publient leurs recettes en données
 * structurées schema.org/Recipe (JSON-LD) : aucun modèle d'IA n'est requis.
 */

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', laquo: '«', raquo: '»' }

function decode(s) {
  return String(s)
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m)
}

function clean(s) {
  return decode(s).replace(/\s+/g, ' ').trim()
}

function asList(v) {
  return Array.isArray(v) ? v : v == null ? [] : [v]
}

function isRecipe(node) {
  const t = node?.['@type']
  return t === 'Recipe' || (Array.isArray(t) && t.includes('Recipe'))
}

/** Tous les objets candidats d'un document JSON-LD (racine, tableaux, @graph). */
function nodes(root) {
  const out = []
  const walk = n => {
    if (Array.isArray(n)) { n.forEach(walk); return }
    if (n && typeof n === 'object') {
      out.push(n)
      if (n['@graph']) walk(n['@graph'])
    }
  }
  walk(root)
  return out
}

/** Une ligne par ingrédient ; certains sites livrent un seul bloc avec des retours à la ligne. */
function ingredientLines(recipe) {
  return asList(recipe.recipeIngredient ?? recipe.ingredients)
    .flatMap(v => String(v).split(/\r?\n/))
    .map(clean)
    .filter(Boolean)
}

/** Étapes : chaînes, HowToStep ({ text }) ou HowToSection ({ itemListElement }).
 * Une chaîne unique avec des retours à la ligne est découpée en étapes
 * (certains sites livrent tout le texte d'un bloc — lisibilité, 16/07/2026). */
function stepTexts(v) {
  return asList(v).flatMap(step => {
    if (typeof step === 'string') return String(step).split(/\r?\n/).map(clean)
    if (step?.itemListElement) return stepTexts(step.itemListElement)
    return step?.text ? [clean(step.text)] : []
  }).filter(Boolean)
}

/** Étapes numérotées comme en ligne (« 1. … ») quand il y en a plusieurs et
 * qu'elles ne le sont pas déjà (commentaire Olivier 16/07/2026). */
export function numberedSteps(steps) {
  if (steps.length < 2 || steps.some(s => /^\d+[.)]/.test(s))) return steps.join('\n\n')
  return steps.map((s, i) => (i + 1) + '. ' + s).join('\n\n')
}

/** Photo du plat : chaîne, tableau ou ImageObject ({ url } / { contentUrl }),
 * URL relative résolue contre la page. Vide si la page n'en donne pas. */
function imageUrlOf(recipe, pageUrl) {
  for (const item of asList(recipe.image)) {
    const raw = typeof item === 'string' ? item : item?.url ?? item?.contentUrl ?? ''
    if (!raw) continue
    try { return new URL(raw, pageUrl).href } catch { /* URL malformée : suivante */ }
  }
  return ''
}

/** « 4 », ["6 personnes"], 8 → premier entier trouvé. */
function servingsOf(v) {
  for (const item of asList(v)) {
    const m = String(item).match(/\d+/)
    if (m) return Number(m[0])
  }
  return null
}

/**
 * Cherche la première recette schema.org/Recipe des blocs JSON-LD de la page.
 * Renvoie { title, servings, category, sourceName, ingredientLines, steps, url, imageUrl }
 * ou null si la page n'en contient pas.
 */
export function parseRecipeFromHtml(html, url) {
  const scripts = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  for (const [, block] of scripts) {
    let data
    try { data = JSON.parse(block) } catch { continue }
    const recipe = nodes(data).find(isRecipe)
    if (!recipe) continue
    const title = clean(recipe.name ?? recipe.headline ?? '')
    if (!title) continue
    return {
      title,
      servings: servingsOf(recipe.recipeYield),
      category: clean(asList(recipe.recipeCategory)[0] ?? ''),
      sourceName: clean(asList(recipe.publisher)[0]?.name ?? '') || new URL(url).hostname.replace(/^www\./, ''),
      ingredientLines: ingredientLines(recipe),
      steps: numberedSteps(stepTexts(recipe.recipeInstructions)),
      url,
      imageUrl: imageUrlOf(recipe, url)
    }
  }
  return null
}
