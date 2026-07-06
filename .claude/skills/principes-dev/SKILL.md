---
name: principes-dev
description: Principes de développement imposés par Olivier pour l'app cuisine. À charger IMPÉRATIVEMENT avant tout développement, correction ou évolution de l'application (app/, poc/, supabase/). Ces principes priment sur toute autre habitude de développement.
---

# Principes de développement — App cuisine

Ces principes sont définis par Olivier. Ils sont impératifs : aucune livraison
ne se fait sans les avoir respectés.

## Statut

EN COURS DE RÉDACTION — Olivier dicte ses principes au fil de l'eau ; ils sont
intégrés ici et priment. Les sections encore vides sont à compléter par lui.

## 1. Les cas d'utilisation d'abord (principe dicté le 06/07/2026)

Les cas d'utilisation ne sont PAS des fonctionnalités.

- Un cas d'utilisation est un **usage du client de bout en bout** : un
  processus complet vu du client, pas une liste d'écrans ou de boutons.
- Ils **partent de la spécification générale** (les objectifs high level de
  claude.md) et définissent les processus client.
- Ils servent à : vérifier le flow vu du client, valider l'ergonomie, et
  mettre en place les **tests d'intégration**.
- Il y a les cas d'usage **nominaux** (tout se passe bien) et, dans un
  deuxième temps, les cas **non passants** (exemple : j'ai demandé de
  commander un produit, et je retrouve ce produit dans mes réserves).
- Ils sont **validés par Olivier** et doivent être **compréhensibles par une
  personne non technique**.
- Garder un **nombre de cas raisonnable**, au niveau du besoin, pas de la
  fonctionnalité (« je planifie ma semaine », jamais « je calcule des
  quantités »). Les cas **non passants sont regroupés ensemble, après tous
  les cas nominaux** (principes dictés le 06/07/2026).
- Le document des cas ne contient QUE les usages : le suivi (validation,
  couverture, reste à faire) se tient dans
  `docs/technique/suivi-cas-utilisation.md` (principe dicté le 06/07/2026).
- Les documents destinés à Olivier vivent dans `docs/utilisateur/`, les
  documents internes dans `docs/technique/` (index : `docs/README.md`).
- Document : `docs/utilisateur/cas-utilisation.md`. Le catalogue des fonctionnalités,
  écran par écran, est un document distinct (`docs/utilisateur/fonctionnalites.md`) qui
  ne remplace pas les cas d'utilisation.

## 2. Avant de coder

- Identifier les cas d'utilisation touchés par la modification, y compris
  les parcours inverses (annuler, supprimer, revenir en arrière).
- Lister les cas limites et décider explicitement du comportement de chacun.
  Si un comportement est ambigu ou relève d'un choix d'usage, le proposer à
  Olivier AVANT de coder, ne pas trancher seul.

## 3. Pendant le développement

- (à compléter par Olivier)

## 4. Tests (principes dictés le 06/07/2026)

- Les tests sont **mis à jour au fur et à mesure** du développement,
  notamment les tests d'intégration (dérivés des cas d'utilisation).
- Ils sont **passés systématiquement** avant toute livraison :
  **l'utilisateur doit tester la maquette, pas découvrir les bugs.**
- Les tests d'intégration tournent sur un simulateur : ils ne voient pas la
  vraie base. Toute livraison vérifie AUSSI que le schéma réel est conforme :
  `npm run check:schema` (leçon du 06/07/2026 : migration manquante non
  détectée par la suite de tests, découverte par Olivier).
- Aucune dégradation silencieuse : si une écriture échoue (schéma manquant,
  réseau), l'application l'affiche.
- Suite de tests : `app/tests/` (`npm test` dans `app/`). Tout nouveau cas
  d'utilisation validé y ajoute ses tests ; tout bug corrigé y ajoute un test
  qui l'aurait attrapé.
- En complément : tester chaque cas d'utilisation touché de bout en bout dans
  l'application réelle (navigateur), y compris les cas non passants et les
  interactions croisées entre modules (ex. une suppression en liste de
  courses doit avoir un effet cohérent sur l'état « en cours d'achat » du
  stock), puis confronter le comportement observé aux cas d'utilisation
  validés (docs/utilisateur/cas-utilisation.md).

## 5. Documentation à jour (principe dicté le 06/07/2026)

- La documentation doit être à jour, en permanence : toute livraison qui
  change un comportement met à jour dans le même temps les documents
  concernés — index dans `docs/README.md` : cas d'utilisation,
  fonctionnalités, design guide (si l'UX est touchée), architecture/NFR,
  exploitation, cahier de tests (tableau + journal des passages), plan.

## 6. Design guide UX (principe dicté le 06/07/2026)

- Il doit y avoir un design guide pour l'UX : `docs/utilisateur/design-guide.md`.
- Les écrans utilisés au quotidien restent libres des actions
  exceptionnelles (inventaire, invitation, réglages…) : celles-ci vivent
  dans des onglets ou panneaux dédiés (principe dicté le 06/07/2026).
- Toute nouvelle interface le respecte ; tout nouveau motif d'interface
  (composant, couleur, geste) y est ajouté avant d'être utilisé.

## 7. Communication

- Signaler à Olivier tout comportement découvert en cours de route qui n'a
  pas été décidé explicitement, plutôt que de le laisser exister par accident.

## Exemple fondateur (à ne jamais reproduire)

Supprimer un produit auto-ajouté de la liste de courses le ré-ajoutait
aussitôt (règle « 0 pot = en courses »), rendant la suppression sans effet et
laissant le produit « en cours d'achat » côté stock. Ce parcours n'avait été
ni décidé avec Olivier, ni testé de bout en bout avant livraison.
