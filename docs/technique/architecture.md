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
| `src/components/Stock.svelte` | stock : recherche, filtres, lignes, voix, ajout |
| `src/components/Shopping.svelte` | courses par magasin (réappro + semaine), rangement |
| `src/components/Recettes.svelte` | bibliothèque : recherche multicritère, fiches, sources |
| `src/components/Semaine.svelte` | événements à venir/passés, recettes, ajustements, courses de la semaine |
| `src/components/Inventaires.svelte` | emplacements, master list des ingrédients, rapprochements |
| `src/components/Inventory.svelte` | mode inventaire (pausable, choix en cas d'ambiguïté) |
| `src/lib/store.svelte.js` | état partagé, opérations, synchros, cache hors ligne |
| `src/lib/supabase.js` | client Supabase (URL + clé dans `.env`) |
| `src/lib/seed.js` | inventaire initial des épices |
| `src/lib/passard.js`, `passard-fiches.js` | collection Alain Passard (import + fiches) |
| `src/app.css` | design system « Marché » (jetons + composants) |
| `tests/` | tests d'intégration (voir cahier-de-tests.md) |
| `scripts/check-schema.mjs` | conformité du schéma réel (obligatoire avant livraison) |
| `scripts/extract-enex.mjs`, `enex-lots.mjs`, `enex-merge.mjs` | pipeline d'import Evernote (voir `Evernote/README.md`) |
| `scripts/make-icons.mjs` | génération des icônes PWA |

## Modèle de données

| Table | Contenu | Particularités |
|---|---|---|
| `households` | foyers | |
| `household_members` | qui appartient à quel foyer | clé (foyer, utilisateur) |
| `items` | stock : nom, emplacement, pots (`qty`), seuil (`min`), magasin | un même produit peut exister dans plusieurs emplacements |
| `shopping` | courses : libellé, magasin, `done`, `manual`, `qty`/`unit`, `origin` (`reappro`/`semaine`), `available` (« je l'ai »), lien `item_id` | une seule entrée par ingrédient lié (index unique) |
| `locations` | emplacements : nom, date du dernier inventaire | |
| `sources` | livres et sites (liste courte, gérée) | |
| `recipes` | recettes : titre, url, vidéo, texte (`steps`), « pour N » (`servings`), pays (`country`), notes | |
| `recipe_ingredients` | ingrédients structurés : position, `qty`, `unit`, `name` | |
| `realisations` | dates où une recette a été faite + commentaire | `made_on` null = date non notée |
| `events` | événements de la semaine : jour, type, convives, contraintes | |
| `event_recipes` | recettes d'un événement + ajustements : `scale_pct`, `qty_overrides` | clé (événement, recette) |
| `ingredient_refs` | master list : nom canonique, alias, refus, catégorie | rapprochements confirmés à la main |

Schéma complet : `supabase/schema.sql`. ATTENTION : Postgres renvoie les
colonnes `numeric` en texte — toute comparaison de quantités passe par
`sameQty` (leçon du 07/07/2026).

Règles métier centrales (implémentées dans `store.svelte.js`) :
- `qty <= min` → entrée automatique en courses ; remontée du stock → l'entrée
  automatique non cochée disparaît.
- Entrée `manual` (panier « réserve ») : ne disparaît que sur geste explicite.
- « Ranger les achats » : entrée cochée liée → `qty + 1`, puis purge ; entrée
  « semaine » cochée → `available = true` (le besoin est couvert).
- `syncWeekShopping()` : les ingrédients manquants des événements à venir ont
  chacun leur ligne `origin='semaine'`, créée/requantifiée/retirée à chaque
  changement (événements, recettes, stock, ajustements) ; jamais de doublon
  avec le réappro ; verrou de réentrance ; ne tourne qu'après le chargement
  des recettes (`store.recipesLoaded`).
- Échelle d'une recette pour un événement : convives ÷ `servings` ×
  `scale_pct`, corrections absolues par ingrédient dans `qty_overrides`.
- Rapprochement des noms d'ingrédients : nom replié (casse/accents ignorés)
  ou alias confirmé dans `ingredient_refs` — jamais de fusion silencieuse.
- En dev, une mise à jour à chaud de `store.svelte.js` recharge la page
  entière (sinon, instances zombies concurrentes — leçon du 07/07/2026).

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
