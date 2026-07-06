<script>
  import { createHousehold, joinHousehold } from '../lib/store.svelte.js'

  let name = $state('Notre foyer')
  let withSeed = $state(true)
  let code = $state('')
  let message = $state('')
  let busy = $state(false)

  async function create(e) {
    e.preventDefault()
    busy = true
    message = ''
    try { await createHousehold(name.trim() || 'Notre foyer', withSeed) }
    catch (err) { message = err.message; busy = false }
  }

  async function join(e) {
    e.preventDefault()
    busy = true
    message = ''
    try { await joinHousehold(code) }
    catch { message = 'Code de foyer introuvable. Vérifiez-le auprès de la personne qui l\'a créé.'; busy = false }
  }
</script>

<div class="centered">
  <div class="panel">
    <h1>Bienvenue</h1>
    <p class="muted">Un foyer regroupe les personnes qui partagent stock et listes de courses.</p>

    <form onsubmit={create}>
      <input bind:value={name} placeholder="Nom du foyer" aria-label="Nom du foyer">
      <label class="check">
        <input type="checkbox" bind:checked={withSeed}>
        Importer l'inventaire d'épices initial (160 références)
      </label>
      <button class="submit" disabled={busy}>Créer le foyer</button>
    </form>

    <p class="muted or">— ou —</p>

    <form onsubmit={join}>
      <input bind:value={code} placeholder="Code du foyer reçu d'un proche" required aria-label="Code du foyer">
      <button class="submit secondary" disabled={busy}>Rejoindre ce foyer</button>
    </form>

    {#if message}<p class="message">{message}</p>{/if}
  </div>
</div>
