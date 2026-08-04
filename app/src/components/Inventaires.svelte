<script>
  import { store, startInventory, renameLocation, moveItems, addLocation, removeLocation, pendingMerges,
    confirmMerge as confirmIngredient, rejectMerge as rejectIngredient,
    masterList, setIngredientCategory, isDatedLoc, setLocationDated, setLocationStaleMonths,
    addCategory, renameCategory, removeCategory, setCategorySourcing,
    invIsHere, pausedInvsHere, invsElsewhere, resumePausedInventory, reopenInventory,
    SOURCING_TYPES, fold } from '../lib/store.svelte.js'
  import SousEcran from './SousEcran.svelte'
  import Stock from './Stock.svelte'
  import FicheIngredient from './FicheIngredient.svelte'

  const locs = $derived.by(() => {
    const names = [...new Set([
      ...store.items.map(i => i.loc).filter(Boolean),
      ...store.locations.map(l => l.name)
    ])]
    return names.sort((a, b) => a.localeCompare(b, 'fr'))
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
  /* Seconde porte de la liste d'ingrédients (N14, 27/07/2026) : toucher un
   * emplacement ouvre la même liste que l'onglet Stock, filtrée. */
  let voirLoc = $state(null)
  let newName = $state('')
  let confirmMerge = $state(false)
  let selected = $state([])
  let moveDest = $state('')
  let busy = $state(false)
  let message = $state('')

  /* Ajout et suppression d'un emplacement (commentaires Olivier 25/07/2026) :
   * l'ajout crée un emplacement vide ; la suppression n'est possible que
   * vide (sinon déplacer ou fusionner d'abord), en deux touches. */
  let newLocName = $state('')
  let confirmDeleteLoc = $state(false)
  let locRenaming = $state(false) // renommage au crayon, sur le nom

  /* Plusieurs inventaires de front (décision Olivier 04/08/2026) : chaque
   * pause se reprend indépendamment, démarrer ailleurs ne perd plus rien.
   * Sur un emplacement déjà inventorié, deux touches pour choisir :
   * rouvrir (compléter — les produits en stock restent « vus ») ou
   * repartir de zéro. */
  let startChoice = $state(null)

  function demarrer(name) {
    message = ''
    if (pausedInvsHere().some(p => p.loc === name)) { resumePausedInventory(name); return }
    const row = store.locations.find(l => l.name === name)
    if (row?.last_inventory_at && startChoice !== name) { startChoice = name; return }
    startChoice = null
    startInventory(name)
  }

  function openManage(name) {
    managed = managed === name ? null : name
    newName = ''
    confirmMerge = false
    confirmDeleteLoc = false
    locRenaming = false
    selected = []
    moveDest = ''
    message = ''
  }

  async function ajouterEmplacement() {
    busy = true
    await addLocation(newLocName)
    message = `Emplacement « ${newLocName.trim()} » créé.`
    newLocName = ''
    busy = false
  }

  async function supprimerEmplacement() {
    busy = true
    await removeLocation(managed)
    message = `Emplacement « ${managed} » supprimé.`
    busy = false
    managed = null
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

  /* (La réception des achats — « à mettre en stock », Q2 du 16/07/2026 —
   * vit désormais dans l'écran « Ranger les courses » de l'onglet Courses,
   * décision Olivier 27/07/2026, cas N13.) */

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


  const mlSections = $derived.by(() => {
    let liste = masterList()
    if (mlSearch.trim()) liste = liste.filter(i => fold(i.name).includes(fold(mlSearch)))
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

  /* Fiche d'un ingrédient : LA fiche unique (FicheIngredient.svelte,
   * décision Olivier 04/08/2026). */
  let mlEdit = $state(null)

  function openIngredient(ing) {
    mlEdit = mlEdit === ing.name ? null : ing.name
    mlGenres = false // une seule saisie ouverte à la fois
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La base de données doit être mise à jour (migration en
      attente) : la dernière modification n'a pas pu être enregistrée.</p>
  {/if}
  {#if message}<p class="note manage-msg">{message}</p>{/if}

  {#if invsElsewhere().length}
    <p class="note">{invsElsewhere().length > 1
      ? 'Des inventaires sont en pause dans d’autres résidences'
      : 'Un inventaire est en pause dans une autre résidence (' +
        (store.residences.find(r => r.id === invsElsewhere()[0].residenceId)?.name ?? 'autre maison') + ')'}
      — pour les reprendre, changer de résidence dans « Foyer et compte ».</p>
  {/if}
  {#if pausedInvsHere().length}
    <div class="toolbar inv-paused-list">
      {#each pausedInvsHere() as p (p.loc)}
        <button type="button" class="primary" onclick={() => resumePausedInventory(p.loc)}>
          Reprendre l'inventaire de « {p.loc} »
        </button>
      {/each}
    </div>
  {/if}

  {#if voirLoc}
    <!-- Ingrédients d'un emplacement : la même liste que l'onglet Stock,
         filtrée (N14, décision Olivier 27/07/2026). -->
    <SousEcran titre={'Ingrédients — ' + voirLoc} fermer={() => voirLoc = null}>
      <Stock loc={voirLoc} />
    </SousEcran>
  {:else if managed}
    <!-- Gérer un emplacement : sous-écran dédié (commentaires Olivier 25/07/2026). -->
    <SousEcran titre={managed} fermer={() => managed = null}>
      <div class="manage-panel">
        <div class="manage-block">
          {#if locRenaming}
            <p>Renommer l'emplacement — un nom déjà existant <strong>fusionne</strong> les deux :</p>
            <div class="manage-row">
              <input class="rename-input" bind:value={newName} list="manage-locs"
                oninput={() => confirmMerge = false} aria-label="Nouveau nom">
              <button type="button" class="inv-start" class:danger-btn={confirmMerge}
                disabled={busy || !newName.trim()} onclick={rename}>
                {confirmMerge ? 'Confirmer la fusion' : 'OK'}</button>
              <button type="button" class="inv-manage" onclick={() => { locRenaming = false; newName = '' }}>Annuler</button>
            </div>
          {:else}
            <div class="row source-row">
              <span class="name">{managed}</span>
              <button type="button" class="icon-btn" aria-label={'Renommer ' + managed} title="Renommer"
                onclick={() => { locRenaming = true; newName = managed; confirmMerge = false }}>✎</button>
            </div>
          {/if}
        </div>
        <div class="manage-block">
          <label class="row">
            <input type="checkbox" checked={isDatedLoc(managed)} disabled={busy}
              onchange={async e => { busy = true; await setLocationDated(managed, e.target.checked); busy = false }}>
            Emplacement « à dates » (congélateur, cave…) : chaque entrée forme un
            lot daté, la sortie propose le plus ancien
          </label>
          {#if isDatedLoc(managed)}
            <div class="manage-row">
              <input class="f-qty" type="number" inputmode="numeric" min="1"
                value={store.locations.find(l => l.name === managed)?.stale_months ?? 6}
                onchange={e => setLocationStaleMonths(managed, e.target.value)}
                aria-label="Ancienneté avant rappel (mois)">
              <span class="note" style="align-self: center">mois avant rappel « à utiliser » dans la Semaine</span>
            </div>
          {/if}
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
        <div class="manage-block">
          {#if count(managed) === 0}
            <p>Supprimer cet emplacement (vide) :</p>
            <div class="manage-row">
              {#if confirmDeleteLoc}
                <button type="button" class="inv-start danger-btn" disabled={busy}
                  onclick={supprimerEmplacement}>Confirmer la suppression</button>
                <button type="button" class="inv-manage" onclick={() => confirmDeleteLoc = false}>Non, garder</button>
              {:else}
                <button type="button" class="inv-manage" onclick={() => confirmDeleteLoc = true}>Supprimer l'emplacement</button>
              {/if}
            </div>
          {:else}
            <p>Pour supprimer cet emplacement, déplacez ou fusionnez d'abord
              ses {count(managed)} produit(s).</p>
          {/if}
        </div>
      </div>
    </SousEcran>
  {:else if mlEdit}
    <!-- LA fiche ingrédient (04/08/2026) : la fermer ramène à la master list. -->
    <FicheIngredient name={mlEdit} fermer={() => mlEdit = null} />
  {:else if mlOpen}
    <!-- Master list : sous-écran dédié (commentaires Olivier 25/07/2026). -->
    <SousEcran titre="Master list des ingrédients" fermer={() => { mlOpen = false; mlEdit = null; mlGenres = false }}>
      <div class="manage-panel">
        <div class="manage-row">
          <input bind:value={mlSearch} placeholder="Filtrer les ingrédients…" aria-label="Filtrer la master list">
          <button type="button" class="inv-manage" onclick={() => { mlGenres = !mlGenres; mlEdit = null }} aria-expanded={mlGenres}>
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
                    <input class="rename-input" bind:value={genreNewName} aria-label={'Nouveau nom de ' + g.name}>
                    <button type="button" class="inv-start" disabled={busy} onclick={() => renameGenre(g.name)}>OK</button>
                    <button type="button" class="inv-manage" onclick={() => genreEdit = null}>Annuler</button>
                  {:else}
                    <span class="name">{g.name}</span>
                    <button type="button" class="icon-btn" aria-label={'Renommer ' + g.name} title="Renommer"
                      onclick={() => { genreEdit = g.name; genreNewName = g.name; genreDelete = null }}>✎</button>
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
        {:else}
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
            {/each}
          </ul>
        {/each}
        {/if}
      </div>
    </SousEcran>
  {:else}

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
    <button type="button" class="row rowbtn-full" onclick={() => mlOpen = true}>
      <div class="info">
        <span class="name">▸ Master list des ingrédients</span>
        <span class="note">{mlTotal.length} ingrédients · {mlTotal.filter(i => !i.category).length} non classés</span>
      </div>
    </button>
  </div>

  <p class="group-title">Emplacements <span class="n">· {locs.length}</span></p>
  <ul>
    {#each locs as name (name)}
      <li class="loc-item">
        <div class="row">
          <button type="button" class="rowbtn-full info" title="Voir et gérer les ingrédients de cet emplacement"
            onclick={() => voirLoc = name}>
            <span class="name">{name}{#if isDatedLoc(name)} <span class="note">· à dates</span>{/if}</span>
            <span class="note">{count(name)} produits · {lastDate(name)}</span>
          </button>
          <button type="button" class="inv-manage" onclick={() => openManage(name)}>Gérer</button>
          <button type="button" class="inv-start" onclick={() => demarrer(name)}>
            {pausedInvsHere().some(p => p.loc === name) ? 'Reprendre' : 'Inventaire'}</button>
        </div>
        {#if startChoice === name}
          <div class="manage-row inv-start-choice">
            <span class="note">Déjà inventorié — compléter, ou tout recompter ?</span>
            <button type="button" class="inv-start"
              onclick={() => { startChoice = null; reopenInventory(name) }}>Rouvrir (compléter)</button>
            <button type="button" class="inv-start"
              onclick={() => { startChoice = null; startInventory(name) }}>Repartir de zéro</button>
            <button type="button" class="inv-manage" onclick={() => startChoice = null}>Annuler</button>
          </div>
        {/if}
      </li>
    {/each}
  </ul>
  <div class="manage-row se-add">
    <input bind:value={newLocName} placeholder="Nouvel emplacement (Placard, Congélateur…)"
      aria-label="Nouvel emplacement">
    <button type="button" class="inv-start" disabled={busy || !newLocName.trim()}
      onclick={ajouterEmplacement}>Ajouter</button>
  </div>
  {/if}
  <datalist id="manage-locs">
    {#each locs as l (l)}<option value={l}></option>{/each}
  </datalist>
</section>
