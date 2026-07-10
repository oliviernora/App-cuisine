// POC A2 — extraction d'une fiche recette depuis une photo via Ollama local.
// Réglages et pièges documentés dans docs/technique/poc-ollama.md.
// Usage : node poc-extract-ollama.mjs <modele> <image1> [image2...]
//   (modèle retenu : qwen3-vl:4b-instruct ; images réduites à 1600 px)
import { readFileSync } from 'node:fs'
import { request } from 'node:http'

/** POST JSON sans timeout (node:http, contrairement à fetch/undici). */
function post(url, body) {
  return new Promise((resolve, reject) => {
    const req = request(url, { method: 'POST', headers: { 'content-type': 'application/json' } }, res => {
      let out = ''
      res.on('data', c => { out += c })
      res.on('end', () => resolve({ status: res.statusCode, text: out }))
    })
    req.on('error', reject)
    req.end(JSON.stringify(body))
  })
}

const [model, ...images] = process.argv.slice(2)
if (!model || images.length === 0) {
  console.error('Usage : node poc-extract.mjs <modele> <image1> [image2...]')
  process.exit(1)
}

const schema = {
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
          nom: { type: 'string' },
        },
        required: ['quantite', 'unite', 'nom'],
      },
    },
    etapes: { type: 'array', items: { type: 'string' } },
    remarques: { type: 'string' },
  },
  required: ['titre', 'personnes', 'ingredients', 'etapes', 'remarques'],
}

const prompt = `Cette photo montre une recette de cuisine (page de livre ou de magazine).
Extrais UNIQUEMENT la recette principale, en ignorant tout texte sans rapport
(publicités, articles voisins, numéros de page).
- titre : le titre de la recette
- personnes : le nombre de personnes/parts si indiqué, sinon 0
- ingredients : un élément par ingrédient ; quantite = nombre tel qu'écrit
  ("1", "1/2", "1.5", "100") ou "" si aucun, unite = unité ("g",
  "cuil. à café", "botte"...) ou "" si aucune, nom = l'ingrédient avec sa
  préparation ("noix de cajou", "gousse d'ail hachée"...)
- etapes : les étapes de préparation, dans l'ordre, texte fidèle
- remarques : texte utile hors étapes (accompagnement, source, chef), sinon ""
Réponds fidèlement à ce qui est écrit, n'invente rien.`

const body = {
  model,
  stream: false,
  think: process.env.POC_THINK === '1',
  format: schema,
  options: {
    temperature: 0,
    num_ctx: Number(process.env.POC_CTX ?? 8192),
    num_predict: Number(process.env.POC_PREDICT ?? 4096),
  },
  messages: [
    {
      role: 'user',
      content: prompt,
      images: images.map((p) => readFileSync(p).toString('base64')),
    },
  ],
}

const t0 = Date.now()
const res = await post('http://localhost:11434/api/chat', body)
if (res.status !== 200) {
  console.error(`Erreur Ollama ${res.status} : ${res.text}`)
  process.exit(1)
}
const data = JSON.parse(res.text)
const secs = ((Date.now() - t0) / 1000).toFixed(1)
console.log(`--- ${model} | ${images.length} image(s) | ${secs}s | fin: ${data.done_reason} | prompt ${data.prompt_eval_count} tok, réponse ${data.eval_count} tok ---`)
try {
  console.log(JSON.stringify(JSON.parse(data.message.content), null, 2))
} catch {
  console.log('JSON INCOMPLET :')
  console.log(data.message.content)
  if (data.message.thinking) console.log('THINKING (début) :', data.message.thinking.slice(0, 600))
}
