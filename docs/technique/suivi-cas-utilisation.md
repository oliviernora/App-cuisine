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
Amendés : N1 (étape 4 → N13), N3 (trois provenances), N4 (à acheter en
haut par magasin / achetés en bas, décoche — façon To Do), N10 (étape 6 :
marquer les plats faits + photos). **Tous à valider par Olivier avant
implémentation.**

Renumérotation du 06/07/2026 (revue d'Olivier, fusions) : N3 reformulé
(« je prépare mes courses », quantités incluses) ; ex-N6+N7 → N6
(rangements + déplacements, y compris par liste cochée) ; ex-N8 datés → N7
(réécrit générique, exemples en fin de cas) ; ex-N9+N10+N11 → N8 (« je fais
une recette et je la consigne ») ; ex-N12 → N9 ; ex-N13+N15 → N10 (« je
planifie ma semaine », courses et planning inclus) ; ex-N14 → N11.

| Cas | Validation | Couverture | Notes |
|---|---|---|---|
| N1 épuiser/racheter | validé, amendé 16/07 (rachat sur la SOMME des emplacements, réserve minimum par ingrédient) | couvert, testé, EN PRODUCTION (16/07 au soir, migration appliquée) | l'étape 4 (réception via inventaire, Q2) viendra avec le lot 3 Courses |
| N2 inventaire | dicté par Olivier, amendé 27/07 (correction du nombre, dictée des noms difficiles — à valider) | couvert, testé | complété le 07/07 : inventaire pausable (les onglets restent visibles, reprise où on en était) et menu de choix en cas d'ambiguïté vocale ; complété le 08/07 : emplacement « à dates » — le comptage ajuste les lots (sortie du plus ancien, excédent « sans date »), bilan annoncé avant application (décision Olivier 08/07) ; complété le 27/07 (commentaires 2) : saisie directe de la quantité d'une ligne vue, garde-fou « 4 épices », rapprochement des dictées écorchées contre la master list + alias mémorisé après confirmation (décision Olivier 27/07) |
| N3 je prépare mes courses | reformulé par Olivier 06/07, complété 16/07 (lieu d'achat par ligne) | quasi couvert (16/07) | panier « réserve », lieu d'achat modifiable et mémorisé, quantité réelle confirmée au rangement ; reste : quantité voulue à l'AJOUT en liste |
| N4 courses multi-lieux | validé, amendé | partiel | amendement à couvrir : voir/cocher les autres listes |
| N5 foyer | validé | couvert | test manuel M4 à dérouler |
| N6 rangements + déplacements | fusionné par Olivier 06/07, amendé 27/07 (déplacement depuis la ligne du stock, série d'ajouts au même endroit — à valider) | **couvert, testé** (06/07, complété 27/07) | déplacement unitaire et par produits cochés, regroupement des doublons, renommage, fusion (2 touches) — panneau « Gérer » de l'onglet Inventaire ; depuis le 27/07 (commentaires 2) : « Déplacer » par ligne d'emplacement dans le détail ▸ du Stock, et emplacement retenu d'un ajout à l'autre dans la barre d'ajout |
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
| NP6 inventaire interrompu | validé, amendé 27/07 (pause volontaire et reprise — à valider) | couvert, testé (complété 27/07) | pause explicite « Mettre en pause » + bandeau « Reprendre » (commentaires 2 du 27/07) ; démarrer un autre inventaire pendant une pause = confirmation en 2 touches |
| N13 je range mes courses | **proposition 27/07 — à valider** (remplace le flux Q2 « à mettre en stock ») | non couvert (lot 2 du chantier commentaires 3) | saisie/dictée par produit, candidats de la liste (« huile » → huile d'olive/tournesol), nouvel ingrédient sinon, emplacement par défaut = dernier connu, quantité |
| N14 je gère ma liste d'ingrédients | **proposition 27/07 — à valider** | partiel (les gestes existent, les deux portes d'entrée unifiées restent à faire — lot 3) | une seule liste : écran stocks (ensemble) et emplacement d'inventaire (filtrée) ; « visualiser et gérer » un emplacement sans comptage |
| NP8 produit après planning | proposition | non couvert | avec N10 |
| NP9-NP11 (recettes) | propositions | non couverts | étape 4 |
| NP12-NP13 (semaine) | propositions | non couverts | étape 5 |
| NP14 produit imprévu au rangement | proposition 27/07 | non couvert | avec N13 |

NP1 à NP13 : non revus par Olivier lors de sa relecture du 06/07/2026 (il
n'a revu que les nominaux). NP7 : numéro retiré (décision Olivier).

## Reste à faire transverse

- (Migration appliquée le 06/07/2026 au soir — schéma complet conforme,
  import Passard réel effectué ; date d'inventaire à constater au prochain
  inventaire réel.)
- Amendement N4 (autres listes) et N3 (quantités) : prochain lot courses.
- (Migration `recipe_ingredients` + `recipes.steps` appliquée le 07/07/2026
  au matin — check:schema 11/11, remplissage réel des 82 fiches fait, M13
  déroulé. Au passage : doublon d'import Passard du 06/07 découvert et
  nettoyé, garde-fou ajouté dans le code + test.)
- Master list par genres livrée le 07/07, complétée le 08/07 (commentaires
  Olivier) : genres en menu déroulant + « Gérer les genres » (table
  ingredient_categories, sourcing par défaut), fiche ingrédient (renommage
  libre avec fusion, sourcing affiné, recettes associées), filtre par genre
  dans la recherche du Stock, sourcing → magasin prérempli des courses.
- Fractions livrées le 08/07 (parseIngredientLine : « ½ », « 1/2 »,
  « 1 ½ » ; qty_raw réaffiché comme saisi ; descriptif après virgule et
  « (facultatif) ») ; la migration du 08/07 répare les lignes « /2 … » des
  fiches Passard ; les autres noms douteux (« Aïe », « eau », « ficelle de
  cuisine ») sortent en SELECT de contrôle à trancher avec Olivier.
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
