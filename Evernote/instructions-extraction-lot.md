# Extraction d'un lot Evernote — instructions pour l'agent

Mission : extraire les recettes du fichier `Evernote/lots/lot-NN.txt` (NN
fourni dans la demande) en fiches structurées `Evernote/fiches/lot-NN.json`.

## Entrée

Le fichier de lot contient plusieurs notes, séparées par une ligne de `=`.
Chaque note commence par un en-tête :

```
id: 024-recette-salade-de-pates-aux-asperges-...
titre: <titre Evernote brut>
url: <url d'origine, absente pour une recette perso>
date note: AAAAMMJJ
```

suivi du texte brut de la page capturée (avec du bruit : pub, partage,
navigation — à ignorer).

## Sortie

Un tableau JSON, une entrée par recette, sur le modèle EXACT de
`Evernote/fiches/lot-01.json` (et `fiches/jus.json` pour le champ
`category`). Champs :

| Champ | Règle |
|---|---|
| `id` | repris TEL QUEL de l'en-tête de la note. Une note peut produire plusieurs recettes : répéter le même `id` (cf. `fiches/jus.json`). |
| `title` | court et propre : sans le nom du site, sans le préfixe « Recette ». Pour une note perso, suffixer « (recette perso) ». |
| `servings` | entier (« Nombre de personnes ») ou `null` si inconnu. |
| `category` | omis ou `""` pour un plat ; `"Boissons"` pour jus, cocktails, boissons. |
| `ingredients` | liste ordonnée de `{ qty, unit, name }`, voir ci-dessous. |
| `steps` | recette condensée et REFORMULÉE, voir ci-dessous. |

Ne PAS mettre `url`, `source`, `capturedOn` ni `photos` : le script
`enex-merge.mjs` les ajoute depuis l'inventaire.

### Règles pour `ingredients`

- `qty` : nombre, ou `null` si non précisé (sel, poivre, « un peu de… »).
  Les fractions deviennent des décimaux : « ½ botte » → `0.5` — JAMAIS de
  fraction ni de quantité dans `name`.
- `unit` : `""` si pas d'unité (pièces). Unités normalisées comme au
  lot 1 : `g`, `kg`, `cl`, `l`, `c. à s.`, `c. à c.`, `botte`, `gousses`,
  `feuilles`, `pincée`, `tranches`…
- `name` : le produit seul, en minuscules (sauf noms propres), sans
  quantité ni unité. Garder les précisions utiles (« poulet déjà cuit »,
  « farine tamisée »).
- Aplatir les sous-sections (« Pour la vinaigrette : ») : intégrer leurs
  ingrédients à la suite dans la même liste, dans l'ordre.
- Ne rien inventer : si une info manque, `null` ou `""`.

### Règles pour `steps`

- IMPÉRATIF LÉGAL : copie privée — reformuler et condenser, ne JAMAIS
  recopier le texte original du site.
- Style : infinitif, une seule chaîne, phrases enchaînées comme au lot 1.
- Conserver ce qui a de la valeur : températures, durées, tours de main,
  astuces, avis de lecteurs pertinents.
- Terminer par une parenthèse : source et temps, ex.
  `(Marie Claire — préparation 15 min, cuisson 40 min, repos 2 h.)`.
  Y mettre aussi l'auteur ou les variantes suggérées le cas échéant.
- Note perso : transcrire fidèlement, terminer par
  `(Note perso Evernote du JJ/MM/AAAA, transcrite telle quelle.)`.

## Validation avant de rendre la main

1. Le JSON est valide :
   `node -e "JSON.parse(require('fs').readFileSync('Evernote/fiches/lot-NN.json','utf8'))"`.
2. `node app/scripts/enex-merge.mjs` s'exécute SANS avertissement
   « fiche sans note » (sinon un `id` est faux) — ce script est rejouable
   et ne touche que `recettes-data.json` et `import.sql`. NE PAS exécuter
   de SQL, NE PAS toucher à la base.
3. Chaque note du lot a produit au moins une fiche (ou signaler pourquoi).

## Compte rendu attendu

Nombre de notes traitées, nombre de fiches produites, et la liste des cas
douteux (quantités illisibles, recette incomplète, note qui n'est pas une
recette) — sans les corriger silencieusement.
