<script>
  import { store, startInventory, renameLocation, moveItems, pendingMerges,
    confirmMerge as confirmIngredient, rejectMerge as rejectIngredient,
    masterList, setIngredientCategory } from '../lib/store.svelte.js'

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

  const merges = $derived(pendingMerges())

  async function answer(m, yes) {
    busy = true
    await (yes ? confirmIngredient(m.a, m.b) : rejectIngredient(m.a, m.b))
    busy = false
  }

  /* Master list : les ingrédients rangés par catégorie, non classés en tête. */
  const CATEGORIES_SUGGEREES = ['Épices', 'Herbes', 'Légumes', 'Fruits', 'Viandes',
    'Poissons et fruits de mer', 'Épicerie', 'Crèmerie', 'Boissons']
  let mlOpen = $state(false)
  let mlSearch = $state('')

  function foldml(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  const mlSections = $derived.by(() => {
    let liste = masterList()
    if (mlSearch.trim()) liste = liste.filter(i => foldml(i.name).includes(foldml(mlSearch)))
    const groupes = [...Map.groupBy(liste, i => i.category)]
    return groupes.toSorted((a, b) => (a[0] === '') !== (b[0] === '')
      ? (a[0] === '' ? -1 : 1)
      : a[0].localeCompare(b[0], 'fr'))
  })
  const mlTotal = $derived(masterList())
  const mlCategories = $derived([...new Set([...CATEGORIES_SUGGEREES,
    ...store.refs.map(r => r.category).filter(Boolean)])].toSorted((a, b) => a.localeCompare(b, 'fr')))
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La date du dernier inventaire n'a pas pu être enregistrée :
      la base de données doit être mise à jour (migration « locations » en attente).</p>
  {/if}
  {#if message}<p class="note manage-msg">{message}</p>{/if}

  {#if merges.length}
    <p class="group-title">Ingrédients à rapprocher <span class="n">· {merges.length}</span></p>
    <ul>
      {#each merges as m (m.a + '|' + m.b)}
        <li class="row">
          <span class="name">« {m.b} » et « {m.a} » : même ingrédient ?</span>
          <button type="button" class="inv-start" disabled={busy} onclick={() => answer(m, true)}>Oui</button>
          <button type="button" class="inv-manage" disabled={busy} onclick={() => answer(m, false)}>Non</button>
        </li>
      {/each}
    </ul>
  {/if}

  <div class="loc-item">
    <button type="button" class="row rowbtn-full" onclick={() => mlOpen = !mlOpen} aria-expanded={mlOpen}>
      <div class="info">
        <span class="name">{mlOpen ? '▾' : '▸'} Master list des ingrédients</span>
        <span class="note">{mlTotal.length} ingrédients · {mlTotal.filter(i => !i.category).length} non classés</span>
      </div>
    </button>
    {#if mlOpen}
      <div class="manage-panel">
        <div class="manage-row">
          <input bind:value={mlSearch} placeholder="Filtrer les ingrédients…" aria-label="Filtrer la master list">
        </div>
        {#each mlSections as [cat, items] (cat)}
          <p class="group-title">{cat || 'Non classés'} <span class="n">· {items.length}</span></p>
          <ul class="manage-items">
            {#each items as ing (ing.name)}
              <li class="row">
                <span class="name" title={ing.name}>{ing.name}</span>
                <input list="ml-categories" value={ing.category} placeholder="Catégorie…"
                  onchange={e => setIngredientCategory(ing.name, e.target.value)}
                  aria-label={'Catégorie de ' + ing.name}>
              </li>
            {/each}
          </ul>
        {/each}
      </div>
    {/if}
  </div>
  <datalist id="ml-categories">
    {#each mlCategories as c (c)}<option value={c}></option>{/each}
  </datalist>

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
