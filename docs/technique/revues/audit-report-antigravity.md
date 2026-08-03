# Rapport d'Audit Global Consolidé — Application Cuisine (Garde-Manger)

**Date d'audit** : 03 août 2026  
**Portée de l'audit** : Application web PWA (Svelte 5 / Vite / Supabase), Documentation, Tests, Cybersécurité, Ergonomie Mobile (iPhone/iPad) & Exploitation.  
**Méthodologie** : Audit multi-agents indépendant à 5 axes (aveugle), suivi d'un bilan différentiel avec les revues historiques (`docs/technique/revues/`).

---

## 1. Synthèse Exécutive & Tableau de Bord

L'application **App Cuisine** possède des bases saines, une suite de tests d'intégration robuste et une documentation particulièrement soignée, directement guidée par les besoins réels d'utilisation en cuisine d'Olivier (multi-résidences, multi-foyers, gestion des congélateurs, dictée vocale, scan de livres).

| Axe d'Audit | Note / Statut | Constats Clés |
| :--- | :---: | :--- |
| **1. Architecture & Simplification Code** | 🟠 **6.5 / 10** | Monolithe d'état `store.svelte.js` de 84 Ko / ~2000 lignes à découper. Bonne adoption des runes Svelte 5 mais manque de modularité et typage. |
| **2. Cybersécurité & Isolation Supabase** | 🔴 **5.5 / 10** | RLS globalement bien configurée mais **faille critique d'invitation** sur `household_members` (tout utilisateur connecté peut s'ajouter à n'importe quel foyer via son UUID). |
| **3. Assurance Qualité & Tests (Vitest)** | 🟢 **9.0 / 10** | 23 suites de tests d'intégration, vérification automatique de conformité schéma (`check-schema.mjs`), principes-dev scrupuleusement suivis. |
| **4. UX/UI & Ergonomie Mobile (iPhone/iPad)** | 🟡 **7.5 / 10** | Responsive collapsable bien conçu pour mobile, mais zones tactiles de certains boutons (30px) trop petites pour l'usage cuisine avec doigts mouillés/occupés. |
| **5. Exploitation, DevOps & Documentation** | 🟢 **8.5 / 10** | Documentation très complète (`docs/utilisateur/`, `cas-utilisation.md`, `design-guide.md`). Scripts de déploiement et d'exploitation simples et fonctionnels. |

---

## 2. Rapport Détaillé par Agent Spécialisé

### Agent 1 : Architecte Code, Structure & Performance
* **Faiblesse Majeure : Monolithe `store.svelte.js` (84 Ko, 1958 lignes)**
  * Le fichier `store.svelte.js` concentre TOUTE la logique applicative : initialisation Supabase, synchronisation temps réel, gestion du cache `localStorage`, algorithmes d'ingrédients canoniques, logique de réapprovisionnement, événements de la semaine, et fonctions d'import.
  * *Recommandation* : Découper `store.svelte.js` en sous-stores spécialisés :
    1. `residenceStore.js` (gestion des résidences & bascule)
    2. `stockStore.js` (items, emplacements, lots datés, min, dismissal)
    3. `shoppingStore.js` (courses, synchronisation auto, lieux d'achat)
    4. `recipeStore.js` (recettes, sources, photos, réalisations, pendingBooks)
    5. `semaineStore.js` (événements, mise à l'échelle des repas)
* **Utilisation des Runes Svelte 5** :
  * Bonne réactivité avec `$state` et `$derived`. Attention toutefois aux effets secondaires dispersés dans `startData()` et `scheduleRefresh()`.
* **Cache & Hors-Ligne** :
  * `saveCache()` et `loadCache()` ne sauvegardent actuellement que `household`, `residences`, `residence`, `items` et `shop`. Les recettes, emplacements et événements ne sont pas mis en cache local, limitant l'expérience 100% hors-ligne dans la cave ou le congélateur.

---

### Agent 2 : Expert Cybersécurité & Données Supabase
* **FAILLE CRITIQUE : Joindre un foyer sans contrôle de sécurité (`household_members`)**
  * Dans `supabase/schema.sql` (lignes 87-88) :
    ```sql
    create policy "se joindre soi-même avec le code du foyer" on household_members
      for insert with check (user_id = auth.uid());
    ```
  * **Risque** : Tout utilisateur authentifié connaissant ou devinant l'UUID d'un foyer (`household_id`) peut directement s'insérer dans la table `household_members`. Une fois membre, les politiques `is_member(household_id)` lui donnent un accès TOTAL en lecture/écriture à l'ensemble des données du foyer (recettes, photos privées, stocks, adresses).
  * *Correction recommandée* : Passer la jointure de foyer via une Supabase Edge Function ou vérifier un jeton d'invitation à durée limitée.
* **Sécurité de la fonction Edge `rapatrier-page`** :
  * Risque de détournement SSRF par redirection HTTP (filtre bypassable si le serveur distant répond avec une redirection 302 vers une IP privée/interne).
  * *Correction* : Passer `redirect: 'manual'` dans `fetch` et exiger un jeton Bearer valide.
* **Sécurité du Bucket `photos`** :
  * Le bucket `photos` est correctement configuré en mode **privé** avec contrôle strict par `is_member`.
  * *Manque* : Aucune politique `UPDATE` n'est définie sur le bucket, ce qui fait échouer silencieusement le remplacement de photos existantes (`upsert: true`).

---

### Agent 3 : Auditeur QA, Tests & Conformité des Processus
* **Excellente Stratégie de Test** :
  * La suite comprend **23 fichiers de test d'intégration** dans `app/tests/integration/` couvrant : hors-ligne, dictee, inventaires, photos, recettes, stock-courses, wishlists, etc.
* **Contrôle de Schéma Réel (`check-schema.mjs`)** :
  * Le script `npm run check:schema` est un garde-fou d'une grande valeur qui compare les requêtes de `store.svelte.js` au schéma SQL réel, évitant les régressions de migration.
* **Conformité aux `principes-dev`** :
  * Démarche centrée cas d'utilisation (`docs/utilisateur/cas-utilisation.md`). Tout développement part des besoins client d'Olivier.
  * Absence de dégradation silencieuse appliquée au niveau du store.

---

### Agent 4 : Designer UX/UI & Ergonomie Mobile (iPhone / iPad)
* **Ergonomie Smartphone (iPhone 13)** :
  * Bon repliement de la barre d'onglets sous forme de menu déroulant `.tabmenu` pour les écrans <= 560px.
  * `app.css` assure que rien ne déborde horizontalement (`overflow-x: hidden`).
* **Point Faible UX : Tailles des zones de touche (Touch Targets)** :
  * Les boutons `.qty button` et `.icon-btn` ont des dimensions fixes de **30px × 30px** (`app.css:177`).
  * En condition réelle de cuisine (doigts humides, téléphone posé sur un plan de travail), le standard WCAG / Apple recommande une zone d'au moins **44px × 44px**.
  * La case à cocher des courses (19px) est également difficile à viser rapidement dans les rayons des magasins.

---

### Agent 5 : Documentaliste & DevOps / Exploitation
* **Qualité Documentaire Exceptionnelle** :
  * Le dossier `docs/` est remarquablement structuré entre `docs/utilisateur/` et `docs/technique/`.
  * Le fichier `claude.md` synthétise parfaitement la vision globale, le matériel de cuisine, les 3 résidences, les congélateurs et les 240 livres de recettes.
* **Exploitation & Déploiement** :
  * Scripts `.cmd` clairs (`demarrer.cmd`, `mettre-en-ligne.cmd`).
  * La procédure de mise en ligne Vercel / Vite est documentée étape par étape.
  * *Axe d'amélioration* : Ajouter des en-têtes de sécurité HTTP (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`) via un fichier `app/public/vercel.json`.

---

## 3. Étape Finale : Comparaison avec les Revues Historiques (`docs/technique/revues/`)

Après avoir mené cet audit de manière totalement neutre et indépendante, nous avons confronté nos résultats avec les revues menées le 03/08/2026 par Claude stockées dans `docs/technique/revues/` :

### Convergence & Confirmations Forte
1. **Sécurité Edge Function & Vercel** : Notre analyse confirme à 100 % le constat de la revue de sécurité sur `rapatrier-page` (besoin de `redirect: 'manual'` + vérification token) et l'absence de `vercel.json` pour le clickjacking.
2. **Taille des zones tactiles UX** : Notre Agent UX rejoint exactement les constats historiques sur la nécessité d'agrandir les boutons de 30px à 44px et d'élargir la case à cocher des courses.
3. **Monolithe `store.svelte.js`** : Convergence totale sur l'urgence de découper `store.svelte.js` avant d'ajouter de nouvelles fonctionnalités complexes (Bibliothèque dédiée, inventaires multiples par emplacement).
4. **Politique UPDATE manquante sur le bucket `photos`** : Confirmé comme bug silencieux lors des remplacements de photos.

### Nouveaux Constats Apportés par notre Audit
1. **Criticités RLS Foyer (`household_members`)** : Notre audit a mis en évidence l'absence de contrôle sur le paramètre `household_id` lors du `INSERT` dans `household_members`, permettant à un compte authentifié arbitraire de s'ajouter à n'importe quel foyer s'il en connaît l'UUID.
2. **Couverture Hors-Ligne Partielle** : Bien que `items` et `shop` soient mis en cache localement, la consultation des recettes et de la planification de la semaine hors-ligne (ex: cave ou zone sans réseau) n'est pas encore couverte par le cache.

---

## 4. Feuille de Route Priorisée d'Amélioration

### Phase 1 : Correctifs Sécurité Immédiats (Quick Wins)
- [ ] **Sécurité RLS** : Restreindre la politique d'insertion dans `household_members` ou passer par un code d'invitation / fonction vérifiée.
- [ ] **Edge Function `rapatrier-page`** : Ajouter `redirect: 'manual'` et le contrôle d'authentification Bearer token.
- [ ] **En-têtes Vercel** : Créer `app/public/vercel.json` (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
- [ ] **Bucket Photos** : Ajouter la politique SQL `UPDATE` sur `storage.objects` pour le bucket `photos`.

### Phase 2 : Simplification Code & Refactoring
- [ ] **Découpage de `store.svelte.js`** : Découper le fichier de 84 Ko en 5 modules métier isolés.
- [ ] **Suppression du code mort** : Supprimer `seed.js` (périmé) et factoriser les fonctions utilitaires (`fold`, dictée vocale).

### Phase 3 : Optimisation UX Mobile & Ergonomie Cuisine
- [ ] **Touch Targets** : Passages des boutons interactifs de 30px à 44px dans `app.css`.
- [ ] **Écran Bibliothèque Dédié** : Sortir les livres du panneau filtre pour en faire une véritable bibliothèque visuelle.
- [ ] **Cache Hors-ligne Étendu** : Étendre `saveCache()` aux recettes et emplacements de la résidence courante.
