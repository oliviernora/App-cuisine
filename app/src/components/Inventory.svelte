<script>
  import { onMount } from 'svelte'
  import { store, declare, adjustSeen, adjustCreated, finishInventory, abandonInventory } from '../lib/store.svelte.js'
  import Icon from './Icon.svelte'
  import { MINUS, PLUS, MIC } from '../lib/icons.js'

  let search = $state('')
  let bilan = $state(false)
  let abandoning = $state(false)
  let busy = $state(false)
  let hint = $state('Dites au micro « trois cumin moulu », ou tapez quelques lettres puis touchez la ligne trouvée.')
  let listening = $state(false)
  let voiceAvailable = $state(true)

  function fold(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  }

  const locItems = $derived(store.items.filter(i => i.loc === store.inv.loc)
    .toSorted((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })))
  const toCheck = $derived(locItems.filter(i => store.inv.seen[i.id] === undefined)
    .filter(i => !search || fold(i.name).includes(fold(search))))
  const seenItems = $derived(locItems.filter(i => store.inv.seen[i.id] !== undefined))
  const notFound = $derived(locItems.filter(i => store.inv.seen[i.id] === undefined))

  function declareByName(name, n) {
    const match = locItems.filter(i => fold(i.name) === fold(name))[0]
      ?? locItems.filter(i => fold(i.name).includes(fold(name)))[0]
    if (match) declare(match, n)
    else declare(name, n)
    search = ''
    return match?.name ?? name + ' (nouveau)'
  }

  function submit(e) {
    e.preventDefault()
    if (search.trim()) hint = 'Vu : ' + declareByName(search.trim(), 1)
  }

  async function terminer() {
    busy = true
    await finishInventory()
  }

  const NUMBER_WORDS = { un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10 }
  let rec = null
  onMount(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { voiceAvailable = false; hint = 'Pas de reconnaissance vocale ici : tapez quelques lettres puis touchez la ligne.'; return }
    rec = new SR()
    rec.lang = 'fr-FR'
    rec.onstart = () => { listening = true; hint = 'Je vous écoute…' }
    rec.onend = () => { listening = false }
    rec.onerror = ev => { hint = 'Micro indisponible (' + ev.error + ').' }
    rec.onresult = ev => {
      let words = ev.results[0][0].transcript.trim().toLowerCase().split(/\s+/)
      let n = 1
      if (/^\d+$/.test(words[0])) { n = Number(words[0]); words = words.slice(1) }
      else if (NUMBER_WORDS[words[0]]) { n = NUMBER_WORDS[words[0]]; words = words.slice(1) }
      hint = 'Vu : ' + declareByName(words.join(' '), n) + (n > 1 ? ' × ' + n : '')
    }
  })
</script>

<section class="inventory">
  <div class="inv-header">
    <h2>Inventaire — {store.inv.loc}</h2>
    <p class="muted">{seenItems.length + store.inv.created.length} vus · {notFound.length} à vérifier</p>
  </div>

  {#if bilan}
    <div class="panel bilan">
      <h2>Bilan de l'inventaire</h2>
      {#if notFound.length}
        <p>Produits non trouvés — ils passeront à zéro pot (et en courses) :</p>
        <ul>
          {#each notFound as item (item.id)}<li class="row"><span class="name">{item.name}</span></li>{/each}
        </ul>
      {:else}
        <p>Tout a été trouvé.</p>
      {/if}
      <button class="submit" disabled={busy} onclick={terminer}>C'est exact — appliquer l'inventaire</button>
      <button class="submit secondary" disabled={busy} onclick={() => bilan = false}>Continuer l'inventaire</button>
    </div>
  {:else}
    <p class="group-title">Vus <span class="n">· {seenItems.length + store.inv.created.length}</span></p>
    <ul>
      {#each seenItems as item (item.id)}
        <li class="row seen">
          <span class="name" title={item.name}>{item.name}</span>
          <div class="qty">
            <button type="button" aria-label="Un pot de moins" onclick={() => adjustSeen(item.id, -1)}><Icon d={MINUS} /></button>
            <output>{store.inv.seen[item.id]}</output>
            <button type="button" aria-label="Un pot de plus" onclick={() => adjustSeen(item.id, 1)}><Icon d={PLUS} /></button>
          </div>
        </li>
      {/each}
      {#each store.inv.created as c (c.name)}
        <li class="row seen">
          <span class="name" title={c.name}>{c.name}</span>
          <span class="note">nouveau</span>
          <div class="qty">
            <button type="button" aria-label="Un pot de moins" onclick={() => adjustCreated(c.name, -1)}><Icon d={MINUS} /></button>
            <output>{c.qty}</output>
            <button type="button" aria-label="Un pot de plus" onclick={() => adjustCreated(c.name, 1)}><Icon d={PLUS} /></button>
          </div>
        </li>
      {/each}
    </ul>

    <p class="group-title">À vérifier <span class="n">· {toCheck.length}</span></p>
    <ul>
      {#each toCheck as item (item.id)}
        <li class="row tocheck">
          <button type="button" class="rowbtn" onclick={() => { declare(item, 1); hint = 'Vu : ' + item.name }}>
            {item.name}
          </button>
        </li>
      {/each}
    </ul>

    <div class="toolbar inv-actions">
      {#if abandoning}
        <button type="button" class="danger-btn" onclick={abandonInventory}>Confirmer l'abandon</button>
        <button type="button" onclick={() => abandoning = false}>Non, je continue</button>
      {:else}
        <button type="button" onclick={() => abandoning = true}>Abandonner</button>
        <button type="button" class="primary" onclick={() => bilan = true}>Terminer l'inventaire</button>
      {/if}
    </div>
  {/if}
</section>

{#if !bilan}
  <div class="addbar">
    <form onsubmit={submit} autocomplete="off">
      <input class="f-name" bind:value={search} placeholder="Produit trouvé (quelques lettres suffisent)">
      {#if voiceAvailable}
        <button class="mic" class:listening type="button" aria-label="Déclarer à la voix"
          onclick={() => listening ? rec.stop() : rec.start()}><Icon d={MIC} /></button>
      {/if}
      <button class="submit">Vu</button>
      <p class="hint">{hint}</p>
    </form>
  </div>
{/if}
