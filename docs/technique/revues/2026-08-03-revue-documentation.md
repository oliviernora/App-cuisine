# Revue de la documentation — App cuisine

*Revue par agent indépendant, 03/08/2026, lecture seule. Objectif : simplifier, supprimer le superflu (archiver, jamais perdre de passation).*

## 1. Vue d'ensemble — inventaire

Hors données Evernote (`Evernote/lots/*.txt` et `Evernote/textes/*.txt` sont des données d'extraction, pas de la documentation), le projet compte 23 fichiers Markdown :

| Fichier | Taille | Dernière modif (git) | Rôle |
|---|---|---|---|
| `docs/technique/cahier-de-tests.md` | 81 Ko / 251 lignes | 03/08 | Tests auto + manuels M1-M72 + journal des passages (lignes très longues) |
| `plan.md` | 62 Ko / 917 lignes | 03/08 | Passation entre sessions + historique de TOUS les chantiers depuis le 06/07 |
| `docs/utilisateur/fonctionnalites.md` | 36 Ko | 03/08 | Catalogue écran par écran, tenu à jour |
| `docs/utilisateur/cas-utilisation.md` | 24 Ko | 03/08 | Cas N1-N15 / NP1-NP15, source de vérité métier |
| `docs/utilisateur/design-guide.md` | 24 Ko | 02/08 | Identité « Marché », composants, règles UX |
| `docs/technique/suivi-cas-utilisation.md` | 13 Ko | 03/08 | Validation/couverture des cas + « Reste à faire transverse » |
| `docs/technique/architecture.md` | 11 Ko | 03/08 | Architecture, modèle de données, NFR — à jour |
| `docs/utilisateur/Archive/Commentaires sur l'appli actuelle.md` | 9 Ko | 25/07 | Commentaires 1 (16/07), tout annoté « CORRIGÉ » |
| `docs/utilisateur/exploitation.md` | 9 Ko | **16/07** | Lancer, publier, sauvegarder, dépanner |
| `claude.md` (= le CLAUDE.md projet) | 6 Ko | 06/07 | Spécification générale d'Olivier |
| `.claude/skills/principes-dev/SKILL.md` | 5,6 Ko | 06/07 | Méthode imposée |
| `docs/technique/mcp.md` | 4,7 Ko | 03/08 | Serveur MCP : principes, mise en service, dépannage |
| `Evernote/tri.md` | 4,2 Ko | 09/07 | Tri des douteuses — 12 encore à cocher par Olivier |
| `docs/utilisateur/Archive/commentaires-3-2026-07-28.md` | 4,2 Ko | 02/08 | Traité le 28/07 |
| `docs/utilisateur/Archive/commentaires-2-2026-07-27.md` | 3,9 Ko | 28/07 | Traité le 27/07 |
| `Evernote/instructions-extraction-lot.md` | 3,7 Ko | 09/07 | Instructions agents — chantier lots 6-24 encore ouvert |
| `docs/technique/poc-ollama.md` | 3,5 Ko | 10/07 | Verdict et pièges Ollama — encore référencé par exploitation.md |
| `docs/utilisateur/Archive/commentaires-2026-07-25.md` | 3,5 Ko | 28/07 | Traité le 25/07 |
| `docs/utilisateur/mise-en-ligne.md` | 2,5 Ko | **09/07** | Installation iPhone/iPad + (doublon) publication |
| `docs/utilisateur/commentaires 4.md` | 2,2 Ko | 03/08 | **Prochain chantier** (non traité) |
| `docs/README.md` | 2,2 Ko | 10/07 | Index de la documentation |
| `Evernote/README.md` | 2,2 Ko | 09/07 | Format de `recettes-data.json`, pipeline |
| `docs/utilisateur/creneaux-courses.md` | 1,3 Ko | 09/07 | Tableaux quasi vides « (à compléter) » |

Il n'y a pas de README.md à la racine du projet ; le point d'entrée réel est `plan.md` § Reprise rapide (confirmé par la mémoire de passation).

## 2. Redondances constatées (avec preuves)

**R1 — La procédure de publication existe en trois endroits.** `docs/utilisateur/exploitation.md` § « Publier une mise à jour » (version complète, avec le garde-fou « Si une migration est en attente… l'appliquer AVANT de publier ») ; `docs/utilisateur/mise-en-ligne.md` § « Publier une mise à jour (PC) » (version courte qui **omet ce garde-fou**, pourtant tiré d'une leçon du 16/07) ; et `plan.md` (Étape 7 + « Comment travailler avec la vraie base et la prod »). `plan.md` désigne lui-même la source de vérité : « Publication et dépannage : docs/utilisateur/exploitation.md ». La copie de mise-en-ligne.md est celle qui diverge dangereusement.

**R2 — Divergence interne à plan.md sur l'état du projet.** La section « L'essentiel » (lignes 294-313) dit : « Dernière version publiée : "7 juil. 2026, 20:35" », « 127 recettes », « npm test (96 verts + 1 todo NP4) », « cahier M1-M38 ». Or la Reprise rapide du même fichier (03/08) dit : prod publiée le 03/08 au soir, 175 tests verts, M70-M72, et la section MCP B3 dit « 173 recettes en base ». Quatre chiffres faux dans la section censée résumer l'essentiel.

**R3 — Divergence plan.md / exploitation.md sur `rapatrier-page`.** exploitation.md (figé au 16/07) dit encore : « **À redéployer** : la photo du plat ajoutée le 14/07/2026 nécessite de relancer la commande » ; plan.md dit : « Edge Function `rapatrier-page` redéployée le 16/07 au soir — M52 ✓ en réel ». La consigne périmée pourrait faire redéployer pour rien.

**R4 — Chaque chantier est raconté deux fois** : une sous-section narrative dans la Reprise rapide de plan.md ET une entrée du Journal des passages du cahier de tests (comparer plan.md § « Chantier livres non trouvés » et cahier, passages « 03/08/2026 » et « 03/08/2026 (2) »). Le cahier est le journal — c'est plan.md qui devrait se contenter d'un résumé court avec renvoi.

**R5 — Items réglés gardés entre parenthèses.** plan.md § « EN ATTENTE d'Olivier » mélange du vivant et du réglé : « (NP4 tranché le 16/07…) », « (Edge Function déployée, GO A3 donné et A3 livré le 10/07 ; M39-M40 ✓) », « (Compte dédié créé et rattaché le 10/07…) ». Même motif dans suivi-cas-utilisation.md § « Reste à faire transverse » : « (Migration appliquée le 06/07/2026 au soir…) », « (Migration recipe_ingredients… appliquée le 07/07…) ». Ce ne sont plus des « en attente » ni des « restes à faire ».

## 3. Obsolescences

**plan.md** — c'est le gros du sujet :
- Le titre même de la section vitale est faux : « Reprise rapide (**passation du 07/07/2026** au soir — à lire en premier) » alors que le contenu court jusqu'au 03/08.
- « Points chauds à vérifier en début de session » et « État de la base (réelle, à jour au **09/07**) » : figés à début juillet.
- Six chantiers terminés, migrés ET publiés (16/07, 19/07, 25/07, 27/07 ×2, 28/07, 02/08) occupent ~200 lignes de la Reprise rapide ; seuls leurs « RESTE » (tests iPhone M47, M48-M50, M55, M56-M58, M59-M62, M63-M67, M68-M69, M70-M72, rechargements du service worker) sont encore vivants — et ils sont éparpillés dans six sections sans qu'on sache lesquels ont été soldés.
- Doublon interne : deux sections pour le même chantier commentaires 3 (« lot 0 » du 27/07 au soir, lignes 147-164, entièrement absorbée par la section « LIVRÉ… le 28/07 »).
- Contradiction non purgée : la section du 28/07 dit « COMMIT à faire : les modifications des 27-28/07 ne sont pas commitées » alors que celle du 02/08 dit « COMMITS faits le 02/08 (1c83351 passation 28/07…) ».
- Les sections « Décisions prises (06/07) », « Étapes 0-7 » (lignes 446-893, dont Passard, Evernote détaillé, plan IA locale, MCP) sont pour l'essentiel de l'historique de chantiers finis, précieux comme archive mais plus comme passation.

**exploitation.md** : « Phase actuelle : **travail sur PC** (la mise en ligne viendra en fin de projet) » — faux depuis le 07/07 ; ligne de dépannage « clignotement… avant le 07/07 après-midi » caduque ; R3 ci-dessus. Ce document, source de vérité opérationnelle, n'a pas bougé depuis le 16/07 alors que six chantiers ont été publiés depuis.

**creneaux-courses.md** : tableaux « (à compléter) » jamais remplis, et le fichier constate lui-même sa propre caducité : « la référence des créneaux de marché est le calendrier Google "marchés"… Le planning des courses lira ce calendrier plutôt que ce tableau. »

**Pas obsolètes malgré leur âge** : poc-ollama.md (réglages encore en service, référencé par exploitation.md), mcp.md, Evernote/* (chantier lots 6-24 ouvert, 12 douteuses de tri.md en attente), les trois Archive/ (correctement archivés, statut en tête), commentaires 4.md (c'est le prochain chantier).

## 4. Trous (en restant sobre)

- **Aucune liste unique des tests iPhone en attente** : les M47…M72 non déroulés sont dispersés dans six sections de plan.md. C'est LE trou de passation.
- exploitation.md ne mentionne pas le MCP ni la procédure « migration pilotée par l'API Monaco » qui est devenue la pratique réelle (elle ne vit que dans plan.md § « Comment travailler avec la vraie base »). Un simple renvoi suffirait.
- Pas de point d'entrée à la racine — supportable puisque la mémoire dit de lire plan.md, mais une ligne en tête de plan.md pointant vers docs/README.md coûterait rien.

## 5. Propositions, classées par gain décroissant / risque croissant

**P1 — Restructurer plan.md avec un fichier d'archive (gain fort, risque quasi nul).** Créer `docs/technique/plan-archive.md` (ou `plan-historique.md`) et y **déplacer sans rien supprimer** : les chantiers terminés-publiés de la Reprise rapide (en extrayant d'abord leurs « RESTE » vivants), « Vérification du 19/07 », « État de la base au 09/07 », « Décisions prises (06/07) » devenues historiques, et tout le bloc « Étapes » 0-7 avec ses « Fait (06/07)… ». Garder dans plan.md : une Reprise rapide courte (chantier en cours = commentaires 4, le dernier chantier livré, l'essentiel corrigé), une liste unique « En attente d'Olivier / tests iPhone », « Comment travailler avec la vraie base et la prod » (leçons opérationnelles toujours actives), « Contraintes » et « Questions ouvertes ». Gain : plan.md passe d'environ 917 à 200-250 lignes, la passation redevient lisible en une lecture. Risque : nul sur l'information (archivage, pas suppression) ; seul point d'attention : bien reporter chaque « RESTE » avant de déplacer une section.

**P2 — Consolider les « RESTE » en une seule liste et la purger avec Olivier (gain fort, risque faible).** Rassembler M47, M48-M50, M55-M58, M59-M62, M63-M67, M68-M69, M70-M72 et les rappels « recharger l'app (service worker) » en un seul tableau. Olivier confirme ce qui a été fait ; ce qui n'est pas confirmé reste marqué « à confirmer ». C'est la seule proposition qui demande sa participation.

**P3 — Corriger les quatre chiffres périmés de « L'essentiel » (gain fort, risque nul).** Ou mieux : y remplacer les chiffres par des renvois (« état des tests : voir cahier, dernier passage »), pour que la section ne re-périme plus.

**P4 — Rafraîchir exploitation.md (gain fort, risque nul).** Retirer « Phase actuelle : travail sur PC », trancher le statut de `rapatrier-page` (redéployée le 16/07 d'après plan.md — à confirmer puis supprimer le « À redéployer »), retirer le dépannage « clignotement d'avant le 07/07 », et ajouter un renvoi d'une ligne vers plan.md/mcp.md pour la pratique migrations-en-session.

**P5 — Purger les parenthèses « réglé » (gain moyen, risque nul).** Dans plan.md § « EN ATTENTE d'Olivier » et suivi-cas-utilisation.md § « Reste à faire transverse », déplacer vers l'archive tout item entre parenthèses qui constate un fait accompli. Zéro perte : ces items disent eux-mêmes qu'ils sont clos.

**P6 — mise-en-ligne.md : renvoyer au lieu de dupliquer (gain moyen, risque nul).** Remplacer sa section « Publier une mise à jour (PC) » par un renvoi vers exploitation.md — la copie courte omet le garde-fou migration, c'est une redondance qui peut faire mal. Garder le reste (installation iPhone/iPad, réglages du 07/07 « pour mémoire ») : c'est son vrai rôle.

**P7 — Supprimer le doublon commentaires 3 dans plan.md (gain faible, risque nul).** La section « lot 0 » du 27/07 au soir est intégralement couverte par la section « LIVRÉ, MIGRÉ ET PUBLIÉ le 28/07 » ; direction l'archive.

**P8 — creneaux-courses.md (gain faible, risque faible).** Le réduire à cinq lignes : la décision « référence = calendrier Google "marchés" » et le renvoi. Alternative acceptable : le laisser tel quel (1,3 Ko). Si réduction, mettre à jour la ligne correspondante de docs/README.md (« à remplir par vous » ne correspond plus à la décision du 07/07).

## 6. À garder tel quel, et pourquoi

- **`docs/technique/cahier-de-tests.md`** : c'est un journal de passages réels (M1-M72), horodaté, invoqué comme preuve par plan.md et par les archives de commentaires. Un journal ne se déduplique pas ; c'est plan.md qui doit renvoyer vers lui (P1), pas l'inverse.
- **`docs/utilisateur/cas-utilisation.md`, `fonctionnalites.md`, `design-guide.md`, `docs/technique/architecture.md`, `suivi-cas-utilisation.md` (le tableau)** : à jour au 02-03/08, chacun avec un rôle net fixé par le skill principes-dev ; seule la section « Reste à faire transverse » du suivi mérite la purge P5.
- **`claude.md`, `.claude/skills/principes-dev/SKILL.md`** : la spécification et la méthode — intouchables (le SKILL contient d'ailleurs des sections « à compléter par Olivier » volontairement).
- **`docs/technique/mcp.md` et `poc-ollama.md`** : courts, exacts, encore en service (mcp.md documente B4 du 03/08 ; poc-ollama.md est le mode d'emploi des réglages Ollama référencé par exploitation.md).
- **`docs/utilisateur/commentaires 4.md`** : c'est le prochain chantier, annoncé en tête de la Reprise rapide. Il sera archivé dans `Archive/` une fois traité, comme les trois précédents — le rituel d'archivage des commentaires fonctionne déjà bien, ne rien y changer.
- **`docs/utilisateur/Archive/*`** : déjà là où il faut, avec un statut clair en tête de chaque fichier.
- **`Evernote/README.md`, `tri.md`, `instructions-extraction-lot.md`** : le chantier lots 6-24 (~250 fiches) est explicitement ouvert dans plan.md et tri.md attend encore 12 décisions d'Olivier.

En résumé : le superflu n'est pas dans le nombre de fichiers (la structure docs/utilisateur / docs/technique / Archive est saine) mais concentré dans **plan.md** (700 lignes d'historique mélangées à 200 lignes de passation vivante) et dans **exploitation.md** (figé au 16/07 alors qu'il est la référence opérationnelle). P1-P4 traitent l'essentiel ; tout le reste est du polissage.
