<script>
  /* LA fiche ingrédient (N14, décision Olivier 04/08/2026) : une seule
   * fiche, la même d'où que l'on vienne — stock, master list, courses.
   * Elle consolide les trois panneaux d'avant (✎ du Stock, fiche de la
   * master list, ✎ des Courses) : nom (fusion), genre, stock par
   * emplacement, réserve minimum PAR RÉSIDENCE, lieux d'achat MULTIPLES
   * (sites communs, boutiques par résidence), alias, recettes,
   * suppression. */
  import { store, renameIngredient, removeIngredient, setIngredientCategory, categoryOf,
    minOf, setResidenceMin, storesOf, addIngredientStore, removeIngredientStore,
    sourcingOf, aliasesOf, removeAlias, recipesUsing, sameIngredient, masterList,
    fold } from '../lib/store.svelte.js'
  import SousEcran from './SousEcran.svelte'

  let { name, fermer } = $props()

  let busy = $state(false)
  let renaming = $state(false)
  let newName = $state('')
  let confirmFusion = $state(false)
  let confirmDelete = $state(false)

  const genreNames = $derived([...new Set([...store.categories.map(c => c.name),
    ...store.refs.map(r => r.category).filter(Boolean)])]
    .toSorted((a, b) => a.localeCompare(b, 'fr')))

  /** Stock de la maison courante, emplacement par emplacement. */
  const rows = $derived(store.items.filter(i => sameIngredient(i.name, name))
    .toSorted((a, b) => a.loc.localeCompare(b.loc, 'fr')))
  const total = $derived(rows.reduce((n, i) => n + i.qty, 0))

  const lieux = $derived(storesOf(name))
  const heritage = $derived.by(() => {
    const s = sourcingOf(name)
    return [s.sourcing, s.note].filter(Boolean).join(', ')
  })

  /** Lieux encore proposables à l'ajout, étiquetés (site / résidence). */
  const lieuxDispo = $derived(store.lieux.filter(l => !lieux.some(x => x.id === l.id))
    .toSorted((a, b) => a.name.localeCompare(b.name, 'fr')))

  function lieuLabel(l) {
    if (l.kind === 'internet') return l.name + ' (site)'
    const res = store.residences.find(r => r.id === l.residence_id)
    return l.name + (res ? ' (' + res.name + ')' : '')
  }

  async function renommer() {
    const n = newName.trim()
    if (!n || fold(n) === fold(name)) return
    const fusion = masterList().some(i => fold(i.name) !== fold(name) && sameIngredient(i.name, n))
    if (fusion && !confirmFusion) { confirmFusion = true; return }
    busy = true
    await renameIngredient(name, n)
    busy = false
    fermer() // le nom a changé (ou fusionné) : la liste reprend la main
  }

  async function supprimer() {
    busy = true
    await removeIngredient(name)
    busy = false
    fermer()
  }

  async function ajouterLieu(e) {
    const id = e.target.value
    e.target.value = ''
    if (!id) return
    busy = true
    await addIngredientStore(name, id)
    busy = false
  }
</script>

<SousEcran titre={name} fermer={fermer}>
  <div class="manage-panel">
    <div class="manage-block">
      {#if renaming}
        <p>Renommer l'ingrédient — un nom déjà connu <strong>fusionne</strong> les deux :</p>
        <div class="manage-row">
          <input class="rename-input" bind:value={newName} oninput={() => confirmFusion = false}
            aria-label="Nouveau nom">
          <button type="button" class="inv-start" class:danger-btn={confirmFusion}
            disabled={busy || !newName.trim()} onclick={renommer}>
            {confirmFusion ? 'Confirmer la fusion' : 'OK'}</button>
          <button type="button" class="inv-manage" onclick={() => { renaming = false; newName = name }}>Annuler</button>
        </div>
      {:else}
        <div class="row source-row">
          <span class="name">{name}</span>
          <button type="button" class="icon-btn" aria-label={'Renommer ' + name} title="Renommer"
            onclick={() => { renaming = true; newName = name; confirmFusion = false }}>✎</button>
        </div>
      {/if}
      <div class="manage-row">
        <label>Genre
          <select value={categoryOf(name)} onchange={e => setIngredientCategory(name, e.target.value)}
            aria-label={'Genre de ' + name}>
            <option value="">Non classé</option>
            {#each genreNames as c (c)}<option value={c}>{c}</option>{/each}
          </select>
        </label>
      </div>
    </div>

    <div class="manage-block">
      <p>Stock — {store.residence?.name ?? 'cette maison'} :
        {#if rows.length === 0}<span class="note">aucun emplacement ici.</span>{/if}</p>
      {#if rows.length}
        <ul class="manage-items">
          {#each rows as item (item.id)}
            <li class="row">
              <span class="name">{item.loc || 'Sans emplacement'}</span>
              <output class="count" title="pots">{item.qty}</output>
            </li>
          {/each}
        </ul>
        <p class="note">Total : {total} — les quantités s'ajustent au Stock ou à l'inventaire.</p>
      {/if}
    </div>

    <div class="manage-block">
      <p>Réserve minimum — <strong>par maison</strong> (décision 04/08/2026) : racheté
        dès que la somme des emplacements de la maison passe en dessous
        (0 = jamais racheté tout seul) :</p>
      {#each store.residences as r (r.id)}
        <div class="manage-row">
          <span class="name" style="align-self: center">{r.name}</span>
          <input class="f-qty" type="number" inputmode="numeric" min="0"
            value={minOf(name, r.id)}
            onchange={e => setResidenceMin(name, r.id, e.target.value)}
            aria-label={'Réserve minimum à ' + r.name}>
        </div>
      {/each}
    </div>

    <div class="manage-block">
      <p>Où l'acheter — plusieurs lieux possibles ; les <strong>sites</strong> valent
        partout, chaque <strong>boutique</strong> appartient à une maison :</p>
      {#if lieux.length}
        <ul class="manage-items">
          {#each lieux as l (l.id)}
            <li class="row">
              <div class="info">
                <span class="name">{l.name}</span>
                <span class="note">{l.kind === 'internet'
                  ? 'site' + (l.url ? ' · ' + l.url : '')
                  : (store.residences.find(r => r.id === l.residence_id)?.name ?? 'boutique — toutes maisons')}</span>
              </div>
              <button type="button" class="icon-btn" aria-label={'Retirer ' + l.name}
                title="Retirer ce lieu" onclick={() => removeIngredientStore(name, l.id)}>×</button>
            </li>
          {/each}
        </ul>
      {:else if heritage}
        <p class="note">Aucun lieu propre — hérité du genre : {heritage}.</p>
      {/if}
      <div class="manage-row">
        <select onchange={ajouterLieu} aria-label={'Ajouter un lieu d\'achat pour ' + name} disabled={busy}>
          <option value="">Ajouter un lieu…</option>
          {#each lieuxDispo as l (l.id)}<option value={l.id}>{lieuLabel(l)}</option>{/each}
        </select>
        <span class="note" style="align-self: center">créer ou ranger un lieu : Courses → Lieux d'achat</span>
      </div>
    </div>

    {#if aliasesOf(name).length}
      <div class="manage-block">
        <p>Autres orthographes reconnues (dictées confirmées) :</p>
        <ul class="manage-items">
          {#each aliasesOf(name) as a (a)}
            <li class="row">
              <span class="name">{a}</span>
              <button type="button" class="icon-btn" aria-label={'Ne plus reconnaître ' + a}
                title="Ne plus reconnaître cette orthographe" onclick={() => removeAlias(name, a)}>×</button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}

    {#if recipesUsing(name).length}
      <div class="manage-block">
        <p>Utilisé dans {recipesUsing(name).length} recette(s) :</p>
        <ul class="manage-items">
          {#each recipesUsing(name) as r (r.id)}<li class="row"><span class="name">{r.title}</span></li>{/each}
        </ul>
      </div>
    {/if}

    {#if rows.length}
      <div class="manage-block">
        <p>Supprimer l'ingrédient — toutes ses lignes d'emplacement et sa ligne de courses :</p>
        <div class="manage-row">
          {#if confirmDelete}
            <button type="button" class="inv-start danger-btn" disabled={busy} onclick={supprimer}>Confirmer la suppression</button>
            <button type="button" class="inv-manage" onclick={() => confirmDelete = false}>Non, garder</button>
          {:else}
            <button type="button" class="inv-manage" onclick={() => confirmDelete = true}>Supprimer</button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</SousEcran>
