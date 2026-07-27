> STATUT (25/07/2026) : toutes les remarques ci-dessous sont TRAITÉES et
> vérifiées en local (144 tests verts, parcours réels sur 5173 — détail
> dans docs/technique/cahier-de-tests.md, passage du 25/07/2026).
> Reste : republier la prod (`app/mettre-en-ligne.cmd`) puis vérifier sur
> iPhone (tests M56-M58 du cahier). Point 2 : les « emplacements sans
> résidence » étaient une liste de 10 emplacements par défaut codée en dur
> dans l'écran Stock — supprimée ; seuls les emplacements de la résidence
> courante apparaissent désormais, partout.

Je suis en train d'ajouter les réserves de Montalivet.
Voici mes remarques sur l'application, sur la base de l'interface iPhone :

1. Design UX : il faut simplifier la navigation et le design de la manière suivante :
- menu déroulant : lorsque je sélectionne Foyer et compte, je dois tomber sur l'écran foyer et compte, qui apparait comme tel dans le menu déroulant. Dans l'application pour l'instant, il reste la mention de l'ancien écran (exemple : Stock) - le menu foyer et compte est un écran comme les autres.
- dans tous les écrans, il faut conserver en accès direct les actions fréquentes, et ne proposer les actions d'administration que lorsqu'on le demande.
- dans tous les écrans, le renommage de quelque chose se fait avec une icone de crayon et directement sur le nom à modifier, pour gagner de la place sur iphone.
- fais très attention à la largeur de l'écran sur smartphone : une seule zone de texte par ligne - l'écran est trop petit pour deux zones. Je travaille sur iphone 13 mini !

- dans l'écran foyer et compte, je veux voir en direct : le menu de sélection de la résidence, la clé pour rejoindre le foyer, les sauvegardes, la déconnexion, et un bouton : "gérer les résidences". Lorsqu'on clique, apparait le menu de gestion de la résidence, avec le nom des résidences, une icone de crayon pour renommer (le renommage apparait alors directement sur le nom pour gagner de la place sur iphone), une corbeille pour supprimer une résidence (avec question de confirmation et alerte que tous les ingrédients de la résidence seront perdus), et une zone d'ajout de résidence.

- dans l'écran stocks, lorsque j'édite un ingrédient, il faut retirer le menu d'ajout d'un ingrédient, et le menu de recherche d'un élément.
- d'une manière générale, vérifie que tu ne conserves jamais deux menus / deux écrans de saisie ouverts en même temps : l'utilisateur fait ceci ou cela, mais pas deux choses en même temps. Simplifie les écrans.

--> IMPERATIF : lorsque tu entres dans un sous menu, supprime toutes les zones de recherche, de sélection, etc. en cours. Ajoute systématiquement une icone de croix (fermer) pour revenir en arrière

- dans l'écran recette : lorsqu'on clique sur une recette, on arrive sur un écran dédié à la recette, avec une croix pour fermer. ne mélange pas recette et liste de recettes.

- dans la zone inventaire, je dois pouvoir ajouter un emplacement, et gérer les emplacements./model

2. Gestion des emplacements :
- dans "Argenteuil", j'ai 5 emplacement. dans "Montalivet", je n'ai pas d'emplacement. Dans "Stocks", j'ai 10 emplacements. Pourquoi y a-t-il des emplacements sans résidence ?
- dans tous les écrans, lorsque je recherche un emplacement il doit correspondre à la résidence. Or dans "Stocks", j'ai accès à tous les emplacements indépendemment de la résidence.