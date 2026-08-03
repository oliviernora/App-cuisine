# Plan d'action — App cuisine

Index de la documentation : `docs/README.md`. Historique des chantiers
terminés : `docs/technique/plan-archive.md` (archivé le 04/08/2026, lot C).

## Reprise rapide (passation à jour au 04/08/2026 — à lire en premier)

### Chantier en cours : commentaires 4 (docs/utilisateur/commentaires 4.md)
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
**LOT 0 FAIT le 04/08** : N2/N6/NP6 amendés + N16 créé
(cas-utilisation.md), suivi à jour. Réponses d'Olivier du 04/08
intégrées : (2) aucun renommage vers un nom pris dans son scénario — le
bug est ailleurs, cause racine à PROUVER au lot 1 ; (3) oui un
emplacement = un seul inventaire à la fois, liste des inventaires en
cours ; (4) traiter « rouvrir » seulement — pas de geste « vers l'autre
boîte » depuis l'inventaire en cours ; (5) écran bibliothèque à ma main
(design guide). Q1 tranchée le 04/08 : la rectification d'un nom en
inventaire ne touche QUE l'ingrédient ajouté, jamais la fiche d'un
produit existant (la saisie rejoint la fiche du bon nom, créée au
besoin). **Toutes les questions sont tranchées — EN ATTENTE DU GO
d'Olivier.** Lots proposés : 1 = les deux bugs (cause racine PROUVÉE
d'abord) ; 2 = rectifier le nom en inventaire ; 3 = inventaires en
parallèle + rouvrir ; 4 = écran bibliothèque (N16, avec découpage de
Recettes.svelte) ; 5 = reste du lot D (fiche ingrédient unique, cibles
tactiles).
Au GO, intégrer aussi le lot D des revues (2026-08-03-synthese.md) :
découpage de Recettes.svelte avec l'écran bibliothèque, renommage
universel ✎, inventaires par id, fiche ingrédient unique, cibles
tactiles.

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
| Recharger l'app | une fois sur CHAQUE appareil après la publication du 03/08 au soir (service worker) | toutes les publications |
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

## En attente d'Olivier

- Réponse à la **Q1 commentaires 4** (portée du renommage d'ingrédient en
  inventaire) + **GO** du chantier.
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
- Supprimer du dashboard Vercel le projet « dist » (vide, créé par
  erreur le 10/07, sans effet).
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
