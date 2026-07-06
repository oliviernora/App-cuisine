# Garde-manger — architecture et exigences non fonctionnelles

## Vue d'ensemble

Application web monopage (SPA) installable en PWA, adossée à un service de
données hébergé.

```
iPhone / iPad / PC (navigateur ou icône écran d'accueil)
        │
   Application Svelte 5 + Vite  (app/)
        │  HTTPS (API REST + WebSocket temps réel)
   Supabase cloud (projet « garde-manger », région Europe)
        ├─ PostgreSQL : données du foyer
        ├─ Auth : comptes email + mot de passe
        └─ Realtime : notification des changements
```

- Le navigateur parle directement à Supabase : pas de serveur applicatif à
  exploiter.
- Hors ligne : le service worker sert l'application, un miroir local
  (localStorage) sert les dernières données connues, consultation seule.

## Structure du code (`app/`)

| Chemin | Rôle |
|---|---|
| `src/App.svelte` | racine : session, foyer, onglets, bandeau hors ligne |
| `src/components/Auth.svelte` | connexion / création de compte |
| `src/components/Onboarding.svelte` | créer ou rejoindre un foyer, import initial |
| `src/components/Stock.svelte` | inventaire : recherche, filtres, lignes, voix |
| `src/components/Shopping.svelte` | liste de courses par magasin, rangement |
| `src/lib/store.svelte.js` | état partagé, opérations, synchro, cache hors ligne |
| `src/lib/supabase.js` | client Supabase (URL + clé dans `.env`) |
| `src/lib/seed.js` | inventaire initial des épices |
| `src/app.css` | design system « Marché » (jetons + composants) |
| `tests/` | tests d'intégration (voir cahier-de-tests.md) |
| `scripts/make-icons.mjs` | génération des icônes PWA |

## Modèle de données

| Table | Contenu | Particularités |
|---|---|---|
| `households` | foyers | |
| `household_members` | qui appartient à quel foyer | clé (foyer, utilisateur) |
| `items` | ingrédients : nom, emplacement, pots (`qty`), seuil (`min`), magasin | un même produit peut exister dans plusieurs emplacements (décision Olivier) |
| `shopping` | liste de courses : libellé, magasin, `done`, `manual`, lien `item_id` | une seule entrée par ingrédient lié (index unique) |

Schéma complet : `supabase/schema.sql`.

Règles métier centrales (implémentées dans `store.svelte.js`) :
- `qty <= min` → entrée automatique en courses ; remontée du stock → l'entrée
  automatique non cochée disparaît.
- Entrée `manual` (panier « réserve ») : ne disparaît que sur geste explicite.
- « Ranger les achats » : chaque entrée cochée liée → `qty + 1`, puis purge.

## Sécurité

- **Row Level Security** sur toutes les tables : un utilisateur ne voit et ne
  modifie que les données de son foyer (fonction `is_member`, security
  definer). Vérifié par la base elle-même, pas par l'application.
- La clé `publishable` est faite pour être publique ; la sécurité repose sur
  RLS + comptes. Aucune clé secrète (`service_role`) dans le code ni le repo.
- Rejoindre un foyer exige son code (UUID non devinable), transmis par un
  membre.
- Recettes scannées (à venir) : copie privée, jamais publique — contrainte de
  la spécification.

## Exigences non fonctionnelles

| Exigence | Cible | État |
|---|---|---|
| Multi-appareils | PC, iPhone 13, iPad — mêmes données en temps réel | fait |
| Réactivité perçue | action reflétée immédiatement (mise à jour optimiste) | fait |
| Volume | fluide avec 500+ produits par foyer | fait (~160 aujourd'hui) |
| Hors ligne | consultation toujours possible ; à terme, cocher hors ligne | partiel (consultation) |
| Poids | application < 300 Ko compressée | fait (~80 Ko gzip) |
| Accessibilité | focus visible, contrastes 4.5:1, aria-labels, reduced motion | fait |
| Langue | interface 100 % français | fait |
| Coût de fonctionnement | 0 €/mois (offres gratuites) ; quelques €/mois acceptés à terme | fait |
| Sauvegarde | sauvegarde régulière des données (spécification) | **à faire** — voir exploitation.md |
| Réversibilité hébergement | migration possible vers un VPS OVH (Supabase auto-hébergé) | prévu, sans réécriture |

## Décisions techniques (résumé)

Voir `plan.md` pour l'historique complet : PWA plutôt qu'app native (une
seule base de code PC + iOS), Supabase cloud plutôt qu'auto-hébergé
(l'hébergement OVH actuel ne le permet pas ; migration possible plus tard),
Svelte 5 + Vite (code simple et léger), tests Vitest sur simulateur de base
en mémoire.
