<script>
  import { onMount } from 'svelte'
  import { store, addItem, changeQty, toggleOrder, stockGroups, shopEntryOf,
    setIngredientMin, renameIngredient, removeIngredient, setIngredientCategory, categoryOf,
    knownNames, sameIngredient, isDatedLoc, lotsOf, undatedCount, enterLot, takeLot,
    parseDictation, dictationMatches, sameDictation, confirmMerge, moveItem,
    markEpuise } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
  import SousEcran from './SousEcran.svelte'
  import { addbarHeight } from '../lib/addbar.js'
  import { MINUS, PLUS, CART, CART_PLUS, MIC } from '../lib/icons.js'

  const STORES = ['Leclerc', 'Grand Frais', 'Marché', 'Boutique spécialisée', 'Internet']

  /* Deux portes d'entrée vers la même liste (N14, décision Olivier
   * 27/07/2026) : sans `loc`, tout le stock (onglet Stock) ; avec `loc`,
   * les ingrédients présents dans cet emplacement (depuis l'Inventaire),
   * barre d'ajout préréglée sur l'emplacement. */
  let { loc = '' } = $props()

  let search = $state('')
  let genreFilter = $state('')

  /* Filtre par genre d'ingrédient (master list) dans la recherche (demande Olivier 08/07). */
  const genreNames = $derived([...new Set([...store.categories.map(c => c.name),
    ...store.refs.map(r => r.category).filter(Boolean)])].toSorted((a, b) => a.localeCompare(b, 'fr')))
  let name = $state('')
  let qty = $state(1)
  /* svelte-ignore state_referenced_locally — capture initiale voulue : la
   * porte d'entrée (loc) ne change pas pour une instance donnée. */
  let itemLoc = $state(loc)
  let itemStore = $state('')
  let newLoc = $state(false)

  /* Les emplacements peuvent être nombreux : liste déroulante des existants,
   * avec une entrée « Nouvel emplacement… » (demande Olivier 07/07). Seuls
   * les emplacements de la résidence courante apparaissent — plus de liste
   * par défaut codée en dur (commentaires Olivier 25/07/2026). */
  const locNames = $derived.by(() => {
    const names = [...new Set([...store.items.map(i => i.loc).filter(Boolean),
      ...store.locations.map(l => l.name)])]
    return names.toSorted((a, b) => a.localeCompare(b, 'fr'))
  })
  let hint = $state('Micro : dites par exemple « deux garam masala ». La dictée du clavier iPhone marche aussi.')
  let listening = $state(false)
  let voiceAvailable = $state(true)

  function fold(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  /* Le stock se lit par ingrédient (commentaires Olivier du 16/07/2026) : une
   * seule liste alphabétique, la somme de tous les emplacements sur la ligne ;
   * le détail par endroit se déplie quand il y a plusieurs emplacements. */
  const groups = $derived.by(() => {
    let list = stockGroups()
    if (loc) list = list.filter(g => g.rows.some(r => r.loc === loc))
    if (search) list = list.filter(g => fold(g.name).includes(fold(search)))
    if (genreFilter) list = list.filter(g => categoryOf(g.name) === genreFilter)
    return list
  })

  let open = $state(null) // clé du groupe dont le détail des emplacements est déplié

  /* Lignes compactes (remarque Olivier 27/07/2026) : la liste ne montre que
   * nom + nombre + emplacement ; toucher l'ingrédient déplie le nom complet
   * et une seconde ligne avec l'emplacement et tous les boutons. */
  let sel = $state(null)

  function toggleSel(g) {
    sel = sel === g.key ? null : g.key
    open = null
    moving = null
  }

  function locLabel(g) {
    const rows = g.stocked.length ? g.stocked : g.rows
    if (rows.length === 1) return rows[0].loc || 'sans emplacement'
    return rows.length + ' emplacements'
  }

  /** L'unique ligne d'emplacement visée par les + / − de la ligne principale
   * (une seule ligne, ou une seule encore garnie), sinon null : le détail tranche. */
  function soloRow(g) {
    if (g.rows.length === 1) return g.rows[0]
    if (g.stocked.length === 1) return g.stocked[0]
    return null
  }

  /* Emplacements datés (N7) : « + » entre un lot daté du jour, « − » sort du
   * lot le plus ancien ; le détail déplié montre les dates. */
  let lotQty = $state(1)
  let lotDate = $state('')

  function toggleDetail(g) {
    open = open === g.key ? null : g.key
    lotQty = 1
    lotDate = new Date().toISOString().slice(0, 10)
    moving = null
  }

  /* Déplacer une ligne d'emplacement vers un autre (remarque Olivier
   * 27/07/2026) — moveItem fusionne si le produit existe déjà là-bas. */
  let moving = $state(null)
  let moveDest = $state('')
  let moveNew = $state(false)

  function startMove(item) {
    moving = moving === item.id ? null : item.id
    moveDest = ''
    moveNew = false
  }

  async function doMove(item, e) {
    e.preventDefault()
    await moveItem(item, moveDest)
    moving = null
  }

  function dateFr(d) {
    return new Date(d + 'T00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  async function plus(item) {
    if (isDatedLoc(item.loc)) await enterLot(item, 1, new Date().toISOString().slice(0, 10))
    else await changeQty(item, 1)
  }

  async function moins(item) {
    const lot = isDatedLoc(item.loc) ? lotsOf(item.id)[0] : null
    if (lot) await takeLot(item, lot)
    else await changeQty(item, -1)
  }

  async function enter(item, e) {
    e.preventDefault()
    await enterLot(item, lotQty, lotDate || new Date().toISOString().slice(0, 10))
    lotQty = 1
  }

  /* Modifier un ingrédient (décision Olivier 16/07/2026, sous-écran depuis
   * les commentaires du 25/07/2026) : renommer au crayon sur le nom (fusion
   * en deux touches), genre, minimum de réserve, suppression — seule voie de
   * suppression d'un ingrédient. Le sous-écran masque recherche, liste et
   * barre d'ajout. */
  let edit = $state(null)
  let edName = $state('')
  let edMin = $state(1)
  let edRenaming = $state(false)
  let edConfirmFusion = $state(false)
  let edConfirmDelete = $state(false)
  let busy = $state(false)
  let message = $state('')

  const editGroup = $derived(edit ? stockGroups().find(g => g.key === edit) : null)

  function toggleEdit(g) {
    edit = edit === g.key ? null : g.key
    edName = g.name
    edMin = g.min
    edRenaming = false
    edConfirmFusion = false
    edConfirmDelete = false
    message = ''
  }

  async function saveName(g) {
    const n = edName.trim()
    if (!n || fold(n) === fold(g.name)) return
    const fusion = groups.some(x => x.key !== g.key && sameIngredient(x.name, n))
    if (fusion && !edConfirmFusion) { edConfirmFusion = true; return }
    busy = true
    await renameIngredient(g.name, n)
    message = fusion ? `« ${g.name} » fusionné dans « ${n} ».` : `Renommé en « ${n} ».`
    busy = false
    edit = null
  }

  async function saveMin(g) {
    busy = true
    await setIngredientMin(g.name, edMin)
    busy = false
  }

  async function doDelete(g) {
    busy = true
    await removeIngredient(g.name)
    message = `« ${g.name} » supprimé du stock.`
    busy = false
    edit = null
  }

  /* Barre d'ajout minimale (commentaires Olivier 25/07/2026) : une seule
   * ligne Ingrédient + micro + Ajouter ; quantité, emplacement et où acheter
   * vivent dans un dépliant « Détails ». */
  let detailsOpen = $state(false)

  async function submit(e) {
    e.preventDefault()
    const n = name.trim()
    /* Dictée corrigée puis validée telle quelle : la transcription devient
     * un alias du référentiel — reconnue directement les fois suivantes
     * (décision Olivier 27/07/2026). */
    if (voiceFix && fold(n) === fold(voiceFix.suggested)) await confirmMerge(voiceFix.suggested, voiceFix.raw)
    voiceFix = null
    await addItem({
      name: n,
      qty: Number(qty) || 0,
      loc: itemLoc.trim(),
      store: itemStore.trim()
    })
    /* L'emplacement est conservé d'un ajout à l'autre (ranger une série de
     * produits au même endroit — décision Olivier 27/07/2026) ; il reste
     * visible à côté du bouton ⋯. */
    name = ''; qty = 1; itemStore = ''
    detailsOpen = false; newLoc = false
  }

  let voiceFix = null // { raw, suggested } : dictée écorchée corrigée via la master list

  let rec = null
  onMount(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      voiceAvailable = false
      hint = 'Reconnaissance vocale non disponible dans ce navigateur : utilisez la dictée du clavier.'
      return
    }
    rec = new SR()
    rec.lang = 'fr-FR'
    /* interimResults : sur iPhone, couper le micro à la main ne délivre
     * jamais de résultat « final » — on garde le dernier texte entendu et
     * on le traite à la fin (retour Olivier 16/07/2026). */
    rec.interimResults = true
    let heard = ''
    const applyVoice = text => {
      const parsed = parseDictation(text)
      /* La dictée est rapprochée de la master list : « 4 épices » redevient
       * « Quatre-épices », « nuoc mame » propose « Nuoc mam » (27/07/2026).
       * Plusieurs correspondances incertaines : on garde le texte entendu. */
      const matches = dictationMatches(parsed.name)
      const best = matches[0]
      voiceFix = null
      let nom = parsed.name
      if (best && (matches.length === 1 || sameDictation(best, nom) || sameIngredient(best, nom))) {
        if (fold(best) !== fold(nom) && !sameIngredient(best, nom) && !sameDictation(best, nom))
          voiceFix = { raw: nom, suggested: best }
        nom = best
      }
      name = nom.charAt(0).toUpperCase() + nom.slice(1)
      qty = parsed.qty
      hint = fold(nom) === fold(parsed.name)
        ? 'Entendu : « ' + text.trim() + ' ». Vérifiez puis touchez Ajouter.'
        : 'Entendu : « ' + text.trim() + ' » → « ' + nom + ' ». Vérifiez puis touchez Ajouter.'
    }
    rec.onstart = () => { listening = true; hint = 'Je vous écoute…' }
    rec.onend = () => {
      listening = false
      if (heard.trim()) { applyVoice(heard); heard = '' }
      else if (hint === 'Je vous écoute…') hint = 'Rien entendu — réessayez, ou utilisez la dictée du clavier.'
    }
    rec.onerror = ev => { hint = 'Micro indisponible (' + ev.error + '). Utilisez la dictée du clavier.' }
    rec.onresult = ev => {
      heard = [...ev.results].map(r => r[0].transcript).join(' ')
      if (ev.results[ev.results.length - 1].isFinal) { applyVoice(heard); heard = '' }
    }
  })

  /* Le 2e appui arrête TOUJOURS la dictée (demande Olivier 16/07) : l'état
   * est posé au toucher, sans attendre onstart — absent parfois sur iPhone. */
  function toggleMic() {
    if (listening) { listening = false; rec.stop() }
    else {
      listening = true
      try { rec.start() } catch { listening = false }
    }
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La base de données doit être mise à jour (migration en
      attente) : la dernière modification n'a pas pu être enregistrée.</p>
  {/if}
  {#if editGroup}
    <!-- Sous-écran Modifier : occupe l'écran seul (commentaires Olivier 25/07/2026). -->
    <SousEcran titre={editGroup.name} fermer={() => edit = null}>
      <div class="manage-panel">
        <div class="manage-block">
          {#if edRenaming}
            <p>Renommer l'ingrédient — un nom déjà connu <strong>fusionne</strong> les deux :</p>
            <div class="manage-row">
              <input class="rename-input" bind:value={edName} oninput={() => edConfirmFusion = false}
                aria-label="Nouveau nom">
              <button type="button" class="inv-start" class:danger-btn={edConfirmFusion}
                disabled={busy || !edName.trim()}
                onclick={() => saveName(editGroup)}>{edConfirmFusion ? 'Confirmer la fusion' : 'OK'}</button>
              <button type="button" class="inv-manage" onclick={() => { edRenaming = false; edName = editGroup.name }}>Annuler</button>
            </div>
          {:else}
            <div class="row source-row">
              <span class="name">{editGroup.name}</span>
              <button type="button" class="icon-btn" aria-label={'Renommer ' + editGroup.name} title="Renommer"
                onclick={() => { edRenaming = true; edConfirmFusion = false }}>✎</button>
            </div>
          {/if}
        </div>
        <div class="manage-block">
          <p>Genre (master list) :</p>
          <div class="manage-row">
            <select value={categoryOf(editGroup.name)} onchange={e => setIngredientCategory(editGroup.name, e.target.value)}
              aria-label={'Genre de ' + editGroup.name}>
              <option value="">Non classé</option>
              {#each genreNames as c (c)}<option value={c}>{c}</option>{/each}
            </select>
          </div>
        </div>
        <div class="manage-block">
          <p>Réserve minimum — racheté dès que la somme de tous les emplacements
            passe en dessous (0 = jamais racheté tout seul) :</p>
          <div class="manage-row">
            <input class="f-qty" type="number" inputmode="numeric" min="0" bind:value={edMin} aria-label="Réserve minimum">
            <button type="button" class="inv-start" disabled={busy} onclick={() => saveMin(editGroup)}>Enregistrer</button>
          </div>
        </div>
        <div class="manage-block">
          <p>Supprimer l'ingrédient — toutes ses lignes d'emplacement et sa ligne de courses :</p>
          <div class="manage-row">
            {#if edConfirmDelete}
              <button type="button" class="inv-start danger-btn" disabled={busy} onclick={() => doDelete(editGroup)}>Confirmer la suppression</button>
              <button type="button" class="inv-manage" onclick={() => edConfirmDelete = false}>Non, garder</button>
            {:else}
              <button type="button" class="inv-manage" onclick={() => edConfirmDelete = true}>Supprimer</button>
            {/if}
          </div>
        </div>
      </div>
    </SousEcran>
  {:else}
  <div class="filters">
    <div class="searchrow">
      <input id="search" type="search" bind:value={search} placeholder="Rechercher une épice, un ingrédient…" aria-label="Rechercher">
      {#if genreNames.length}
        <select class="genre-filter" bind:value={genreFilter} aria-label="Genre d'ingrédient">
          <option value="">Tous genres</option>
          {#each genreNames as g (g)}<option value={g}>{g}</option>{/each}
        </select>
      {/if}
    </div>
  </div>

  {#if message}<p class="note manage-msg">{message}</p>{/if}

  {#if groups.length === 0}
    <p class="empty">{search ? `Aucun résultat pour « ${search} ».` : 'Aucun ingrédient ici. Ajoutez-en un ci-dessous, au clavier ou au micro.'}</p>
  {:else}
    <p class="group-title">Mes produits <span class="n">· {groups.length}</span></p>
  {/if}

  <ul>
    {#each groups as g (g.key)}
      {@const entry = shopEntryOf(g)}
      {@const inList = !!entry}
      {@const missing = !inList && g.total < g.min}
      {@const solo = soloRow(g)}
      {@const detailable = g.stocked.length > 0}
      <li class="row" class:low={g.total < g.min}>
        <button type="button" class="rowbtn-full info" aria-expanded={sel === g.key}
          title="Nom complet et boutons" onclick={() => toggleSel(g)}>
          <span class="name" class:name-full={sel === g.key} title={g.name}>{g.name}</span>
        </button>
        <output class="count" title="pots — tous emplacements">{g.total}</output>
        {#if sel !== g.key}
          <span class="note">{locLabel(g)}</span>
        {/if}
      </li>
      {#if sel === g.key}
        <li class="row subrow">
          {#if detailable}
            <button class="icon-btn loc-toggle" type="button" aria-expanded={open === g.key}
              title="Détail par emplacement : quantités, déplacement, lots datés"
              onclick={() => toggleDetail(g)}>{open === g.key ? '▾' : '▸'} {locLabel(g)}</button>
          {:else}
            <span class="note">{locLabel(g)}</span>
          {/if}
          {#if g.total > 0}
            <button type="button" class="inv-manage" title="C'est épuisé — tout passe à zéro, racheté automatiquement"
              onclick={() => markEpuise(g.name)}>Épuisé</button>
          {/if}
          <button class="icon-btn" class:cart-on={inList} class:cart-missing={missing} type="button"
            aria-label="Commander"
            title={inList ? 'Dans le panier — appuyer pour retirer' : missing ? 'Produit manquant — ajouter au panier' : 'Commander (réserve)'}
            onclick={() => toggleOrder(g)}><Icon d={missing ? CART_PLUS : CART} /></button>
          {#if solo}
            <div class="qty">
              <button type="button" aria-label="Un pot de moins" onclick={() => moins(solo)}><Icon d={MINUS} /></button>
              <output title="pots — tous emplacements">{g.total}</output>
              <button type="button" aria-label="Un pot de plus" onclick={() => plus(solo)}><Icon d={PLUS} /></button>
            </div>
          {/if}
          <button class="icon-btn" type="button" aria-expanded={edit === g.key}
            aria-label={'Modifier ' + g.name} title="Modifier (nom, genre, minimum, suppression)"
            onclick={() => toggleEdit(g)}>✎</button>
        </li>
      {/if}
      {#if open === g.key}
        <li class="lot-panel">
          <ul class="manage-items">
            {#each g.stocked as item (item.id)}
              <li class="row">
                <span class="name">{item.loc || 'Sans emplacement'}</span>
                <button type="button" class="inv-manage" aria-expanded={moving === item.id}
                  onclick={() => startMove(item)}>Déplacer</button>
                <div class="qty">
                  <button type="button" aria-label={'Un pot de moins — ' + (item.loc || 'sans emplacement')}
                    onclick={() => moins(item)}><Icon d={MINUS} /></button>
                  <output title="pots">{item.qty}</output>
                  <button type="button" aria-label={'Un pot de plus — ' + (item.loc || 'sans emplacement')}
                    onclick={() => plus(item)}><Icon d={PLUS} /></button>
                </div>
              </li>
              {#if moving === item.id}
                <li>
                  <form class="manage-row" onsubmit={e => doMove(item, e)}>
                    {#if moveNew}
                      <input bind:value={moveDest} placeholder="Nouvel emplacement" aria-label="Destination">
                    {:else}
                      <select bind:value={moveDest} aria-label="Destination"
                        onchange={e => { if (e.target.value === '__nouveau__') { moveDest = ''; moveNew = true } }}>
                        <option value="">Vers…</option>
                        {#each locNames.filter(l => l !== item.loc) as l (l)}<option value={l}>{l}</option>{/each}
                        <option value="__nouveau__">— Nouvel emplacement… —</option>
                      </select>
                    {/if}
                    <button class="inv-start" disabled={!moveDest.trim()}>Déplacer</button>
                    <button type="button" class="inv-manage" onclick={() => moving = null}>Annuler</button>
                  </form>
                </li>
              {/if}
              {#if isDatedLoc(item.loc)}
                {#each lotsOf(item.id) as lot, i (lot.id)}
                  <li class="row">
                    <span class="name lot-line">{lot.qty} × {lot.qty > 1 ? 'entrés' : 'entré'} le {dateFr(lot.entered_on)}</span>
                    {#if i === 0}<span class="note">le plus ancien</span>{/if}
                    <button type="button" class="inv-manage" onclick={() => takeLot(item, lot)}>Sortir 1</button>
                  </li>
                {/each}
                {#if undatedCount(item) > 0}
                  <li class="row"><p class="note">{undatedCount(item)} sans date (entrés avant le suivi par dates —
                    le prochain inventaire les datera)</p></li>
                {/if}
                <li>
                  <form class="manage-row" onsubmit={e => enter(item, e)}>
                    <input class="f-qty" type="number" inputmode="numeric" min="1" bind:value={lotQty} aria-label="Quantité entrée">
                    <input type="date" bind:value={lotDate} aria-label="Date d'entrée">
                    <span class="note">{lotDate ? dateFr(lotDate) : ''}</span>
                    <button class="inv-start">Entrer</button>
                  </form>
                </li>
              {/if}
            {/each}
          </ul>
        </li>
      {/if}
    {/each}
  </ul>
  {/if}
</section>

{#if !editGroup}
<div class="addbar" use:addbarHeight>
  <form onsubmit={submit} autocomplete="off">
    {#if detailsOpen}
      <div class="add-details">
        <label>Nombre de pots
          <input class="f-qty" type="number" inputmode="numeric" min="0" bind:value={qty} aria-label="Nombre de pots">
        </label>
        <label>Emplacement
          {#if newLoc}
            <input bind:value={itemLoc} placeholder="Nouvel emplacement" aria-label="Emplacement">
          {:else}
            <select bind:value={itemLoc} aria-label="Emplacement"
              onchange={e => { if (e.target.value === '__nouveau__') { itemLoc = ''; newLoc = true } }}>
              <option value="">Emplacement…</option>
              {#each locNames as l (l)}<option value={l}>{l}</option>{/each}
              <option value="__nouveau__">— Nouvel emplacement… —</option>
            </select>
          {/if}
        </label>
        <label>Où acheter
          <input bind:value={itemStore} list="stores" placeholder="Où acheter">
        </label>
      </div>
    {/if}
    <div class="add-main">
      <input class="f-name" bind:value={name} list="known-ingredients" placeholder="Ingrédient" required>
      {#if itemLoc && !detailsOpen}
        <span class="note add-loc" title={'Sera rangé : ' + itemLoc}>{itemLoc}</span>
      {/if}
      <button type="button" class="icon-btn add-details-btn" class:chip-on={detailsOpen}
        aria-expanded={detailsOpen} aria-label="Détails : quantité, emplacement, où acheter"
        title="Quantité, emplacement, où acheter" onclick={() => detailsOpen = !detailsOpen}>⋯</button>
      {#if voiceAvailable}
        <button class="mic" class:listening type="button" aria-label="Saisie vocale" onclick={toggleMic}><Icon d={MIC} /></button>
      {/if}
      <button class="submit">Ajouter</button>
    </div>
    <p class="hint">{hint}</p>
  </form>
</div>
{/if}

<datalist id="stores">
  {#each STORES as s (s)}<option value={s}></option>{/each}
</datalist>
<datalist id="known-ingredients">
  {#each knownNames().toSorted((a, b) => a.localeCompare(b, 'fr')) as n (n)}<option value={n}></option>{/each}
</datalist>
