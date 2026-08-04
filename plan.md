# Plan d'action — App cuisine

Index de la documentation : `docs/README.md`. Historique des chantiers
terminés : `docs/technique/plan-archive.md` (archivé le 04/08/2026, lot C).

## Reprise rapide (passation à jour au 04/08/2026 — à lire en premier)

### Prochaine session
- **Aucun chantier en cours** : commentaires 4 (lots 0-5) ET fiche
  ingrédient unique sont livrés, migrés et PUBLIÉS le 04/08 (détail
  ci-dessous). Base : check:schema 20/20 ; dernier bundle
  `index-Dt6j3MnA.js` sur l'alias.
- **Prochain chantier annoncé par Olivier** : de nouveaux requirements
  sur la gestion des boutiques et des URL d'achat (il les donnera —
  méthode habituelle : lot 0 cas d'utilisation + questions, puis GO).
- En attendant : tests appareils M74-M76 par Olivier (cahier), backlog
  ci-dessous, ou chantier de fond Evernote lots 6-24.

### Chantier commentaires 4 — LIVRÉ, MIGRÉ ET PUBLIÉ le 04/08 (docs/utilisateur/commentaires 4.md)
Retours d'Olivier après essai réel (03/08), 6 points : (1) rectifier le
nom d'un ingrédient en cours d'inventaire (dictée écorchée) ; (2) BUG
renommages d'emplacements en chaîne pendant qu'un inventaire est ouvert
(« soin 1 »/« soin 2 » permutés → l'inventaire perd sa boîte) ; (3) BUG
probable : ingrédient existant dans une AUTRE résidence introuvable à la
déclaration (« Cumin moulu » à Montalivet ; « Cum Moul » marche, le nom
exact non) ; (4) plusieurs inventaires en pause en parallèle ;
(5) rouvrir un inventaire pour y ajouter ce qui vient d'ailleurs ;
(6) écran de gestion DÉDIÉ livres + URL (les filtres ne tiennent pas
240 livres).
**LOTS 0-5 FAITS le 04/08** (GO d'Olivier pour tous les lots ; détail
complet au cahier de tests, passages 04/08 (1)-(3)) :
- lot 1 : les deux BUGS corrigés, causes racines PROUVÉES par tests
  rouges (inventaire suivi par NOM → suit désormais sa boîte à travers
  les renommages ; nom exact connu du foyer → déclaré directement) ;
- lot 2 : ✎ « rectifier le nom » sur les lignes « nouveau » d'inventaire
  (ne touche QUE la saisie, décision Olivier) ;
- lot 3 : inventaires MULTIPLES (pauses en parallèle, un bandeau
  Reprendre par inventaire, un emplacement = un seul inventaire) +
  « Rouvrir (compléter) / Repartir de zéro » ;
- lot 4 : écran BIBLIOTHÈQUE (N16) — grille de couvertures, fiche
  source → ses recettes, scanner (livre) / visiter + coller l'URL
  (site), remplace « Gérer les sources » ;
- lot 5 : cibles tactiles (coche courses ≥ 44 px, boutons 42 px sur
  tactile) + contrastes du thème clair relevés.
193 tests verts, build OK, parcours réels sur 5173 (nettoyés).
**MIGRATION `sources.url` APPLIQUÉE le 04/08 en session** (GO d'Olivier,
SQL Editor piloté par l'API Monaco, « Success », check:schema 18/18 avec
sources.url). **PROD PUBLIÉE le 04/08 en session (GO d'Olivier)** :
bundle `index-CzI0v5sl.js` vérifié sur l'alias, en-têtes de sécurité en
ligne — les lots 1-5 sont EN LIGNE. **RESTE : recharger l'app sur chaque
appareil (service worker), puis M74-M75 sur iPhone + la liste unique des
tests appareils (aucun test formel fait à ce jour, dit Olivier).**

### Chantier FICHE INGRÉDIENT UNIQUE — LIVRÉ, MIGRÉ ET PUBLIÉ le 04/08
GO d'Olivier + réponses Q1-Q4 + 3 exigences (minimum PAR RÉSIDENCE ;
lieux d'achat MULTIPLES ; URL communes / boutiques par résidence).
LIVRÉ (détail au cahier, passage 04/08 (6)) : tables
`ingredient_minimums`/`ingredient_stores` + `stores.residence_id`
(migration `supabase/migration-2026-08-04-fiche-ingredient.sql`),
`FicheIngredient.svelte` unique (Stock ✎ + Master list), lieux en
boutons au ✎ des Courses, menu « Maison » des boutiques dans Lieux
d'achat. 199 tests verts, build OK. **MIGRATION APPLIQUÉE ET PROD
PUBLIÉE le 04/08 en session (GO d'Olivier)** : check:schema 20/20,
bundle `index-Dt6j3MnA.js` vérifié sur l'alias, écriture réelle d'un
minimum par maison vérifiée sur 5173. Piège noté : la liaison Vercel de
`app/dist` saute à chaque build — TOUJOURS `vercel link` avant
`deploy` (un premier envoi est parti sur le projet « dist », raison de
plus de le supprimer du dashboard). **RESTE : recharger l'app sur les
appareils, puis M76 sur iPhone.** Le lot D des revues du 03/08 est
entièrement soldé avec ces deux chantiers.

### Dernier chantier livré : revues + corrections (03/08) + lot C doc (04/08)
4 revues indépendantes (code, doc, sécurité, UX) dans
`docs/technique/revues/` + synthèse en 4 lots. Lots A (sécurité) et
B (ménage ~300 lignes) appliqués et PUBLIÉS le 03/08 au soir (bundle
`index-DSI9g6S3.js`, en-têtes vérifiés en ligne) — détail au cahier,
passage 03/08 (3). Lot C (documentation) FAIT le 04/08 : plan.md archivé
(ce fichier réduit, historique dans plan-archive.md), liste unique des
tests appareils ci-dessous, exploitation.md rafraîchi, mise-en-ligne.md
en renvoi, parenthèses « réglé » purgées. Lot D = chantier commentaires 4.
Avant ça : chantier livres non trouvés (BnF + file « Livres à
compléter » + complétion par Claude via MCP) livré, migré (18/18) et
publié le 03/08 au soir (bundle `index-C7jvAhHo.js`) — détail dans
l'archive et au cahier.

### L'essentiel
- L'app est **EN LIGNE : https://garde-manger-chi.vercel.app** avec de
  vraies données. Les actions de production (deploy Vercel, SQL) exigent
  un GO explicite d'Olivier. Publication et dépannage :
  `docs/utilisateur/exploitation.md`. L'horodatage de la version publiée
  est visible dans l'app (menu → Foyer et compte).
- Code : `app/` (Vite + Svelte 5 + Supabase), `npm run dev` ou
  `demarrer.cmd` — attention, un serveur peut déjà occuper le port 5173.
  Serveur MCP garde-manger pour travailler sur la vraie base :
  `docs/technique/mcp.md`.
- État courant (nombre de tests verts, recettes en base, migrations) :
  voir le **dernier passage du journal** de
  `docs/technique/cahier-de-tests.md` et `npm run check:schema` — pas de
  chiffres recopiés ici, ils périment.
- **Méthode IMPÉRATIVE** : charger le skill `principes-dev` avant tout
  développement. Avant toute livraison : `npm test` +
  `npm run check:schema` + parcours réel navigateur + documentation à
  jour (index `docs/README.md`).

## Tests appareils en attente (liste unique — à cocher avec Olivier)

Consolidée le 04/08 (lot C, P2) depuis les « RESTE » des chantiers
archivés. Aucun n'est confirmé fait ; Olivier coche, on met à jour ici et
au cahier. Détail de chaque M : `docs/technique/cahier-de-tests.md`.

| Tests | Quoi (appareil) | Depuis |
|---|---|---|
| Recharger l'app | une fois sur CHAQUE appareil après la publication du 04/08 (service worker) | toutes les publications |
| M4 | foyer à deux (2e compte) | socle |
| M5-M6 | installation écran d'accueil iPhone/iPad + mode avion | 07/07 |
| M34 | largeur iPhone (pas de débordement) | 09/07 |
| M41 | import « Coller le texte » (Texte en direct, iPhone/iPad) | 10/07 |
| M42 | import URL avec photo du plat, en réel | 14/07 |
| M47 | inventaire : clavier/micro/dépliage (iPhone) | 16/07 lot 2 |
| M48-M50 | courses : lieu d'achat, réception via inventaire | 16/07 lot 3 |
| M55 | résidences, sur place | 16/07 lot 5 |
| M56-M58 | sous-écrans iPhone | 25/07 |
| M59-M62 | commentaires 2 (M62 = dictée réelle au micro) | 27/07 |
| M63-M67 | commentaires 3 (M66 = lieux d'achat en réel, « Reprendre ces lieux » au premier passage) | 28/07 |
| M68-M69 | scan caméra ISBN en réel (« plus compliqué que d'habitude » à surveiller) | 02/08 |
| M70-M72 | livres non trouvés — dont re-scan de « Cuisine créole » 9782016279700 (la BnF le trouve désormais) | 03/08 |
| M73 | confirmations deux touches + import URL | 03/08 |
| M74 | commentaires 4, lots 1-3 : rectifier ✎ un nom dicté, nom exact d'une autre maison, pauses en parallèle, permutation de noms suivie, rouvrir | 04/08 |
| M75 | écran bibliothèque (publiée le 04/08) : couvertures, fiche source, visiter/coller l'URL, scanner | 04/08 |
| M76 | fiche ingrédient unique (publiée le 04/08) : minima par maison, lieux multiples, ✎ courses, alias | 04/08 |

## En attente d'Olivier

- Les **requirements « gestion des boutiques et URL d'achat »** annoncés
  le 04/08 (prochain chantier).
- Optionnel, 1 clic : fermer les inscriptions (Supabase → Authentication
  → Sign-ups) — lot A des revues.
- Tri Evernote : 12 douteuses restantes — preview
  `Evernote/preview-douteuses.html` (double-clic), cocher dans
  `Evernote/tri.md`.
- Connecteur Google Calendar à réautoriser sur claude.ai (le calendrier
  « marchés » est la référence des créneaux — décision 07/07).
- À trancher : « épinards ≈ épinard » (Ingrédients à rapprocher) ;
  lignes « eau » (2) et « ficelle de cuisine » (1) de la master list ;
  doublon « Safran » (2 lignes sans emplacement) à fusionner (Gérer) ;
  vider automatiquement la catégorie « Plat » à l'import URL ?
- Supprimer du dashboard Vercel le projet « dist » (créé par erreur le
  10/07 ; depuis le 04/08 il porte une copie déployée de l'app — raison
  de plus).
- Au premier import photo depuis la prod : cliquer « Autoriser » sur la
  bulle Chrome « réseau local » (une fois).

## Backlog technique

- Étendre le cache hors ligne aux recettes de la semaine (écart de spec,
  vérifié le 03/08 — analyse croisée Antigravity).
- À la prochaine migration : solder `shopping.received` (UPDATE + retirer
  les ~6 références).
- Politique UPDATE du bucket photos : le remplacement d'une photo échoue
  silencieusement (revue sécurité §2).
- Cocher les courses hors ligne (NP5) ; quantité voulue à l'AJOUT en
  liste (N3) ; voir/cocher les autres listes (N4).
- Planning des tournées de courses + agenda Google (N10 — attend le
  connecteur Calendar).
- Import photos : PDF → images ; rapprochement master list en
  suggestions à l'import ; A5 (Raccourci Apple Intelligence) seulement si
  le coller-texte s'avère trop manuel.
- Réinitialisation de mot de passe dans l'application.

## Chantiers de fond ouverts

- **Import Evernote lots 6-24** (~250 fiches) : cycle extraction (agents)
  → enex-merge → MCP `importer_recettes_evernote` (a_blanc → GO →
  executer). Pipeline : `Evernote/README.md`. Les douteuses cochées par
  Olivier s'ajouteront en fin de chantier.
- Étape 6 — extensions : cave à vin (millésimes, garde), fermentations,
  produits de santé et d'entretien.

## Comment travailler avec la vraie base et la prod (leçons du 07/07)
- Migrations et données : SQL collé dans le SQL Editor du dashboard Supabase
  (navigateur, session d'Olivier). TOUJOURS re-remplir le presse-papier
  juste avant chaque collage (deux incidents de presse-papier écrasé) et
  vérifier visuellement avant Ctrl+Entrée. Le dashboard gèle souvent :
  ouvrir un onglet neuf. Le collage simulé ne prend pas : injecter par
  l'API Monaco (pratique validée les 28/07-03/08).
- Les actions de PRODUCTION (deploy Vercel `--prod`, premier collage d'une
  migration) sont bloquées par le garde-fou : les faire lancer par Olivier
  via `! commande` (déploiement : voir exploitation.md). `vercel deploy
  --prod` se lance depuis `app/dist` — vérifier le cwd (échec du 03/08 :
  cwd resté dans app/).
- Le port 5173 est l'origine où la session navigateur d'Olivier est
  connectée ; un vieux serveur de dev peut l'occuper (le tuer et relancer).
- Onglet en arrière-plan : les setTimeout sont throttlés (~1/min) — piloter
  le DOM en boucle synchrone pour les opérations en masse.
- Supabase interdit `delete from storage.objects` en SQL depuis 2026 :
  passer par l'interface Storage ou l'API.

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
