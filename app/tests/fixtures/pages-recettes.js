/**
 * Pages HTML de test pour l'import par URL (A1).
 * MARIE_CLAIRE_HTML embarque le JSON-LD RÉEL de la page « Salade de poulet
 * aux herbes » (relevé le 10/07/2026) : ingrédients en un seul bloc avec
 * retours à la ligne, étapes en HowToStep, recipeYield « 4 ».
 */

export const MARIE_CLAIRE_URL = 'https://www.marieclaire.fr/cuisine/salade-de-poulet-aux-herbes,1444800.asp'

export const MARIE_CLAIRE_HTML = `<!DOCTYPE html><html><head>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"NewsArticle","headline":"Un article sans rapport"}
</script>
<script type="application/ld+json">
	{
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": "Salade de poulet aux herbes",
    "identifier": 1444800,
    "headline": "Salade de poulet aux herbes",
    "description": "Partons à la découverte de la culture créole avec cette salade de poulet aux herbes.",
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.marieclaire.fr/cuisine/salade-de-poulet-aux-herbes,1444800.asp"
    },
    "articleSection": "Salades",
    "image": {
        "@type": "ImageObject",
        "url": "https://cache.marieclaire.fr/data/photo/w1200_h630_c17/6h/salade-poulet.jpg"
    },
    "author": [{ "@type": "Person", "name": "Suzy Palatin" }],
    "publisher": {
        "@type": "Organization",
        "name": "Marie Claire",
        "url": "https://www.marieclaire.fr"
    },
    "recipeCategory": "Entrée",
    "prepTime": "PT15M",
    "cookTime": "PT15M",
    "recipeInstructions": [
        { "@type": "HowToStep", "text": "Préchauffez votre four à 180 °C. Enfournez le poulet pour 15 min." },
        { "@type": "HowToStep", "text": "Pendant ce temps, pelez les oignons nouveaux, rincez-les avec les autres herbes, séchez le tout dans du papier absorbant, puis ciselez finement l'ensemble." },
        { "@type": "HowToStep", "text": "Placez-les dans 1 saladier avec l'huile, le jus du citron vert et le vinaigre." },
        { "@type": "HowToStep", "text": "Alors que le poulet est encore chaud, enlevez toute sa peau, prélevez sa chair et émiettez-la (faites de grosses miettes). Ajoutez la chair de poulet dans le saladier, mélangez bien le tout et servez votre salade, tiède ou froide." }
    ],
    "recipeYield": "4",
    "recipeIngredient": "\\r\\n1 poulet déjà cuit \\r\\n1/2 botte d'oignons nouveaux\\r\\n1 citron vert\\r\\n1 botte de persil plat\\r\\n1 botte de coriandre\\r\\n4 c. à soupe d'huile de tournesol ou d'arachide\\r\\n3 c. à soupe de vinaigre blanc\\r\\nSel\\r\\nPoivre\\r\\n"
}
</script>
</head><body>La page</body></html>`

/** Variante « @graph » : recette nichée, ingrédients en tableau, étapes en
 * HowToSection, recipeYield « 6 personnes » — motifs fréquents ailleurs. */
export const GRAPH_URL = 'https://exemple-cuisine.fr/tarte-tomates'

export const GRAPH_HTML = `<html><head>
<script type='application/ld+json' class="yoast">
{"@context":"https://schema.org","@graph":[
  {"@type":"WebSite","name":"Exemple Cuisine"},
  {"@type":["Recipe","Article"],"name":"Tarte aux tomates",
   "recipeYield":["6 personnes"],
   "image":["/img/tarte-tomates.jpg"],
   "recipeIngredient":["1 pâte feuilletée","6 tomates","2 c. à s. de moutarde"],
   "recipeInstructions":[{"@type":"HowToSection","name":"Préparation","itemListElement":[
     {"@type":"HowToStep","text":"Étaler la pâte et la piquer."},
     {"@type":"HowToStep","text":"Tartiner de moutarde, couvrir de tomates, enfourner 35 min à 200 °C."}
   ]}]}
]}
</script>
</head><body></body></html>`

export const SANS_RECETTE_HTML = `<html><head>
<script type="application/ld+json">{"@type":"NewsArticle","headline":"Pas une recette"}</script>
</head><body>Un article de journal.</body></html>`
