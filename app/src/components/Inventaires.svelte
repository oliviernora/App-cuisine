<script>
  import { store, startInventory, renameLocation, moveItems, pendingMerges,
    confirmMerge as confirmIngredient, rejectMerge as rejectIngredient,
    masterList, setIngredientCategory, isDatedLoc, setLocationDated, setLocationStaleMonths,
    addCategory, renameCategory, removeCategory, setCategorySourcing,
    setIngredientSourcing, sourcingOf, renameIngredient, recipesUsing,
    receivedEntries, receivedLoc, stashReceived,
    SOURCING_TYPES } from '../lib/store.svelte.js'

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

  /* Réception des achats (Q2, 16/07/2026) : les lignes « reçues » depuis
   * « Ranger les achats » se mettent en stock ici, avec la vraie quantité
   * et l'emplacement — c'est aussi la réponse à NP4. */
  const received = $derived(receivedEntries())
  let stashQty = $state({})
  let stashLoc = $state({})

  function defaultQty(entry) {
    return entry.qty ? Math.max(1, Math.round(Number(entry.qty))) : 1
  }

  async function ranger(entry) {
    busy = true
    await stashReceived(entry, stashQty[entry.id] ?? defaultQty(entry), stashLoc[entry.id] ?? receivedLoc(entry))
    busy = false
    message = `« ${entry.name} » rangé.`
  }

  /* Les deux noms peuvent être longs et tronqués (iPhone surtout) : un
   * toucher sur la question la déplie en entier (demande Olivier 16/07). */
  let mergeOpen = $state(null)

  async function answer(m, yes) {
    busy = true
    await (yes ? confirmIngredient(m.a, m.b) : rejectIngredient(m.a, m.b))
    busy = false
  }

  /* Master list : les ingrédients rangés par genre, non classés en tête. */
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
    ...store.categories.map(c => c.name),
    ...store.refs.map(r => r.category).filter(Boolean)])].toSorted((a, b) => a.localeCompare(b, 'fr')))

  /* Gérer les genres : renommer (un nom existant fusionne), sourcing par
   * défaut, suppression en deux touches, création. */
  let mlGenres = $state(false)
  let genreNew = $state('')
  let genreEdit = $state(null)
  let genreNewName = $state('')
  let genreDelete = $state(null)
  const genres = $derived(store.categories.toSorted((a, b) => a.name.localeCompare(b.name, 'fr')))

  async function renameGenre(name) {
    const n = genreNewName.trim()
    if (!n || n === name) { genreEdit = null; return }
    busy = true
    await renameCategory(name, n)
    busy = false
    genreEdit = null
  }

  /* Fiche d'un ingrédient : renommer (fusion en deux touches), sourcing,
   * recettes associées. */
  let mlEdit = $state(null)
  let edName = $state('')
  let edSourcing = $state('')
  let edNote = $state('')
  let edConfirm = $state(false)

  function openIngredient(ing) {
    if (mlEdit === ing.name) { mlEdit = null; return }
    mlEdit = ing.name
    edName = ing.name
    const ref = store.refs.find(r => r.name === ing.name)
    edSourcing = ref?.sourcing ?? ''
    edNote = ref?.sourcing_note ?? ''
    edConfirm = false
  }

  async function saveIngredientName(oldName) {
    const n = edName.trim()
    if (!n || n === oldName) return
    const fusion = mlTotal.some(i => i.name !== oldName && foldml(i.name) === foldml(n))
    if (fusion && !edConfirm) { edConfirm = true; return }
    busy = true
    await renameIngredient(oldName, n)
    message = fusion ? `« ${oldName} » fusionné dans « ${n} ».` : `Renommé en « ${n} ».`
    busy = false
    mlEdit = null
  }

  async function saveIngredientSourcing(name) {
    busy = true
    await setIngredientSourcing(name, edSourcing, edNote)
    busy = false
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La date du dernier inventaire n'a pas pu être enregistrée :
      la base de données doit être mise à jour (migration « locations » en attente).</p>
  {/if}
  {#if message}<p class="note manage-msg">{message}</p>{/if}

  {#if received.length}
    <p class="group-title">À mettre en stock <span class="n">· {received.length}</span></p>
    <p class="note">Achats rangés depuis les courses : vérifier la quantité reçue,
      choisir l'emplacement, puis « Ranger ».</p>
    <ul>
      {#each received as entry (entry.id)}
        <li class="row">
          <span class="name" title={entry.name}>{entry.name}</span>
          <div class="manage-row" style="flex: 0 1 auto">
            <input class="f-qty" type="number" inputmode="numeric" min="1" style="flex: 0 1 64px"
              value={stashQty[entry.id] ?? defaultQty(entry)}
              oninput={e => stashQty[entry.id] = e.target.value}
              aria-label={'Quantité reçue de ' + entry.name}>
            <input list="manage-locs" placeholder="Emplacement" style="flex: 0 1 150px"
              value={stashLoc[entry.id] ?? receivedLoc(entry)}
              oninput={e => stashLoc[entry.id] = e.target.value}
              aria-label={'Emplacement de rangement de ' + entry.name}>
            <button type="button" class="inv-start" disabled={busy || !(stashLoc[entry.id] ?? receivedLoc(entry)).trim()}
              onclick={() => ranger(entry)}>Ranger</button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}

  {#if merges.length}
    <p class="group-title">Ingrédients à rapprocher <span class="n">· {merges.length}</span></p>
    <ul>
      {#each merges as m (m.a + '|' + m.b)}
        {@const key = m.a + '|' + m.b}
        <li class="row">
          <button type="button" class="rowbtn-full info" title="Afficher les noms en entier"
            onclick={() => mergeOpen = mergeOpen === key ? null : key}>
            <span class="name" class:name-full={mergeOpen === key}>« {m.b} » et « {m.a} » : même ingrédient ?</span>
          </button>
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
          <button type="button" class="inv-manage" onclick={() => mlGenres = !mlGenres} aria-expanded={mlGenres}>
            {mlGenres ? 'Refermer les genres' : 'Gérer les genres'}
          </button>
        </div>
        {#if mlGenres}
          <div class="manage-block">
            <p>Les genres rangent la master list. Le sourcing du genre préremplit
              le magasin des courses (affinable ingrédient par ingrédient).</p>
            <ul class="manage-items">
              {#each genres as g (g.id)}
                <li class="manage-row">
                  {#if genreEdit === g.name}
                    <input bind:value={genreNewName} aria-label={'Nouveau nom de ' + g.name}>
                    <button type="button" class="inv-start" disabled={busy} onclick={() => renameGenre(g.name)}>OK</button>
                    <button type="button" class="inv-manage" onclick={() => genreEdit = null}>Annuler</button>
                  {:else}
                    <button type="button" class="rowbtn-full info" onclick={() => { genreEdit = g.name; genreNewName = g.name; genreDelete = null }}>
                      <span class="name">{g.name}</span>
                    </button>
                    <select value={g.sourcing} onchange={e => setCategorySourcing(g.name, e.target.value, g.sourcing_note ?? '')}
                      aria-label={'Sourcing du genre ' + g.name}>
                      <option value="">— sourcing —</option>
                      {#each SOURCING_TYPES as t (t)}<option value={t}>{t}</option>{/each}
                    </select>
                    <input value={g.sourcing_note} placeholder="Marché, site, boutique…"
                      onchange={e => setCategorySourcing(g.name, g.sourcing ?? '', e.target.value)}
                      aria-label={'Commentaire de sourcing du genre ' + g.name}>
                    {#if genreDelete === g.name}
                      <button type="button" class="inv-start danger-btn" disabled={busy}
                        onclick={async () => { busy = true; await removeCategory(g.name); busy = false; genreDelete = null }}>Confirmer</button>
                      <button type="button" class="inv-manage" onclick={() => genreDelete = null}>Non</button>
                    {:else}
                      <button type="button" class="inv-manage" onclick={() => { genreDelete = g.name; genreEdit = null }}>Supprimer</button>
                    {/if}
                  {/if}
                </li>
              {/each}
            </ul>
            <div class="manage-row">
              <input bind:value={genreNew} placeholder="Nouveau genre" aria-label="Nouveau genre">
              <button type="button" class="inv-start" disabled={busy || !genreNew.trim()}
                onclick={async () => { busy = true; await addCategory(genreNew); genreNew = ''; busy = false }}>Ajouter</button>
            </div>
          </div>
        {/if}
        {#each mlSections as [cat, items] (cat)}
          <p class="group-title">{cat || 'Non classés'} <span class="n">· {items.length}</span></p>
          <ul class="manage-items">
            {#each items as ing (ing.name)}
              <li class="row">
                <button type="button" class="rowbtn-full ml-name" onclick={() => openIngredient(ing)}
                  aria-expanded={mlEdit === ing.name}>
                  <span class="name" title={ing.name}>{mlEdit === ing.name ? '▾' : '▸'} {ing.name}</span>
                </button>
                <select class="ml-genre" value={ing.category} onchange={e => setIngredientCategory(ing.name, e.target.value)}
                  aria-label={'Genre de ' + ing.name}>
                  <option value="">Non classé</option>
                  {#each mlCategories as c (c)}<option value={c}>{c}</option>{/each}
                </select>
              </li>
              {#if mlEdit === ing.name}
                {@const linked = recipesUsing(ing.name)}
                {@const effectif = sourcingOf(ing.name)}
                <li class="manage-panel">
                  <div class="manage-block">
                    <p>Renommer l'ingrédient — un nom déjà connu fusionne les deux :</p>
                    <div class="manage-row">
                      <input bind:value={edName} oninput={() => edConfirm = false} aria-label="Nouveau nom">
                      <button type="button" class="inv-start" class:danger-btn={edConfirm} disabled={busy}
                        onclick={() => saveIngredientName(ing.name)}>
                        {edConfirm ? 'Confirmer la fusion' : 'Renommer'}
                      </button>
                    </div>
                  </div>
                  <div class="manage-block">
                    <p>Sourcing — où l'acheter (vide = comme le genre{effectif.sourcing || effectif.note ? ` : ${[effectif.sourcing, effectif.note].filter(Boolean).join(', ')}` : ''}) :</p>
                    <div class="manage-row">
                      <select bind:value={edSourcing} aria-label="Sourcing">
                        <option value="">— comme le genre —</option>
                        {#each SOURCING_TYPES as t (t)}<option value={t}>{t}</option>{/each}
                      </select>
                      <input bind:value={edNote} placeholder="Marché, site, boutique…" aria-label="Commentaire de sourcing">
                      <button type="button" class="inv-start" disabled={busy}
                        onclick={() => saveIngredientSourcing(ing.name)}>Enregistrer</button>
                    </div>
                  </div>
                  <div class="manage-block">
                    <p>{linked.length ? `Utilisé dans ${linked.length} recette(s) :` : 'Utilisé dans aucune recette.'}</p>
                    {#if linked.length}
                      <ul class="manage-items">
                        {#each linked as r (r.id)}<li class="row"><span class="name">{r.title}</span></li>{/each}
                      </ul>
                    {/if}
                  </div>
                </li>
              {/if}
            {/each}
          </ul>
        {/each}
      </div>
    {/if}
  </div>

  {#if !mlOpen}
  <p class="group-title">Emplacements <span class="n">· {locs.length}</span></p>
  <ul>
    {#each locs as name (name)}
      <li class="loc-item">
        <div class="row">
          <div class="info">
            <span class="name">{name}{#if isDatedLoc(name)} <span class="note">· à dates</span>{/if}</span>
            <span class="note">{count(name)} produits · {lastDate(name)}</span>
          </div>
          <button type="button" class="inv-manage" onclick={() => openManage(name)}>Gérer</button>
          <button type="button" class="inv-start" onclick={() => startInventory(name)}>Inventaire</button>
        </div>
        {#if managed === name}
          <div class="manage-panel">
            <div class="manage-block">
              <label class="row">
                <input type="checkbox" checked={isDatedLoc(name)} disabled={busy}
                  onchange={async e => { busy = true; await setLocationDated(name, e.target.checked); busy = false }}>
                Emplacement « à dates » (congélateur, cave…) : chaque entrée forme un
                lot daté, la sortie propose le plus ancien
              </label>
              {#if isDatedLoc(name)}
                <div class="manage-row">
                  <input class="f-qty" type="number" inputmode="numeric" min="1" style="flex: 0 1 80px"
                    value={store.locations.find(l => l.name === name)?.stale_months ?? 6}
                    onchange={e => setLocationStaleMonths(name, e.target.value)}
                    aria-label="Ancienneté avant rappel (mois)">
                  <span class="note" style="align-self: center">mois avant rappel « à utiliser » dans la Semaine</span>
                </div>
              {/if}
            </div>
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
  {/if}
  <datalist id="manage-locs">
    {#each locs as l (l)}<option value={l}></option>{/each}
  </datalist>
</section>
