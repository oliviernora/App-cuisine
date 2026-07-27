<script>
  import { store, init, signOut, exportPayload, checkBackup, restoreBackup,
    switchResidence, addResidence, renameResidence, deleteResidence, invIsHere } from './lib/store.svelte.js'
  import Auth from './components/Auth.svelte'
  import Onboarding from './components/Onboarding.svelte'
  import Stock from './components/Stock.svelte'
  import Shopping from './components/Shopping.svelte'
  import Inventory from './components/Inventory.svelte'
  import Inventaires from './components/Inventaires.svelte'
  import Recettes from './components/Recettes.svelte'
  import Semaine from './components/Semaine.svelte'
  import Icon from './components/Icon.svelte'
  import SousEcran from './components/SousEcran.svelte'
  import { LOGOUT, USERS, BOX, CART, BOOK, CALENDAR, CLIPBOARD, TRASH } from './lib/icons.js'

  let tab = $state('stock')
  let menuOpen = $state(false)
  const shopCount = $derived(store.shop.filter(s => !s.done && !s.available).length)

  /* Sur petit écran, les onglets collapsent en menu déroulant (pratique
   * responsive classique), avec « Foyer et compte » dans le même menu. */
  const TABS = [
    { id: 'stock', label: 'Stock', icon: BOX },
    { id: 'shop', label: 'Courses', icon: CART },
    { id: 'recettes', label: 'Recettes', icon: BOOK },
    { id: 'semaine', label: 'Semaine', icon: CALENDAR },
    { id: 'inv', label: 'Inventaire', icon: CLIPBOARD }
  ]
  /* « Foyer et compte » est un écran comme les autres (commentaires Olivier
   * 25/07/2026) : sélectionné, le menu déroulant l'affiche comme écran
   * courant — plus jamais la mention de l'ancien onglet. */
  const FOYER = { id: 'foyer', label: 'Foyer et compte', icon: USERS }
  const currentTab = $derived(tab === 'foyer' ? FOYER : TABS.find(t => t.id === tab))

  let prevTab = 'stock' // pour revenir de « Foyer et compte » via le bouton d'en-tête

  function pick(id) {
    if (id === 'foyer' && tab !== 'foyer') prevTab = tab
    tab = id
    menuOpen = false
  }

  function toggleFoyer() {
    pick(tab === 'foyer' ? prevTab : 'foyer')
  }

  /* Gestion des résidences (commentaires Olivier 25/07/2026) : sous-écran
   * dédié — renommage au crayon directement sur le nom, corbeille avec
   * confirmation, zone d'ajout. */
  let gererRes = $state(false)
  let resEdit = $state(null)
  let resEditName = $state('')
  let resDelete = $state(null)
  let resNew = $state('')

  /* Sauvegarde des données (exigence NFR, décision Olivier 08/07) : export
   * JSON manuel + rappel discret quand la dernière date de plus de 7 jours. */
  const BACKUP_KEY = 'gm-derniere-sauvegarde'
  let lastBackup = $state(null)
  try { lastBackup = localStorage.getItem(BACKUP_KEY) } catch { /* stockage indisponible */ }
  const backupDue = $derived(!lastBackup || Date.now() - new Date(lastBackup).getTime() > 7 * 864e5)

  function exporter() {
    const blob = new Blob([JSON.stringify(exportPayload(), null, 1)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'garde-manger-' + new Date().toISOString().slice(0, 10) + '.json'
    a.click()
    URL.revokeObjectURL(a.href)
    lastBackup = new Date().toISOString()
    try { localStorage.setItem(BACKUP_KEY, lastBackup) } catch { /* stockage indisponible */ }
  }

  /* Restauration (décision Olivier 09/07) : remplacement complet des données
   * du foyer, après export automatique de l'état actuel + confirmation. */
  let restoreInput = $state(null)
  let restoreMsg = $state('')

  async function restaurer(e) {
    const file = e.target.files[0]
    e.target.value = ''
    if (!file) return
    restoreMsg = ''
    let data
    try {
      data = JSON.parse(await file.text())
      checkBackup(data)
    } catch (err) {
      restoreMsg = 'Fichier refusé : ' + (err instanceof SyntaxError ? 'ce n’est pas un fichier JSON valide.' : err.message)
      return
    }
    const quand = data.exportedAt ? new Date(data.exportedAt).toLocaleString('fr-FR') : 'date inconnue'
    if (!confirm(`Restaurer la sauvegarde du ${quand} (${data.items.length} produits, ${data.recipes.length} recettes) ?\n\n` +
      'Toutes les données actuelles du foyer seront remplacées, pour tous ses membres. ' +
      'Une sauvegarde de l’état actuel est d’abord téléchargée, pour pouvoir revenir en arrière.')) return
    exporter()
    restoreMsg = 'Restauration en cours…'
    try {
      await restoreBackup(data)
      restoreMsg = `Sauvegarde du ${quand} restaurée.`
    } catch (err) {
      restoreMsg = 'Échec : ' + err.message + ' Relancer la restauration avec le même fichier.'
    }
  }

  init()

  /* iPhone : le clavier virtuel recouvre la barre d'ajout fixée en bas ;
   * visualViewport donne la hauteur réellement visible et la barre remonte
   * d'autant via --clavier (commentaire Olivier 16/07/2026). Sans clavier
   * (PC), la valeur reste 0 : rien ne change. */
  if (typeof window !== 'undefined' && window.visualViewport) {
    const vv = window.visualViewport
    const suivreClavier = () => document.documentElement.style.setProperty('--clavier',
      Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + 'px')
    vv.addEventListener('resize', suivreClavier)
    vv.addEventListener('scroll', suivreClavier)
  }
</script>

{#if !store.ready}
  <p class="empty">Chargement…</p>
{:else if !store.session}
  <Auth />
{:else if !store.household}
  <Onboarding />
{:else}
  <header>
    <div class="header-inner">
      <div class="titlebar">
        <h1>Garde-manger <small>{store.household.name}{store.residence ? ' · ' + store.residence.name : ''}</small></h1>
        <button class="icon-btn danger account-btn" type="button" aria-label="Foyer et compte" title="Foyer et compte"
          onclick={toggleFoyer}>
          <Icon d={USERS} />
          {#if backupDue}<span class="backup-dot" title="Sauvegarde à faire"></span>{/if}
        </button>
      </div>
      <div class="tabmenu">
        <button type="button" class="tabmenu-btn" aria-expanded={menuOpen}
          onclick={() => menuOpen = !menuOpen}>
          <Icon d={currentTab.icon} /><span class="tlabel">{currentTab.label}</span>
          {#if shopCount > 0 && tab !== 'shop'}<span class="count">{shopCount}</span>{/if}
          <span class="chev">{menuOpen ? '▴' : '▾'}</span>
        </button>
        {#if menuOpen}
          <div class="tabmenu-list">
            {#each TABS as t (t.id)}
              <button type="button" class:active={tab === t.id} onclick={() => pick(t.id)}>
                <Icon d={t.icon} /><span class="tlabel">{t.label}</span>
                {#if t.id === 'shop' && shopCount > 0}<span class="count">{shopCount}</span>{/if}
              </button>
            {/each}
            <button type="button" class="tabmenu-foyer" class:active={tab === 'foyer'}
              onclick={() => pick('foyer')}>
              <Icon d={USERS} /><span class="tlabel">Foyer et compte</span>
            </button>
          </div>
        {/if}
      </div>
      <nav class="tabs">
        <button type="button" class:active={tab === 'stock'} onclick={() => pick('stock')}>
          <Icon d={BOX} /><span class="tlabel">Stock</span>
        </button>
        <button type="button" class:active={tab === 'shop'} onclick={() => pick('shop')}>
          <Icon d={CART} /><span class="tlabel">Courses</span>{#if shopCount > 0}<span class="count">{shopCount}</span>{/if}
        </button>
        <button type="button" class:active={tab === 'recettes'} onclick={() => pick('recettes')}>
          <Icon d={BOOK} /><span class="tlabel">Recettes</span>
        </button>
        <button type="button" class:active={tab === 'semaine'} onclick={() => pick('semaine')}>
          <Icon d={CALENDAR} /><span class="tlabel">Semaine</span>
        </button>
        <button type="button" class:active={tab === 'inv'} onclick={() => pick('inv')}>
          <Icon d={CLIPBOARD} /><span class="tlabel">Inventaire</span>
        </button>
      </nav>
    </div>
  </header>

  {#if !store.online}
    <div class="offline-banner">Hors ligne — dernières données connues, consultation seule.</div>
  {/if}

  <main class:offline={!store.online}>
    {#if tab === 'foyer'}
      {#if gererRes}
        <SousEcran titre="Gérer les résidences" fermer={() => { gererRes = false; resEdit = null; resDelete = null }}>
          <ul>
            {#each store.residences as r (r.id)}
              <li class="row">
                {#if resEdit === r.id}
                  <!-- Renommage directement sur le nom (commentaire Olivier 25/07/2026). -->
                  <input class="rename-input" bind:value={resEditName} aria-label={'Nouveau nom de ' + r.name}>
                  <button type="button" class="inv-start" disabled={!resEditName.trim()}
                    onclick={async () => { await renameResidence(r, resEditName); resEdit = null }}>OK</button>
                  <button type="button" class="inv-manage" onclick={() => resEdit = null}>Annuler</button>
                {:else}
                  <span class="name">{r.name}</span>
                  {#if r.id === store.residence?.id}<span class="note">courante</span>{/if}
                  <button type="button" class="icon-btn" aria-label={'Renommer ' + r.name} title="Renommer"
                    onclick={() => { resEdit = r.id; resEditName = r.name; resDelete = null }}>✎</button>
                  <button type="button" class="icon-btn danger" aria-label={'Supprimer ' + r.name} title="Supprimer"
                    disabled={store.residences.length < 2}
                    onclick={() => { resDelete = r.id; resEdit = null }}><Icon d={TRASH} /></button>
                {/if}
              </li>
              {#if resDelete === r.id}
                <li class="manage-panel">
                  <p>Supprimer « {r.name} » ? Tous ses stocks, emplacements, courses,
                    lots datés et événements seront perdus, pour tout le foyer.</p>
                  <div class="manage-row">
                    <button type="button" class="inv-start danger-btn"
                      onclick={async () => { await deleteResidence(r); resDelete = null }}>Confirmer la suppression</button>
                    <button type="button" class="inv-manage" onclick={() => resDelete = null}>Non, garder</button>
                  </div>
                </li>
              {/if}
            {/each}
          </ul>
          {#if store.residences.length < 2}
            <p class="note">La dernière résidence du foyer ne peut pas être supprimée.</p>
          {/if}
          <div class="manage-row se-add">
            <input bind:value={resNew} placeholder="Nouvelle résidence (Oulins, Montalivet…)"
              aria-label="Nouvelle résidence">
            <button type="button" class="inv-start" disabled={!resNew.trim()}
              onclick={async () => { await addResidence(resNew); resNew = '' }}>Ajouter</button>
          </div>
        </SousEcran>
      {:else}
        <div class="foyer-panel">
          {#if store.residences.length}
            <!-- Résidences (Q6) : le choix vaut pour CET appareil. -->
            <p>Résidence courante — ses stocks, courses, inventaires et sa
              semaine (choix propre à cet appareil) :</p>
            <div class="manage-row">
              <select value={store.residence?.id} aria-label="Résidence courante"
                onchange={e => switchResidence(e.target.value)}>
                {#each store.residences as r (r.id)}
                  <option value={r.id}>{r.name}</option>
                {/each}
              </select>
            </div>
            <button type="button" class="inv-manage" onclick={() => gererRes = true}>
              Gérer les résidences
            </button>
          {/if}
          <p>Pour inviter un membre du foyer : il crée son compte, puis choisit
            « Rejoindre ce foyer » avec ce code :</p>
          <code>{store.household.id}</code>
          <p>Sauvegarde des données : {lastBackup
            ? 'dernière le ' + new Date(lastBackup).toLocaleDateString('fr-FR')
            : 'jamais faite depuis cet appareil'}{backupDue ? ' — à faire (une fois par semaine), puis ranger le fichier sur OneDrive' : ''}.</p>
          <button type="button" class="linklike" onclick={exporter}>
            Exporter les données (fichier JSON)
          </button>
          <button type="button" class="linklike" onclick={() => restoreInput.click()}>
            Restaurer une sauvegarde (remplace les données du foyer)
          </button>
          <input type="file" accept=".json,application/json" hidden
            bind:this={restoreInput} onchange={restaurer} />
          {#if restoreMsg}<p class="message">{restoreMsg}</p>{/if}
          <button type="button" class="linklike" onclick={signOut}>
            <Icon d={LOGOUT} /> Se déconnecter
          </button>
          <p>Version publiée le {__BUILD__}</p>
        </div>
      {/if}
    {:else if tab === 'stock'}
      <Stock />
    {:else if tab === 'shop'}
      <Shopping />
    {:else if tab === 'recettes'}
      <Recettes />
    {:else if tab === 'semaine'}
      <Semaine />
    {:else if invIsHere() && !store.inv.paused}
      <!-- Inventaire en cours : changer d'onglet met en pause, revenir reprend ici.
           « Mettre en pause » (27/07/2026) rend la liste des emplacements, avec
           un bouton Reprendre. Un inventaire en pause dans une AUTRE résidence
           n'apparaît pas (lot 5). -->
      <Inventory />
    {:else}
      <Inventaires />
    {/if}
  </main>
{/if}
