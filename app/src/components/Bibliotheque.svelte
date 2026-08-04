<script>
  /* Bibliothèque dédiée des livres et des sites (cas N16, commentaires 4,
   * 04/08/2026) : à 240 livres, les filtres de la recherche ne suffisent
   * plus. Navigation par couvertures, recherche et tri ; une fiche par
   * source mène à ses recettes, au scan d'une recette (livre) ou au site
   * et à l'import par URL (site). Absorbe l'ancien « Gérer les sources ». */
  import { store, renameSource, addSource, setSourceUrl, siteUrlOf, coverUrl,
    attachPendingPhoto, removePendingBook, lastMade, fold } from '../lib/store.svelte.js'
  import SousEcran from './SousEcran.svelte'

  /* La fiche ouverte (sourceOuverte) vit chez le parent : revenir d'une
   * recette ou d'un import retombe sur la fiche, pas sur la liste. */
  let { fermer, ouvrirRecette, importerPour, scannerLivre,
    sourceOuverte = null, ouvrirSource } = $props()

  let search = $state('')
  let tri = $state('titre') // titre | auteur | recettes
  let busy = $state(false)

  /* Renommage au crayon (fusion si le titre existe déjà, comme partout). */
  let renaming = $state(false)
  let newTitle = $state('')

  /* Adresse du site, éditable sur la fiche d'un site. */
  let urlEdit = $state(false)
  let urlText = $state('')
  let urlMsg = $state('')

  /* Ajout d'une source à la main (livre sans code-barres, site à garder). */
  let addOpen = $state(false)
  let addTitle = $state('')
  let addKind = $state('livre')
  let addUrl = $state('')

  function recipesOf(id) {
    return store.recipes.filter(r => r.source_id === id)
      .toSorted((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }))
  }

  function matches(s) {
    const q = fold(search)
    return !q || fold(s.title).includes(q) || fold(s.author ?? '').includes(q)
  }

  function sorted(list) {
    if (tri === 'auteur') return list.toSorted((a, b) =>
      (a.author || '￿').localeCompare(b.author || '￿', 'fr', { sensitivity: 'base' })
      || a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }))
    if (tri === 'recettes') return list.toSorted((a, b) =>
      recipesOf(b.id).length - recipesOf(a.id).length
      || a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }))
    return list.toSorted((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }))
  }

  const livres = $derived(sorted(store.sources.filter(s => s.kind === 'livre' && matches(s))))
  const sites = $derived(sorted(store.sources.filter(s => s.kind === 'site' && matches(s))))
  const autres = $derived(sorted(store.sources.filter(s => s.kind !== 'livre' && s.kind !== 'site' && matches(s))))

  const fiche = $derived(sourceOuverte ? store.sources.find(s => s.id === sourceOuverte) : null)

  function ouvrirFiche(s) {
    ouvrirSource(s.id)
    renaming = false
    urlEdit = false
    urlMsg = ''
  }

  async function renommer(source) {
    const t = newTitle.trim()
    if (!t) return
    busy = true
    await renameSource(source, t)
    busy = false
    renaming = false
    // Une fusion a supprimé la fiche ouverte : retour à la liste.
    if (!store.sources.some(s => s.id === sourceOuverte)) ouvrirSource(null)
  }

  async function saveUrl(source) {
    busy = true
    const ok = await setSourceUrl(source, urlText)
    busy = false
    urlMsg = ok ? '' : 'Adresse non enregistrée : la base doit être mise à jour (migration « bibliothèque » en attente).'
    if (ok) urlEdit = false
  }

  async function ajouter() {
    const t = addTitle.trim()
    if (!t) return
    busy = true
    await addSource(t, addKind)
    const created = store.sources.find(s => s.title === t)
    if (created && addKind === 'site' && addUrl.trim()) await setSourceUrl(created, addUrl)
    busy = false
    addOpen = false
    addTitle = ''
    addUrl = ''
    if (created) ouvrirFiche(created)
  }

  /** Domaine affichable d'un site (l'adresse peut être imparfaite : jamais planter). */
  function hostOf(s) {
    const u = siteUrlOf(s)
    if (!u) return ''
    try { return new URL(u).hostname.replace('www.', '') } catch { return u }
  }

  function madeLabel(recipe) {
    const last = lastMade(recipe.id)
    if (!last) return 'jamais cuisinée'
    if (last === 'inconnue') return 'cuisinée (date non notée)'
    return 'cuisinée le ' + new Date(last + 'T00:00').toLocaleDateString('fr-FR')
  }
</script>

{#if fiche}
  <SousEcran titre={fiche.title} fermer={() => ouvrirSource(null)}>
    <div class="manage-panel">
      <div class="manage-block">
        {#if renaming}
          <div class="manage-row">
            <input class="rename-input" bind:value={newTitle} aria-label={'Nouveau nom de ' + fiche.title}>
            <button type="button" class="inv-start" disabled={busy || !newTitle.trim()}
              onclick={() => renommer(fiche)}>OK</button>
            <button type="button" class="inv-manage" onclick={() => renaming = false}>Annuler</button>
          </div>
          <p class="note">Un nom déjà existant fusionne les deux sources.</p>
        {:else}
          <div class="row source-row">
            {#if fiche.cover_path}
              {#await coverUrl(fiche) then url}
                <img class="cover-thumb" src={url} alt="" loading="lazy">
              {/await}
            {/if}
            <div class="info">
              <span class="name">{fiche.title}</span>
              <span class="note">{[fiche.author, fiche.publisher, fiche.year,
                fiche.isbn ? 'ISBN ' + fiche.isbn : '', fiche.country, fiche.categories]
                .filter(Boolean).join(' · ')}</span>
            </div>
            <button type="button" class="icon-btn" aria-label={'Renommer ' + fiche.title} title="Renommer"
              onclick={() => { renaming = true; newTitle = fiche.title }}>✎</button>
          </div>
        {/if}
        <div class="manage-row">
          {#if fiche.kind === 'site'}
            {#if siteUrlOf(fiche)}
              <a class="inv-start visit-btn" href={siteUrlOf(fiche)} target="_blank" rel="noreferrer">
                Visiter le site</a>
            {/if}
            <button type="button" class="inv-start" onclick={() => importerPour(fiche)}>
              Coller l'URL d'une recette</button>
            <button type="button" class="inv-manage" aria-expanded={urlEdit}
              onclick={() => { urlEdit = !urlEdit; urlText = fiche.url ?? ''; urlMsg = '' }}>
              {fiche.url ? 'Modifier l\'adresse' : 'Renseigner l\'adresse du site'}</button>
          {:else}
            <button type="button" class="inv-start" onclick={() => importerPour(fiche)}>
              Scanner une recette (photos, texte)</button>
          {/if}
        </div>
        {#if urlEdit}
          <div class="manage-row">
            <input type="url" bind:value={urlText} placeholder="https://…"
              aria-label={'Adresse du site ' + fiche.title}>
            <button type="button" class="inv-start" disabled={busy} onclick={() => saveUrl(fiche)}>Enregistrer</button>
          </div>
        {/if}
        {#if urlMsg}<p class="message">{urlMsg}</p>{/if}
      </div>
      <div class="manage-block">
        <p class="group-title">Ses recettes <span class="n">· {recipesOf(fiche.id).length}</span></p>
        {#if recipesOf(fiche.id).length === 0}
          <p class="note">{fiche.kind === 'site'
            ? 'Aucune recette de ce site pour l\'instant — visiter le site, copier l\'URL d\'une recette, revenir la coller.'
            : 'Aucune recette de ce livre pour l\'instant — scanner une page pour commencer.'}</p>
        {:else}
          <ul>
            {#each recipesOf(fiche.id) as recipe (recipe.id)}
              <li class="loc-item">
                <button type="button" class="row rowbtn-full" onclick={() => ouvrirRecette(recipe)}>
                  <div class="info">
                    <span class="name" title={recipe.title}>{#if recipe.wishlist}<span class="wish-star">★</span> {/if}{recipe.title}</span>
                    <span class="note">{madeLabel(recipe)}</span>
                  </div>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </SousEcran>
{:else}
  <SousEcran titre="Bibliothèque — livres et sites" fermer={fermer}>
    <div class="manage-panel">
      <div class="manage-row">
        <button type="button" class="inv-start" onclick={scannerLivre}>Scanner un livre (code-barres)</button>
        <button type="button" class="inv-manage" aria-expanded={addOpen}
          onclick={() => addOpen = !addOpen}>{addOpen ? '▾' : '▸'} Ajouter à la main</button>
      </div>
      {#if addOpen}
        <div class="manage-row">
          <select bind:value={addKind} aria-label="Type de source">
            <option value="livre">Livre</option>
            <option value="site">Site</option>
          </select>
          <input bind:value={addTitle} placeholder={addKind === 'site' ? 'Nom du site (Marmiton…)' : 'Titre du livre'}
            aria-label="Titre de la source">
          {#if addKind === 'site'}
            <input type="url" bind:value={addUrl} placeholder="https://…" aria-label="Adresse du site">
          {/if}
          <button type="button" class="inv-start" disabled={busy || !addTitle.trim()}
            onclick={ajouter}>Ajouter</button>
        </div>
      {/if}
      <div class="manage-row">
        <input type="search" bind:value={search} placeholder="Chercher un livre, un auteur, un site…"
          aria-label="Chercher dans la bibliothèque">
        <select bind:value={tri} aria-label="Trier la bibliothèque">
          <option value="titre">Par titre</option>
          <option value="auteur">Par auteur</option>
          <option value="recettes">Par nombre de recettes</option>
        </select>
      </div>

      {#if livres.length}
        <p class="group-title">Livres <span class="n">· {livres.length}</span></p>
        <div class="biblio-grid">
          {#each livres as s (s.id)}
            <button type="button" class="biblio-card" onclick={() => ouvrirFiche(s)} title={s.title}>
              {#if s.cover_path}
                {#await coverUrl(s) then url}
                  <img class="biblio-cover" src={url} alt="" loading="lazy">
                {/await}
              {:else}
                <span class="biblio-cover biblio-cover-vide" aria-hidden="true">{s.title}</span>
              {/if}
              <span class="biblio-titre">{s.title}</span>
              <span class="note">{[s.author, recipesOf(s.id).length ? recipesOf(s.id).length + ' rec.' : '']
                .filter(Boolean).join(' · ') || ' '}</span>
            </button>
          {/each}
        </div>
      {/if}

      {#if sites.length}
        <p class="group-title">Sites <span class="n">· {sites.length}</span></p>
        <ul>
          {#each sites as s (s.id)}
            <li class="loc-item">
              <button type="button" class="row rowbtn-full" onclick={() => ouvrirFiche(s)}>
                <div class="info">
                  <span class="name" title={s.title}>{s.title}</span>
                  <span class="note">{[recipesOf(s.id).length + ' recette(s)', hostOf(s)]
                    .filter(Boolean).join(' · ')}</span>
                </div>
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      {#if autres.length}
        <p class="group-title">Autres sources <span class="n">· {autres.length}</span></p>
        <ul>
          {#each autres as s (s.id)}
            <li class="loc-item">
              <button type="button" class="row rowbtn-full" onclick={() => ouvrirFiche(s)}>
                <div class="info">
                  <span class="name" title={s.title}>{s.title}</span>
                  <span class="note">{recipesOf(s.id).length + ' recette(s)'}</span>
                </div>
              </button>
            </li>
          {/each}
        </ul>
      {/if}

      {#if !livres.length && !sites.length && !autres.length}
        <p class="note">Rien ne correspond à cette recherche.</p>
      {/if}

      {#if store.pendingBooks.length}
        <p class="group-title">Livres à compléter <span class="n">· {store.pendingBooks.length}</span></p>
        <p class="note">Mis de côté au scan — demander à Claude de « compléter la
          bibliothèque » ; photo de secours possible pour les introuvables.</p>
        <ul class="manage-items">
          {#each store.pendingBooks as book (book.id)}
            <li class="row">
              <div class="info">
                <span class="name">ISBN {book.isbn}</span>
                <span class="note">{book.photo_path ? 'photo jointe' : 'sans photo'}</span>
              </div>
              <label class="icon-btn" title="Photographier la couverture">📷
                <input type="file" accept="image/*" capture="environment" hidden
                  aria-label={'Photo de couverture pour ISBN ' + book.isbn}
                  onchange={async e => { const f = e.target.files[0]; if (f) await attachPendingPhoto(book, f); e.target.value = '' }}>
              </label>
              <button type="button" class="icon-btn" aria-label={'Retirer ISBN ' + book.isbn}
                title="Retirer de la liste" onclick={() => removePendingBook(book)}>×</button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </SousEcran>
{/if}
