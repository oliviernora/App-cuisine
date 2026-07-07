# Suivi des cas d'utilisation

Validation et couverture des cas de `docs/utilisateur/cas-utilisation.md`.
Mis à jour à chaque livraison.

Renumérotation du 06/07/2026 (revue d'Olivier, fusions) : N3 reformulé
(« je prépare mes courses », quantités incluses) ; ex-N6+N7 → N6
(rangements + déplacements, y compris par liste cochée) ; ex-N8 datés → N7
(réécrit générique, exemples en fin de cas) ; ex-N9+N10+N11 → N8 (« je fais
une recette et je la consigne ») ; ex-N12 → N9 ; ex-N13+N15 → N10 (« je
planifie ma semaine », courses et planning inclus) ; ex-N14 → N11.

| Cas | Validation | Couverture | Notes |
|---|---|---|---|
| N1 épuiser/racheter | validé | couvert, testé | |
| N2 inventaire | dicté par Olivier | couvert, testé | date du dernier inventaire : migration `locations` en attente ; complément « emplacement daté » non couvert (lié à N7) |
| N3 je prépare mes courses | reformulé par Olivier 06/07 | partiel | le panier « réserve » existe ; **manque : quantité voulue à l'ajout** (recoupe NP4) |
| N4 courses multi-lieux | validé, amendé | partiel | amendement à couvrir : voir/cocher les autres listes |
| N5 foyer | validé | couvert | test manuel M4 à dérouler |
| N6 rangements + déplacements | fusionné par Olivier 06/07 | **couvert, testé** (06/07) | déplacement unitaire et par produits cochés, regroupement des doublons, renommage, fusion (2 touches) — panneau « Gérer » de l'onglet Inventaire |
| N7 emplacements datés | proposition précisée (générique + exemples) | non couvert | alerte d'ancienneté : question ouverte |
| N8 je fais une recette et je la consigne | fusionné par Olivier 06/07 | **partiel** (incrément 1, 06/07) | consigner date+commentaire : fait ; amorçage 105 recettes Passard : fait (import en attente de la migration) ; reste : photos, extraction IA (clé API), imports en volume (logiciel de scan à préciser) |
| N9 retrouver une recette | proposition | **partiel** (incrément 1) | recherche par titre + fiche (source, dates, lien) ; reste : par ingrédient/pays/livre (viendra avec les données structurées) |
| N10 planifier ma semaine | fusionné par Olivier 06/07 (inclut courses et planning) | **partiel** (incrément 1, 06/07) | fait : événements (jour, type, convives, contraintes), recettes associées avec alerte < 1 an, consignation à la date de l'événement ; reste : quantités à l'échelle (attend les ingrédients structurés), vérification liste de courses, planning des tournées (attend créneaux + décision), agenda Google |
| N11 wish list / beau produit | proposition | non couvert | étape 5 |
| NP1 produit retrouvé | décidé par Olivier | couvert, testé | |
| NP2 rupture en magasin | validé | couvert, testé | |
| NP3 coché par erreur | validé | couvert, testé | |
| NP4 plusieurs pots d'un coup | **décision en attente** | partiel (+1 fixe) | recoupe N3 reformulé : quantités à l'ajout et à l'achat |
| NP5 pas de réseau | validé | partiel | consultation hors ligne OK ; cocher hors ligne à faire |
| NP6 inventaire interrompu | validé | couvert, testé | |
| NP8 produit après planning | proposition | non couvert | avec N10 |
| NP9-NP11 (recettes) | propositions | non couverts | étape 4 |
| NP12-NP13 (semaine) | propositions | non couverts | étape 5 |

NP1 à NP13 : non revus par Olivier lors de sa relecture du 06/07/2026 (il
n'a revu que les nominaux). NP7 : numéro retiré (décision Olivier).

## Reste à faire transverse

- (Migration appliquée le 06/07/2026 au soir — schéma complet conforme,
  import Passard réel effectué ; date d'inventaire à constater au prochain
  inventaire réel.)
- Amendement N4 (autres listes) et N3 (quantités) : prochain lot courses.
- Migration `recipe_ingredients` + `recipes.steps` en attente (dashboard
  Supabase instable au soir du 06/07) — fichier prêt.
- Rapprochement ingrédients ↔ stock : v1 par nom exact (accents/casse
  ignorés) ; à améliorer par des liens explicites (alias) confirmés à
  l'usage — remarque d'Olivier du 06/07.
- Ingrédients des 105 recettes Passard à remplir : extraction des articles
  Le Point (91 URLs) à automatiser, ou saisie au fil de l'eau dans la fiche.
- Sauvegarde régulière des données (exigence NFR, voir architecture.md).
- Réinitialisation de mot de passe dans l'application.
