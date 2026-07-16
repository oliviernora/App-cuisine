# Garde-manger — catalogue des fonctionnalités

Ce document décrit ce que fait chaque commande de l'application, écran par
écran. Ce n'est PAS le document des cas d'utilisation (processus client de
bout en bout) : voir `cas-utilisation.md`.

## Les concepts

- Un **ingrédient** est une fiche : nom, emplacement (Cuisine, Réserve entrée…),
  **nombre de pots**, réserve minimum, et où l'acheter.
- Le « pot » est l'unité de comptage : un bocal d'épice, un sachet, une boîte.
  Le pot entamé compte pour 1.
- **Règle centrale** : quand le nombre de pots descend à la réserve minimum
  (0 par défaut), l'ingrédient est considéré « à racheter » et entre
  automatiquement dans la liste de courses.
- Tout est partagé en temps réel entre les appareils du foyer : un pot décompté
  sur l'iPhone apparaît aussitôt sur l'iPad et le PC.
- **Sur petit écran (iPhone)**, les onglets du haut collapsent en **menu
  déroulant** : le bouton montre la section courante, l'ouvrir liste Stock,
  Courses (avec la pastille), Recettes, Semaine, Inventaire et « Foyer et
  compte ». Rien ne dépasse jamais de l'écran à droite ou à gauche.

## Onglet Stock

Refondu le 16/07/2026 (commentaires Olivier) : le stock se lit **par
ingrédient**, une seule liste alphabétique. Chaque ligne montre la **somme
de tous les emplacements** :

- **un seul emplacement garni** : son nom s'affiche en gris sur la ligne ;
- **plusieurs emplacements garnis** : une flèche « ▸ n emplacements »
  déplie le détail — chaque endroit avec sa quantité et ses propres
  boutons + / − ; les emplacements à zéro n'apparaissent pas ;
- **plus rien nulle part** : aucun emplacement n'est indiqué.

### Boutons + / −

Sur la ligne principale quand l'ingrédient ne vit que dans un endroit ;
dans le détail déplié sinon. Le compteur de la ligne reste la somme, jamais
sous 0.

### Rachat automatique — réserve minimum

Chaque ingrédient a une **réserve minimum** (1 par défaut, réglable dans le
panneau Modifier ; 0 = jamais racheté tout seul). Quand la **somme de tous
les emplacements passe en dessous**, la ligne passe en orange « à racheter »
et l'ingrédient s'ajoute à la liste de courses (mention « auto », pastille
de l'onglet Courses). Quand la somme remonte au niveau de la réserve,
l'entrée automatique disparaît — sauf ajoutée volontairement (panier) ou
déjà cochée.

### Bouton panier — trois états

- **Neutre** : appuyer ajoute l'ingrédient à la liste de courses même s'il
  reste des pots (mention « réserve »).
- **Plein (tomate)** : déjà en liste ; appuyer le retire (sauf déjà coché).
- **« Manquant » (orange, panier avec +)** : produit épuisé que vous avez
  retiré du panier — il ne reviendra pas tout seul ; appuyer le remet en
  liste. Le retour automatique se réarme quand le stock remonte.

Supprimer un produit lié depuis la liste de courses a le même effet qu'un
retrait par le panier. Tout est au niveau de l'ingrédient, pas de
l'emplacement.

### Bouton Modifier (crayon ✎)

Ouvre le panneau de l'ingrédient :
- **Renommer** — un nom déjà connu **fusionne** les deux (confirmation en
  deux touches) ; stock, courses et recettes suivent ;
- **Genre** (master list) ;
- **Réserve minimum** (voir ci-dessus) ;
- **Supprimer** — toutes ses lignes d'emplacement, ses lots et sa ligne de
  courses, en deux touches. C'est la **seule** voie de suppression : plus de
  poubelle dans la liste principale.

### Emplacements « à dates » (congélateur, cave…)

Si un emplacement du produit est marqué « à dates » (réglage dans le panneau
« Gérer » de l'onglet Inventaire), chaque entrée forme un **lot daté** :
- **+** entre un lot daté du jour ; **−** sort du **lot le plus ancien**
  (proposé d'abord).
- Le détail déplié de la ligne montre les lots avec leur date en toutes
  lettres (« 2 × entrés le 1 mai 2026 »), un bouton « Sortir 1 » par lot, et
  un petit formulaire **quantité + date** pour entrer un lot à une autre
  date (la caisse de 6 bouteilles, la côte congelée la semaine dernière).
- Au quotidien la ligne montre le **total simple** (« 3 »), comme partout.
- Les produits présents avant le suivi apparaissent « n sans date » dans le
  détail.
- **L'inventaire ajuste les lots** : compter moins que les lots sort du plus
  ancien d'abord ; compter plus laisse l'excédent « sans date », à dater
  ensuite dans le détail. Le bilan de fin d'inventaire annonce ces
  ajustements **avant** application.
- Les lots plus vieux que le **seuil de l'emplacement** (6 mois par défaut,
  réglable dans « Gérer ») sont rappelés dans l'onglet Semaine, bloc
  « **À utiliser** ».

### Formulaire d'ajout

Nom, nombre de pots, emplacement, où acheter, puis Ajouter. L'emplacement se
choisit dans une **liste déroulante** des emplacements existants (avec
« Nouvel emplacement… » pour en créer un). Le champ nom **suggère les
ingrédients déjà connus** (stock et recettes) pour éviter les orthographes
différentes du même produit.

Au micro : dire par exemple « trois oignons » — le nom et la quantité se
préremplissent, vérifier puis toucher Ajouter. La dictée du clavier
iPhone/iPad fonctionne aussi dans chaque champ.

### Recherche et filtres

- La recherche ignore les accents (« epice » trouve « Épices »).
- Un déroulant « **Tous genres** » (dès qu'un genre existe) restreint la
  liste au **genre d'ingrédient** choisi (Épices, Légumes… — les genres de
  la master list).
- Il n'y a plus ni vue par emplacement ni chips d'emplacement : la recherche
  se fait par ingrédient (décision Olivier 16/07/2026).

## Onglet Inventaire

### À mettre en stock (réception des achats — 16/07/2026, décision Q2)

En tête de l'onglet, les achats passés par « Ranger les achats » (Courses)
attendent leur rangement : pour chaque produit, **quantité reçue** (le vrai
nombre de pots — trois achetés = trois) et **emplacement** (proposé d'après
l'existant, modifiable, nouveau possible), puis « **Ranger** » fait entrer
le stock. Dans un emplacement « à dates », le rangement crée un **lot daté**
du jour. Tant qu'un produit est là, il ne revient pas en courses.

Liste des emplacements avec leur nombre de produits et la **date du dernier
inventaire** (« jamais inventorié » sinon). Le bouton « Inventaire » de
chaque ligne démarre le mode inventaire. **L'inventaire se met en pause tout
seul** : les onglets restent accessibles, changer d'onglet suspend
l'inventaire, revenir sur Inventaire reprend exactement où vous étiez
(il survit aussi à un rechargement de la page).

Pendant l'inventaire, si un nom dicté ou tapé correspond à **plusieurs
produits** (« carvi » → carvi, carvi noir, carvi noir entier), un menu
propose de choisir — ou de créer un nouveau produit. Jamais de pari.
Depuis le 16/07/2026, les **orthographes proches sont retrouvées aussi** :
« clou de girofle » retrouve « Clous de girofle » (singulier/pluriel).
Un alias déjà confirmé est déclaré directement ; un simple rapprochement
passe toujours par le menu de choix.

**Corriger une saisie « vue »** (16/07/2026) : toucher le nom d'une ligne
déjà vue ouvre un panneau « ce n'était pas le bon produit ? » — choisir la
bonne variante (le comptage se transfère) ou « remettre à vérifier ».

**Micro** (16/07/2026) : un deuxième appui sur le micro arrête toujours la
dictée, y compris sur iPhone — et ce qui a été entendu jusqu'à la coupure
est traité (message « Rien entendu » sinon).

### Master list des ingrédients

Une ligne dépliante « Master list des ingrédients » montre **tous** les
ingrédients connus (stock + recettes), rangés par **genre** (Épices,
Légumes, Viandes…), les **non classés en tête**. Pendant qu'elle est
ouverte, la section Emplacements s'efface (elle revient en refermant).
- Le genre de chaque ligne se choisit dans un **menu déroulant** ; il vit
  sur l'ingrédient canonique (ses alias le partagent).
- « **Gérer les genres** » ouvre la master list des genres : créer,
  **renommer** (un nom existant fusionne et reclasse les ingrédients),
  supprimer (les ingrédients redeviennent non classés), et régler le
  **sourcing par défaut** du genre — type (marché / internet / boutique) et
  commentaire (nom du marché, site…).
- **Toucher le nom d'un ingrédient** ouvre sa fiche : le **renommer**
  (« beurre demi-sel » → « beurre salé » : le stock et les courses suivent,
  l'ancien nom devient un alias, un nom déjà connu **fusionne** — confirmé
  en deux touches), régler son **sourcing** propre (vide = celui du genre),
  et voir la **liste des recettes** qui l'utilisent.
- Le **sourcing alimente les courses** : quand un produit part en liste,
  son magasin est prérempli (commentaire du sourcing, sinon le type) — sans
  écraser un magasin déjà choisi sur le produit.

### Ingrédients à rapprocher (master list)

Quand deux noms se ressemblent (« carottes » / « carotte », singulier,
pluriel, majuscules) entre le stock et les recettes, une question apparaît en
haut de l'onglet : « même ingrédient ? ». **Oui** relie les deux orthographes
pour toujours : le stock, les recettes et la liste de courses les considèrent
comme un seul ingrédient. **Non** est aussi mémorisé : la question ne revient
jamais. Rien n'est jamais fusionné sans votre accord. Si les deux noms sont
longs (tronqués sur iPhone), **toucher la question l'affiche en entier**
(16/07/2026).

### Gérer un emplacement (bouton « Gérer »)

Un panneau se déplie sous l'emplacement :
- **Emplacement « à dates »** : une case à cocher active le suivi par lots
  datés (congélateur, cave…) — voir « Emplacements à dates » de l'onglet
  Stock. La mention « à dates » apparaît sur la ligne de l'emplacement.
  En dessous, le **seuil de rappel** (« n mois avant rappel “à utiliser”
  dans la Semaine », 6 par défaut) se règle par emplacement.
- **Renommer** : nouveau nom libre ; un nom déjà existant **fusionne** les
  deux emplacements (confirmation en deux touches) — les produits se
  réunissent, les doublons regroupent leurs pots, la date d'inventaire de la
  destination est conservée.
- **Déplacer des produits** : cocher les produits, choisir la destination
  (existante ou nouvelle), « Déplacer (n) ». Un produit déplacé garde
  quantité, magasin et état « à racheter » ; s'il existe déjà à destination,
  les pots se regroupent en une seule ligne.
- Un emplacement sans produit et jamais inventorié disparaît de la liste.
- Déclarer un produit trouvé : au micro (« trois cumin moulu »), ou taper
  quelques lettres et toucher la ligne. Chaque déclaration ajoute des pots ;
  un produit inconnu est créé (mention « nouveau »).
- Corriger : compteur − / + sur chaque ligne vue ; redescendre à zéro remet
  le produit « à vérifier ».
- « Terminer l'inventaire » affiche le bilan des non-trouvés ; confirmer les
  passe à zéro pot (et en courses automatiques). **Rien n'est écrit au stock
  avant cette confirmation.**
- « Abandonner » (confirmation en deux touches) ne laisse aucune trace ;
  fermer ou recharger la page conserve l'inventaire en cours (même appareil).

## Onglet Courses

La liste fait la **somme de trois origines** : le réapprovisionnement du
stock (« auto », « réserve »), les **ingrédients des repas à venir**
(« semaine »), et les achats libres ajoutés à la main.

### Lignes « semaine » (automatiques)

Calculées en direct depuis les événements à venir : dès qu'une recette est
ajoutée, retirée ou ajustée, la liste se met à jour — quantités comprises.
Elles n'ont pas de poubelle (elles disparaissent d'elles-mêmes quand le
besoin disparaît) ; **toucher le nom** bascule « je l'ai déjà » (ligne barrée,
pas à acheter) ↔ « à acheter ». Un ingrédient déjà couvert par le
réapprovisionnement n'est pas doublonné.

### Case à cocher

Cocher = acheté (la ligne se barre). La pastille de l'onglet compte ce qui
reste à acheter (les « je l'ai » ne comptent pas). Décocher est possible
tant que les achats ne sont pas rangés.

### Bouton « Ranger les achats » (revu le 16/07/2026, décision Q2)

Les lignes cochées quittent la liste et passent « **à mettre en stock** »
en tête de l'onglet Inventaire — c'est là que la quantité réelle et
l'emplacement se choisissent (plus de +1 automatique). Une ligne
« semaine » achetée passe en « je l'ai ».

### Crayon ✎ — lieu d'achat (16/07/2026)

Sur chaque ligne, le crayon ouvre « Lieu d'achat » : définir ou changer le
magasin (suggestions des lieux connus). La ligne se reclasse sous son
magasin, et le lieu est **mémorisé sur l'ingrédient** pour les prochaines
entrées en courses — y compris pour les lignes du groupe « Autre » (sans
lieu).

### Formulaire d'ajout

Ajoute un produit à acheter sans fiche de stock (ex. « saumon entier »).
Il disparaît une fois rangé.

## Onglet Recettes

- Une ligne par recette : titre, et la **dernière réalisation** en note —
  « jamais cuisinée », « cuisinée (date non notée) », ou la date. Si la
  recette a été faite il y a **moins d'un an**, la note passe en orange
  (règle « jamais deux fois la même recette dans l'année »).
- **Recherche multicritère** (accents ignorés) : chaque mot tapé est cherché
  dans le titre, les **ingrédients**, le **pays d'origine**, la **source** et
  le texte de la recette — « safran » trouve la bouillabaisse, « inde
  lentilles » trouve les dals. La même recherche sert dans l'onglet Semaine
  pour associer une recette à un événement.
- **Bouton « ▸ Filtres (n) »** à côté de la recherche : les filtres
  particuliers vivent dans un **panneau dépliant** refermable (bouton
  « Refermer — voir les recettes ») ; « (n) » rappelle combien de filtres
  sont actifs même panneau fermé. Dedans :
  - **Filtre par source** : un menu déroulant (« Toutes les sources »,
    « Alain Passard »…), cumulable avec la recherche.
  - **Filtre par catégorie** : un déroulant « Toutes les catégories »
    apparaît dès qu'au moins une recette a une catégorie (« Boissons » pour
    les jus…). La catégorie se règle dans l'éditeur de la fiche (vide =
    plat) et compte dans la recherche multicritère.
  - **★ Wish list** : montre les recettes « à faire un jour » (étoile sur
    la ligne). Sur la fiche, « ☆ Ajouter à la wish list » / « ★ Dans la
    wish list — retirer ». Le beau produit du marché se retrouve en
    cumulant ★ Wish list et « Par ingrédient » (« turbot »).
  - **Filtre par ingrédient** : un champ qui **suggère les ingrédients
    connus au fil de la frappe** et réduit la liste aux recettes qui le
    contiennent. Présent aussi dans la « Recherche avancée » de la Semaine.
  - **Gérer les sources** (voir plus bas).
- **Gérer les sources** : renommer (un nom existant **fusionne** les deux),
  créer une source (livre, site) — la liste reste courte et maîtrisée. Le
  choix de la source et le pays d'origine se règlent dans l'éditeur de la
  fiche.
- **« ▸ Importer une recette (URL, photos) »** (sous la recherche), deux
  chemins vers la même **fiche pré-remplie à relire** — rien n'est
  enregistré avant « **Enregistrer la recette** », la fiche s'ouvre alors
  dans la liste :
  - **Depuis une URL** : coller l'adresse d'une page de recette et
    « Récupérer la recette ». L'application lit la **recette structurée
    publiée par le site** (aucune IA) : titre, source (créée si nouvelle),
    « pour N personnes », catégorie, ingrédients un par ligne, étapes. Une
    adresse **déjà importée** est signalée (« Voir la fiche ») — même chose
    pour un titre déjà présent chez la même source. Si la page annonce une
    **photo du plat**, elle s'affiche à la relecture avec une case
    « **Joindre la photo du plat** » cochée d'avance (la décocher pour ne
    pas la prendre) ; à l'enregistrement elle est rattachée en « Plat ». Si
    la photo ne peut pas être récupérée, la recette est enregistrée quand
    même et un message propose de l'ajouter à la main. Si la page ne
    publie pas de recette structurée (ex. Marmiton), un message
    l'explique — passer par les photos ou la saisie. Nécessite la fonction
    « rapatrier-page » côté serveur (voir exploitation.md).
  - **Depuis des photos (IA locale)** : le bouton « Depuis des photos de la
    recette — IA locale sur ce PC » n'apparaît que si **Ollama** tourne sur
    l'ordinateur avec le modèle prévu (voir exploitation.md). Choisir une
    ou plusieurs photos (page de livre, magazine) : elles sont réduites sur
    place puis lues par le modèle **sans quitter le PC** (~30 s à 1 min par
    page, un peu plus au premier appel). La fiche proposée est à **relire
    obligatoirement** (le modèle peut se tromper sur un titre bilingue, un
    mot doublé…) ; la source se choisit (livre existant suggéré au fil de
    la frappe). À l'enregistrement, **les photos sont attachées à la fiche**
    (« Page », copie privée du foyer). Au premier usage depuis le site en
    ligne, Chrome demande l'autorisation d'accéder au réseau local
    (bulle près de la barre d'adresse) : cliquer « Autoriser », une fois.
- Toucher une ligne déplie la fiche (réorganisée le 16/07/2026, commentaires
  Olivier) : **source avec l'étoile ★ wish list à sa droite**, lien « Voir
  en ligne », vignettes photos, **ingrédients**, **texte de la recette**,
  puis la zone « **Commentaires** » en pleine largeur — une seule, commune
  à toutes les réalisations (décision Q3) —, les dates des réalisations, et
  **tous les boutons en bas** : « J'ai fait cette recette » (consignée au
  jour même, la date a disparu), « Ajouter la photo du plat » (un seul
  bouton — rattachée à la réalisation du jour s'il y en a une), « Photo de
  la recette (page du livre) », « **Récupérer la photo de la page** » (pour
  les fiches importées sans photo du plat ; nécessite la fonction
  rapatrier-page à jour), et « **Modifier** ».
- Les recettes importées d'une page web gardent la **lisibilité du site** :
  étapes séparées et numérotées (16/07/2026).
- « Modifier » : les ingrédients se saisissent
  un par ligne (« 500 g asperges vertes ») — quantité, unité et nom sont
  compris automatiquement ; un « **!** » en tête de ligne marque l'ingrédient
  **difficile à sourcer** (« ! 20 g morilles ») : la fiche l'affiche « à
  commander à l'avance ». Les **fractions** sont comprises (« ½ canard »,
  « 1/2 poulet », « 1 ½ l de lait ») : les calculs utilisent la valeur
  décimale, la fiche réaffiche **comme saisi**. Après une **virgule**, le
  descriptif propre à la recette (« 20 g beurre, fondu » — l'ingrédient
  générique reste « beurre ») ; « **(facultatif)** » en fin de ligne marque
  l'ingrédient facultatif. Le texte de la recette est libre. Le champ
  « **Pour N personnes** » sert au calcul des quantités de la semaine.
- **Photos** : les boutons du bas ouvrent l'appareil photo (ou le sélecteur
  de fichier) ; plusieurs photos possibles — pages du livre et plats des
  réalisations. Les vignettes s'affichent sur la fiche (× pour supprimer,
  avec confirmation). La photo du plat ajoutée le jour d'une réalisation
  lui est rattachée. Les images sont compressées sur l'appareil avant
  l'envoi et stockées dans un espace **privé du foyer** (copie privée —
  jamais public). Limite actuelle : les photos ne sont pas encore
  consultables hors ligne.
- État vide : bouton d'import des **105 recettes vidéo d'Alain Passard**
  (série Le Point, dont 91 avec article et 5 déjà cuisinées).
- Limite actuelle : les recettes ne se synchronisent pas en temps réel entre
  appareils (rechargées à l'ouverture de l'application) ; les vidéos restent
  des fichiers du PC (dossier « Alain Passard »), non lisibles depuis
  l'application.

## Onglet Semaine

- **À venir** d'un côté (ordre chronologique), **Passés** de l'autre (du plus
  récent au plus ancien). Chaque événement a un bouton « **Modifier** »
  (date, type, convives, contraintes — les courses se recalculent) ; les
  passés ont en plus « **Fait** » : la liste de leurs recettes s'affiche et,
  pour chacune, « Oui, faite » consigne la réalisation à la date de
  l'événement (« Non » écarte la question). Les recettes des événements à
  venir n'ont plus de bouton « Marquer faite ».
- Les événements portent : type (dîner maison, repas association,
  invitation, pique-nique — ou libre), nombre de convives, contraintes
  (halal, végétarien, pas épicé…).
- **Recherche avancée** : sous le champ « Chercher une recette à ajouter »,
  un déroulant ajoute des filtres par source, par pays et par ingrédient
  (avec suggestions), cumulables avec les mots tapés.
- À côté de chaque champ de date, la date choisie s'affiche **en toutes
  lettres en français** (« vendredi 7 août ») — le format interne du champ
  dépend de la langue du navigateur.
- Toucher un événement le déplie : recettes associées (avec leur dernière
  réalisation, orange si moins d'un an — utile pour ne pas refaire deux fois
  la même dans l'année), ajout par recherche dans la bibliothèque, retrait,
  et « **Consigner** » qui enregistre la réalisation à la date de
  l'événement avec le contexte (« Repas association (20 pers.) »).
- « **Marquer faite** » sur une recette d'un événement enregistre la
  réalisation à la date de l'événement, avec le contexte en commentaire.
- Suppression d'un événement confirmée en deux touches.
- **Courses de la semaine (déroulant)** : une ligne discrète en haut de
  l'onglet (« ▸ Courses de la semaine · n à acheter ») ; la toucher déplie le
  détail en lecture : chaque ingrédient avec son état — « en stock » (vert,
  avec l'emplacement), « je l'ai », « déjà en liste », ou « à acheter »
  (orange). La liste de courses de l'onglet Courses est tenue à jour
  **automatiquement** (plus de bouton). Le rapprochement se fait par nom
  (accents et casse ignorés) **et par les liens confirmés dans « Ingrédients
  à rapprocher »** (onglet Inventaire).
- **Ajuster une recette pour un événement** : toucher la recette dans
  l'événement déplie ses ingrédients aux quantités de l'événement (recette
  « pour 4 » servie à 8 = doublées ; une même recette sur deux événements
  compte deux fois). Le champ « Ajuster la recette : % » et les quantités
  corrigées ligne à ligne ne valent que **pour cet événement** (0 = retour
  au calcul). Les unités compatibles s'additionnent (500 g + 1 kg = 1,5 kg) ;
  jamais de conversion hasardeuse.
- **À utiliser (déroulant)** : sous les courses de la semaine, un bloc
  rappelle les **lots anciens** des emplacements « à dates » (congélateur,
  cave…) — produit, quantité, date d'entrée (année comprise) et emplacement.
  Un lot y figure passé le seuil de son emplacement (6 mois par défaut,
  réglable dans Inventaire → Gérer).
- À venir : planning des tournées selon vos créneaux.

## Foyer et comptes

- Chacun a son compte personnel (email + mot de passe) ; le foyer partage
  stock et courses.
- Ouvert, le panneau occupe l'écran **seul** : le contenu de l'onglet
  s'efface et revient dès qu'on choisit un onglet (16/07/2026).
- L'icône silhouettes en haut à droite ouvre le **panneau Foyer** : code
  d'invitation à transmettre (l'invité crée son compte puis « Rejoindre ce
  foyer »), **sauvegarde des données** et déconnexion. Principe : les écrans
  quotidiens restent libres des actions exceptionnelles.
- **Sauvegarde** : « Exporter les données (fichier JSON) » télécharge
  l'ensemble des données du foyer (stock, courses, recettes, semaine,
  master list… — hors fichiers photos), à ranger sur OneDrive. Quand la
  dernière sauvegarde de l'appareil date de **plus de 7 jours**, un point
  orange sur l'icône Foyer le rappelle discrètement.
- **Restauration** : « Restaurer une sauvegarde » recharge un fichier
  exporté et **remplace toutes les données du foyer** (décision Olivier
  09/07/2026 : remplacement complet, pas de fusion). Garde-fous : l'état
  actuel est d'abord exporté automatiquement, puis une confirmation
  récapitule la date de la sauvegarde et son contenu. Un fichier étranger,
  tronqué ou d'une autre version est refusé sans rien toucher.

## Application installable (PWA) et hors ligne

- L'application s'installe sur l'écran d'accueil (iPhone : Partager >
  « Sur l'écran d'accueil » ; PC/Android : bouton d'installation du
  navigateur). Icône panier sur fond tomate.
- Hors ligne : l'application s'ouvre et affiche les dernières données
  connues, avec un bandeau « Hors ligne — dernières données connues,
  consultation seule » ; les commandes de modification sont estompées.
  La synchronisation reprend automatiquement au retour du réseau.

## Limites actuelles (v0.1)

- La réserve minimum est fixée à 0 pour tous les ingrédients et n'est pas
  modifiable dans l'interface : le réapprovisionnement se déclenche au dernier
  pot vidé.
- « Ranger les achats » ajoute toujours +1 pot, quel que soit le nombre acheté.
- Hors ligne : consultation seule — cocher ses achats sans réseau viendra
  avec la file d'actions différées.
