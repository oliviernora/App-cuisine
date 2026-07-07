# Garde-manger — cahier de tests

Deux étages : les tests automatisés (rejoués avant toute livraison via
`npm test` dans `app/`) et les tests manuels (déroulés sur l'application
réelle quand le périmètre concerné change). Chaque test porte le numéro du
cas d'utilisation qu'il couvre (docs/utilisateur/cas-utilisation.md).

## Tests automatisés

Fichiers : `app/tests/integration/`.

| Cas | Test | Fichier |
|---|---|---|
| N1 | finir le dernier pot met le produit en courses (auto) | stock-courses.test.js |
| N1 | acheter puis ranger remet le stock et vide la liste | stock-courses.test.js |
| N1 | remonter le stock à la main retire l'entrée automatique | stock-courses.test.js |
| N3 | commander un produit non épuisé le met en courses (réserve) | stock-courses.test.js |
| N3 | acheter la réserve porte le stock à deux pots | stock-courses.test.js |
| N3 | un second appui annule une commande de réserve non cochée | stock-courses.test.js |
| NP2 | une ligne non cochée survit au rangement des achats | stock-courses.test.js |
| NP3 | décocher ne change rien d'autre, ni en liste ni au stock | stock-courses.test.js |
| NP5 | les données sont mises en cache et relisibles hors ligne | hors-ligne.test.js |
| NP5 | sans cache, rien à servir (pas de fausse donnée) | hors-ligne.test.js |
| NP1 | la suppression tient : produit « manquant », pas de retour auto | stock-courses.test.js |
| NP1 | le panier remet un produit « manquant » en liste | stock-courses.test.js |
| NP1 | le retour automatique se réarme quand le stock remonte puis s'épuise | stock-courses.test.js |
| NP1 | le panier retire aussi une entrée automatique non cochée | stock-courses.test.js |
| N2 | déroulé complet : vus, cumul, création, non-trouvés à zéro, date, courses | inventaire.test.js |
| N2 | correction d'erreur : redescendre un vu à zéro le remet à vérifier | inventaire.test.js |
| N2 | un produit vu épuisé retrouve son retour automatique | inventaire.test.js |
| NP6 | l'inventaire interrompu se retrouve au retour | inventaire.test.js |
| NP6 | abandonner ne laisse aucune écriture | inventaire.test.js |
| N6 | déplacer un produit : localisation seule change, tout est conservé | rangements.test.js |
| N6 | un produit épuisé déplacé garde son « à racheter » | rangements.test.js |
| N6 | déplacement vers un doublon : les pots se regroupent en une ligne | rangements.test.js |
| N6 | regroupement sur un épuisé : l'entrée de courses auto se résout | rangements.test.js |
| N6 | déplacement en lot (produits cochés) | rangements.test.js |
| N6 | renommer : produits et date d'inventaire suivent | rangements.test.js |
| N6 | fusionner : produits réunis, doublons regroupés, une seule ligne d'emplacement | rangements.test.js |
| N8 | import Passard : 105 recettes, 1 source, 91 URLs, 5 cuisinées sans date | recettes.test.js |
| N8 | consigner une réalisation : date, commentaire, dernière date à jour | recettes.test.js |
| N8 | plusieurs réalisations : la plus récente fait foi | recettes.test.js |
| N8 | « date non notée » puis date réelle : la date prend le dessus | recettes.test.js |
| N10 | poser un événement : jour, type, convives, contraintes | semaine.test.js |
| N10 | associer des recettes, sans doublon | semaine.test.js |
| N10 | retirer une recette sans toucher les autres | semaine.test.js |
| N10 | consigner : la réalisation porte la date de l'événement | semaine.test.js |
| N10 | supprimer un événement retire ses associations | semaine.test.js |
| NP4 | *à écrire — décision d'usage en attente* | (todo) |

Les tests tournent sur un simulateur de base de données en mémoire
(`tests/helpers/fake-supabase.js`) : ils valident les règles métier et leur
persistance, pas l'interface.

## Contrôle du schéma réel

`npm run check:schema` (dans `app/`) vérifie que la vraie base contient bien
toutes les tables et colonnes de `supabase/schema.sql`. Obligatoire avant
toute livraison : la suite de tests tourne sur un simulateur et ne voit pas
une migration manquante.

## Tests manuels

À dérouler sur l'application réelle (navigateur, et appareil quand précisé).

| # | Scénario | Attendu |
|---|---|---|
| M1 | Parcours N1 complet à l'écran : − sur un produit à 1 pot, onglet Courses, cocher, Ranger | ligne orange puis retour à la normale, compteurs justes, la ligne ne bouge pas de sa place |
| M2 | Recherche « epice » sans accent, filtre par chip, 160 produits | résultats instantanés, tri alphabétique stable |
| M3 | Voix : « deux garam masala » au micro | nom et quantité préremplis, confirmation manuelle |
| M4 | Deux navigateurs côte à côte (deux comptes du foyer) | modification visible en face en ~1 s |
| M5 | Hors ligne : couper le réseau, recharger | application et données visibles, bandeau, commandes estompées ; retour réseau = reprise |
| M6 | PWA : installer sur l'écran d'accueil (iPhone/iPad — après mise en ligne) | icône panier, plein écran, thème correct |
| M7 | Thèmes : basculer le réglage clair/sombre de l'appareil | les deux thèmes lisibles, couleurs conformes au design guide |
| M8 | Création de compte + rejoindre le foyer avec le code | arrivée directe sur les données partagées |
| M9 | Basculer le tri Emplacement / A→Z, avec et sans recherche | A→Z : liste unique alphabétique avec le lieu en gris ; retour Emplacement : groupes habituels |
| M10 | Inventaire réel d'un emplacement à la voix (caisse en vrac) | déclaration fluide au micro, bilan juste, stock exact à la fin |
| M11 | Après migration : import Passard réel, recherche, consigner une réalisation | 105 recettes visibles, dates cohérentes, alerte orange si < 1 an |
| M12 | Après migration : planifier une semaine réelle (2-3 événements, recettes, consigner) | semaine lisible d'un coup d'œil, réalisations aux bonnes dates |
| M13 | Ingrédients d'une recette + bloc « Courses de la semaine » : événement du jour, recette associée, ajouter les manquants | ingrédients listés avec état en stock / déjà en liste / à acheter ; les manquants passent en liste de courses sans doublon |
| M14 | Master list : répondre « Oui » à une proposition d'« Ingrédients à rapprocher » (Inventaire) | la proposition disparaît pour toujours, l'alias est en base, le bloc semaine reconnaît désormais les deux orthographes |
| M15 | Quantités : recette « pour 4 » avec quantités, événement à 8 convives, % puis correction à la main, ajouter aux courses | quantités doublées à l'écran, % recalcule en direct, la correction manuelle prime, la liste de courses porte la quantité corrigée |
| M16 | Filtre par source : chip « Marie Claire », ouvrir une fiche | seules les recettes de la source s'affichent, fiche complète (source, lien du site, « pour N personnes », ingrédients) |
| M17 | Courses automatiques : ajouter/retirer une recette d'un événement à venir | les lignes « semaine » apparaissent/disparaissent seules dans l'onglet Courses, quantités à jour, pas de doublon avec le réappro |
| M18 | Ajustement par recette : ouvrir la recette dans l'événement, % puis correction d'une quantité | quantités recalculées en direct pour CET événement seulement, la liste de courses suit |
| M19 | Bascule « je l'ai » sur une ligne semaine | ligne barrée, badge décompté, mémorisé ; recherche « safran » dans Recettes → bouillabaisse trouvée par ingrédient |
| M20 | Liste au repos : ouvrir Courses et attendre 10 s sans toucher | AUCUNE requête réseau, aucun clignotement, compteurs immobiles |
| M21 | Semaine : « Modifier » un événement (date), sections À venir/Passés, « Fait » sur un passé | la date change et les courses se recalculent ; « Oui, faite » consigne à la date de l'événement |
| M22 | Master list (Inventaire) : classer un ingrédient dans une catégorie | il passe dans sa section, les non classés restent en tête, la catégorie survit au rechargement |
| M23 | Inventaire en pause : démarrer un inventaire, changer d'onglet, revenir | les onglets restent visibles, l'inventaire reprend exactement où il en était |
| M24 | Ambiguïté vocale : dicter « carvi » avec carvi / carvi noir / carvi noir entier dans l'emplacement | un menu de choix apparaît (produits candidats + « nouveau produit »), rien n'est déclaré sans choix |
| M25 | Filtres recettes : source en déroulant + « Par ingrédient : safran » | la liste se réduit aux recettes contenant l'ingrédient ; suggestions au fil de la frappe |

## Journal des passages

Dernière entrée en premier :

| Date | Périmètre | Automatisés | Manuels | Notes |
|---|---|---|---|---|
| 07/07/2026 | Remarques en vrac Olivier : inventaire pausable (onglets visibles), menu de choix sur ambiguïté vocale, dates en toutes lettres FR, emplacement en déroulant, source en déroulant + filtre par ingrédient (Recettes et Semaine) | 63 verts, 1 todo (NP4) | M25 déroulé en réel (« safran » → 3 recettes) ; stabilité DOM prouvée : 0 mutation pendant scroll + 8 s sur Courses (le « clignotement » restant = fenêtre d'Olivier sur l'ancien code → Ctrl+F5 demandé) | l'écran de gestion des ingrédients demandé = la master list livrée plus tôt (Inventaire) |
| 07/07/2026 | Remarques Olivier : boucle de synchro CORRIGÉE (racine : quantités numeric renvoyées en texte par Postgres → comparaison texte/nombre toujours fausse → réécritures en boucle → clignotements) + À venir/Passés + Modifier + Fait + recherche avancée + master list par catégories | 63 verts, 1 todo (NP4) | M20 prouvé (0 requête en 10 s au repos), M21 partiel (Modifier visible, pas d'événement passé réel à tester), M22 déroulé (« ail » → Épicerie) | leçons : comparer les quantités numériquement (sameQty) ; verrou de réentrance sur la synchro ; en dev, une édition du store recharge la page (sinon instances zombies HMR) ; le journal réseau de l'extension n'est pas horodaté — vérifier l'activité dans la base, pas dans le journal | (somme réappro+repas), déroulant, ajustement par recette/événement, « je l'ai », recherche multicritère, sources gérées, pays | 60 verts, 1 todo (NP4) | check:schema 12/12 (5 colonnes ajoutées) ; M17-M19 déroulés en réel sur les vrais événements d'Olivier (Invitation 7 août ×0,5 et 7 sept ×1) : requantification automatique constatée (« 1,5 poulet »), 150 % → recalcul direct, bascule « je l'ai » OK, « safran » → 3 recettes | 9 lignes créées par l'ancien bouton converties en lignes « semaine » (SQL one-shot) ; démarrage bloqué une fois par une coupure réseau transitoire vers Supabase (diagnostiquée, hors app) |
| 07/07/2026 | Import Evernote — lot 1 (11 fiches) | 56 verts, 1 todo (NP4) | comptes par source vérifiés en base après import : dédoublonnage par URL confirmé (salade de poulet non dupliquée), 10 nouvelles recettes réparties sur 7 sources | incident évité : le presse-papier contenait un vieux SQL non idempotent au moment du collage — détecté avant exécution, bon fichier recollé ; import.sql relit toujours depuis le fichier |
| 07/07/2026 | 3 recettes Marie Claire + filtre par source (N9) | 56 verts, 1 todo (NP4) | M16 déroulé en réel : chips Toutes/Alain Passard/Marie Claire, filtre à 3 recettes, fiche lotte complète (pour 6 personnes, 10 ingrédients, lien marieclaire.fr) | recettes capturées via le navigateur (texte condensé, jamais verbatim) et insérées en base avec réalisation « date non notée » |
| 07/07/2026 | Quantités de la semaine (N10, incrément quantités) | 56 verts, 1 todo (NP4) | check:schema 12/12 (14 colonnes vérifiées) ; M15 déroulé en réel sur la tatin d'endives (pour 4 → 8 convives = 8 endives, 150 % = 12, correction à 10 → « 10 endives » en courses) ; fiche et données remises à l'identique après le test | constaté en cours de test : les recettes des événements du 06/07 ont été réorganisées en base (Dîner maison 1→0, Invitation 2→3) sans action de la session — vraisemblablement un autre appareil du foyer ; signalé à Olivier |
| 07/07/2026 | Master list (référentiel d'ingrédients, incrément 1) | 48 verts, 1 todo (NP4) | check:schema 12/12 OK ; M14 déroulé en réel (19 doublons détectés dans les vraies données, « carottes ≈ carotte » confirmé → alias en base, proposition disparue) ; 18 propositions laissées à Olivier | décisions Olivier : master list depuis ses données, suggestion à confirmer, jamais de fusion silencieuse |
| 07/07/2026 matin | Migration appliquée + remplissage réel + M13 | 43 verts, 1 todo (NP4) | check:schema 11/11 OK ; remplissage réel 82/82 fiches (682 ingrédients en base) ; M13 déroulé (événement du jour + tatin d'endives : 6 ingrédients « à acheter » → « déjà en liste », liste de courses juste, nettoyage propre) | doublon d'import découvert (import Passard lancé 2× le 06/07, 210 recettes) : doublon de 22h38 supprimé avec l'accord d'Olivier (aucune donnée saisie dessus), garde-fou ajouté dans `importPassard()` + test ; cause : onglet resté sur l'état « aucune recette » |
| 07/07/2026 | Fiches Passard complètes (82/82 extraites et fusionnées) | 42 verts, 1 todo (NP4) | remplissage réel toujours bloqué par la migration `recipe_ingredients` (dashboard Supabase indisponible sur toutes les tentatives du jour) ; M13 dès que possible | |
| 07/07/2026 | Fiches Passard (extraction 40/82 + remplissage) | 42 verts, 1 todo (NP4) | remplissage réel bloqué par la migration `recipe_ingredients` (dashboard Supabase indisponible malgré plusieurs stratégies d'onglets) ; M13 à dérouler après | pipeline rejouable : make-batches → extraction par lots → merge-fiches |
| 06/07/2026 soir | Ingrédients + recette (N8), Courses de la semaine (N10) | 40 verts, 1 todo (NP4) | à dérouler après la petite migration (M13 : saisir les ingrédients d'une recette, vérifier le bloc Courses de la semaine, ajouter les manquants) | migration `recipe_ingredients` en attente (dashboard instable) ; « Consigner » renommé « Marquer faite » |
| 06/07/2026 soir | Migration appliquée + M11 + M12 | 35 verts, 1 todo (NP4) | check:schema 10/10 OK ; import réel 105 recettes ; M11 (recherche « asperges » : 5 dont 2 cuisinées, fiche avec lien et formulaire) ; M12 (événement test + recette associée + suppression propre) | onglet Chrome longuement ouvert gelé à nouveau → fermé ; consigne exploitation.md confirmée ; date d'inventaire à constater au prochain inventaire réel (M10) |

| Date | Périmètre | Automatisés | Manuels | Notes |
|---|---|---|---|---|
| 06/07/2026 | Socle + PWA/hors ligne | 10 verts, 2 todo (NP1, NP4) | M1, M2 (session Chrome d'Olivier), M5 partiel (bandeau via événement simulé), SW+manifest vérifiés | M4, M6, M7, M8 à dérouler ; M5 complet (vrai mode avion) à faire sur appareil |
| 06/07/2026 | NP1 (panier/manquant) + tri A→Z | 14 verts, 1 todo (NP4) | Parcours NP1 complet sur l'app réelle (suppression → icône manquant → re-ajout), sélecteur de tri présent | M9 visuel à confirmer par Olivier |
| 06/07/2026 | Mode inventaire (N2, NP6) | 19 verts, 1 todo (NP4) | Parcours réel : démarrage sur « Vegan », déclaration au toucher, bilan, abandon deux touches sans écriture | M10 (voix, caisse réelle) à faire par Olivier ; migration `locations` en attente (incident dashboard Supabase) |
| 06/07/2026 | Onglet Inventaire + panneau Foyer | 19 verts, 1 todo (NP4) | Vérifié sur l'app réelle : 3 onglets, écrans Stock/Courses épurés, liste des emplacements avec dates, panneau Foyer (code + déconnexion) | migration `locations` toujours en attente |
| 06/07/2026 | Signalement d'Olivier : date d'inventaire inchangée | 19 verts | `check:schema` créé et exécuté : `locations` MANQUANT (404) confirmé — cause = migration bloquée par l'incident Supabase | correctifs : contrôle de schéma obligatoire avant livraison + bandeau dans l'app quand la date ne peut pas être enregistrée ; migration à appliquer dès le retour du dashboard |
| 06/07/2026 | Semaine incrément 1 (événements, recettes associées) | 35 verts, 1 todo (NP4) | Onglet vérifié (bandeau migration + formulaire) ; parcours réel complet à rejouer après migration (M12) | |
| 06/07/2026 | Recettes incrément 1 (onglet, import Passard, réalisations) | 30 verts, 1 todo (NP4) | non testable sur la vraie base : migration bloquée (incident Supabase) — bandeau explicite dans l'onglet ; à rejouer après migration : import réel + M11 | fichier prêt : supabase/migration-en-attente.sql |
| 06/07/2026 | N6 rangements (panneau « Gérer ») | 26 verts, 1 todo (NP4) | Parcours réel sur onglet frais : déplacement Huile de coco Vegan→Placard puis retour, panneau, messages | Gel constaté sur l'onglet de longue durée saturé de mises à jour à chaud (HMR) — non reproduit sur onglet frais, code identique ; consigne ajoutée dans exploitation.md ; migration `locations` toujours en attente |
