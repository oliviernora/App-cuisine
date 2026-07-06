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

Nom, nombre de pots, emplacement, où acheter, puis Ajouter. Si un emplacement
est filtré (chip active), il préremplit le champ emplacement.

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
chaque ligne démarre le mode inventaire. Pendant l'inventaire, les onglets
s'effacent.
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

### Case à cocher

Cocher = acheté (la ligne se barre). La pastille de l'onglet compte ce qui
reste à acheter. Décocher est possible tant que les achats ne sont pas rangés.

### Bouton « Ranger les achats »

Apparaît dès qu'une ligne est cochée. Pour chaque ligne cochée liée à un
ingrédient du stock : +1 pot au stock, puis la ligne disparaît.

### Formulaire d'ajout

Ajoute un produit à acheter sans fiche de stock (ex. « saumon entier » pour
une recette). Il disparaît une fois rangé.

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
