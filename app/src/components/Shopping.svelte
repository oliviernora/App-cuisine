<script>
  import { store, addShopEntry, setDone, removeShopEntry, clearDone, formatQty,
    toggleAvailable, setEntryStore } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
  import { TRASH } from '../lib/icons.js'

  const STORES = ['Leclerc', 'Grand Frais', 'Marché', 'Boutique spécialisée', 'Internet']

  let name = $state('')
  let storeName = $state('')

  /* Les lignes « reçues » (achetées et rangées) ont quitté la liste : elles
   * attendent leur mise en stock dans l'onglet Inventaire (Q2, 16/07/2026). */
  const groups = $derived.by(() => {
    const entries = store.shop.filter(s => !s.received)
      .toSorted((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
    return [...Map.groupBy(entries, s => s.store || 'Autre')]
      .sort((a, b) => a[0].localeCompare(b[0], 'fr'))
  })

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

  async function submit(e) {
    e.preventDefault()
    await addShopEntry(name.trim(), storeName.trim())
    name = ''; storeName = ''
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La base de données doit être mise à jour (migration en
      attente) : la dernière modification n'a pas pu être enregistrée.</p>
  {/if}
  {#if groups.length === 0}
    <p class="empty">Liste de courses vide. Les ingrédients épuisés s'ajoutent ici automatiquement.</p>
  {/if}

  {#each groups as [storeKey, group] (storeKey)}
    <p class="group-title">{storeKey} <span class="n">· {group.length}</span></p>
    <ul>
      {#each group as entry (entry.id)}
        <li class="row" class:done={entry.done || entry.available}>
          <input type="checkbox" checked={entry.done} disabled={entry.available} aria-label="Acheté"
            onchange={e => setDone(entry, e.target.checked)}>
          {#if entry.origin === 'semaine'}
            <button type="button" class="rowbtn-full info" title="Basculer « je l'ai déjà » / « à acheter »"
              onclick={() => toggleAvailable(entry)}>
              <span class="name" title={entry.name}>{entry.qty ? formatQty(entry.qty, entry.unit) + ' ' : ''}{entry.name}</span>
            </button>
            <span class="note">{entry.available ? 'je l\'ai' : 'semaine'}</span>
            <button class="icon-btn" type="button" aria-expanded={editId === entry.id}
              aria-label={'Changer le lieu d\'achat de ' + entry.name} title="Changer le lieu d'achat"
              onclick={() => toggleEdit(entry)}>✎</button>
          {:else}
            <span class="name" title={entry.name}>{entry.qty ? formatQty(entry.qty, entry.unit) + ' ' : ''}{entry.name}</span>
            <span class="note">{entry.item_id ? (entry.manual ? 'réserve' : 'auto') : ''}</span>
            <button class="icon-btn" type="button" aria-expanded={editId === entry.id}
              aria-label={'Changer le lieu d\'achat de ' + entry.name} title="Changer le lieu d'achat"
              onclick={() => toggleEdit(entry)}>✎</button>
            <button class="icon-btn danger" type="button" aria-label="Supprimer" onclick={() => removeShopEntry(entry)}><Icon d={TRASH} /></button>
          {/if}
        </li>
        {#if editId === entry.id}
          <li class="manage-panel">
            <p>Lieu d'achat — mémorisé pour les prochaines courses de « {entry.name} » :</p>
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

  {#if store.shop.some(s => s.done && !s.received)}
    <div class="toolbar">
      <button type="button" onclick={clearDone}>Ranger les achats — ils passeront « à mettre en stock » (Inventaire)</button>
    </div>
  {/if}
</section>

<div class="addbar">
  <form onsubmit={submit} autocomplete="off">
    <input class="f-name" bind:value={name} placeholder="Produit à acheter" required>
    <input class="f-loc" bind:value={storeName} list="stores-edit" placeholder="Où acheter">
    <button class="submit">Ajouter</button>
  </form>
</div>

<datalist id="stores-edit">
  {#each [...new Set([...STORES, ...store.shop.map(s => s.store).filter(Boolean)])] as s (s)}<option value={s}></option>{/each}
</datalist>
