<script>
  import { store, init, signOut } from './lib/store.svelte.js'
  import Auth from './components/Auth.svelte'
  import Onboarding from './components/Onboarding.svelte'
  import Stock from './components/Stock.svelte'
  import Shopping from './components/Shopping.svelte'
  import Inventory from './components/Inventory.svelte'
  import Inventaires from './components/Inventaires.svelte'
  import Recettes from './components/Recettes.svelte'
  import Semaine from './components/Semaine.svelte'
  import Icon from './components/Icon.svelte'
  import { LOGOUT, USERS } from './lib/icons.js'

  let tab = $state('stock')
  let showFoyer = $state(false)
  const shopCount = $derived(store.shop.filter(s => !s.done && !s.available).length)

  init()
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
        <h1>Garde-manger <small>{store.household.name}</small></h1>
        <button class="icon-btn danger" type="button" aria-label="Foyer et compte" title="Foyer et compte"
          onclick={() => showFoyer = !showFoyer}>
          <Icon d={USERS} />
        </button>
      </div>
      {#if showFoyer}
        <div class="foyer-panel">
          <p>Pour inviter un membre du foyer : il crée son compte, puis choisit
            « Rejoindre ce foyer » avec ce code :</p>
          <code>{store.household.id}</code>
          <button type="button" class="linklike" onclick={signOut}>
            <Icon d={LOGOUT} /> Se déconnecter
          </button>
        </div>
      {/if}
      <nav class="tabs">
        <button type="button" class:active={tab === 'stock'} onclick={() => tab = 'stock'}>Stock</button>
        <button type="button" class:active={tab === 'shop'} onclick={() => tab = 'shop'}>
          Courses{#if shopCount > 0}<span class="count">{shopCount}</span>{/if}
        </button>
        <button type="button" class:active={tab === 'recettes'} onclick={() => tab = 'recettes'}>Recettes</button>
        <button type="button" class:active={tab === 'semaine'} onclick={() => tab = 'semaine'}>Semaine</button>
        <button type="button" class:active={tab === 'inv'} onclick={() => tab = 'inv'}>Inventaire</button>
      </nav>
    </div>
  </header>

  {#if !store.online}
    <div class="offline-banner">Hors ligne — dernières données connues, consultation seule.</div>
  {/if}

  <main class:offline={!store.online}>
    {#if tab === 'stock'}
      <Stock />
    {:else if tab === 'shop'}
      <Shopping />
    {:else if tab === 'recettes'}
      <Recettes />
    {:else if tab === 'semaine'}
      <Semaine />
    {:else if store.inv}
      <!-- Inventaire en cours : changer d'onglet met en pause, revenir reprend ici. -->
      <Inventory />
    {:else}
      <Inventaires />
    {/if}
  </main>
{/if}
