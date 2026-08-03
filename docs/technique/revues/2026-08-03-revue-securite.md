# Revue de cybersécurité défensive — Garde-manger

*Revue par agent indépendant, 03/08/2026, lecture seule, aucun appel à la production. Contexte pris en compte : application familiale, un seul foyer, dépôt sans dépôt distant (tout reste sur le PC et OneDrive), données de cuisine sans information de paiement.*

## 1. À corriger (risque réel)

### 1.1 La fonction serveur `rapatrier-page` est un relais web ouvert, et sa protection anti-SSRF est contournable par redirection

`supabase/functions/rapatrier-page/index.ts:37-48`

```
const privateHost = /^(localhost$|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[)/
if (!['http:', 'https:'].includes(url.protocol) || privateHost.test(url.hostname)) { ... }
const res = await fetch(url, { headers: {...}, signal: AbortSignal.timeout(15000) })
```

Le filtre d'adresses privées est bien pensé (il bloque bien `169.254.169.254`, l'adresse des métadonnées cloud), mais il n'est appliqué **qu'à l'adresse de départ**. `fetch` suit les redirections automatiquement : une page publique qui répond « redirige-toi vers `http://169.254.169.254/…` » fait sortir la requête du filtre. Deuxième point : la fonction ne vérifie pas que l'appelant est une personne connectée du foyer — elle est appelable par quiconque dispose de la clé publique, qui est par nature lisible dans le JavaScript du site, et l'en-tête `Access-Control-Allow-Origin: '*'` (`index.ts:15`) autorise n'importe quel site web à s'en servir depuis un navigateur. Concrètement, un inconnu peut utiliser le compte Supabase d'Olivier comme téléchargeur anonyme de pages web (bande passante, réputation d'adresse IP).

Correction la plus simple, deux petites additions dans le même fichier :
- ajouter `redirect: 'manual'` dans les options de `fetch` (ligne 42) : la fonction cesse de suivre les redirections, et l'import affiche simplement « page injoignable » sur les rares sites qui redirigent ;
- exiger un utilisateur connecté au début du `Deno.serve` : lire l'en-tête `Authorization` et vérifier le jeton avec `supabase.auth.getUser(token)` avant de télécharger quoi que ce soit ; sinon répondre 401. L'application envoie déjà ce jeton, rien ne change côté écran.

Optionnellement, remplacer `'*'` par l'adresse de production dans `CORS` (ligne 15) ferme l'usage depuis d'autres sites.

### 1.2 Aucun en-tête de sécurité sur l'hébergement

Il n'existe aucun `vercel.json` dans le dépôt (vérifié à la racine et dans `app/`), et le déploiement publie directement `app/dist` (`docs/utilisateur/exploitation.md:44-52`). L'application est donc servie sans `X-Frame-Options`/`frame-ancestors` : un site malveillant peut l'afficher dans un cadre invisible et piéger des clics (« clickjacking »). Risque modeste ici, mais la correction est triviale.

Correction la plus simple : créer `app/public/vercel.json` (Vite recopie `public/` dans `dist` à chaque build, donc le fichier survit au vidage de `dist`) contenant une règle `headers` avec `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` et `Referrer-Policy: strict-origin-when-cross-origin`. Ne pas ajouter de CSP pour l'instant : elle demanderait des ajustements et n'apporte pas grand-chose tant qu'il n'y a pas de `{@html}` sur des données.

## 2. À savoir (risque accepté raisonnable)

- **Inscription ouverte.** `app/src/components/Auth.svelte:25` propose la création de compte à tout visiteur de l'adresse publique. Un inconnu peut donc se créer un compte — mais il arrive sur une application vide : sans l'identifiant du foyer, la RLS ne lui montre rien. Si Olivier le souhaite, un réglage d'un clic dans Supabase (Authentication → Sign-ups) suffit à fermer les inscriptions maintenant que les comptes de la famille existent.
- **L'identifiant du foyer sert de code d'invitation permanent.** Il s'affiche en clair dans l'écran « Foyer et compte » (`app/src/App.svelte:246`) et la politique `"se joindre soi-même avec le code du foyer"` (`supabase/schema.sql:87-88`) accepte tout compte connecté qui le présente. C'est un UUID, indevinable ; le risque n'existe que si le code est recopié quelque part de public (capture d'écran, message). À noter aussi : la politique de suppression (`schema.sql:89-90`) ne permet à chacun que de se retirer lui-même — exclure quelqu'un d'autre passe obligatoirement par le tableau de bord Supabase.
- **Le compte « Claude » a exactement les mêmes droits que la famille.** `mcp/index.mjs:50-58` se connecte avec un compte membre du foyer, donc soumis à la RLS comme tout le monde : lecture de tout, et écritures possibles sur les tables du foyer. Les garde-fous en place sont bons et suffisants pour l'usage : pas de SQL libre (uniquement des outils métier), mode « à blanc » puis jeton pour les imports en masse (`mcp/index.mjs:318-347`), sauvegarde JSON complète avant exécution (`mcp/index.mjs:90-105`), journal de toutes les écritures (`mcp/index.mjs:84-87`). À garder en tête : les politiques étant en `for all`, une suppression reste techniquement possible, et le mot de passe de ce compte vit en clair dans `mcp/.env` sur le PC (correctement ignoré par git, `.gitignore:11`).
- **Contenu web importé et « injection de consigne ».** Les recettes rapatriées depuis Internet ou Evernote finissent en base, puis reviennent dans le contexte de Claude via `fiche_recette` (`mcp/index.mjs:236-247`). Une page piégée pourrait y glisser des instructions déguisées en texte de recette. Le risque pratique est faible (sites de cuisine), et le mode « à blanc » + jeton limite ce qu'une consigne détournée pourrait déclencher. Simplement : relire les rapports « à blanc » avant de donner le GO, ce qui est déjà la règle.
- **Dépendances npm.** `app/` : **0 vulnérabilité** sur les dépendances de production ; les 3 alertes « high » (`postcss`, `brace-expansion`, `fast-uri`) ne concernent que les outils de développement, jamais le code publié. `mcp/` : 3 alertes, dont `@hono/node-server` tiré par le SDK MCP — le composant vulnérable (`serve-static`) n'est pas utilisé, le serveur communique en stdio. Un `npm update` occasionnel dans les deux dossiers suffit ; aucune urgence.
- **Données locales sur l'appareil.** Le cache hors ligne (`app/src/lib/store.svelte.js:49-58`) conserve stock et courses dans le navigateur, et la session Supabase y est stockée aussi (comportement standard de la bibliothèque). Ce n'est un problème que si un téléphone est perdu déverrouillé.
- **Le fichier `app/.env` est suivi par git** (il n'est pas dans `.gitignore`, qui ne couvre que `mcp/.env` en ligne 11). Il ne contient aujourd'hui que l'adresse du projet et la clé « publishable », publiques par conception — donc pas de fuite. Le point de vigilance est la règle à tenir : **ne jamais ajouter d'autre ligne dans ce fichier**, en particulier une clé `service_role`.
- **Détail non sécuritaire repéré au passage.** Le bucket « photos » n'a pas de politique `UPDATE` (`supabase/schema.sql:288-293`), alors que deux appels utilisent `upsert: true` (`app/src/lib/store.svelte.js:908` et `mcp/index.mjs:484`) : le remplacement d'une photo déjà présente échoue silencieusement (`if (up.error) return`). C'est un défaut fonctionnel, pas un trou de sécurité, mais il mérite un ticket.

## 3. Rien à signaler (points vérifiés et sains)

- **Secrets.** Aucune clé `service_role` ni secret dans le dépôt ni dans les 37 commits de l'historique (`git log --all -G` sur les motifs `service_role`, `sb_secret`, `SUPABASE_SERVICE`, `CLAUDE_PASSWORD=` : seules des lignes de documentation qui *interdisent* ces clés remontent). Les deux seuls `.env` jamais ajoutés à git sont `app/.env` (adresse + clé publishable) et `mcp/.env.exemple`, dont tous les champs sensibles sont vides. `mcp/.env`, `mcp/journal.jsonl` et `mcp/sauvegardes/` sont bien exclus (`.gitignore:11-14`), et rien de ce type n'est actuellement suivi.
- **RLS.** Les 18 tables du schéma activent toutes `row level security`, et **toutes** les politiques métier passent par `is_member(household_id)` en `using` **et** `with check` (`supabase/schema.sql` et les 7 migrations). Aucune politique `using (true)`, aucune table oubliée. La fonction `is_member` (`schema.sql:65-71`) est un `security definer` exemplaire : elle ne prend qu'un identifiant, fixe `search_path = public`, ne renvoie qu'un booléen et ne peut donc rien divulguer.
- **Bucket photos.** Il est créé **privé** (`schema.sql:286`), les politiques exigent que le premier dossier du chemin soit l'identifiant d'un foyer dont l'utilisateur est membre (`schema.sql:288-293`), et l'affichage passe par des URL signées d'une heure (`app/src/lib/store.svelte.js:1634`). Rien n'est jamais rendu public.
- **XSS.** Un seul `{@html}` dans toute l'application, dans `app/src/components/Icon.svelte:6`, et il ne reçoit **jamais** de donnée distante : tous les appels passent des constantes définies dans `app/src/lib/icons.js` (vérifié sur l'ensemble des `<Icon d={…}>`, y compris les champs `icon:` des menus de `App.svelte:27-37` et `Accueil.svelte:11-28`). Aucun `innerHTML`, aucun `DOMParser`, aucun `insertAdjacentHTML`, ni dans l'application ni dans le serveur MCP. Le HTML rapatrié n'est jamais injecté dans la page : il est traité par expression régulière puis `JSON.parse` pour n'en extraire que du texte (`app/src/lib/jsonld-recipe.js:94-114`), et Svelte échappe automatiquement ce texte à l'affichage. **La règle à préserver** : ne jamais faire passer autre chose que ces constantes d'icônes dans un `{@html}`.
- **Service worker.** Le fichier généré (`app/dist/sw.js`) ne pré-charge que les fichiers statiques de l'application ; aucune règle de cache ne vise Supabase, donc aucune donnée du foyer n'y transite.
- **Traces.** Aucun `console.log` dans `app/src` — donc aucune donnée sensible affichée dans la console du navigateur.
- **Authentification.** Session gérée entièrement par la bibliothèque officielle `@supabase/supabase-js` (`app/src/lib/supabase.js`), sans manipulation de jeton maison ni redirection artisanale ; les URL de redirection sont verrouillées côté Supabase (`docs/utilisateur/exploitation.md:56-58`).

## Ordre de priorité suggéré

1. `redirect: 'manual'` + contrôle de l'utilisateur connecté dans `supabase/functions/rapatrier-page/index.ts` (puis redéploiement de la fonction, main d'Olivier).
2. `app/public/vercel.json` avec trois en-têtes, appliqué au prochain déploiement.
3. Optionnel et gratuit : fermer les inscriptions dans le tableau de bord Supabase.
