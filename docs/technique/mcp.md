# Serveur MCP « garde-manger »

Claude travaille sur la vraie base via des **actions métier**, jamais de SQL
libre ni de collage au dashboard (plan du 10/07/2026, section « MCP
garde-manger »). Code : `mcp/index.mjs`, déclaré dans `.mcp.json` à la
racine (Claude Code le charge automatiquement dans ce projet).

## Principes d'intégrité

- Connexion par un **compte Supabase dédié**, simple membre du foyer : la
  RLS s'applique à toutes ses requêtes. **Jamais la service key.**
- Identifiants dans `mcp/.env` (copie de `mcp/.env.exemple`), **hors git**.
- B1 (livré le 10/07/2026) : **lecture seule** — `recherche_recettes`,
  `fiche_recette`, `stock`, `liste_courses`, `master_list`,
  `controle_schema`.
- B2 (livré le 10/07/2026) : **écritures métier** —
  - `importer_recettes_evernote` : import en masse de
    `Evernote/recettes-data.json`, TOUJOURS en deux temps : `a_blanc`
    (rapport créer/ignorer + **jeton**) → GO explicite d'Olivier →
    `executer` avec le jeton (un jeton faux ou périmé est refusé).
    **Sauvegarde JSON automatique** de toutes les tables du foyer avant
    l'exécution (`mcp/sauvegardes/`). Dédoublonnage par URL sinon
    titre+source ; jamais de réalisation créée (décision du 07/07).
  - `creer_recette` (unitaire, dédoublonnée, lignes d'ingrédients parsées
    par le parseur de l'app — module partagé `app/src/lib/ligne-ingredient.js`),
    `ajouter_realisation` (unitaire).
  - `journal_actions` : toutes les écritures (et refus) sont consignées
    dans `mcp/journal.jsonl` (hors git), les plus récentes en premier.
  - Pas d'outil de suppression (décision : rien de destructif via le MCP
    pour l'instant — le retrait d'un `pending_books` complété est la
    seule exception, c'est la fin de vie normale de la ligne).
- B4 (livré le 03/08/2026, NP15 révisé) : **bibliothèque** —
  - `livres_a_completer` : la file des ISBN mis de côté au scan
    (introuvables par l'app : Google Books, Open Library, BnF).
  - `completer_source` : documente un livre trouvé par la recherche web
    de Claude — création (ou complément des champs vides d'un titre déjà
    présent, jamais d'écrasement, doublon d'ISBN refusé), couverture
    rapatriée depuis son URL dans le bucket privé
    (`<foyer>/couvertures/<source>.jpg`, image ≤ 8 Mo), ligne retirée de
    la file. Journalisé, comme toute écriture.
  - Procédure « compléter la bibliothèque » : `livres_a_completer` →
    recherche web de chaque ISBN (libraires, éditeurs) →
    `completer_source` un par un → compte rendu à Olivier, qui relit
    dans l'app (Gérer les sources).
- B3 (démarré le 10/07/2026) : les lots Evernote importés via le MCP —
  lot 2 (10 recettes) importé le jour même avec GO d'Olivier ; les lots
  suivants suivent le même cycle extraction (agents) → enex-merge →
  a_blanc → GO → executer.

## Mise en service (FAITE le 10/07/2026 — gardé pour référence)

Compte dédié créé par Olivier (dashboard, Auto Confirm), rattaché au foyer
par le code d'invitation, `mcp/.env` rempli par Olivier. Chaîne validée en
réel : 15 tables OK au `controle_schema`, 2 membres au foyer, les 6 outils
répondent sur les vraies données. Deux corrections au passage : la colonne
d'emplacement du stock s'appelle `loc` (pas `location`) et l'origine des
lignes de courses vaut `semaine` (pas `week`).

1. **Créer le compte dédié** (main d'Olivier — le mot de passe ne passe
   jamais par une session Claude) :
   - Dashboard Supabase → Authentication → Users → **Add user** →
     « Create new user » : email (ex. `claude@mimoli.com`), mot de passe
     robuste, **cocher « Auto Confirm User »**.
   - Dans un **navigateur en fenêtre privée** : ouvrir
     https://garde-manger-chi.vercel.app, se connecter avec ce compte,
     et **rejoindre le foyer** avec le code d'invitation (visible depuis
     le compte d'Olivier : menu → Foyer et compte).
2. `cd mcp && npm install` (fait le 10/07/2026).
3. Copier `mcp/.env.exemple` en `mcp/.env` et le remplir (URL et clé
   publishable identiques à `app/.env`, email et mot de passe du compte
   dédié) — à faire par Olivier, hors session.
4. Relancer Claude Code dans le projet : le serveur « garde-manger »
   apparaît ; premier contrôle : demander à Claude d'appeler
   `controle_schema` (15 tables OK attendues).

## Dépannage

- « mcp/.env introuvable » : l'étape 3 n'est pas faite.
- « connexion Supabase refusée » : email/mot de passe faux, ou compte non
  confirmé (recréer avec Auto Confirm).
- « membre d'aucun foyer » : l'étape 1b (rejoindre le foyer) n'est pas
  faite — sans elle la RLS ne montre RIEN, par construction.
