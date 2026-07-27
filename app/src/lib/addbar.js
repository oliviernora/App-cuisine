/** Action Svelte pour la barre d'ajout fixée en bas : publie sa hauteur
 * réelle dans --barre (racine), que le padding du main réserve — le bas de
 * page reste atteignable même quand la barre grandit (indice sur plusieurs
 * lignes, dépliant Détails, zone sûre iPhone). Remarque Olivier 27/07/2026. */
export function addbarHeight(node) {
  const root = document.documentElement
  const pose = () => root.style.setProperty('--barre', node.offsetHeight + 'px')
  const ro = new ResizeObserver(pose)
  ro.observe(node)
  pose()
  return {
    destroy() {
      ro.disconnect()
      root.style.setProperty('--barre', '0px')
    }
  }
}
