<script>
  /* Lieux d'achat (N3 point 4, décision Olivier 27/07/2026) : gérer les
   * lieux — physique (adresse) ou Internet (URL), commentaire — renommage
   * au crayon sur le nom, suppression en deux touches, et « ingrédients
   * achetables » par lieu. */
  import { store, addLieu, updateLieu, renameLieu, removeLieu,
    lieuxNonRepris, reprendreLieux, lieuIngredients } from '../lib/store.svelte.js'

  let open = $state(null) // id du lieu dont la fiche est dépliée
  let renaming = $state(false)
  let newName = $state('')
  let confirmDelete = $state(null)
  let showBuyable = $state(false)
  let addName = $state('')
  let addKind = $state('physique')
  let busy = $state(false)

  const lieux = $derived([...store.lieux]
    .toSorted((a, b) => a.name.localeCompare(b.name, 'fr')))
  const aReprendre = $derived(lieuxNonRepris())

  function toggleOpen(lieu) {
    open = open === lieu.id ? null : lieu.id
    renaming = false
    confirmDelete = null
    showBuyable = false
  }

  async function saveName(lieu) {
    busy = true
    await renameLieu(lieu, newName)
    busy = false
    renaming = false
  }

  async function ajouter(e) {
    e.preventDefault()
    busy = true
    await addLieu(addName, addKind)
    busy = false
    addName = ''
  }
</script>

<div class="manage-panel">
  {#if aReprendre.length}
    <div class="manage-block">
      <p>{aReprendre.length} lieu(x) déjà utilisé(s) dans vos courses et votre
        sourcing ne sont pas encore gérés ici : {aReprendre.join(', ')}.</p>
      <div class="manage-row">
        <button type="button" class="inv-start" disabled={busy}
          onclick={async () => { busy = true; await reprendreLieux(); busy = false }}>
          Reprendre ces lieux</button>
      </div>
    </div>
  {/if}

  {#if lieux.length === 0 && aReprendre.length === 0}
    <p class="empty">Aucun lieu d'achat pour l'instant — ajoutez-en un ci-dessous.</p>
  {/if}

  <ul class="manage-items">
    {#each lieux as lieu (lieu.id)}
      <li class="row">
        <button type="button" class="rowbtn-full info" aria-expanded={open === lieu.id}
          onclick={() => toggleOpen(lieu)}>
          <span class="name" title={lieu.name}>{open === lieu.id ? '▾' : '▸'} {lieu.name}</span>
        </button>
        <span class="note">{lieu.kind === 'internet' ? 'Internet'
          : (store.residences.find(r => r.id === lieu.residence_id)?.name ?? 'physique — à ranger')}</span>
      </li>
      {#if open === lieu.id}
        <li class="manage-panel">
          <div class="manage-block">
            {#if renaming}
              <div class="manage-row">
                <input class="rename-input" bind:value={newName} aria-label="Nouveau nom">
                <button type="button" class="inv-start" disabled={busy || !newName.trim()}
                  onclick={() => saveName(lieu)}>OK</button>
                <button type="button" class="inv-manage" onclick={() => renaming = false}>Annuler</button>
              </div>
              <p class="note">Le nouveau nom suit partout : lignes de courses,
                magasins mémorisés, sourcing.</p>
            {:else}
              <div class="row source-row">
                <span class="name">{lieu.name}</span>
                <button type="button" class="icon-btn" aria-label={'Renommer ' + lieu.name} title="Renommer"
                  onclick={() => { renaming = true; newName = lieu.name }}>✎</button>
              </div>
            {/if}
          </div>
          <div class="manage-block">
            <div class="manage-row">
              <label>Type
                <select value={lieu.kind} aria-label="Type de lieu"
                  onchange={e => updateLieu(lieu, e.target.value === 'internet'
                    ? { kind: 'internet', residence_id: null } // les sites valent partout (04/08/2026)
                    : { kind: e.target.value })}>
                  <option value="physique">Lieu physique</option>
                  <option value="internet">Internet</option>
                </select>
              </label>
              {#if lieu.kind === 'internet'}
                <label>URL
                  <input value={lieu.url} placeholder="https://…" aria-label="URL du site"
                    onchange={e => updateLieu(lieu, { url: e.target.value.trim() })}>
                </label>
              {:else}
                <label>Adresse
                  <input value={lieu.address} placeholder="Adresse (facultative)" aria-label="Adresse"
                    onchange={e => updateLieu(lieu, { address: e.target.value.trim() })}>
                </label>
                <label>Maison
                  <!-- Une boutique appartient à une résidence (décision Olivier
                       04/08/2026) ; « Toutes » = pas encore rangée. -->
                  <select value={lieu.residence_id ?? ''} aria-label={'Résidence de ' + lieu.name}
                    onchange={e => updateLieu(lieu, { residence_id: e.target.value || null })}>
                    <option value="">Toutes (à ranger)</option>
                    {#each store.residences as r (r.id)}<option value={r.id}>{r.name}</option>{/each}
                  </select>
                </label>
              {/if}
            </div>
            <div class="manage-row">
              <label>Commentaire
                <input value={lieu.comment} placeholder="Horaires, jour de marché, code promo…"
                  aria-label="Commentaire" onchange={e => updateLieu(lieu, { comment: e.target.value })}>
              </label>
            </div>
            {#if lieu.kind === 'internet' && lieu.url}
              <p class="note"><a href={lieu.url} target="_blank" rel="noreferrer">Ouvrir le site</a></p>
            {/if}
          </div>
          <div class="manage-block">
            <button type="button" class="inv-manage" aria-expanded={showBuyable}
              onclick={() => showBuyable = !showBuyable}>
              {showBuyable ? 'Refermer' : 'Ingrédients achetables ici'} ({lieuIngredients(lieu.name).length})
            </button>
            {#if showBuyable}
              {#if lieuIngredients(lieu.name).length}
                <ul class="manage-items">
                  {#each lieuIngredients(lieu.name) as n (n)}<li class="row"><span class="name">{n}</span></li>{/each}
                </ul>
              {:else}
                <p class="note">Aucun ingrédient ne pointe vers ce lieu pour l'instant
                  (le lieu d'achat se règle sur les lignes de courses, ou dans le
                  sourcing de la master list).</p>
              {/if}
            {/if}
          </div>
          <div class="manage-block">
            <div class="manage-row">
              {#if confirmDelete === lieu.id}
                <button type="button" class="inv-start danger-btn" disabled={busy}
                  onclick={async () => { busy = true; await removeLieu(lieu); busy = false }}>
                  Confirmer la suppression</button>
                <button type="button" class="inv-manage" onclick={() => confirmDelete = null}>Non, garder</button>
              {:else}
                <button type="button" class="inv-manage" onclick={() => confirmDelete = lieu.id}>
                  Supprimer le lieu</button>
              {/if}
            </div>
            <p class="note">Les lignes qui portaient ce lieu repartent dans « Autre ».</p>
          </div>
        </li>
      {/if}
    {/each}
  </ul>

  <form class="manage-row se-add" onsubmit={ajouter}>
    <input bind:value={addName} placeholder="Nouveau lieu (Marché de Revel, Épices du monde…)"
      aria-label="Nouveau lieu d'achat" required>
    <select bind:value={addKind} aria-label="Type du nouveau lieu">
      <option value="physique">Lieu physique</option>
      <option value="internet">Internet</option>
    </select>
    <button class="inv-start" disabled={busy}>Ajouter</button>
  </form>
</div>
