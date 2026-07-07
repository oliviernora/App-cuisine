<script>
  import { store, lastMade, addRealisation, importPassard, ingredientsOf, saveRecipeDetails,
    fillPassardDetails, passardFillableCount, searchRecipes, renameSource, addSource, setRecipeSource,
    knownNames } from '../lib/store.svelte.js'
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

  /** Recherche multicritère (titre, ingrédient, pays, source, mot du texte)
   * + menu déroulant des sources + filtre par ingrédient (liste réduite en tapant). */
  const list = $derived.by(() => {
    let recipes = searchRecipes(search)
    if (sourceFilter !== 'Toutes') recipes = recipes.filter(r => r.source_id === sourceFilter)
    if (ingFilter.trim()) recipes = recipes.filter(r =>
      store.ingredients.some(i => i.recipe_id === r.id && fold(i.name).includes(fold(ingFilter))))
    return recipes.toSorted((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }))
  })

  let manageSources = $state(false)
  let sourceNames = $state({})
  let newSource = $state('')

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
  let sourcePick = $state('')

  function toggleOpen(recipe) {
    open = open === recipe.id ? null : recipe.id
    madeOn = new Date().toISOString().slice(0, 10)
    comment = ''
    editing = false
  }

  function startEdit(recipe) {
    ingText = ingredientsOf(recipe.id)
      .map(i => [i.qty, i.unit, i.name].filter(v => v !== null && v !== '').join(' ')).join('\n')
    stepsText = recipe.steps ?? ''
    servingsText = recipe.servings ?? ''
    countryText = recipe.country ?? ''
    sourcePick = recipe.source_id ?? ''
    editing = true
  }

  async function saveEdit(recipe) {
    busy = true
    await saveRecipeDetails(recipe, ingText, stepsText,
      Number(servingsText) > 0 ? Number(servingsText) : null, countryText)
    if (sourcePick && sourcePick !== recipe.source_id) await setRecipeSource(recipe, sourcePick)
    busy = false
    editing = false
  }

  async function fait(recipe, e) {
    e.preventDefault()
    busy = true
    await addRealisation(recipe, madeOn, comment)
    comment = ''
    busy = false
  }

  async function amorcer() {
    busy = true
    await importPassard()
    busy = false
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La base de données doit être mise à jour (migration en
      attente) : certaines fonctions sont indisponibles.</p>
  {/if}

  <div class="filters">
    <input id="search" type="search" bind:value={search} placeholder="Rechercher une recette…" aria-label="Rechercher">
    <div class="chips">
      <select bind:value={sourceFilter} aria-label="Filtrer par source">
        <option value="Toutes">Toutes les sources</option>
        {#each sourceChips as source (source.id)}
          <option value={source.id}>{source.title}</option>
        {/each}
      </select>
      <input bind:value={ingFilter} list="known-ingredients-rec" placeholder="Par ingrédient…"
        aria-label="Filtrer par ingrédient">
      <button type="button" class="inv-manage" onclick={() => manageSources = !manageSources}>Gérer les sources</button>
    </div>
  </div>
  <datalist id="known-ingredients-rec">
    {#each knownNames().toSorted((a, b) => a.localeCompare(b, 'fr')) as n (n)}<option value={n}></option>{/each}
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
              <span class="name" title={recipe.title}>{recipe.title}</span>
              <span class="note" class:recent-warn={recent(recipe)}>{madeLabel(recipe)}</span>
            </div>
          </button>
          {#if open === recipe.id}
            <div class="manage-panel">
              <div class="manage-block">
                {#if sourceOf(recipe)}<p>Source : {sourceOf(recipe).title}{recipe.country ? ' · Pays : ' + recipe.country : ''}</p>{/if}
                {#if recipe.url}<p><a href={recipe.url} target="_blank" rel="noreferrer">Voir en ligne ({new URL(recipe.url).hostname.replace('www.', '')})</a></p>{/if}
                {#if recipe.video}<p class="note">Vidéo locale : {recipe.video}</p>{/if}
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
                    <label>Source
                      <select bind:value={sourcePick} aria-label="Source">
                        {#each store.sources.toSorted((a, b) => a.title.localeCompare(b.title, 'fr')) as s (s.id)}
                          <option value={s.id}>{s.title}</option>
                        {/each}
                      </select>
                    </label>
                  </p>
                  <p>Ingrédients — un par ligne (ex. « 500 g asperges vertes ») :</p>
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
                        <li class="row"><span class="name">{[ing.qty, ing.unit, ing.name].filter(v => v !== null && v !== '').join(' ')}</span></li>
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
                <button class="inv-start" disabled={busy}>J'ai fait cette recette</button>
              </form>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>
