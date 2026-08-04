# Garde-manger — catalogue des fonctionnalités

Ce document décrit ce que fait chaque commande de l'application, écran par
écran. Ce n'est PAS le document des cas d'utilisation (processus client de
bout en bout) : voir `cas-utilisation.md`.

## Les concepts

- Un **ingrédient** est une fiche : nom, **nombre de pots** (la somme de tous
  ses emplacements), réserve minimum, genre et où l'acheter. Un même
  ingrédient peut vivre dans plusieurs emplacements (Cuisine, Réserve
  entrée…).
- Le « pot » est l'unité de comptage : un bocal d'épice, un sachet, une boîte.
  Le pot entamé compte pour 1.
- **Règle centrale** (16/07/2026) : quand la **somme de tous les
  emplacements** passe **sous la réserve minimum** de l'ingrédient (1 par
  défaut), il est considéré « à racheter » et entre automatiquement dans la
  liste de courses — jamais emplacement par emplacement.
- Tout est partagé en temps réel entre les appareils du foyer : un pot décompté
  sur l'iPhone apparaît aussitôt sur l'iPad et le PC.
- **Sur petit écran (iPhone)**, les onglets du haut collapsent en **menu
  déroulant** : le bouton montre la section courante, l'ouvrir liste Stock,
  Courses (avec la pastille), Recettes, Semaine, Inventaire et « Foyer et
  compte ». « Foyer et compte » est un **écran comme les autres** : choisi,
  le bouton du menu l'affiche comme écran courant (25/07/2026). Rien ne
  dépasse jamais de l'écran à droite ou à gauche, et **jamais deux zones de
  texte sur la même ligne** sur iPhone.
- **Sous-écrans** (25/07/2026) : toute édition ou sous-menu (fiche recette,
  Modifier un ingrédient, Gérer un emplacement, master list, import,
  sources, résidences…) occupe l'écran **seul** — recherche, listes et
  barres d'ajout disparaissent ; une **croix ×** ferme et revient où on
  était. Une seule saisie ouverte à la fois.

## Écran d'accueil (28/07/2026, commentaires 3)

L'application s'ouvre sur l'**accueil** : les **cinq familles de cas
d'utilisation** en tuiles — Gérer les ingrédients, Faire les courses,
Préparer la semaine, Gérer les recettes, Gérer les inventaires — chacune
avec ses **étapes en raccourcis** (« Ranger les courses » et « Lieux
d'achat » ouvrent directement le bon écran). L'accueil **s'ajoute** à la
navigation par onglets (premier onglet, icône maison) : il ne la remplace
pas (décision Olivier 27/07/2026).

## Onglet Stock

Refondu le 16/07/2026 (commentaires Olivier) : le stock se lit **par
ingrédient**, une seule liste alphabétique. Chaque ligne montre la **somme
de tous les emplacements**.

**Lignes compactes** (27/07/2026, remarques Olivier iPhone) : la ligne ne
montre que **le nom, le nombre et l'emplacement** (le nom d'un emplacement
unique, ou « n emplacements »). **Toucher le nom** affiche le nom complet
(l'emplacement s'efface pour laisser la place) et déplie une **seconde
ligne** avec l'emplacement et tous les boutons : « ▸ emplacement(s) »
(détail), panier, − / + (si un seul endroit garni), crayon ✎. Toucher à
nouveau referme.

Le détail « ▸ » déplie chaque endroit avec sa quantité, ses boutons + / −
et un bouton « **Déplacer** » (27/07/2026) : choisir la destination —
existante ou nouvelle — déplace la ligne ; si le produit existe déjà
là-bas, les pots se regroupent.

La seconde ligne porte aussi le bouton « **Épuisé** » (28/07/2026, N14) :
en un geste, toutes les lignes de l'ingrédient passent à zéro (lots datés
vidés aussi) — le rachat automatique suit.

### Boutons + / −

Sur la seconde ligne quand l'ingrédient ne vit que dans un endroit ; dans
le détail déplié sinon. Le compteur de la ligne reste la somme, jamais
sous 0.

### Rachat automatique — réserve minimum

Chaque ingrédient a une **réserve minimum, propre à chaque maison**
(04/08/2026, décision Olivier — trois pots d'avance à Argenteuil, un seul à
Montalivet ; 1 par défaut, réglable dans sa fiche ; 0 = jamais racheté tout
seul ; l'ancien réglage unique sert de valeur commune tant qu'une maison
n'a pas le sien). Quand la **somme des emplacements de la maison passe en
dessous**, la ligne passe en orange « à racheter » et l'ingrédient s'ajoute
à la liste de courses (mention « auto », pastille de l'onglet Courses).
Quand la somme remonte au niveau de la réserve, l'entrée automatique
disparaît — sauf ajoutée volontairement (panier) ou déjà cochée.

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

### LA fiche ingrédient (crayon ✎ — une seule fiche partout, 04/08/2026)

Le crayon ✎ d'une ligne du Stock, comme le nom d'un ingrédient de la
Master list, ouvre désormais **la même fiche** (décision Olivier
04/08/2026 — elle remplace les trois panneaux d'avant : ✎ du Stock, fiche
de la Master list, et le sourcing par ingrédient). Elle occupe l'écran
seul (croix pour revenir) et montre TOUT :
- **Renommer** — une icône ✎ sur le nom ; un nom déjà connu **fusionne**
  les deux (confirmation en deux touches) ; stock, courses et recettes
  suivent ;
- **Genre** (master list) ;
- **Stock** de la maison courante, emplacement par emplacement ;
- **Réserve minimum par maison** (voir ci-dessus) — une ligne par
  résidence ;
- **Où l'acheter** : la liste de ses **lieux d'achat** — plusieurs
  possibles, boutiques et sites (× pour retirer, « Ajouter un lieu… »
  parmi les Lieux d'achat gérés). Sans lieu propre, l'héritage du genre
  est rappelé (« hérité du genre : marché ») ;
- **Autres orthographes reconnues** (alias confirmés des dictées), avec
  × pour ne plus en reconnaître une ;
- **Recettes** qui l'utilisent ;
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

**Barre minimale** (25/07/2026) : une seule ligne — nom de l'ingrédient,
bouton « ⋯ », micro, Ajouter (1 pot par défaut, sans emplacement). Le
bouton « ⋯ » déplie les **détails** : nombre de pots, emplacement, où
acheter — chacun sur sa ligne. L'emplacement se choisit dans une **liste
déroulante des emplacements de la résidence courante** (plus aucune liste
par défaut — 25/07/2026), avec « Nouvel emplacement… » pour en créer un.
**L'emplacement choisi est retenu d'un ajout à l'autre** (27/07/2026 —
pratique pour ranger une série au même endroit) et rappelé en gris à côté
du bouton « ⋯ ». Le champ nom **suggère les ingrédients déjà connus**
(stock et recettes) pour éviter les orthographes différentes du même
produit.

Au micro : dire par exemple « trois oignons » — le nom et la quantité se
préremplissent, vérifier puis toucher Ajouter. La dictée du clavier
iPhone/iPad fonctionne aussi dans chaque champ.

**Dictée plus sûre** (27/07/2026, remarques Olivier) :
- « **4 épices** » n'est plus compris comme 4 × « épices » : si le texte
  entier correspond à un ingrédient connu (stock, recettes ou master list,
  traits d'union et chiffres confondus), il est gardé tel quel — un vrai
  nombre devant un autre nom (« 2 cumin ») marche comme avant.
- Les noms **écorchés par la transcription** (« nuoc mame », « ras el
  anout ») sont rapprochés de la master list : la bonne orthographe est
  proposée dans le champ (message « Entendu … → … »). En validant par
  Ajouter, la transcription entendue est **mémorisée comme alias** : les
  fois suivantes, elle est reconnue directement.

### Recherche et filtres

- La recherche ignore les accents (« epice » trouve « Épices »).
- Un déroulant « **Tous genres** » (dès qu'un genre existe) restreint la
  liste au **genre d'ingrédient** choisi (Épices, Légumes… — les genres de
  la master list).
- Il n'y a plus ni vue par emplacement ni chips d'emplacement : la recherche
  se fait par ingrédient (décision Olivier 16/07/2026).

## Onglet Inventaire

*(La réception des achats — « à mettre en stock », décision Q2 du
16/07/2026 — vit désormais dans l'écran « **Ranger les courses** » de
l'onglet Courses : voir cette section. Décision du 28/07/2026, cas N13.)*

### Ingrédients d'un emplacement (28/07/2026, cas N14)

**Toucher un emplacement** de la liste ouvre « Ingrédients — {nom} » : la
**même liste que l'onglet Stock**, filtrée sur cet endroit, avec les mêmes
gestes (recherche, lignes compactes, ±, panier, Épuisé, ✎ Modifier,
déplacement) — et la barre d'ajout **préréglée sur l'emplacement**. C'est
la seconde porte d'entrée de la liste unique des ingrédients.

Liste des emplacements avec leur nombre de produits et la **date du dernier
inventaire** (« jamais inventorié » sinon). Le bouton « Inventaire » de
chaque ligne démarre le mode inventaire. **L'inventaire se met en pause tout
seul** : les onglets restent accessibles, changer d'onglet suspend
l'inventaire, revenir sur Inventaire reprend exactement où vous étiez
(il survit aussi à un rechargement de la page).

**Mettre en pause / reprendre — plusieurs de front** (27/07/2026, élargi le
04/08/2026) : un bouton « **Mettre en pause** » dans l'inventaire rend la
main sur la liste des emplacements. **Plusieurs inventaires peuvent être en
pause en même temps** (pratique pour déplacer des objets de boîte en
boîte) : un bandeau « Reprendre l'inventaire de … » **par inventaire en
pause**, et le bouton « **Reprendre** » sur chaque emplacement concerné.
Un emplacement n'a jamais qu'**un seul** inventaire ; démarrer un
inventaire ailleurs met simplement l'inventaire ouvert en pause — rien
n'est perdu. Les inventaires suivent leur boîte même si elle est
**renommée** entre-temps (permutation de noms comprise) ; si deux boîtes
inventoriées **fusionnent**, leurs comptages fusionnent aussi.

**Rouvrir un inventaire** (04/08/2026) : « Inventaire » sur un emplacement
**déjà inventorié** propose « **Rouvrir (compléter)** » — les produits en
stock restent « vus » avec leur quantité, on ajoute simplement (l'objet
sorti d'une autre boîte) — ou « **Repartir de zéro** » (tout recompter).

Pendant l'inventaire, si un nom dicté ou tapé correspond à **plusieurs
produits** (« carvi » → carvi, carvi noir, carvi noir entier), un menu
propose de choisir — ou de créer un nouveau produit. Jamais de pari.
Depuis le 16/07/2026, les **orthographes proches sont retrouvées aussi** :
« clou de girofle » retrouve « Clous de girofle » (singulier/pluriel).
Un alias déjà confirmé est déclaré directement ; un simple rapprochement
passe toujours par le menu de choix. Depuis le 27/07/2026, le menu propose
aussi les ingrédients proches de la **master list entière** (mention
« connu ailleurs — sera créé ici ») — pour les noms difficiles (« nuoc
mam », « ras el hanout ») transcrits de travers ; une correction choisie
après une dictée est **mémorisée comme alias** et reconnue directement les
fois suivantes. Le garde-fou « 4 épices » de l'onglet Stock s'applique
aussi : un ingrédient connu n'est jamais découpé en quantité + nom.
Depuis le 04/08/2026, un nom tapé ou dicté **exactement égal** à un
ingrédient connu du foyer (même rangé dans une **autre maison**, ou connu
seulement des recettes) est **déclaré directement** — « Vu : … (nouveau
ici) » — sans passer par le menu.

**Rectifier le nom d'un produit créé** (04/08/2026, décision Olivier) : la
dictée a écorché le nom ? Le **crayon ✎** sur une ligne « nouveau »
permet de corriger sans quitter l'inventaire. La correction ne touche QUE
la saisie — jamais la fiche d'un produit existant : si le nom corrigé
désigne un produit de l'emplacement, le comptage le rejoint ; s'il est
connu du foyer, sa graphie officielle est reprise ; deux saisies
rectifiées vers le même nom fusionnent.

**Corriger une saisie « vue »** (16/07/2026) : toucher le nom d'une ligne
déjà vue ouvre un panneau « ce n'était pas le bon produit ? » — choisir la
bonne variante (le comptage se transfère) ou « remettre à vérifier ».
**Toucher le nombre** d'une ligne vue (27/07/2026) ouvre la **saisie
directe de la quantité** (Entrée ou sortie du champ valide ; 0 remet la
ligne « à vérifier ») — plus besoin d'appuyer dix fois sur « + ».

**Micro** (16/07/2026) : un deuxième appui sur le micro arrête toujours la
dictée, y compris sur iPhone — et ce qui a été entendu jusqu'à la coupure
est traité (message « Rien entendu » sinon).

### Master list des ingrédients

La ligne « Master list des ingrédients » ouvre un **sous-écran dédié**
(25/07/2026, croix pour revenir) montrant **tous** les ingrédients connus
(stock + recettes), rangés par **genre** (Épices, Légumes, Viandes…), les
**non classés en tête**.
- Le genre de chaque ligne se choisit dans un **menu déroulant** ; il vit
  sur l'ingrédient canonique (ses alias le partagent).
- « **Gérer les genres** » remplace la liste le temps du réglage : créer,
  **renommer au crayon ✎** (un nom existant fusionne et reclasse les
  ingrédients), supprimer (les ingrédients redeviennent non classés), et
  régler le **sourcing par défaut** du genre — type (marché / internet /
  boutique) et commentaire (nom du marché, site…).
- **Toucher le nom d'un ingrédient** ouvre **LA fiche ingrédient** — la
  même que le crayon ✎ du Stock (04/08/2026, voir « LA fiche
  ingrédient » de l'onglet Stock) : nom-fusion, genre, stock, réserve
  minimum par maison, lieux d'achat, alias, recettes, suppression. Le
  sourcing propre par ingrédient d'avant est remplacé par les **lieux
  d'achat** de la fiche (l'héritage du genre reste le repli).
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

### Ajouter et gérer les emplacements (25/07/2026)

Les emplacements appartiennent à la **résidence courante**. Une zone
« **Nouvel emplacement** » en bas de la liste en crée un (vide). Le bouton
« Gérer » ouvre le **sous-écran** de l'emplacement (croix pour revenir) :
- **Renommer au crayon ✎** sur le nom ; un nom déjà existant **fusionne**
  les deux emplacements (confirmation en deux touches) — les produits se
  réunissent, les doublons regroupent leurs pots, la date d'inventaire de la
  destination est conservée.
- **Emplacement « à dates »** : une case à cocher active le suivi par lots
  datés (congélateur, cave…) — voir « Emplacements à dates » de l'onglet
  Stock. La mention « à dates » apparaît sur la ligne de l'emplacement.
  En dessous, le **seuil de rappel** (« n mois avant rappel “à utiliser”
  dans la Semaine », 6 par défaut) se règle par emplacement.
- **Déplacer des produits** : cocher les produits, choisir la destination
  (existante ou nouvelle), « Déplacer (n) ». Un produit déplacé garde
  quantité, magasin et état « à racheter » ; s'il existe déjà à destination,
  les pots se regroupent en une seule ligne.
- **Supprimer l'emplacement** : possible seulement **vide** (sinon déplacer
  ou fusionner d'abord), confirmation en deux touches.
- Déclarer un produit trouvé : au micro (« trois cumin moulu »), ou taper
  quelques lettres et toucher la ligne. Chaque déclaration ajoute des pots ;
  un produit inconnu est créé (mention « nouveau »).
- Corriger : compteur − / + sur chaque ligne vue, ou **toucher le nombre**
  pour saisir la quantité directement (27/07/2026) ; redescendre à zéro
  remet le produit « à vérifier ».
- « Terminer l'inventaire » affiche le bilan des non-trouvés ; confirmer les
  passe à zéro pot (et en courses automatiques). **Rien n'est écrit au stock
  avant cette confirmation.**
- « Abandonner » (confirmation en deux touches) ne laisse aucune trace ;
  fermer ou recharger la page conserve l'inventaire en cours (même appareil).

## Onglet Courses

La liste fait la **somme de trois origines** : le réapprovisionnement du
stock (« auto », « réserve »), les **ingrédients des repas à venir**
(« semaine »), et les achats libres ajoutés à la main.

**Façon liste de tâches** (28/07/2026, commentaires 3 — comme Microsoft
To Do) : les produits **à acheter restent en haut**, groupés par magasin ;
ce que je coche **descend en bas** dans « **Achetés — à ranger** » ;
décocher un produit le fait remonter. Les achetés attendent là leur
rangement (bouton « **Ranger les courses (n)** », voir plus bas).

**Lignes compactes** (27/07/2026, comme au Stock) : chaque ligne ne montre
que la **case, le nom et le statut** (« auto », « réserve », « semaine »,
« je l'ai »). **Toucher le nom** affiche le nom complet et déplie la ligne
des boutons : bascule « Je l'ai déjà » / « À acheter » (lignes semaine),
crayon ✎ du lieu d'achat, poubelle (lignes réappro et achats libres).

### Lignes « semaine » (automatiques)

Calculées en direct depuis les événements à venir : dès qu'une recette est
ajoutée, retirée ou ajustée, la liste se met à jour — quantités comprises.
Elles n'ont pas de poubelle (elles disparaissent d'elles-mêmes quand le
besoin disparaît) ; la bascule « je l'ai déjà » (ligne barrée, pas à
acheter) ↔ « à acheter » est un bouton de la ligne dépliée (27/07/2026 —
avant, c'était le toucher du nom, qui déplie désormais). Un ingrédient
déjà couvert par le réapprovisionnement n'est pas doublonné.

### Case à cocher

Cocher = acheté (la ligne se barre). La pastille de l'onglet compte ce qui
reste à acheter (les « je l'ai » ne comptent pas). Décocher est possible
tant que les achats ne sont pas rangés.

### Écran « Ranger les courses » (28/07/2026, cas N13 — remplace « À mettre en stock » de la décision Q2)

De retour des courses, le bouton « **Ranger les courses (n)** » ouvre
l'écran de rangement, sacs devant soi :
- pour chaque produit sorti d'un sac, **quelques lettres ou le micro**
  suffisent ; les **candidats de la liste** s'affichent (« huile » propose
  « huile d'olive » et « huile de tournesol » si les deux y sont) ;
- un produit **hors liste** (acheté en plus) entre au stock quand même
  (« Nouveau produit ») ;
- pour chaque produit : la **quantité réelle** (trois achetés = trois) et
  l'**emplacement** — proposé d'après le **dernier emplacement connu** de
  l'ingrédient ; un emplacement « à dates » crée un **lot daté** du jour ;
- une ligne « **semaine** » (ingrédient de recette) est simplement marquée
  « je l'ai » — rien n'entre au stock, le besoin est couvert.
L'écran est aussi accessible par le raccourci « Ranger les courses » de
l'écran d'accueil.

### Lieux d'achat (28/07/2026, N3 point 4)

Le bouton « **Lieux d'achat** » (bas de l'onglet) ouvre leur gestion :
- **ajouter** un lieu, **physique** (adresse facultative) ou **Internet**
  (URL, avec lien « Ouvrir le site »), plus un **commentaire** libre
  (horaires, jour de marché…) ;
- depuis le 04/08/2026 (décision Olivier), chaque **boutique physique
  appartient à une maison** (menu « Maison » sur sa fiche ; « Toutes (à
  ranger) » tant qu'elle n'est pas rangée — elle reste alors visible
  partout). Les lieux **Internet valent pour toutes les maisons** ;
- **renommer au crayon ✎** — le nouveau nom suit partout : lignes de
  courses, magasins mémorisés des ingrédients, sourcing ;
- **supprimer** (deux touches) — les lignes qui portaient ce lieu
  repartent dans « Autre » ;
- « **Ingrédients achetables ici (n)** » : la liste des ingrédients dont le
  magasin mémorisé ou le sourcing pointe vers ce lieu ;
- au premier passage, « **Reprendre ces lieux** » crée d'un geste les lieux
  déjà utilisés en texte libre dans vos courses et votre sourcing.

### Crayon ✎ — lieu d'achat (16/07/2026, complété 04/08/2026)

Sur chaque ligne, le crayon ouvre « Lieu d'achat » : les **lieux de la
fiche de l'ingrédient** sont proposés d'abord en boutons (un toucher
suffit — décision Q1 du 04/08/2026), puis la saisie libre (suggestions
des lieux connus). La ligne se reclasse sous son magasin, et le lieu est
**mémorisé sur l'ingrédient** pour les prochaines entrées en courses — y
compris pour les lignes du groupe « Autre » (sans lieu). Une nouvelle
ligne se classe toute seule : le magasin mémorisé, sinon la **boutique de
la maison où je suis** parmi les lieux de la fiche, sinon son premier
**site**, sinon l'héritage du genre.

### Formulaire d'ajout

Ajoute un produit à acheter sans fiche de stock (ex. « saumon entier »).
Barre minimale (25/07/2026) : le produit seul — le lieu d'achat se règle
ensuite au crayon ✎ (mémorisé par ingrédient). Il disparaît une fois rangé.

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
- **« Bibliothèque (livres et sites) »** (04/08/2026 — cas N16, remplace
  l'ancien « Gérer les sources » du panneau Filtres ; raccourci direct sur
  la tuile d'accueil « Gérer les recettes ») : l'**écran dédié** des
  sources, pensé pour les 240 livres.
  - Les **livres** en **grille de couvertures** (titre et auteur sous
    chaque vignette), les **sites** et autres sources en liste (avec leur
    domaine et leur nombre de recettes). **Recherche** (titre, auteur) et
    **tri** (titre, auteur, nombre de recettes).
  - **Ouvrir une source** montre sa fiche : détails (auteur, éditeur,
    année, ISBN…), renommage au crayon ✎ (un nom existant **fusionne**),
    et **ses recettes** — chacune s'ouvre d'un toucher, la fermer ramène
    à la fiche.
  - Depuis un **livre** : « **Scanner une recette (photos, texte)** »
    ouvre l'import pré-réglé sur ce livre.
  - Depuis un **site** : « **Visiter le site** » (dans le navigateur),
    puis au retour « **Coller l'URL d'une recette** » — l'import s'ouvre
    au nom du site et la recette lui est rattachée. L'adresse du site se
    renseigne sur la fiche (sans adresse, la visite passe par l'une de
    ses recettes en ligne).
  - « **Ajouter à la main** » : un livre (sans code-barres) ou un site
    avec son adresse. « **Scanner un livre (code-barres)** » et la file
    « **Livres à compléter** » vivent aussi ici.
- **« Scanner un livre (code-barres) »** (dans la Bibliothèque,
  02/08/2026 — cas N15) : la caméra lit l'**ISBN** au dos du livre (saisie
  manuelle en secours), le web fournit la fiche — titre, auteur, éditeur,
  année et **couverture**, copiée dans le stockage privé du foyer — à
  **relire avant d'enregistrer**. Trois catalogues sont interrogés tour à
  tour : Google Books, Open Library, puis la **BnF** (03/08/2026 —
  précieuse pour l'édition française ; elle ne fournit pas de couverture).
  Un livre introuvable sur le web se **met de côté en un geste**
  (« Claude complétera ») ou se complète à la main (jamais bloquant) ; un
  titre déjà présent est
  **complété** au lieu d'être dupliqué ; un ISBN déjà connu est signalé.
  **Multi-scan** pour une pile de livres : chaque livre reconnu rejoint la
  liste en bas de l'écran pendant qu'on scanne le suivant (✎ corrige,
  × retire), un bouton enregistre tout d'un coup — les introuvables non
  corrigés sont alors **mis de côté automatiquement**.
- **« Livres à compléter »** (dans la Bibliothèque, 03/08/2026 — NP15
  révisé) : la file des ISBN mis de côté. On demande à **Claude** de
  « compléter la bibliothèque » : il cherche chaque ISBN sur le web
  (libraires, éditeurs), remplit la fiche et rapatrie la couverture dans
  le stockage privé du foyer (outils MCP `livres_a_completer` et
  `completer_source`). Pour un livre absent même du web, un bouton 📷
  joint une photo de couverture ; × retire de la file.
- **« Importer une recette (URL, photos, texte) »** (sous la recherche)
  ouvre un **sous-écran** (25/07/2026), trois chemins vers la même **fiche
  pré-remplie à relire** — rien n'est enregistré avant « **Enregistrer la
  recette** », la fiche s'ouvre alors en écran dédié :
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
- Toucher une ligne ouvre la fiche en **écran dédié** (25/07/2026 : la
  liste, la recherche et l'import disparaissent, la croix × ramène à la
  liste — jamais de fiche mélangée à la liste) : **source avec l'étoile ★
  wish list à sa droite**, lien « Voir
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
  Pendant l'édition, l'éditeur **remplace la fiche** (une seule saisie à la
  fois — 25/07/2026).
- **Photos** : les boutons du bas ouvrent l'appareil photo (ou le sélecteur
  de fichier) ; plusieurs photos possibles — pages du livre et plats des
  réalisations. Les vignettes s'affichent sur la fiche (× pour supprimer :
  le bouton devient « Supprimer ? », une 2e touche confirme — jamais de
  fenêtre bloquante, 03/08/2026). La photo du plat ajoutée le jour d'une réalisation
  lui est rattachée. Les images sont compressées sur l'appareil avant
  l'envoi et stockées dans un espace **privé du foyer** (copie privée —
  jamais public). Limite actuelle : les photos ne sont pas encore
  consultables hors ligne.
- (Le bouton d'amorçage « 105 recettes d'Alain Passard » de l'état vide a
  été retiré le 27/07/2026 — mission accomplie, les recettes et leurs
  fiches sont en base depuis le 07/07 ; le code vit dans `archive/`.)
- Limite actuelle : les recettes ne se synchronisent pas en temps réel entre
  appareils (rechargées à l'ouverture de l'application) ; les vidéos restent
  des fichiers du PC (dossier « Alain Passard »), non lisibles depuis
  l'application.

## Onglet Semaine

- **À venir** d'un côté (ordre chronologique), **Passés** de l'autre (du plus
  récent au plus ancien). Chaque événement a un bouton « **Modifier** » qui
  ouvre un **sous-écran** (25/07/2026 — date, type, convives, contraintes,
  chacun sur sa ligne ; les courses se recalculent) ; les
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
  l'événement ouvre un **sous-écran** (25/07/2026) avec ses ingrédients aux
  quantités de l'événement (recette
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
- « Foyer et compte » est un **écran comme les autres** (25/07/2026) : on y
  entre par le menu déroulant (iPhone) ou l'icône silhouettes (PC), et le
  menu l'affiche comme écran courant. En direct : le **sélecteur de
  résidence**, le bouton « **Gérer les résidences** », le **code
  d'invitation** (l'invité crée son compte puis « Rejoindre ce foyer »),
  les **sauvegardes** et la **déconnexion**. Principe : les écrans
  quotidiens restent libres des actions exceptionnelles.
- **Résidences** (lot 5 du 16/07/2026, revu le 25/07/2026) : le menu
  déroulant choisit la **résidence courante de cet appareil** — ses stocks,
  courses, inventaires et sa semaine. Le titre de l'app l'affiche
  (« Notre foyer · Argenteuil »). Les recettes, sources, réalisations,
  wish list et master list restent communes au foyer. Un inventaire mis en
  pause reste attaché à sa résidence (une note l'indique si on regarde
  depuis une autre maison).
- « **Gérer les résidences** » ouvre un **sous-écran** : une ligne par
  résidence, **renommage au crayon ✎** directement sur le nom, **corbeille**
  pour supprimer (confirmation avec alerte : tous les stocks, emplacements,
  courses, lots et événements de la résidence sont perdus, pour tout le
  foyer ; la **dernière résidence ne se supprime pas** ; supprimer la
  courante bascule sur une autre), et zone d'ajout en bas.
- **Sauvegarde** : « Exporter les données (fichier JSON) » télécharge
  l'ensemble des données du foyer (stock, courses, recettes, semaine,
  master list… — hors fichiers photos), à ranger sur OneDrive. Quand la
  dernière sauvegarde de l'appareil date de **plus de 7 jours**, un point
  orange sur l'icône Foyer le rappelle discrètement.
- **Restauration** : « Restaurer une sauvegarde » recharge un fichier
  exporté et **remplace toutes les données du foyer** (décision Olivier
  09/07/2026 : remplacement complet, pas de fusion). Garde-fous : la
  confirmation récapitule la date de la sauvegarde et son contenu dans
  l'écran même (« Confirmer la restauration » / « Annuler », jamais de
  fenêtre bloquante — 03/08/2026), et l'état actuel est exporté
  automatiquement avant de remplacer. Un fichier étranger, tronqué ou
  d'une autre version est refusé sans rien toucher.

## Application installable (PWA) et hors ligne

- L'application s'installe sur l'écran d'accueil (iPhone : Partager >
  « Sur l'écran d'accueil » ; PC/Android : bouton d'installation du
  navigateur). Icône panier sur fond tomate.
- Hors ligne : l'application s'ouvre et affiche les dernières données
  connues, avec un bandeau « Hors ligne — dernières données connues,
  consultation seule » ; les commandes de modification sont estompées.
  La synchronisation reprend automatiquement au retour du réseau.

## Limites actuelles

- Hors ligne : consultation seule — cocher ses achats sans réseau viendra
  avec la file d'actions différées.
- Les photos ne sont pas encore consultables hors ligne.
- Les recettes ne se synchronisent pas en temps réel entre appareils
  (rechargées à l'ouverture de l'application).
