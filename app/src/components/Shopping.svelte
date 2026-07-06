<script>
  import { store, addShopEntry, setDone, removeShopEntry, clearDone } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
  import { TRASH } from '../lib/icons.js'

  const STORES = ['Leclerc', 'Grand Frais', 'Marché', 'Boutique spécialisée', 'Internet']

  let name = $state('')
  let storeName = $state('')

  const groups = $derived.by(() => {
    const entries = store.shop.toSorted((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
    return [...Map.groupBy(entries, s => s.store || 'Autre')]
      .sort((a, b) => a[0].localeCompare(b[0], 'fr'))
  })

  async function submit(e) {
    e.preventDefault()
    await addShopEntry(name.trim(), storeName.trim())
    name = ''; storeName = ''
  }
</script>

<section>
  {#if store.shop.length === 0}
    <p class="empty">Liste de courses vide. Les ingrédients à 0 pot s'ajoutent ici automatiquement.</p>
  {/if}

  {#each groups as [storeKey, group] (storeKey)}
    <p class="group-title">{storeKey} <span class="n">· {group.length}</span></p>
    <ul>
      {#each group as entry (entry.id)}
        <li class="row" class:done={entry.done}>
          <input type="checkbox" checked={entry.done} aria-label="Acheté"
            onchange={e => setDone(entry, e.target.checked)}>
          <span class="name" title={entry.name}>{entry.name}</span>
          <span class="note">{entry.item_id ? (entry.manual ? 'réserve' : 'auto') : ''}</span>
          <button class="icon-btn danger" type="button" aria-label="Supprimer" onclick={() => removeShopEntry(entry)}><Icon d={TRASH} /></button>
        </li>
      {/each}
    </ul>
  {/each}

  {#if store.shop.some(s => s.done)}
    <div class="toolbar">
      <button type="button" onclick={clearDone}>Ranger les achats</button>
    </div>
  {/if}
</section>

<div class="addbar">
  <form onsubmit={submit} autocomplete="off">
    <input class="f-name" bind:value={name} placeholder="Produit à acheter" required>
    <input class="f-loc" bind:value={storeName} list="stores" placeholder="Où acheter">
    <button class="submit">Ajouter</button>
  </form>
</div>
