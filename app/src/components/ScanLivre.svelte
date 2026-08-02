<script>
  /**
   * Scanner un livre (N15) : la caméra lit le code-barres ISBN, le web
   * fournit la fiche (titre, auteur, éditeur, année, couverture), Olivier
   * relit puis enregistre. Option multi-scan : les livres s'empilent en bas
   * de l'écran, relecture puis enregistrement groupé (décision 02/08/2026).
   */
  import { tick } from 'svelte'
  import SousEcran from './SousEcran.svelte'
  import { normalizeIsbn, lookupBook } from '../lib/livre-isbn.js'
  import { saveBookSource, findSourceByIsbn, fetchCoverBlob } from '../lib/store.svelte.js'

  let { fermer } = $props()

  let videoEl
  let controls = null
  let closed = false
  let cameraError = $state(false)
  let multi = $state(false)
  let isbnText = $state('')
  let message = $state('')
  let busy = $state(false)

  /* Fiche en relecture : après un scan en mode simple, un livre introuvable
   * (NP15 : à compléter à la main), ou le ✎ d'un livre de la pile. */
  let fiche = $state(null)
  let editIndex = $state(null)

  /* La pile du multi-scan, affichée en bas de l'écran. */
  let pile = $state([])

  const seen = new Set() // ISBN déjà traités (le code-barres reste devant la caméra)

  async function startCamera() {
    if (controls || !videoEl) return
    cameraError = false
    try {
      /* ZXing (~450 Ko) est chargé à l'ouverture de l'écran seulement,
       * pour ne pas alourdir le démarrage de l'application. */
      const [{ BrowserMultiFormatReader }, { BarcodeFormat, DecodeHintType }] = await Promise.all([
        import('@zxing/browser'), import('@zxing/library')
      ])
      const hints = new Map([[DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.EAN_13]]])
      const reader = new BrowserMultiFormatReader(hints)
      controls = await reader.decodeFromConstraints(
        { video: { facingMode: 'environment' } }, videoEl,
        result => {
          if (!result) return
          const isbn = normalizeIsbn(result.getText())
          if (isbn) onIsbn(isbn)
        })
      if (closed) stopCamera()
    } catch {
      cameraError = true
    }
  }

  function stopCamera() {
    controls?.stop()
    controls = null
  }

  $effect(() => {
    startCamera()
    return () => { closed = true; stopCamera() }
  })

  function ficheVierge(isbn) {
    return { isbn, title: '', author: '', publisher: '', year: '', country: '', categories: '', coverUrl: '', keepCover: true }
  }

  async function onIsbn(isbn) {
    if (fiche || busy || seen.has(isbn)) return
    seen.add(isbn)
    const existing = findSourceByIsbn(isbn)
    if (existing) {
      message = `Déjà dans la bibliothèque : « ${existing.title} ».`
      return
    }
    if (multi) {
      const idx = pile.length
      pile.push({ ...ficheVierge(isbn), status: 'recherche' })
      const book = await lookupBook(isbn)
      pile[idx] = { ...pile[idx], ...(book ?? {}), status: book ? 'ok' : 'introuvable' }
    } else {
      stopCamera()
      message = 'Recherche du livre…'
      const book = await lookupBook(isbn)
      message = book ? '' : 'Livre introuvable sur le web — remplir la fiche à la main.'
      fiche = { ...ficheVierge(isbn), ...(book ?? {}) }
    }
  }

  function manualSearch() {
    const isbn = normalizeIsbn(isbnText)
    if (!isbn) { message = 'ISBN illisible — vérifier les chiffres (10 ou 13, commence par 978/979).'; return }
    isbnText = ''
    seen.delete(isbn) // saisie volontaire : on retraite
    onIsbn(isbn)
  }

  function editPile(i) {
    stopCamera()
    editIndex = i
    fiche = { keepCover: true, ...pile[i] }
  }

  function removePile(i) {
    seen.delete(pile[i].isbn)
    pile.splice(i, 1)
  }

  async function resumeScan() {
    fiche = null
    editIndex = null
    await tick()
    startCamera()
  }

  async function saveFiche() {
    if (editIndex !== null) {
      pile[editIndex] = { ...fiche, status: fiche.title.trim() ? 'ok' : 'introuvable' }
      resumeScan()
      return
    }
    busy = true
    const cover = fiche.keepCover && fiche.coverUrl ? await fetchCoverBlob(fiche.coverUrl) : null
    const res = await saveBookSource(fiche, cover)
    busy = false
    if (!res) { message = 'L\'enregistrement a échoué — voir le bandeau en haut de l\'écran.'; return }
    message = res.completed
      ? `Fiche existante complétée : « ${res.source.title} ».`
      : `« ${res.source.title} » ajouté à la bibliothèque.`
    resumeScan()
  }

  const prets = $derived(pile.filter(i => i.title.trim() && i.status !== 'recherche'))

  async function savePile() {
    busy = true
    message = ''
    let added = 0, completed = 0
    for (const item of prets) {
      const cover = item.coverUrl ? await fetchCoverBlob(item.coverUrl) : null
      const res = await saveBookSource(item, cover)
      if (!res) { busy = false; message = 'L\'enregistrement a échoué — voir le bandeau en haut de l\'écran.'; return }
      res.completed ? completed++ : added++
    }
    pile = pile.filter(i => !i.title.trim() || i.status === 'recherche')
    busy = false
    message = `${added} livre(s) ajouté(s)` + (completed ? `, ${completed} fiche(s) complétée(s)` : '')
      + (pile.length ? ` — ${pile.length} restant(s) à compléter (✎).` : '.')
  }

  function sousTitre(item) {
    if (item.status === 'recherche') return 'Recherche sur le web…'
    return [item.author, item.year].filter(Boolean).join(' · ') || 'ISBN ' + item.isbn
  }
</script>

<SousEcran titre="Scanner un livre" {fermer}>
  <div class="manage-panel">
    {#if fiche}
      <div class="manage-block">
        <p><strong>{fiche.title || 'Livre introuvable'}</strong> — relire et corriger avant d'enregistrer :</p>
        {#if fiche.coverUrl}
          <div class="import-photo">
            <img src={fiche.coverUrl} alt="Couverture proposée par le web">
            <label><input type="checkbox" bind:checked={fiche.keepCover}> Joindre la couverture</label>
          </div>
        {/if}
        <p class="manage-row">
          <label>Titre <input bind:value={fiche.title} aria-label="Titre du livre"></label>
          <label>Auteur <input bind:value={fiche.author} aria-label="Auteur"></label>
        </p>
        <p class="manage-row">
          <label>Éditeur <input bind:value={fiche.publisher} aria-label="Éditeur"></label>
          <label>Année <input class="f-qty" bind:value={fiche.year} inputmode="numeric" aria-label="Année"></label>
        </p>
        <p class="manage-row">
          <label>Pays <input bind:value={fiche.country} placeholder="Inde, France, Brésil…" aria-label="Pays"></label>
          <label>Catégories <input bind:value={fiche.categories} placeholder="Pâtisserie, Asie…" aria-label="Catégories"></label>
        </p>
        <p class="note">ISBN {fiche.isbn}</p>
        {#if message}<p class="message">{message}</p>{/if}
        <div class="manage-row">
          <button type="button" class="inv-start" disabled={busy || !fiche.title.trim()} onclick={saveFiche}>
            {editIndex !== null ? 'OK' : 'Ajouter à la bibliothèque'}
          </button>
          <button type="button" class="inv-manage" disabled={busy} onclick={resumeScan}>Annuler</button>
        </div>
      </div>
    {:else}
      <!-- svelte-ignore a11y_media_has_caption -->
      <video bind:this={videoEl} class="scan-video" muted playsinline></video>
      {#if cameraError}
        <p class="note">Caméra indisponible — saisir l'ISBN ci-dessous.</p>
      {:else}
        <p class="note">Viser le code-barres au dos du livre.</p>
      {/if}
      <label class="manage-row scan-multi">
        <input type="checkbox" bind:checked={multi}>
        Multi-scan — une pile de livres à la chaîne
      </label>
      <form class="manage-row" onsubmit={e => { e.preventDefault(); manualSearch() }}>
        <input bind:value={isbnText} inputmode="numeric" placeholder="Ou saisir l'ISBN (978…)"
          aria-label="ISBN à la main">
        <button class="inv-manage" disabled={busy || !isbnText.trim()}>Rechercher</button>
      </form>
      {#if message}<p class="message">{message}</p>{/if}
      {#if pile.length}
        <p class="group-title">Livres en cours de scan <span class="n">· {pile.length}</span></p>
        <ul class="manage-items">
          {#each pile as item, i (item.isbn)}
            <li class="row">
              {#if item.coverUrl}<img class="cover-thumb" src={item.coverUrl} alt="">{/if}
              <div class="info">
                <span class="name">{item.title || 'Introuvable — à compléter (✎)'}</span>
                <span class="note">{sousTitre(item)}</span>
              </div>
              <button type="button" class="icon-btn" aria-label={'Corriger ' + (item.title || item.isbn)}
                title="Corriger la fiche" onclick={() => editPile(i)}>✎</button>
              <button type="button" class="icon-btn" aria-label={'Retirer ' + (item.title || item.isbn)}
                title="Retirer de la pile" onclick={() => removePile(i)}>×</button>
            </li>
          {/each}
        </ul>
        <div class="manage-row">
          <button type="button" class="inv-start" disabled={busy || !prets.length} onclick={savePile}>
            Enregistrer {prets.length} livre(s)
          </button>
        </div>
      {/if}
    {/if}
  </div>
</SousEcran>
