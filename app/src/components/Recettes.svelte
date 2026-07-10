<script>
  import { store, lastMade, addRealisation, importPassard, ingredientsOf, saveRecipeDetails,
    fillPassardDetails, passardFillableCount, searchRecipes, renameSource, addSource, setRecipeSource,
    knownNames, photosOf, addRecipePhoto, photoUrl, deletePhoto, setWishlist, ingredientLine,
    fetchRecipeFromUrl, createImportedRecipe, findDuplicateRecipe, compressImage } from '../lib/store.svelte.js'
  import { ollamaReady, extractRecipeFromImages, proposalFromExtraction } from '../lib/ollama-recipe.js'
  import { PASSARD_FICHES } from '../lib/passard-fiches.js'

  const ficheUrls = new Set(PASSARD_FICHES.map(f => f.url))
  const fillable = $derived(passardFillableCount(ficheUrls))

  let search = $state('')
  let open = $state(null)
  let madeOn = $state(new Date().toISOString().slice(0, 10))
  let comment = $state('')
  let busy = $state(false)
  let sourceFilter = $state('Toutes')

  function fold(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  /** Nom court d'une source pour les chips (« Alain Passard — … » → « Alain Passard »). */
  function shortSource(source) {
    return source.title.split(' — ')[0]
  }

  const sourceChips = $derived.by(() => {
    const used = new Set(store.recipes.map(r => r.source_id).filter(Boolean))
    return store.sources.filter(s => used.has(s.id))
      .toSorted((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }))
  })

  let ingFilter = $state('')
  let categoryFilter = $state('Toutes')
  let wishFilter = $state(false)

  /** Catégories existantes (« Boissons »… ; vide = plat). */
  const categories = $derived([...new Set(store.recipes.map(r => r.category).filter(Boolean))]
    .toSorted((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' })))

  /** Recherche multicritère (titre, ingrédient, pays, catégorie, source, mot du texte)
   * + menus déroulants source et catégorie + filtre par ingrédient (liste réduite en tapant). */
  const list = $derived.by(() => {
    let recipes = searchRecipes(search)
    if (sourceFilter !== 'Toutes') recipes = recipes.filter(r => r.source_id === sourceFilter)
    if (categoryFilter !== 'Toutes') recipes = recipes.filter(r => r.category === categoryFilter)
    if (wishFilter) recipes = recipes.filter(r => r.wishlist)
    if (ingFilter.trim()) recipes = recipes.filter(r =>
      store.ingredients.some(i => i.recipe_id === r.id && fold(i.name).includes(fold(ingFilter))))
    return recipes.toSorted((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }))
  })

  let manageSources = $state(false)
  let sourceNames = $state({})
  let newSource = $state('')

  /* Les filtres particuliers vivent dans un dépliant refermable (décision
   * Olivier 07/07/2026) ; seule la recherche plein texte reste toujours visible. */
  let filtersOpen = $state(false)
  const activeFilters = $derived(
    (sourceFilter !== 'Toutes' ? 1 : 0) + (categoryFilter !== 'Toutes' ? 1 : 0) +
    (ingFilter.trim() ? 1 : 0) + (wishFilter ? 1 : 0))

  async function renameOne(source) {
    const title = (sourceNames[source.id] ?? '').trim()
    if (!title) return
    await renameSource(source, title)
    sourceNames = {}
  }

  function sourceOf(recipe) {
    return store.sources.find(s => s.id === recipe.source_id)
  }

  function madeLabel(recipe) {
    const last = lastMade(recipe.id)
    if (!last) return 'jamais cuisinée'
    if (last === 'inconnue') return 'cuisinée (date non notée)'
    return 'cuisinée le ' + new Date(last + 'T00:00').toLocaleDateString('fr-FR')
  }

  /** Règle « jamais deux fois dans l'année » (NP11) : alerte si moins d'un an. */
  function recent(recipe) {
    const last = lastMade(recipe.id)
    if (!last || last === 'inconnue') return false
    return (Date.now() - new Date(last + 'T00:00').getTime()) < 365 * 24 * 3600 * 1000
  }

  function realsOf(recipe) {
    return store.realisations.filter(r => r.recipe_id === recipe.id)
      .toSorted((a, b) => (b.made_on ?? '') < (a.made_on ?? '') ? -1 : 1)
  }

  let editing = $state(false)
  let ingText = $state('')
  let stepsText = $state('')
  let servingsText = $state('')
  let countryText = $state('')
  let categoryText = $state('')
  let sourcePick = $state('')

  function toggleOpen(recipe) {
    open = open === recipe.id ? null : recipe.id
    madeOn = new Date().toISOString().slice(0, 10)
    comment = ''
    faitPhotoName = ''
    editing = false
  }

  function startEdit(recipe) {
    ingText = ingredientsOf(recipe.id).map(ingredientLine).join('\n')
    stepsText = recipe.steps ?? ''
    servingsText = recipe.servings ?? ''
    countryText = recipe.country ?? ''
    categoryText = recipe.category ?? ''
    sourcePick = recipe.source_id ?? ''
    editing = true
  }

  async function saveEdit(recipe) {
    busy = true
    await saveRecipeDetails(recipe, ingText, stepsText,
      Number(servingsText) > 0 ? Number(servingsText) : null, countryText, categoryText)
    if (sourcePick && sourcePick !== recipe.source_id) await setRecipeSource(recipe, sourcePick)
    busy = false
    editing = false
  }

  let faitPhotoInput = $state(null)
  let faitPhotoName = $state('')

  async function fait(recipe, e) {
    e.preventDefault()
    busy = true
    const real = await addRealisation(recipe, madeOn, comment)
    const file = faitPhotoInput?.files?.[0]
    if (real && file) await addRecipePhoto(recipe, file, 'plat', real.id)
    if (faitPhotoInput) faitPhotoInput.value = ''
    faitPhotoName = ''
    comment = ''
    busy = false
  }

  async function addPhoto(recipe, e, kind) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    busy = true
    await addRecipePhoto(recipe, file, kind)
    busy = false
  }

  async function removePhoto(photo) {
    if (!confirm('Supprimer cette photo ?')) return
    busy = true
    await deletePhoto(photo)
    busy = false
  }

  async function amorcer() {
    busy = true
    await importPassard()
    busy = false
  }

  /* Import d'une recette (A1 URL, A3 photos) : récupérer → relire → enregistrer. */
  let importOpen = $state(false)
  let importUrl = $state('')
  let importError = $state('')
  let importDuplicate = $state(null)
  let importProposal = $state(null)
  let ollamaOk = $state(false) // IA locale disponible sur ce PC (A3)
  let importPhotoBusy = $state(false)
  let importFiles = [] // photos de la page, rattachées à la fiche après enregistrement

  function toggleImport() {
    importOpen = !importOpen
    if (!importOpen) { cancelImport(); return }
    ollamaReady().then(ok => { ollamaOk = ok })
  }

  /** A3 : photos de la page → IA locale (Ollama) → fiche à relire. */
  async function importPhotos(e) {
    const files = [...(e.target.files ?? [])]
    e.target.value = ''
    if (!files.length) return
    busy = true
    importPhotoBusy = true
    importError = ''
    importDuplicate = null
    try {
      const images = []
      for (const f of files) {
        const blob = await compressImage(f)
        images.push(await new Promise((resolve, reject) => {
          const r = new FileReader()
          r.onload = () => resolve(r.result.split(',')[1])
          r.onerror = () => reject(r.error)
          r.readAsDataURL(blob)
        }))
      }
      const proposal = proposalFromExtraction(await extractRecipeFromImages(images))
      importProposal = { url: '', sourceTitle: '', category: '', country: '', sourceKind: 'livre', ...proposal }
      importFiles = files
    } catch {
      importError = 'L\'extraction locale a échoué. Vérifier qu\'Ollama tourne sur ce PC, puis réessayer.'
    }
    busy = false
    importPhotoBusy = false
  }

  async function fetchImport() {
    const url = importUrl.trim()
    importError = ''
    importProposal = null
    importDuplicate = findDuplicateRecipe(url)
    if (importDuplicate) return
    busy = true
    const { proposal, error } = await fetchRecipeFromUrl(url)
    busy = false
    if (error) { importError = error; return }
    importProposal = {
      url,
      title: proposal.title,
      sourceTitle: proposal.sourceName,
      servings: proposal.servings ?? '',
      category: proposal.category,
      country: '',
      ingredientsText: proposal.ingredientLines.join('\n'),
      steps: proposal.steps
    }
  }

  async function saveImport() {
    busy = true
    const p = importProposal
    const res = await createImportedRecipe({ ...p, servings: Number(p.servings) > 0 ? Number(p.servings) : null })
    if (res.error) { importError = res.error; busy = false; return }
    if (res.duplicate) { importProposal = null; importDuplicate = res.duplicate; busy = false; return }
    for (const f of importFiles) await addRecipePhoto(res.recipe, f, 'page') // copie privée de la page
    busy = false
    importProposal = null
    importFiles = []
    importUrl = ''
    importOpen = false
    open = res.recipe.id
  }

  function cancelImport() {
    importProposal = null
    importFiles = []
    importError = ''
    importDuplicate = null
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La base de données doit être mise à jour (migration en
      attente) : certaines fonctions sont indisponibles.</p>
  {/if}

  <div class="filters">
    <div class="searchrow">
      <input id="search" type="search" bind:value={search} placeholder="Rechercher une recette…" aria-label="Rechercher">
      <button type="button" class="inv-manage filters-toggle" class:chip-on={activeFilters > 0}
        aria-expanded={filtersOpen} onclick={() => filtersOpen = !filtersOpen}>
        {filtersOpen ? '▾' : '▸'} Filtres{activeFilters > 0 ? ' (' + activeFilters + ')' : ''}
      </button>
    </div>
    {#if filtersOpen}
      <div class="manage-panel">
        <div class="manage-row">
          <select bind:value={sourceFilter} aria-label="Filtrer par source">
            <option value="Toutes">Toutes les sources</option>
            {#each sourceChips as source (source.id)}
              <option value={source.id}>{source.title}</option>
            {/each}
          </select>
          {#if categories.length}
            <select bind:value={categoryFilter} aria-label="Filtrer par catégorie">
              <option value="Toutes">Toutes les catégories</option>
              {#each categories as c (c)}
                <option value={c}>{c}</option>
              {/each}
            </select>
          {/if}
        </div>
        <div class="manage-row">
          <input bind:value={ingFilter} list="known-ingredients-rec" placeholder="Par ingrédient…"
            aria-label="Filtrer par ingrédient">
          <button type="button" class="inv-manage" class:chip-on={wishFilter}
            onclick={() => wishFilter = !wishFilter}>★ Wish list</button>
        </div>
        <div class="manage-row">
          <button type="button" class="inv-manage" onclick={() => manageSources = !manageSources}>Gérer les sources</button>
          <button type="button" class="inv-start" onclick={() => filtersOpen = false}>Refermer — voir les recettes</button>
        </div>
      </div>
    {/if}
  </div>
  <div class="toolbar" style="justify-content: flex-start; margin: 8px 0 0">
    <button type="button" class="inv-manage" aria-expanded={importOpen} onclick={toggleImport}>
      {importOpen ? '▾' : '▸'} Importer une recette (URL, photos)
    </button>
  </div>
  {#if importOpen}
    <div class="manage-panel">
      {#if !importProposal}
        <form class="manage-row" onsubmit={e => { e.preventDefault(); fetchImport() }}>
          <input type="url" bind:value={importUrl} placeholder="https://…"
            aria-label="Adresse de la page de la recette" required>
          <button class="inv-start" disabled={busy || !importUrl.trim()}>Récupérer la recette</button>
        </form>
        {#if ollamaOk}
          <p class="manage-row">
            <label class="file-btn">Depuis des photos de la recette — IA locale sur ce PC
              <input type="file" accept="image/*" multiple hidden disabled={busy} onchange={importPhotos}>
            </label>
          </p>
          {#if importPhotoBusy}
            <p class="note">Lecture des photos par l'IA locale — environ une minute…</p>
          {/if}
        {/if}
        {#if importDuplicate}
          <p class="message">Cette recette est déjà là : « {importDuplicate.title} ».
            <button type="button" class="inv-manage"
              onclick={() => { open = importDuplicate.id; importOpen = false; cancelImport() }}>Voir la fiche</button>
          </p>
        {/if}
        {#if importError}<p class="message">{importError}</p>{/if}
      {:else}
        <p><strong>{importProposal.title}</strong> — relire et corriger avant d'enregistrer :</p>
        <p class="manage-row">
          <label>Titre <input bind:value={importProposal.title} aria-label="Titre de la recette"></label>
          <label>Source <input bind:value={importProposal.sourceTitle} list="import-sources"
            placeholder="Livre, site…" aria-label="Source"></label>
          <datalist id="import-sources">
            {#each store.sources.toSorted((a, b) => a.title.localeCompare(b.title, 'fr')) as s (s.id)}
              <option value={s.title}></option>
            {/each}
          </datalist>
        </p>
        <p class="manage-row">
          <label>Pour
            <input class="f-qty" type="number" inputmode="numeric" min="1" bind:value={importProposal.servings}
              aria-label="Nombre de personnes" placeholder="?">
            personnes</label>
          <label>Pays d'origine
            <input bind:value={importProposal.country} placeholder="Inde, France, Brésil…" aria-label="Pays d'origine">
          </label>
          <label>Catégorie
            <input bind:value={importProposal.category} list="recipe-categories" placeholder="Boissons… (vide = plat)"
              aria-label="Catégorie">
          </label>
        </p>
        <p>Ingrédients — un par ligne (« ! » en tête = difficile à sourcer) :</p>
        <textarea bind:value={importProposal.ingredientsText} rows="8" aria-label="Ingrédients"></textarea>
        <p>Recette (étapes) :</p>
        <textarea bind:value={importProposal.steps} rows="8" aria-label="Recette"></textarea>
        {#if importError}<p class="message">{importError}</p>{/if}
        <div class="manage-row">
          <button type="button" class="inv-start" disabled={busy} onclick={saveImport}>Enregistrer la recette</button>
          <button type="button" class="inv-manage" onclick={cancelImport}>Annuler</button>
        </div>
      {/if}
    </div>
  {/if}

  <datalist id="known-ingredients-rec">
    {#each knownNames().toSorted((a, b) => a.localeCompare(b, 'fr')) as n (n)}<option value={n}></option>{/each}
  </datalist>
  <datalist id="recipe-categories">
    {#each categories.length ? categories : ['Boissons'] as c (c)}<option value={c}></option>{/each}
  </datalist>

  {#if manageSources}
    <div class="manage-panel">
      <p>Renommer une source — un nom déjà existant <strong>fusionne</strong> les deux :</p>
      <ul class="manage-items">
        {#each store.sources.toSorted((a, b) => a.title.localeCompare(b.title, 'fr')) as source (source.id)}
          <li class="row">
            <div class="info">
              <span class="name" title={source.title}>{source.title}</span>
              <span class="note">{store.recipes.filter(r => r.source_id === source.id).length} recette(s)</span>
            </div>
            <input bind:value={sourceNames[source.id]} placeholder="Nouveau nom" aria-label={'Renommer ' + source.title}>
            <button type="button" class="inv-manage" disabled={busy} onclick={() => renameOne(source)}>Renommer</button>
          </li>
        {/each}
      </ul>
      <div class="manage-row">
        <input bind:value={newSource} placeholder="Nouvelle source (livre, site…)" aria-label="Nouvelle source">
        <button type="button" class="inv-start" disabled={busy || !newSource.trim()}
          onclick={async () => { await addSource(newSource); newSource = '' }}>Ajouter</button>
      </div>
    </div>
  {/if}

  {#if fillable > 0}
    <div class="toolbar" style="justify-content: flex-start; margin: 8px 0 0">
      <button type="button" disabled={busy}
        onclick={async () => { busy = true; await fillPassardDetails(); busy = false }}>
        Compléter les fiches Passard — ingrédients et recette ({fillable})
      </button>
    </div>
  {/if}

  {#if store.recipes.length === 0}
    <div class="empty">
      <p>Aucune recette pour l'instant.</p>
      <button type="button" class="inv-start" disabled={busy} onclick={amorcer}>
        Importer les 105 recettes d'Alain Passard (vidéos Le Point)
      </button>
    </div>
  {:else}
    <p class="group-title">Recettes <span class="n">· {list.length}</span></p>
    <ul>
      {#each list as recipe (recipe.id)}
        <li class="loc-item">
          <button type="button" class="row rowbtn-full" onclick={() => toggleOpen(recipe)}>
            <div class="info">
              <span class="name" title={recipe.title}>{#if recipe.wishlist}<span class="wish-star">★</span> {/if}{recipe.title}</span>
              <span class="note" class:recent-warn={recent(recipe)}>{madeLabel(recipe)}</span>
            </div>
          </button>
          {#if open === recipe.id}
            <div class="manage-panel">
              <div class="manage-block">
                {#if sourceOf(recipe)}<p>Source : {sourceOf(recipe).title}{recipe.country ? ' · Pays : ' + recipe.country : ''}{recipe.category ? ' · ' + recipe.category : ''}</p>{/if}
                {#if recipe.url}<p><a href={recipe.url} target="_blank" rel="noreferrer">Voir en ligne ({new URL(recipe.url).hostname.replace('www.', '')})</a></p>{/if}
                {#if recipe.video}<p class="note">Vidéo locale : {recipe.video}</p>{/if}
                <button type="button" class="inv-manage" class:chip-on={recipe.wishlist} disabled={busy}
                  onclick={async () => { busy = true; await setWishlist(recipe, !recipe.wishlist); busy = false }}>
                  {recipe.wishlist ? '★ Dans la wish list — retirer' : '☆ Ajouter à la wish list'}
                </button>
              </div>
              <div class="manage-block">
                {#if photosOf(recipe.id).length}
                  <div class="photo-grid">
                    {#each photosOf(recipe.id) as photo (photo.id)}
                      <figure class="photo-thumb">
                        {#await photoUrl(photo) then url}
                          <img src={url} alt={photo.kind === 'page' ? 'Page du livre' : 'Photo du plat'} loading="lazy">
                        {/await}
                        <figcaption>{photo.kind === 'page' ? 'Page' : 'Plat'}</figcaption>
                        <button type="button" class="photo-del" aria-label="Supprimer la photo"
                          onclick={() => removePhoto(photo)}>×</button>
                      </figure>
                    {/each}
                  </div>
                {/if}
                <p class="manage-row">
                  <label class="file-btn">Ajouter la photo du plat
                    <input type="file" accept="image/*" hidden disabled={busy}
                      onchange={e => addPhoto(recipe, e, 'plat')}>
                  </label>
                  <label class="file-btn">Photo de la recette (page du livre)
                    <input type="file" accept="image/*" hidden disabled={busy}
                      onchange={e => addPhoto(recipe, e, 'page')}>
                  </label>
                </p>
              </div>
              <div class="manage-block">
                {#if editing}
                  <p class="manage-row">
                    <label>Pour
                      <input class="f-qty" type="number" inputmode="numeric" min="1" bind:value={servingsText}
                        aria-label="Nombre de personnes" placeholder="?">
                      personnes (sert au calcul des quantités de la semaine)</label>
                  </p>
                  <p class="manage-row">
                    <label>Pays d'origine
                      <input bind:value={countryText} placeholder="Inde, France, Brésil…" aria-label="Pays d'origine">
                    </label>
                    <label>Catégorie
                      <input bind:value={categoryText} list="recipe-categories" placeholder="Boissons… (vide = plat)"
                        aria-label="Catégorie">
                    </label>
                    <label>Source
                      <select bind:value={sourcePick} aria-label="Source">
                        {#each store.sources.toSorted((a, b) => a.title.localeCompare(b.title, 'fr')) as s (s.id)}
                          <option value={s.id}>{s.title}</option>
                        {/each}
                      </select>
                    </label>
                  </p>
                  <p>Ingrédients — un par ligne (ex. « 500 g asperges vertes » ;
                    « ! » en tête = difficile à sourcer, à commander à l'avance) :</p>
                  <textarea bind:value={ingText} rows="6"></textarea>
                  <p>Recette (étapes) :</p>
                  <textarea bind:value={stepsText} rows="8"></textarea>
                  <div class="manage-row">
                    <button type="button" class="inv-start" disabled={busy} onclick={() => saveEdit(recipe)}>Enregistrer</button>
                    <button type="button" class="inv-manage" onclick={() => editing = false}>Annuler</button>
                  </div>
                {:else}
                  {#if ingredientsOf(recipe.id).length}
                    <p>Ingrédients{recipe.servings ? ' (pour ' + recipe.servings + ' personnes)' : ''} :</p>
                    <ul>
                      {#each ingredientsOf(recipe.id) as ing (ing.id)}
                        <li class="row"><span class="name">{[ing.qty_raw || ing.qty, ing.unit, ing.name].filter(v => v !== null && v !== undefined && v !== '').join(' ')}{#if ing.note}<span class="note">, {ing.note}</span>{/if}{#if ing.optional}<span class="note"> (facultatif)</span>{/if}{#if ing.hard}<span class="hard-note"> — à commander à l'avance</span>{/if}</span></li>
                      {/each}
                    </ul>
                  {/if}
                  {#if recipe.steps}<p class="steps">{recipe.steps}</p>{/if}
                  <button type="button" class="inv-manage" onclick={() => startEdit(recipe)}>
                    {ingredientsOf(recipe.id).length || recipe.steps ? 'Modifier ingrédients et recette' : 'Ajouter ingrédients et recette'}
                  </button>
                {/if}
              </div>
              {#if realsOf(recipe).length}
                <div class="manage-block">
                  <p>Réalisations :</p>
                  <ul>
                    {#each realsOf(recipe) as real (real.id)}
                      <li class="row">
                        <span class="name">{real.made_on ? new Date(real.made_on + 'T00:00').toLocaleDateString('fr-FR') : 'date non notée'}</span>
                        <span class="note" title={real.comment}>{real.comment}</span>
                      </li>
                    {/each}
                  </ul>
                </div>
              {/if}
              <form class="manage-row" onsubmit={e => fait(recipe, e)}>
                <input type="date" bind:value={madeOn} aria-label="Date de réalisation">
                <input bind:value={comment} placeholder="Commentaire (facultatif)" aria-label="Commentaire">
                <label class="file-btn">{faitPhotoName ? 'Photo : ' + faitPhotoName : 'Photo du plat'}
                  <input type="file" accept="image/*" hidden bind:this={faitPhotoInput}
                    onchange={e => faitPhotoName = e.target.files?.[0]?.name ?? ''}
                    aria-label="Photo du plat (facultatif)">
                </label>
                <button class="inv-start" disabled={busy}>J'ai fait cette recette</button>
              </form>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>
