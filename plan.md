# Plan d'action — App cuisine

## Décisions prises (06/07/2026)

- Périmètre du POC : stocks + liste de courses
- Plateforme : web app / PWA (PC, iPhone, iPad), une seule base de code
- Données : Supabase cloud (auth, synchro multi-appareils, sauvegardes), offre gratuite
  - L'hébergement OVH actuel (mutualisé) ne peut pas accueillir l'application
  - Si passage à un VPS OVH un jour : Supabase existe en auto-hébergé, la migration est un transfert de données sans réécriture de l'application
- Voix : dès le POC (reconnaissance du navigateur + dictée clavier iOS)
- Modèle foyer : un seul foyer, emplacements hiérarchiques (maison > lieu de stockage) ; l'association est un contexte d'événement, pas un foyer séparé
- Agenda : Google Calendar
- Capture de recettes : extraction par IA (API Claude) depuis photo, PDF ou URL, avec correction manuelle
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
- Migration `locations` à appliquer (SQL prêt dans supabase/schema.sql) — dashboard
  Supabase en incident le 06/07/2026 ; sans elle, tout fonctionne sauf l'enregistrement
  de la date de dernier inventaire

### Décisions en attente (Olivier)
- NP4 : comment saisir l'achat de plusieurs pots d'un coup
- (NP1 décidée le 06/07/2026 : suppression = état « manquant », icône dédiée, pas de
  retour automatique — implémentée et testée)

### Étape 2 — Stocks complets (en cours)
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
- Fait : listes par magasin, réapprovisionnement automatique ; créneaux des marchés et
  magasins consignés dans `docs/creneaux-courses.md`, fichier à enrichir par Olivier
- Décisions : planning déclenché à la demande d'Olivier ; Google Calendar branché plus tard
- Ordre décidé par Olivier : d'abord les recettes (étape 4), puis le planning des recettes
  de la semaine (étape 5), et ENSUITE la planification des courses (N8/NP8, toujours en
  proposition)

### Étape 4 — Recettes (démarrée le 06/07/2026)
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

### Étape 5 — Semaine et événements
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

### Étape 7 — Mise en ligne (en fin de projet, décision Olivier)
- Hébergement (Vercel recommandé, compte à créer par Olivier ; OVH possible à terme)
- Réglage de l'adresse dans Supabase (Site URL pour les emails)
- Installation sur iPhone/iPad (écran d'accueil), premiers usages en mobilité
  (inventaire à la voix, courses au marché), tests manuels M5 complet et M6

## Contraintes identifiées

- Voix 100 % locale non garantie dans un navigateur : la reconnaissance du navigateur peut passer par le réseau ; la dictée du clavier iOS est locale sur iPhone récents. Une app native serait nécessaire pour une garantie stricte.
- PWA sur iOS : hors ligne OK, mais notifications push limitées et stockage local purgeable par Safari si l'app n'est pas installée sur l'écran d'accueil.
- Recettes scannées = copie privée : accès strictement limité au foyer, jamais public.
- Multi-maisons + hors ligne + multi-utilisateurs : conflits de synchro possibles, règle simple « dernière écriture gagne » au début.
- Google Calendar : nécessite une connexion OAuth (étape 3).
- Extraction IA des recettes : nécessite une clé API Claude, coût de quelques centimes par recette.
- Coût de fonctionnement cible : 0 €/mois au début (offres gratuites), quelques €/mois à terme.

## Questions ouvertes

- Épices : suivi précis des quantités ou simple « j'en ai / il n'y en a plus » ?
- Congélateurs : étiqueter les entrées avec date (voire QR code imprimé) ?
- Vin : simple inventaire avec millésime et fenêtre de garde, ou aussi notes de dégustation ?
- Association : recettes mises à l'échelle automatiquement pour 15-25 personnes ?
- Qui utilisera l'app dès le début (comptes à créer : mari, enfants) ?
- Y a-t-il des lieux avec une mauvaise connexion (cave, maison secondaire) où le hors ligne est critique ?
- Liste des magasins et sites d'achat à préconfigurer ?
