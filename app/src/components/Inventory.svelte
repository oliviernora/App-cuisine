<script>
  import { onMount } from 'svelte'
  import { store, declare, adjustSeen, adjustCreated, finishInventory, abandonInventory,
    lotAdjustments, looseMatch, sameIngredient } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
  import { MINUS, PLUS, MIC } from '../lib/icons.js'

  let search = $state('')
  let bilan = $state(false)
  let abandoning = $state(false)
  let busy = $state(false)
  let hint = $state('Dites au micro « trois cumin moulu », ou tapez quelques lettres puis touchez la ligne trouvée.')
  let listening = $state(false)
  let voiceAvailable = $state(true)

  function fold(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  const locItems = $derived(store.items.filter(i => i.loc === store.inv.loc)
    .toSorted((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })))
  const toCheck = $derived(locItems.filter(i => store.inv.seen[i.id] === undefined)
    .filter(i => !search || fold(i.name).includes(fold(search))))
  const seenItems = $derived(locItems.filter(i => store.inv.seen[i.id] !== undefined))
  const notFound = $derived(locItems.filter(i => store.inv.seen[i.id] === undefined))
  /* Emplacement « à dates » : ajustements de lots à confirmer au bilan (N2 × N7). */
  const lotAdjs = $derived(lotAdjustments())

  /* Ambiguïté (demande Olivier 07/07) : « carvi » peut correspondre à carvi,
   * carvi noir, carvi noir entier… → un menu de choix, jamais de pari.
   * Depuis le 16/07 : les orthographes proches (« clou » ≈ « clous de
   * girofle ») sont retrouvées aussi ; un rapprochement au singulier près
   * passe toujours par le menu, jamais déclaré d'office. */
  let choice = $state(null) // { name, n, candidates, from? (ligne « vue » à corriger) }

  function declareByName(name, n) {
    search = ''
    const exact = locItems.find(i => fold(i.name) === fold(name))
    if (exact) { declare(exact, n); return exact.name }
    const sures = locItems.filter(i => fold(i.name).includes(fold(name)) || sameIngredient(i.name, name))
    if (sures.length === 1) { declare(sures[0], n); return sures[0].name }
    const candidates = locItems.filter(i => looseMatch(i.name, name))
    if (candidates.length >= 1) { choice = { name, n, candidates }; return null }
    declare(name, n)
    return name + ' (nouveau)'
  }

  /* Corriger une saisie « vue » (demande Olivier 16/07) : mauvaise variante
   * choisie → le comptage se transfère sur le bon produit, ou repart
   * « à vérifier ». */
  function fixSeen(item) {
    const n = store.inv.seen[item.id]
    choice = {
      name: item.name, n, from: item,
      candidates: locItems.filter(i => i.id !== item.id && looseMatch(i.name, item.name))
    }
  }

  function pickChoice(target) {
    if (choice.from) adjustSeen(choice.from.id, -choice.n)
    declare(target, choice.n)
    hint = 'Vu : ' + (typeof target === 'object' ? target.name : target + ' (nouveau)')
    choice = null
  }

  function submit(e) {
    e.preventDefault()
    if (!search.trim()) return
    const vu = declareByName(search.trim(), 1)
    hint = vu ? 'Vu : ' + vu : 'Plusieurs produits correspondent — choisissez dans la liste.'
  }

  async function terminer() {
    busy = true
    await finishInventory()
  }

  const NUMBER_WORDS = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10 }
  let rec = null
  onMount(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { voiceAvailable = false; hint = 'Pas de reconnaissance vocale ici : tapez quelques lettres puis touchez la ligne.'; return }
    rec = new SR()
    rec.lang = 'fr-FR'
    rec.onstart = () => { listening = true; hint = 'Je vous écoute…' }
    rec.onend = () => { listening = false }
    rec.onerror = ev => { hint = 'Micro indisponible (' + ev.error + ').' }
    rec.onresult = ev => {
      let words = ev.results[0][0].transcript.trim().toLowerCase().split(/\s+/)
      let n = 1
      if (/^\d+$/.test(words[0])) { n = Number(words[0]); words = words.slice(1) }
      else if (NUMBER_WORDS[words[0]]) { n = NUMBER_WORDS[words[0]]; words = words.slice(1) }
      const vu = declareByName(words.join(' '), n)
      hint = vu ? 'Vu : ' + vu + (n > 1 ? ' × ' + n : '')
        : 'Plusieurs produits correspondent — choisissez dans la liste.'
    }
  })

  /* Le 2e appui arrête TOUJOURS la dictée (demande Olivier 16/07) : l'état
   * est posé au toucher, sans attendre l'événement onstart — sur iPhone il
   * peut ne jamais venir, et le bouton restait « sourd ». */
  function toggleMic() {
    if (listening) { listening = false; rec.stop() }
    else {
      listening = true
      try { rec.start() } catch { listening = false }
    }
  }
</script>

<section class="inventory">
  <div class="inv-header">
    <h2>Inventaire — {store.inv.loc}</h2>
    <p class="muted">{seenItems.length + store.inv.created.length} vus · {notFound.length} à vérifier</p>
  </div>

  {#if choice}
    <div class="panel">
      {#if choice.from}
        <p>« {choice.name} »{choice.n > 1 ? ' × ' + choice.n : ''} — ce n'était pas le bon produit ?</p>
      {:else}
        <p>« {choice.name} »{choice.n > 1 ? ' × ' + choice.n : ''} — plusieurs produits correspondent :</p>
      {/if}
      <ul class="manage-items">
        {#each choice.candidates as c (c.id)}
          <li class="row">
            <button type="button" class="rowbtn" onclick={() => pickChoice(c)}>
              {c.name}
            </button>
          </li>
        {/each}
        {#if choice.from}
          <li class="row">
            <button type="button" class="rowbtn" onclick={() => { adjustSeen(choice.from.id, -choice.n); hint = '« ' + choice.name + ' » est reparti à vérifier.'; choice = null }}>
              Ce n'était rien — remettre « {choice.name} » à vérifier
            </button>
          </li>
        {:else}
          <li class="row">
            <button type="button" class="rowbtn" onclick={() => pickChoice(choice.name)}>
              Nouveau produit « {choice.name} »
            </button>
          </li>
        {/if}
      </ul>
      <button type="button" class="inv-manage" onclick={() => choice = null}>Annuler</button>
    </div>
  {/if}

  {#if bilan}
    <div class="panel bilan">
      <h2>Bilan de l'inventaire</h2>
      {#if notFound.length}
        <p>Produits non trouvés — ils passeront à zéro pot (et en courses) :</p>
        <ul>
          {#each notFound as item (item.id)}<li class="row"><span class="name">{item.name}</span></li>{/each}
        </ul>
      {:else}
        <p>Tout a été trouvé.</p>
      {/if}
      {#if lotAdjs.length}
        <p>Emplacement « à dates » — ajustement des lots au comptage :</p>
        <ul>
          {#each lotAdjs as adj (adj.name)}
            <li class="row">
              <span class="name">{adj.name}</span>
              <span class="note">{adj.sortis
                ? `− ${adj.sortis} des lots les plus anciens`
                : `+ ${adj.sansDate} « sans date » (à dater dans le détail du stock)`}</span>
            </li>
          {/each}
        </ul>
      {/if}
      <button class="submit" disabled={busy} onclick={terminer}>C'est exact — appliquer l'inventaire</button>
      <button class="submit secondary" disabled={busy} onclick={() => bilan = false}>Continuer l'inventaire</button>
    </div>
  {:else}
    <p class="group-title">Vus <span class="n">· {seenItems.length + store.inv.created.length}</span></p>
    <ul>
      {#each seenItems as item (item.id)}
        <li class="row seen">
          <button type="button" class="rowbtn-full info" title="Corriger : ce n'était pas ce produit ?"
            onclick={() => fixSeen(item)}>
            <span class="name">{item.name}</span>
          </button>
          <div class="qty">
            <button type="button" aria-label="Un pot de moins" onclick={() => adjustSeen(item.id, -1)}><Icon d={MINUS} /></button>
            <output>{store.inv.seen[item.id]}</output>
            <button type="button" aria-label="Un pot de plus" onclick={() => adjustSeen(item.id, 1)}><Icon d={PLUS} /></button>
          </div>
        </li>
      {/each}
      {#each store.inv.created as c (c.name)}
        <li class="row seen">
          <span class="name" title={c.name}>{c.name}</span>
          <span class="note">nouveau</span>
          <div class="qty">
            <button type="button" aria-label="Un pot de moins" onclick={() => adjustCreated(c.name, -1)}><Icon d={MINUS} /></button>
            <output>{c.qty}</output>
            <button type="button" aria-label="Un pot de plus" onclick={() => adjustCreated(c.name, 1)}><Icon d={PLUS} /></button>
          </div>
        </li>
      {/each}
    </ul>

    <p class="group-title">À vérifier <span class="n">· {toCheck.length}</span></p>
    <ul>
      {#each toCheck as item (item.id)}
        <li class="row tocheck">
          <button type="button" class="rowbtn" onclick={() => { declare(item, 1); hint = 'Vu : ' + item.name }}>
            {item.name}
          </button>
        </li>
      {/each}
    </ul>

    <div class="toolbar inv-actions">
      {#if abandoning}
        <button type="button" class="danger-btn" onclick={abandonInventory}>Confirmer l'abandon</button>
        <button type="button" onclick={() => abandoning = false}>Non, je continue</button>
      {:else}
        <button type="button" onclick={() => abandoning = true}>Abandonner</button>
        <button type="button" class="primary" onclick={() => bilan = true}>Terminer l'inventaire</button>
      {/if}
    </div>
  {/if}
</section>

{#if !bilan}
  <div class="addbar">
    <form onsubmit={submit} autocomplete="off">
      <input class="f-name" bind:value={search} placeholder="Produit trouvé (quelques lettres suffisent)">
      {#if voiceAvailable}
        <button class="mic" class:listening type="button" aria-label="Déclarer à la voix"
          onclick={toggleMic}><Icon d={MIC} /></button>
      {/if}
      <button class="submit">Vu</button>
      <p class="hint">{hint}</p>
    </form>
  </div>
{/if}
