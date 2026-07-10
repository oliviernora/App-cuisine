/**
 * Extraction d'une fiche recette depuis des photos par IA locale (A3).
 * Parle à Ollama sur le PC (localhost:11434) — aucune donnée ne quitte la
 * machine. Modèle et réglages issus du POC du 10/07/2026 :
 * docs/technique/poc-ollama.md (types simples dans le schéma, variante
 * -instruct, contexte 8192, images réduites à 1600 px).
 */

const OLLAMA_URL = 'http://localhost:11434'
export const OLLAMA_MODEL = 'qwen3-vl:4b-instruct'

const SCHEMA = {
  type: 'object',
  properties: {
    titre: { type: 'string' },
    personnes: { type: 'integer' },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          quantite: { type: 'string' },
          unite: { type: 'string' },
          nom: { type: 'string' }
        },
        required: ['quantite', 'unite', 'nom']
      }
    },
    etapes: { type: 'array', items: { type: 'string' } },
    remarques: { type: 'string' }
  },
  required: ['titre', 'personnes', 'ingredients', 'etapes', 'remarques']
}

const PROMPT = `Ces photos montrent une recette de cuisine (pages de livre ou de magazine).
Extrais UNIQUEMENT la recette principale, en ignorant tout texte sans rapport
(publicités, articles voisins, numéros de page).
- titre : le titre de la recette (en français s'il apparaît dans plusieurs langues)
- personnes : le nombre de personnes/parts si indiqué, sinon 0
- ingredients : un élément par ingrédient ; quantite = nombre tel qu'écrit
  ("1", "1/2", "1.5", "100") ou "" si aucun, unite = unité ("g",
  "cuil. à café", "botte"...) ou "" si aucune, nom = l'ingrédient avec sa
  préparation ("noix de cajou", "gousse d'ail hachée"...)
- etapes : les étapes de préparation, dans l'ordre, texte fidèle
- remarques : texte utile hors étapes (accompagnement, source, chef), sinon ""
Réponds fidèlement à ce qui est écrit, n'invente rien.`

/** Ollama tourne-t-il sur ce PC avec le bon modèle ? (réponse en ~1 s) */
export async function ollamaReady() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(1500) })
    if (!res.ok) return false
    const { models } = await res.json()
    return (models ?? []).some(m => m.name === OLLAMA_MODEL)
  } catch {
    return false
  }
}

/** Photos (base64 sans préfixe) → extraction brute du modèle.
 * Le premier appel charge le modèle (~1 min) ; ensuite ~30 à 90 s. */
export async function extractRecipeFromImages(images) {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    signal: AbortSignal.timeout(300000),
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      stream: false,
      format: SCHEMA,
      options: { temperature: 0, num_ctx: 8192, num_predict: 4096 },
      messages: [{ role: 'user', content: PROMPT, images }]
    })
  })
  if (!res.ok) throw new Error(`Ollama a répondu ${res.status}`)
  const data = await res.json()
  return JSON.parse(data.message.content)
}

/** Réponse du modèle → proposition pour l'écran de relecture (même forme
 * que l'import par URL : lignes d'ingrédients éditables, étapes en texte). */
export function proposalFromExtraction(ex) {
  const lines = (ex.ingredients ?? [])
    .map(i => [i.quantite, i.unite, i.nom].map(v => (v ?? '').trim()).filter(Boolean).join(' '))
    .filter(Boolean)
  let steps = (ex.etapes ?? []).map(s => s.replace(/^\*\s*/, '').trim()).filter(Boolean).join('\n\n')
  const remark = (ex.remarques ?? '').trim()
  if (remark) steps += (steps ? '\n\n' : '') + remark
  return {
    title: (ex.titre ?? '').trim(),
    servings: ex.personnes > 0 ? ex.personnes : '',
    ingredientsText: lines.join('\n'),
    steps
  }
}
