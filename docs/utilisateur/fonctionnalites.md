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

## Onglet Stock

### Bouton −

Retire un pot du compteur (il ne descend jamais sous 0). Si le compteur
atteint la réserve minimum : la ligne passe en orange « à racheter »,
l'ingrédient s'ajoute automatiquement à la liste de courses dans le groupe de
son magasin (mention « auto »), la pastille de l'onglet Courses s'incrémente.

### Bouton +

Ajoute un pot. Si l'ingrédient était « à racheter » et repasse au-dessus du
seuil, son entrée automatique disparaît de la liste de courses — sauf si elle
y a été ajoutée volontairement (panier) ou déjà cochée.

### Bouton panier — trois états

- **Neutre** : appuyer ajoute l'ingrédient à la liste de courses même s'il
  reste des pots (mention « réserve »).
- **Plein (tomate)** : déjà en liste ; appuyer le retire (sauf déjà coché).
- **« Manquant » (orange, panier avec +)** : produit épuisé que vous avez
  retiré du panier — il ne reviendra pas tout seul ; appuyer le remet en
  liste. Le retour automatique se réarme quand le stock remonte.

Supprimer un produit lié depuis la liste de courses a le même effet qu'un
retrait par le panier.

### Tri du stock

Deux vues, au choix à droite de la recherche : **Emplacement** (groupes par
lieu, ordre fixe) ou **A→Z** (liste unique alphabétique, le lieu en gris sur
chaque ligne). La recherche par lettres fonctionne dans les deux vues.

### Formulaire d'ajout

Nom, nombre de pots, emplacement, où acheter, puis Ajouter. L'emplacement se
choisit dans une **liste déroulante** des emplacements existants (avec
« Nouvel emplacement… » pour en créer un). Si un emplacement est filtré
(chip active), il préremplit le champ. Le champ nom **suggère les
ingrédients déjà connus** (stock et recettes) pour éviter les orthographes
différentes du même produit.

Au micro : dire par exemple « trois oignons » — le nom et la quantité se
préremplissent, vérifier puis toucher Ajouter. La dictée du clavier
iPhone/iPad fonctionne aussi dans chaque champ.

### Recherche et filtres

- La recherche ignore les accents (« epice » trouve « Épices »).
- Les chips filtrent par emplacement, chacune a sa couleur.
- Tri alphabétique dans chaque emplacement, emplacements dans un ordre fixe.
  Une ligne modifiée ne change jamais de place.

### Bouton poubelle

Supprime la fiche et son éventuelle entrée en liste de courses. Définitif :
pour une erreur de saisie, pas pour un pot vide (pour ça, − suffit).

## Onglet Inventaire

Liste des emplacements avec leur nombre de produits et la **date du dernier
inventaire** (« jamais inventorié » sinon). Le bouton « Inventaire » de
chaque ligne démarre le mode inventaire. **L'inventaire se met en pause tout
seul** : les onglets restent accessibles, changer d'onglet suspend
l'inventaire, revenir sur Inventaire reprend exactement où vous étiez
(il survit aussi à un rechargement de la page).

Pendant l'inventaire, si un nom dicté ou tapé correspond à **plusieurs
produits** (« carvi » → carvi, carvi noir, carvi noir entier), un menu
propose de choisir — ou de créer un nouveau produit. Jamais de pari.

### Master list des ingrédients

Une ligne dépliante « Master list des ingrédients » montre **tous** les
ingrédients connus (stock + recettes), rangés par **catégorie** (Épices,
Légumes, Viandes… — libres, avec suggestions), les **non classés en tête**.
Taper une catégorie sur une ligne la range ; un filtre aide à naviguer.
La catégorie vit sur l'ingrédient canonique : ses alias la partagent.

### Ingrédients à rapprocher (master list)

Quand deux noms se ressemblent (« carottes » / « carotte », singulier,
pluriel, majuscules) entre le stock et les recettes, une question apparaît en
haut de l'onglet : « même ingrédient ? ». **Oui** relie les deux orthographes
pour toujours : le stock, les recettes et la liste de courses les considèrent
comme un seul ingrédient. **Non** est aussi mémorisé : la question ne revient
jamais. Rien n'est jamais fusionné sans votre accord.

### Gérer un emplacement (bouton « Gérer »)

Un panneau se déplie sous l'emplacement :
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

### Bouton « Ranger les achats »

Pour chaque ligne cochée liée à un ingrédient du stock : +1 pot au stock,
puis la ligne disparaît. Une ligne « semaine » achetée passe en « je l'ai ».

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
- **Filtre par source** : un **menu déroulant** (« Toutes les sources »,
  « Alain Passard »…), cumulable avec la recherche.
- **Filtre par ingrédient** : un champ dédié qui **suggère les ingrédients
  connus au fil de la frappe** et réduit la liste aux recettes qui le
  contiennent. Présent aussi dans la « Recherche avancée » de la Semaine.
- **Gérer les sources** : renommer (un nom existant **fusionne** les deux),
  créer une source (livre, site) — la liste reste courte et maîtrisée. Le
  choix de la source et le pays d'origine se règlent dans l'éditeur de la
  fiche.
- Toucher une ligne déplie la fiche : source, lien « Voir en ligne » (avec le
  nom du site), nom de la vidéo locale, **ingrédients**, **texte de la
  recette**, historique des réalisations, et « **J'ai fait cette recette** »
  (date du jour proposée, commentaire facultatif).
- « Ajouter/Modifier ingrédients et recette » : les ingrédients se saisissent
  un par ligne (« 500 g asperges vertes ») — quantité, unité et nom sont
  compris automatiquement ; le texte de la recette est libre. Le champ
  « **Pour N personnes** » sert au calcul des quantités de la semaine.
  (La photo viendra dans un prochain incrément.)
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
- À venir : planning des tournées selon vos créneaux.

## Foyer et comptes

- Chacun a son compte personnel (email + mot de passe) ; le foyer partage
  stock et courses.
- L'icône silhouettes en haut à droite ouvre le **panneau Foyer** : code
  d'invitation à transmettre (l'invité crée son compte puis « Rejoindre ce
  foyer ») et déconnexion. Principe : les écrans quotidiens restent libres
  des actions exceptionnelles.

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
