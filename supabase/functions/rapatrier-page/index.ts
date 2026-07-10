/**
 * Rapatrie le HTML d'une page de recette pour l'import par URL (A1).
 * Le navigateur ne peut pas lire une page d'un autre site (CORS) : cette
 * fonction ne fait QUE télécharger la page ; tout le parsing (JSON-LD)
 * reste dans l'application. Aucune clé d'IA, aucun traitement.
 *
 * Déploiement (main d'Olivier) : voir docs/utilisateur/exploitation.md.
 */

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
  try {
    url = new URL((await req.json()).url)
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
        accept: 'text/html'
      },
      signal: AbortSignal.timeout(15000)
    })
    if (!res.ok) return json({ error: `page en erreur (${res.status})` }, 502)
    const html = (await res.text()).slice(0, 2_000_000)
    return json({ html })
  } catch {
    return json({ error: 'page injoignable' }, 502)
  }
})
