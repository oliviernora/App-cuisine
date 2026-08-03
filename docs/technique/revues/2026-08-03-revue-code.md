# Revue de code « Garde-manger » — simplifications possibles

*Revue par agent indépendant, 03/08/2026, lecture seule. Objectif : simplifier, retirer le superflu.*

## Vue d'ensemble

Le cœur de l'application tient en **~5 500 lignes** dans `app/src` (dont un store central `store.svelte.js` de 1 957 lignes et 15 composants Svelte), **505 lignes** de serveur MCP (`mcp/index.mjs`), ~4 700 lignes de tests, 517 lignes de CSS. Architecture saine : un seul store réactif qui parle à Supabase, des composants par onglet, des modules purs partagés (`ligne-ingredient.js` app + MCP), une Edge Function de 62 lignes pour le CORS. Le code est globalement **déjà simple et discipliné** — les propositions ci-dessous sont du ménage ciblé, pas une refonte. Aucune classe CSS orpheline, aucune icône inutilisée, aucune dépendance npm morte (vérifié).

## Propositions, du meilleur ratio gain/risque au moins bon

### 1. Supprimer l'inventaire d'épices initial (seed) — mort ET cassé
- **Fichiers** : `app/src/lib/seed.js` (161 lignes entières), `app/src/components/Onboarding.svelte:5,34-37` (case « Importer l'inventaire d'épices initial »), `app/src/lib/store.svelte.js:2` et `:215-226` (paramètre `withSeed`).
- **Preuve** : `seedRows` n'est appelé que par `createHousehold`, c'est-à-dire uniquement à la création d'un **nouveau** foyer — or le foyer existe et les nouveaux membres passent par « Rejoindre ce foyer » (le seul parcours d'onboarding encore utile). Surtout, **ce code est cassé depuis les résidences du 16/07** : `seedRows` insère des items **sans `residence_id`** (`seed.js:145-160`), alors que `refresh()` filtre par résidence (`store.svelte.js:201-207`) — les 160 épices seraient invisibles. Il écrit aussi `items.min`, colonne marquée « plus lue » dans `supabase/schema.sql:38`. Aucun test ne l'utilise (grep : zéro occurrence hors Onboarding/store).
- **Gain** : ~170 lignes. **Risque** : quasi nul (garder `createHousehold` sans le paramètre, et le flux « Rejoindre »).

### 2. Factoriser la reconnaissance vocale, copiée trois fois
- **Fichiers** : `Stock.svelte:222-277`, `Inventory.svelte:117-156`, `RangerCourses.svelte:76-112`.
- **Preuve** : les trois blocs `SpeechRecognition` (création, `interimResults`, `onstart/onend/onerror/onresult`, `toggleMic`) sont quasi identiques, ~40 lignes chacun, y compris les mêmes contournements iPhone commentés trois fois. Seul le callback `applyVoice` diffère.
- **Gain** : un petit module `lib/dictee.js` (facteur prenant `onText`) supprimerait ~70-80 lignes nettes et surtout **un seul endroit** à corriger la prochaine fois que l'iPhone fait des siennes. **Risque** : faible-modéré (trois écrans touchés ; `tests/integration/dictee.test.js` couvre déjà la logique).

### 3. Le repli d'accents `fold()` est défini 7 fois
- **Preuve** : `function fold` (ou `foldml`, `foldw`) existe dans `Recettes.svelte:22`, `Stock.svelte:48`, `Inventaires.svelte:155`, `Semaine.svelte:108`, `Inventory.svelte:18`, `RangerCourses.svelte:25`, plus `store.svelte.js:998` et `mcp/index.mjs:68` — toutes identiques (3 lignes).
- **Gain** : exporter `fold` du store (il y est déjà) et supprimer 6 copies : ~20 lignes et une garantie de cohérence. **Risque** : minime.

### 4. Listes de magasins codées en dur, doublonnant les « Lieux d'achat » gérés
- **Fichiers** : `Stock.svelte:13` et `Shopping.svelte:11` (`const STORES = ['Leclerc', 'Grand Frais', …]`).
- **Preuve** : depuis le 28/07 les lieux d'achat vivent en base (table `stores`, écran LieuxAchat, `store.lieux`). Le datalist de Stock ignore complètement `store.lieux` ; celui de Shopping mélange les deux. Un lieu renommé dans l'app resterait proposé sous son ancien nom en dur.
- **Gain** : ~5 lignes, mais surtout une seule source de vérité. **Risque** : faible.

### 5. Résidu `items.min` : trompeur côté MCP
- **Fichiers** : `mcp/index.mjs:260` (l'outil `stock` affiche `i.min`), `supabase/schema.sql:38` (colonne « héritée… plus lue »).
- **Preuve** : le vrai minimum vit sur `ingredient_refs.min` (schema.sql:245, `minOf` dans le store). L'outil MCP montre donc à Claude une valeur toujours périmée (0).
- **Gain** : 1 ligne corrigée (afficher le min du référentiel, ou rien) ; à terme, la colonne pourra sortir de `check-schema.mjs:14` et du schéma. **Risque** : faible.

### 6. Solde de l'ancien flux « reçu » (`shopping.received`)
- **Fichiers** : `store.svelte.js:438,452-459`, `Shopping.svelte:20,26`, `RangerCourses.svelte:30`, `schema.sql:57`, `check-schema.mjs:15`.
- **Preuve** : le commentaire du store le dit lui-même — « la colonne `received` ne sert plus qu'aux éventuelles lignes d'avant la bascule » du 27/07. Un `UPDATE shopping SET done = true WHERE received` en prod (main d'Olivier), puis suppression des ~6 références.
- **Gain** : ~10 lignes et un concept en moins dans trois écrans. **Risque** : faible, mais demande un petit SQL prod — à faire à l'occasion d'une autre migration.

### 7. Quatre `export` jamais importés ailleurs
- **Preuve (grep composants + tests = 0)** : `displayPart` (`store.svelte.js:1373`), `stashReceived` (`:489`), `eventScale` (`:1386`), `minOf` (`:243`) ne sont utilisés qu'en interne du store.
- **Gain** : retirer le mot-clé `export` (lisibilité : on sait qu'ils sont privés). **Risque** : nul.

### 8. Petites redondances app ↔ MCP
- `mcp/index.mjs:72-75` redéfinit `ingredientLine` alors que le module partagé `ligne-ingredient.js:53-56` l'exporte déjà (et est déjà importé ligne 19) — seule la mention « [à commander à l'avance] » diffère. ~4 lignes.
- La liste `TABLES` du MCP (`mcp/index.mjs:24-27`) a **oublié `stores` et `residences`** que `check-schema.mjs` vérifie : `controle_schema` et la sauvegarde avant import sont donc incomplets. Deux mots à ajouter — alignement plus que simplification.

### 9. Découpage de `Recettes.svelte` (671 lignes) — seulement si un chantier le touche
- **Preuve** : le fichier cumule cinq responsabilités : liste + filtres, fiche (lecture/édition), gestion des sources + livres à compléter, et tout l'import (URL, photos IA, texte collé — état lignes 186-306, gabarit 508-595, ~220 lignes autonomes).
- **Gain** : extraire `ImportRecette.svelte` allégerait le fichier d'un tiers sans changer une ligne de logique. À faire **au moment du chantier « écran dédié livres/URL »** annoncé dans plan.md (commentaires 4, point 6) plutôt qu'à froid. **Risque** : modéré (pur déplacement, mais gros diff).
- Même logique, en plus petit : `madeLabel`/`recent` sont dupliqués entre `Recettes.svelte:82-94` et `Semaine.svelte:123-134` (~15 lignes), et la dérivation `locNames` entre `Stock.svelte:39-43` et `RangerCourses.svelte:40-44`.

### 10. À vérifier avant d'agir : `recipes.video`
- `Recettes.svelte:369` affiche `recipe.video`, mais **rien dans l'app ni le MCP n'écrit jamais cette colonne** (grep : une seule occurrence). Elle date de l'amorçage Passard. Si aucune recette en base n'a de vidéo, la ligne d'affichage et la colonne (schema.sql:164, check-schema.mjs:20) peuvent disparaître. Un `SELECT count(*) WHERE video <> ''` en prod tranchera.

## Ce qu'il ne faut PAS toucher (examiné puis écarté)

- **`Evernote/` + `app/scripts/enex-*.mjs` + outil MCP `importer_recettes_evernote`** : ils semblent finis, mais plan.md (lignes 665-670 et 845-850) est formel — **les lots 6 à 24 (~250 fiches) restent à importer**. Tout le pipeline (y compris `sauvegarde()` et le jeton dans le MCP) sert encore.
- **`archive/` et `app/tests/helpers/passard*.js`** : archivage volontaire du 27/07 (cahier-de-tests.md:205) ; les helpers Passard sont des **fixtures vivantes** de 10 fichiers de tests.
- **`app/scripts/poc-extract-ollama.mjs`** : POC rejouable documenté (`docs/technique/poc-ollama.md:7`), à garder.
- **Les verrous de synchro** (`shopSyncRunning`, `weekSyncRunning`, store.svelte.js:334, 1477) : ils ont l'air d'une sur-ingénierie mais corrigent des bugs réels documentés (liste qui clignote du 07/07, doublons du 16/07). Ne pas y toucher.
- **Les `schemaWarning` partout** : ce n'est pas de la programmation défensive gratuite — c'est le principe « aucune dégradation silencieuse » du skill principes-dev, prouvé utile lors des migrations.
- **`demarrer.cmd` / `mettre-en-ligne.cmd`** : ce sont les scripts d'exploitation d'Olivier (référencés dans la doc d'exploitation).
- **CSS, icônes, dépendances npm** : vérifiés une à une — aucune classe CSS inutilisée, les 13 icônes servent toutes, chaque dépendance a son usage (ZXing chargé à la demande ; `sharp` ne sert qu'au script d'icônes ponctuel — supprimable si on veut, mais sans effet sur l'app).
- **`Onboarding.svelte`** (hors seed) : le flux « Rejoindre ce foyer » est le chemin d'entrée des nouveaux membres du foyer.
- **`store.svelte.js` en un seul fichier** : 1 957 lignes, mais bien sectionné par commentaires, sans dépendances circulaires, et chaque fonction est courte. Le découper créerait plus de tuyauterie qu'il n'en supprimerait — seuls les petits utilitaires purs (dictée, `editDistance`) mériteraient éventuellement de rejoindre `lib/` un jour.

En appliquant les points 1 à 7 (les moins risqués), on retire environ **280-300 lignes** de code applicatif et trois sources de divergence future, sans changer aucun comportement visible — sauf la disparition d'une case à cocher d'onboarding qui, aujourd'hui, produirait un stock invisible.
