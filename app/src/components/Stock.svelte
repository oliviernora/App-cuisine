<script>
  import { onMount } from 'svelte'
  import { store, addItem, changeQty, removeItem, toggleOrder, knownNames } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
  import { MINUS, PLUS, TRASH, CART, CART_PLUS, MIC } from '../lib/icons.js'

  const DEFAULT_LOCS = ['Cuisine', 'Sous chauffage', 'Réserve entrée', 'Autre', 'Vegan',
    'Placard', 'Frigo', 'Congélateur 1', 'Congélateur 2', 'Cave']
  const STORES = ['Leclerc', 'Grand Frais', 'Marché', 'Boutique spécialisée', 'Internet']
  const LOC_COLORS = {
    'Cuisine': '--loc-cuisine',
    'Sous chauffage': '--loc-chauffage',
    'Réserve entrée': '--loc-reserve',
    'Autre': '--loc-autre',
    'Vegan': '--loc-vegan'
  }

  let search = $state('')
  let currentLoc = $state('Tous')
  let viewMode = $state('loc')
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

  const locs = $derived(['Tous', ...new Set([...Object.keys(LOC_COLORS), ...store.items.map(i => i.loc).filter(Boolean)])])

  // Tri stable : alphabétique dans chaque emplacement, emplacements dans l'ordre habituel.
  // En vue « A→Z », une seule liste alphabétique tous emplacements confondus.
  const filtered = $derived.by(() => {
    let items = store.items.filter(i => currentLoc === 'Tous' || i.loc === currentLoc)
    if (search) items = items.filter(i => fold(i.name).includes(fold(search)))
    return items.toSorted((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
  })

  const groups = $derived.by(() => {
    if (viewMode === 'az') return filtered.length ? [['Tous mes produits', filtered]] : []
    const rank = loc => {
      const i = DEFAULT_LOCS.indexOf(loc)
      return i === -1 ? DEFAULT_LOCS.length : i
    }
    return [...Map.groupBy(filtered, i => i.loc || 'Sans emplacement')]
      .sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0], 'fr'))
  })

  function ordered(item) {
    return store.shop.some(s => s.item_id === item.id)
  }

  async function submit(e) {
    e.preventDefault()
    await addItem({
      name: name.trim(),
      qty: Number(qty) || 0,
      min: 0,
      loc: itemLoc.trim() || (currentLoc !== 'Tous' ? currentLoc : ''),
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
  <div class="filters">
    <div class="searchrow">
      <input id="search" type="search" bind:value={search} placeholder="Rechercher une épice, un ingrédient…" aria-label="Rechercher">
      <div class="sortsel" role="group" aria-label="Tri">
        <button type="button" class:active={viewMode === 'loc'} onclick={() => viewMode = 'loc'}>Emplacement</button>
        <button type="button" class:active={viewMode === 'az'} onclick={() => viewMode = 'az'}>A→Z</button>
      </div>
    </div>
    <div class="chips">
      {#each locs as loc (loc)}
        {@const colorVar = LOC_COLORS[loc]}
        <button type="button"
          class:active={loc === currentLoc}
          style:color={colorVar ? `var(${colorVar})` : null}
          style:border-color={colorVar ? `var(${colorVar})` : null}
          style:background={colorVar && loc === currentLoc ? `color-mix(in srgb, var(${colorVar}) 14%, transparent)` : null}
          onclick={() => currentLoc = loc}>{loc}</button>
      {/each}
    </div>
  </div>

  {#if groups.length === 0}
    <p class="empty">{search ? `Aucun résultat pour « ${search} ».` : 'Aucun ingrédient ici. Ajoutez-en un ci-dessous, au clavier ou au micro.'}</p>
  {/if}

  {#each groups as [loc, group] (loc)}
    <p class="group-title">{loc} <span class="n">· {group.length}</span></p>
    <ul>
      {#each group as item (item.id)}
        {@const inList = ordered(item)}
        {@const missing = !inList && item.qty <= item.min}
        <li class="row" class:low={item.qty <= item.min}>
          <span class="name" title={item.name}>{item.name}</span>
          {#if viewMode === 'az'}<span class="note">{item.loc}</span>{/if}
          <button class="icon-btn" class:cart-on={inList} class:cart-missing={missing} type="button"
            aria-label="Commander"
            title={inList ? 'Dans le panier — appuyer pour retirer' : missing ? 'Produit manquant — ajouter au panier' : 'Commander (réserve)'}
            onclick={() => toggleOrder(item)}><Icon d={missing ? CART_PLUS : CART} /></button>
          <div class="qty">
            <button type="button" aria-label="Un pot de moins" onclick={() => changeQty(item, -1)}><Icon d={MINUS} /></button>
            <output title="pots">{item.qty}</output>
            <button type="button" aria-label="Un pot de plus" onclick={() => changeQty(item, 1)}><Icon d={PLUS} /></button>
          </div>
          <button class="icon-btn danger" type="button" aria-label="Supprimer" onclick={() => removeItem(item)}><Icon d={TRASH} /></button>
        </li>
      {/each}
    </ul>
  {/each}
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
