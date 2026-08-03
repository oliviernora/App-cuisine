# Plan d'action — App cuisine

## Reprise rapide (passation du 07/07/2026 au soir — à lire en premier)

### Prochain chantier : commentaires 4 (docs/utilisateur/commentaires 4.md)
Olivier a déposé ses commentaires après essai réel (03/08) — à traiter
APRÈS la migration/publication du chantier livres. En résumé :
(1) modifier le nom d'un ingrédient en cours d'inventaire (dictée
écorchée) ; (2) BUG renommages d'emplacements en chaîne/conflit de noms
(cas concret « soin 1 »/« soin 2 » permutés — tout a merdé) ; (3) BUG
probable : ingrédient existant dans une AUTRE résidence invisible à la
déclaration d'inventaire (« Cumin moulu » à Montalivet — la saisie
partielle « Cum Moul » marche, le nom exact non) ; (4) plusieurs
inventaires en pause en parallèle (déplacements d'objets) ; (5) rouvrir
un inventaire / y ajouter des ingrédients venus d'un autre ; (6) écran
de gestion DÉDIÉ pour livres et URL (l'approche filtres ne tiendra pas
240 livres) : naviguer, recettes de la source, visiter le site, scanner
une recette, coller une URL au retour. Méthode : lot 0 (cas
d'utilisation + questions) puis GO.

### Chantier livres non trouvés (03/08/2026) — LIVRÉ le 03/08 au soir, MIGRATION EN ATTENTE
Retour terrain d'Olivier (03/08, tests M68-M69 iPhone) : le scan caméra
marche (« plus compliqué que d'habitude » — à surveiller), mais **2 livres
sur 3 non trouvés en ligne** (BookBuddy trouvait les trois). Idée
d'Olivier : quand un ISBN n'est pas trouvé, le **stocker**, demander des
**photos** (couverture, dos), et **traiter plus tard** — retrouver le
livre ou reconstruire la fiche par OCR.
**Décisions d'Olivier (03/08, questions/réponses)** : (a) BnF ajoutée en
3e source de recherche (API publique sans clé, forte sur l'édition
française) ; (b) traitement différé = nouvelle tentative web PUIS OCR
local (dans le navigateur, rien envoyé à un service externe) qui
pré-remplit une fiche À RELIRE ; (c) la photo de couverture sert de
couverture si le web n'en fournit pas ; (d) photos demandées = couverture
+ dos, aucune obligatoire.
- **Lot 0 FAIT (03/08)** : NP15 amendé (cas-utilisation.md), suivi à
  jour. **GO d'Olivier reçu le 03/08.**
- **Lot 1 FAIT (03/08)** : BnF en 3e repli dans `livre-isbn.js` + tests
  (173 verts, build OK, schéma 17/17, parcours réel sur 5173 : fiche
  Cuisine créole pré-remplie par la BnF). CAUSE RACINE PROUVÉE sur les
  2 ISBN d'Olivier : Google sans clé en 429 (quota partagé) + Open
  Library muet sur le français ; BnF trouve 9782016279700 ;
  9782317013522 (Mango) absent des 3 bases → file photos. **RESTE :
  republier, puis M70 sur iPhone.**
**RÉVISION du 03/08 au soir (GO d'Olivier)** : la **recherche web de
Claude** remplace les photos obligatoires et l'OCR (prouvé en session :
l'ISBN Mango introuvable partout = « Pâtisseries marocaines », Nadia
Paprikas, Mango 2018, trouvé par simple recherche web, couverture chez
les libraires). Photos → simple secours pour les livres absents du web.
- **Lot 2 FAIT (03/08 soir, app)** : table `pending_books` (migration
  `supabase/migration-2026-08-03-livres-a-completer.sql`) ; mise de côté
  en un geste (auto en multi-scan), file « Livres à compléter » dans
  Gérer les sources (📷 photo de secours, ×). 175 tests verts, build OK,
  refus propre vérifié sur 5173 avant migration.
- **Lot 3 FAIT (03/08 soir, MCP)** : outils `livres_a_completer` et
  `completer_source` (complément sans écrasement, couverture rapatriée,
  journal). Procédure : Olivier demande « complète ma bibliothèque ».
- **RESTE : (1) migration `pending_books` (SQL Editor, main d'Olivier)
  puis check:schema 18/18 ; (2) redémarrer le serveur MCP ; (3)
  republier ; (4) M70-M72 (iPhone + première vraie complétion).**

### Chantier bibliothèque par scan ISBN — LIVRÉ le 02/08/2026, MIGRATION EN ATTENTE
Demande d'Olivier du 02/08 : scanner le code-barres (ISBN) d'un livre et
retrouver sa référence sur le web, photo de couverture comprise, pour
documenter vite la base des 240 livres. **Décisions d'Olivier (02/08)** :
(a) couverture COPIÉE dans le stockage privé du foyer ; (b) bouton dans le
sous-écran Sources, PLUS une option « multi-scan » : scan à la chaîne, les
livres en cours s'affichent en bas de l'écran, relecture puis
enregistrement groupé.
**LIVRÉ le 02/08** (détail au cahier de tests, passage du 02/08) :
- Cas N15 (amendé multi-scan) + NP15 rédigés, N8 amendé, docs à jour
  (fonctionnalités, design guide, suivi, cahier).
- `livre-isbn.js` : validation ISBN 13/10 (clé vérifiée), recherche
  Google Books puis Open Library (sans clé). `ScanLivre.svelte` : caméra
  ZXing EAN-13 chargée À LA DEMANDE (bundle démarrage inchangé ~430 Ko),
  saisie manuelle en secours, fiche à relire avant enregistrement,
  multi-scan (pile en bas, ✎/×, enregistrement groupé). Store :
  saveBookSource (même titre déjà là = fiche complétée, champs vides
  seulement — à confirmer par Olivier), couverture compressée dans le
  bucket `photos` (`<foyer>/couvertures/`), vignettes + auteur + année
  dans Gérer les sources.
- État : 172 tests verts (10 nouveaux), build OK, parcours réel sur 5173
  (fiche pré-remplie par Google Books, refus PROPRE d'écrire sans
  migration — bandeau, rien de perdu).
**MIGRATION APPLIQUÉE le 02/08 en session** (GO d'Olivier, SQL Editor
piloté par l'API Monaco, « Success », check:schema 17/17) et
**enregistrement réel vérifié** : un livre de test (Salt Fat Acid Heat,
ISBN 9781476753836) ajouté sur 5173 — fiche Google Books + couverture
dans le bucket, vignette affichée dans Gérer les sources.
**COMMITS faits le 02/08** (1c83351 passation 28/07, 357b723 chantier
scan, + celui-ci).
**PROD PUBLIÉE le 02/08 en session** (Olivier présent — `vercel deploy
--prod`, bundle `index-C-psI-Sd.js` vérifié sur l'alias).
**LIVRE DE TEST NETTOYÉ le 02/08** (ligne `sources` par SQL ; le fichier
de couverture par l'interface Storage — depuis 2026, Supabase INTERDIT le
`delete from storage.objects` en SQL : « Use the Storage API instead »).
**RESTE : (1) recharger l'app sur chaque appareil** (service worker) ;
**(2) M68-M69 sur iPhone** (scan caméra réel).

### Chantier commentaires 3 — LIVRÉ, MIGRÉ ET PUBLIÉ le 28/07/2026
GO d'Olivier le 28/07 (avec un ajout NOUVEAU au cas N3 : gestion des
lieux d'achat). Les 5 lots sont LIVRÉS (code + tests + parcours réels,
détail au cahier de tests, passage du 28/07) :
1. Courses façon To Do (à acheter par magasin / « Achetés — à ranger » en
   bas, décoche = remonte).
2. Écran « Ranger les courses » (N13, remplace « À mettre en stock » de
   l'Inventaire) : saisie/dictée → candidats → quantité + emplacement
   (défaut = dernier connu), hors liste = NP14, ligne semaine → « je
   l'ai ».
3. Liste d'ingrédients unifiée (N14) : toucher un emplacement de
   l'Inventaire ouvre le Stock filtré ; bouton « Épuisé » en un geste.
4. Lieux d'achat (N3.4) : table `stores` (physique/Internet, URL,
   adresse, commentaire), renommage en cascade, achetables par lieu,
   reprise des lieux existants — sous-écran depuis les Courses.
5. Écran d'accueil : 5 familles en tuiles + raccourcis, premier onglet.
État : 162 tests verts, build OK, parcours réels sur 5173.
**MIGRATION `stores` APPLIQUÉE le 28/07 en session** (GO explicite
d'Olivier, SQL Editor piloté — injection par l'API Monaco, le Ctrl+V
simulé ne prend pas —, « Success », check:schema 17/17) et **PROD
PUBLIÉE le 28/07** (bundle `index-DKdorupe.js` vérifié en ligne, accueil
affiché SANS bandeau). Au passage : la 1re ligne de
`app/mettre-en-ligne.cmd` était corrompue par une vieille saisie « ! »
(réparée, `@echo off` restauré).
**RESTE : (1) recharger l'app une fois sur chaque appareil (service
worker) ; (2) M63-M67 sur iPhone (cahier) — M66 = lieux d'achat en réel,
avec « Reprendre ces lieux » au premier passage ; (3) COMMIT à faire :
les modifications des sessions des 27-28/07 (chantiers commentaires 2 et
3, ménage Passard, archive/) ne sont pas commitées.**

### Chantier commentaires 3 (27/07/2026 au soir) : familles de cas + refonte courses — lot 0 (doc)
Les commentaires 3 (docs/utilisateur/commentaires 3.md) demandent :
courses façon « To Do » (à acheter en haut / achetés en bas, décoche),
écran « Ranger les courses » (saisie/dictée → candidats de la liste →
emplacement par défaut = dernier connu + quantité), liste d'ingrédients
unique à deux portes (stocks / emplacement d'inventaire), écran d'accueil
à 5 familles, et cas d'utilisation restructurés en familles.
Décisions d'Olivier (questions du 27/07 au soir) : accueil EN PLUS des
onglets ; « À acheter » groupé par magasin ; le rangement REMPLACE
« À mettre en stock » (Q2) ; « marquer utilisé ou non » = j'en ai
encore / c'est épuisé.
- **Lot 0 FAIT (27/07 au soir)** : cas-utilisation.md restructuré en
  5 familles + transverse ; nouveaux cas N13 (ranger les courses),
  N14 (gérer la liste d'ingrédients), NP14 ; N1/N3/N4/N10 amendés ;
  suivi à jour. **VALIDATION D'OLIVIER ATTENDUE avant tout code.**
- Lot 1 : courses façon To Do (sections, décoche). Lot 2 : écran
  « Ranger les courses » (N13). Lot 3 : liste d'ingrédients unifiée
  (N14). Lot 4 : écran d'accueil par familles.

### Chantier du 27/07/2026 : commentaires 2 — LIVRÉ ET PUBLIÉ le 27/07
Les 8 remarques de docs/utilisateur/Archive/commentaires-2-2026-07-27.md
(annoté puis archivé) sont traitées en
4 lots (décisions d'Olivier du 27/07 : emplacement mémorisé à l'ajout ;
rapprochement vocal + alias mémorisés ; motif lignes compactes sur
Stock + Courses) :
1. **Barre du bas** : padding calé sur la hauteur réelle de la barre
   d'ajout (action `addbarHeight` → `--barre`) — le bas de page est
   toujours atteignable (remarque 8).
2. **Dictée** : garde-fou « 4 épices » (jamais découpé si l'ingrédient est
   connu, chiffres/traits d'union confondus), rapprochement des dictées
   écorchées (nuoc mam, ras el hanout) contre la master list (Stock :
   « Entendu → » ; Inventaire : menu élargi « connu ailleurs ») ;
   correction confirmée = alias mémorisé. Parseur vocal dédupliqué
   (`parseDictation` au store).
3. **Ajout/inventaire** : emplacement du « ⋯ » retenu d'un ajout à l'autre
   (rappel à côté du bouton) ; « Déplacer » par ligne d'emplacement dans le
   détail ▸ ; saisie directe de la quantité à l'inventaire (toucher le
   nombre) ; bouton « Mettre en pause » + bandeau « Reprendre » (démarrer
   ailleurs pendant une pause = confirmation 2 touches).
4. **Lignes compactes à deux niveaux** (Stock + Courses) : nom + nombre +
   emplacement ; toucher → nom complet + seconde ligne de boutons. Motif
   appliqué à toutes les largeurs (à confirmer par Olivier sur PC).
État : 156 tests verts (12 nouveaux dont dictee.test.js), build OK,
check:schema 16/16 (aucune migration), parcours réels vérifiés sur 5173
(voir cahier de tests, passage du 27/07). **PROD PUBLIÉE le 27/07 à 18h25
par Olivier** (bundle vérifié en ligne). Cas d'utilisation amendés (N2, N6,
NP6 — à faire valider par Olivier) et fichiers de commentaires traités
archivés dans docs/utilisateur/Archive/ (« commentaires 3.md » vide, prêt
pour les prochaines remarques). **Reste : recharger l'app sur chaque
appareil, puis M59-M62 sur iPhone** (M62 = dictée réelle au micro).
M56-M58 du 25/07 et M47/M48-M50/M55 toujours en attente aussi.
**Ménage du 27/07 au soir** (décisions Olivier) : amorçage Passard retiré
de l'app (importPassard/fillPassardDetails + boutons — mission accomplie),
code et pipeline archivés dans `archive/` (avec le POC de l'étape 0),
importPassard conservé en fixture de tests (`tests/helpers/passard.js`) ;
153 tests verts, bundle allégé (precache 511 → 416 Ko). Ce ménage partira
en prod à la prochaine republication.

### Chantier du 25/07/2026 : commentaires UX iPhone — LIVRÉ, À REPUBLIER
Les commentaires du 25/07 (archivés :
docs/utilisateur/Archive/commentaires-2026-07-25.md) sont traités
en 5 lots, questions répondues par Olivier (généraliser les sous-écrans,
supprimer les emplacements par défaut, suppression d'emplacement si vide,
barre d'ajout minimale) :
1. **Motif sous-écran** (SousEcran.svelte : titre + croix, masque tout le
   reste, une seule saisie ouverte) + « Foyer et compte » = écran à part
   entière dans le menu déroulant (plus jamais l'ancien onglet affiché).
2. **Foyer et compte refondu** : en direct sélecteur de résidence, clé,
   sauvegardes, déconnexion, « Gérer les résidences » (sous-écran :
   renommage ✎ en place, corbeille + confirmation, ajout).
   `deleteResidence` au store (cascade en base, dernière résidence
   protégée, bascule si courante).
3. **Emplacements par résidence** : DEFAULT_LOCS supprimé de Stock.svelte
   (c'était la cause des « 10 emplacements » fantômes de la remarque 2) ;
   ajout d'un emplacement vide dans l'Inventaire ; suppression si vide ;
   `addLocation`/`removeLocation`.
4. **Sous-écrans partout** : fiche recette (écran dédié), import, sources,
   Modifier ingrédient, Gérer emplacement, master list, fiche ingrédient,
   Modifier événement, Ajuster recette. Renommage au crayon ✎ partout.
5. **Une zone de texte par ligne** (≤ 560 px, manage-row empilées) +
   barres d'ajout minimales (Stock : ingrédient+⋯+micro+Ajouter ;
   Courses : produit seul, lieu via ✎).
État : 144 tests verts (5 nouveaux), build OK, check:schema 16/16 (aucune
migration nécessaire), parcours réels vérifiés sur 5173 (voir cahier de
tests, passage du 25/07). **Reste : republier (`app/mettre-en-ligne.cmd`,
main d'Olivier) puis M56-M58 sur iPhone** (+ M47/M48-M50/M55 toujours en
attente des sessions précédentes).

### Vérification du 19/07/2026
Les 5 lots ont été revérifiés point par point (code, docs, tests) : statut
annoté dans « Commentaires sur l'appli actuelle.md » (tout est CORRIGÉ),
139 tests verts, check:schema 16/16 ; fonctionnalites.md et architecture.md
remis en cohérence (ils décrivaient encore l'ancienne règle v0.1). Reste
inchangé : republier la prod (lot 5) puis M47/M48-M50/M55 par Olivier.

### Chantier en cours (16/07/2026) : commentaires Olivier, 5 lots
Les commentaires du 16/07 (docs/utilisateur/Commentaires sur l'appli
actuelle.md) sont découpés en 5 lots, questions Q1-Q6 répondues par Olivier
(Q5 abandonnée). État :
1. **Lot 1 LIVRÉ, MIGRÉ ET EN PRODUCTION (16/07 au soir)** : stock PAR
   INGRÉDIENT (liste alphabétique unique, somme des emplacements, détail
   « ▸ n emplacements », minimum de réserve au niveau ingrédient —
   `ingredient_refs.min`, défaut 1, rachat quand la somme passe en dessous —,
   NP1 par ingrédient, panneau Modifier ✎ : renommer-fusion, genre, minimum,
   suppression ; poubelle retirée de la liste) + écrans PC élargis (960 px).
   Migration appliquée (sauvegarde préalable sur OneDrive/Téléchargement,
   check:schema 15/15), prod publiée par Olivier, M9/M43/M44 déroulés en
   réel. Reste : chaque appareil du foyer doit RECHARGER l'app une fois
   (service worker — un appareil resté sur l'ancienne version réinsère des
   lignes de courses selon l'ancienne règle, constaté et résolu le 16/07).
2. **Lot 2 LIVRÉ (16/07 au soir) — À REPUBLIER puis M47 sur iPhone** —
   Inventaires : question de rapprochement dépliable au toucher, boutons
   Gérer/Inventaire alignés, barre d'ajout au-dessus du clavier
   (visualViewport), correction d'une ligne « Vu » (transfert ou remise à
   vérifier), orthographes proches retrouvées (alias = direct,
   rapprochement = menu), micro : 2e appui = stop. Vérifié sur 5173 ;
   M47 (clavier/micro/dépliage) à faire par Olivier sur iPhone après
   republication (`app/mettre-en-ligne.cmd`).
3. **Lot 3 LIVRÉ ET MIGRÉ (16/07 au soir) — À REPUBLIER** — Courses :
   lieu d'achat par ligne (crayon ✎, mémorisé sur l'ingrédient) ; réception
   via l'inventaire (Q2) : « Ranger les achats » passe les lignes cochées
   « à mettre en stock » (onglet Inventaire, quantité réelle + emplacement,
   lot daté si congélateur) — plus de +1 direct, NP4 réglé et testé.
   Migration `shopping.received` appliquée (GO Olivier). Parcours réel
   complet vérifié sur 5173. Après republication : M48-M50 (+M47 iPhone).
4. **Lot 4 LIVRÉ (16/07 soir) — À REPUBLIER ; réparation des étapes EN
   ATTENTE DE GO** — Fiche recette : ★ à droite de la source, commentaires
   communs (recipes.notes) pleine largeur, réalisations datées du jour,
   boutons en bas (photo du plat unique rattachée à la réalisation du
   jour, « Récupérer la photo de la page », « Modifier »), imports URL
   lisibles (étapes découpées + numérotées). Investigation Gazpacho : bloc
   unique = fiches extraites (Evernote), pas l'import URL ; réparation
   prête pour 48/56 fiches (plan à blanc validé, `mcp/tmp-repare-etapes.mjs
   executer` après GO ; 8 fiches irrécupérables restent en l'état).
   « Récupérer la photo de la page » attend le redéploiement de
   rapatrier-page (commande dans EN ATTENTE d'Olivier).
5. **Lot 5 LIVRÉ ET MIGRÉ (16/07 nuit) — À REPUBLIER** — Résidences (Q6) :
   table `residences` + `residence_id` sur
   items/shopping/locations/item_lots/events (unicité des emplacements par
   résidence), sélecteur dans « Foyer et compte » (choix PAR APPAREIL),
   titre « foyer · résidence », créer/renommer, inventaire en pause attaché
   à sa résidence, sauvegarde/restauration compatibles. Migration appliquée
   (GO Olivier, check:schema 16/16) : l'existant est dans « Argenteuil »,
   « Montalivet » créée, bascule vérifiée en réel (M54 ✓). Reste :
   republier (`app/mettre-en-ligne.cmd`), puis M55 sur place et recharger
   l'app sur chaque appareil.

### L'essentiel
- **L'app est EN LIGNE : https://garde-manger-chi.vercel.app** (étape 7
  faite le 07/07 au soir, avancée à la demande d'Olivier). Dernière version
  publiée : « 7 juil. 2026, 20:35 » — l'horodatage est visible dans
  l'app, menu → Foyer et compte. Publication et dépannage :
  `docs/utilisateur/exploitation.md` (section « Publier une mise à jour »).
- L'app (Vite+Svelte 5+Supabase, dossier `app/`, `npm run dev` ou
  `demarrer.cmd` — attention un serveur peut déjà tourner sur 5173) couvre :
  stock+voix, courses automatiques (réappro + repas + achats libres,
  bascule « je l'ai »), 127 recettes (recherche multicritère, filtres en
  dépliant, sources gérées, « pour N personnes », pays, catégorie
  « Boissons », wish list ★, photos plat/page, ingrédients « ! » difficiles
  à sourcer), semaine À venir/Passés (ajustements % et quantités PAR
  recette et PAR événement), inventaires pausables, master list (493/500
  ingrédients catégorisés), emplacements « à dates » (lots, sortie du plus
  ancien), responsive iPhone (menu déroulant des onglets).
- **Méthode IMPÉRATIVE** : charger le skill `principes-dev` avant tout
  développement. Vérifs avant livraison : `npm test` (96 verts + 1 todo
  NP4) + `npm run check:schema` (14 tables OK) + parcours réel navigateur
  (cahier M1-M38). Documentation À CHAQUE livraison (index docs/README.md).

### Points chauds à vérifier en début de session
- **Confirmation d'Olivier attendue** : le correctif responsive iPhone
  (menu déroulant) est en production mais son iPhone montrait encore
  l'ancienne version (cache du service worker). S'il voit encore l'ancienne
  interface : suivre le dépannage iOS dans exploitation.md, et contrôler la
  ligne « Version publiée le … ».
- Installation iPhone/iPad écran d'accueil + tests M5 complet (mode avion)
  et M6 : à faire par Olivier (guide `docs/utilisateur/mise-en-ligne.md`).

### Comment travailler avec la vraie base et la prod (leçons du 07/07)
- Migrations et données : SQL collé dans le SQL Editor du dashboard Supabase
  (navigateur, session d'Olivier). TOUJOURS re-remplir le presse-papier
  juste avant chaque collage (deux incidents de presse-papier écrasé) et
  vérifier visuellement avant Ctrl+Entrée. Le dashboard gèle souvent :
  ouvrir un onglet neuf.
- Les actions de PRODUCTION (deploy Vercel `--prod`, premier collage d'une
  migration) sont bloquées par le garde-fou : les faire lancer par Olivier
  via `! commande` (déploiement : voir exploitation.md).
- Le port 5173 est l'origine où la session navigateur d'Olivier est
  connectée ; un vieux serveur de dev peut l'occuper (le tuer et relancer).
- Onglet en arrière-plan : les setTimeout sont throttlés (~1/min) — piloter
  le DOM en boucle synchrone pour les opérations en masse.

### État de la base (réelle, à jour au 09/07)
- **Migration du 08/07 APPLIQUÉE le 09/07** (SQL Editor piloté en session,
  GO d'Olivier, check:schema 15/15). Sauvegarde préalable complète de la
  base : `D:\OneDrive\Téléchargement\
  sauvegarde-base-garde-manger-2026-07-09-avant-migration.csv` (14 tables
  en JSON, 127 recettes, 837 lignes d'ingrédients). La réparation des
  « /2 … » a fonctionné : il ne reste que « eau » (2 lignes) et « ficelle
  de cuisine » (1 ligne) à trancher avec Olivier.
- **Passe navigateur M30-M38 déroulée le 09/07** sur la base migrée :
  tout est vert (détail au journal du cahier de tests). M34 (largeur
  iPhone) reste à confirmer par Olivier sur son appareil. Trois
  observations d'UX signalées au journal (Entrée sur « Nouveau genre »,
  nombre non parsé au clavier dans l'inventaire, export auto de la
  restauration à confirmer en passe humaine).
  **Reste : déploiement en prod (main d'Olivier, `mettre-en-ligne.cmd`).**
- Migration du 07/07 soir appliquée (category/wishlist/hard, recipe_photos
  + bucket privé « photos », locations.dated + item_lots).
- 127 recettes (118 plats + 9 jus « Boissons ») ; pays : France 110,
  Inde 2, Antilles 1, 5 sans pays ; 682+ lignes d'ingrédients ; master
  list : 493 catégorisés, 7 artefacts non classés (« /2 … », « Aïe »,
  « eau », « ficelle de cuisine »).

### EN ATTENTE d'Olivier (relancer poliment)
- **Recharger l'app sur l'iPhone/iPad** (et tout appareil où elle est
  ouverte) après la publication du 16/07 : un appareil resté sur l'ancienne
  version réinsère des lignes de courses selon l'ancienne règle par
  emplacement (procédure de rafraîchissement iOS dans exploitation.md ;
  contrôler la ligne « Version publiée le … »).
- (Migration du 16/07 appliquée et prod publiée le 16/07 au soir.)
- **Décision NP4 réglée le 16/07 (Q2)** : réception des achats via
  l'inventaire — sera livrée avec le lot 3 Courses.
- (Edge Function `rapatrier-page` redéployée le 16/07 au soir — M52 ✓ en
  réel, la photo du Gaspacho est sur sa fiche ; M42 reste à dérouler à
  l'occasion d'un vrai import URL.)
- Tri Evernote : 12 douteuses restantes — preview
  `Evernote/preview-douteuses.html` (double-clic), cocher dans
  `Evernote/tri.md`.
- (NP4 tranché le 16/07 via Q2 : la quantité reçue se saisit à
  l'inventaire — livraison avec le lot 3 Courses.)
- Connecteur Google Calendar à réautoriser sur claude.ai (le calendrier
  « marchés » est la référence des créneaux — décision 07/07).
- « épinards ≈ épinard » à trancher dans Ingrédients à rapprocher
  (la fusion absorbe maintenant proprement les deux fiches).
- (Edge Function déployée, GO A3 donné et A3 livré le 10/07 ; M39-M40 ✓.)
- Au premier import photo depuis https://garde-manger-chi.vercel.app :
  cliquer « Autoriser » sur la bulle Chrome « réseau local » (une fois).
- Supprimer du dashboard Vercel le projet « dist » (vide, créé par erreur
  le 10/07, sans effet).
- Trancher : vider automatiquement la catégorie « Plat » à l'import URL
  (convention de l'app : vide = plat) ?
- (Compte dédié créé et rattaché le 10/07, MCP B1 validé en réel.)
- Dérouler M41 (import « Coller le texte » depuis l'iPhone/iPad avec
  « Texte en direct ») — la prod est à jour.
- Constaté via le MCP : deux lignes « Safran » identiques au stock, sans
  emplacement — doublon probable à fusionner (panneau Gérer).

### Livré le 08/07 (session commentaires + points 2, 3, 5) — EN ATTENTE DE MIGRATION + PASSE NAVIGATEUR
- Commentaires d'Olivier (docs/utilisateur/Commentaires sur l'appli
  actuelle.md) intégrés : master list sans la section Emplacements, genres
  en menu déroulant + « Gérer les genres », fiche ingrédient (renommage
  avec fusion, sourcing, recettes associées), descriptif « , fondu » +
  « (facultatif) » sur les lignes de recette, fractions (½, 1/2, 1 ½)
  réaffichées comme saisies, panneau Modifier d'un événement refait
  (tenait pas sur iPhone), filtre par genre dans le Stock, sourcing
  marché/internet/boutique (défaut par genre, affiné par ingrédient) qui
  préremplit le magasin des courses, règle de largeur renforcée au design
  guide. « Gérer les sources » existait déjà (Recettes → Filtres).
- N7 terminé : inventaire des lots datés (ajustement auto + bilan, décision
  Olivier), bloc « À utiliser » dans la Semaine (seuil 6 mois réglable par
  emplacement, décision Olivier).
- Sauvegardes : export JSON (panneau Foyer) + rappel 7 jours (point
  orange). 90 tests + 1 todo, build OK. Docs à jour (fonctionnalités,
  design guide, cahier M30-M37, suivi, architecture, exploitation).

### Livré le 09/07 — EN ATTENTE DE MIGRATION + PASSE NAVIGATEUR
- **Restauration des sauvegardes** (panneau Foyer → « Restaurer une
  sauvegarde ») : remplacement complet des données du foyer, export
  automatique de l'état actuel + confirmation avant d'écraser, fichier
  étranger/tronqué refusé sans rien toucher (décisions Olivier 09/07).
  M38 au cahier — à tester en réel APRÈS la migration du 08/07 seulement.
  96 tests + 1 todo, build OK. Docs à jour.
- **Evernote lot 2 extrait** (agent Sonnet) : 12 fiches
  (`fiches/lot-02.json`), merge OK → 32 fiches dans import.sql. 3 notes
  sans fiche (article conseils, liste d'idées sans quantités, capture
  vide en 404) ; fiche « Foie gras aux coques » partielle (paywall
  Le Monde, signalé dans la fiche). Lots 3-24 restants, même méthode.

### Travail des prochaines sessions (ordre suggéré)
1. **Import Evernote lots 3-24** — le chantier de fond ;
   pipeline et état : `Evernote/README.md` + section « Import Evernote »
   ci-dessous. Lot 1 et les 9 jus déjà en base ; lot 2 extrait le 09/07
   (12 fiches, pas encore importé en base — l'import.sql regénéré contient
   les 32 fiches). Dédoublonnage par URL, perso par titre+source ;
   `category` traverse le pipeline. Instructions d'extraction pour un
   agent Sonnet : `Evernote/instructions-extraction-lot.md` (validées par
   Olivier — un agent par lot, plusieurs lots en parallèle possibles).
2. **Import de recettes en IA LOCALE** (étape 4, incr. 3 révisé le
   10/07/2026, décision Olivier : pas de clé API) : plan détaillé section
   « Import de recettes — plan IA locale ». **A1, A2 et A3 TERMINÉS le
   10/07** (M39 et M40 déroulés en réel, prod republiée avec le tout) —
   reste : A4 (capture + OCR local iPhone/iPad), et plus tard PDF → images
   et A5 (Raccourci Apple Intelligence si A4 trop manuel).
3. **Serveur MCP garde-manger** (décision Olivier 10/07/2026) : Claude
   travaille sur la vraie base via des actions métier qui garantissent
   l'intégrité — plan section « MCP garde-manger » (B1-B3). Premier usage
   réel visé : les lots Evernote (plus de SQL au presse-papier).
4. Quantités à l'ajout (N3/NP4 — décision toujours en attente).

## Décisions prises (06/07/2026)

- Périmètre du POC : stocks + liste de courses
- Plateforme : web app / PWA (PC, iPhone, iPad), une seule base de code
- Données : Supabase cloud (auth, synchro multi-appareils, sauvegardes), offre gratuite
  - L'hébergement OVH actuel (mutualisé) ne peut pas accueillir l'application
  - Si passage à un VPS OVH un jour : Supabase existe en auto-hébergé, la migration est un transfert de données sans réécriture de l'application
- Voix : dès le POC (reconnaissance du navigateur + dictée clavier iOS)
- Modèle foyer : un seul foyer, emplacements hiérarchiques (maison > lieu de stockage) ; l'association est un contexte d'événement, pas un foyer séparé
- Agenda : Google Calendar
- Capture de recettes : extraction par IA depuis photo, PDF ou URL, avec correction
  manuelle — révisé le 10/07/2026 : IA LOCALE (pas de clé API), voir section
  « Import de recettes — plan IA locale »
- Rôle utilisateur : utilisateur final uniquement, le code et le déploiement sont gérés dans les sessions Claude

## Étapes

### Étape 0 — POC (fait)
`poc/index.html` : stock avec emplacements et réserve mini, ajout automatique
à la liste de courses, courses groupées par magasin, saisie vocale, données
locales (localStorage), responsive clair/sombre.
Objectif : valider l'ergonomie et le concept sur iPhone/iPad/PC.

Validé en cours de route :
- Inventaire réel des épices chargé (~160 références, 5 emplacements), affichage compact une ligne par produit, recherche sans accents
- Suivi en nombre de pots (0 pot = ajout automatique aux courses)
- Bouton « commander » (panier) sur chaque ligne pour constituer une réserve ; « Ranger les achats » ajoute +1 pot par ligne cochée
- Design retenu : « Marché » (accent tomate #C73E36, typo ronde, coins arrondis 14 px, une couleur par emplacement) — maquette des 4 propositions dans `poc/design-propositions.html`

### Étape 1 — Socle (en cours)
- Fait : projet `app/` (Vite + Svelte 5), schéma Supabase appliqué (`supabase/schema.sql` :
  foyers, membres, ingrédients, courses, RLS par foyer, temps réel), écrans connexion /
  création-rejoindre un foyer / stock / courses, import de l'inventaire d'épices à la
  création du foyer, invitation par code de foyer. Testé en local (`npm run dev`).
- Fait aussi : PWA (manifest, icônes, service worker, installation écran d'accueil),
  consultation hors ligne (cache local, bandeau « consultation seule », reprise auto),
  documentation complète (docs/README.md : architecture + NFR, exploitation, cahier de
  tests), lanceur PC (app/demarrer.cmd)
- Reste : achats cochables hors ligne (file différée), comptes de la famille testés
- Décision Olivier (06/07/2026) : on travaille et on valide tout sur PC d'abord ;
  la mise en ligne passe en fin de projet (voir Étape 7)

### Méthode (skill principes-dev, dicté par Olivier)
- Cas d'utilisation de bout en bout dans `docs/cas-utilisation.md` (nominaux + non
  passants, validés par Olivier, non techniques) ; catalogue des fonctionnalités à part
  (`docs/fonctionnalites.md`)
- Tests d'intégration dérivés des cas d'utilisation : `app/tests/` (`npm test`),
  mis à jour au fil de l'eau et passés avant toute livraison
- Design guide UX : `docs/design-guide.md` (identité « Marché »)
- Documentation tenue à jour à chaque livraison

### Actions en attente
- (Plus aucune migration en attente : la migration du 07/07 soir —
  category/wishlist/hard, recipe_photos + bucket, locations.dated +
  item_lots — a été appliquée le 07/07 au soir en session, avec
  pays-prefill.sql et Evernote/import.sql ; check:schema 14/14.)
- Incident du 06/07 découvert et réglé le 07/07 : l'import Passard avait tourné
  deux fois (onglet resté sur l'état « aucune recette »), 210 recettes au lieu de
  105. Doublon supprimé avec l'accord d'Olivier (aucune donnée saisie dessus),
  garde-fou ajouté dans `importPassard()` + test d'intégration.

### Décisions en attente (Olivier)
- NP4 : comment saisir l'achat de plusieurs pots d'un coup
- (NP1 décidée le 06/07/2026 : suppression = état « manquant », icône dédiée, pas de
  retour automatique — implémentée et testée)

### Étape 2 — Stocks complets (en cours)
- Fait (06/07/2026) : cas N6 — panneau « Gérer » dans l'onglet Inventaire : renommer,
  fusionner (2 touches), déplacer des produits cochés vers un emplacement existant ou
  nouveau, regroupement des doublons ; 7 tests d'intégration, parcours réel vérifié
- Fait (06/07/2026) : mode inventaire (N2, NP6) — démarrage par emplacement, déclaration
  voix/toucher, cumul, création, correction, bilan des non-trouvés, application d'un bloc,
  reprise après interruption, abandon sans trace. Table `locations` créée (migration en
  attente côté base). Tri Emplacement / A→Z et panier trois états (NP1) livrés
- Emplacements = vraies entités : date de dernier inventaire, renommage, fusion,
  scission, déplacement (cas N7), déplacement de produits entre emplacements (N6)
- Mode inventaire (cas N2, dicté par Olivier) : démarrage par emplacement, produits
  « à vérifier », déclaration à la voix ou par recherche rapide, création des inconnus,
  cumul des déjà-vus, correction d'erreur, bilan des non-trouvés à confirmer,
  inventaire interruptible sans stock à moitié faux (NP6). Un même produit peut
  exister dans plusieurs emplacements ; l'inventaire de chaque emplacement fait foi
  chez lui, sans signalement croisé (décision Olivier, ex-NP7 retiré)
- Emplacements hiérarchiques : 3 maisons > congélateurs, épices, placard, frigo, cave
- Emplacements datés (cas N7 après renumérotation, précisé par Olivier le 06/07/2026) : tag « à dates » sur
  l'emplacement ; lot = n produits + date (défaut 1) ; vue quotidienne agrégée
  (« 3 côtes de bœuf ») avec flèche qui déroule les dates ; sortie = plus ancien proposé,
  modifiable ; cave : caisse de 6 à une date, on indique la date de la bouteille bue ;
  inventaire : liste des lots connus + bouton « Nouveau »
- Dates pour les faits maison (citrons confits, pâtés : date de fabrication, consommable
  à partir de, à consommer avant) — probablement une extension des lots datés

### Étape 3 — Courses et planning (REPORTÉE après les étapes 4 et 5, décision Olivier 06/07/2026)
- Fait : listes par magasin, réapprovisionnement automatique ; créneaux :
  la référence des marchés est le calendrier Google « marchés » d'Olivier
  (décision 07/07) — à lire quand le connecteur Google Calendar sera
  réautorisé ; magasins et commandes Internet dans `docs/creneaux-courses.md`
- Décisions : planning déclenché à la demande d'Olivier ; Google Calendar branché plus tard
- Ordre décidé par Olivier : d'abord les recettes (étape 4), puis le planning des recettes
  de la semaine (étape 5), et ENSUITE la planification des courses (N8/NP8, toujours en
  proposition)

### Étape 4 — Recettes (démarrée le 06/07/2026)
- Fait (06/07 soir, incrément 2, remarques d'Olivier) : ingrédients structurés
  (quantité/unité/nom, saisie une ligne par ingrédient) et texte de la recette dans la
  fiche, modifiables ; « Courses de la semaine » dans l'onglet Semaine (rapprochement
  par nom avec le stock, états en stock / déjà en liste / à acheter, ajout des manquants
  sans doublon) ; « Consigner » renommé « Marquer faite ». Migration
  `recipe_ingredients` en attente (dashboard instable). Photo : incrément suivant.
  Ingrédients Passard : extraction Le Point à automatiser ou saisie au fil de l'eau
- Fait (07/07) : 3 recettes du site Marie Claire ajoutées à la demande d'Olivier
  (source « Marie Claire — Cuisine », ingrédients structurés, recette condensée,
  « pour N personnes », réalisation « date non notée ») — capture faite en
  session via le navigateur, en attendant l'extraction IA (incrément 3) ;
  **filtre par source** (chips « Toutes / Alain Passard / Marie Claire ») dans
  l'onglet Recettes, cumulable avec la recherche ; lien de fiche généralisé
  (« Voir en ligne (site) » au lieu de « Article Le Point » en dur)
- Fait (07/07 matin) : migration appliquée, remplissage réel TERMINÉ — 82 fiches
  remplies dans la vraie base (682 lignes d'ingrédients), test M13 déroulé de bout
  en bout (événement du jour + tatin d'endives : états en stock / déjà en liste /
  à acheter, ajout des manquants, nettoyage propre) ; 43 tests verts
- Fait (07/07) : extraction TERMINÉE — 82 fiches sur 82 (9 lots), fusionnées dans
  fiches-data.json et le module applicatif ; 42 tests verts
- (Historique) extraction intelligente de 40 fiches sur 82 (lots 1-4 :
  ingrédients structurés + recette condensée reformulée, jamais le texte verbatim) →
  « Alain Passard/fiches-data.json » (base réutilisable) + module applicatif généré
  (merge-fiches.mjs) + bouton « Compléter les fiches Passard (n) » dans l'onglet
  Recettes (idempotent, respecte les fiches déjà remplies) — 42 tests verts.
  Reste : lots 5-9 (42 fiches), migration recipe_ingredients (dashboard Supabase
  indisponible), remplissage réel puis test M13
- Fait (06/07 soir) : moisson des 91 articles Le Point via le navigateur →
  « Alain Passard/lepoint-passard.json » (91 entrées, 82 textes complets de recettes,
  9 pages /video/ 2015 sans texte). Reste : lecture des textes par lots pour en tirer
  ingrédients + étapes (fiches-data), puis injection dans l'app (après la migration
  recipe_ingredients, dashboard Supabase toujours instable)
- Fait (06/07/2026, incrément 1) : onglet Recettes (recherche, fiche, dernière
  réalisation avec alerte < 1 an, « J'ai fait cette recette ») amorcé par la collection
  Alain Passard du projet local (105 recettes vidéo Le Point, 91 URLs, 5 cuisinées) —
  extraction reproductible par scripts/extract-passard.mjs. Import réel et test M11 en
  attente de la migration (supabase/migration-en-attente.sql, incident Supabase)
- Découpage proposé en 4 incréments (06/07/2026) :
  1. Bibliothèque + recettes saisies à la main : onglet Recettes, fiches (source,
     ingrédients, étapes), réalisations (date + commentaire), recherche, date de
     dernière réalisation visible — aucune dépendance externe
  2. Photos (plat + page du livre) via Supabase Storage, compression côté client
  3. Extraction IA (photo/PDF/URL → titre, ingrédients, étapes, relecture avant
     enregistrement) — nécessite la clé API Claude d'Olivier ; de préférence via une
     Edge Function Supabase pour ne pas exposer la clé (dashboard requis)
  4. Imports en volume : liste de livres (CSV/ISBN du logiciel de scan d'Olivier),
     capture de recettes par lot (plusieurs pages)
- Décision de conception à valider : ingrédients structurés (quantité, unité, nom)
  dès le départ — nécessaires au calcul des quantités de la semaine (cas N10)
- Documentation réorganisée le 06/07/2026 : docs/utilisateur/ (à lire et valider par
  Olivier) et docs/technique/ (interne) ; suivi des cas dans
  docs/technique/suivi-cas-utilisation.md
- Revue d'Olivier du 06/07/2026 intégrée : 11 cas nominaux après fusions — N3 « je
  prépare mes courses » (quantités), N6 rangements + déplacements par liste, N7
  emplacements datés (générique, exemples en fin), N8 « je fais une recette et je la
  consigne » (imports en volume : liste de livres CSV/ISBN, recettes par lot), N9
  retrouver une recette, N10 « je planifie ma semaine » (quantités, courses et planning
  inclus), N11 wish list. Cas non passants non revus par Olivier. Détail de la
  renumérotation : docs/technique/suivi-cas-utilisation.md
- Bibliothèque : livres (240+) et sites web
- Capture photo/PDF/URL, extraction IA (titre, ingrédients, étapes), photo du plat
- Historique : dates de réalisation + commentaires, notes personnelles, amendements
- Recettes perso

### Ingrédients — master list et quantités (décisions Olivier 07/07/2026)
- Constat d'Olivier : séparer quantité / unité / nom (déjà en place dans
  `recipe_ingredients`), calculer la quantité à commander, et éviter les
  orthographes différentes du même ingrédient via une « master list »
- Décisions : master list amorcée depuis SES données (stock + fiches), jamais
  de liste générique ; rapprochement par suggestion à confirmer (« citrons ≈
  citron ? »), réponse mémorisée (alias si oui, refus définitif si non),
  jamais de fusion silencieuse
- Fait (07/07, incrément 1) : table `ingredient_refs` (nom canonique + alias +
  refus), panneau « Ingrédients à rapprocher » dans l'onglet Inventaire
  (19 doublons réels détectés du premier coup), rapprochement de la semaine
  (stock et courses) via le référentiel, autocomplétion des noms connus à la
  saisie du stock ; 5 tests d'intégration, vérifié en réel
- Fait (07/07 soir, demande Olivier) : catégorisation en masse de la master
  list — 491 ingrédients classés dans les 9 catégories suggérées (audit :
  0 écart), 7 artefacts laissés non classés (« /2 … », « Aïe », « eau »,
  « ficelle de cuisine » — à résorber avec le parseur de fractions) ;
  correction `answerMerge` : fusionner deux noms ayant CHACUN leur fiche
  absorbe la seconde (alias, refus, catégorie) au lieu de laisser un doublon
- Fait (07/07, incrément 2) : « pour N personnes » sur la fiche recette ;
  besoin = quantité × convives ÷ N (facteur 1 si l'un des deux est inconnu),
  une même recette servie à deux événements compte deux fois ; ajustement
  global en % et correction à la main ligne par ligne dans le bloc semaine ;
  agrégation par unité compatible (mg/g/kg et ml/cl/l, jamais g ↔ pièces) ;
  quantités portées sur la liste de courses (affichage « 1,5 kg ») ;
  8 tests d'intégration, M15 déroulé en réel
- Reste (quantités) : NP4 côté stock (acheter plusieurs pots d'un coup,
  décision Olivier en attente) ; quantités absentes des fiches Passard
  (les articles n'en donnent pas) : à saisir au fil de l'eau

### Import Evernote (décisions Olivier 07/07/2026)
- `Recettes.enex` (296 Mo) : 371 notes, surtout des captures web 2020-2021
  (282 marieclaire.fr, ~15 autres sites), des recettes perso, des scans (9 PDF),
  quelques non-recettes ; 1 667 images
- Décisions : importer tout ce qui est recette (liste des douteux soumise à
  Olivier AVANT import) ; PAS de réalisation automatique (Olivier marquera
  lui-même) ; photos extraites en local dès maintenant (dossier Evernote/),
  rattachement à l'app quand le stockage photos existera
- Méthode : pipeline rejouable comme Passard — extract-enex.mjs (inventaire,
  tri, textes, photos) → validation du tri par Olivier → extraction des fiches
  par lots (ingrédients structurés + recette condensée, jamais verbatim) →
  import idempotent avec dédoublonnage par URL
- Fait (07/07) : script `app/scripts/extract-enex.mjs` exécuté — 371 notes
  lues : 309 captures web (dont 4 incomplètes, rechargeables par URL),
  13 notes perso, 49 scans photos seules (dont un lot de pages de livre
  chinois du 01/06/2020) ; 914 photos extraites dans `Evernote/photos/` ;
  textes dans `Evernote/textes/` ; .enex et photos exclus de git
- Fait (07/07 midi, GO d'Olivier) : base réutilisable créée —
  `Evernote/recettes-data.json` (format documenté dans `Evernote/README.md`,
  indépendante de l'app) + `import.sql` idempotent généré par
  `enex-merge.mjs` ; pipeline complet : extract-enex → enex-lots (24 lots de
  ~13) → fiches par lot en session → enex-merge → import dashboard
- Avancement des lots : **lots 1 à 5 EN BASE au 10/07/2026** (lot 1 : 11
  fiches ; lot 2 : 12 fiches ; lots 3-5 : 39 fiches par agents parallèles ;
  + 9 jus) — les imports passent désormais par le **MCP**
  (`importer_recettes_evernote`, a_blanc → GO → executer, sauvegarde auto)
  et plus jamais par le SQL au presse-papier. Restent les **lots 6 à 24**
  (~250 fiches) sur les prochaines sessions
- EN ATTENTE : validation par Olivier des 21 notes douteuses
  (`Evernote/tri.md`) — elles s'ajouteront en fin de chantier

### Lot d'évolutions demandé par Olivier le 07/07/2026 (livré le jour même)
- Recherche multicritère des recettes (titre, ingrédient, pays, source, mot du
  texte), dans Recettes ET dans la recherche de la Semaine ; champ « pays
  d'origine » sur la fiche ; sources gérées (renommer/fusionner/créer, choix
  dans l'éditeur de fiche)
- Bloc « Courses de la semaine » en déroulant (replié par défaut)
- Courses synchronisées automatiquement (décision Olivier) : l'onglet Courses
  fait la somme réappro + ingrédients des repas à venir + achats libres ;
  lignes « semaine » créées/requantifiées/retirées à chaque changement,
  bascule « je l'ai déjà », dédoublonnage avec le réappro, « Ranger » passe
  les lignes semaine achetées en « je l'ai »
- Ajustement des quantités PAR RECETTE ET PAR ÉVÉNEMENT (% + corrections
  ligne à ligne, mémorisés sur event_recipes)
- Pays d'origine : proposition VALIDÉE par Olivier le 07/07 (France par
  défaut pour Passard et les recettes françaises, Inde pour les dals,
  Antilles pour la salade de poulet créole) → `supabase/pays-prefill.sql`
  (rejouable, ne touche que les recettes sans pays), à appliquer avec la
  migration
- Remarques d'Olivier (07/07 après-midi), livrées le jour même :
  bug du « clignotement » corrigé à la racine (quantités numeric renvoyées
  en texte → boucle de réécritures ; + verrou de réentrance + rechargement
  complet sur mise à jour du store en dev) ; Semaine scindée À venir/Passés
  avec « Modifier » (date/contenu, courses recalculées) et « Fait » sur les
  passés (consignation recette par recette, plus de « Marquer faite » sur le
  futur) ; « Recherche avancée » (filtres source + pays) dans la recherche de
  recettes de la Semaine ; master list des ingrédients par CATÉGORIES dans
  l'onglet Inventaire (non classés en tête, catégories libres suggérées)
- Remarques en vrac (07/07 fin de journée), livrées : inventaire pausable
  (changer d'onglet suspend, revenir reprend — les onglets restent visibles) ;
  menu de choix quand une dictée correspond à plusieurs produits (carvi…) ;
  dates affichées en toutes lettres FR à côté des champs de date ;
  emplacements en liste déroulante (+ « Nouvel emplacement… ») ; sources en
  menu déroulant + filtre « Par ingrédient » avec suggestions (Recettes et
  recherche avancée de la Semaine) ; stabilité de la liste de courses
  PROUVÉE (0 mutation DOM au scroll) — le clignotement résiduel vu par
  Olivier = sa fenêtre sur l'ancien code, un Ctrl+F5 suffit
- À nettoyer (repéré via la master list) : ~quelques ingrédients Passard
  mal découpés (« /2 canard » : fractions ½ non gérées par
  parseIngredientLine) — corriger le parseur et re-remplir ces fiches

### Lot du 07/07/2026 au soir (livré — code et tests ; parcours réels M26-M29 après migration)
- **Catégorie de recette** : champ « Catégorie » sur la fiche (vide = plat),
  déroulant de filtre dans Recettes, comptée dans la recherche multicritère.
  Créée pour les Boissons (demande Olivier : les jus)
- **Jus Evernote** : la fiche JUS (note perso 2023) → 9 recettes de jus à
  l'extracteur (une par ligne, catégorie « Boissons », `Evernote/fiches/jus.json`),
  fusionnées dans recettes-data.json et import.sql (pipeline : une note peut
  produire plusieurs fiches ; le champ `category` traverse tout le pipeline).
  La note du 05/09/2015 (cocktail gingembre-betterave) s'y ajoutera si cochée
- **Preview des douteuses** : `Evernote/preview-douteuses.html` — les 12 notes
  non tranchées avec texte, photos et suggestion (écarter / importer / jus)
- **Photos (étape 4, incrément 2)** : photo du plat (seule ou consignée avec
  une réalisation) et page du livre ; bucket privé « photos » (RLS par foyer,
  chemin <foyer>/<recette>/), compression côté client (1600 px, JPEG),
  vignettes avec suppression confirmée, URL signées. Reste : hors ligne
- **Wish list (N11)** : ★ sur la fiche et en filtre, « ! » en tête de ligne
  d'ingrédient = difficile à sourcer (« à commander à l'avance ») ; beau
  produit = filtre ★ + « Par ingrédient »
- **Emplacements datés (N7, incrément 1)** : case « à dates » dans Gérer
  (Inventaire), lots datés (+ = lot du jour, formulaire quantité+date), sortie
  du plus ancien proposée, total simple + détail dépliable, « n sans date »
  pour l'existant. Reste : inventaire des lots, rappel congélateur dans la
  Semaine (N10), alerte d'ancienneté
- **Marchés (décision Olivier)** : le calendrier Google « marchés » est la
  référence des créneaux ; lecture impossible le 07/07 (connecteur Google
  Calendar à réautoriser sur claude.ai), consigné dans `creneaux-courses.md`
- Tests : 75 verts + 1 todo ; 5 vérifications de schéma ajoutées (14 tables)

### Import de recettes — plan IA locale (décision Olivier 10/07/2026)

Décision : l'extraction de recettes (étape 4, incrément 3) se fait SANS clé
API, avec de l'IA locale, pour rester autonome. Matériel cible : PC Legion
i9 + RTX 5070 Laptop 8 Go de VRAM (un modèle à vision 7-8B quantifié tient
entièrement sur le GPU), iPad Pro M5 16 Go (Apple Intelligence), iPhones
modernes visés (15 Pro et plus : Apple Intelligence aussi — l'iPhone 13
d'Olivier n'est pas la cible).

Stratégie en couches : le maximum SANS IA, l'IA locale seulement là où il
faut. La relecture avant enregistrement est OBLIGATOIRE partout
(l'extraction locale se trompe plus souvent que l'API sur les cas
difficiles : pages de biais, mises en page chargées, manuscrit).

- **A1 — Import par URL sans IA** — TERMINÉ le 10/07/2026 : code + 9 tests
  + build, Edge Function `rapatrier-page` DÉPLOYÉE par Olivier (CLI), M39
  déroulé en réel (poulet à la citronnelle Marie Claire importé de bout en
  bout, doublons refusés, Marmiton sans JSON-LD serveur → repli propre).
  Parseur JSON-LD `app/src/lib/jsonld-recipe.js` (@graph, HowToSection,
  ingrédients en bloc ou tableau), panneau « ▸ Importer une recette depuis
  une URL » (récupérer → relire → enregistrer), dédoublonnage URL sinon
  titre+source, source « site » créée au besoin. Au passage : parseur
  d'ingrédients corrigé (« 2/3 de c. à c. de X » reconnaît l'unité).
  Question ouverte à Olivier : vider automatiquement la catégorie « Plat »
  à l'import (convention : vide = plat) ?
  **Complété le 14/07/2026 — photo du plat** (décisions Olivier : jointe
  par défaut, décochable à la relecture ; échec non bloquant) : le parseur
  lit le champ `image` du JSON-LD, l'Edge Function rapatrie aussi l'image
  (8 Mo max), rattachement en « Plat ». RESTE : redéploiement de
  `rapatrier-page` par Olivier puis M42 en réel, et republication de la
  prod.
- **A2 — POC Ollama sur le PC** — FAIT le 10/07/2026, CONCLUANT. Verdict :
  **qwen3-vl:4b-instruct** (~33 s par page, 61 s pour une double page de
  livre, fractions ½/1½ intactes, étapes quasi verbatim ; défauts du
  niveau « relecture » : titre pris en chinois sur le livre bilingue, une
  ligne d'accompagnement omise). Comparatif complet, réglages et pièges
  (types union interdits dans le schéma, variante -instruct obligatoire,
  num_ctx 8192, images 1600 px) : `docs/technique/poc-ollama.md` ; script
  rejouable `app/scripts/poc-extract-ollama.mjs`. GO d'Olivier attendu
  pour A3.
- **A3 — Intégration app ↔ Ollama (PC)** — FAIT le 10/07/2026 (GO
  d'Olivier), M40 déroulé en réel (Chaudrée du potager importée depuis sa
  photo, 129 recettes en base, photo attachée à la fiche). Bouton « Depuis
  des photos » visible seulement si Ollama répond avec le modèle
  (`ollama-recipe.js`), compression 1600 px réutilisée, photos rattachées
  en « Page » (copie privée), source de type « livre ». CORS réglé
  (OLLAMA_ORIGINS, persistant) ; au premier usage depuis le site public,
  Chrome demande UNE FOIS l'autorisation « réseau local » (à cliquer par
  Olivier — voir exploitation.md). RESTE (plus tard) : PDF converti en
  images ; rapprochement master list en suggestions à l'import.
- **A4 — iPhone/iPad : capture + OCR local Apple** — CODE LIVRÉ le
  10/07/2026 : « ▸ Coller le texte de la recette » dans le panneau
  d'import (photo de la page → « Texte en direct » → coller), découpage
  heuristique (`texte-recette.js` : titre, « Pour N personnes », puces et
  quantités = ingrédients, « 1. … » = étapes), photos de la page jointes
  sans IA (bucket « Page »), même relecture obligatoire. 4 tests.
  RESTE : test réel M41 par Olivier sur iPhone/iPad (et prod à republier).
- **A5 — (optionnel, seulement si A4 s'avère trop manuel à l'usage)
  Raccourci Apple Intelligence** : action « Utiliser le modèle » (modèle
  Apple local, iPad M5 et iPhone 15 Pro+) : photo → OCR → JSON → partage
  vers l'app.

Cas d'utilisation touchés : N8 (je fais une recette et je la consigne —
volet capture), N9 (retrouver une recette). Chaque incrément suit la
méthode : cas limites décidés avant de coder, tests d'intégration,
parcours réel navigateur, docs à jour.

### MCP garde-manger — Claude travaille sur la base (décision Olivier 10/07/2026)

Objectif : que Claude lise et écrive dans la vraie base SANS SQL libre ni
collages au dashboard (deux incidents de presse-papier le 07/07), via un
serveur MCP local exposant des actions métier qui garantissent l'intégrité
des données.

Principes d'intégrité (imposés par le serveur, quel que soit l'appelant) :
- Connexion par un compte Supabase dédié (ex. claude@…), simple membre du
  foyer : la RLS s'applique à toutes ses actions ; JAMAIS la service key.
  DÉCISION OLIVIER à valider : création de ce compte + invitation au foyer.
- Écritures uniquement via des actions métier à schéma strict, qui portent
  les règles du projet : `creer_recette` (dédoublonnage par URL et par
  titre+source, ingrédients structurés quantité/unité/nom, catégorie,
  pays), `maj_recette`, `ajouter_realisation`, `rapprocher_ingredient`
  (suggestion contre la master list, jamais de fusion silencieuse)…
- Toute écriture en masse passe par un mode « à blanc » : rapport de ce
  qui serait créé / modifié / ignoré (doublons), exécution seulement après
  GO d'Olivier ; export JSON automatique du foyer AVANT l'exécution.
- Pas de suppression en masse ; suppression à l'unité, avec confirmation.
- Journal des actions du serveur (quoi, quand, résultat), consultable.

Incréments :
- **B1 — Lecture seule** — TERMINÉ le 10/07/2026 : serveur `mcp/index.mjs`
  (Node, stdio, `.mcp.json`), 6 outils, compte dédié créé et rattaché au
  foyer par Olivier, `mcp/.env` rempli, chaîne VALIDÉE sur la vraie base
  (15 tables OK, 2 membres, tous les outils justes). Doc :
  `docs/technique/mcp.md`. Le serveur se charge au prochain démarrage de
  session Claude Code dans le projet.
- **B2 — Écritures métier** — LIVRÉ le 10/07/2026 :
  `importer_recettes_evernote` (deux temps : a_blanc → jeton → GO Olivier
  → executer ; sauvegarde JSON automatique avant exécution ; dédoublonnage
  URL sinon titre+source ; jeton faux REFUSÉ — testé), `creer_recette`
  (unitaire, parseur partagé `ligne-ingredient.js`), `ajouter_realisation`,
  `journal_actions` (mcp/journal.jsonl). Pas d'outil de suppression.
- **B3 — Lots Evernote via le MCP** — DÉMARRÉ le 10/07/2026, lots 1-5 EN
  BASE : lot 2 importé (10 recettes, GO Olivier), puis lots 3-5 extraits
  par 3 agents en parallèle (13+13+13 fiches) et importés (34 recettes,
  GO Olivier ; le dédoublonnage a été renforcé au passage : titre+source
  vaut aussi pour les fiches avec URL — deux captures de la même page ne
  différaient que par un ?xtor de tracking). **173 recettes en base,
  1 351 lignes d'ingrédients.** Restent les **lots 6-24** (~19 lots),
  même cycle : extraction (agents) → enex-merge → a_blanc → GO → executer.
  Cas douteux des agents consignés au journal du cahier (fourchettes de
  quantités → moyenne, « 4 à 6 pers. » → 4, unités manquantes laissées
  telles quelles).

### Étape 5 — Semaine et événements (démarrée le 06/07/2026)
- Fait (incrément 1) : onglet Semaine — événements (jour, type, convives, contraintes),
  recettes associées avec alerte « déjà cuisinée il y a moins d'un an », consignation à
  la date de l'événement. Tables events/event_recipes ajoutées à la migration en attente.
  Reste dans N10 : quantités à l'échelle (attend ingrédients structurés), vérification
  de la liste de courses, planning des tournées (attend créneaux d'Olivier)
- Événements (dîner maison, association 15-25 personnes, invitation, pique-nique) avec convives et contraintes (halal, casher, végétarien, pas épicé, budget)
- Calcul automatique des ingrédients, ajustable en % ou à la main
- Wish list, recherche de recettes par bel ingrédient acheté
- Ingrédients difficiles à sourcer marqués dans les recettes, planification des commandes à l'avance
- Produits du congélateur à utiliser en priorité

### Étape 6 — Extensions
- Cave à vin (millésimes, fenêtre de garde)
- Fermentations (kefir, kombucha, ginger bug, choucroute, levain)
- Produits de santé et d'entretien
- Export/sauvegarde régulière des données

### Étape 7 — Mise en ligne (FAITE le 07/07/2026, avancée à la demande d'Olivier)
- EN LIGNE : **https://garde-manger-chi.vercel.app** (Vercel, projet
  « garde-manger », compte créé et connecté par Olivier, offre gratuite)
- Publication SANS build distant : `app/mettre-en-ligne.cmd` construit en
  local puis publie `dist` (ce qui est testé = ce qui part) ; l'adresse ne
  change pas d'une publication à l'autre
- Supabase réglé : Site URL = production, `http://localhost:5173` en
  redirection autorisée (les emails de confirmation/invitation pointent
  vers la production ; l'ancienne valeur était le défaut localhost:3000)
- Vérifié en ligne le 07/07 : page de connexion, service worker (PWA
  installable), manifest, aucune erreur console ; clé embarquée =
  publiable (RLS)
- Responsive iPhone corrigé (07/07 soir, remarques Olivier) : sur écran
  étroit les onglets **collapsent en menu déroulant** (avec « Foyer et
  compte » dedans) et les filtres de recettes vivent dans un **dépliant
  « Filtres (n) »** refermable ; plus aucun débordement horizontal
  (balayage vérifié à 389 px sur les 5 onglets) — règles consignées dans le
  design guide ; republication à faire
- RESTE (Olivier, sur appareils) : installation écran d'accueil
  iPhone/iPad et tests M5 complet (mode avion) et M6 — guide :
  `docs/utilisateur/mise-en-ligne.md`

## Contraintes identifiées

- Voix 100 % locale non garantie dans un navigateur : la reconnaissance du navigateur peut passer par le réseau ; la dictée du clavier iOS est locale sur iPhone récents. Une app native serait nécessaire pour une garantie stricte.
- PWA sur iOS : hors ligne OK, mais notifications push limitées et stockage local purgeable par Safari si l'app n'est pas installée sur l'écran d'accueil.
- Recettes scannées = copie privée : accès strictement limité au foyer, jamais public.
- Multi-maisons + hors ligne + multi-utilisateurs : conflits de synchro possibles, règle simple « dernière écriture gagne » au début.
- Google Calendar : nécessite une connexion OAuth (étape 3).
- Extraction IA des recettes — révisé le 10/07/2026 : IA locale retenue (0 €,
  autonome) ; qualité moindre que l'API sur les cas difficiles, d'où la
  relecture obligatoire avant enregistrement ; l'extraction photo/PDF
  complète n'est disponible que sur le PC (Ollama), les appareils iOS font
  capture + OCR local.
- Coût de fonctionnement cible : 0 €/mois au début (offres gratuites), quelques €/mois à terme.

## Questions ouvertes

- Épices : suivi précis des quantités ou simple « j'en ai / il n'y en a plus » ?
- Congélateurs : étiqueter les entrées avec date (voire QR code imprimé) ?
- Vin : simple inventaire avec millésime et fenêtre de garde, ou aussi notes de dégustation ?
- Association : recettes mises à l'échelle automatiquement pour 15-25 personnes ?
- Qui utilisera l'app dès le début (comptes à créer : mari, enfants) ?
- Y a-t-il des lieux avec une mauvaise connexion (cave, maison secondaire) où le hors ligne est critique ?
- Liste des magasins et sites d'achat à préconfigurer ?
