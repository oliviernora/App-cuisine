/**
 * Rapatrie le HTML d'une page de recette pour l'import par URL (A1), ou sa
 * photo de plat (body { url, image: true }, réponse { image: base64,
 * contentType }). Le navigateur ne peut pas lire une page ou une image d'un
 * autre site (CORS) : cette fonction ne fait QUE télécharger ; tout le
 * parsing (JSON-LD) reste dans l'application. Aucune clé d'IA, aucun
 * traitement.
 *
 * Déploiement (main d'Olivier) : voir docs/utilisateur/exploitation.md.
 */

import { encodeBase64 } from 'jsr:@std/encoding/base64'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' }
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  let url: URL
  let wantImage = false
  try {
    const body = await req.json()
    url = new URL(body.url)
    wantImage = body.image === true
  } catch {
    return json({ error: 'adresse invalide' }, 400)
  }
  const privateHost = /^(localhost$|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[)/
  if (!['http:', 'https:'].includes(url.protocol) || privateHost.test(url.hostname)) {
    return json({ error: 'adresse invalide' }, 400)
  }
  try {
    const res = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) garde-manger',
        accept: wantImage ? 'image/*' : 'text/html'
      },
      signal: AbortSignal.timeout(15000)
    })
    if (!res.ok) return json({ error: `page en erreur (${res.status})` }, 502)
    if (wantImage) {
      const type = (res.headers.get('content-type') ?? '').split(';')[0].trim()
      if (!type.startsWith('image/')) return json({ error: 'pas une image' }, 502)
      const buf = await res.arrayBuffer()
      if (buf.byteLength > 8_000_000) return json({ error: 'image trop lourde' }, 502)
      return json({ image: encodeBase64(buf), contentType: type })
    }
    const html = (await res.text()).slice(0, 2_000_000)
    return json({ html })
  } catch {
    return json({ error: 'page injoignable' }, 502)
  }
})
