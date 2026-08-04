<script>
  import { onMount } from 'svelte'
  import { store, declare, adjustSeen, adjustCreated, finishInventory, abandonInventory,
    pauseInventory, lotAdjustments, looseMatch, sameIngredient, parseDictation,
    dictationMatches, sameDictation, confirmMerge, fold, exactKnownName,
    renameCreatedEntry } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
  import { addbarHeight } from '../lib/addbar.js'
  import { creerDictee } from '../lib/dictee.js'
  import { MINUS, PLUS, MIC } from '../lib/icons.js'

  let search = $state('')
  let bilan = $state(false)
  let abandoning = $state(false)
  let busy = $state(false)
  let hint = $state('Dites au micro « trois cumin moulu », ou tapez quelques lettres puis touchez la ligne trouvée.')
  let listening = $state(false)
  let voiceAvailable = $state(true)


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
  let choice = $state(null) // { name, n, candidates, extra?, voice?, from? (ligne « vue » à corriger) }

  function declareByName(name, n, voice = false) {
    search = ''
    const exact = locItems.find(i => fold(i.name) === fold(name) || sameDictation(i.name, name))
    if (exact) { declare(exact, n); return exact.name }
    const sures = locItems.filter(i => fold(i.name).includes(fold(name)) || sameIngredient(i.name, name))
    if (sures.length === 1) { declare(sures[0], n); return sures[0].name }
    const candidates = locItems.filter(i => looseMatch(i.name, name))
    /* Nom exact d'un ingrédient connu du foyer (stock d'une autre maison,
     * recettes, master list) et rien d'ambigu ici : déclaré directement,
     * il sera créé à cet emplacement (bug du 03/08, cas N2 × N12). */
    if (!candidates.length) {
      const known = exactKnownName(name)
      if (known) { declare(known, n); return known + ' (nouveau ici)' }
    }
    /* Dictée écorchée (« nuoc mame », « ras el anout ») : la master list
     * entière est proposée aussi, pas seulement l'emplacement en cours
     * (remarque Olivier 27/07/2026). */
    const extra = dictationMatches(name)
      .filter(m => !candidates.some(c => sameIngredient(c.name, m) || sameDictation(c.name, m)))
    if (candidates.length || extra.length) { choice = { name, n, candidates, extra, voice }; return null }
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
    const chosen = typeof target === 'object' ? target.name : target
    /* Correction d'une dictée confirmée → alias mémorisé dans le
     * référentiel : « nuoc mame » redéclarera « Nuoc mam » directement
     * (décision Olivier 27/07/2026). */
    if (choice.voice && !choice.from && fold(chosen) !== fold(choice.name)
      && !sameIngredient(chosen, choice.name) && !sameDictation(chosen, choice.name))
      confirmMerge(chosen, choice.name)
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

  /* Saisie directe de la quantité comptée : toucher le nombre ouvre un champ
   * (remarque Olivier 27/07/2026) — 0 remet la ligne « à vérifier ». */
  let editQty = $state(null) // id d'item, ou 'c:' + nom pour un produit créé
  let editQtyVal = $state(1)

  function openQty(key, current) {
    editQty = key
    editQtyVal = current
  }

  function saveQty(item) {
    adjustSeen(item.id, Math.max(0, Number(editQtyVal) || 0) - store.inv.seen[item.id])
    editQty = null
  }

  function saveQtyCreated(c) {
    adjustCreated(c.name, Math.max(0, Number(editQtyVal) || 0) - c.qty)
    editQty = null
  }

  /* Rectifier le nom d'un produit créé — dictée écorchée (décision Olivier
   * 04/08/2026) : ne touche que la saisie, jamais une fiche existante. */
  let editName = $state(null) // nom du produit créé en cours de rectification
  let editNameVal = $state('')

  function saveName(c) {
    const final = renameCreatedEntry(c.name, editNameVal)
    if (final !== c.name) hint = 'Rectifié : ' + final
    editName = null
  }

  function focus(node) {
    node.focus()
    node.select()
  }

  async function terminer() {
    busy = true
    await finishInventory()
  }

  function applyVoice(text) {
    const { qty: n, name } = parseDictation(text)
    const vu = declareByName(name, n, true)
    hint = vu ? 'Vu : ' + vu + (n > 1 ? ' × ' + n : '')
      : 'Plusieurs produits correspondent — choisissez dans la liste.'
  }

  let dictee = null
  onMount(() => {
    dictee = creerDictee({
      onText: applyVoice,
      onEtat: v => { listening = v },
      onMessage: m => { hint = m },
      messageRien: 'Rien entendu — réessayez, ou tapez quelques lettres.'
    })
    if (!dictee) { voiceAvailable = false; hint = 'Pas de reconnaissance vocale ici : tapez quelques lettres puis touchez la ligne.' }
  })

  function toggleMic() { dictee.toggle() }
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
        {#each choice.extra ?? [] as m (m)}
          <li class="row">
            <button type="button" class="rowbtn" onclick={() => pickChoice(m)}>
              {m} <span class="note">connu ailleurs — sera créé ici</span>
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
            {#if editQty === item.id}
              <input class="qty-edit" type="number" inputmode="numeric" min="0" bind:value={editQtyVal}
                use:focus onblur={() => saveQty(item)}
                onkeydown={e => { if (e.key === 'Enter') e.target.blur() }}
                aria-label={'Quantité comptée de ' + item.name}>
            {:else}
              <button type="button" class="qty-out" title="Saisir la quantité"
                onclick={() => openQty(item.id, store.inv.seen[item.id])}>{store.inv.seen[item.id]}</button>
            {/if}
            <button type="button" aria-label="Un pot de plus" onclick={() => adjustSeen(item.id, 1)}><Icon d={PLUS} /></button>
          </div>
        </li>
      {/each}
      {#each store.inv.created as c (c.name)}
        <li class="row seen">
          {#if editName === c.name}
            <input class="f-name" bind:value={editNameVal}
              use:focus onblur={() => saveName(c)}
              onkeydown={e => { if (e.key === 'Enter') e.target.blur() }}
              aria-label={'Rectifier le nom de ' + c.name}>
          {:else}
            <span class="name" title={c.name}>{c.name}</span>
            <button type="button" class="icon-btn" title="Rectifier le nom"
              aria-label={'Rectifier le nom de ' + c.name}
              onclick={() => { editName = c.name; editNameVal = c.name }}>✎</button>
            <span class="note">nouveau</span>
          {/if}
          <div class="qty">
            <button type="button" aria-label="Un pot de moins" onclick={() => adjustCreated(c.name, -1)}><Icon d={MINUS} /></button>
            {#if editQty === 'c:' + c.name}
              <input class="qty-edit" type="number" inputmode="numeric" min="0" bind:value={editQtyVal}
                use:focus onblur={() => saveQtyCreated(c)}
                onkeydown={e => { if (e.key === 'Enter') e.target.blur() }}
                aria-label={'Quantité comptée de ' + c.name}>
            {:else}
              <button type="button" class="qty-out" title="Saisir la quantité"
                onclick={() => openQty('c:' + c.name, c.qty)}>{c.qty}</button>
            {/if}
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
        <button type="button" onclick={pauseInventory}>Mettre en pause</button>
        <button type="button" class="primary" onclick={() => bilan = true}>Terminer l'inventaire</button>
      {/if}
    </div>
  {/if}
</section>

{#if !bilan}
  <div class="addbar" use:addbarHeight>
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
