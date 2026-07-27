<script>
  /** Sous-écran (commentaires Olivier 25/07/2026) : toute édition ou sous-menu
   * occupe l'écran seul — recherche, listes et barres d'ajout disparaissent.
   * La croix ferme et revient où on était. */
  let { titre, fermer, children } = $props()
</script>

<div class="sous-ecran">
  <div class="se-head">
    <h2>{titre}</h2>
    <button type="button" class="icon-btn se-close" aria-label="Fermer" title="Fermer"
      onclick={fermer}>×</button>
  </div>
  {@render children()}
</div>
