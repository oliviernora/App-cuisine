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

Couleurs d'emplacement (repères — plus utilisées à l'écran depuis la
disparition des chips d'emplacement le 16/07/2026, conservées en réserve) :

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
- Largeur de contenu : max 960 px centré (élargie le 16/07/2026, demande
  Olivier — l'application reste une colonne ; téléphone et tablette
  inchangés, le max ne fait que plafonner).
- Cibles tactiles : 30 px minimum, 42 px pour les actions fréquentes (micro).
- Zone d'ajout fixée en bas de l'écran (pouce), en-tête collant en haut.

## Composants établis

- **Écran d'accueil en tuiles** (28/07/2026, commentaires 3) : cinq tuiles
  (`--surface`, coins arrondis, icône accent 26 px + titre gras), une par
  **famille de cas d'utilisation**, avec les **étapes en raccourcis**
  (petits boutons gris « ▸ … » qui naviguent, certains ouvrant directement
  un sous-écran — Ranger les courses, Lieux d'achat). Grille responsive
  (`minmax(250px, 1fr)`). L'accueil est le premier onglet (icône maison) et
  l'écran d'ouverture ; il s'ajoute aux onglets, il ne les remplace pas.
- **Courses façon liste de tâches** (28/07/2026, à la Microsoft To Do) :
  « à acheter » en haut groupé par magasin, « **Achetés — à ranger** » en
  bas (lignes barrées, case cochée) ; décocher fait remonter. Le bouton
  « Ranger les courses (n) » ouvre l'écran de rangement.
- **Écran de rangement** (28/07/2026, N13) : un champ + micro en tête
  (« Produit sorti du sac »), les **candidats de la liste** en dessous
  (+ « Nouveau produit … — acheté hors liste ») ; choisir ouvre le
  formulaire quantité + emplacement (défaut : dernier connu) ; un message
  confirme chaque rangement (« Rangé : … × n → … ») ; « Tout est rangé »
  quand le panier est vide.
- **Lieux d'achat** (28/07/2026) : sous-écran depuis les Courses — lignes
  dépliantes « ▸ nom · type », renommage ✎ en place, type
  physique/Internet (adresse ou URL + lien), commentaire, « Ingrédients
  achetables ici (n) » dépliable, suppression en deux touches, reprise en
  un geste des lieux déjà utilisés en texte libre.
- **Sous-écran** (25/07/2026, commentaires Olivier — motif central) : toute
  édition ou sous-menu occupe l'écran **seul** — recherche, filtres, listes
  et barres d'ajout disparaissent le temps de la saisie ; une **croix ×**
  en haut à droite ferme et revient où on était (la recherche en cours est
  restaurée). Une seule saisie ouverte à la fois, partout. Composant
  `SousEcran.svelte` (titre + croix). S'applique à : fiche recette, Modifier
  un ingrédient, Gérer un emplacement, master list, fiche ingrédient,
  import de recette, gestion des sources, gestion des résidences, Modifier
  un événement, Ajuster une recette d'un événement.
- **Renommage au crayon** (25/07/2026) : renommer se fait par une icône ✎
  **directement sur le nom** — le nom se change en champ de saisie en place
  (OK / Annuler), pour gagner la place d'un champ permanent. Un nom déjà
  connu fusionne, toujours en deux touches. Appliqué aux résidences,
  emplacements, ingrédients, genres et sources.
- **Une seule zone de texte par ligne sur iPhone** (25/07/2026, iPhone 13
  mini) : sous 560 px, les rangées de formulaire (`manage-row`)
  **s'empilent** — chaque champ prend sa ligne (étiquette + champ = une
  ligne). Jamais deux zones de texte côte à côte.
- **Barre d'ajout minimale** (25/07/2026) : la barre du Stock tient sur une
  ligne — Ingrédient + bouton « ⋯ » + micro + Ajouter ; quantité,
  emplacement et où acheter vivent dans le dépliant « ⋯ » (défaut : 1 pot,
  sans emplacement). **L'emplacement choisi est retenu d'un ajout à
  l'autre** (27/07/2026 — ranger une série au même endroit) et rappelé en
  note grise à côté du bouton « ⋯ ». La barre des Courses : produit +
  Ajouter (le lieu se règle ensuite au crayon, mémorisé par ingrédient).
- **Écran Foyer et compte** (25/07/2026) : un écran comme les autres — le
  menu déroulant l'affiche comme écran courant. En direct : sélecteur de
  résidence, bouton « Gérer les résidences », clé du foyer, sauvegardes,
  déconnexion. « Gérer les résidences » est un sous-écran : renommage ✎,
  **corbeille** (confirmation : tout le contenu de la résidence est perdu ;
  la dernière résidence ne se supprime pas ; supprimer la courante bascule
  sur une autre), zone d'ajout.
- **Emplacements par résidence** (25/07/2026) : plus aucune liste
  d'emplacements par défaut — seuls les emplacements créés dans la
  résidence courante apparaissent (Stock, Courses, Inventaire). Ils
  s'ajoutent dans l'Inventaire (zone en bas) et se suppriment dans
  « Gérer » **seulement vides** (deux touches).

- **Ligne compacte à deux niveaux** (27/07/2026, remarques Olivier iPhone —
  motif central des listes Stock et Courses) : la ligne ne montre que
  l'essentiel — **nom (tronqué), nombre, emplacement** (Stock) ou **case,
  nom, statut** (Courses). **Toucher le nom** déplie le **nom complet**
  (l'emplacement s'efface pour laisser la place) et fait apparaître une
  **seconde ligne** en dessous portant l'emplacement et **tous les
  boutons** : Stock → « ▸ emplacement(s) » (détail), panier, − n +, ✎ ;
  Courses → statut, « Je l'ai déjà »/« À acheter » (lignes semaine), ✎ lieu,
  poubelle. Une seule ligne dépliée à la fois. Jamais plus de trois
  éléments sur la ligne compacte.
- **Ligne de stock par ingrédient** (16/07/2026) : une ligne par
  **ingrédient**, jamais plus ; le compteur montre la **somme de tous les
  emplacements**. Le détail « ▸ n emplacements » (seconde ligne) déplie un
  endroit par ligne avec ses + / − et un bouton **« Déplacer »** vers un
  autre emplacement, existant ou nouveau (27/07/2026 — fusion automatique
  si le produit existe déjà à destination). Le crayon ✎ « Modifier » ouvre
  le sous-écran (renommer/fusionner, genre, réserve minimum, supprimer en
  deux touches). État « à racheter » (somme sous la réserve minimum) :
  liseré orange à gauche + nom et compteur orange.
- Les chips d'emplacement ont disparu avec la vue par emplacement
  (16/07/2026) ; le filtre du stock est la recherche + le genre.
- **Onglets** : segmentés pleine largeur sous le titre ; pastille orange =
  nombre de courses restantes. Sur écran étroit (≤ 560 px, iPhone), les
  onglets **collapsent en menu déroulant** (pratique responsive classique,
  décision Olivier 07/07/2026) : un bouton pleine largeur montre la section
  courante (icône + nom + pastille + chevron) ; l'ouvrir liste les cinq
  sections et, séparé en bas, « **Foyer et compte** » (le bouton compte du
  titre disparaît, il vit dans le menu). Choisir referme le menu.
- **Filtres de recherche en dépliant** (décision Olivier 07/07/2026) : la
  recherche **plein texte reste toujours visible** ; les filtres
  particuliers (source, catégorie, par ingrédient, wish list, gérer les
  sources) vivent dans un panneau dépliant « ▸ Filtres (n) » — n = filtres
  actifs — refermable par le même bouton ou « Refermer — voir les
  recettes ». Même esprit que la « Recherche avancée » de la Semaine.
- **Règle absolue (07/07/2026, remarque Olivier ; renforcée le 08/07)** :
  rien ne dépasse jamais de l'écran à droite ou à gauche — la page ne
  « balaie » pas horizontalement. Un contenu trop large **replie**
  (`flex-wrap` des `manage-row`, toolbars) ou **défile dans son propre
  bloc** (chips, textes de code) ; verrou global `overflow-x: hidden` sur
  la page. **Toujours vérifier que les boutons et menus tiennent dans la
  largeur de chaque écran** (PC, tablette, iPhone) avant livraison ; si un
  bouton ou un menu ne tient pas, ne pas le comprimer : **choisir une autre
  approche d'UX** (repli, panneau dédié, menu déroulant).
- **Groupes** : titre en capitales + compteur (`Cuisine · 49`).
- **Formulaires** : champs sur fond `--bg` dans une barre `--surface` ;
  bouton primaire tomate à droite.

- **Couleur sémantique « ok »** : vert #3D8B4F (clair) / #6FBE8C (sombre) —
  réservé à « vu / confirmé » (inventaire). Distinct de l'accent et de
  l'orange alerte.
- **Mode inventaire** : occupe l'onglet Inventaire le temps de l'inventaire,
  mais les onglets restent visibles — **changer d'onglet met en pause,
  revenir reprend où on en était** (07/07/2026). Un bouton « **Mettre en
  pause** » (27/07/2026) rend la liste des emplacements : un bandeau
  « Reprendre l'inventaire de … » et le bouton « Reprendre » sur son
  emplacement la lèvent ; démarrer un autre inventaire pendant une pause se
  confirme en deux touches (la pause serait perdue). En-tête : nom de
  l'emplacement, compte « vus / à vérifier ». Déclarer = dire au micro ou
  taper quelques lettres puis toucher la ligne ; chaque touche ajoute un pot.
  Si un nom correspond à **plusieurs produits**, un **menu de choix** liste
  les candidats + les ingrédients proches de la **master list** (« connu
  ailleurs — sera créé ici ») + « Nouveau produit » — jamais de pari
  (07/07/2026, élargi le 27/07). Trois sections : À vérifier (gris), Vus
  (vert, compteur corrigeable − n + ; **toucher le nombre** ouvre la saisie
  directe de la quantité, 0 remet « à vérifier » — 27/07/2026), Nouveaux.
  Fin = écran de bilan listant les non-trouvés avant application ;
  rien n'est écrit au stock avant la confirmation. Abandon en deux touches,
  jamais de fenêtre bloquante.
- **Onglet Semaine** (refonte 07/07/2026) : en tête, le **bloc dépliant**
  « ▸ Courses de la semaine · n à acheter » (replié par défaut, lecture
  seule) ; puis les sections **À venir** (chronologique) et **Passés** (du
  plus récent au plus ancien), événements groupés par jour. Chaque événement :
  « Modifier » (date, type, convives, contraintes) ; les passés ont en plus
  « Fait » (recettes une à une : « Oui, faite » consigne à la date de
  l'événement, « Non » écarte). Un événement à venir se déplie : recettes
  associées — toucher une recette ouvre **ses ingrédients à l'échelle de
  l'événement** (« Ajuster la recette : % » + quantités corrigeables ligne à
  ligne, valables pour cet événement seul) — et la recherche d'une recette à
  ajouter, avec « Recherche avancée ▾ » (source, pays, ingrédient).
  Formulaire d'ajout en bas ; à côté de chaque champ de date, la date en
  toutes lettres en français.
- **Onglet Recettes** : une ligne par recette — titre, et en note la
  dernière réalisation (« jamais cuisinée », « cuisinée (date non notée) »,
  ou la date). Règle « jamais deux fois dans l'année » : si la dernière
  réalisation date de moins d'un an, la note passe en orange `--warn`.
  Sous la recherche libre (titre, ingrédient, pays, source, mot du texte) :
  un **menu déroulant des sources**, un champ « **Par ingrédient…** » à
  suggestions, et « Gérer les sources » (renommer = fusionner si le nom
  existe, créer). Toucher la ligne déplie la fiche : source et pays, lien
  « Voir en ligne (site) », « pour N personnes », ingrédients, texte,
  historique des réalisations, formulaire « J'ai fait cette recette », et
  l'éditeur (ingrédients un par ligne, pays, source). L'état vide propose
  l'import d'une recette (URL, photos, texte).
- **Gérer un emplacement** (onglet Inventaire — action exceptionnelle) :
  chaque emplacement a un bouton « Gérer » qui déplie un panneau sous sa
  ligne : renommer, fusionner dans un autre emplacement, déplacer des
  produits (cases à cocher + destination, existante ou nouvelle). Une fusion
  se confirme en deux touches, comme l'abandon d'inventaire ; jamais de
  fenêtre bloquante. Les écrans Stock et Courses n'en portent rien.
- **Panier, trois états** (bouton de chaque ligne de stock) :
  1. neutre (trait `--line`) : « commander en réserve » ;
  2. plein (fond accent) : déjà en liste de courses — un appui le retire ;
  3. **manquant** (panier avec « + », couleurs `--warn`/`--warn-bg`) : produit
     épuisé retiré du panier par l'utilisateur — un appui le remet en liste.
     Jamais de retour automatique après un retrait volontaire (décision
     Olivier, NP1) ; le retour automatique se réarme quand le stock remonte.
- **Bloc dépliant** (07/07/2026) : une ligne au style de liste avec chevron
  « ▸ / ▾ » dans le nom et un résumé en note (« 17 à acheter ·
  18 ingrédients ») ; toucher déplie le détail. Sert au bloc « Courses de la
  semaine » et à la « Master list des ingrédients ». Replié par défaut : les
  écrans quotidiens restent courts.
- **Menus déroulants et champs à suggestions** (07/07/2026) : quand les
  valeurs possibles sont nombreuses mais connues (emplacements, sources,
  pays), un `select` natif ; quand on cherche dans une grande liste
  (ingrédients), un champ texte avec suggestions au fil de la frappe
  (datalist). Les selects offrent une entrée « — Nouvel… — » quand la
  création est permise.
- **Lignes « semaine » des courses** (07/07/2026, revu 27/07) : gérées
  automatiquement (créées/requantifiées/retirées avec les repas) ; pas de
  poubelle ; note « semaine ». Depuis les lignes compactes, toucher le nom
  déplie la seconde ligne ; la bascule « je l'ai » (ligne barrée, non
  comptée) ↔ « à acheter » y est un bouton explicite. Les lignes réappro
  gardent poubelle et notes « auto »/« réserve ».
- **Master list des ingrédients** (onglet Inventaire, 07/07/2026) : bloc
  dépliant listant tous les ingrédients connus par **catégorie**, non classés
  en tête, filtre texte, saisie de catégorie par ligne (suggestions).
- **Photos de recettes** (07/07/2026 soir) : sur la fiche, un « bouton-
  fichier » (label au style des boutons secondaires) ouvre l'appareil photo
  ou le sélecteur — « Ajouter la photo du plat », « Photo de la recette
  (page du livre) », et « Photo du plat » dans le formulaire de réalisation
  (le nom du fichier choisi s'affiche sur le bouton). Vignettes 110 px à
  coins arrondis, légende « Plat » / « Page », **×** rond sombre en coin pour
  supprimer (avec confirmation). Jamais d'image pleine page imposée.
- **Photo proposée à la relecture d'un import** (14/07/2026) : aperçu au
  format vignette (110 px, coins arrondis) accompagné d'une **case à
  cocher** « Joindre la photo du plat », cochée d'avance ; la rangée passe
  à la ligne sur écran étroit (`flex-wrap`), rien ne déborde.
- **Wish list** (07/07/2026 soir) : étoile `--accent` devant le titre des
  recettes « à faire un jour » ; bouton-filtre « ★ Wish list » près des
  filtres (état actif = liseré et texte accent, classe `chip-on`) ; sur la
  fiche, « ☆ Ajouter à la wish list » / « ★ Dans la wish list — retirer ».
  Les ingrédients marqués « ! » à la saisie portent la mention accent
  « — à commander à l'avance ».
- **Master list — genres et fiche ingrédient** (08/07/2026) : dans la master
  list dépliée (qui **efface la section Emplacements** le temps de la
  consultation), chaque ligne = bouton-nom dépliant « ▸ » + **select de
  genre** borné à 45 % de largeur. Toucher le nom déplie la **fiche de
  l'ingrédient** (panneau standard) : renommer (fusion en deux touches),
  sourcing (select type + commentaire), recettes associées en liste. Le
  panneau « Gérer les genres » suit le motif des emplacements : rangées
  repliables, suppression en deux touches, création en bas.
- **Bloc « À utiliser »** (08/07/2026, Semaine) : même motif que « Courses
  de la semaine » (bloc dépliant, résumé orange « n lot(s) ancien(s) ») ;
  chaque ligne : produit + « n × entré le date · emplacement », l'année
  toujours affichée.
- **Rappel de sauvegarde** (08/07/2026) : point orange `--warn` de 10 px en
  coin du bouton Foyer quand la dernière sauvegarde de l'appareil date de
  plus de 7 jours ; l'explication et le bouton d'export vivent dans le
  panneau Foyer (action exceptionnelle).
- **Détail des lots datés** (07/07/2026 soir, revu 16/07 avec le stock par
  ingrédient) : le détail déplié de la ligne (« ▸ n emplacements » ou flèche
  seule) liste, sous chaque emplacement « à dates », un lot par ligne
  (« 2 × entrés le 1 mai 2026 », le plus ancien annoté), bouton « Sortir 1 »
  par lot, note « n sans date » si besoin, et formulaire quantité + date
  (+ date en toutes lettres) pour entrer un lot. Les gestes rapides restent
  sur la ligne : + entre un lot du jour, − sort du plus ancien.
- **Fiche recette** (16/07/2026) : la wish list est une **étoile ★/☆ à
  droite de la ligne source** (jamais un bouton pleine ligne) ; la zone
  « Commentaires » est un textarea pleine largeur juste après la recette
  (bouton Enregistrer visible seulement si le texte a changé) ; **toutes
  les actions vivent en bas de la fiche**, « Modifier » en dernier et sans
  qualificatif.
- **Nom tronqué déplié au toucher** (16/07/2026) : quand un libellé long est
  coupé par l'ellipse (question de rapprochement, iPhone surtout), le
  toucher bascule l'affichage complet sur plusieurs lignes (classe
  `name-full`) ; un second toucher referme.
- **Barre d'ajout au-dessus du clavier** (16/07/2026) : la barre fixée en
  bas remonte de la hauteur du clavier virtuel (`--clavier`, posée par
  visualViewport) — la saisie reste toujours visible sur iPhone.
- **Le bas de page reste atteignable** (27/07/2026) : la hauteur réelle de
  la barre fixée en bas est mesurée en continu (`--barre`, action
  `addbarHeight`) et la page lui réserve exactement cette place — on peut
  toujours défiler jusqu'au dernier élément, même quand la barre grandit
  (indice sur plusieurs lignes, dépliant « ⋯ », zone sûre iPhone).
- **Bandeau hors ligne** : barre pleine largeur sous l'en-tête, fond
  `--warn-bg`, texte `--warn`, message « Hors ligne — dernières données
  connues, consultation seule. » Pendant ce temps, les commandes de
  modification sont estompées (opacité 0.45) et inertes ; la consultation
  (recherche, filtres, onglets) reste active.

## Comportements

- **Stabilité** : une seule liste alphabétique d'ingrédients (16/07/2026).
  Une ligne modifiée ne change jamais de place ; pas d'animation de
  réordonnancement.
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
