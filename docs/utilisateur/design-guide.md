# Garde-manger — design guide UX

Identité validée par Olivier le 06/07/2026 : « Marché » (étal du samedi
matin). Toute nouvelle interface respecte ce guide ; tout nouveau motif
(composant, couleur, geste) y est ajouté avant d'être utilisé.

## Intention

L'application s'utilise debout, en cuisine ou en magasin, souvent d'une main
et en quelques secondes. Chaque écran privilégie : lisibilité immédiate,
gestes courts, aucune surprise (rien ne bouge, rien ne disparaît sans raison).

**Quotidien vs exceptionnel** (principe Olivier) : les écrans quotidiens
(Stock, Courses) ne portent que les gestes quotidiens. Les actions
exceptionnelles — inventaire, invitation d'un membre, déconnexion — vivent
dans l'onglet Inventaire et le panneau Foyer (icône silhouettes en en-tête).

## Couleurs

Deux thèmes obligatoires (clair et sombre), choisis par le réglage de
l'appareil. Les jetons sont définis dans `app/src/app.css`.

| Jeton | Clair | Sombre | Rôle |
|---|---|---|---|
| `--bg` | #FFFFFF | #14181A | fond de page |
| `--surface` | #F7F6F2 | #1F2528 | cartes, champs, boutons |
| `--ink` | #26302A | #ECEEE8 | texte principal |
| `--muted` | #71806F | #93A096 | texte secondaire |
| `--accent` | #C73E36 | #E4635A | actions (tomate) |
| `--accent-ink` | #FFF6F4 | #2A0F0C | texte sur accent |
| `--warn` | #C97B12 | #E8A33B | alerte « à racheter » |
| `--line` | #E6E4DC | #2E3639 | filets, bordures |

Couleurs d'emplacement (chips, repères) :

| Emplacement | Clair | Sombre |
|---|---|---|
| Cuisine | #C73E36 | #E4635A |
| Sous chauffage | #E8842C | #F2A052 |
| Réserve entrée | #3D8B4F | #6FBE8C |
| Autre | #7B4B94 | #B48BC9 |
| Vegan | #2E6F8E | #6FAECB |

Règles :
- L'accent tomate est réservé aux **actions** (boutons primaires, onglet
  actif, liens). Il ne code jamais un état de stock.
- L'orange `--warn` code un seul sens : **« à racheter » / attention stock**
  (liseré de ligne, texte, pastille de compteur).
- Les couleurs d'emplacement identifient un lieu, jamais un état.

## Typographie

- Police : arrondie du système — `ui-rounded, "SF Pro Rounded", "Segoe UI",
  system-ui, sans-serif`. Pas de police téléchargée.
- Corps 16 px ; lignes de liste 0.95 rem ; titres de groupe 0.72 rem en
  capitales espacées ; titre d'app 1.3 rem gras.
- Chiffres alignés : `font-variant-numeric: tabular-nums` partout où des
  nombres se comparent en colonne.
- Pas d'emoji dans l'interface ; icônes en SVG au trait (2 px, bouts ronds).

## Formes et espacement

- Coins arrondis : 14 px (`--radius`) pour champs, boutons, onglets ;
  10 px (`--radius-s`) pour les petits boutons carrés ; pastilles en 999 px.
- Largeur de contenu : max 640 px centré ; l'application reste une colonne.
- Cibles tactiles : 30 px minimum, 42 px pour les actions fréquentes (micro).
- Zone d'ajout fixée en bas de l'écran (pouce), en-tête collant en haut.

## Composants établis

- **Ligne d'inventaire** : une ligne par produit, jamais plus. Nom tronqué
  avec ellipse (jamais sur deux lignes), compteur − n +, panier, poubelle.
  État « à racheter » : liseré orange à gauche + nom et compteur orange.
- **Chips d'emplacement** : filtre horizontal défilant, couleur du lieu,
  chip active = fond teinté à 14 %.
- **Onglets** : segmentés pleine largeur sous le titre ; pastille orange =
  nombre de courses restantes.
- **Groupes** : titre en capitales + compteur (`Cuisine · 49`).
- **Formulaires** : champs sur fond `--bg` dans une barre `--surface` ;
  bouton primaire tomate à droite.

- **Couleur sémantique « ok »** : vert #3D8B4F (clair) / #6FBE8C (sombre) —
  réservé à « vu / confirmé » (inventaire). Distinct de l'accent et de
  l'orange alerte.
- **Mode inventaire** : plein écran le temps de l'inventaire (les onglets
  s'effacent). En-tête : nom de l'emplacement, compte « vus / à vérifier »,
  date du dernier inventaire. Déclarer = dire au micro ou taper quelques
  lettres puis toucher la ligne ; chaque touche ajoute un pot. Trois
  sections : À vérifier (gris), Vus (vert, compteur corrigeable − n +),
  Nouveaux (créés pendant l'inventaire). Fin = écran de bilan listant les
  non-trouvés avant application ; rien n'est écrit au stock avant la
  confirmation. Abandon en deux touches (le bouton devient « Confirmer
  l'abandon »), jamais de fenêtre bloquante.
- **Panier, trois états** (bouton de chaque ligne de stock) :
  1. neutre (trait `--line`) : « commander en réserve » ;
  2. plein (fond accent) : déjà en liste de courses — un appui le retire ;
  3. **manquant** (panier avec « + », couleurs `--warn`/`--warn-bg`) : produit
     épuisé retiré du panier par l'utilisateur — un appui le remet en liste.
     Jamais de retour automatique après un retrait volontaire (décision
     Olivier, NP1) ; le retour automatique se réarme quand le stock remonte.
- **Sélecteur de tri** : deux segments à droite de la recherche —
  « Emplacement » (groupes par lieu, ordre fixe) et « A→Z » (liste unique
  alphabétique, le lieu s'affiche en note grise sur chaque ligne).
- **Bandeau hors ligne** : barre pleine largeur sous l'en-tête, fond
  `--warn-bg`, texte `--warn`, message « Hors ligne — dernières données
  connues, consultation seule. » Pendant ce temps, les commandes de
  modification sont estompées (opacité 0.45) et inertes ; la consultation
  (recherche, filtres, onglets) reste active.

## Comportements

- **Stabilité** : tri alphabétique dans chaque emplacement, emplacements en
  ordre fixe. Une ligne modifiée ne change jamais de place ; pas d'animation
  de réordonnancement.
- **Feedback immédiat** : toute action se reflète à l'écran sans attendre le
  réseau (mise à jour optimiste), la synchronisation suit.
- **Réversibilité** : les gestes fréquents sont annulables par le geste
  inverse (+/−, cocher/décocher, panier). Les actions destructives restent
  discrètes (poubelle grisée) et ne sont jamais le geste le plus accessible.
- **Voix** : la voix préremplit, l'utilisateur confirme. Jamais d'action
  irréversible déclenchée uniquement à la voix.

## Ton des textes

- Français, phrases complètes, tutoiement exclu — l'application dit « vos
  courses », s'adresse à l'utilisateur avec « vous » quand nécessaire.
- Les libellés disent ce qui se passe (« Ranger les achats »), les messages
  d'erreur disent quoi faire (« Utilisez la dictée du clavier »).
- Vocabulaire du domaine : pot, foyer, emplacement, à racheter, réserve.

## Accessibilité

- Focus clavier toujours visible (anneau accent 2 px).
- Contraste : texte principal ≥ 4.5:1 sur son fond, dans les deux thèmes.
- `prefers-reduced-motion` respecté : pas de transition si l'utilisateur les
  refuse.
- Toute commande à icône seule porte un `aria-label` en français.
