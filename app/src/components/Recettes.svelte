<script>
  import { store, lastMade, addRealisation, ingredientsOf, saveRecipeDetails,
    searchRecipes, renameSource, addSource, setRecipeSource,
    knownNames, photosOf, addRecipePhoto, photoUrl, deletePhoto, setWishlist, ingredientLine,
    fetchRecipeFromUrl, createImportedRecipe, findDuplicateRecipe, compressImage,
    attachImportedPhoto, saveRecipeNotes, fetchPagePhotoFor } from '../lib/store.svelte.js'
  import { ollamaReady, extractRecipeFromImages, proposalFromExtraction } from '../lib/ollama-recipe.js'
  import { proposalFromText } from '../lib/texte-recette.js'
  import SousEcran from './SousEcran.svelte'

  let search = $state('')
  let open = $state(null)
  let busy = $state(false)
  let sourceFilter = $state('Toutes')

  /* La fiche est un sous-écran dédié (commentaires Olivier 25/07/2026) :
   * ouverte, elle remplace liste, recherche et import ; la croix ferme. */
  const ficheRecipe = $derived(open ? store.recipes.find(r => r.id === open) : null)

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

  /* Gérer les sources : sous-écran, renommage au crayon sur le nom. */
  let manageSources = $state(false)
  let srcEdit = $state(null)
  let srcEditName = $state('')
  let newSource = $state('')

  /* Les filtres particuliers vivent dans un dépliant refermable (décision
   * Olivier 07/07/2026) ; seule la recherche plein texte reste toujours visible. */
  let filtersOpen = $state(false)
  const activeFilters = $derived(
    (sourceFilter !== 'Toutes' ? 1 : 0) + (categoryFilter !== 'Toutes' ? 1 : 0) +
    (ingFilter.trim() ? 1 : 0) + (wishFilter ? 1 : 0))

  async function renameOne(source) {
    const title = srcEditName.trim()
    if (!title) return
    await renameSource(source, title)
    srcEdit = null
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
    editing = false
    manageSources = false
    notesText = recipe.notes ?? ''
    photoMsg = ''
  }

  /* Zone commentaires commune à toutes les réalisations (Q3, 16/07/2026). */
  let notesText = $state('')

  async function saveNotes(recipe) {
    busy = true
    await saveRecipeNotes(recipe, notesText)
    busy = false
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

  /* « J'ai fait cette recette » : consignée au jour même — la date a disparu
   * du formulaire, les commentaires sont communs (décision Q3, 16/07/2026). */
  async function fait(recipe) {
    busy = true
    await addRealisation(recipe, new Date().toISOString().slice(0, 10), '')
    busy = false
  }

  /** Réalisation consignée aujourd'hui (la photo du plat s'y rattache). */
  function realOfToday(recipe) {
    const today = new Date().toISOString().slice(0, 10)
    return store.realisations.find(r => r.recipe_id === recipe.id && r.made_on === today)
  }

  async function addPhoto(recipe, e, kind) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    busy = true
    await addRecipePhoto(recipe, file, kind, kind === 'plat' ? realOfToday(recipe)?.id ?? null : null)
    busy = false
  }

  /* Photo du plat depuis la page de la recette (fiches déjà importées). */
  let photoMsg = $state('')

  async function pagePhoto(recipe) {
    busy = true
    photoMsg = 'Récupération de la photo…'
    const ok = await fetchPagePhotoFor(recipe)
    photoMsg = ok ? '' : 'La page n\'annonce pas de photo (ou n\'a pas pu être lue) — l\'ajouter à la main.'
    busy = false
  }

  async function removePhoto(photo) {
    if (!confirm('Supprimer cette photo ?')) return
    busy = true
    await deletePhoto(photo)
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
  let importKeepImage = $state(true) // photo du plat annoncée par la page : jointe par défaut (décision Olivier 14/07/2026)

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
    importKeepImage = true
    importProposal = {
      url,
      title: proposal.title,
      sourceTitle: proposal.sourceName,
      servings: proposal.servings ?? '',
      category: proposal.category,
      country: '',
      ingredientsText: proposal.ingredientLines.join('\n'),
      steps: proposal.steps,
      imageUrl: proposal.imageUrl
    }
  }

  async function saveImport() {
    busy = true
    const p = importProposal
    const res = await createImportedRecipe({ ...p, servings: Number(p.servings) > 0 ? Number(p.servings) : null })
    if (res.error) { importError = res.error; busy = false; return }
    if (res.duplicate) { importProposal = null; importDuplicate = res.duplicate; busy = false; return }
    for (const f of importFiles) await addRecipePhoto(res.recipe, f, 'page') // copie privée de la page
    // Photo du plat trouvée sur la page : rattachée si la case est restée cochée ;
    // un échec n'annule pas la recette, déjà enregistrée (décision Olivier 14/07/2026).
    const photoManquee = Boolean(p.imageUrl) && importKeepImage
      && !(await attachImportedPhoto(res.recipe, p.imageUrl))
    busy = false
    importProposal = null
    importFiles = []
    importUrl = ''
    importError = ''
    importOpen = false
    // La fiche s'ouvre en sous-écran ; un raté de photo s'y signale.
    open = res.recipe.id
    editing = false
    notesText = res.recipe.notes ?? ''
    photoMsg = photoManquee
      ? 'La recette est enregistrée, mais sa photo n\'a pas pu être récupérée — l\'ajouter à la main ci-dessous.'
      : ''
  }

  function cancelImport() {
    importProposal = null
    importFiles = []
    importError = ''
    importDuplicate = null
    importTextOpen = false
    importText = ''
  }

  /* A4 : texte collé (OCR « Texte en direct » sur iPhone/iPad, ou copié)
   * + photos de la page jointes sans IA. */
  let importTextOpen = $state(false)
  let importText = $state('')

  function keepPhotos(e) {
    importFiles = [...(e.target.files ?? [])]
  }

  function prepareFromText() {
    const proposal = proposalFromText(importText)
    if (!proposal.title) { importError = 'Le texte est vide.'; return }
    importError = ''
    importProposal = { url: '', sourceTitle: '', category: '', country: '', sourceKind: 'livre', ...proposal }
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La base de données doit être mise à jour (migration en
      attente) : certaines fonctions sont indisponibles.</p>
  {/if}

  {#if ficheRecipe}
    {@const recipe = ficheRecipe}
    <!-- Fiche recette : un écran dédié, une croix pour fermer — jamais mélangée
         à la liste (commentaires Olivier 25/07/2026). -->
    <SousEcran titre={recipe.title} fermer={() => { open = null; editing = false }}>
      <div class="manage-panel">
        {#if editing}
          <div class="manage-block">
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
          </div>
        {:else}
          <div class="manage-block">
            <!-- ★ à droite de la source (économie d'une ligne — commentaire Olivier 16/07/2026) -->
            <div class="row source-row">
              <span class="name">{sourceOf(recipe) ? 'Source : ' + sourceOf(recipe).title : 'Sans source'}{recipe.country ? ' · Pays : ' + recipe.country : ''}{recipe.category ? ' · ' + recipe.category : ''}</span>
              <button type="button" class="icon-btn wish-btn" class:wish-on={recipe.wishlist} disabled={busy}
                aria-label={recipe.wishlist ? 'Retirer de la wish list' : 'Ajouter à la wish list'}
                title={recipe.wishlist ? 'Dans la wish list — appuyer pour retirer' : 'Ajouter à la wish list'}
                onclick={async () => { busy = true; await setWishlist(recipe, !recipe.wishlist); busy = false }}>
                {recipe.wishlist ? '★' : '☆'}
              </button>
            </div>
            <p class="note">{madeLabel(recipe)}</p>
            {#if recipe.url}<p><a href={recipe.url} target="_blank" rel="noreferrer">Voir en ligne ({new URL(recipe.url).hostname.replace('www.', '')})</a></p>{/if}
            {#if recipe.video}<p class="note">Vidéo locale : {recipe.video}</p>{/if}
          </div>
          {#if photosOf(recipe.id).length}
            <div class="manage-block">
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
            </div>
          {/if}
          <div class="manage-block">
            {#if ingredientsOf(recipe.id).length}
              <p>Ingrédients{recipe.servings ? ' (pour ' + recipe.servings + ' personnes)' : ''} :</p>
              <ul>
                {#each ingredientsOf(recipe.id) as ing (ing.id)}
                  <li class="row"><span class="name">{[ing.qty_raw || ing.qty, ing.unit, ing.name].filter(v => v !== null && v !== undefined && v !== '').join(' ')}{#if ing.note}<span class="note">, {ing.note}</span>{/if}{#if ing.optional}<span class="note"> (facultatif)</span>{/if}{#if ing.hard}<span class="hard-note"> — à commander à l'avance</span>{/if}</span></li>
                {/each}
              </ul>
            {/if}
            {#if recipe.steps}<p class="steps">{recipe.steps}</p>{/if}
          </div>
          <!-- Commentaires : une seule zone, pleine largeur, commune à toutes
               les réalisations (décision Q3 d'Olivier, 16/07/2026). -->
          <div class="manage-block">
            <p>Commentaires :</p>
            <textarea class="notes-area" rows="3" bind:value={notesText}
              placeholder="Mes notes sur cette recette (doses, tours de main, avis des convives…)"
              aria-label="Commentaires de la recette"></textarea>
            {#if notesText.trim() !== (recipe.notes ?? '').trim()}
              <div class="manage-row">
                <button type="button" class="inv-start" disabled={busy} onclick={() => saveNotes(recipe)}>Enregistrer le commentaire</button>
              </div>
            {/if}
          </div>
          {#if realsOf(recipe).length}
            <div class="manage-block">
              <p>Réalisations : {realsOf(recipe).map(real => real.made_on
                ? new Date(real.made_on + 'T00:00').toLocaleDateString('fr-FR')
                : 'date non notée').join(' · ')}</p>
            </div>
          {/if}
          {#if photoMsg}<p class="message">{photoMsg}</p>{/if}
          <!-- Tous les boutons en bas (commentaire Olivier 16/07/2026) ; un seul
               bouton photo du plat (Q4), rattaché à la réalisation du jour. -->
          <div class="manage-row">
            <button type="button" class="inv-start" disabled={busy} onclick={() => fait(recipe)}>J'ai fait cette recette</button>
            <label class="file-btn">Ajouter la photo du plat
              <input type="file" accept="image/*" hidden disabled={busy}
                onchange={e => addPhoto(recipe, e, 'plat')}>
            </label>
            <label class="file-btn">Photo de la recette (page du livre)
              <input type="file" accept="image/*" hidden disabled={busy}
                onchange={e => addPhoto(recipe, e, 'page')}>
            </label>
            {#if recipe.url && !photosOf(recipe.id).some(p => p.kind === 'plat')}
              <button type="button" class="inv-manage" disabled={busy} onclick={() => pagePhoto(recipe)}>
                Récupérer la photo de la page
              </button>
            {/if}
            <button type="button" class="inv-manage" onclick={() => startEdit(recipe)}>Modifier</button>
          </div>
        {/if}
      </div>
    </SousEcran>
  {:else if manageSources}
    <SousEcran titre="Gérer les sources" fermer={() => { manageSources = false; srcEdit = null }}>
      <div class="manage-panel">
        <p>Renommer une source (crayon) — un nom déjà existant <strong>fusionne</strong> les deux :</p>
        <ul class="manage-items">
          {#each store.sources.toSorted((a, b) => a.title.localeCompare(b.title, 'fr')) as source (source.id)}
            <li class="row">
              {#if srcEdit === source.id}
                <input class="rename-input" bind:value={srcEditName} aria-label={'Nouveau nom de ' + source.title}>
                <button type="button" class="inv-start" disabled={busy || !srcEditName.trim()}
                  onclick={() => renameOne(source)}>OK</button>
                <button type="button" class="inv-manage" onclick={() => srcEdit = null}>Annuler</button>
              {:else}
                <div class="info">
                  <span class="name" title={source.title}>{source.title}</span>
                  <span class="note">{store.recipes.filter(r => r.source_id === source.id).length} recette(s)</span>
                </div>
                <button type="button" class="icon-btn" aria-label={'Renommer ' + source.title} title="Renommer"
                  onclick={() => { srcEdit = source.id; srcEditName = source.title }}>✎</button>
              {/if}
            </li>
          {/each}
        </ul>
        <div class="manage-row se-add">
          <input bind:value={newSource} placeholder="Nouvelle source (livre, site…)" aria-label="Nouvelle source">
          <button type="button" class="inv-start" disabled={busy || !newSource.trim()}
            onclick={async () => { await addSource(newSource); newSource = '' }}>Ajouter</button>
        </div>
      </div>
    </SousEcran>
  {:else if importOpen}
    <SousEcran titre="Importer une recette" fermer={toggleImport}>
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
          <p class="manage-row">
            <button type="button" class="inv-manage" aria-expanded={importTextOpen}
              onclick={() => importTextOpen = !importTextOpen}>
              {importTextOpen ? '▾' : '▸'} Coller le texte de la recette
            </button>
          </p>
          {#if importTextOpen}
            <p class="note">Sur iPhone/iPad : photographier la page, sélectionner le texte sur la
              photo (« Texte en direct »), le copier et le coller ici — tout reste sur l'appareil.</p>
            <textarea bind:value={importText} rows="8" aria-label="Texte de la recette"
              placeholder="Titre&#10;Pour 4 personnes&#10;200 g de farine&#10;…"></textarea>
            <p class="manage-row">
              <label class="file-btn">{importFiles.length ? importFiles.length + ' photo(s) à joindre' : 'Joindre les photos de la page (facultatif)'}
                <input type="file" accept="image/*" multiple hidden disabled={busy} onchange={keepPhotos}>
              </label>
              <button type="button" class="inv-start" disabled={busy || !importText.trim()}
                onclick={prepareFromText}>Préparer la fiche</button>
            </p>
          {/if}
          {#if importDuplicate}
            <p class="message">Cette recette est déjà là : « {importDuplicate.title} ».
              <button type="button" class="inv-manage"
                onclick={() => { const r = importDuplicate; importOpen = false; cancelImport(); toggleOpen(r) }}>Voir la fiche</button>
            </p>
          {/if}
          {#if importError}<p class="message">{importError}</p>{/if}
        {:else}
          <p><strong>{importProposal.title}</strong> — relire et corriger avant d'enregistrer :</p>
          {#if importProposal.imageUrl}
            <div class="import-photo">
              <img src={importProposal.imageUrl} alt="Photo du plat proposée par la page">
              <label><input type="checkbox" bind:checked={importKeepImage}> Joindre la photo du plat</label>
            </div>
          {/if}
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
    </SousEcran>
  {:else}
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
    <button type="button" class="inv-manage" onclick={toggleImport}>
      Importer une recette (URL, photos, texte)
    </button>
  </div>

  {#if store.recipes.length === 0}
    <div class="empty">
      <p>Aucune recette pour l'instant. Importez-en une (URL, photos, texte)
        ou créez la vôtre.</p>
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
        </li>
      {/each}
    </ul>
  {/if}
  {/if}

  <!-- Disponibles dans la liste, la fiche (édition) et l'import. -->
  <datalist id="known-ingredients-rec">
    {#each knownNames().toSorted((a, b) => a.localeCompare(b, 'fr')) as n (n)}<option value={n}></option>{/each}
  </datalist>
  <datalist id="recipe-categories">
    {#each categories.length ? categories : ['Boissons'] as c (c)}<option value={c}></option>{/each}
  </datalist>
</section>
