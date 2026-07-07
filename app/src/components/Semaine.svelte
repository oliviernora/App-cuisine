<script>
  import { store, addEvent, removeEvent, attachRecipe, detachRecipe, addRealisation, lastMade, weekNeeds, addWeekMissing } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
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

  function fold(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  const days = $derived.by(() => {
    const sorted = store.events.toSorted((a, b) => a.day.localeCompare(b.day) || a.created_at.localeCompare(b.created_at))
    return [...Map.groupBy(sorted, e => e.day)]
  })

  function dayLabel(d) {
    return new Date(d + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  function recipesOf(event) {
    return store.eventRecipes.filter(er => er.event_id === event.id)
      .map(er => store.recipes.find(r => r.id === er.recipe_id)).filter(Boolean)
  }

  const needs = $derived(weekNeeds())
  const missing = $derived(needs.filter(n => !n.match && !n.inShopping))

  const pickResults = $derived.by(() => {
    if (!pick.trim()) return []
    return store.recipes.filter(r => fold(r.title).includes(fold(pick)))
      .toSorted((a, b) => a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' }))
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

  {#if store.events.length === 0}
    <p class="empty">Aucun événement planifié. Ajoutez le premier ci-dessous :
      jour, type de repas, nombre de convives et contraintes.</p>
  {/if}

  {#if needs.length}
    <p class="group-title">Courses de la semaine <span class="n">· {needs.length} ingrédients</span></p>
    <ul>
      {#each needs as need (need.key)}
        <li class="row">
          <span class="name">{[need.qty, need.unit, need.name].filter(v => v !== null && v !== '').join(' ')}{need.count > 1 ? ' (×' + need.count + ')' : ''}</span>
          {#if need.match}
            <span class="note ok-note">en stock — {need.match.loc}</span>
          {:else if need.inShopping}
            <span class="note">déjà en liste</span>
          {:else}
            <span class="note recent-warn">à acheter</span>
          {/if}
        </li>
      {/each}
    </ul>
    {#if missing.length}
      <div class="toolbar" style="justify-content: flex-start">
        <button type="button" disabled={busy}
          onclick={async () => { busy = true; await addWeekMissing(); busy = false }}>
          Ajouter les manquants aux courses ({missing.length})
        </button>
      </div>
    {/if}
  {/if}

  {#each days as [d, group] (d)}
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
                    <li class="row">
                      <div class="info">
                        <span class="name" title={recipe.title}>{recipe.title}</span>
                        {#if madeNote(recipe)}<span class="note" class:recent-warn={recent(recipe)}>{madeNote(recipe)}</span>{/if}
                      </div>
                      <button type="button" class="inv-manage" disabled={busy}
                        title="Enregistrer que cette recette a été faite, à la date de l'événement"
                        onclick={() => consigner(event, recipe)}>Marquer faite</button>
                      <button class="icon-btn danger" type="button" aria-label="Retirer la recette"
                        onclick={() => detachRecipe(event, recipe)}><Icon d={TRASH} /></button>
                    </li>
                  {/each}
                </ul>
              {:else}
                <p>Pas encore de recette pour cet événement.</p>
              {/if}
              <div class="manage-row">
                <input bind:value={pick} placeholder="Chercher une recette à ajouter…" aria-label="Chercher une recette">
              </div>
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
</section>

<div class="addbar">
  <form onsubmit={submit} autocomplete="off">
    <input type="date" bind:value={day} aria-label="Jour" class="f-qty" style="flex: 0 1 140px">
    <input class="f-name" bind:value={title} list="event-types" placeholder="Type d'événement">
    <input class="f-qty" type="number" inputmode="numeric" min="1" bind:value={guests} aria-label="Convives" title="Nombre de convives">
    <input class="f-loc" bind:value={contraintes} placeholder="Contraintes (halal, végétarien…)">
    <button class="submit" disabled={busy}>Ajouter</button>
  </form>
</div>

<datalist id="event-types">
  {#each TYPES as t (t)}<option value={t}></option>{/each}
</datalist>
