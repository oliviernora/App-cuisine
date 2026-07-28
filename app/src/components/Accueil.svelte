<script>
  /* Écran d'accueil (décision Olivier 27/07/2026) : les cinq familles de
   * cas d'utilisation en tuiles, avec leurs étapes en raccourcis. Il
   * s'ajoute à la navigation par onglets, il ne la remplace pas. */
  import Icon from './Icon.svelte'
  import { BOX, CART, BOOK, CALENDAR, CLIPBOARD } from '../lib/icons.js'

  let { ouvrir } = $props()

  const FAMILLES = [
    { id: 'stock', icon: BOX, titre: 'Gérer les ingrédients', etapes: [
      { label: 'Rechercher, marquer épuisé', tab: 'stock' },
      { label: 'Ajouter ou modifier un ingrédient', tab: 'stock' }
    ] },
    { id: 'shop', icon: CART, titre: 'Faire les courses', etapes: [
      { label: 'Préparer et effectuer les courses', tab: 'shop' },
      { label: 'Ranger les courses', tab: 'shop', action: 'ranger-courses' },
      { label: 'Lieux d\'achat', tab: 'shop', action: 'lieux-achat' }
    ] },
    { id: 'semaine', icon: CALENDAR, titre: 'Préparer la semaine', etapes: [
      { label: 'Planifier les repas de la semaine', tab: 'semaine' },
      { label: 'Marquer les plats faits, ajouter les photos', tab: 'semaine' }
    ] },
    { id: 'recettes', icon: BOOK, titre: 'Gérer les recettes', etapes: [
      { label: 'Rechercher une recette, wish list', tab: 'recettes' },
      { label: 'Créer ou importer (photos, URL, texte)', tab: 'recettes' }
    ] },
    { id: 'inv', icon: CLIPBOARD, titre: 'Gérer les inventaires', etapes: [
      { label: 'Faire l\'inventaire d\'un emplacement', tab: 'inv' },
      { label: 'Voir et gérer les ingrédients d\'un emplacement', tab: 'inv' },
      { label: 'Gérer les emplacements', tab: 'inv' }
    ] }
  ]
</script>

<section class="accueil">
  {#each FAMILLES as f (f.id)}
    <div class="tuile">
      <button type="button" class="tuile-tete" onclick={() => ouvrir(f.id)}>
        <Icon d={f.icon} /> {f.titre}
      </button>
      <div class="tuile-etapes">
        {#each f.etapes as e (e.label)}
          <button type="button" onclick={() => ouvrir(e.tab, e.action)}>▸ {e.label}</button>
        {/each}
      </div>
    </div>
  {/each}
</section>
