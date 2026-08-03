<script>
  import { store, addEvent, removeEvent, updateEvent, attachRecipe, detachRecipe, addRealisation, lastMade,
    weekNeeds, formatQty, eventIngredients, setEventRecipeScale, setEventQtyOverride, searchRecipes, knownNames,
    staleLots, fold } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
  import SousEcran from './SousEcran.svelte'
  import { addbarHeight } from '../lib/addbar.js'
  import { TRASH } from '../lib/icons.js'

  const TYPES = ['Dîner maison', 'Repas association', 'Invitation', 'Pique-nique']

  let day = $state(new Date().toISOString().slice(0, 10))
  let title = $state('')
  let guests = $state(4)
  let contraintes = $state('')
  let open = $state(null)
  let pick = $state('')
  let busy = $state(false)
  let confirmDelete = $state(null)

  /* Les événements à venir d'un côté (chrono croissant), les passés de
   * l'autre (du plus récent au plus ancien) — demande d'Olivier 07/07. */
  const futurs = $derived.by(() => {
    const t = new Date().toISOString().slice(0, 10)
    const sorted = store.events.filter(e => e.day >= t)
      .toSorted((a, b) => a.day.localeCompare(b.day) || a.created_at.localeCompare(b.created_at))
    return [...Map.groupBy(sorted, e => e.day)]
  })
  const passes = $derived.by(() => {
    const t = new Date().toISOString().slice(0, 10)
    const sorted = store.events.filter(e => e.day < t)
      .toSorted((a, b) => b.day.localeCompare(a.day) || a.created_at.localeCompare(b.created_at))
    return [...Map.groupBy(sorted, e => e.day)]
  })

  /* Rappel des lots anciens à utiliser (N7 → N10, décision Olivier 08/07). */
  let vieuxOpen = $state(false)
  const vieux = $derived(staleLots())
  function lotDate(d) {
    return new Date(d + 'T00:00').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  /* Modifier un événement et ajuster une recette : des sous-écrans dédiés
   * (commentaires Olivier 25/07/2026) — la croix ramène à la semaine. */
  let editEvent = $state(null)
  let editFields = $state({})
  const editingEvent = $derived(editEvent ? store.events.find(e => e.id === editEvent) : null)

  function startEditEvent(event) {
    editEvent = editEvent === event.id ? null : event.id
    editFields = { day: event.day, title: event.title, guests: event.guests, contraintes: event.contraintes }
  }
  async function saveEventEdit(event) {
    busy = true
    await updateEvent(event, { ...editFields, guests: Number(editFields.guests) || 1 })
    busy = false
    editEvent = null
  }

  let faitOpen = $state(null)
  let faitNon = $state([]) // « non, pas faite » répondu (le temps de la session)
  function consignee(event, recipe) {
    return store.realisations.some(r => r.recipe_id === recipe.id && r.made_on === event.day)
  }

  function dayLabel(d) {
    return new Date(d + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  function recipesOf(event) {
    return store.eventRecipes.filter(er => er.event_id === event.id)
      .map(er => store.recipes.find(r => r.id === er.recipe_id)).filter(Boolean)
  }

  let coursesOpen = $state(false)
  let openRecipe = $state(null) // 'eventId|recipeId' : sous-écran d'ajustement
  const adjusting = $derived.by(() => {
    if (!openRecipe) return null
    const [eid, rid] = openRecipe.split('|')
    const event = store.events.find(e => e.id === eid)
    const recipe = store.recipes.find(r => r.id === rid)
    const er = event && recipe ? erOf(event, recipe) : null
    return event && recipe && er ? { event, recipe, er } : null
  })
  const needs = $derived(weekNeeds())
  const toBuy = $derived(needs.filter(n => !n.match && !n.entry?.available && !(n.entry && n.entry.origin !== 'semaine')).length)

  /** « 1,5 kg + 2 gousses ail » ; sans quantité, « ail (×2) ». */
  function needLabel(need) {
    const parts = need.parts.map(p => formatQty(p.qty, p.unit)).join(' + ')
    const times = !need.parts.length && need.count > 1 ? ' (×' + need.count + ')' : ''
    return (parts ? parts + ' ' : '') + need.name + times
  }

  function erOf(event, recipe) {
    return store.eventRecipes.find(x => x.event_id === event.id && x.recipe_id === recipe.id)
  }

  /* Recherche multicritère (titre, ingrédient, pays, source, mot du texte)
   * + recherche avancée en déroulant : filtres source et pays. */
  let advOpen = $state(false)
  let advSource = $state('')
  let advPays = $state('')
  let advIng = $state('')
  const paysConnus = $derived([...new Set(store.recipes.map(r => r.country).filter(Boolean))]
    .toSorted((a, b) => a.localeCompare(b, 'fr')))


  const pickResults = $derived.by(() => {
    if (!pick.trim() && !advSource && !advPays && !advIng.trim()) return []
    let list = searchRecipes(pick)
    if (advSource) list = list.filter(r => r.source_id === advSource)
    if (advPays) list = list.filter(r => (r.country ?? '') === advPays)
    if (advIng.trim()) list = list.filter(r =>
      store.ingredients.some(i => i.recipe_id === r.id && fold(i.name).includes(fold(advIng))))
    return list.toSorted((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }))
      .slice(0, 8)
  })

  function madeNote(recipe) {
    const last = lastMade(recipe.id)
    if (!last) return ''
    if (last === 'inconnue') return 'déjà cuisinée'
    return 'cuisinée le ' + new Date(last + 'T00:00').toLocaleDateString('fr-FR')
  }

  function recent(recipe) {
    const last = lastMade(recipe.id)
    if (!last || last === 'inconnue') return false
    return (Date.now() - new Date(last + 'T00:00').getTime()) < 365 * 24 * 3600 * 1000
  }

  async function submit(e) {
    e.preventDefault()
    busy = true
    await addEvent({ day, title: title.trim() || 'Dîner maison', guests: Number(guests) || 1, contraintes: contraintes.trim() })
    title = ''; contraintes = ''
    busy = false
  }

  async function consigner(event, recipe) {
    busy = true
    await addRealisation(recipe, event.day, event.title + ' (' + event.guests + ' pers.)')
    busy = false
  }
</script>

<section>
  {#if store.schemaWarning}
    <p class="offline-banner">La base de données doit être mise à jour (migration en
      attente) : certaines fonctions sont indisponibles.</p>
  {/if}

  <!-- Déclaré en tête : le snippet sert dans le sous-écran ET doit rester
       visible de toute la chaîne conditionnelle. -->
  {#snippet editPanel(event)}
    <div class="manage-panel">
      <div class="manage-row">
        <input type="date" bind:value={editFields.day} aria-label="Jour" class="f-date">
        <span class="note" style="align-self: center">{dayLabel(editFields.day)}</span>
      </div>
      <div class="manage-row">
        <input bind:value={editFields.title} list="event-types" placeholder="Type d'événement" aria-label="Type">
      </div>
      <div class="manage-row">
        <input class="f-qty" type="number" inputmode="numeric" min="1" bind:value={editFields.guests}
          aria-label="Convives">
        <span class="note" style="align-self: center">convives</span>
        <input bind:value={editFields.contraintes} placeholder="Contraintes" aria-label="Contraintes">
      </div>
      <div class="manage-row">
        <button type="button" class="inv-start" disabled={busy} onclick={() => saveEventEdit(event)}>Enregistrer</button>
        <button type="button" class="inv-manage" onclick={() => editEvent = null}>Annuler</button>
      </div>
    </div>
  {/snippet}

  {#if editingEvent}
    <SousEcran titre="Modifier l'événement" fermer={() => editEvent = null}>
      {@render editPanel(editingEvent)}
    </SousEcran>
  {:else if adjusting}
    <SousEcran titre={adjusting.recipe.title} fermer={() => openRecipe = null}>
      <div class="manage-panel">
        <p class="note">Ingrédients pour « {adjusting.event.title} » ({adjusting.event.guests} pers.{adjusting.recipe.servings ? ', recette pour ' + adjusting.recipe.servings : ''}) —
          corriger une quantité ne vaut que pour cet événement (0 = retour au calcul) :</p>
        <div class="manage-row">
          <label class="note">Ajuster la recette :
            <input class="f-qty" type="number" inputmode="numeric" min="10" max="500" step="10"
              value={adjusting.er.scale_pct} onchange={e => setEventRecipeScale(adjusting.er, e.target.value)}
              aria-label="Pourcentage pour cette recette"> %
          </label>
        </div>
        <ul class="manage-items">
          {#each eventIngredients(adjusting.event, adjusting.er) as ing (ing.id)}
            <li class="row">
              {#if ing.qty != null}
                <input class="f-qty" type="number" min="0" step="any" value={ing.qty}
                  onchange={e => setEventQtyOverride(adjusting.er, ing.name, e.target.value)}
                  aria-label={'Quantité de ' + ing.name}>
                <span class="name">{ing.unit} {ing.name}</span>
                {#if ing.overridden}<span class="note">corrigé</span>{/if}
              {:else}
                <span class="name">{ing.name}</span>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    </SousEcran>
  {:else}
  {#if store.events.length === 0}
    <p class="empty">Aucun événement planifié. Ajoutez le premier ci-dessous :
      jour, type de repas, nombre de convives et contraintes.</p>
  {/if}

  {#if needs.length}
    <div class="loc-item">
      <button type="button" class="row rowbtn-full" onclick={() => coursesOpen = !coursesOpen}
        aria-expanded={coursesOpen}>
        <div class="info">
          <span class="name">{coursesOpen ? '▾' : '▸'} Courses de la semaine</span>
          <span class="note" class:recent-warn={toBuy > 0}>{toBuy > 0 ? toBuy + ' à acheter' : 'tout est couvert'} · {needs.length} ingrédients</span>
        </div>
      </button>
      {#if coursesOpen}
        <ul>
          {#each needs as need (need.key)}
            <li class="row">
              <span class="name">{needLabel(need)}</span>
              {#if need.match}
                <span class="note ok-note">en stock — {need.match.loc}</span>
              {:else if need.entry?.available}
                <span class="note ok-note">je l'ai</span>
              {:else if need.entry && need.entry.origin !== 'semaine'}
                <span class="note">déjà en liste</span>
              {:else}
                <span class="note recent-warn">à acheter</span>
              {/if}
            </li>
          {/each}
        </ul>
        <p class="note">La liste complète (réapprovisionnement + repas) est dans l'onglet Courses,
          mise à jour automatiquement.</p>
      {/if}
    </div>
  {/if}

  {#if vieux.length}
    <div class="loc-item">
      <button type="button" class="row rowbtn-full" onclick={() => vieuxOpen = !vieuxOpen}
        aria-expanded={vieuxOpen}>
        <div class="info">
          <span class="name">{vieuxOpen ? '▾' : '▸'} À utiliser</span>
          <span class="note recent-warn">{vieux.length} lot(s) ancien(s) au congélateur ou en réserve</span>
        </div>
      </button>
      {#if vieuxOpen}
        <ul>
          {#each vieux as v (v.lot.id)}
            <li class="row">
              <span class="name">{v.item.name}</span>
              <span class="note">{v.lot.qty} × entré le {lotDate(v.lot.entered_on)} · {v.loc}</span>
            </li>
          {/each}
        </ul>
        <p class="note">Le seuil se règle par emplacement, dans l'onglet Inventaire → Gérer.</p>
      {/if}
    </div>
  {/if}

  {#if futurs.length}<p class="group-title">À venir</p>{/if}
  {#each futurs as [d, group] (d)}
    <p class="group-title">{dayLabel(d)}</p>
    <ul>
      {#each group as event (event.id)}
        <li class="loc-item">
          <div class="row">
            <button type="button" class="rowbtn-full info" onclick={() => { open = open === event.id ? null : event.id; pick = '' }}>
              <span class="name">{event.title}</span>
              <span class="note">{event.guests} pers.{event.contraintes ? ' · ' + event.contraintes : ''}
                · {recipesOf(event).length} recette(s)</span>
            </button>
            <button type="button" class="inv-manage" onclick={() => startEditEvent(event)}>Modifier</button>
            {#if confirmDelete === event.id}
              <button type="button" class="inv-start danger-btn" onclick={() => removeEvent(event)}>Confirmer</button>
              <button type="button" class="inv-manage" onclick={() => confirmDelete = null}>Non</button>
            {:else}
              <button class="icon-btn danger" type="button" aria-label="Supprimer l'événement"
                onclick={() => confirmDelete = event.id}><Icon d={TRASH} /></button>
            {/if}
          </div>
          {#if open === event.id}
            <div class="manage-panel">
              {#if recipesOf(event).length}
                <ul>
                  {#each recipesOf(event) as recipe (recipe.id)}
                    {@const er = erOf(event, recipe)}
                    {@const rkey = event.id + '|' + recipe.id}
                    <li class="loc-item">
                      <div class="row">
                        <button type="button" class="rowbtn-full info"
                          title="Voir et ajuster les ingrédients pour cet événement"
                          onclick={() => openRecipe = openRecipe === rkey ? null : rkey}>
                          <span class="name" title={recipe.title}>{recipe.title}</span>
                          <span class="note" class:recent-warn={recent(recipe)}>
                            {er?.scale_pct !== 100 ? er.scale_pct + ' % · ' : ''}{madeNote(recipe) || 'jamais cuisinée'}</span>
                        </button>
                        <button class="icon-btn danger" type="button" aria-label="Retirer la recette"
                          onclick={() => detachRecipe(event, recipe)}><Icon d={TRASH} /></button>
                      </div>
                    </li>
                  {/each}
                </ul>
              {:else}
                <p>Pas encore de recette pour cet événement.</p>
              {/if}
              <div class="manage-row">
                <input bind:value={pick} placeholder="Chercher une recette à ajouter…" aria-label="Chercher une recette">
                <button type="button" class="inv-manage" onclick={() => advOpen = !advOpen}>
                  Recherche avancée {advOpen ? '▴' : '▾'}</button>
              </div>
              {#if advOpen}
                <div class="manage-row">
                  <select bind:value={advSource} aria-label="Filtrer par source">
                    <option value="">Toutes les sources</option>
                    {#each store.sources.toSorted((a, b) => a.title.localeCompare(b.title, 'fr')) as s (s.id)}
                      <option value={s.id}>{s.title}</option>
                    {/each}
                  </select>
                  <select bind:value={advPays} aria-label="Filtrer par pays">
                    <option value="">Tous les pays</option>
                    {#each paysConnus as p (p)}<option value={p}>{p}</option>{/each}
                  </select>
                  <input bind:value={advIng} list="known-ingredients-sem" placeholder="Par ingrédient…"
                    aria-label="Filtrer par ingrédient">
                </div>
              {/if}
              {#if pickResults.length}
                <ul class="manage-items">
                  {#each pickResults as recipe (recipe.id)}
                    <li class="row">
                      <button type="button" class="rowbtn-full info" onclick={() => { attachRecipe(event, recipe); pick = '' }}>
                        <span class="name" title={recipe.title}>{recipe.title}</span>
                        {#if madeNote(recipe)}<span class="note" class:recent-warn={recent(recipe)}>{madeNote(recipe)}</span>{/if}
                      </button>
                    </li>
                  {/each}
                </ul>
              {/if}
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/each}

  {#if passes.length}<p class="group-title">Passés</p>{/if}
  {#each passes as [d, group] (d)}
    <p class="group-title">{dayLabel(d)}</p>
    <ul>
      {#each group as event (event.id)}
        <li class="loc-item">
          <div class="row">
            <div class="info">
              <span class="name">{event.title}</span>
              <span class="note">{event.guests} pers.{event.contraintes ? ' · ' + event.contraintes : ''}
                · {recipesOf(event).length} recette(s)</span>
            </div>
            <button type="button" class="inv-manage" onclick={() => startEditEvent(event)}>Modifier</button>
            <button type="button" class="inv-start" onclick={() => { faitOpen = faitOpen === event.id ? null : event.id }}>Fait</button>
            {#if confirmDelete === event.id}
              <button type="button" class="inv-start danger-btn" onclick={() => removeEvent(event)}>Confirmer</button>
              <button type="button" class="inv-manage" onclick={() => confirmDelete = null}>Non</button>
            {:else}
              <button class="icon-btn danger" type="button" aria-label="Supprimer l'événement"
                onclick={() => confirmDelete = event.id}><Icon d={TRASH} /></button>
            {/if}
          </div>
          {#if faitOpen === event.id}
            <div class="manage-block">
              {#if recipesOf(event).length === 0}
                <p>Aucune recette n'était associée à cet événement.</p>
              {/if}
              <ul class="manage-items">
                {#each recipesOf(event) as recipe (recipe.id)}
                  {@const rkey = event.id + '|' + recipe.id}
                  <li class="row">
                    <span class="name" title={recipe.title}>{recipe.title}</span>
                    {#if consignee(event, recipe)}
                      <span class="note ok-note">consignée le {new Date(event.day + 'T00:00').toLocaleDateString('fr-FR')}</span>
                    {:else if faitNon.includes(rkey)}
                      <span class="note">non faite</span>
                    {:else}
                      <span class="note">faite ?</span>
                      <button type="button" class="inv-start" disabled={busy}
                        onclick={() => consigner(event, recipe)}>Oui, faite</button>
                      <button type="button" class="inv-manage"
                        onclick={() => faitNon = [...faitNon, rkey]}>Non</button>
                    {/if}
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/each}
  {/if}
</section>

{#if !editingEvent && !adjusting}
<div class="addbar" use:addbarHeight>
  <form onsubmit={submit} autocomplete="off">
    <input type="date" bind:value={day} aria-label="Jour" class="f-date">
    <span class="note" style="align-self: center">{dayLabel(day)}</span>
    <input class="f-name" bind:value={title} list="event-types" placeholder="Type d'événement">
    <input class="f-qty" type="number" inputmode="numeric" min="1" bind:value={guests} aria-label="Convives" title="Nombre de convives">
    <input class="f-loc" bind:value={contraintes} placeholder="Contraintes (halal, végétarien…)">
    <button class="submit" disabled={busy}>Ajouter</button>
  </form>
</div>
{/if}

<datalist id="event-types">
  {#each TYPES as t (t)}<option value={t}></option>{/each}
</datalist>
<datalist id="known-ingredients-sem">
  {#each knownNames().toSorted((a, b) => a.localeCompare(b, 'fr')) as n (n)}<option value={n}></option>{/each}
</datalist>
