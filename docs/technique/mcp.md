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
- B2 (à venir) : écritures métier (créer une recette avec dédoublonnage,
  consigner une réalisation…) avec mode « à blanc », export JSON
  automatique avant toute écriture en masse, journal des actions.
- B3 : premier usage réel — les lots Evernote 3-24 importés via le MCP.

## Mise en service (une fois)

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
