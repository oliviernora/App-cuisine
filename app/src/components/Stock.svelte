<script>
  import { onMount } from 'svelte'
  import { store, addItem, changeQty, toggleOrder, stockGroups, shopEntryOf,
    setIngredientMin, renameIngredient, removeIngredient, setIngredientCategory, categoryOf,
    knownNames, sameIngredient, isDatedLoc, lotsOf, undatedCount, enterLot, takeLot } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
  import { MINUS, PLUS, CART, CART_PLUS, MIC } from '../lib/icons.js'

  const DEFAULT_LOCS = ['Cuisine', 'Sous chauffage', 'Réserve entrée', 'Autre', 'Vegan',
    'Placard', 'Frigo', 'Congélateur 1', 'Congélateur 2', 'Cave']
  const STORES = ['Leclerc', 'Grand Frais', 'Marché', 'Boutique spécialisée', 'Internet']

  let search = $state('')
  let genreFilter = $state('')

  /* Filtre par genre d'ingrédient (master list) dans la recherche (demande Olivier 08/07). */
  const genreNames = $derived([...new Set([...store.categories.map(c => c.name),
    ...store.refs.map(r => r.category).filter(Boolean)])].toSorted((a, b) => a.localeCompare(b, 'fr')))
  let name = $state('')
  let qty = $state(1)
  let itemLoc = $state('')
  let itemStore = $state('')
  let newLoc = $state(false)

  /* Les emplacements peuvent être nombreux : liste déroulante des existants,
   * avec une entrée « Nouvel emplacement… » (demande Olivier 07/07). */
  const locNames = $derived.by(() => {
    const names = [...new Set([...store.items.map(i => i.loc).filter(Boolean),
      ...store.locations.map(l => l.name), ...DEFAULT_LOCS])]
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
    if (search) list = list.filter(g => fold(g.name).includes(fold(search)))
    if (genreFilter) list = list.filter(g => categoryOf(g.name) === genreFilter)
    return list
  })

  let open = $state(null) // clé du groupe dont le détail des emplacements est déplié

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

  /* Panneau Modifier (décision Olivier 16/07/2026) : renommer (fusion en deux
   * touches), genre, minimum de réserve, suppression — seule voie de
   * suppression d'un ingrédient. */
  let edit = $state(null)
  let edName = $state('')
  let edMin = $state(1)
  let edConfirmFusion = $state(false)
  let edConfirmDelete = $state(false)
  let busy = $state(false)
  let message = $state('')

  function toggleEdit(g) {
    edit = edit === g.key ? null : g.key
    edName = g.name
    edMin = g.min
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

  async function submit(e) {
    e.preventDefault()
    await addItem({
      name: name.trim(),
      qty: Number(qty) || 0,
      loc: itemLoc.trim(),
      store: itemStore.trim()
    })
    name = ''; qty = 1; itemLoc = ''; itemStore = ''
  }

  const NUMBER_WORDS = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10 }
  function parseVoice(text) {
    let words = text.trim().toLowerCase().replace(/^ajoute[rz]?\s+/, '').split(/\s+/)
    let n = 1
    if (/^\d+$/.test(words[0])) { n = Number(words[0]); words = words.slice(1) }
    else if (NUMBER_WORDS[words[0]]) { n = NUMBER_WORDS[words[0]]; words = words.slice(1) }
    return { qty: n, name: words.join(' ') }
  }

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
    rec.interimResults = false
    rec.onstart = () => { listening = true; hint = 'Je vous écoute…' }
    rec.onend = () => { listening = false }
    rec.onerror = ev => { hint = 'Micro indisponible (' + ev.error + '). Utilisez la dictée du clavier.' }
    rec.onresult = ev => {
      const text = ev.results[0][0].transcript
      const parsed = parseVoice(text)
      name = parsed.name.charAt(0).toUpperCase() + parsed.name.slice(1)
      qty = parsed.qty
      hint = 'Entendu : « ' + text + ' ». Vérifiez puis touchez Ajouter.'
    }
  })

  function toggleMic() {
    if (listening) rec.stop()
    else rec.start()
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La base de données doit être mise à jour (migration en
      attente) : la dernière modification n'a pas pu être enregistrée.</p>
  {/if}
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
      {@const expandable = g.stocked.length > 1 || (solo && isDatedLoc(solo.loc) && g.total > 0)}
      <li class="row" class:low={g.total < g.min}>
        <span class="name" title={g.name}>{g.name}</span>
        {#if g.stocked.length === 1 && !expandable}
          <span class="note">{g.stocked[0].loc || 'sans emplacement'}</span>
        {/if}
        {#if expandable}
          <button class="icon-btn loc-toggle" type="button" aria-expanded={open === g.key}
            title="Détail par emplacement"
            onclick={() => toggleDetail(g)}>{open === g.key ? '▾' : '▸'}{g.stocked.length > 1 ? ' ' + g.stocked.length + ' emplacements' : ''}</button>
        {/if}
        <button class="icon-btn" class:cart-on={inList} class:cart-missing={missing} type="button"
          aria-label="Commander"
          title={inList ? 'Dans le panier — appuyer pour retirer' : missing ? 'Produit manquant — ajouter au panier' : 'Commander (réserve)'}
          onclick={() => toggleOrder(g)}><Icon d={missing ? CART_PLUS : CART} /></button>
        <div class="qty">
          {#if solo}
            <button type="button" aria-label="Un pot de moins" onclick={() => moins(solo)}><Icon d={MINUS} /></button>
            <output title="pots — tous emplacements">{g.total}</output>
            <button type="button" aria-label="Un pot de plus" onclick={() => plus(solo)}><Icon d={PLUS} /></button>
          {:else}
            <output title="pots — tous emplacements">{g.total}</output>
          {/if}
        </div>
        <button class="icon-btn" type="button" aria-expanded={edit === g.key}
          aria-label={'Modifier ' + g.name} title="Modifier (nom, genre, minimum, suppression)"
          onclick={() => toggleEdit(g)}>✎</button>
      </li>
      {#if open === g.key}
        <li class="lot-panel">
          <ul class="manage-items">
            {#each g.stocked as item (item.id)}
              <li class="row">
                <span class="name">{item.loc || 'Sans emplacement'}</span>
                <div class="qty">
                  <button type="button" aria-label={'Un pot de moins — ' + (item.loc || 'sans emplacement')}
                    onclick={() => moins(item)}><Icon d={MINUS} /></button>
                  <output title="pots">{item.qty}</output>
                  <button type="button" aria-label={'Un pot de plus — ' + (item.loc || 'sans emplacement')}
                    onclick={() => plus(item)}><Icon d={PLUS} /></button>
                </div>
              </li>
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
      {#if edit === g.key}
        <li class="manage-panel">
          <div class="manage-block">
            <p>Renommer l'ingrédient — un nom déjà connu <strong>fusionne</strong> les deux :</p>
            <div class="manage-row">
              <input bind:value={edName} oninput={() => edConfirmFusion = false} aria-label="Nouveau nom">
              <button type="button" class="inv-start" class:danger-btn={edConfirmFusion} disabled={busy}
                onclick={() => saveName(g)}>{edConfirmFusion ? 'Confirmer la fusion' : 'Renommer'}</button>
            </div>
          </div>
          <div class="manage-block">
            <p>Genre (master list) :</p>
            <div class="manage-row">
              <select value={categoryOf(g.name)} onchange={e => setIngredientCategory(g.name, e.target.value)}
                aria-label={'Genre de ' + g.name}>
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
              <button type="button" class="inv-start" disabled={busy} onclick={() => saveMin(g)}>Enregistrer</button>
            </div>
          </div>
          <div class="manage-block">
            <p>Supprimer l'ingrédient — toutes ses lignes d'emplacement et sa ligne de courses :</p>
            <div class="manage-row">
              {#if edConfirmDelete}
                <button type="button" class="inv-start danger-btn" disabled={busy} onclick={() => doDelete(g)}>Confirmer la suppression</button>
                <button type="button" class="inv-manage" onclick={() => edConfirmDelete = false}>Non, garder</button>
              {:else}
                <button type="button" class="inv-manage" onclick={() => edConfirmDelete = true}>Supprimer</button>
              {/if}
            </div>
          </div>
        </li>
      {/if}
    {/each}
  </ul>
</section>

<div class="addbar">
  <form onsubmit={submit} autocomplete="off">
    <input class="f-name" bind:value={name} list="known-ingredients" placeholder="Ingrédient" required>
    <input class="f-qty" type="number" inputmode="numeric" min="0" bind:value={qty} aria-label="Nombre de pots" title="Nombre de pots">
    {#if newLoc}
      <input class="f-loc" bind:value={itemLoc} placeholder="Nouvel emplacement" aria-label="Emplacement">
    {:else}
      <select class="f-loc" bind:value={itemLoc} aria-label="Emplacement"
        onchange={e => { if (e.target.value === '__nouveau__') { itemLoc = ''; newLoc = true } }}>
        <option value="">Emplacement…</option>
        {#each locNames as l (l)}<option value={l}>{l}</option>{/each}
        <option value="__nouveau__">— Nouvel emplacement… —</option>
      </select>
    {/if}
    <input class="f-loc" bind:value={itemStore} list="stores" placeholder="Où acheter">
    {#if voiceAvailable}
      <button class="mic" class:listening type="button" aria-label="Saisie vocale" onclick={toggleMic}><Icon d={MIC} /></button>
    {/if}
    <button class="submit">Ajouter</button>
    <p class="hint">{hint}</p>
  </form>
</div>

<datalist id="locs">
  {#each DEFAULT_LOCS as l (l)}<option value={l}></option>{/each}
</datalist>
<datalist id="stores">
  {#each STORES as s (s)}<option value={s}></option>{/each}
</datalist>
<datalist id="known-ingredients">
  {#each knownNames().toSorted((a, b) => a.localeCompare(b, 'fr')) as n (n)}<option value={n}></option>{/each}
</datalist>
