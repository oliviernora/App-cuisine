<script>
  /* Ranger les courses (cas N13, décision Olivier 27/07/2026 — remplace le
   * flux « à mettre en stock » de l'onglet Inventaire) : sacs devant soi,
   * chaque produit se saisit ou se dicte ; s'il correspond à la liste des
   * achats, les candidats s'affichent (« huile » → huile d'olive, huile de
   * tournesol) ; sinon c'est un produit hors liste (NP14). Emplacement par
   * défaut : le dernier connu de l'ingrédient. */
  import { onMount } from 'svelte'
  import { store, rangerLigne, rangerNouveau, receivedLoc, parseDictation,
    sameIngredient, sameDictation, formatQty } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
  import { MIC } from '../lib/icons.js'

  let search = $state('')
  let picked = $state(null) // ligne achetée, ou { name } pour un produit hors liste
  let qty = $state(1)
  let loc = $state('')
  let newLoc = $state(false)
  let voiceQty = $state(1) // quantité entendue au micro (« trois sardines »)
  let message = $state('')
  let hint = $state('Sortez les produits des sacs : quelques lettres ou le micro suffisent.')
  let listening = $state(false)
  let voiceAvailable = $state(true)

  function fold(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  /* Les achats à ranger : lignes cochées (+ « reçues » d'avant la bascule). */
  const pool = $derived(store.shop.filter(s => s.done || s.received)
    .toSorted((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })))

  const candidates = $derived.by(() => {
    const q = search.trim()
    if (!q) return []
    return pool.filter(s => fold(s.name).includes(fold(q))
      || sameIngredient(s.name, q) || sameDictation(s.name, q))
  })

  const locNames = $derived.by(() => {
    const names = [...new Set([...store.items.map(i => i.loc).filter(Boolean),
      ...store.locations.map(l => l.name)])]
    return names.toSorted((a, b) => a.localeCompare(b, 'fr'))
  })

  function pick(entry) {
    picked = entry
    qty = Math.max(1, Math.round(Number(entry.qty) || voiceQty || 1))
    loc = receivedLoc(entry)
    newLoc = false
    message = ''
  }

  function pickNew() {
    const n = search.trim()
    picked = { name: n.charAt(0).toUpperCase() + n.slice(1) }
    qty = Math.max(1, voiceQty)
    loc = ''
    newLoc = false
    message = ''
  }

  async function valider(e) {
    e.preventDefault()
    const { name, id, origin } = picked
    if (id) await rangerLigne(picked, qty, loc)
    else await rangerNouveau(name, qty, loc)
    message = id && origin === 'semaine'
      ? `« ${name} » est pour une recette de la semaine — marqué « je l'ai ».`
      : `Rangé : ${name}${qty > 1 ? ' × ' + qty : ''} → ${loc.trim() || 'sans emplacement'}.`
    picked = null
    search = ''
    voiceQty = 1
  }

  let rec = null
  onMount(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { voiceAvailable = false; hint = 'Pas de reconnaissance vocale ici : tapez quelques lettres.'; return }
    rec = new SR()
    rec.lang = 'fr-FR'
    /* interimResults : sur iPhone, couper le micro à la main ne délivre
     * jamais de résultat « final » (retour Olivier 16/07/2026). */
    rec.interimResults = true
    let heard = ''
    const applyVoice = text => {
      const parsed = parseDictation(text)
      voiceQty = parsed.qty
      search = parsed.name
      hint = 'Entendu : « ' + text.trim() + ' ». Choisissez la ligne à ranger.'
    }
    rec.onstart = () => { listening = true; hint = 'Je vous écoute…' }
    rec.onend = () => {
      listening = false
      if (heard.trim()) { applyVoice(heard); heard = '' }
      else if (hint === 'Je vous écoute…') hint = 'Rien entendu — réessayez, ou tapez quelques lettres.'
    }
    rec.onerror = ev => { hint = 'Micro indisponible (' + ev.error + ').' }
    rec.onresult = ev => {
      heard = [...ev.results].map(r => r[0].transcript).join(' ')
      if (ev.results[ev.results.length - 1].isFinal) { applyVoice(heard); heard = '' }
    }
  })

  /* Le 2e appui arrête toujours la dictée (demande Olivier 16/07). */
  function toggleMic() {
    if (listening) { listening = false; rec.stop() }
    else {
      listening = true
      try { rec.start() } catch { listening = false }
    }
  }
</script>

<div class="manage-panel">
  {#if message}<p class="note manage-msg">{message}</p>{/if}

  {#if pool.length === 0}
    <p class="empty">Tout est rangé — aucun achat en attente.</p>
  {:else if picked}
    <div class="manage-block">
      <p class="name name-full"><strong>{picked.name}</strong></p>
      {#if picked.origin === 'semaine'}
        <p>Cette ligne vient des recettes de la semaine : elle sera marquée
          « je l'ai » — rien n'entre au stock.</p>
        <form class="manage-row" onsubmit={valider}>
          <button class="inv-start">Marquer « je l'ai »</button>
          <button type="button" class="inv-manage" onclick={() => picked = null}>Annuler</button>
        </form>
      {:else}
        <form class="manage-row" onsubmit={valider}>
          <label>Quantité
            <input class="f-qty" type="number" inputmode="numeric" min="1" bind:value={qty}
              aria-label={'Quantité de ' + picked.name}>
          </label>
          <label>Emplacement
            {#if newLoc}
              <input bind:value={loc} placeholder="Nouvel emplacement" aria-label="Emplacement">
            {:else}
              <select bind:value={loc} aria-label="Emplacement"
                onchange={e => { if (e.target.value === '__nouveau__') { loc = ''; newLoc = true } }}>
                <option value="">Emplacement…</option>
                {#each locNames as l (l)}<option value={l}>{l}</option>{/each}
                <option value="__nouveau__">— Nouvel emplacement… —</option>
              </select>
            {/if}
          </label>
          <button class="inv-start" disabled={!loc.trim()}>Ranger</button>
          <button type="button" class="inv-manage" onclick={() => picked = null}>Annuler</button>
        </form>
      {/if}
    </div>
  {:else}
    <div class="manage-row">
      <input class="f-name" bind:value={search} aria-label="Produit à ranger"
        placeholder="Produit sorti du sac (quelques lettres suffisent)">
      {#if voiceAvailable}
        <button class="mic" class:listening type="button" aria-label="Dicter le produit"
          onclick={toggleMic}><Icon d={MIC} /></button>
      {/if}
    </div>
    <p class="hint">{hint}</p>

    {#if search.trim()}
      <ul class="manage-items">
        {#each candidates as c (c.id)}
          <li class="row">
            <button type="button" class="rowbtn" onclick={() => pick(c)}>
              {c.name}{c.qty ? ' — ' + formatQty(c.qty, c.unit) : ''}
            </button>
            <span class="note">{c.origin === 'semaine' ? 'semaine' : c.store || ''}</span>
          </li>
        {/each}
        <li class="row">
          <button type="button" class="rowbtn" onclick={pickNew}>
            Nouveau produit « {search.trim()} » — acheté hors liste
          </button>
        </li>
      </ul>
    {:else}
      <p class="group-title">À ranger <span class="n">· {pool.length}</span></p>
      <ul class="manage-items">
        {#each pool as entry (entry.id)}
          <li class="row">
            <button type="button" class="rowbtn" onclick={() => pick(entry)}>{entry.name}</button>
            <span class="note">{entry.origin === 'semaine' ? 'semaine' : entry.store || ''}</span>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>
