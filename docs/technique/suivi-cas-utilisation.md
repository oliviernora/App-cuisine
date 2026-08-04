# Suivi des cas d'utilisation

Validation et couverture des cas de `docs/utilisateur/cas-utilisation.md`.
Mis à jour à chaque livraison.

Restructuration du 27/07/2026 (commentaires 3 d'Olivier) : les cas sont
organisés en **5 familles** (gérer les ingrédients / faire les courses /
préparer la semaine / gérer les recettes / gérer les inventaires) + une
section transverse (foyer, maisons) ; un écran d'accueil reprendra ces
familles (décision : en plus des onglets). Numérotation conservée ;
nouveaux cas : N13 (je range mes courses — remplace le flux Q2 « à mettre
en stock », décision 27/07), N14 (je gère ma liste d'ingrédients — une
liste, deux portes d'entrée), NP14 (produit imprévu au rangement).
Amendés : N1 (étape 4 → N13), N3 (trois provenances + point 4 NOUVEAU :
lieux d'achat, ajouté par Olivier), N4 (à acheter en haut par magasin /
achetés en bas, décoche — façon To Do), N10 (étape 6 : marquer les plats
faits + photos). **GO d'Olivier donné le 28/07 (« ok. j'ai fait une modif
(NOUVEAU). go pour implémenter ») — implémenté le 28/07** (voir cahier de
tests, passage du 28/07).

Renumérotation du 06/07/2026 (revue d'Olivier, fusions) : N3 reformulé
(« je prépare mes courses », quantités incluses) ; ex-N6+N7 → N6
(rangements + déplacements, y compris par liste cochée) ; ex-N8 datés → N7
(réécrit générique, exemples en fin de cas) ; ex-N9+N10+N11 → N8 (« je fais
une recette et je la consigne ») ; ex-N12 → N9 ; ex-N13+N15 → N10 (« je
planifie ma semaine », courses et planning inclus) ; ex-N14 → N11.

| Cas | Validation | Couverture | Notes |
|---|---|---|---|
| N1 épuiser/racheter | validé, amendé 16/07 (rachat sur la SOMME des emplacements, réserve minimum par ingrédient) ; **amendé 04/08 (décision Olivier)** : réserve minimum PAR RÉSIDENCE | couvert, testé, EN PRODUCTION — amendement 04/08 **couvert, testé** (minOf par résidence, rachat testé — migration à appliquer) | |
| N2 inventaire | dicté par Olivier, amendé 27/07 (correction du nombre, dictée des noms difficiles — à valider) ; amendé 04/08 (commentaires 4, **GO d'Olivier**) : rectifier un nom écorché (ne touche QUE l'ingrédient ajouté), produit d'une autre maison reconnu, inventaires de front + réouverture (pas de geste « vers l'autre boîte ») | **couvert, testé** (04/08 : lots 1-3, causes racines prouvées, parcours réel — voir cahier) — M74 sur iPhone | complété le 07/07 : inventaire pausable (les onglets restent visibles, reprise où on en était) et menu de choix en cas d'ambiguïté vocale ; complété le 08/07 : emplacement « à dates » — le comptage ajuste les lots (sortie du plus ancien, excédent « sans date »), bilan annoncé avant application (décision Olivier 08/07) ; complété le 27/07 (commentaires 2) : saisie directe de la quantité d'une ligne vue, garde-fou « 4 épices », rapprochement des dictées écorchées contre la master list + alias mémorisé après confirmation (décision Olivier 27/07) |
| N3 je prépare mes courses | reformulé par Olivier 06/07, complété 16/07 (lieu d'achat par ligne) | quasi couvert (16/07) | panier « réserve », lieu d'achat modifiable et mémorisé, quantité réelle confirmée au rangement ; reste : quantité voulue à l'AJOUT en liste |
| N4 courses multi-lieux | validé, amendé | partiel | amendement à couvrir : voir/cocher les autres listes |
| N5 foyer | validé | couvert | test manuel M4 à dérouler |
| N6 rangements + déplacements | fusionné par Olivier 06/07, amendé 27/07 (déplacement depuis la ligne du stock, série d'ajouts au même endroit — à valider) ; précisé 04/08 (commentaires 4) : renommages en chaîne fiables, y compris pendant un inventaire (BUG « soin 1 »/« soin 2 » : cause racine PROUVÉE le 04/08 — inventaire suivi par NOM, jamais mis à jour au renommage — et CORRIGÉE, permutation vérifiée en réel) | **couvert, testé** (06/07, complété 27/07) | déplacement unitaire et par produits cochés, regroupement des doublons, renommage, fusion (2 touches) — panneau « Gérer » de l'onglet Inventaire ; depuis le 27/07 (commentaires 2) : « Déplacer » par ligne d'emplacement dans le détail ▸ du Stock, et emplacement retenu d'un ajout à l'autre dans la barre d'ajout |
| N7 emplacements datés | proposition précisée (générique + exemples) | **couvert, testé** (08/07) | fait 07/07 : réglage « à dates », entrée par lots datés, sortie du plus ancien, total simple, « sans date » pour l'existant ; fait 08/07 : inventaire des lots (N2, ajustement auto + bilan), rappel des lots anciens dans la Semaine (bloc « À utiliser », N10), seuil d'ancienneté réglable par emplacement (6 mois par défaut — décision Olivier 08/07) |
| N8 je fais une recette et je la consigne | fusionné par Olivier 06/07 | **partiel** (incréments 1-2, 07/07) | consigner date+commentaire : fait ; 105 recettes Passard importées, 82 fiches remplies dans la vraie base (682 ingrédients, M13 déroulé) ; photos livrées le 07/07 soir (plat — seule ou avec la réalisation — et page du livre, bucket privé du foyer, compression côté client, URL signée) ; reste : extraction IA (clé API), imports en volume (logiciel de scan à préciser), photos hors ligne |
| N9 retrouver une recette | proposition | **couvert** (07/07) | recherche multicritère (titre, ingrédient, pays, source, mot du texte) dans Recettes ET dans la Semaine ; filtre par source (chips) ; sources gérées (renommer/fusionner/créer) ; pays à remplir (proposition en attente de validation) |
| N10 planifier ma semaine | fusionné par Olivier 06/07 (inclut courses et planning) | **partiel** (incréments 1-4, 07/07) | fait : événements, recettes associées, consignation, quantités à l'échelle avec **ajustement % et corrections par recette et par événement**, bloc semaine **déroulant**, courses **synchronisées automatiquement** (somme réappro + repas, bascule « je l'ai », dédoublonnage) ; reste : planning des tournées (attend créneaux + décision), agenda Google |
| N11 wish list / beau produit | proposition | **couvert** (07/07 soir) | étoile « wish list » sur la fiche, filtre ★ dans Recettes (cumulable avec « Par ingrédient » = beau produit), ingrédients difficiles à sourcer (« ! » en tête de ligne, mention « à commander à l'avance ») ; l'anticipation des commandes viendra avec le planning (N10/étape 3) |
| N12 mes trois maisons | proposition (décision Q6 du 16/07) | couvert, testé (lot 5 du 16/07 — migration à appliquer) | résidence courante par appareil ; recettes/wish list/master list communes ; inventaire en pause attaché à sa résidence |
| NP1 produit retrouvé | décidé par Olivier, reformulé 16/07 (niveau ingrédient : ranger le pot retrouvé retire la ligne tout seul) | couvert, testé | |
| NP2 rupture en magasin | validé | couvert, testé | |
| NP3 coché par erreur | validé | couvert, testé | |
| NP4 plusieurs pots d'un coup | décidé le 16/07 (Q2) | **couvert, testé** (lot 3 du 16/07) | la quantité reçue se confirme au rangement (« à mettre en stock », onglet Inventaire) |
| NP5 pas de réseau | validé | partiel | consultation hors ligne OK ; cocher hors ligne à faire |
| NP6 inventaire interrompu | validé, amendé 27/07 (pause volontaire et reprise — à valider) ; amendé 04/08 (commentaires 4, **GO d'Olivier**) : plusieurs inventaires en pause en parallèle | **couvert, testé** (04/08, lot 3 — parcours réel) | un bandeau « Reprendre » PAR inventaire en pause ; démarrer ailleurs met l'inventaire ouvert en pause sans rien perdre (la confirmation 2 touches du 27/07 n'a plus d'objet) ; ancien format localStorage repris sans perte |
| N13 je range mes courses | validé (GO Olivier 28/07, remplace le flux Q2 « à mettre en stock ») | **couvert, testé** (28/07) | écran « Ranger les courses » : saisie/dictée, candidats (« huile » → huile d'olive/tournesol), « Nouveau produit » hors liste, emplacement par défaut = dernier connu, lot daté si congélateur, ligne semaine → « je l'ai » ; vérifié en réel sur 5173 |
| N14 je gère ma liste d'ingrédients | validé (GO Olivier 28/07) ; amendé 04/08 (GO Olivier + réponses Q1-Q4) : fiche unique, minimum PAR RÉSIDENCE, lieux MULTIPLES (URL communes, boutiques par résidence) | **couvert, testé, EN PRODUCTION** (04/08 : FicheIngredient.svelte, 6 tests, parcours réel ; migration appliquée — check:schema 20/20 — et prod publiée) — M76 iPhone | la fiche : nom-fusion, genre, stock par emplacement, minimum par maison (repli ancien min global puis 1), lieux ×/ajout, alias retirables, recettes, suppression ; sourcing par ingrédient remplacé par les lieux (héritage genre = repli) ; sans migration : refus AVEC bannière |
| N3.4 lieux d'achat | validé (ajout NOUVEAU d'Olivier du 28/07 au cas N3) ; **amendé 04/08 (décision Olivier)** : plusieurs lieux par ingrédient ; lieux Internet communs au foyer, lieux physiques par résidence | couvert, testé (28/07, amendements 04/08 **couverts, testés** : lieux multiples + preferredStore + rattachement résidence dans Lieux d'achat — migration à appliquer) | table stores + gestion complète (physique/Internet, URL/adresse, commentaire, renommage en cascade, achetables, reprise des lieux existants) |
| N15 documenter la bibliothèque par scan ISBN | **GO Olivier 02/08** (décisions : couverture copiée dans le stockage du foyer ; sous-écran Sources + multi-scan avec pile en bas d'écran) | **couvert, testé** (02/08) — **migration `sources` à appliquer**, puis M68-M69 sur iPhone | ScanLivre.svelte (caméra ZXing EAN-13 chargée à la demande, saisie manuelle en secours), livre-isbn.js (Google Books puis Open Library), saveBookSource (complément d'une fiche du même titre — champs vides seulement), couvertures dans Gérer les sources ; N8 amendé (renvoi vers N15) |
| N16 bibliothèque dédiée (livres + sites) | proposition 04/08 (commentaires 4), **GO d'Olivier** (présentation à la main de Claude) | **couvert, testé** (04/08, lot 4 — parcours réel) — **migration `sources.url` APPLIQUÉE le 04/08** (GO Olivier, check:schema 18/18) ; reste : republier puis M75 iPhone | Bibliotheque.svelte : grille de couvertures (livres) + liste (sites/autres), recherche, tri (titre/auteur/recettes), fiche source → ses recettes, renommage ✎ (fusion), scanner une recette (livre) / visiter le site + « coller l'URL » (site, import A1 pré-rempli avec la source), ajout à la main (livre ou site + adresse), file « Livres à compléter » absorbée ; raccourci d'accueil ; sans migration : visite par l'origine d'une recette, adresse refusée AVEC message |
| NP8 produit après planning | proposition | non couvert | avec N10 |
| NP9-NP11 (recettes) | propositions | non couverts | étape 4 |
| NP12-NP13 (semaine) | propositions | non couverts | étape 5 |
| NP14 produit imprévu au rangement | proposition 27/07 | **couvert, testé** (28/07) | « Nouveau produit » de l'écran de rangement (rangerNouveau, fusion si déjà présent à l'emplacement) |
| NP15 scan de livre sans résultat | GO Olivier 02/08 (avec N15) ; **amendé 03/08 et révisé le soir** (décisions Olivier : BnF en 3e source ; introuvable → mise de côté de l'ISBN en un geste, puis **Claude complète par recherche web** — outils MCP `livres_a_completer`/`completer_source` ; photo de couverture en secours seulement ; l'OCR local abandonné) | **couvert, testé** (03/08, y compris en réel après migration : mise de côté effective, file « · 1 ») — M70-M72 sur iPhone + première complétion réelle par Claude | ISBN à la main (normalizeIsbn 13/10), doublon détecté par ISBN et par titre (complément, jamais d'écrasement) ; introuvable → `pending_books` (auto en multi-scan), file « Livres à compléter » dans Gérer les sources (📷 photo de secours, ×) ; retour terrain 03/08 : 2 livres sur 3 non trouvés — cause Google 429 + couverture française, BookBuddy les trouvait |

NP1 à NP13 : non revus par Olivier lors de sa relecture du 06/07/2026 (il
n'a revu que les nominaux). NP7 : numéro retiré (décision Olivier).

## Reste à faire transverse

- Amendement N4 (autres listes) et N3 (quantités) : prochain lot courses.
- Master list par genres livrée le 07/07, complétée le 08/07 (commentaires
  Olivier) : genres en menu déroulant + « Gérer les genres » (table
  ingredient_categories, sourcing par défaut), fiche ingrédient (renommage
  libre avec fusion, sourcing affiné, recettes associées), filtre par genre
  dans la recherche du Stock, sourcing → magasin prérempli des courses.
- Fractions livrées le 08/07 (parseIngredientLine) ; reste à trancher
  avec Olivier : les noms douteux « eau » et « ficelle de cuisine »
  (repris dans plan.md § En attente d'Olivier).
- Sauvegarde (exigence NFR) livrée le 08/07 : export JSON dans le panneau
  Foyer + rappel à 7 jours (point orange). Restauration livrée le 09/07
  (décisions Olivier : remplacement complet du foyer, export automatique de
  l'état actuel + confirmation avant d'écraser ; fichier étranger/tronqué
  refusé sans rien toucher). Test navigateur (M38) : après application de
  la migration du 08/07 uniquement — sur la base réelle non migrée, une
  restauration s'interromprait sur les tables manquantes.
- Rapprochement ingrédients ↔ stock : v2 livrée le 07/07 (master list,
  décision Olivier) — alias confirmés un par un dans « Ingrédients à
  rapprocher » (onglet Inventaire), refus mémorisés, autocomplétion des noms
  connus à la saisie. Reste (N3/N10/NP4) : quantités — « pour N personnes »
  sur la recette, besoin mis à l'échelle et ajustable, quantités en liste de
  courses.
- Ingrédients des recettes Passard : 82 fiches remplies (07/07/2026) ; les
  23 restantes n'ont pas d'article exploitable (pages vidéo sans texte) —
  saisie au fil de l'eau dans la fiche si besoin.
- Réinitialisation de mot de passe dans l'application.
