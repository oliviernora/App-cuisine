# Documentation du Garde-manger

## Pour Olivier — à lire et à valider (`docs/utilisateur/`)

| Document | Contenu | Votre rôle |
|---|---|---|
| [`utilisateur/cas-utilisation.md`](utilisateur/cas-utilisation.md) | Vos usages de bout en bout (nominaux et non passants) | **valider** chaque cas *(proposition)* |
| [`utilisateur/fonctionnalites.md`](utilisateur/fonctionnalites.md) | Ce que fait chaque commande, écran par écran | consulter |
| [`utilisateur/design-guide.md`](utilisateur/design-guide.md) | L'identité visuelle « Marché » et les règles UX | **valider** les évolutions |
| [`utilisateur/creneaux-courses.md`](utilisateur/creneaux-courses.md) | Créneaux de courses : référence = calendrier Google « marchés » ; lieux d'achat dans l'app | consulter |
| [`utilisateur/exploitation.md`](utilisateur/exploitation.md) | Lancer l'application, comptes, sauvegardes, dépannage | consulter au besoin |
| [`utilisateur/mise-en-ligne.md`](utilisateur/mise-en-ligne.md) | L'app en ligne : adresse, installation iPhone/iPad, publier une mise à jour | **installer sur vos appareils** |
| [`../claude.md`](../claude.md) | Spécification générale (vos objectifs) | la source de tout |
| [`../plan.md`](../plan.md) | Plan d'action, avancement, décisions | suivre l'avancement |

## Interne technique (`docs/technique/`)

| Document | Contenu |
|---|---|
| [`technique/architecture.md`](technique/architecture.md) | Conception, modèle de données, exigences non fonctionnelles |
| [`technique/cahier-de-tests.md`](technique/cahier-de-tests.md) | Tests automatisés et manuels, journal des passages |
| [`technique/suivi-cas-utilisation.md`](technique/suivi-cas-utilisation.md) | Validation et couverture de chaque cas, reste à faire |
| [`technique/plan-archive.md`](technique/plan-archive.md) | Historique des chantiers terminés, déplacé de plan.md (04/08/2026) |
| [`technique/poc-ollama.md`](technique/poc-ollama.md) | POC extraction de recettes par IA locale : verdict, réglages, pièges |
| [`technique/mcp.md`](technique/mcp.md) | Serveur MCP garde-manger : principes d'intégrité, mise en service |
| [`technique/revues/`](technique/revues/) | Revues du 03/08/2026 (code, doc, sécurité, UX) + synthèse et plan d'action |
| `../.claude/skills/principes-dev/` | Méthode de développement imposée (principes d'Olivier) |

Règle (skill principes-dev) : la documentation est tenue à jour à chaque
livraison, dans le même temps que le code.
