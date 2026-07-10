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
| N8 | fractions : « ½ », « 1/2 », « 1 ½ » lus en quantité, saisie réaffichée telle quelle | courses-semaine.test.js |
| N8 | descriptif après une virgule (« beurre, fondu ») et « (facultatif) » | courses-semaine.test.js |
| N6 | genres : création sans doublon, renommage-fusion reclassant les ingrédients, suppression | genres-sourcing.test.js |
| N6 | renommage libre d'un ingrédient : stock et courses renommés, alias, fusion de fiches | genres-sourcing.test.js |
| N3 | sourcing : défaut du genre, affiné par ingrédient, magasin des courses prérempli | genres-sourcing.test.js |
| N7/N10 | rappel « à utiliser » : lots plus vieux que le seuil réglable de l'emplacement | emplacements-dates.test.js |
| N2×N7 | inventaire « à dates » : bilan annoncé, sortie du plus ancien, excédent « sans date », non-trouvé vidé | emplacements-dates.test.js |
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
| M26 | Après migration : photos — ajouter la photo du plat et la page du livre sur une fiche, consigner une réalisation avec photo, supprimer une vignette | vignettes visibles sur la fiche (légende Plat/Page), photo liée à la réalisation, suppression confirmée ; fichiers dans le bucket privé « photos » du foyer |
| M27 | Après migration : wish list — étoiler 2 recettes, filtre ★ + « Par ingrédient : turbot » ; marquer « ! 20 g morilles » dans une fiche | étoile sur les lignes, le filtre réduit aux recettes wish list contenant l'ingrédient ; la fiche affiche « morilles — à commander à l'avance » |
| M28 | Après migration : emplacement daté — cocher « à dates » sur Congélateur 1 (Gérer), + sur un produit, entrer un lot à une date passée, − deux fois | + crée le lot du jour, le détail ▸ liste les lots datés (plus ancien annoté), − sort du plus ancien, le total suit, l'existant apparaît « sans date » |
| M29 | Après migration : catégorie — filtre « Boissons » après import des jus, chercher « jus » | les 9 jus apparaissent (catégorie sur la fiche), le déroulant catégorie filtre, la recherche « boissons » les trouve |
| M30 | Après migration du 08/07 : master list — la déplier, choisir un genre au déroulant, « Gérer les genres » (créer, renommer vers un nom existant, sourcing par défaut, supprimer) | la section Emplacements disparaît tant que la master list est ouverte ; le renommage-fusion reclasse ; la suppression rend « non classés » |
| M31 | Fiche ingrédient : toucher un nom de la master list, renommer « beurre demi-sel » → « beurre salé » | stock et courses renommés, recettes associées listées, fusion en deux touches si le nom existe |
| M32 | Sourcing → courses : genre « Épices » = marché « Marché de Revel », épuiser un produit du genre | la ligne de courses arrive préremplie « Marché de Revel » ; un magasin déjà choisi n'est pas écrasé |
| M33 | Fractions et descriptif : saisir « ½ canard », « 1/2 poulet », « 20 g beurre, fondu (facultatif) » dans une fiche | quantités 0,5 aux calculs, réaffichées comme saisies ; descriptif et « (facultatif) » visibles sur la fiche |
| M34 | iPhone : « Modifier » un événement de la Semaine | le panneau tient dans la largeur (rangées empilées), rien ne déborde |
| M35 | Semaine : bloc « À utiliser » avec un lot daté de plus de 6 mois ; changer le seuil (Inventaire → Gérer) | le lot est listé avec date (année comprise) et emplacement ; le nouveau seuil change la liste |
| M36 | Inventaire d'un emplacement « à dates » : compter un produit sous ses lots, un autre au-dessus | le bilan annonce « − n des lots les plus anciens » et « + n sans date » avant application ; les lots suivent après |
| M37 | Foyer : « Exporter les données (fichier JSON) » | fichier téléchargé complet, date de sauvegarde à jour, le point orange de rappel disparaît |
| M38 | Après migration du 08/07 UNIQUEMENT : Foyer → « Restaurer une sauvegarde » avec l'export du jour ; puis retenter avec un fichier quelconque (non-sauvegarde) | confirmation avec date et contenu, export automatique préalable téléchargé, données identiques après restauration (stock, recettes, semaine) ; le fichier étranger est refusé avec message, rien n'est modifié |
| M39 | Après déploiement de « rapatrier-page » : Recettes → « ▸ Importer une recette depuis une URL » avec une page Marie Claire jamais importée ; relire, enregistrer ; retenter la même URL ; puis une page sans recette (article de journal) | fiche pré-remplie (titre, source, pour N, ingrédients un par ligne, étapes) SANS écriture en base avant « Enregistrer » ; après : source « site » créée ou réutilisée, fiche ouverte dans la liste, ingrédients structurés ; la même URL est refusée avec « Voir la fiche » ; la page sans recette affiche le message d'explication, rien n'est écrit |

## Journal des passages

Dernière entrée en premier :

| Date | Périmètre | Automatisés | Manuels | Notes |
|---|---|---|---|---|
| 10/07/2026 | Import d'une recette par URL (A1 : parseur JSON-LD, panneau d'import à relecture, dédoublonnage URL/titre+source, Edge Function `rapatrier-page` NON déployée) + POC IA locale A2 (Ollama) | 104 verts (8 nouveaux, import-url.test.js), 1 todo (NP4) ; build OK | Passe navigateur partielle sur 5173 : panneau OK, doublon détecté AVANT appel réseau (salade de poulet Marie Claire) avec « Voir la fiche » qui ouvre la fiche (9 ingrédients), URL inconnue → message d'erreur propre, rien d'écrit. M39 (parcours complet) à dérouler APRÈS déploiement de la fonction par Olivier | POC A2 concluant : qwen3-vl:4b-instruct, 33 s/page, fractions intactes — verdict, réglages et pièges dans poc-ollama.md ; renderer dev à nouveau capricieux sur les captures (glitch connu, DOM sain vérifié à l'accessibilité) |
| 09/07/2026 (2) | Migration du 08/07 APPLIQUÉE en session (GO Olivier ; sauvegarde SQL complète préalable, 14 tables en JSON sur OneDrive) + passe navigateur M30-M38 sur la base réelle migrée, app locale 5173 | 96 verts, 1 todo ; check:schema 15/15 | M30 ✓ (Emplacements masqués, genre au déroulant — « canard » → Viandes conservé —, Gérer les genres : créer, sourcing par défaut, fusion par renommage, suppression → non classés, confirmations intégrées sans dialogue natif) ; M31 ✓ (fiche ingrédient, recettes associées, « beurre demi-sel » fusionné dans « beurre salé » en deux touches, conservé) ; M32 ✓ (Épices = marché « Marché de Revel » → « Anis vert » épuisé arrive prérempli et groupé sous MARCHÉ DE REVEL en courses ; sourcing et stock remis après) ; M33 ✓ (« ½ canard »/« 1/2 poulet » → qty 0,5 + qty_raw en base, « , fondu (facultatif) » → note + optional, nom générique « beurre » ; fiche crêpes remise d'origine) ; M34 non redéroulé (la fenêtre pilotée ne descend pas sous 688 px ; écran inchangé depuis la validation du 07/07 à 389 px ; à confirmer sur iPhone) ; M35 ✓ (lot 01/12/2025 → « À utiliser » avec date année comprise + emplacement ; seuil à 12 mois → disparaît ; remis à 6) ; M36 ✓ (bilan « − 1 des lots les plus anciens » + « + 3 "sans date" » + non trouvés → zéro annoncés AVANT application ; appliqué puis état remis, item_lots vide) ; M37 ✓ (fichier 612 Ko complet, date à jour, point orange éteint) ; M38 ✓ (fichier étranger refusé sans dégât ; restauration de l'export du jour : confirmation datée + contenu, « restaurée », 14 comptes identiques en base, app propre au rechargement) | observations : « Entrée » ne valide pas le champ « Nouveau genre » (bouton Ajouter requis) ; « 3 spiruline » tapé puis « Vu » crée un produit « nouveau » — le nombre n'est parsé que sur le chemin vocal ; l'export auto avant restauration n'a pas été observé en pilotage automatisé (2e téléchargement sans geste utilisateur, bloqué par Chrome) — à confirmer en passe humaine ; compter 0 = laisser en « non trouvé » (le − à 0 renvoie la ligne en à-vérifier) |
| 09/07/2026 | Restauration des sauvegardes (import du JSON, décisions Olivier : remplacement complet du foyer, export auto + confirmation avant d'écraser) | 96 verts, 1 todo (NP4) ; build OK | M38 à dérouler APRÈS la migration du 08/07 (sur la base réelle non migrée, la restauration s'interromprait sur les tables manquantes — volontairement non testée en réel avant) | restauration rejouable en cas d'échec réseau (suppressions d'abord) ; household_id réécrit vers le foyer courant ; foyer (nom, membres) et fichiers photos du bucket non touchés |
| 07/07/2026 soir (5) | Horodatage de version (`__BUILD__` affiché dans Foyer et compte) + republication (20:35) du correctif responsive ; `mettre-en-ligne.cmd` corrigé (`--scope` requis en non-interactif) | 76 verts | prod vérifiée par curl : JS avec menu + « Version publiée le 7 juil. 2026, 20:35 » servis par l'alias ; EN ATTENTE : confirmation d'Olivier sur iPhone (son appareil montrait l'ancienne version = cache du service worker ; procédure de rafraîchissement iOS ajoutée à exploitation.md) | leçon : toujours pouvoir LIRE la version qui tourne sur un appareil |
| 07/07/2026 soir (4) | Responsive iPhone (remarques Olivier, 2 itérations) : v1 onglets icône+libellé, remplacée par la v2 demandée — **onglets collapsés en menu déroulant** ≤ 560 px (section courante + chevron, « Foyer et compte » dans le menu) et **filtres de recettes dans un dépliant** « ▸ Filtres (n) » refermable (recherche plein texte toujours visible) ; `min-width:0` (onglets, #search), `flex-wrap` manage-row/toolbar, verrou `overflow-x:hidden` | 76 verts | fenêtre réelle réduite à 389 px : balayage de TOUS les onglets (panneau Filtres ouvert compris) → scrollWidth = viewport, zéro élément débordant (hors chips qui défilent dans leur bloc, voulu) ; menu et dépliant contrôlés visuellement ; dépassement résiduel trouvé et corrigé (#search sans min-width poussait le tri A→Z sous la barre de défilement) ; à confirmer par Olivier sur iPhone après republication | racine : `flex:1`/`flex:0` sans `min-width:0` = éléments incompressibles sous la largeur de leur contenu |
| 07/07/2026 soir (3) | Mise en ligne (étape 7, avancée à la demande d'Olivier) : Vercel « garde-manger », publication de `dist` sans build distant, `mettre-en-ligne.cmd`, Supabase Site URL production + redirect localhost:5173 | (aucun code applicatif modifié) | Vérifié en ligne sur https://garde-manger-chi.vercel.app : page de connexion, SW enregistré (scope racine), manifest standalone, manifest/sw en 200, 0 erreur console ; login/deploy exécutés PAR Olivier (`vercel login`, `vercel deploy --prod`) ; M5 complet et M6 restent à dérouler sur iPhone/iPad (guide mise-en-ligne.md) | Site URL Supabase était le défaut localhost:3000 ; alias stable garde-manger-chi.vercel.app ; garde-fou : le déploiement prod exige la main d'Olivier |
| 07/07/2026 soir (2) | Master list : catégorisation en masse (demande Olivier) + correction answerMerge (fusion de deux noms ayant chacun leur fiche → absorption, la catégorie survit) | 76 verts, 1 todo (NP4) | 491 ingrédients classés via l'app elle-même (champs de la master list pilotés, chemin setIngredientCategory) : Légumes 137, Épices 107, Épicerie 101, Herbes 54, Fruits 34, Crèmerie 29, P&FdM 13, Boissons 11, Viandes 7 (dont « /2 canard », hors table mais exact) ; « ail → Épicerie » (choix Olivier) préservé ; AUDIT après rechargement complet : 0 écart avec la table, 7 non classés = artefacts volontaires (« /2 … », « Aïe », « eau », « ficelle de cuisine ») | leçon : les setTimeout d'un onglet non focalisé sont throttlés (~1 réveil/min) — piloter le DOM en boucle synchrone ; artefacts « /2 » à résorber avec la correction du parseur de fractions |
| 07/07/2026 soir | Catégorie de recette (« Boissons », 9 jus Evernote), wish list (N11 : ★ + « ! » difficile à sourcer), photos (N8 incr. 2 : plat/page, bucket privé, compression), emplacements datés (N7 incr. 1 : lots, sortie du plus ancien), preview des douteuses Evernote, SQL pays validé | 75 verts, 1 todo (NP4) ; build OK ; check:schema 14/14 | Migration + pays + import appliqués EN SESSION (GO explicite d'Olivier) via le SQL Editor : 127 recettes (118 plats + 9 Boissons), pays France 110/Inde 2/Antilles 1. M29 déroulé (filtre Boissons → 9 jus, fiche dattes complète) ; M27 déroulé (★ sur fiche et liste, filtre ★ → 1) ; M28 déroulé sur « Autre » (case à dates, « 1 sans date », lot 01/05 entré puis sorti, état remis) ; M26 déroulé (image 2000×1500 injectée → 1600×1200, 19,7 Ko, URL signée OK, vignette « Plat », suppression) | incident presse-papier ÉVITÉ une 2e fois (texte d'Olivier collé à la place du SQL → erreur de syntaxe sans dégât ; re-copie immédiate avant chaque collage désormais) ; import via la fiche : « épinards ≈ épinard » proposé au rapprochement (laissé à Olivier) ; connecteur Google Calendar à réautoriser (créneaux marchés non lus) ; captures d'écran dev parfois figées (renderer), sans impact app |
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
