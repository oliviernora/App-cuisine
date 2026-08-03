/**
 * Dictée vocale partagée (Stock, Inventaire, Ranger les courses).
 *
 * Encapsule les contournements iPhone durement acquis :
 * - interimResults + tampon : couper le micro à la main ne délivre jamais de
 *   résultat « final » — on garde le dernier texte entendu et on le traite à
 *   la fin (retour Olivier 16/07/2026) ;
 * - le 2e appui arrête TOUJOURS la dictée : l'état est posé au toucher, sans
 *   attendre onstart, parfois absent sur iPhone (demande Olivier 16/07).
 *
 * Renvoie null si la reconnaissance vocale n'existe pas dans ce navigateur.
 * onText(texte) reçoit le texte entendu, onEtat(bool) l'état du micro,
 * onMessage(texte) les indications à afficher ; messageRien s'affiche quand
 * la dictée se termine sans avoir rien entendu.
 */
export function creerDictee({ onText, onEtat, onMessage, messageRien }) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SR) return null
  const rec = new SR()
  rec.lang = 'fr-FR'
  rec.interimResults = true
  let heard = ''
  let vierge = false // « Je vous écoute… » affiché, rien reçu ni appliqué
  let on = false
  const apply = () => { onText(heard); heard = ''; vierge = false }
  rec.onstart = () => { on = true; onEtat(true); vierge = true; onMessage('Je vous écoute…') }
  rec.onend = () => {
    on = false
    onEtat(false)
    if (heard.trim()) apply()
    else if (vierge) onMessage(messageRien)
  }
  rec.onerror = ev => { vierge = false; onMessage('Micro indisponible (' + ev.error + '). Utilisez la dictée du clavier.') }
  rec.onresult = ev => {
    heard = [...ev.results].map(r => r[0].transcript).join(' ')
    if (ev.results[ev.results.length - 1].isFinal) apply()
  }
  return {
    toggle() {
      if (on) { on = false; onEtat(false); rec.stop() }
      else {
        on = true
        onEtat(true)
        try { rec.start() } catch { on = false; onEtat(false) }
      }
    }
  }
}
