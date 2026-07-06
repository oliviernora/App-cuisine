<script>
  import { store, startInventory } from '../lib/store.svelte.js'

  const KNOWN_ORDER = ['Cuisine', 'Sous chauffage', 'Réserve entrée', 'Autre', 'Vegan',
    'Placard', 'Frigo', 'Congélateur 1', 'Congélateur 2', 'Cave']

  const locs = $derived.by(() => {
    const names = [...new Set([
      ...store.items.map(i => i.loc).filter(Boolean),
      ...store.locations.map(l => l.name)
    ])]
    const rank = n => {
      const i = KNOWN_ORDER.indexOf(n)
      return i === -1 ? KNOWN_ORDER.length : i
    }
    return names.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b, 'fr'))
  })

  function lastDate(name) {
    const row = store.locations.find(l => l.name === name)
    if (!row?.last_inventory_at) return 'jamais inventorié'
    return 'dernier inventaire le ' + new Date(row.last_inventory_at).toLocaleDateString('fr-FR')
  }

  function count(name) {
    return store.items.filter(i => i.loc === name).length
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La date du dernier inventaire n'a pas pu être enregistrée :
      la base de données doit être mise à jour (migration « locations » en attente).</p>
  {/if}
  <p class="group-title">Emplacements <span class="n">· {locs.length}</span></p>
  <ul>
    {#each locs as name (name)}
      <li class="row">
        <div class="info">
          <span class="name">{name}</span>
          <span class="note">{count(name)} produits · {lastDate(name)}</span>
        </div>
        <button type="button" class="inv-start" onclick={() => startInventory(name)}>Inventaire</button>
      </li>
    {/each}
  </ul>
</section>
