<script>
  import { store, startInventory, renameLocation, moveItems } from '../lib/store.svelte.js'

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

  let managed = $state(null)
  let newName = $state('')
  let confirmMerge = $state(false)
  let selected = $state([])
  let moveDest = $state('')
  let busy = $state(false)
  let message = $state('')

  function openManage(name) {
    managed = managed === name ? null : name
    newName = ''
    confirmMerge = false
    selected = []
    moveDest = ''
    message = ''
  }

  const managedItems = $derived(managed
    ? store.items.filter(i => i.loc === managed)
        .toSorted((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
    : [])

  function toggle(id) {
    selected = selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]
  }

  async function rename() {
    const dest = newName.trim()
    if (!dest || dest === managed) return
    const exists = locs.includes(dest)
    if (exists && !confirmMerge) { confirmMerge = true; return }
    busy = true
    await renameLocation(managed, dest)
    message = exists ? `Fusionné dans « ${dest} ».` : `Renommé en « ${dest} ».`
    busy = false
    managed = null
  }

  async function move() {
    const dest = moveDest.trim()
    if (!dest || selected.length === 0) return
    busy = true
    await moveItems(store.items.filter(i => selected.includes(i.id)), dest)
    message = `${selected.length} produit(s) déplacé(s) vers « ${dest} ».`
    busy = false
    selected = []
    moveDest = ''
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La date du dernier inventaire n'a pas pu être enregistrée :
      la base de données doit être mise à jour (migration « locations » en attente).</p>
  {/if}
  {#if message}<p class="note manage-msg">{message}</p>{/if}
  <p class="group-title">Emplacements <span class="n">· {locs.length}</span></p>
  <ul>
    {#each locs as name (name)}
      <li class="loc-item">
        <div class="row">
          <div class="info">
            <span class="name">{name}</span>
            <span class="note">{count(name)} produits · {lastDate(name)}</span>
          </div>
          <button type="button" class="inv-manage" onclick={() => openManage(name)}>Gérer</button>
          <button type="button" class="inv-start" onclick={() => startInventory(name)}>Inventaire</button>
        </div>
        {#if managed === name}
          <div class="manage-panel">
            <div class="manage-block">
              <p>Renommer l'emplacement — un nom déjà existant fusionne les deux :</p>
              <div class="manage-row">
                <input bind:value={newName} list="manage-locs" placeholder="Nouveau nom"
                  oninput={() => confirmMerge = false} aria-label="Nouveau nom">
                <button type="button" class="inv-start" class:danger-btn={confirmMerge} disabled={busy} onclick={rename}>
                  {confirmMerge ? 'Confirmer la fusion' : 'Renommer'}
                </button>
              </div>
            </div>
            <div class="manage-block">
              <p>Déplacer des produits — cochez, puis choisissez la destination
                (existante ou nouvelle) :</p>
              <ul class="manage-items">
                {#each managedItems as item (item.id)}
                  <li class="row">
                    <input type="checkbox" checked={selected.includes(item.id)}
                      onchange={() => toggle(item.id)} aria-label={'Sélectionner ' + item.name}>
                    <span class="name" title={item.name}>{item.name}</span>
                    <span class="note">{item.qty}</span>
                  </li>
                {/each}
              </ul>
              <div class="manage-row">
                <input bind:value={moveDest} list="manage-locs" placeholder="Destination" aria-label="Destination">
                <button type="button" class="inv-start" disabled={busy || selected.length === 0} onclick={move}>
                  Déplacer ({selected.length})
                </button>
              </div>
            </div>
          </div>
        {/if}
      </li>
    {/each}
  </ul>
  <datalist id="manage-locs">
    {#each locs as l (l)}<option value={l}></option>{/each}
  </datalist>
</section>
