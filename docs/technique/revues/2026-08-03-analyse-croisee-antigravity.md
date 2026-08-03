# Analyse croisée du rapport Antigravity/Gemini (audit-report-antigravity.md)

*Par Claude, 03/08/2026, à la demande d'Olivier. Chaque affirmation nouvelle du rapport a été vérifiée dans le code avant conclusion.*

## Retenu

- **Cache hors ligne partiel** (constat nouveau, VÉRIFIÉ) : `saveCache()` (`store.svelte.js`) ne conserve que foyer, résidences, items et courses. Les recettes et la semaine ne sont pas en cache, alors que la spécification (claude.md) demande « ingrédients, listes de courses et recettes de la semaine accessibles hors ligne ». → **Ajouté au backlog** (à traiter avec le chantier commentaires 4 ou en item propre).
- Ses confirmations des constats de nos revues (rapatrier-page, vercel.json, cibles tactiles, politique UPDATE du bucket, seed.js, fold, dictée) : validation croisée utile, corrigées dans les lots A-B du 03/08.

## Écarté, avec preuves

- **« FAILLE CRITIQUE » RLS sur `household_members`** : c'est le mécanisme d'invitation VOULU (« se joindre soi-même avec le code du foyer », schema.sql:87-88) ; le « code » est l'UUID du foyer, indevinable, affiché uniquement dans Foyer et compte. Déjà couvert par notre revue sécurité en « risque accepté raisonnable » — pas une découverte, et pas critique. La correction proposée (Edge Function + jeton d'invitation à durée limitée) est de la sur-ingénierie pour un foyer familial. Mesure simple si souhaitée : fermer les inscriptions dans le dashboard Supabase (lot A, main d'Olivier).
- **« Convergence totale sur l'urgence de découper store.svelte.js »** : FAUX — notre revue de code conclut l'inverse (fichier bien sectionné, fonctions courtes, pas de dépendances circulaires ; le découpage en 5 sous-stores créerait plus de tuyauterie qu'il n'en supprime). Décision maintenue : ne pas découper à froid.
- Les notes sur 10 (sécurité 5.5/10) : tirées vers le bas par la « faille » requalifiée ci-dessus ; les deux audits constatent par ailleurs une RLS, un bucket, des secrets et un XSS sains.

## Leçon au passage (contre nos propres revues)

Notre revue de code proposait de supprimer `recipes.video` « si aucune recette n'en a » — le SELECT de contrôle a trouvé **105 recettes Passard avec vidéo locale**. La règle « prouver avant de supprimer » a évité une erreur ; la colonne et son affichage restent.
