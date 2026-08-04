<script>
  import { store, addShopEntry, setDone, removeShopEntry, formatQty,
    toggleAvailable, setEntryStore, storesOf } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
  import SousEcran from './SousEcran.svelte'
  import RangerCourses from './RangerCourses.svelte'
  import LieuxAchat from './LieuxAchat.svelte'
  import { addbarHeight } from '../lib/addbar.js'
  import { TRASH } from '../lib/icons.js'

  let name = $state('')

  /* Courses façon liste de tâches (N4, décision Olivier 27/07/2026) : les
   * produits à acheter en haut, groupés par magasin ; ce qui est coché
   * descend dans « Achetés » en bas (décocher le remonte). Le rangement se
   * fait produit par produit dans l'écran « Ranger les courses » (N13). */
  const groups = $derived.by(() => {
    const entries = store.shop.filter(s => !s.done && !s.received)
      .toSorted((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
    return [...Map.groupBy(entries, s => s.store || 'Autre')]
      .sort((a, b) => a[0].localeCompare(b[0], 'fr'))
  })

  const bought = $derived(store.shop.filter(s => s.done || s.received)
    .toSorted((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })))

  let ranger = $state(false)
  let lieuxOpen = $state(false)

  /* Raccourcis de l'écran d'accueil (27/07/2026) : ouvrir directement le
   * rangement ou les lieux d'achat. */
  if (store.uiAction === 'ranger-courses') { ranger = true; store.uiAction = null }
  else if (store.uiAction === 'lieux-achat') { lieuxOpen = true; store.uiAction = null }

  /* Lieu d'achat par ligne (commentaire Olivier 16/07/2026) : le crayon
   * ouvre un petit panneau ; le lieu est mémorisé sur l'ingrédient. */
  let editId = $state(null)
  let editStore = $state('')

  function toggleEdit(entry) {
    editId = editId === entry.id ? null : entry.id
    editStore = entry.store ?? ''
  }

  async function saveStore(entry) {
    await setEntryStore(entry, editStore)
    editId = null
  }

  /* Lignes compactes (remarque Olivier 27/07/2026) : case + nom seulement ;
   * toucher le nom déplie le nom complet et la ligne des boutons. */
  let sel = $state(null)

  function toggleSel(entry) {
    sel = sel === entry.id ? null : entry.id
    editId = null
  }

  function statusNote(entry) {
    if (entry.origin === 'semaine') return entry.available ? 'je l\'ai' : 'semaine'
    return entry.item_id ? (entry.manual ? 'réserve' : 'auto') : ''
  }

  /* Barre d'ajout minimale (25/07/2026) : le produit seul — le lieu d'achat
   * se règle ensuite via le crayon (mémorisé par ingrédient). */
  async function submit(e) {
    e.preventDefault()
    await addShopEntry(name.trim(), '')
    name = ''
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La base de données doit être mise à jour (migration en
      attente) : la dernière modification n'a pas pu être enregistrée.</p>
  {/if}

  {#if ranger}
    <SousEcran titre="Ranger les courses" fermer={() => ranger = false}>
      <RangerCourses />
    </SousEcran>
  {:else if lieuxOpen}
    <SousEcran titre="Lieux d'achat" fermer={() => lieuxOpen = false}>
      <LieuxAchat />
    </SousEcran>
  {:else}

  {#if groups.length === 0 && bought.length === 0}
    <p class="empty">Liste de courses vide. Les ingrédients épuisés s'ajoutent ici automatiquement.</p>
  {/if}

  {#each groups as [storeKey, group] (storeKey)}
    <p class="group-title">{storeKey} <span class="n">· {group.length}</span></p>
    <ul>
      {#each group as entry (entry.id)}
        <li class="row" class:done={entry.available}>
          <label class="check-zone">
            <input type="checkbox" checked={entry.done} disabled={entry.available} aria-label="Acheté"
              onchange={e => setDone(entry, e.target.checked)}>
          </label>
          <button type="button" class="rowbtn-full info" aria-expanded={sel === entry.id}
            title="Nom complet et boutons" onclick={() => toggleSel(entry)}>
            <span class="name" class:name-full={sel === entry.id} title={entry.name}>{entry.qty ? formatQty(entry.qty, entry.unit) + ' ' : ''}{entry.name}</span>
          </button>
          {#if sel !== entry.id}
            <span class="note">{statusNote(entry)}</span>
          {/if}
        </li>
        {#if sel === entry.id}
          <li class="row subrow">
            <span class="note">{statusNote(entry)}</span>
            {#if entry.origin === 'semaine'}
              <button type="button" class="inv-manage" title="Basculer « je l'ai déjà » / « à acheter »"
                onclick={() => toggleAvailable(entry)}>{entry.available ? 'À acheter' : 'Je l\'ai déjà'}</button>
            {/if}
            <button class="icon-btn" type="button" aria-expanded={editId === entry.id}
              aria-label={'Changer le lieu d\'achat de ' + entry.name} title="Changer le lieu d'achat"
              onclick={() => toggleEdit(entry)}>✎</button>
            {#if entry.origin !== 'semaine'}
              <button class="icon-btn danger" type="button" aria-label="Supprimer" onclick={() => removeShopEntry(entry)}><Icon d={TRASH} /></button>
            {/if}
          </li>
        {/if}
        {#if editId === entry.id}
          <li class="manage-panel">
            <p>Lieu d'achat — mémorisé pour les prochaines courses de « {entry.name} » :</p>
            {#if storesOf(entry.name).length}
              <!-- Les lieux de la fiche de l'ingrédient d'abord (décision Q1, 04/08/2026). -->
              <div class="manage-row">
                {#each storesOf(entry.name) as l (l.id)}
                  <button type="button" class="inv-manage" class:chip-on={entry.store === l.name}
                    title={l.kind === 'internet' ? 'Site (toutes maisons)' : 'Boutique'}
                    onclick={() => { editStore = l.name; saveStore(entry) }}>{l.name}</button>
                {/each}
              </div>
            {/if}
            <div class="manage-row">
              <input bind:value={editStore} list="stores-edit" placeholder="Leclerc, Marché de Revel…"
                aria-label="Lieu d'achat">
              <button type="button" class="inv-start" onclick={() => saveStore(entry)}>Enregistrer</button>
              <button type="button" class="inv-manage" onclick={() => editId = null}>Annuler</button>
            </div>
          </li>
        {/if}
      {/each}
    </ul>
  {/each}

  {#if bought.length}
    <p class="group-title">Achetés — à ranger <span class="n">· {bought.length}</span></p>
    <ul>
      {#each bought as entry (entry.id)}
        <li class="row done">
          <label class="check-zone">
            <input type="checkbox" checked aria-label="Acheté — décocher pour remettre à acheter"
              onchange={() => setDone(entry, false)}>
          </label>
          <span class="name" title={entry.name}>{entry.qty ? formatQty(entry.qty, entry.unit) + ' ' : ''}{entry.name}</span>
          <span class="note">{entry.origin === 'semaine' ? 'semaine' : entry.store || ''}</span>
        </li>
      {/each}
    </ul>
  {/if}
  <div class="toolbar">
    {#if bought.length}
      <button type="button" onclick={() => ranger = true}>Ranger les courses ({bought.length})</button>
    {/if}
    <button type="button" onclick={() => lieuxOpen = true}>Lieux d'achat</button>
  </div>
  {/if}
</section>

{#if !ranger && !lieuxOpen}
<div class="addbar" use:addbarHeight>
  <form onsubmit={submit} autocomplete="off">
    <input class="f-name" bind:value={name} placeholder="Produit à acheter" required>
    <button class="submit">Ajouter</button>
  </form>
</div>
{/if}

<datalist id="stores-edit">
  {#each [...new Set([...store.lieux.map(l => l.name), ...store.shop.map(s => s.store).filter(Boolean)])] as s (s)}<option value={s}></option>{/each}
</datalist>
