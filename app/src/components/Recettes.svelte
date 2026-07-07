<script>
  import { store, lastMade, addRealisation, importPassard, ingredientsOf, saveRecipeDetails, fillPassardDetails, passardFillableCount } from '../lib/store.svelte.js'
  import { PASSARD_FICHES } from '../lib/passard-fiches.js'

  const ficheUrls = new Set(PASSARD_FICHES.map(f => f.url))
  const fillable = $derived(passardFillableCount(ficheUrls))

  let search = $state('')
  let open = $state(null)
  let madeOn = $state(new Date().toISOString().slice(0, 10))
  let comment = $state('')
  let busy = $state(false)

  function fold(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  const list = $derived.by(() => {
    let recipes = store.recipes
    if (search) recipes = recipes.filter(r => fold(r.title).includes(fold(search)))
    return recipes.toSorted((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }))
  })

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
    editing = true
  }

  async function saveEdit(recipe) {
    busy = true
    await saveRecipeDetails(recipe, ingText, stepsText, Number(servingsText) > 0 ? Number(servingsText) : null)
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
  </div>

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
                {#if sourceOf(recipe)}<p>Source : {sourceOf(recipe).title}</p>{/if}
                {#if recipe.url}<p><a href={recipe.url} target="_blank" rel="noreferrer">Article Le Point</a></p>{/if}
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
