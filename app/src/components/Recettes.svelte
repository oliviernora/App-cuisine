<script>
  import { store, lastMade, addRealisation, importPassard } from '../lib/store.svelte.js'

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

  function toggleOpen(recipe) {
    open = open === recipe.id ? null : recipe.id
    madeOn = new Date().toISOString().slice(0, 10)
    comment = ''
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
